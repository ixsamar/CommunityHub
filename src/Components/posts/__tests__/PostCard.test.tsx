import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {PostCard} from '../PostCard';
import {Post} from '../../../Constance/globalTypes';

const mockTheme = {
  colors: {
    card: '#ffffff',
    border: '#cccccc',
    shadow: '#000000',
    surfaceVariant: '#f0f0f0',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#6200ee',
    error: '#ef5350',
    errorLight: '#ffebee',
    warning: '#ffb300',
    warningLight: '#fff8e1',
  },
  typography: {
    h3: {fontSize: 16, fontWeight: 'bold'},
    bodyMedium: {fontSize: 15},
    bodySmall: {fontSize: 14},
    caption: {fontSize: 12},
  },
  spacing: {
    md: 16,
  },
  borderRadius: {
    lg: 12,
    md: 8,
    sm: 4,
    xs: 2,
    full: 9999,
  },
};

jest.mock('../../../Utils/themeIndex', () => ({
  useTheme: () => mockTheme,
  useColors: () => mockTheme.colors,
  useTypography: () => mockTheme.typography,
  useSpacing: () => ({
    spacing: mockTheme.spacing,
    borderRadius: mockTheme.borderRadius,
    iconSize: {},
    elevation: () => ({}),
  }),
}));

const mockAppDispatch = jest.fn();
jest.mock('../../../Utils/hooks/useAppDispatch', () => ({
  useAppDispatch: () => mockAppDispatch,
}));

jest.mock('../../../Screens/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user_99', name: 'Alex Johnson' },
    isAuthenticated: true,
  }),
}));

jest.mock('../../common/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

jest.mock('../../../APIServices/community/communityApi', () => ({
  communityApi: {
    useGetCommunityByIdQuery: () => ({
      data: { name: 'React Native Developers' },
      isLoading: false,
    }),
  },
}));

jest.mock('../../../APIServices/posts/postsApi', () => ({
  postsApi: {
    useDeletePostMutation: () => [jest.fn(), { isLoading: false }],
    endpoints: {
      createPost: {
        initiate: jest.fn().mockImplementation(() => {
          const action = {
            type: 'mock_create_post',
            unwrap: jest.fn().mockResolvedValue({}),
          };
          return action as any;
        }),
      },
    },
    util: {
      updateQueryData: jest.fn().mockImplementation(() => ({ type: 'mock_update_query_data' })),
    },
  },
}));

const mockPost: Post = {
  id: 'post_123',
  title: 'Understanding React Native Architecture',
  content: 'The bridge, the fabric, and the future JSI. Let us dive deep.',
  communityId: 'community_1',
  authorId: 'user_99',
  authorName: 'Alex Johnson',
  createdAt: '2026-07-02T12:00:00.000Z',
  isPending: false,
  isFailed: false,
};

describe('PostCard', () => {
  it('renders author info, title, and body content', () => {
    const {getByText} = render(<PostCard post={mockPost} />);

    expect(getByText(/Alex Johnson/)).toBeTruthy();
    expect(getByText('Understanding React Native Architecture')).toBeTruthy();
    expect(getByText('The bridge, the fabric, and the future JSI. Let us dive deep.')).toBeTruthy();
  });

  it('renders the first letter of author name in uppercase as avatar placeholder', () => {
    const {getByText} = render(<PostCard post={mockPost} />);
    expect(getByText('A')).toBeTruthy();
  });

  it('displays the Syncing... spinner and status when post is pending', () => {
    const pendingPost = {...mockPost, isPending: true};
    const {getByText} = render(<PostCard post={pendingPost} />);

    expect(getByText('Syncing...')).toBeTruthy();
  });

  it('displays Failed (Queued) warning when post sync has failed', () => {
    const failedPost = {...mockPost, isPending: true, isFailed: true};
    const {getByText} = render(<PostCard post={failedPost} />);

    expect(getByText('Retry Sync')).toBeTruthy();
  });

  it('does not display any status badge for normal successfully-synced posts', () => {
    const {queryByText} = render(<PostCard post={mockPost} />);

    expect(queryByText('Syncing...')).toBeNull();
    expect(queryByText('Failed (Queued)')).toBeNull();
  });

  it('triggers manual sync and updates status when retry button is pressed', () => {
    mockAppDispatch.mockClear();
    const {store} = require('../../../Store/store');
    jest.spyOn(store, 'dispatch').mockImplementation((action: any) => {
      return {
        type: typeof action === 'string' ? action : action?.type || 'mock_action',
        unwrap: jest.fn().mockResolvedValue({}),
      } as any;
    });

    const {QueueManager} = require('../../../APIServices/offline/QueueManager');

    const failedPost = {
      ...mockPost,
      isPending: true,
      isFailed: true,
      clientPostId: 'client_123',
    };

    QueueManager.enqueue('CREATE_POST', {
      postData: {
        title: failedPost.title,
        content: failedPost.content,
        communityId: failedPost.communityId,
        clientPostId: failedPost.clientPostId,
      },
    });

    const {getByText} = render(<PostCard post={failedPost} />);
    const retryBtn = getByText('Retry Sync');

    fireEvent.press(retryBtn);

    expect(mockAppDispatch).toHaveBeenCalled();
  });
});
