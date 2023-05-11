import React from 'react'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import CountryList from '../screen/CountryList'
import ProfileScreen from '../screen/ProfileScreen'
import RecentChat from '../screen/RecentChat'
import RegisterScreen from '../screen/RegisterScreen'
import ChatScreen from '../screen/ChatScreen'
import ContactList from '../screen/ContactList'
import { Provider } from 'react-native-paper'

function Navigation() {
    const screenNav = useSelector(state => state.navigation.screen)

    return (
        <Provider>
            <View style={{ flex: 1 }}>
                {{
                    'REGISTERSCREEN': <RegisterScreen />,
                    'RECENTCHATSCREEN': <RecentChat />,
                    'COUNTRYSCREEN': <CountryList />,
                    'PROFILESCREEN': <ProfileScreen />,
                    'CHATSCREEN': <ChatScreen />,
                    'CONTACTLIST': <ContactList />
                }[screenNav]}
            </View>
        </Provider>
    )
}

export default Navigation