import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import Navigation from './Navigation';
import { callBacks } from './SDKActions/callbacks';
import SDK from './SDK/SDK';

export const ChatApp = () => {
    React.useEffect(() => {
        (async () => {
            await SDK.initializeSDK({
                apiBaseUrl: `https://api-uikit-qa.contus.us/api/v1`,
                licenseKey: `ckIjaccWBoMNvxdbql8LJ2dmKqT5bp`,
                callbackListeners: callBacks,
            });
        })();
    }, [])

    return (
        <Provider store={store}>
            <Navigation />
        </Provider>
    );
}
