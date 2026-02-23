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
        <ActivityIndicator size="small" color={variant === 'outline' ? '#380964' : '#fff'} />
      ) : (
        <Text style={[textColorStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#380964', // default primary color
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#380964',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  outlineText: {
    color: '#380964',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0', // gray when disabled/loading
  },
});
