import { StackActions, createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

const RootNavigation = {
   navigate(name, params) {
      if (navigationRef.isReady()) {
         navigationRef.navigate(name, params);
      }
   },

   goBack() {
      if (navigationRef.isReady()) {
         navigationRef.goBack();
      }
   },

   reset(name, params) {
      if (navigationRef.isReady()) {
         navigationRef.reset({
            index: 0,
            routes: [{ name: name, params: params }],
         });
      }
   },

   getCurrentScreen() {
      if (navigationRef.isReady()) {
         return navigationRef.getState().routes[navigationRef.getState().routes.length - 1].name;
      }
   },

   popToTop() {
      navigationRef.dispatch(StackActions.popToTop());
   },
};

export default RootNavigation;
