import {renderHook, act} from '@testing-library/react-native';
import {useCreatePost} from '../useCreatePost';
import {DraftRepository} from '../../../../APIServices/offline/DraftRepository';

const mockGoBack = jest.fn();
const mockShowToast = jest.fn();
const mockCreatePostTrigger = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

jest.mock('../../../../Components/common/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

jest.mock('../../../../APIServices/posts/postsApi', () => ({
  useCreatePostMutation: () => [mockCreatePostTrigger, {isLoading: false}],
}));

jest.mock('../../../../APIServices/community/communityApi', () => ({
  useGetCommunitiesQuery: () => ({
    data: {
      data: [
        {id: 'c1', name: 'General'},
        {id: 'c2', name: 'React Native'},
      ],
    },
    isLoading: false,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();

  const {MMKV} = require('react-native-mmkv');
  new MMKV().clearAll();
});

describe('useCreatePost', () => {
  it('loads communities and returns initial state', () => {
    const {result} = renderHook(() => useCreatePost());

    expect(result.current.communities).toHaveLength(2);
    expect(result.current.communities[0].name).toBe('General');
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.hasSavedDraft).toBe(false);
  });

  it('pre-fills initialCommunityId in form fields', () => {
    const {result} = renderHook(() => useCreatePost('c2'));

    expect(result.current.methods.getValues().communityId).toBe('c2');
  });

  it('restores draft values from DraftRepository on load', () => {
    DraftRepository.saveDraft('c1', {
      title: 'Restored Draft Title',
      content: 'This draft was previously saved locally.',
      communityId: 'c1',
    });

    const {result} = renderHook(() => useCreatePost('c1'));

    expect(result.current.methods.getValues().title).toBe('Restored Draft Title');
    expect(result.current.methods.getValues().content).toBe(
      'This draft was previously saved locally.',
    );
    expect(result.current.methods.getValues().communityId).toBe('c1');
    expect(result.current.hasSavedDraft).toBe(true);
  });

  it('discards draft correctly when discardDraft is called', () => {
    DraftRepository.saveDraft('c1', {
      title: 'Discard Me',
      content: 'Trash this content.',
      communityId: 'c1',
    });

    const {result} = renderHook(() => useCreatePost('c1'));

    act(() => {
      result.current.discardDraft();
    });

    expect(result.current.methods.getValues().title).toBe('');
    expect(result.current.methods.getValues().content).toBe('');
    expect(DraftRepository.getDraft('c1')).toBeNull();
    expect(mockShowToast).toHaveBeenCalledWith('Draft discarded.', 'info');
  });

  it('submits correctly on form submission', async () => {
    const unwrapMock = jest.fn().mockResolvedValue({});
    mockCreatePostTrigger.mockReturnValue({unwrap: unwrapMock});

    const {result} = renderHook(() => useCreatePost('c2'));

    await act(async () => {
      await result.current.onSubmit({
        title: 'New Post Title',
        content: 'Long enough body content for validation.',
        communityId: 'c2',
      });
    });

    expect(mockCreatePostTrigger).toHaveBeenCalledWith({
      title: 'New Post Title',
      content: 'Long enough body content for validation.',
      communityId: 'c2',
      clientPostId: expect.any(String),
    });
    expect(mockShowToast).toHaveBeenCalledWith('Post created successfully!', 'success');
    expect(mockGoBack).toHaveBeenCalled();
  });
});
