import Reactotron from 'reactotron-react-native';

Reactotron.configure() // controls connection & communication settings
   .useReactNative({
      networking: {
         // optionally, you can turn it off with false.
         ignoreUrls: /symbolicate/,
   },
   }) // add all built-in react native plugins
   .connect(); // let's connect!
