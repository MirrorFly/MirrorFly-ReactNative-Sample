import React from 'react'
import Svg, { G, Path, Rect } from 'react-native-svg';
import { TouchableOpacity, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';

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
        <TouchableWithoutFeedback {...props}>
            <View {...props}>
                <Svg xmlns="http://www.w3.org/2000/svg" width={props.width || "18"} height={props.height || "18"} viewBox="0 0 18 18">
                    <G id="magnifying-glass_2_" data-name="magnifying-glass (2)" transform="translate(-11 -11)">
                        <Path id="Path_4" data-name="Path 4" d="M28.78,27.722l-4.327-4.327a7.58,7.58,0,1,0-1.062,1.062l4.327,4.324a.749.749,0,1,0,1.062-1.058Zm-10.194-3.06a6.078,6.078,0,1,1,6.08-6.076A6.084,6.084,0,0,1,18.586,24.662Z" fill="#181818" />
                    </G>
                </Svg>
            </View>
        </TouchableWithoutFeedback>
    )
}

export const ShapeIcon = (props) => {
    return (
        <TouchableWithoutFeedback {...props}>
            <View style={{ paddingHorizontal: 20 }} {...props}>
                <Svg xmlns="http://www.w3.org/2000/svg" width={props.width || "3.66"} height={props.height || "16.31"} viewBox="0 0 3.66 16.31">
                    <Path id="Shape_1_copy_7" data-name="Shape 1 copy 7" d="M338.34,58.15a1.83,1.83,0,1,1,1.831,1.81A1.82,1.82,0,0,1,338.34,58.15Zm0-6.34a1.83,1.83,0,1,1,1.831,1.81A1.82,1.82,0,0,1,338.34,51.81Zm0-6.35a1.83,1.83,0,1,1,1.831,1.81A1.82,1.82,0,0,1,338.34,45.46Z" transform="translate(-338.34 -43.65)" fill="#181818" />
                </Svg>
            </View>
        </TouchableWithoutFeedback>
    )
}

export const CloseIcon = (props) => {
    return (
        <TouchableWithoutFeedback {...props}>
            <View {...props}>
                <Svg xmlns="http://www.w3.org/2000/svg" width={props.width || "20"} height={props.height || "20"} viewBox="0 0 20 20">
                    <G id="close" transform="translate(-3805 -694)">
                        <G id="star" transform="translate(-388 -78)">
                            <Rect id="Rectangle_188" data-name="Rectangle 188" width="20" height="20" transform="translate(4193 772)" fill="rgba(139,68,68,0)" />
                        </G>
                        <G id="close-2" data-name="close" transform="translate(3774 699)">
                            <Path id="Path_1570" data-name="Path 1570" d="M30.78,16.22a.749.749,0,0,0-1.06,0l-6.22,6.22-6.22-6.22a.75.75,0,1,0-1.06,1.06l6.22,6.22-6.22,6.22a.75.75,0,1,0,1.06,1.06l6.22-6.22,6.22,6.22a.75.75,0,0,0,1.06-1.06L24.56,23.5l6.22-6.22A.749.749,0,0,0,30.78,16.22Z" transform="translate(18 -18)" fill="#181818" stroke="#181818" stroke-width="0.2" />
                        </G>
                    </G>
                </Svg>
            </View>
        </TouchableWithoutFeedback>
    )
}

export const PlusIcon = (props) => {
    return <TouchableOpacity {...props}>
        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" id="vector">
            <Path id="path" d="M 12.4 0 C 15.687 0 18.844 1.307 21.168 3.632 C 23.493 5.956 24.8 9.113 24.8 12.4 C 24.8 15.687 23.493 18.844 21.168 21.168 C 18.844 23.493 15.687 24.8 12.4 24.8 C 9.113 24.8 5.956 23.493 3.632 21.168 C 1.307 18.844 0 15.687 0 12.4 C 0 9.113 1.307 5.956 3.632 3.632 C 5.956 1.307 9.113 0 12.4 0 Z" fill="#efefef" />
            <Path id="path_1" d="M 17.381 12 L 8.538 12 C 8.384 12.039 8.248 12.128 8.15 12.254 C 8.053 12.379 8 12.533 8 12.692 C 8 12.851 8.053 13.005 8.15 13.13 C 8.248 13.256 8.384 13.345 8.538 13.384 L 17.381 13.384 C 17.535 13.345 17.671 13.256 17.769 13.13 C 17.866 13.005 17.919 12.851 17.919 12.692 C 17.919 12.533 17.866 12.379 17.769 12.254 C 17.671 12.128 17.535 12.039 17.381 12 Z" fill="#000000" />
            <Path id="path_2" d="M 12 8.538 L 12 17.381 C 12.031 17.539 12.119 17.68 12.246 17.779 C 12.373 17.878 12.531 17.928 12.692 17.919 C 12.853 17.928 13.011 17.878 13.138 17.779 C 13.265 17.68 13.353 17.539 13.384 17.381 L 13.384 8.538 C 13.353 8.38 13.265 8.239 13.138 8.14 C 13.011 8.041 12.853 7.991 12.692 8 C 12.531 7.991 12.373 8.041 12.246 8.14 C 12.119 8.239 12.031 8.38 12 8.538 Z" fill="#000000" />
        </Svg>

    </TouchableOpacity >
}

export const ContactIcon = (props) => {
    return <Svg xmlns="http://www.w3.org/2000/svg" width={props.width || "20"} height={props.height || "20"} viewBox="0 0 21 21" id="vector">
        <Path id="path" d="M 10.354 21.065 L 0.528 21.065 L 1.549 19.325 C 1.849 18.834 2.01 18.27 2.013 17.695 C 2.016 17.12 1.862 16.554 1.567 16.06 C 0.251 13.924 -0.259 11.386 0.128 8.908 C 0.516 6.429 1.776 4.168 3.681 2.536 C 5.586 0.903 8.013 0.004 10.522 0 C 12.389 -0.002 14.224 0.493 15.837 1.433 C 17.451 2.374 18.785 3.727 19.703 5.353 C 20.622 6.979 21.091 8.821 21.063 10.688 C 20.975 13.469 19.807 16.109 17.809 18.045 C 15.812 19.981 13.136 21.065 10.354 21.065 Z M 13.383 8.743 C 12.948 8.743 12.53 8.916 12.223 9.224 C 11.916 9.532 11.743 9.95 11.743 10.385 C 11.743 10.82 11.916 11.237 12.224 11.545 C 12.532 11.852 12.949 12.025 13.384 12.025 C 13.819 12.025 14.237 11.852 14.544 11.544 C 14.852 11.237 15.025 10.819 15.025 10.384 C 15.024 9.949 14.851 9.531 14.543 9.224 C 14.236 8.916 13.818 8.743 13.383 8.743 Z M 7.363 8.743 C 6.991 8.742 6.63 8.868 6.339 9.099 C 6.047 9.33 5.843 9.654 5.76 10.016 C 5.676 10.378 5.719 10.759 5.88 11.094 C 6.04 11.429 6.311 11.7 6.645 11.862 C 6.98 12.023 7.36 12.067 7.723 11.984 C 8.086 11.902 8.41 11.698 8.642 11.408 C 8.874 11.117 9 10.756 9 10.384 C 8.999 9.95 8.827 9.533 8.52 9.226 C 8.214 8.918 7.797 8.745 7.363 8.743 Z"
            fill="#fff"
        />
    </Svg>
}