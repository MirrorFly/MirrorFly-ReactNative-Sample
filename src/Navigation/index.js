import React from 'react'
import { View } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper';
import { useSelector } from 'react-redux'
import CountryList from '../screen/CountryList'
import ProfileScreen from '../screen/ProfileScreen'
import RecentChat from '../screen/RecentChat'
import RegisterScreen from '../screen/RegisterScreen'
import ChatScreen from '../screen/ChatScreen'
import ContactListScreen from '../screen/ContactListScreen';

function Navigation() {
    const screenNav = useSelector(state => state.navigation.screen)

    return (
        <PaperProvider>
            <View style={{ flex: 1 }}>
                {{
                    'REGISTERSCREEN': <RegisterScreen />,
                    'RECENTCHATSCREEN': <RecentChat />,
                    'COUNTRYSCREEN': <CountryList />,
                    'PROFILESCREEN': <ProfileScreen />,
                    'CHATSCREEN': <ChatScreen />,
                    'CONTACTLIST': <ContactListScreen />
                }[screenNav]}
            </View>
        </PaperProvider>
    )
}

export default Navigation