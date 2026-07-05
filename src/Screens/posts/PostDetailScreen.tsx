import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, useNavigation, RouteProp, CompositeNavigationProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PostsStackParamList, RootStackParamList} from '../../Constance/globalTypes';

type PostDetailsRouteProp = RouteProp<PostsStackParamList, 'PostDetails'>;
type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<PostsStackParamList, 'PostDetails'>,
  NativeStackNavigationProp<RootStackParamList>
>;
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../Utils/themeIndex';
import {
  useGetPostByIdQuery,
  useDeletePostMutation,
} from '../../APIServices/posts/postsApi';
import {useAuth} from '../auth/hooks/useAuth';
import {PostCard} from '../../Components/posts/PostCard';
import {useToast} from '../../Components/common/ToastContext';
import {Button} from '../../Components/common/Button';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  score: number;
  replies?: Comment[];
}

const generateMockComments = (postId: string): Comment[] => {
  return [
    {
      id: `${postId}_c1`,
      authorName: 'Aarav Sharma',
      content: 'This discussion is very relevant! The offline capabilities of this app makes community management so much easier.',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      score: 18,
      replies: [
        {
          id: `${postId}_c1_r1`,
          authorName: 'Ishaan Patel',
          content: 'Agreed! Love the clean, responsive layout. It feels very reliable.',
          createdAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
          score: 8,
        },
      ],
    },
    {
      id: `${postId}_c2`,
      authorName: 'Ananya Iyer',
      content: 'Great post. Are there scheduled offline meetups planned soon? I would love to RSVP.',
      createdAt: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString(),
      score: 12,
      replies: [
        {
          id: `${postId}_c2_r1`,
          authorName: 'Kunal Sen',
          content: 'Usually there is an update pinned under community details. Make sure you join the community to get alerts!',
          createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
          score: 5,
        },
      ],
    },
  ];
};

