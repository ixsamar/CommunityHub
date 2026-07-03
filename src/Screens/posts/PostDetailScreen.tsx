import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, useNavigation} from '@react-navigation/native';
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

export const PostDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const {postId} = route.params;
  const {colors, typography, borderRadius} = useTheme();
  const {user} = useAuth();
  const {showToast} = useToast();

  const {data: post, isLoading, error} = useGetPostByIdQuery(postId);
  const [deletePost, {isLoading: isDeleting}] = useDeletePostMutation();

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
            } catch (err: any) {
              showToast(err.data?.message || err.message || 'Failed to delete post.', 'error');
            }
          },
        },
      ],
      {cancelable: true},
    );
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
    <SafeAreaView
      style={{flex: 1, backgroundColor: colors.background}}
      edges={['top', 'bottom', 'left', 'right']}>
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
        <Text style={[typography.h2, {color: colors.text, flex: 1, marginLeft: wp('2%')}]}>
          Discussion
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <PostCard post={post} isDetail={true} />

        {isAuthor && (
          <View style={[styles.actionsCard, {backgroundColor: colors.surface, borderColor: colors.border}]}>
            <Text style={[typography.caption, {color: colors.textSecondary, marginBottom: hp('1%')}]}>
              Post Actions (Only visible to you)
            </Text>
            <View style={styles.buttonsRow}>
              {showEdit && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: colors.primary,
                      marginRight: showDelete ? wp('3%') : 0,
                      marginBottom: !showDelete ? hp('1%') : 0,
                    },
                  ]}
                  onPress={handleEdit}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Edit post">
                  <Icon name="create-outline" size={18} color={colors.onPrimary} />
                  <Text style={[typography.bodyMedium, {color: colors.onPrimary, marginLeft: wp('1.5%'), fontWeight: '600'}]}>
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
                  <Text style={[typography.bodyMedium, {color: '#ffffff', marginLeft: wp('1.5%'), fontWeight: '600'}]}>
                    Delete Post
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[typography.caption, {color: colors.error, marginTop: hp('1%'), fontSize: 11, fontStyle: 'italic'}]}>
                  * This post can no longer be deleted (creation was &gt;1 hour ago).
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: hp('6%'),
  },
  actionsCard: {
    marginTop: hp('2%'),
    padding: wp('4%'),
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 8,
    justifyContent: 'center',
    flex: 1,
    minWidth: wp('35%'),
  },
});
