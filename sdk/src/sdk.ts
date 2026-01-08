import { DynamoDBClient, GetItemCommand, PutItemCommand, DeleteItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export interface PluginSDKConfig {
  pluginId: string;
  tableName: string;
  assetBucket: string;
  region: string;
  pluginConfig: Record<string, any>;
}

export class PluginSDK {
  private dynamodb: DynamoDBClient;
  private s3: S3Client;
  private ssm: SSMClient;
  private pluginId: string;
  private tableName: string;
  private assetBucket: string;
  private region: string;
  readonly config: Record<string, any>;
  private requestCount: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(config: PluginSDKConfig) {
    this.pluginId = config.pluginId;
    this.tableName = config.tableName;
    this.assetBucket = config.assetBucket;
    this.region = config.region;
    this.config = config.pluginConfig;
    this.dynamodb = new DynamoDBClient({ region: config.region });
    this.s3 = new S3Client({ region: config.region });
    this.ssm = new SSMClient({ region: config.region });
  }

  async getData(key: string): Promise<any | null> {
    const id = `${this.pluginId}#${key}`;
    
    const result = await this.dynamodb.send(new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({
        entityType: 'plugin-data',
        id,
        metadataType: 'current'
      })
    }));

    if (!result.Item) return null;
    const item = unmarshall(result.Item);
    return item.data;
  }

  async putData(key: string, data: any): Promise<void> {
    const id = `${this.pluginId}#${key}`;
    const now = new Date().toISOString();

    await this.dynamodb.send(new PutItemCommand({
      TableName: this.tableName,
      Item: marshall({
        entityType: 'plugin-data',
        id,
        metadataType: 'current',
        data,
        createdAt: now,
        updatedAt: now
      })
    }));
  }

  async deleteData(key: string): Promise<void> {
    const id = `${this.pluginId}#${key}`;

    await this.dynamodb.send(new DeleteItemCommand({
      TableName: this.tableName,
      Key: marshall({
        entityType: 'plugin-data',
        id,
        metadataType: 'current'
      })
    }));
  }

  async listData(prefix?: string): Promise<string[]> {
    const searchPrefix = prefix 
      ? `${this.pluginId}#${prefix}`
      : `${this.pluginId}#`;

    const result = await this.dynamodb.send(new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'entityType = :type AND begins_with(id, :prefix)',
      ExpressionAttributeValues: marshall({
        ':type': 'plugin-data',
        ':prefix': searchPrefix
      })
    }));

    if (!result.Items) return [];
    
    return result.Items.map(item => {
      const unmarshalled = unmarshall(item);
      return unmarshalled.id.replace(`${this.pluginId}#`, '');
    });
  }

  async getAssetUrl(assetId: string): Promise<string> {
    throw new Error('Asset access not yet implemented');
  }

  async getPage(pageId: string): Promise<any | null> {
    const result = await this.dynamodb.send(new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({
        entityType: 'page',
        id: pageId,
        metadataType: 'current'
      })
    }));

    return result.Item ? unmarshall(result.Item) : null;
  }

  async getNews(newsId: string): Promise<any | null> {
    const result = await this.dynamodb.send(new GetItemCommand({
      TableName: this.tableName,
      Key: marshall({
        entityType: 'news',
        id: newsId,
        metadataType: 'current'
      })
    }));

    return result.Item ? unmarshall(result.Item) : null;
  }

  log(level: 'info' | 'warn' | 'error', message: string, meta?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      pluginId: this.pluginId,
      level,
      message,
      ...(meta && { meta })
    };

    console[level === 'error' ? 'error' : 'log'](
      `[Plugin:${this.pluginId}]`,
      JSON.stringify(logEntry)
    );
  }

  async getSecret(key: string): Promise<string | null> {
    try {
      const parameterName = `/micropress/plugins/${this.pluginId}/${key}`;

      this.log('info', `Fetching secret: ${key}`);

      const result = await this.ssm.send(new GetParameterCommand({
        Name: parameterName,
        WithDecryption: true
      }));

      return result.Parameter?.Value || null;
    } catch (err: any) {
      if (err.name === 'ParameterNotFound') {
        this.log('warn', `Secret not found: ${key}`);
        return null;
      }
      this.log('error', `Failed to fetch secret: ${key}`, { error: err.message });
      throw err;
    }
  }

  async httpRequest(url: string, options?: RequestInit): Promise<Response> {
    // Validate URL
    const parsedUrl = new URL(url);

    // Security: Block requests to private/internal networks
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blockedHosts.includes(parsedUrl.hostname) ||
        parsedUrl.hostname.startsWith('192.168.') ||
        parsedUrl.hostname.startsWith('10.') ||
        parsedUrl.hostname.startsWith('172.16.')) {
      throw new Error('Requests to internal/private networks are not allowed');
    }

    // Rate limiting: 100 requests per minute per URL host
    const now = Date.now();
    const hostKey = parsedUrl.hostname;
    const rateLimitEntry = this.requestCount.get(hostKey);

    if (rateLimitEntry) {
      if (now < rateLimitEntry.resetAt) {
        if (rateLimitEntry.count >= 100) {
          this.log('warn', 'Rate limit exceeded', { host: hostKey });
          throw new Error(`Rate limit exceeded for ${hostKey}`);
        }
        rateLimitEntry.count++;
      } else {
        // Reset counter
        this.requestCount.set(hostKey, { count: 1, resetAt: now + 60000 });
      }
    } else {
      this.requestCount.set(hostKey, { count: 1, resetAt: now + 60000 });
    }

    // Log the request
    this.log('info', 'HTTP request', {
      method: options?.method || 'GET',
      url: url,
      host: hostKey
    });

    // Add timeout (30 seconds default)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      this.log('info', 'HTTP response', {
        url: url,
        status: response.status,
        statusText: response.statusText
      });

      return response;
    } catch (err: any) {
      this.log('error', 'HTTP request failed', {
        url: url,
        error: err.message
      });
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
