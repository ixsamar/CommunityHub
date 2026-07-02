import React, {useState, useRef} from 'react';
import {StyleSheet, View, TextInput, TouchableOpacity, ViewStyle} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../../theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export const SearchBar: React.FC<Props> = React.memo(({
  value,
  onChangeText,
  placeholder = 'Search communities...',
  style,
}) => {
  const {colors, typography, spacing} = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.clear();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: isFocused ? colors.primary : colors.border,
          paddingHorizontal: spacing.sm || wp('3%'),
          height: hp('5.5%'),
        },
        style,
      ]}>
      <Icon
        name="search-outline"
        size={18}
        color={isFocused ? colors.primary : colors.textSecondary}
        style={styles.iconLeft}
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.input,
          {
            color: colors.text,
            fontSize: typography.bodyMedium.fontSize,
          },
        ]}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} activeOpacity={0.7} style={styles.clearButton}>
          <Icon name="close-circle" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
});

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    width: '100%',
  },
  iconLeft: {
    marginRight: wp('2%'),
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0, // Reset default padding
  },
  clearButton: {
    padding: wp('1.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
