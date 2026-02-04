<p align="center">
  <img  src="https://dasa7d6hxd0bp.cloudfront.net/images/mirrorfly.webp" data-canonical-src="https://dasa7d6hxd0bp.cloudfront.net/images/mirrorfly.webp" width="400"  alt=""/>
</p>

# **MirrorFly React Native SDK For Video Chat & Calls**

## Introduction

This repository walks you through the steps to install and initialize SDK into your React Native app. When implementing pre-built messaging and calls on the client-side the effort is minimal and customizable with MirrorFly white-label SDK. This read.me file provides the libraries, dependencies, supplementary features and installation steps.

# **🤹 Key Product Offerings** 

MirrorFly helps build omni-channel communication apps for any kind of business

**💬 [In-app Messaging](https://www.mirrorfly.com/chat-api-solution.php)** - Connect users individually or as groups via instant messaging features.  
**🎯 [HD Video Calling](https://www.mirrorfly.com/video-call-solution.php)**- Engage users over face-to-face conversations anytime, and from anywhere.   
**🦾 [HQ Voice Calling](https://www.mirrorfly.com/voice-call-solution.php)** - Deliver crystal clear audio calling experiences with latency as low as 3ms.   
🤖 [**AI Voice Agent**](https://www.mirrorfly.com/conversational-ai/voice-agent/) - Build custom AI voicebots that can understand, act and respond to user questions.   
**🤖 [AI Chatbot](https://www.mirrorfly.com/conversational-ai/chatbot/)** - Deploy white-label AI chatbots that drive autonomous conversations across any web or mobile app.  
**🦾 [Live Streaming](https://www.mirrorfly.com/live-streaming-sdk.php)** - Broadcast video content to millions of viewers around the world, within your own enterprise app. 

### **⚒️React Native SDK For Android & iOS**

### [**Requirements**](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#requirements)

The requirements for chat SDK for React Native Mobile App are:

* React-Native >= 0.73.0 <=0.79.5  
* Node Version >= 18.20.4  
* npm - 10.7.0

**iOS**

You control the React Native New Architecture setting through the Podfile by defining an environment variable. Set the value to '1' to enable the New Architecture or '0' to disable it:

```txt
ENV['RCT_NEW_ARCH_ENABLED'] = '0'  # Use '1' to enable, '0' to disable
```

When CocoaPods runs, it reads this environment variable and configures the native build to use either the Fabric renderer and TurboModules (enabled) or the classic architecture (disabled).

**Android**

On Android, you toggle the same feature in the gradle.properties file. Set the flag to true to enable the New Architecture or to false to disable it:

```txt
newArchEnabled=false  # Use 'true' to enable, 'false' to disable
```

Gradle reads this property during configuration, and React Native’s build scripts adjust the native modules and rendering pipeline accordingly.


### [**Getting Started**](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#things-to-be-noted-before-you-get-started)

Step 1: Register [here](https://www.mirrorfly.com/contact-sales.php) to get a MirrorFly User account.  
Step 2: [Login](https://console.mirrorfly.com/) to your Account  
Step 3: Get the License key from the application Info’ section  


<img  src="https://www.mirrorfly.com/docs/assets/images/license-key-a1173e922ebff14b6ae1a2428f822eec.png" data-canonical-src="https://www.mirrorfly.com/docs/assets/images/license-key-a1173e922ebff14b6ae1a2428f822eec.png" width="100%"  alt=""/>
  
# **Real-time Chat Integration**

## [Integrate the Chat SDK](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#integrate-the-chat-sdk)

**Step 1:** Update all your packages.json files.  
**Step 2:** Check your package files for any duplicates if the app isn’t working on iOS.

#### [**Integrate Using Npm package**](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#integrate-using-npm-package)

Step 3: Install MirrorFly SDK in your React Native app.

```bash
npm i mirrorfly-reactnative-sdk@2.4.1
```

Step 4: Import the SDK into your application where you want

```js
import { SDK } from "mirrorfly-reactnative-sdk";
```

## [NPM Package Addition](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#adding-npm-package-dependencies-to-integrate-the-chat-sdk)

```json
{
  "@react-native-community/netinfo": "^11.4.1",
  "react-native-get-random-values": "1.11.0",
  "realm": "^20.1.0",
  "react-native-fs": "^2.20.0",
  "moment": "2.30.1",
  "react-native-webrtc": "124.0.4",
  "react-native-background-timer": "^2.4.1",
  "react-native-permissions": "^5.2.1"
}
```

## [React Native Messaging SDK Initialization](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#initialize-the-react-native-messaging-sdk)

Before you initialize the real-time React Native Chat SDK, make sure you have the data that tracks changes in the client app’s connection status.

Paste your license key into the licensekey parameter, then use the method below to pass this data to the SDK for processing.
In your app file (e.g., App.tsx or App.js), import the SDK and call the initializeSDK function with the required parameters.



```js
const initializeObj = {
  apiBaseUrl: `API_URL`,
  licenseKey: `LICENSE_KEY`,
  isTrialLicenseKey: `TRIAL_MODE`,
  callbackListeners: {},
};
await SDK.initializeSDK(initializeObj);
```

### [**Sandbox Details**](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#sandbox-details)

<img  src="https://www.mirrorfly.com/docs/assets/images/license-key-a1173e922ebff14b6ae1a2428f822eec.png" data-canonical-src="https://www.mirrorfly.com/docs/assets/images/license-key-a1173e922ebff14b6ae1a2428f822eec.png" width="100%"  alt=""/>

```js
function connectionListener(response) {
  if (response.status === "CONNECTED") {
    console.log("Connection Established");
  } else if (response.status === "DISCONNECTED") {
    console.log("Disconnected");
  }
}

const initializeObj = {
  apiBaseUrl: "https://api-preprod-sandbox.mirrorfly.com/api/v1",
  licenseKey: "XXXXXXXXXXXXXXXXX",
  isTrialLicenseKey: true,
  callbackListeners: {
    connectionListener
  },
};

await SDK.initializeSDK(initializeObj);
```

#### [**Example Response**](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#example-response)

```json
{
  "statusCode": 200,
  "message": "Success"
}
```

### [**Device ID Module**](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#device-id-module)

[Download](https://s3.ap-south-1.amazonaws.com/app.mirrorfly.com/rn_device_id_dependency.zip)


Step 1: Download the Android files from the link above, locate the required files, and copy them into the android/app/src/main/java/com directory.

Step 2: Download the iOS files from the link above, locate the required files, and add them to your project in Xcode using Add Files to [Your Project]. Then follow the steps below.



## [Register User](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#register-user)

```js
const registerObject = {
  userIdentifier,
  fcmtoken,
  voipDeviceToken,
  mode,
  registerMetaData,
  forceRegister,
};

await SDK.register(registerObject);
```

#### [**Sample Response:**](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#sample-response)

```json
{
  statusCode: 200,
  message: "Success",
  data: {
    username: "123456789",
    password: "987654321"
  }
}
```

## [Connect to MirrorFly Server](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#connect-to-mirrorfly-server)

```js
await SDK.connect(`USERNAME`, `PASSWORD`);
```

#### [**Sample Response:**](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#sample-response-1)

```json
{
  message: "Login Success",
  statusCode: 200
}
```

## [Send a Message](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#send-a-message)

```js
await SDK.sendTextMessage(`TO_USER_JID`, `MESSAGE_BODY`, `MESSAGE_ID`, `REPLY_TO`);
```

## [Receive a Message](https://www.mirrorfly.com/docs/chat/reactnative/quick-start#receive-a-message)

```js
function messageListener(response) {
  console.log("Message Listener", response);
}
```

# **Voice & Video Calling Integration**

## [Make a voice call](https://www.mirrorfly.com/docs/audio-video/reactnative/making-a-call#make-a-voice-call)

```js
await SDK.makeVoiceCall(['USER1_JID']);
```

### [**Make a video call**](https://www.mirrorfly.com/docs/audio-video/reactnative/making-a-call#make-a-video-call)

```js
await SDK.makeVideoCall(['USER1_JID']);
```

### [**Answer a call**](https://www.mirrorfly.com/docs/audio-video/reactnative/making-a-call#answer-a-call)

```js
await SDK.answerCall();
```

### [**End a call**](https://www.mirrorfly.com/docs/audio-video/reactnative/making-a-call#end-a-call)

```js
await SDK.endCall();
```

### [**Decline a call**](https://www.mirrorfly.com/docs/audio-video/reactnative/making-a-call#decline-a-call)

```js
await SDK.declineCall();
```

# **☁️ Deployment Models - Self-hosted and Cloud**

MirrorFly offers full freedom with the hosting options:  

**Self-hosted:** Deploy your client on your own data centers, private cloud or third-party servers.  
[Check out our multi-tenant cloud hosting](https://www.mirrorfly.com/self-hosted-chat-solution.php)  

**Cloud:** Host your client on MirrorFly’s multi-tenant cloud servers.   
[Check out our multi-tenant cloud hosting](https://www.mirrorfly.com/multi-tenant-chat-for-saas.php)

## Mobile Client

MirrorFly offers a fully-built client SafeTalk that is available in:
- iOS
- Android


# **📚 Learn More**

* [Developer Documentation](https://www.mirrorfly.com/docs/chat/reactnative/quick-start/)  
* [MirrorFly React Native Solution](https://www.mirrorfly.com/react-native-chat-sdk.php)   
* [MirrorFly React Native Sample App](https://github.com/MirrorFly/MirrorFly-ReactNative-Sample)  
* [MirrorFly React Native UI Kit](https://www.mirrorfly.com/docs/uikit/web/quick-start/)  
* [Product Tutorials](https://www.mirrorfly.com/tutorials/)  
* [See who's using MirrorFly](https://www.mirrorfly.com/chat-use-cases.php)

# **🧑‍💻 Hire Experts**

Need a tech team to build your enterprise app?  
[Hire a full team of experts](https://www.mirrorfly.com/hire-video-chat-developer.php)

# **⏱️ Round-the-clock Support**

[Contact our experts](https://www.mirrorfly.com/contact-sales.php)

## **💼 Become a Part of our amazing team**

[Careers Page](https://www.contus.com/careers.php)

## **🗞️ Get the Latest Updates**

* [Blog](https://www.mirrorfly.com/blog/)  
* [Facebook](https://www.facebook.com/MirrorFlyofficial/)  
* [Twitter](https://twitter.com/mirrorflyteam)  
* [LinkedIn](https://www.linkedin.com/showcase/mirrorfly-official/)  
* [Youtube](https://www.youtube.com/@mirrorflyofficial)  
* [Instagram](https://www.instagram.com/mirrorflyofficial/)

