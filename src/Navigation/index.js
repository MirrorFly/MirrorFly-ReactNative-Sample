import React from 'react'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import RecentChat from '../screen/RecentChat'
import RegisterScreen from '../screen/RegisterScreen'

function Navigation() {
    const screenNav = useSelector(state => state.navigation.screen)

    return (
        <View>
            {{
                'REGISTERSCREEN': <RegisterScreen />,
                'RECENTCHATSCREEN': <RecentChat />
            }[screenNav]}
        </View>
    )
}

export default Navigation