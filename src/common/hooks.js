import NetInfo from '@react-native-community/netinfo';
import React from 'react';
import { AppState } from 'react-native';
import SDK from '../SDK/SDK';

let networkState = null;
NetInfo.addEventListener(state => {
   networkState = state;
});

const initialState = {
   isLoading: false,
   imageUrl: '',
   authToken: '',
};

/**
 * @typedef {Object} ImageData
 * @property {boolean} isLoading
 * @property {string} imageUrl
 * @property {string} authToken
 */

/**
 * A Custom hook to get the complete image URL from SDK and fetch and return the image base64 data
 * @param {string} imageToken
 * @returns {ImageData}
 */
export const useFetchImage = imageToken => {
   const [state, setState] = React.useState({
      ...initialState,
      isLoading: Boolean(imageToken),
   });

   React.useEffect(() => {
      getMediaURL();
   }, [imageToken]);

   const getMediaURL = async () => {
      if (!imageToken) {
         if (state.authToken !== initialState.authToken && state.imageUrl !== initialState.imageUrl) {
            setState({ ...initialState });
         }
         return;
      }
      const { data: imageData = {}, statusCode } = await SDK.getMediaURL(imageToken);
      if (statusCode === 200) {
         const { fileUrl, token } = imageData;
         setState({
            isLoading: false,
            imageUrl: fileUrl,
            authToken: token,
         });
      } else {
         setState({ ...initialState });
      }
   };

   return state;
};

export const getNetworkState = () => networkState;

export const useNetworkStatus = () => {
   const [isConnected, setIsConnected] = React.useState(networkState?.isInternetReachable || null);

   React.useLayoutEffect(() => {
      const unsubscribe = NetInfo.addEventListener(state => {
         setIsConnected(state.isInternetReachable);
      });

      return () => {
         unsubscribe();
      };
   }, []);

   return isConnected;
};

export const useAppState = () => {
   const [isActive, setIsActive] = React.useState(null);

   React.useEffect(() => {
      AppState.addEventListener('change', nextAppState => {
         if (nextAppState === 'active') {
            setIsActive(true);
         } else {
            setIsActive(false);
         }
      });
   }, []);

   return isActive;
};
