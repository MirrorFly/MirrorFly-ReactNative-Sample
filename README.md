### UI Kit for React-Native

Mirrorfly UIKit Sdk is a set of prebuilt UI components that allows you to easily integrate an in-app chat with all the essential messaging features.

### Requirements

The requirements for chat SDK for React-Native App are:

-  React Version 18.3.1 or above
-  Node Version v18.20.8 or above

### Things to be Noted Before Making a Start

#### SDK License Key

> Before integrating CONTUS MirrorFly Chat SDK, you need to have a SDK license key for your MirrorFly application. This SDK needs to be authenticated by the MirrorFly server using the license key for further processing.

Follow the below steps to get your license key:

**Step 1:** Let’s Create an Account - Sign up into MirrorFly Console page (https://console.mirrorfly.com/register) for free MirrorFly account

**Step 2:** Create an account with your basic details including your name, organization details, work email, and contact number

**Step 3:** Once you’re in! You get access to your MirrorFly account ‘Overview page’ where you can find a license key.

**Step 4:** You can copy the license key from the ‘Application info’ section

**Step 4:** To run this sample app use first install the dependacy `npm i --legacy-peer-deps`

**Step 5:** In this file `/src/config/config.js`, please update the API_URL and licenseKey  

```jsx
    GOOGLE_LOCATION_API_KEY: '*******************', // Please update with a valid Google Location API Key
    API_URL: 'https://console.mirrorfly.com/', // Please update with the valid API_URL, obtained from the MirrorFly console
    licenseKey: '*******************', // Please update with the valid licenseKey, obtained from the MirrorFly console

```

**Step 6:** Then run the application using the command `npm start -- --reset-cache` 

**Step 7:** To integrate the sample app `src` folder with your existing application please follow the upcoming steps

> **Note :** Please refer the doc for more info about installation (https://www.mirrorfly.com/docs/uikit/reactnative/quick-start/)

**Step 8:** In root indes.js file please intialize the mirrorfly SDK using as follows,

```js
import config from './src/config/config';
import { mirrorflyInitialize, setupCallScreen } from './src/uikitMethods';


mirrorflyInitialize({
   apiBaseUrl: config.API_URL,
   licenseKey: config.licenseKey,
   isSandbox: false, // Based on your license key if you trail user please update this with true
});

setupCallScreen();

```

```jsx
import React from 'react';
import { Platform } from 'react-native';
import { MirrorflyComponent } from './src';

function App() {
   return <MirrorflyComponent />;
}

export default App;
```
