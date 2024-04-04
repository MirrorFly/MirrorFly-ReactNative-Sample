module.exports = api => {
   const babelEnv = api.env();
   const plugins = [];
   if (babelEnv !== 'development') {
      plugins.push(['transform-remove-console']);
   }
   return {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: 'last 2 versions, > 1%, not dead',
          },
        ],
        '@babel/preset-react',
        '@babel/preset-flow',
      ],
      // presets: ['module:metro-react-native-babel-preset'],
      // plugins,
   };
};
