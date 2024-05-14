import { CommonActions, StackActions, createNavigationContainerRef } from '@react-navigation/native';
import { RECENTCHATSCREEN } from '../constant';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
   if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
   }
}

export function goBack() {
   if (navigationRef.isReady()) {
      navigationRef.goBack();
   }
}

export function reset(name) {
   if (navigationRef.isReady()) {
      navigationRef.reset({
         index: 0,
         routes: [{ name: name }],
      });
   }
}

export const getCurrentScreen = () => {
   if (navigationRef.isReady()) {
      return navigationRef.getState().routes[navigationRef.getState().routes.length - 1].name;
   }
};

export const popToTop = () => {
   navigationRef.dispatch(StackActions.popToTop());
};

export const popToRecentChatScreen = () => {
   navigationRef.dispatch(
      CommonActions.reset({
         index: 0,
         routes: [{ name: RECENTCHATSCREEN }],
      }),
   );
};
