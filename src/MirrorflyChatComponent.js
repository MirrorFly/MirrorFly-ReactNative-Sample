import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Linking, SafeAreaView, StatusBar, Text, View } from 'react-native';
import { navigationRef } from './Navigation/rootNavigation';
import StackNavigationPage from './Navigation/stackNavigation';
import ApplicationColors from './config/appColors';
import {
   ARCHIVED_SCREEN,
   CONVERSATION_SCREEN,
   CONVERSATION_STACK,
   COUNTRY_LIST_SCREEN,
   PROFILE_SCREEN,
   RECENTCHATSCREEN,
   REGISTERSCREEN,
   SETTINGS_STACK,
   USERS_LIST_SCREEN,
} from './screens/constants';
import commonStyles from './styles/commonStyles';
import { getAppInitStatus, getAppSchema } from './uikitMethods';

const linking = {
   prefixes: [getAppSchema()],
   config: {
      screens: {
         [REGISTERSCREEN]: REGISTERSCREEN,
         [PROFILE_SCREEN]: PROFILE_SCREEN,
         [CONVERSATION_STACK]: {
            screens: {
               [CONVERSATION_SCREEN]: CONVERSATION_SCREEN, // This should match the path used in the deep link
            },
         },
         [RECENTCHATSCREEN]: RECENTCHATSCREEN,
         [COUNTRY_LIST_SCREEN]: COUNTRY_LIST_SCREEN,
         [USERS_LIST_SCREEN]: USERS_LIST_SCREEN,
         [SETTINGS_STACK]: SETTINGS_STACK,
         [ARCHIVED_SCREEN]: ARCHIVED_SCREEN,
      },
   },
};

export function MirrorflyChatComponent() {
   React.useEffect(() => {
      const handleDeepLink = ({ url }) => {
         if (url) {
            const route = url.replace(getAppSchema(), '');
            const queryString = route.split('?')[1];
            // Manually parse the query string
            const params = {};
            if (queryString) {
               queryString.split('&').forEach(param => {
                  const [key, value] = param.split('=');
                  params[key] = decodeURIComponent(value);
               });
            }
            const { jid } = params;
            setTimeout(() => {
               navigationRef.current?.navigate(CONVERSATION_STACK, {
                  screen: CONVERSATION_SCREEN,
                  params: { jid },
               });
            }, 10);
         }
      };

      Linking.getInitialURL().then(url => {
         if (url) {
            handleDeepLink({ url });
         }
      });

      const linkingListener = Linking.addEventListener('url', handleDeepLink);

      return () => {
         linkingListener.remove();
      };
   }, []);

   if (!getAppInitStatus()) {
      return (
         <SafeAreaView style={{ flex: 1, backgroundColor: ApplicationColors.headerBg }}>
            <View style={[commonStyles.flex1, commonStyles.justifyContentCenter, commonStyles.alignItemsCenter]}>
               <Text> Mirrorfly Not Initialized</Text>
            </View>
         </SafeAreaView>
      );
   }

   return (
      <>
         <StatusBar animated={true} backgroundColor={'#E5E5E5'} />
         <SafeAreaView style={{ flex: 1, backgroundColor: '#E5E5E5' }}>
            <NavigationContainer linking={linking} independent={true} ref={navigationRef}>
               <StackNavigationPage />
            </NavigationContainer>
         </SafeAreaView>
      </>
   );
}
