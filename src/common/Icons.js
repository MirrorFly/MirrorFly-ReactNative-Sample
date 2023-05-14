import React from 'react'
import Svg, { G, Path, Rect } from 'react-native-svg';
import { TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export const LeftArrowIcon = () => {
    return (
        <Svg xmlns="http://www.w3.org/2000/svg" width="18.334" height="15.325" viewBox="0 0 18.334 15.325">
            <Path id="Shape_1" data-name="Shape 1" d="M25.179,60.733l-6.942-6.859q-.027-.027-.051-.056l0,0-.01-.012,0,0-.009-.011,0,0-.008-.01,0-.006-.007-.01,0-.007-.006-.009-.005-.008,0-.007-.006-.01,0-.006L18.1,53.7l0,0-.008-.015h0a.8.8,0,0,1,.161-.957l6.926-6.843a.82.82,0,0,1,1.15,0,.8.8,0,0,1,0,1.137L20.776,52.5H35.52a.8.8,0,1,1,0,1.607H20.776L26.33,59.6a.8.8,0,0,1,0,1.137.821.821,0,0,1-1.15,0Z" transform="translate(-17.999 -45.643)" fill="#181818" />
        </Svg>
    )
}

export const AttachmentIcon = (props) => {
    return (
        <Svg xmlns="http://www.w3.org/2000/svg" width="10.718" height="15.5" viewBox="0 0 10.718 15.5">
            <Path id="XMLID_97_" d="M56.265.577v9.563a5.359,5.359,0,1,1-10.718,0V.577a.577.577,0,0,1,1.155,0v9.563a4.2,4.2,0,1,0,8.408,0V1.155H49.69V9.749a1.216,1.216,0,0,0,2.431,0V3.754a.577.577,0,1,1,1.155,0V9.749a2.371,2.371,0,1,1-4.741,0V.577A.577.577,0,0,1,49.113,0h6.575A.577.577,0,0,1,56.265.577Z" transform="translate(-45.547)" fill="#363636" />
        </Svg>
    )
}

export const ManigifyingGlass = (props) => {
    return (
        <View {...props}>
            <Svg xmlns="http://www.w3.org/2000/svg" width={props.width || "18"} height={props.height || "18"} viewBox="0 0 18 18">
                <G id="magnifying-glass_2_" data-name="magnifying-glass (2)" transform="translate(-11 -11)">
                    <Path id="Path_4" data-name="Path 4" d="M28.78,27.722l-4.327-4.327a7.58,7.58,0,1,0-1.062,1.062l4.327,4.324a.749.749,0,1,0,1.062-1.058Zm-10.194-3.06a6.078,6.078,0,1,1,6.08-6.076A6.084,6.084,0,0,1,18.586,24.662Z" fill="#181818" />
                </G>
            </Svg>
        </View>
    )
}

export const CloseIcon = (props) => {
    return (
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
    )
}

export const MenuIcon = (props) => {
    return (
        <Svg xmlns="http://www.w3.org/2000/svg" width={props.width || "3.66"} height={props.height || "16.31"} viewBox="0 0 3.66 16.31">
            <Path id="Shape_1_copy_7" data-name="Shape 1 copy 7" d="M338.34,58.15a1.83,1.83,0,1,1,1.831,1.81A1.82,1.82,0,0,1,338.34,58.15Zm0-6.34a1.83,1.83,0,1,1,1.831,1.81A1.82,1.82,0,0,1,338.34,51.81Zm0-6.35a1.83,1.83,0,1,1,1.831,1.81A1.82,1.82,0,0,1,338.34,45.46Z" transform="translate(-338.34 -43.65)" fill="#181818" />
        </Svg>
    )
}

export const Chat_FABICON = (props) => {
    return <Svg
        xmlns="http://www.w3.org/2000/svg" width={props.width || "20"} height={props.height || "20"} viewBox="0 0 21 21" id="vector">
        <Path id="path" d="M 10.354 21.065 L 0.528 21.065 L 1.549 19.325 C 1.849 18.834 2.01 18.27 2.013 17.695 C 2.016 17.12 1.862 16.554 1.567 16.06 C 0.251 13.924 -0.259 11.386 0.128 8.908 C 0.516 6.429 1.776 4.168 3.681 2.536 C 5.586 0.903 8.013 0.004 10.522 0 C 12.389 -0.002 14.224 0.493 15.837 1.433 C 17.451 2.374 18.785 3.727 19.703 5.353 C 20.622 6.979 21.091 8.821 21.063 10.688 C 20.975 13.469 19.807 16.109 17.809 18.045 C 15.812 19.981 13.136 21.065 10.354 21.065 Z M 13.383 8.743 C 12.948 8.743 12.53 8.916 12.223 9.224 C 11.916 9.532 11.743 9.95 11.743 10.385 C 11.743 10.82 11.916 11.237 12.224 11.545 C 12.532 11.852 12.949 12.025 13.384 12.025 C 13.819 12.025 14.237 11.852 14.544 11.544 C 14.852 11.237 15.025 10.819 15.025 10.384 C 15.024 9.949 14.851 9.531 14.543 9.224 C 14.236 8.916 13.818 8.743 13.383 8.743 Z M 7.363 8.743 C 6.991 8.742 6.63 8.868 6.339 9.099 C 6.047 9.33 5.843 9.654 5.76 10.016 C 5.676 10.378 5.719 10.759 5.88 11.094 C 6.04 11.429 6.311 11.7 6.645 11.862 C 6.98 12.023 7.36 12.067 7.723 11.984 C 8.086 11.902 8.41 11.698 8.642 11.408 C 8.874 11.117 9 10.756 9 10.384 C 8.999 9.95 8.827 9.533 8.52 9.226 C 8.214 8.918 7.797 8.745 7.363 8.743 Z" fill="#fff" />
    </Svg>
}

export const ProfileIcon = (props) => {
    return (
        <TouchableOpacity {...props}>
            <Svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height} viewBox="0 0 15.26 17.941">
                <G id="avatar" transform="translate(-36.073)">
                    <G id="Group_257" data-name="Group 257" transform="translate(36.073)">
                        <Path id="Path_1553" data-name="Path 1553" d="M140.894,9.667h.119a3.428,3.428,0,0,0,2.619-1.133c1.43-1.612,1.193-4.376,1.167-4.64A3.79,3.79,0,0,0,143,.524,4.131,4.131,0,0,0,141,0h-.063a4.137,4.137,0,0,0-2,.509,3.793,3.793,0,0,0-1.824,3.385c-.026.264-.264,3.028,1.167,4.64A3.414,3.414,0,0,0,140.894,9.667Zm-2.79-5.68c0-.011,0-.022,0-.03.123-2.664,2.014-2.95,2.824-2.95h.045c1,.022,2.708.431,2.824,2.95a.073.073,0,0,0,0,.03c0,.026.264,2.552-.918,3.882a2.435,2.435,0,0,1-1.913.8h-.037a2.427,2.427,0,0,1-1.91-.8C137.848,6.546,138.1,4.009,138.1,3.986Z" transform="translate(-133.329)" fill="#181818" />
                        <Path id="Path_1554" data-name="Path 1554" d="M51.332,263.864v-.011c0-.03,0-.059,0-.093-.022-.736-.071-2.456-1.683-3.006l-.037-.011a10.72,10.72,0,0,1-3.084-1.4.5.5,0,0,0-.576.821,11.57,11.57,0,0,0,3.392,1.549c.866.308.962,1.233.988,2.081a.746.746,0,0,0,0,.093,6.743,6.743,0,0,1-.078,1.148,13.672,13.672,0,0,1-6.55,1.523,13.751,13.751,0,0,1-6.554-1.527,6.384,6.384,0,0,1-.078-1.148c0-.03,0-.059,0-.093.026-.847.123-1.772.988-2.08a11.679,11.679,0,0,0,3.392-1.549.5.5,0,1,0-.576-.821,10.6,10.6,0,0,1-3.084,1.4l-.037.011c-1.612.554-1.661,2.274-1.683,3.006a.746.746,0,0,1,0,.093v.011a5.7,5.7,0,0,0,.189,1.683.477.477,0,0,0,.193.234,14.053,14.053,0,0,0,7.252,1.776,14.1,14.1,0,0,0,7.252-1.776.5.5,0,0,0,.193-.234A5.977,5.977,0,0,0,51.332,263.864Z" transform="translate(-36.073 -249.613)" fill="#181818" />
                    </G>
                </G>
            </Svg>
        </TouchableOpacity>
    )
}

export const SearchIcon = (props) => {
    return (
        <Svg xmlns="http://www.w3.org/2000/svg" width={props.width || 20} height={props.height || 20} viewBox="0 0 18 18">
            <G id="magnifying-glass_2_" data-name="magnifying-glass (2)" transform="translate(-11 -11)">
                <Path id="Path_4" data-name="Path 4" d="M28.78,27.722l-4.327-4.327a7.58,7.58,0,1,0-1.062,1.062l4.327,4.324a.749.749,0,1,0,1.062-1.058Zm-10.194-3.06a6.078,6.078,0,1,1,6.08-6.076A6.084,6.084,0,0,1,18.586,24.662Z" fill="#181818" />
            </G>
        </Svg>
    )

}


