import {useEffect, useCallback, useRef} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {DraftRepository, PostDraft} from '../../../APIServices/offline/DraftRepository';
import {useCreatePostMutation} from '../../../APIServices/posts/postsApi';
import {useGetCommunitiesQuery} from '../../../APIServices/community/communityApi';
import {useToast} from '../../../Components/common/ToastContext';
import {useNavigation} from '@react-navigation/native';
import {Logger} from '../../../Utils/logger';

export const postFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  communityId: z.string().min(1, 'Please select a community'),
  images: z.array(z.string()).optional(),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

export const useCreatePost = (initialCommunityId?: string) => {
  const {showToast} = useToast();
  const navigation = useNavigation();
  const isSubmittingRef = useRef(false);
  const [createPostTrigger, {isLoading: isSubmittingMutation}] = useCreatePostMutation();
  const isSubmitting = isSubmittingMutation;

  const {data: communitiesData} = useGetCommunitiesQuery({
    page: 1,
    limit: 50,
  });
  const communities = communitiesData?.data || [];

  const draftKey = initialCommunityId || 'general';

  const savedDraft = DraftRepository.getDraft(draftKey);

  const methods = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: savedDraft?.title || '',
      content: savedDraft?.content || '',
      communityId: initialCommunityId || savedDraft?.communityId || '',
      images: savedDraft?.images || [],
    },
  });

  const {watch, reset} = methods;
  const currentValues = watch();

  useEffect(() => {
    const hasValue =
      currentValues.title ||
      currentValues.content ||
      (currentValues.images && currentValues.images.length > 0);
    if (hasValue) {
      const draft: PostDraft = {
        title: currentValues.title,
        content: currentValues.content,
        communityId: currentValues.communityId,
        images: currentValues.images,
      };
      DraftRepository.saveDraft(draftKey, draft);
    }
  }, [
    currentValues.title,
    currentValues.content,
    currentValues.communityId,
    currentValues.images,
    draftKey,
  ]);

  const onSubmit = useCallback(
    async (values: PostFormValues) => {
      if (isSubmittingRef.current) {
        Logger.warn('Duplicate post submission prevented', 'useCreatePost');
        return;
      }
      isSubmittingRef.current = true;
      try {
        Logger.info('Submitting post creation...', 'useCreatePost');
        const clientPostId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await createPostTrigger({...values, clientPostId}).unwrap();

        DraftRepository.clearDraft(draftKey);
        reset({title: '', content: '', communityId: initialCommunityId || '', images: []});

        showToast('Post created successfully!', 'success');
        navigation.goBack();
      } catch (err: unknown) {
        const error = err as {
          message?: string;
          error?: {message?: string};
          data?: {message?: string};
        };
        const errMsg = error?.message || error?.error?.message || '';
        if (errMsg.includes('offline') || errMsg.includes('queued') || errMsg.includes('Network')) {
          DraftRepository.clearDraft(draftKey);
          reset({title: '', content: '', communityId: initialCommunityId || '', images: []});
          showToast('Offline: Post queued for synchronization.', 'success');
          navigation.goBack();
        } else {
          showToast(error?.data?.message || 'Failed to create post. Please try again.', 'error');
        }
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [createPostTrigger, draftKey, reset, initialCommunityId, showToast, navigation],
  );

  const discardDraft = useCallback(() => {
    DraftRepository.clearDraft(draftKey);
    reset({title: '', content: '', communityId: initialCommunityId || '', images: []});
    showToast('Draft discarded.', 'info');
  }, [draftKey, reset, initialCommunityId, showToast]);

  return {
    methods,
    onSubmit,
    discardDraft,
    isSubmitting,
    communities,
    hasSavedDraft: !!savedDraft,
  };
};
