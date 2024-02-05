const config = {
   attachement: true,
   videoDuaration: 40,
   audioDuaration: 60,
   fileSize: 50,
   imageFileSize: 10,
   videoFileSize: 30,
   audioFileSize: 30,
   documentFileSize: 20,
   maxAllowedMediaCount: 5,
   maximumAllowedUsersToForward: 5,
   maximumCharForwardPopUp: 60,
   internetErrorMessage: 'Please check your Internet connection',
   reportMembers: 5,
   GOOGLE_LOCATION_API_KEY: 'AIzaSyBaKkrQnLT4nacpKblIE5d4QK6GpaX5luQ', // NOSONAR
   typingStatusGoneWaitTime: 500,
   // Dev environment variables
   // API_URL: 'https://api-uikit-dev.contus.us/api/v1',
   // lisenceKey: '2sdgNtr3sFBSM3bYRa7RKDPEiB38Xo',
   // =====================================
   // QA Environment variables
   API_URL: 'https://api-uikit-qa.contus.us/api/v1',
   lisenceKey: 'ckIjaccWBoMNvxdbql8LJ2dmKqT5bp',
   // =====================================
   // UAT Environment variables
   // API_URL: 'https://api-uikit-uat.contus.us/api/v1',
   // lisenceKey: 'lu3Om85JYSghcsB6vgVoSgTlSQArL5',
};
export default config;
