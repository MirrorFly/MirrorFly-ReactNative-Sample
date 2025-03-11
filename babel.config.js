module.exports = api => {
   const babelEnv = api.env();
   const plugins = ['react-native-reanimated/plugin'];
   if (babelEnv !== 'development') {
      plugins.push(['transform-remove-console']);
   }
   return {
      // presets: [
      //    [
      //       '@babel/preset-env',
      //       {
      //          targets: 'last 2 versions, > 1%, not dead',
      //       },
      //    ],
      //    '@babel/preset-react',
      //    '@babel/preset-flow',
      // ],
      presets: ['module:@react-native/babel-preset'],
      plugins,
   };
};
