import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView } from 'react-native';
import StackNavigationPage from './Navigation/StackNavigation';
import { navigationRef } from './Navigation/rootNavigation';
import ApplicationColors from './config/appColors';
import {
   ARCHIVED_SCREEN,
   CONVERSATION_STACK,
   COUNTRY_LIST_SCREEN,
   PROFILE_SCREEN,
   RECENTCHATSCREEN,
   REGISTERSCREEN,
   SETTINGS_STACK,
   USERS_LIST_SCREEN,
} from './screens/constants';
import { getAppSchema } from './uikitMethods';

const linking = {
   prefixes: [getAppSchema()],
   config: {
      screens: {
         [REGISTERSCREEN]: REGISTERSCREEN,
         [PROFILE_SCREEN]: PROFILE_SCREEN,
         [CONVERSATION_STACK]: CONVERSATION_STACK,
         [RECENTCHATSCREEN]: RECENTCHATSCREEN,
         [COUNTRY_LIST_SCREEN]: COUNTRY_LIST_SCREEN,
         [USERS_LIST_SCREEN]: USERS_LIST_SCREEN,
         [SETTINGS_STACK]: SETTINGS_STACK,
         [ARCHIVED_SCREEN]: ARCHIVED_SCREEN,
      },
   },
};

export function MirrorflyChatComponent() {
   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: ApplicationColors.headerBg }}>
         <NavigationContainer linking={linking} independent={true} ref={navigationRef}>
            <StackNavigationPage />
         </NavigationContainer>
      </SafeAreaView>
   );
}
