import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../Utils/themeIndex';
import {Community} from '../../Constance/globalTypes';
import {LazyImage} from '../common/LazyImage';

interface Props {
  community: Community;
  onPress: (id: string) => void;
}

export const CommunityCard: React.FC<Props> = React.memo(({community, onPress}) => {
  const {colors, typography, spacing, borderRadius} = useTheme();

  const handlePress = () => {
    onPress(community.id);
  };

  const accessibilityLabel = `Community: ${community.name}. ${community.description || ''}. ${
    community.members
  } members. ${community.isPrivate ? 'Private group.' : 'Public group.'} ${
    community.isJoined ? 'You are a member.' : 'Double tap to open.'
  }`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
          padding: spacing.md || wp('4%'),
          marginVertical: hp('0.8%'),
          borderRadius: borderRadius.lg,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      <View style={styles.contentRow}>
        {community.image ? (
          <LazyImage
            source={{uri: community.image}}
            style={[
              styles.image,
              {backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.md},
            ]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              {backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.md},
            ]}>
            <Icon name="people" size={24} color={colors.textSecondary} />
          </View>
        )}

        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[typography.h3, {color: colors.text, flexShrink: 1}]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}>
              {community.name}
            </Text>
            {community.isPrivate && (
              <View
                style={[
                  styles.privateBadge,
                  {backgroundColor: colors.surfaceVariant, borderRadius: borderRadius.xs},
                ]}>
                <Icon name="lock-closed" size={10} color={colors.textSecondary} />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={[typography.caption, {color: colors.textSecondary, marginLeft: 2}]}>
                  Private
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[typography.bodySmall, {color: colors.textSecondary, marginTop: hp('0.4%')}]}
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}>
            {community.description}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.statItem}>
              <Icon name="people-outline" size={14} color={colors.primary} />
              <Text
                maxFontSizeMultiplier={1.2}
                style={[
                  typography.caption,
                  {color: colors.textSecondary, marginLeft: wp('1%'), fontWeight: '600'},
                ]}>
                {community.members.toLocaleString()} members
              </Text>
            </View>

            {community.isJoined && (
              <View
                style={[
                  styles.joinedBadge,
                  {backgroundColor: colors.successLight, borderRadius: borderRadius.sm},
                ]}>
                <Icon name="checkmark-circle" size={12} color={colors.success} />
                <Text
                  maxFontSizeMultiplier={1.2}
                  style={[
                    typography.caption,
                    {color: colors.success, marginLeft: 3, fontWeight: '700'},
                  ]}>
                  Joined
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

CommunityCard.displayName = 'CommunityCard';

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: wp('18%'),
    height: wp('18%'),
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: wp('18%'),
    height: wp('18%'),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: wp('4%'),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
