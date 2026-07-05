import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View, TouchableOpacity, TextInputProps} from 'react-native';
import {useController, UseControllerProps} from 'react-hook-form';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useTheme} from '../../Utils/themeIndex';

interface Props extends TextInputProps {
  label: string;
  name: string;
  rules?: UseControllerProps['rules'];
  defaultValue?: string;
  accessibilityHint?: string;
}

export const FormPasswordInput: React.FC<Props> = ({
  label,
  name,
  rules,
  defaultValue = '',
  style,
  placeholderTextColor,
  accessibilityHint,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const {colors, typography} = useTheme();
  const [secure, setSecure] = useState(true);
  const [isFocused, setIsFocused] = React.useState(false);
  const {field, fieldState} = useController({
    name,
    rules,
    defaultValue,
  });

  const hasError = !!fieldState.error;

  return (
    <View style={[styles.container, {marginBottom: hp('2%')}]}>
      <Text style={[typography.caption, {color: colors.textSecondary, marginBottom: hp('0.5%')}]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: hasError ? colors.error : isFocused ? colors.primary : colors.border,
            borderWidth: isFocused ? 1.5 : 1,
          },
        ]}>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              paddingHorizontal: wp('4%'),
            },
            style,
          ]}
          value={field.value}
          onChangeText={field.onChange}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            field.onBlur();
            if (onBlur) onBlur(e);
          }}
          secureTextEntry={secure}
          placeholderTextColor={placeholderTextColor || colors.textSecondary}
          accessibilityLabel={label}
          accessibilityHint={accessibilityHint || 'Toggles visible password characters.'}
          {...textInputProps}
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setSecure(!secure)}
          accessibilityRole="checkbox"
          accessibilityLabel="Show password"
          accessibilityState={{checked: !secure}}
          activeOpacity={0.7}>
          <Text style={[typography.caption, {color: colors.primary, fontWeight: '700'}]}>
            {secure ? 'SHOW' : 'HIDE'}
          </Text>
        </TouchableOpacity>
      </View>
      {hasError && (
        <Text
          style={[typography.caption, {color: colors.error, marginTop: hp('0.5%')}]}
          accessibilityRole="alert">
          {fieldState.error?.message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: hp('5.8%'),
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  toggleButton: {
    paddingHorizontal: wp('4%'),
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
});