const CommentNode = ({comment, depth = 0}: {comment: Comment; depth: number}) => {
  const {colors, typography} = useTheme();
  const [likes, setLikes] = React.useState(comment.score);
  const [liked, setLiked] = React.useState(false);

  const handleLike = () => {
    setLiked(prev => !prev);
    setLikes(prev => (liked ? prev - 1 : prev + 1));
  };

  const formatCommentDate = (dateString: string) => {
    try {
      const diffMs = Date.now() - new Date(dateString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(dateString).toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <View
      style={[
        styles.commentContainer,
        {
          marginLeft: depth > 0 ? wp('3.5%') : 0,
          borderLeftWidth: depth > 0 ? 1.5 : 0,
          borderLeftColor: colors.border,
          paddingLeft: depth > 0 ? wp('3%') : 0,
        },
      ]}>
      <View style={styles.commentHeader}>
        <Text style={[typography.caption, {fontWeight: '700', color: colors.text}]}>
          {comment.authorName}
        </Text>
        <Text style={[typography.caption, {color: colors.textSecondary, marginLeft: wp('2%')}]}>
          {formatCommentDate(comment.createdAt)}
        </Text>
      </View>
      <Text style={[typography.bodyMedium, {color: colors.text, marginTop: hp('0.4%'), lineHeight: 19}]}>
        {comment.content}
      </Text>

      {/* Comment Actions (Like / Reply) */}
      <View style={styles.commentActions}>
        <TouchableOpacity onPress={handleLike} style={styles.commentActionBtn} activeOpacity={0.7}>
          <Icon
            name={liked ? 'heart' : 'heart-outline'}
            size={13}
            color={liked ? colors.error : colors.textSecondary}
          />
          <Text
            maxFontSizeMultiplier={1.2}
            style={[
              typography.caption,
              {color: liked ? colors.error : colors.textSecondary, marginLeft: 4, fontWeight: '700'},
            ]}>
            {likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.commentActionBtn, {marginLeft: wp('4%')}]} activeOpacity={0.7}>
          <Icon name="arrow-undo-outline" size={13} color={colors.textSecondary} />
          <Text
            maxFontSizeMultiplier={1.2}
            style={[typography.caption, {color: colors.textSecondary, marginLeft: 4, fontWeight: '700'}]}>
            Reply
          </Text>
        </TouchableOpacity>
      </View>

      {comment.replies &&
        comment.replies.map(reply => (
          <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
        ))}
    </View>
  );
};

export const PostDetailScreen = () => {
  const route = useRoute<PostDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const {postId} = route.params;
  const {colors, typography, borderRadius} = useTheme();
  const {user, isAuthenticated} = useAuth();
  const {showToast} = useToast();

  const {data: post, isLoading, error} = useGetPostByIdQuery(postId);
  const [deletePost, {isLoading: isDeleting}] = useDeletePostMutation();

  // Comments local state
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = React.useState('');

  React.useEffect(() => {
    if (postId) {
      setComments(generateMockComments(postId));
    }
  }, [postId]);

  const isAuthor = user?.id && post?.authorId && user.id === post.authorId;

  const isWithinOneHour = () => {
    if (!post) return false;
    const postTime = new Date(post.createdAt).getTime();
    const now = Date.now();
    return now - postTime <= 60 * 60 * 1000;
  };

  const handleEdit = () => {
    if (!post) return;
    navigation.navigate('CreatePost', {editPostId: post.id});
  };

  const handleDelete = () => {
    if (!post) return;
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post permanently?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(post.id).unwrap();
              showToast('Post deleted successfully!', 'success');
              navigation.goBack();
            } catch (err: unknown) {
              const error = err as {
                message?: string;
                data?: {message?: string};
              };
              showToast(error.data?.message || error.message || 'Failed to delete post.', 'error');
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const handleSendComment = () => {
    if (!newCommentText.trim()) return;
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please log in to add a comment.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Log In',
            onPress: () => {
              navigation.navigate('Auth', { screen: 'Login' });
            },
          },
        ],
        {cancelable: true},
      );
      return;
    }

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      authorName: user?.name || 'Anonymous User',
      content: newCommentText.trim(),
      createdAt: new Date().toISOString(),
      score: 1,
    };

    setComments(prev => [...prev, newComment]);
    setNewCommentText('');
    showToast('Comment posted!', 'success');
  };

  if (isLoading || isDeleting) {
    return (
      <SafeAreaView style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={[styles.errorContainer, {backgroundColor: colors.background}]}>
        <Text style={[typography.bodyMedium, {color: colors.textSecondary, marginBottom: hp('2%')}]}>
          Failed to load post.
        </Text>
        <Button title="Go Back" variant="primary" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const showDelete = isAuthor && isWithinOneHour();
  const showEdit = isAuthor;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background}} edges={['top']}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, {color: colors.text, fontWeight: '700', flex: 1, marginLeft: wp('2%')}]}>
          Post
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Detailed Post Card */}
          <PostCard post={post} isDetail={true} />

          {/* Author Administrative Actions */}
          {isAuthor && (
            <View style={[styles.actionsCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
              <Text style={[typography.caption, {color: colors.textSecondary, marginBottom: hp('1%'), fontWeight: '600'}]}>
                Administrative Actions
              </Text>
              <View style={styles.buttonsRow}>
                {showEdit && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: colors.primary,
                        marginRight: showDelete ? wp('3%') : 0,
                      },
                    ]}
                    onPress={handleEdit}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Edit post">
                    <Icon name="create-outline" size={18} color={colors.onPrimary} />
                    <Text style={[typography.bodyMedium, {color: colors.onPrimary, marginLeft: wp('1.5%'), fontWeight: '700'}]}>
                      Edit Post
                    </Text>
                  </TouchableOpacity>
                )}

                {showDelete ? (
                  <TouchableOpacity
                    style={[styles.actionButton, {backgroundColor: colors.error}]}
                    onPress={handleDelete}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Delete post">
                    <Icon name="trash-outline" size={18} color="#ffffff" />
                    <Text style={[typography.bodyMedium, {color: '#ffffff', marginLeft: wp('1.5%'), fontWeight: '700'}]}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[typography.caption, {color: colors.error, marginTop: hp('1%'), fontSize: 11, fontStyle: 'italic'}]}>
                    {"* This post cannot be deleted (>1 hour since creation)."}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={[typography.bodyMedium, {color: colors.text, fontWeight: '700', marginBottom: hp('2%')}]}>
              Comments
            </Text>

            {comments.length === 0 ? (
              <Text style={[typography.bodySmall, {color: colors.textSecondary, textAlign: 'center', marginVertical: hp('3%')}]}>
                No comments yet. Be the first to share your thoughts!
              </Text>
            ) : (
              comments.map(comment => <CommentNode key={comment.id} comment={comment} depth={0} />)
            )}
          </View>
        </ScrollView>

        {/* Comment Composer Footer */}
        <View
          style={[
            styles.composerContainer,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: Platform.OS === 'ios' ? hp('1.5%') : hp('0.5%'),
            },
          ]}>
          <TextInput
            value={newCommentText}
            onChangeText={setNewCommentText}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textSecondary}
            style={[
              styles.composerInput,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                borderRadius: borderRadius.lg,
              },
            ]}
            multiline
            maxLength={300}
          />
          <TouchableOpacity
            onPress={handleSendComment}
            disabled={!newCommentText.trim()}
            style={[
              styles.sendBtn,
              {
                backgroundColor: newCommentText.trim() ? colors.primary : colors.surfaceVariant,
                borderRadius: borderRadius.md,
              },
            ]}
            activeOpacity={0.8}>
            <Icon
              name="send"
              size={16}
              color={newCommentText.trim() ? colors.onPrimary : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('6%'),
  },
  headerRow: {
    height: hp('6%'),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
  },
  backBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: wp('4%'),
    paddingBottom: hp('10%'),
  },
  actionsCard: {
    marginTop: hp('1.5%'),
    padding: wp('4%'),
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 8,
    justifyContent: 'center',
    flex: 1,
  },
  commentsSection: {
    marginTop: hp('3%'),
    paddingTop: hp('2%'),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentContainer: {
    marginBottom: hp('2%'),
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('0.5%'),
    paddingLeft: wp('1%'),
  },
  commentActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.2%'),
    borderTopWidth: 1,
  },
  composerInput: {
    flex: 1,
    minHeight: hp('5%'),
    maxHeight: hp('12%'),
    borderWidth: 1,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    fontSize: 14,
    marginRight: wp('3%'),
  },
  sendBtn: {
    width: wp('10%'),
    height: wp('10%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
