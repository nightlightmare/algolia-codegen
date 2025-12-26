export type InstanceOrArray<T> = T | T[];

export type UrlSchema = {
  [url: string]: AlgoliaCodegenGeneratorConfig;
};

export type AlgoliaCodegenGeneratorConfig = {
  appId: string;
  searchKey: string;
  indexName: string;
  prefix?: string;
  postfix?: string;
  /**
   * Optional custom hosts configuration for Algolia client.
   * Useful for proxy setups or custom endpoints.
   * Each host should be an object with:
   * - url: The host URL without scheme (e.g., "your-app.algolia.net")
   * - accept: "read" | "write" | "readWrite"
   * - protocol: "https" | "http"
   * - port?: Optional port number
   */
  hosts?: Array<{
    url: string;
    accept: 'read' | 'write' | 'readWrite';
    protocol: 'https' | 'http';
    port?: number;
  }>;
  /**
   * Optional timeout configuration in milliseconds.
   * Default: 10000 (10 seconds) for connect timeout, 30000 (30 seconds) for request timeout
   */
  timeout?: {
    connect?: number; // Connection timeout in milliseconds
    request?: number; // Request timeout in milliseconds
  };
};

export type AlgoliaCodegenConfig = {
  overwrite: boolean;
  generates: InstanceOrArray<UrlSchema>;
};
