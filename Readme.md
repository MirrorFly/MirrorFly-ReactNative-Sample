### UI Kit for React-Native

Mirrorfly UIKit Sdk is a set of prebuilt UI components that allows you to easily integrate an in-app chat with all the essential messaging features.

### Requirements

The requirements for chat SDK for React-Native App are:

- React Version 16.0 or above
- Node Version v14.17.4 or above

### Things to be Noted Before Making a Start

#### SDK License Key

> Before integrating CONTUS MirrorFly Chat SDK, you need to have a SDK license key for your MirrorFly application. This SDK needs to be authenticated by the MirrorFly server using the license key for further processing.

Follow the below steps to get your license key:

**Step 1:** Let’s Create an Account - Sign up into MirrorFly Console page (https://console.mirrorfly.com/register) for free MirrorFly account

**Step 2:** Create an account with your basic details including your name, organization details, work email, and contact number

**Step 3:** Once you’re in! You get access to your MirrorFly account ‘Overview page’ where you can find a license key.

**Step 4:** You can copy the license key from the ‘Application info’ section

### Integrate the Chat SDK

> Install mirrorfly-uikit-react-native (https://www.npmjs.com/package/mirrorfly-uikit-react-native) npm package by terminal command 'npm i mirrorfly-uikit-react-native'. Now the node_modules will have a mirrorfly-uikit-react-native folder and package.json is added with the mirrorfly-uikit-react-native dependency.

**Step 1:** Create a new React project or Open an existing project.

**Step 2:** Open terminal and install mirrorfly-uikit-react-native with npm command 'npm i mirrorfly-uikit-react-native' and check package.json whether the dependency is added with mirrorfly-uikit-react-native as mentioned below.

```jsx
"dependencies": {
 "mirrorfly-uikit-react-native": "^1.0.6",
 "react": "^16.0.0",
 }
```

>**Note :** Please refer the doc for more info about installation (https://www.mirrorfly.com/docs/uikit/reactnative/quick-start/)

**Step 3:** Import ChatApp component from the mirrorfly-uikit-react-native package in node modules.

```jsx
import { ChatApp, mirrorflyInitialize} from 'mirrorfly-uikit-react-native';
function App() {

  const API_URL = '****************';
  const LICENSE_KEY = '************';

  React.useEffect(() => {
    (async () => {
      await mirrorflyInitialize({
        apiBaseUrl: API_URL,
        licenseKey: LICENSE_KEY,
        isSandbox: true,
        callBack: res => {
          console.log(res);
        },
      });
    })();
  }, []);

  return (
    <>
       <ChatApp />
    </>
  );
}
export default App;
