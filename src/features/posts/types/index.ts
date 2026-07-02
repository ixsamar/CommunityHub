export interface Post {
  id: string;
  title: string;
  content: string;
  communityId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isPending?: boolean; // For optimistic creations
  isFailed?: boolean;  // For creations that failed and need retrying
}

export interface CreatePostRequest {
  title: string;
  content: string;
  communityId: string;
}
