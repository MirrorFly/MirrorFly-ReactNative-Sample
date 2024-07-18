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
         const findCurrentRoute = routes => {
            const route = routes[routes.length - 1];
            if (route.state) {
               // Recursively find the current route in nested navigators
               return findCurrentRoute(route.state.routes);
            }
            return route.name;
         };

         const state = navigationRef.getState();
         return findCurrentRoute(state.routes);
      }
   },

   popToTop() {
      navigationRef.dispatch(StackActions.popToTop());
   },
};

export default RootNavigation;
