import React from 'react';
import { StyleSheet, Text, TextInput, View, TextInputProps } from 'react-native';
import { useController, UseControllerProps } from 'react-hook-form';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '../../theme';

interface Props extends TextInputProps {
  label: string;
  name: string;
  rules?: UseControllerProps['rules'];
  defaultValue?: string;
  accessibilityHint?: string;
}

export const FormInput: React.FC<Props> = ({
  label,
  name,
  rules,
  defaultValue = '',
  style,
  placeholderTextColor,
  accessibilityHint,
  ...textInputProps
}) => {
  const { colors, typography } = useTheme();
  const { field, fieldState } = useController({
    name,
    rules,
    defaultValue,
  });

  const hasError = !!fieldState.error;

  return (
    <View style={[styles.container, { marginBottom: hp('2%') }]}>
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: hp('0.5%') }]}>
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: hasError ? colors.error : colors.border,
            padding: hp('1.5%'),
          },
          style,
        ]}
        value={field.value}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        placeholderTextColor={placeholderTextColor || colors.textSecondary}
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        {...textInputProps}
      />
      {hasError && (
        <Text
          style={[typography.caption, { color: colors.error, marginTop: hp('0.5%') }]}
          accessibilityRole="alert">
          {fieldState.error?.message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp('90%'),
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
});
