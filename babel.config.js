module.exports = () => {
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: ['transform-remove-console'],
  };
};
