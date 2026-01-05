export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  
  capabilities: {
    editor?: boolean;
    backend?: boolean;
    renderer?: boolean;
  };
  
  configSchema?: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  
  endpoints?: PluginEndpoint[];
  rendererHooks?: {
    beforeConversion?: boolean;
    afterConversion?: boolean;
  };
  
  permissions: {
    dataAccess: boolean;
    assetAccess: boolean;
  };
}

export interface PluginEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: string;
  description?: string;
}

export interface InstalledPlugin {
  id: string;
  version: string;
  enabled: boolean;
  installedAt: string;
  installedBy: string;
  config: Record<string, any>;
  manifest: PluginManifest;
}

export interface PluginRegistryEntry {
  id: string;
  name: string;
  description: string;
  latestVersion: string;
  githubRepo: string;
  releaseUrl: string;
  minSystemVersion?: string;
}

export interface PluginData {
  id: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}
