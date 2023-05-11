import React from 'react'
import { View } from 'react-native'
import { useSelector } from 'react-redux'
import CountryList from '../screen/CountryList'
import ProfileScreen from '../screen/ProfileScreen'
import RecentChat from '../screen/RecentChat'
import RegisterScreen from '../screen/RegisterScreen'

function Navigation() {
    const screenNav = useSelector(state => state.navigation.screen)

    return (
        <View style={{ flex: 1 }}>
            {{
                'REGISTERSCREEN': <RegisterScreen />,
                'RECENTCHATSCREEN': <RecentChat />,
                'COUNTRYSCREEN': <CountryList />,
                'PROFILESCREEN': <ProfileScreen />
            }[screenNav]}
        </View>
    )
}

export default Navigation