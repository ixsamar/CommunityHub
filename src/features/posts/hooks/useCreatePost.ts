import {useEffect, useCallback} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {DraftRepository, PostDraft} from '../../../common/services/offline/DraftRepository';
import {useCreatePostMutation} from '../api/postsApi';
import {useGetCommunitiesQuery} from '../../community/api/communityApi';
import {useToast} from '../../../common/components/ToastContext';
import {useNavigation} from '@react-navigation/native';
import {Logger} from '../../../common/utils/logger';

export const postFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters'),
  communityId: z
    .string()
    .min(1, 'Please select a community'),
});

export type PostFormValues = z.infer<typeof postFormSchema>;

export const useCreatePost = (initialCommunityId?: string) => {
  const {showToast} = useToast();
  const navigation = useNavigation();
  const [createPostTrigger, {isLoading: isSubmitting}] = useCreatePostMutation();

  // Load communities to populate dropdown selector
  const {data: communitiesData} = useGetCommunitiesQuery({
    page: 1,
    limit: 50,
  });
  const communities = communitiesData?.data || [];

  // Determine draft resolution key
  const draftKey = initialCommunityId || 'general';

  // Load existing draft if any
  const savedDraft = DraftRepository.getDraft(draftKey);

  const methods = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: savedDraft?.title || '',
      content: savedDraft?.content || '',
      communityId: initialCommunityId || savedDraft?.communityId || '',
    },
  });

  const {watch, reset} = methods;
  const currentValues = watch();

  // Auto-save draft when values change
  useEffect(() => {
    const hasValue = currentValues.title || currentValues.content;
    if (hasValue) {
      const draft: PostDraft = {
        title: currentValues.title,
        content: currentValues.content,
        communityId: currentValues.communityId,
      };
      DraftRepository.saveDraft(draftKey, draft);
    }
  }, [currentValues.title, currentValues.content, currentValues.communityId, draftKey]);

  // Form Submit Handler
  const onSubmit = useCallback(
    async (values: PostFormValues) => {
      try {
        Logger.info('Submitting post creation...', 'useCreatePost');
        await createPostTrigger(values).unwrap();
        
        // Clear local drafts on successful submit
        DraftRepository.clearDraft(draftKey);
        reset({title: '', content: '', communityId: initialCommunityId || ''});
        
        showToast('Post created successfully!', 'success');
        navigation.goBack();
      } catch (err: unknown) {
        const error = err as {
          message?: string;
          error?: { message?: string };
          data?: { message?: string };
        };
        const errMsg = error?.message || error?.error?.message || '';
        if (errMsg.includes('offline') || errMsg.includes('queued') || errMsg.includes('Network')) {
          // Handled as optimistic offline create
          DraftRepository.clearDraft(draftKey);
          reset({title: '', content: '', communityId: initialCommunityId || ''});
          showToast('Offline: Post queued for synchronization.', 'success');
          navigation.goBack();
        } else {
          showToast(error?.data?.message || 'Failed to create post. Please try again.', 'error');
        }
      }
    },
    [createPostTrigger, draftKey, reset, initialCommunityId, showToast, navigation],
  );

  const discardDraft = useCallback(() => {
    DraftRepository.clearDraft(draftKey);
    reset({title: '', content: '', communityId: initialCommunityId || ''});
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
