import {User} from '../../auth/types';

export interface UserProfile extends User {
  bio?: string;
  avatarUrl?: string;
  joinedDate: string;
}
