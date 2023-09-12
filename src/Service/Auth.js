import AsyncStorage from "@react-native-async-storage/async-storage"
import connectionReducer from "../redux/Reducers/connection.Reducer"
import store from "../redux/store";

export const connectAgain = async () => {
    let keys = await AsyncStorage.getAllKeys()
    if (keys.includes('mirrorFlyLoggedIn')) {
        const mirrorFlyLoggedIn = await AsyncStorage.getItem('mirrorFlyLoggedIn')
        if (mirrorFlyLoggedIn && mirrorFlyLoggedIn == 'true') {
            const credential = await AsyncStorage.getItem('credential')
            if (credential)
                await store.dispatch(connectionReducer(JSON.parse(credential)))
        }
    }
}
    