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
import {launchImageLibrary} from 'react-native-image-picker';

import {useTheme} from '../../Utils/themeIndex';
import {PostsStackParamList} from '../../Constance/globalTypes';
import {useCreatePost} from './hooks/useCreatePost';
import {LazyImage} from '../../Components/common/LazyImage';
import {useToast} from '../../Components/common/ToastContext';
import {useCreateCommunityMutation} from '../../APIServices/community/communityApi';

type ScreenRouteProp = RouteProp<PostsStackParamList, 'CreatePost'>;

export const CreatePostScreen = () => {
  const {colors, typography} = useTheme();
  const route = useRoute<ScreenRouteProp>();
  const navigation = useNavigation();
  const {showToast} = useToast();
  const initialCommunityId = route.params?.communityId;
  const editPostId = route.params?.editPostId;

  const {methods, onSubmit, discardDraft, isSubmitting, communities, hasSavedDraft} =
    useCreatePost(initialCommunityId, editPostId);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
  } = methods;

  const selectedCommunityId = watch('communityId');
  const [selectorVisible, setSelectorVisible] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<'select' | 'create'>('select');

  const [newCommunityName, setNewCommunityName] = React.useState('');
  const [newCommunityDesc, setNewCommunityDesc] = React.useState('');
  const [newCommunityPrivate, setNewCommunityPrivate] = React.useState(false);
  const [createCommunityTrigger, {isLoading: isCreatingCommunity}] = useCreateCommunityMutation();

  const selectedCommunity = communities.find(c => c.id === selectedCommunityId);

  const handleCreateCommunity = async () => {
    if (!newCommunityName.trim()) {
      showToast('Please enter a community name', 'error');
      return;
    }
    try {
      const result = await createCommunityTrigger({
        name: newCommunityName.trim(),
        description: newCommunityDesc.trim(),
        isPrivate: newCommunityPrivate,
      }).unwrap();

      setValue('communityId', result.id, {shouldValidate: true});

      setNewCommunityName('');
      setNewCommunityDesc('');
      setNewCommunityPrivate(false);
      setModalMode('select');
      setSelectorVisible(false);

      showToast('Community created and selected!', 'success');
    } catch (err: any) {
      const errMsg = err?.message || err?.data?.message || '';
      if (errMsg.includes('offline') || errMsg.includes('queued')) {
        setNewCommunityName('');
        setNewCommunityDesc('');
        setNewCommunityPrivate(false);
        setModalMode('select');
        setSelectorVisible(false);
        showToast('Offline: Community creation queued.', 'success');
      } else {
        showToast(errMsg || 'Failed to create community', 'error');
      }
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: colors.background}]}
      edges={['top', 'left', 'right']}>
      {}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, {color: colors.text}]}>{editPostId ? 'Edit Post' : 'Create Post'}</Text>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          style={[
            styles.submitHeaderBtn,
            {backgroundColor: isSubmitting ? colors.surfaceVariant : colors.primary},
          ]}
          activeOpacity={0.8}>
          <Text style={[typography.bodySmall, {color: '#ffffff', fontWeight: '700'}]}>
            {editPostId ? (isSubmitting ? 'Saving...' : 'Save') : (isSubmitting ? 'Posting...' : 'Post')}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {}
          {hasSavedDraft && (
            <View
              style={[
                styles.draftBanner,
                {backgroundColor: colors.surfaceVariant, borderColor: colors.border},
              ]}>
              <Icon name="document-text-outline" size={16} color={colors.primary} />
              <Text
                style={[typography.caption, {color: colors.text, marginLeft: wp('2%'), flex: 1}]}>
                Restored draft from autosave
              </Text>
              <TouchableOpacity
                onPress={discardDraft}
                style={styles.discardBtn}
                activeOpacity={0.7}>
                <Text style={[typography.caption, {color: colors.error, fontWeight: '700'}]}>
                  Discard
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <FormProvider {...methods}>
            {}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  typography.caption,
                  {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('0.8%')},
                ]}>
                POST TO COMMUNITY
              </Text>
              {initialCommunityId ? (
                <View
                  style={[
                    styles.lockedSelect,
                    {backgroundColor: colors.surfaceVariant, borderColor: colors.border},
                  ]}>
                  <Icon name="people" size={16} color={colors.textSecondary} />
                  <Text
                    style={[
                      typography.bodyMedium,
                      {color: colors.textSecondary, marginLeft: wp('2%'), fontWeight: '600'},
                    ]}>
                    {selectedCommunity?.name || 'Loading Community...'}
                  </Text>
                  <Icon
                    name="lock-closed-outline"
                    size={14}
                    color={colors.textSecondary}
                    style={styles.lockIcon}
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.selectButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.communityId ? colors.error : colors.border,
                      },
                    ]}
                    onPress={() => {
                      setModalMode('select');
                      setSelectorVisible(true);
                    }}
                    activeOpacity={0.8}>
                    <Icon name="people-outline" size={18} color={colors.primary} />
                    <Text
                      style={[
                        typography.bodyMedium,
                        {
                          color: selectedCommunity ? colors.text : colors.textSecondary,
                          marginLeft: wp('2.5%'),
                          flex: 1,
                        },
                      ]}>
                      {selectedCommunity ? selectedCommunity.name : 'Select a community...'}
                    </Text>
                    <Icon name="chevron-down" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {errors.communityId && (
                    <Text
                      style={[typography.caption, {color: colors.error, marginTop: hp('0.5%')}]}>
                      {errors.communityId.message}
                    </Text>
                  )}
                </>
              )}
            </View>

            {}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  typography.caption,
                  {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('0.8%')},
                ]}>
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

            {}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  typography.caption,
                  {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('0.8%')},
                ]}>
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

            {}
            <View style={styles.inputGroup}>
              <Text
                style={[
                  typography.caption,
                  {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('0.8%')},
                ]}>
                ATTACH IMAGES (OPTIONAL)
              </Text>
              <View style={styles.imagesContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imagesScroll}>
                  {(watch('images') || []).map((uri: string, index: number) => (
                    <View
                      key={uri + index}
                      style={[styles.imagePreviewWrapper, {borderColor: colors.border}]}>
                      <LazyImage source={{uri}} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={[styles.removeImageBtn, {backgroundColor: colors.error}]}
                        onPress={() => {
                          const existing = watch('images') || [];
                          setValue(
                            'images',
                            existing.filter((_, idx) => idx !== index),
                            {shouldValidate: true},
                          );
                        }}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Remove image">
                        <Icon name="close" size={14} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={[
                      styles.addImageCard,
                      {backgroundColor: colors.surface, borderColor: colors.border},
                    ]}
                    onPress={async () => {
                      try {
                        const response = await launchImageLibrary({
                          mediaType: 'photo',
                          selectionLimit: 0,
                        });
                        if (response.didCancel) return;
                        if (response.errorMessage) {
                          showToast(response.errorMessage, 'error');
                          return;
                        }
                        if (response.assets) {
                          const newUris = response.assets
                            .map(asset => asset.uri)
                            .filter((uri): uri is string => !!uri);
                          const existing = watch('images') || [];
                          setValue('images', [...existing, ...newUris], {shouldValidate: true});
                        }
                      } catch (err: any) {
                        showToast(err.message || 'Failed to select images', 'error');
                      }
                    }}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Add images from device">
                    <Icon name="images-outline" size={24} color={colors.primary} />
                    <Text
                      style={[
                        typography.caption,
                        {color: colors.textSecondary, marginTop: 4, fontWeight: '600'},
                      ]}>
                      Add Image
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </FormProvider>
        </ScrollView>
      </KeyboardAvoidingView>

      {}
      <Modal visible={selectorVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.flexOne}
            onPress={() => {
              setSelectorVisible(false);
              setModalMode('select');
            }}
          />
          <View
            style={[
              styles.pickerContainer,
              {backgroundColor: colors.surface, borderColor: colors.border},
            ]}>
            <View style={styles.pickerHeader}>
              <Text style={[typography.h3, {color: colors.text}]}>
                {modalMode === 'select' ? 'Choose Community' : 'Create Community'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  if (modalMode === 'create') {
                    setModalMode('select');
                  } else {
                    setSelectorVisible(false);
                  }
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Close or back">
                <Icon
                  name={modalMode === 'create' ? 'arrow-back' : 'close'}
                  size={20}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>

            {modalMode === 'select' ? (
              <>
                {}
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.primary + '10',
                      marginBottom: hp('1%'),
                    },
                  ]}
                  onPress={() => setModalMode('create')}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Create a new community option">
                  <Icon name="add-circle-outline" size={18} color={colors.primary} />
                  <Text
                    style={[
                      typography.bodyMedium,
                      {color: colors.primary, marginLeft: wp('3%'), fontWeight: '700'},
                    ]}>
                    Create a new community...
                  </Text>
                </TouchableOpacity>

                <FlatList
                  data={communities}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.pickerList}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      style={[
                        styles.pickerItem,
                        {
                          borderColor: colors.border,
                          backgroundColor:
                            selectedCommunityId === item.id ? colors.primary + '10' : 'transparent',
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
              </>
            ) : (
              <View style={styles.createCommunityForm}>
                <View style={styles.inlineInputGroup}>
                  <Text
                    style={[
                      typography.caption,
                      {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('0.6%')},
                    ]}>
                    COMMUNITY NAME
                  </Text>
                  <TextInput
                    style={[
                      styles.inlineInput,
                      {
                        backgroundColor: colors.surfaceVariant,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Enter community name..."
                    placeholderTextColor={colors.textSecondary}
                    value={newCommunityName}
                    onChangeText={setNewCommunityName}
                    maxLength={50}
                  />
                </View>

                <View style={styles.inlineInputGroup}>
                  <Text
                    style={[
                      typography.caption,
                      {color: colors.textSecondary, fontWeight: '700', marginBottom: hp('0.6%')},
                    ]}>
                    DESCRIPTION
                  </Text>
                  <TextInput
                    style={[
                      styles.inlineInputArea,
                      {
                        backgroundColor: colors.surfaceVariant,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                    placeholder="Describe this community's purpose..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={3}
                    value={newCommunityDesc}
                    onChangeText={setNewCommunityDesc}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.toggleRow}>
                  <View style={styles.toggleLabel}>
                    <Text style={[typography.bodyMedium, {color: colors.text, fontWeight: '600'}]}>
                      Private Community
                    </Text>
                    <Text style={[typography.caption, {color: colors.textSecondary}]}>
                      Only joined members can view posts
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.switchContainer,
                      {
                        backgroundColor: newCommunityPrivate
                          ? colors.primary
                          : colors.surfaceVariant,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setNewCommunityPrivate(!newCommunityPrivate)}
                    activeOpacity={0.8}
                    accessibilityRole="switch"
                    accessibilityState={{checked: newCommunityPrivate}}
                    accessibilityLabel="Toggle private community visibility">
                    <View
                      style={[
                        styles.switchThumb,
                        {
                          alignSelf: newCommunityPrivate ? 'flex-end' : 'flex-start',
                          backgroundColor: '#ffffff',
                        },
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.createSubmitBtn, {backgroundColor: colors.primary}]}
                  onPress={handleCreateCommunity}
                  disabled={isCreatingCommunity}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Create and select community">
                  <Text style={[typography.bodyMedium, {color: '#ffffff', fontWeight: '700'}]}>
                    {isCreatingCommunity ? 'Creating...' : 'Create & Select'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
  imagesContainer: {
    marginTop: hp('0.5%'),
    flexDirection: 'row',
  },
  imagesScroll: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  imagePreviewWrapper: {
    width: wp('22%'),
    height: wp('22%'),
    borderRadius: 12,
    borderWidth: 1,
    marginRight: wp('3%'),
    position: 'relative',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  addImageCard: {
    width: wp('22%'),
    height: wp('22%'),
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCommunityForm: {
    paddingBottom: hp('4%'),
  },
  inlineInputGroup: {
    marginBottom: hp('1.8%'),
  },
  inlineInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.2%'),
    fontSize: 14,
  },
  inlineInputArea: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.2%'),
    height: hp('10%'),
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2.5%'),
  },
  toggleLabel: {
    flex: 0.8,
  },
  switchContainer: {
    width: 50,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  createSubmitBtn: {
    borderRadius: 10,
    paddingVertical: hp('1.6%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreatePostScreen;
