/**
 * Core models and interfaces for the Communities feature.
 */

export interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  isPrivate: boolean;
  createdAt: string;
  image?: string;
  isJoined?: boolean;
  postsCount?: number;
}

export interface CommunityQueryParams {
  search?: string;
  sort?: 'name' | 'members' | 'recent';
  filter?: 'all' | 'public' | 'private';
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
