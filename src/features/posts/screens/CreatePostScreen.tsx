import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  Modal,
  Pressable,
} from 'react-native';
import {useRoute, RouteProp, useNavigation} from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Controller, FormProvider} from 'react-hook-form';

import {useTheme} from '../../../theme';
import {PostsStackParamList} from '../../../navigation/types';
import {useCreatePost} from '../hooks/useCreatePost';

type ScreenRouteProp = RouteProp<PostsStackParamList, 'CreatePost'>;

export const CreatePostScreen = () => {
  const {colors, typography} = useTheme();
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation();
  const initialCommunityId = route.params?.communityId;

  const {
    methods,
    onSubmit,
    discardDraft,
    isSubmitting,
    communities,
    hasSavedDraft,
  } = useCreatePost(initialCommunityId);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
  } = methods;

  const selectedCommunityId = watch('communityId');
  const [selectorVisible, setSelectorVisible] = React.useState(false);

  // Find selected community label
  const selectedCommunity = communities.find((c) => c.id === selectedCommunityId);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, {color: colors.text}]}>Create Post</Text>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          style={[
            styles.submitHeaderBtn,
            {backgroundColor: isSubmitting ? colors.surfaceVariant : colors.primary},
          ]}
          activeOpacity={0.8}>
          <Text style={[typography.bodySmall, {color: '#ffffff', fontWeight: '700'}]}>
            {isSubmitting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Draft Notification */}
          {hasSavedDraft && (
            <View style={[styles.draftBanner, {backgroundColor: colors.surfaceVariant, borderColor: colors.border}]}>
              <Icon name="document-text-outline" size={16} color={colors.primary} />
              <Text style={[typography.caption, {color: colors.text, marginLeft: wp('2%'), flex: 1}]}>
                Restored draft from autosave
              </Text>
              <TouchableOpacity onPress={discardDraft} style={styles.discardBtn} activeOpacity={0.7}>
                <Text style={[typography.caption, {color: colors.error, fontWeight: '700'}]}>
                  Discard
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <FormProvider {...methods}>
            {/* Community Picker Selector */}
            <View style={styles.inputGroup}>
              <Text style={[typography.caption, {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('0.8%')}]}>
                POST TO COMMUNITY
              </Text>
              {initialCommunityId ? (
                // Locked display if pre-selected
                <View style={[styles.lockedSelect, {backgroundColor: colors.surfaceVariant, borderColor: colors.border}]}>
                  <Icon name="people" size={16} color={colors.textSecondary} />
                  <Text style={[typography.bodyMedium, {color: colors.textSecondary, marginLeft: wp('2%'), fontWeight: '600'}]}>
                    {selectedCommunity?.name || 'Loading Community...'}
                  </Text>
                  <Icon name="lock-closed-outline" size={14} color={colors.textSecondary} style={styles.lockIcon} />
                </View>
              ) : (
                // Interactive select button
                <>
                  <TouchableOpacity
                    style={[styles.selectButton, {backgroundColor: colors.surface, borderColor: errors.communityId ? colors.error : colors.border}]}
                    onPress={() => setSelectorVisible(true)}
                    activeOpacity={0.8}>
                    <Icon name="people-outline" size={18} color={colors.primary} />
                    <Text style={[typography.bodyMedium, {color: selectedCommunity ? colors.text : colors.textSecondary, marginLeft: wp('2.5%'), flex: 1}]}>
                      {selectedCommunity ? selectedCommunity.name : 'Select a community...'}
                    </Text>
                    <Icon name="chevron-down" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {errors.communityId && (
                    <Text style={[typography.caption, {color: colors.error, marginTop: hp('0.5%')}]}>
                      {errors.communityId.message}
                    </Text>
                  )}
                </>
              )}
            </View>

            {/* Post Title Field */}
            <View style={styles.inputGroup}>
              <Text style={[typography.caption, {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('0.8%')}]}>
                TITLE
              </Text>
              <Controller
                control={control}
                name="title"
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.title ? colors.error : colors.border,
                        color: colors.text,
                        fontSize: typography.bodyMedium.fontSize,
                      },
                    ]}
                    placeholder="Enter an engaging title..."
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    maxLength={100}
                  />
                )}
              />
              {errors.title && (
                <Text style={[typography.caption, {color: colors.error, marginTop: hp('0.5%')}]}>
                  {errors.title.message}
                </Text>
              )}
            </View>

            {/* Post Content Field */}
            <View style={styles.inputGroup}>
              <Text style={[typography.caption, {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('0.8%')}]}>
                BODY CONTENT
              </Text>
              <Controller
                control={control}
                name="content"
                render={({field: {onChange, onBlur, value}}) => (
                  <TextInput
                    style={[
                      styles.textAreaInput,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.content ? colors.error : colors.border,
                        color: colors.text,
                        fontSize: typography.bodyMedium.fontSize,
                      },
                    ]}
                    placeholder="What would you like to say? Markdown, tips, and queries are welcome..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={8}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.content && (
                <Text style={[typography.caption, {color: colors.error, marginTop: hp('0.5%')}]}>
                  {errors.content.message}
                </Text>
              )}
            </View>
          </FormProvider>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Picker Selection Modal */}
      <Modal visible={selectorVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable style={styles.flexOne} onPress={() => setSelectorVisible(false)} />
          <View style={[styles.pickerContainer, {backgroundColor: colors.surface, borderColor: colors.border}]}>
            <View style={styles.pickerHeader}>
              <Text style={[typography.h3, {color: colors.text}]}>Choose Community</Text>
              <TouchableOpacity onPress={() => setSelectorVisible(false)} activeOpacity={0.7}>
                <Icon name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={communities}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.pickerList}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    {
                      borderColor: colors.border,
                      backgroundColor: selectedCommunityId === item.id ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setValue('communityId', item.id, {shouldValidate: true});
                    setSelectorVisible(false);
                  }}
                  activeOpacity={0.8}>
                  <Icon
                    name={item.isPrivate ? 'lock-closed-outline' : 'earth-outline'}
                    size={16}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      typography.bodyMedium,
                      {
                        color: colors.text,
                        marginLeft: wp('3%'),
                        fontWeight: selectedCommunityId === item.id ? '700' : '400',
                      },
                    ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  backBtn: {
    padding: 6,
  },
  submitHeaderBtn: {
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1%'),
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: wp('5%'),
    paddingBottom: hp('8%'),
  },
  draftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.2%'),
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: hp('2%'),
  },
  discardBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  inputGroup: {
    marginBottom: hp('2.5%'),
  },
  lockedSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  lockIcon: {
    marginLeft: 'auto',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  textAreaInput: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    height: hp('25%'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  flexOne: {
    flex: 1,
  },
  pickerContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('2.5%'),
    maxHeight: hp('60%'),
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  pickerList: {
    paddingBottom: hp('4%'),
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.6%'),
    paddingHorizontal: wp('3%'),
    borderRadius: 8,
    borderBottomWidth: 0.5,
  },
});

export default CreatePostScreen;
