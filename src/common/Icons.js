import React from 'react'
import Svg, { G, Path } from 'react-native-svg';
import { TouchableOpacity } from 'react-native';

export const AttachmentIcon = (props) => {
    return (
        <TouchableOpacity {...props}>
            <Svg xmlns="http://www.w3.org/2000/svg" width="10.718" height="15.5" viewBox="0 0 10.718 15.5">
                <Path id="XMLID_97_" d="M56.265.577v9.563a5.359,5.359,0,1,1-10.718,0V.577a.577.577,0,0,1,1.155,0v9.563a4.2,4.2,0,1,0,8.408,0V1.155H49.69V9.749a1.216,1.216,0,0,0,2.431,0V3.754a.577.577,0,1,1,1.155,0V9.749a2.371,2.371,0,1,1-4.741,0V.577A.577.577,0,0,1,49.113,0h6.575A.577.577,0,0,1,56.265.577Z" transform="translate(-45.547)" fill="#363636" />
            </Svg>
        </TouchableOpacity>
    )
}

export const ManigifyingGlass = (props) => {
    return (
        <TouchableOpacity {...props}>
            <Svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                <G id="magnifying-glass_2_" data-name="magnifying-glass (2)" transform="translate(-11 -11)">
                    <Path id="Path_4" data-name="Path 4" d="M28.78,27.722l-4.327-4.327a7.58,7.58,0,1,0-1.062,1.062l4.327,4.324a.749.749,0,1,0,1.062-1.058Zm-10.194-3.06a6.078,6.078,0,1,1,6.08-6.076A6.084,6.084,0,0,1,18.586,24.662Z" fill="#181818" />
                </G>
            </Svg>
        </TouchableOpacity>
    )
}