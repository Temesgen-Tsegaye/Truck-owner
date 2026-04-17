import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;     // optional container style
  textStyle?: StyleProp<TextStyle>; // optional text style
  variant?: 'primary' | 'outline';
};

export function CustomButton({ title, onPress, loading = false, disabled = false, style, textStyle, variant = 'primary' }: Props) {
  const buttonStyle = variant === 'outline' ? styles.outlineButton : styles.button;
  const textColorStyle = variant === 'outline' ? styles.outlineText : styles.text;
  const spinnerColor = variant === 'outline' ? '#ff642f' : '#161412';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        buttonStyle,
        style,
        (disabled || loading) && styles.disabledButton,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text style={[textColorStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ff642f', // default primary color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 50,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#ff642f',
  },
  text: {
    color: '#161412',
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
  outlineText: {
    color: '#ff642f',
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
  disabledButton: {
    backgroundColor: "rgba(255, 100, 47, 0.4)", // gray when disabled/loading
  },
});
