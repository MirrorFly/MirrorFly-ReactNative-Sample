// import React, { useState } from 'react'
// // import SplashScreen from '../screens/SplashScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import OTPScreen from '../screens/OTPScreen';
// import { View } from 'react-native';
// // import UserListScreen from '../screens/UserListScreen';
// // import { useDispatch, useSelector } from 'react-redux';
// // import { authScreen, connectAgain, notifyHandle } from '../services/auth';
// // import { navigate } from '../redux/screenSlice';
// // import { AppState } from 'react-native';


// function Navigation() {
    
//    // const [isAppLoading, setIsAppLoading] = useState(true)

//     // useEffect(() => {
//     //     async function handleAppStateChange(nextAppState) {
//     //         //         await handleSDKInitialize()
//     //         //         await connectAgain()
//     //         if (nextAppState === 'active') {
//     //             console.log('Foreground')
//     //             await notifyHandle(isConnected)
//     //         }
//     //     }
//     //     AppState.addEventListener('change', handleAppStateChange);
//     // }, [AppState])


//     // useEffect(() => {
//     //     (async () => {
//     //         await authScreen().then(async (res) => {
//     //             console.log(res)
//     //             let x = { screen: res }
//     //             dispatch(navigate(x))
//     //             await notifyHandle(isConnected)
//     //             setIsAppLoading(false)
//     //         })
//     //     })();
//     // }, [])

//     // if (isAppLoading) {
//     //     return <SplashScreen />;
//     // }

//     return (
//         <View style={{flex:1}}>
//             {{
//                 'REGISTERSCREEN': <RegisterScreen />,
//                 'OTPSCREEN': <OTPScreen />,
//             }}
//         </View>
//     )
// }

// export default Navigation;