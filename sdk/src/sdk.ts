import { DynamoDBClient, GetItemCommand, PutItemCommand, DeleteItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export interface PluginSDKConfig {
  pluginId: string;
  tableName: string;
  assetBucket: string;
  region: string;
}

export class PluginSDK {
  private dynamodb: DynamoDBClient;
  private s3: S3Client;
  private pluginId: string;
  private tableName: string;
  private assetBucket: string;

  constructor(config: PluginSDKConfig) {
    this.pluginId = config.pluginId;
    this.tableName = config.tableName;
    this.assetBucket = config.assetBucket;
    this.dynamodb = new DynamoDBClient({ region: config.region });
    this.s3 = new S3Client({ region: config.region });
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
}
