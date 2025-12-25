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
};

export type AlgoliaCodegenConfig = {
  overwrite: boolean;
  generates: InstanceOrArray<UrlSchema>;
};

