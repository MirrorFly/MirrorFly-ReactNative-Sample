import React from 'react';
// eslint-disable-next-line no-unused-vars
import { StyleSheet, TextInput, TextInputProps } from 'react-native'; // NOSONAR
import ApplicationColors from '../config/appColors';

/**
 * @param {TextInputProps} props
 * @returns {TextInput}
 */
const ChatSearchInput = ({ inputRef, onFocus, onBlur, style, ...props }) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const handleFocus = e => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = e => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const calculatedStyle = React.useMemo(() => {
    if (Array.isArray(style)) {
      return [...style, isFocused && styles.focusedInput];
    } else {
      return [style, isFocused && styles.focusedInput];
    }
  }, [style, isFocused]);

  return (
    <TextInput
      ref={inputRef}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={calculatedStyle}
      {...props}
    />
  );
};

export default ChatSearchInput;

const styles = StyleSheet.create({
  focusedInput: {
    borderBottomColor: ApplicationColors.mainColor,
  },
});
