import { CommonActions, StackActions, createNavigationContainerRef } from '@react-navigation/native';

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
            console.log('route.state ==>', routes);
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

   /**
    * Reset the navigation stack while removing specific screens
    * @param {object} navigation - Navigation object
    * @param {string} targetScreen - Screen to navigate to
    * @param {object} params - Parameters for the target screen (optional)
    * @param {array} screensToRemove - Screens to be removed from stack
    */
   resetNavigationStack(navigation, targetScreen, params = {}, screensToRemove = []) {
      if (!navigation || !targetScreen) {
         return;
      }

      const updatedRoutes = navigation
         .getState()
         .routes.filter(route => !screensToRemove.includes(route.name)) // Remove specified screens
         .concat([{ name: targetScreen, params }]); // Add target screen

      navigation.dispatch(
         CommonActions.reset({
            index: updatedRoutes.length - 1, // Set last screen as active
            routes: updatedRoutes,
         }),
      );
   },

   popToTop() {
      navigationRef.dispatch(StackActions.popToTop());
   },
};

export default RootNavigation;
