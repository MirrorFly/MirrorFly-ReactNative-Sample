import notifee from '@notifee/react-native';

class PushNotify {
  static displayRemoteNotification = async (title, data, body) => {
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
    await notifee.requestPermission();
    // Display a notification
    await notifee.displayNotification({
      id: '123',
      title: title,
      body: body,
      data: data ? data : null,
      android: {
        channelId,
      },
    });
  };
}

export default PushNotify;
