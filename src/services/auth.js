import AsyncStorage from "@react-native-async-storage/async-storage"
import { connectXMPP, registerData } from "../redux/authSlice"
import store from "../redux/store"
import { CHATSCREEN, RECENTCHATSCREEN, REGISTERSCREEN } from "../constant"
import { navigate } from "../redux/navigationSlice"

export const authScreen = async () => {
    var screen = 'Splash'
    try {
        await AsyncStorage.getItem('mirrorFlyToken')
        let keys = await AsyncStorage.getAllKeys()
        if (keys.includes('mirrorFlyLoggedIn')) {
            const mirrorFlyLoggedIn = await AsyncStorage.getItem('mirrorFlyLoggedIn')
            if (mirrorFlyLoggedIn == 'true') {
                const credential = await AsyncStorage.getItem('credential')
                if (credential) {
                    await store.dispatch(registerData(JSON.parse(credential))).then((res) => {
                        console.log(res)
                        if (res.payload.payload == 200 || res.payload.payload == 409)
                            screen = RECENTCHATSCREEN
                        else screen = REGISTERSCREEN
                    })
                }
            } else screen = REGISTERSCREEN
        } else screen = REGISTERSCREEN
    } catch (error) {
        console.log(error, 'error Auth')
    }
    return screen;
}

export const connectAgain = async () => {
    let keys = await AsyncStorage.getAllKeys()
    if (keys.includes('mirrorFlyLoggedIn')) {
        const mirrorFlyLoggedIn = await AsyncStorage.getItem('mirrorFlyLoggedIn')
        if (mirrorFlyLoggedIn && mirrorFlyLoggedIn == 'true') {
            const credential = await AsyncStorage.getItem('credential')
            if (credential)
                await store.dispatch(connectXMPP(JSON.parse(credential)))
        }
    }
}

export const notifyHandle = async (isConnected) => {
    let keys = await AsyncStorage.getAllKeys()
    if (keys.includes('fromUserJId')) {
        const fromUserJId = await AsyncStorage.getItem('fromUserJId')
        await AsyncStorage.setItem('fromUserJId', '')
        await connectAgain()
        if (fromUserJId && isConnected == 'connected') {
            let x = { screen: CHATSCREEN, fromUserId: fromUserJId }
            store.dispatch(navigate(x))
        }
    }
}