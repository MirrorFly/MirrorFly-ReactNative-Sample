<p style="text-align: center;">
  <img  src="https://dasa7d6hxd0bp.cloudfront.net/images/mirrorfly.webp" data-canonical-src="https://dasa7d6hxd0bp.cloudfront.net/images/mirrorfly.webp" width="400"  alt=""/>
</p>

<h1 style="text-align: center">
Build Platform-specific Apps With Custom React Native Video & Chat SDK
</h1>

<b>MirrorFly’s React Native Sample App</b> is the easiest way to build messaging platforms. You’ll use the pre-built sample app, integrate the React Native Chat SDK, and launch a fully-functional messaging app for any platform you prefer. 

React Native is highly flexible and extensible. You can use MirrorFly’s own sample app to build any Android or iOS app with 1000s of real-time communication capabilities. The React native chat SDK is low-code, enabling easy integration and launch in less than 20 mins. Plus, the performance is faster when compared to apps as the SDK is carefully designed with minimal codes.

# ⚒️ Key Product Offerings

MirrorFly’s React Native SDK allows you to add the following capabilities to your platform. 

💬 [Enterprise Instant Messaging](https://www.mirrorfly.com/enterprise-collaboration-software.php) - Secure real-time communication across organizations.

 🎯 [HD Group Video Calling](https://www.mirrorfly.com/video-conferencing-api.php)- High-definition Group video calling for face to face conversations.

 🦾 [SIP/ VoIP Calling](https://www.mirrorfly.com/sip-voip-solution.php) - Enable instant communication on IP-based phone lines.
 
 🦾 [Live Streaming](https://www.mirrorfly.com/live-streaming-sdk.php) - Broadcasting functionality to take content to millions of audience.

 You can also add 1000+ real-time communication capabilities. Check out our other 
 offerings [here](https://www.mirrorfly.com/chat-features.php) 
 
# ☁️ Deployment Models - Self-hosted and Cloud

 MirrorFly offers full freedom with the hosting options:
 
 </br>

 - Self-hosted: Host your React Native client on your own data centers, private cloud servers or third-party servers.

 [Check out our multi-tenant cloud hosting](https://www.mirrorfly.com/self-hosted-chat-solution.php)

 - Cloud: Deploy your React Native client platform on MirrorFly’s multi-tenant cloud servers. 

[Check out our multi-tenant cloud hosting](https://www.mirrorfly.com/multi-tenant-chat-for-saas.php)
 </br>
# 📱 Mobile Client
MirrorFly offers a fully-built client <b>SafeTalk</b> that is available in:

<a href="https://play.google.com/store/apps/details?id=com.mirrorfly&hl=en"><img src="./GetItOnGooglePlay_Badge_Web_color_English.png" alt="image" width="140" height="auto"></a>  &nbsp;   [![appstore](./Download_on_the_App_Store_Badge_US-UK_RGB_blk_092917.svg)](https://apps.apple.com/app/safetalk/id1442769177)

You can use this client as a messaging app, or customize, rebrand & white-label it as your chat client.

# ⚙️ Requirements
For MirrorFly React Native, ensure you install the following dependencies:

<ul>
<li><b>Node:</b> 14.20.0 </li>
<li><b>npm:</b> 6.14.10 </li>
<li><b>React Native:</b> 0.69.12 or higher</li>
</ul>


# 📥Integrate the Chat SDK

<b>[Video](https://www.youtube.com/watch?v=TL7RTm6g0Ek)</b>

<b>Step 1:</b> Update package.json
Ensure all dependencies in your <b>package.json</b> file are up-to-date. You can use:

```react
npm install
```
or for specific updates:

```react
npm update
```

<b>Step 2: Check for Duplicates (For iOS Issues)</b>

Look for duplicate packages that might cause conflicts, especially for iOS. Run:

```react
npm ls | grep 'package-name'
```
If duplicates are found, remove or consolidate them to avoid version conflicts.

<b>Step 3:</b> Install Mirrorfly SDK in your App

```react
npm i mirrorfly-reactnative-sdk
```
<b>Step 4:</b> Import the SDK. In the file where you want to use the MirrorFly SDK, add the import statement at the top:
```react
import { SDK } from "mirrorfly-reactnative-sdk";
```
# 🛠️ Setting Up NPM Dependencies for Chat SDK Integration

```react

{
   
    "react-native-get-random-values": "1.7.1",//must use version >=1.7.1
    'realm': "^10.8.0" <= "^11.9.0",
    'react-native-fs':  "^2.18.0",
    '@react-native-community/netinfo': "^8.0.0",
    'moment': "2.29.4",
    'react-native-compressor': "1.6.1",
    'react-native-convert-ph-asset': "^1.0.3",
    "react-native-create-thumbnail": "^1.6.4",
    //add the below calls related dependencies
    "react-native-webrtc": "118.0.5", // must use version "118.0.5"
    "react-native-background-timer": "2.*.*"
  }


```
# ▶️ Initialize Chat SDK
To start initializing the chat SDK, you need data that handles connection status changes in the client's app.

Paste the license key into the <b>license key</b> parameter and use the method below to pass this data to the SDK.

In your App file (e.g., App.tsx or App.js), import the SDK and call the <b>initializeSDK</b> function with the required parameters.

```react
const initializeObj = {
  apiBaseUrl: `API_URL`,
  licenseKey: `LICENSE_KEY`,
  isTrialLicenseKey: `TRIAL_MODE`,
  callbackListeners: {},
  };
await SDK.initializeSDK(initializeObj);
```
# 📝Register User

<b>Step 1</b>

Use the method below to register a new user.

<b>Step 2</b>

After registration, you'll receive a username and password. Use these credentials to <b>connect</b> to the server with the connect method.

```react
await SDK.register(`USER_IDENTIFIER`);
```
# 🛜Connect to MirrorFly Server

<b>Step 1 </b></br>
Use the registration credentials to connect to the server.

<b>Step 2</b></br>
Upon a successful connection, you’ll receive an approval message with a status code of 200. If there’s an issue, you’ll encounter an execution error.

<b>Step 3</b></br>
You can track the connection status through the connectionListener callback function.

<b>Step 4</b></br>
If an error occurs during the connection, you’ll receive an error message via the callback.

```react
await SDK.connect(`USERNAME`, `PASSWORD`);
```

# ⏩Send a Message
Finally, use the method below to send a message to another user
```react
await SDK.sendTextMessage(`TO_USER_JID`, `MESSAGE_BODY`,`MESSAGE_ID`,`REPLY_TO`);
```
# ⏪ Receive a Message

To receive messages from another user, implement the messageListener function. This function will be triggered whenever you receive a new message or related event in one-to-one or group chats. Additionally, include the callback method below during the SDK initialization process.

```react
function messageListener(response) {
  console.log("Message Listener", response);
}
```

# 🤹Add More Capabilities
To add additional capabilities like group chat, recent chat and push notifications, follow the steps demonstrated in our [official documentation.](https://www.mirrorfly.com/docs/chat/reactnative/quick-start/)

# 🤝Getting Help
If you need any further help with our React Native Sample App, check out our resources


- [React Native API](https://www.mirrorfly.com/react-native-chat-sdk.php)


- [React Native Tutorial](https://www.mirrorfly.com/tutorials/react-native-chat-app.php)

- [React Native Docs](https://www.mirrorfly.com/docs/chat/reactnative/quick-start/)

- [Developer Portal](https://www.mirrorfly.com/docs/)

If you need any help in resolving any issues or have questions, Drop a mail to <b>integration@contus.in</b>


# 📚 Learn More

●	[Developer Documentation](https://www.mirrorfly.com/docs/)

●	[Product Tutorials](https://www.mirrorfly.com/tutorials/)

●	[Pubdev Documentation](https://pub.dev/packages/mirrorfly_plugin)

●	[Npmjs Documentation](https://www.npmjs.com/~contus)

●	[On-premise Deployment](https://www.mirrorfly.com/on-premises-chat-server.php) 

●	[See who's using MirrorFly](https://www.mirrorfly.com/chat-use-cases.php)

# 🧑‍💻 Hire Experts
Looking for a tech team to develop your enterprise app in React Native? [Hire a team of seasoned professionals](https://www.mirrorfly.com/hire-video-chat-developer.php) who manage the entire process from concept to launch. We’ll deliver a high-quality app, expertly crafted and ready for launch.

# ⏱️ Round-the-clock Support
If you’d like to take help when working with our solution, feel free to [contact our experts](https://www.mirrorfly.com/contact-sales.php) who will be available to help you anytime of the day or night. 

# 💼 Become a Part of our amazing team

We're always on the lookout for talented developers, support specialists, and product managers. Visit our [careers page](https://www.contus.com/careers.php) to explore current opportunities.

# 🗞️ Get the Latest Updates

●	[Blog](https://www.mirrorfly.com/blog/)

●	[Facebook](https://www.facebook.com/MirrorFlyofficial/)

●	[Twitter](https://twitter.com/mirrorflyteam)

●	[LinkedIn](https://www.linkedin.com/showcase/mirrorfly-official/)

●	[Youtube](https://www.linkedin.com/showcase/mirrorfly-official/)

●	[Instagram](https://www.instagram.com/mirrorflyofficial/)