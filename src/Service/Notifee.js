import notifee, { AndroidStyle } from '@notifee/react-native';

export const triggerNotification = async () => {
  const channelId = 'your_channel_id'; // Replace with your channel ID

  notifee.displayNotification({
    title: 'Sarah Lane',
    body: 'Great thanks, food later?',
    android: {
      channelId,
      style: {
        type: AndroidStyle.MESSAGING,
        person: {
          name: 'John Doe',
          icon: 'https://my-cdn.com/avatars/123.png',
        },
        messages: [
          {
            text: 'Hey, how are you?',
            timestamp: Date.now() - 600000, // 10 minutes ago
          },
          {
            text: 'Great thanks, food later?',
            timestamp: Date.now(), // Now
            person: {
              name: 'Sarah Lane',
              icon: 'https://my-cdn.com/avatars/567.png',
            },
          },
        ],
      },
    },
  });
};
