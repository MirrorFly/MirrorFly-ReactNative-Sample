import notifee, { AndroidStyle } from '@notifee/react-native';

// class PushNotify {
//   static displayRemoteNotification = async (title, data, body) => {
//     const channelId = await notifee.createChannel({
//       id: 'default',
//       name: 'Default Channel',
//     });
//     await notifee.requestPermission();
//     // Display a notification
//     await notifee.displayNotification({
//       id: '123',
//       title: title,
//       body: body,
//       data: data ? data : null,
//       android: {
//         channelId,
//       },
//     });
//   };
// }

// export default PushNotify;

export const handleNotifeeNotify = async () => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default name',
  });
  const groupId = await notifee.createChannelGroup({
    id: 'incoming',
    name: 'Default name',
  });
  notifee.displayNotification({
    title: 'Sarah Lane',
    body: 'Great thanks, food later?',
    android: {
      channelId,
      groupId,
      smallIcon: 'ic_notification_blue',
      //   style: {
      //     type: AndroidStyle.MESSAGING,
      //     person: {
      //       name: 'John Doe',
      //       icon: 'https://my-cdn.com/avatars/123.png',
      //     },
      //     messages: [
      //       {
      //         text: 'Hey, how are you?',
      //         timestamp: Date.now() - 600000, // 10 minutes ago
      //       },
      //       {
      //         text: 'Great thanks, food later?',
      //         timestamp: Date.now(), // Now
      //         person: {
      //           name: 'Sarah Lane',
      //           // icon: 'S',
      //         },
      //       },
      //     ],
      //   },
    },
  });
  // notifee.displayNotification({
  //   // title: '<p style="color: #4caf50;"><b>Styled HTMLTitle</span></p></b></p> &#128576;',
  //   // subtitle: '&#129395;',
  //   // body:
  //   //   '<img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" style="width: 20px; height: 20px;" />',
  //   title: 'Title Push notification',
  //   body: 'Title Body sample Notification',
  //   android: {
  //     channelId,
  //     color: '#4caf50',
  //     schedule: {
  //       fireDate: scheduleTime,
  //     },
  //     smallIcon: 'ic_launcher',
  //     largeIcon: require('../assets/BG.png'),
  //   },
  // });
};
