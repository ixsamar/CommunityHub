import {useEffect, useCallback, useRef} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {DraftRepository, PostDraft} from '../../../APIServices/offline/DraftRepository';
import {useCreatePostMutation, useGetPostByIdQuery, useUpdatePostMutation} from '../../../APIServices/posts/postsApi';
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

export const useCreatePost = (initialCommunityId?: string, editPostId?: string) => {
  const {showToast} = useToast();
  const navigation = useNavigation();
  const isSubmittingRef = useRef(false);
  const [createPostTrigger, {isLoading: isSubmittingMutation}] = useCreatePostMutation();
  const [updatePostTrigger, {isLoading: isUpdatingMutation}] = useUpdatePostMutation();
  const isSubmitting = isSubmittingMutation || isUpdatingMutation;

  const {data: editPostData, isLoading: isFetchingEditPost} = useGetPostByIdQuery(editPostId || '', {
    skip: !editPostId,
  });

  const {data: communitiesData} = useGetCommunitiesQuery({
    page: 1,
    limit: 50,
  });
  const communities = communitiesData?.data || [];

  const draftKey = initialCommunityId || 'general';

  const savedDraft = editPostId ? null : DraftRepository.getDraft(draftKey);

  const methods = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: savedDraft?.title || '',
      content: savedDraft?.content || '',
      communityId: initialCommunityId || savedDraft?.communityId || '',
      images: savedDraft?.images || [],
    },
  });

  const {watch, reset, register} = methods;
  const currentValues = watch();

  useEffect(() => {
    register('communityId');
  }, [register]);

  useEffect(() => {
    if (editPostId && editPostData) {
      reset({
        title: editPostData.title,
        content: editPostData.content,
        communityId: editPostData.communityId,
        images: editPostData.images || [],
      });
    }
  }, [editPostId, editPostData, reset]);

  useEffect(() => {
    if (editPostId) return;

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
    editPostId,
  ]);

  const onSubmit = useCallback(
    async (values: PostFormValues) => {
      if (isSubmittingRef.current) {
        Logger.warn('Duplicate post submission prevented', 'useCreatePost');
        return;
      }
      isSubmittingRef.current = true;
      try {
        if (editPostId) {
          Logger.info('Updating post...', 'useCreatePost');
          await updatePostTrigger({id: editPostId, post: values}).unwrap();
          showToast('Post updated successfully!', 'success');
        } else {
          Logger.info('Submitting post creation...', 'useCreatePost');
          const clientPostId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await createPostTrigger({...values, clientPostId}).unwrap();

          DraftRepository.clearDraft(draftKey);
          reset({title: '', content: '', communityId: initialCommunityId || '', images: []});

          showToast('Post created successfully!', 'success');
        }
        navigation.goBack();
      } catch (err: unknown) {
        const error = err as {
          message?: string;
          error?: {message?: string};
          data?: {message?: string};
        };
        const errMsg = error?.message || error?.error?.message || '';
        if (!editPostId && (errMsg.includes('offline') || errMsg.includes('queued') || errMsg.includes('Network'))) {
          DraftRepository.clearDraft(draftKey);
          reset({title: '', content: '', communityId: initialCommunityId || '', images: []});
          showToast('Offline: Post queued for synchronization.', 'success');
          navigation.goBack();
        } else {
          showToast(error?.data?.message || `Failed to ${editPostId ? 'update' : 'create'} post. Please try again.`, 'error');
        }
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [createPostTrigger, updatePostTrigger, draftKey, reset, initialCommunityId, editPostId, showToast, navigation],
  );

  const discardDraft = useCallback(() => {
    if (editPostId) return;
    DraftRepository.clearDraft(draftKey);
    reset({title: '', content: '', communityId: initialCommunityId || '', images: []});
    showToast('Draft discarded.', 'info');
  }, [editPostId, draftKey, reset, initialCommunityId, showToast]);

  return {
    methods,
    onSubmit,
    discardDraft,
    isSubmitting: isSubmitting || isFetchingEditPost,
    communities,
    hasSavedDraft: !!savedDraft,
  };
};
