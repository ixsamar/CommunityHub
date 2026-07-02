export interface RepositoryResult<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export type NetworkResult<T> = Promise<RepositoryResult<T>>;
