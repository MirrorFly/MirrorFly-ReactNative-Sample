import { Dimensions, StyleSheet } from 'react-native';
import ApplicationColors from '../config/appColors';

const { width, height } = Dimensions.get('window');

export const modelStyles = {
   inviteFriendModalContentContainer: {
      maxWidth: 500,
      width: '80%',
      borderRadius: 5,
      paddingVertical: 15,
      paddingHorizontal: 5,
   },
   modalTitle: {
      fontSize: 19,
      color: '#3c3c3c',
      fontWeight: '500',
      marginVertical: 15,
      paddingHorizontal: 25,
   },
   modalOption: textColor => ({
      paddingHorizontal: 25,
      paddingVertical: 15,
      fontSize: 14,
      color: textColor,
   }),
};

export const pressableStyles = StyleSheet.create({
   highlightView: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      zIndex: 10,
   },
});

const commonStyles = {
   flex1: {
      flex: 1,
   },
   flexGrow1: { flexGrow: 1 },
   hstack: {
      flexDirection: 'row',
   },
   centeredContent: {
      justifyContent: 'center',
      alignItems: 'center',
      width: width,
      height: height,
   },
   resetMarginAndPadding: {
      padding: 0,
      margin: 0,
   },
   mt_12: {
      marginTop: 12,
   },
   alignItemsCenter: {
      alignItems: 'center',
   },
   positionRelative: {
      position: 'relative',
   },
   bg_white: {
      backgroundColor: '#fff',
   },
   bg_color: bgColor => ({
      backgroundColor: bgColor,
   }),
   pressedBg: bgColor => ({
      backgroundColor: bgColor,
   }),
   mb_130: {
      marginBottom: 130,
   },
   highlightedText: {
      color: '#1f2937',
      fontWeight: 'bold',
      maxWidth: '90%',
   },
   highlight: {
      color: '#3276E2',
      fontWeight: 'bold',
   },
   p_5: {
      padding: 5,
   },
   p_10: {
      padding: 10,
   },
   pl_10: {
      paddingLeft: 10,
   },
   p_15: {
      padding: 15,
   },
   fontSize_14: {
      fontSize: 14,
   },
   fontSize_15: {
      fontSize: 15,
   },
   fontSize_18: {
      fontSize: 18,
   },
   colorBlack: {
      color: '#000',
   },
   textCenter: {
      textAlign: 'center',
   },
   typingText: {
      color: '#3276E2',
   },
   dispaly_none: {
      display: 'none',
   },
   height_25: { height: 25 },
   screenHeaderHeight: { height: 65 },
   flex1_centeredContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   justifyContentCenter: {
      justifyContent: 'center',
   },
   justifyContentSpaceEvenly: {
      justifyContent: 'space-evenly',
   },
   justifyContentSpaceBetween: {
      justifyContent: 'space-between',
   },
   justifyContentFlexStart: {
      justifyContent: 'flex-start',
   },
   justifyContentFlexEnd: {
      justifyContent: 'flex-end',
   },
   alignItemsFlexStart: {
      alignItems: 'flex-start',
   },
   alignItemsFlexEnd: {
      alignItems: 'flex-end',
   },
   alignItemsBaseline: {
      alignItems: 'baseline',
   },
   alignItemsStretch: {
      alignItems: 'stretch',
   },
   vstack: {
      flexDirection: 'column',
   },
   iconButton: {
      borderRadius: 50,
      overflow: 'hidden',
   },
   positionAbsolute: {
      position: 'absolute',
   },
   bottom_0: {
      bottom: 0,
   },
   bottom_1: {
      bottom: 1,
   },
   bottom_minus_15: {
      bottom: -15,
   },
   pressedBg_2: {
      backgroundColor: 'rgba(128, 128, 128, 0.5)',
   },
   m_12: {
      margin: 12,
   },
   mt_20: {
      marginTop: 20,
   },
   ml_4: {
      marginLeft: 4,
   },
   marginTop_5: {
      marginTop: 5,
   },
   marginTop_15: {
      marginTop: 15,
   },
   marginTop_30: {
      marginTop: 30,
   },
   marginLeft_5: {
      marginLeft: 5,
   },
   marginLeft_8: {
      marginLeft: 8,
   },
   marginLeft_10: {
      marginLeft: 10,
   },
   marginLeft_15: {
      marginLeft: 15,
   },
   marginLeft_20: {
      marginLeft: 20,
   },
   marginRight_4: {
      marginRight: 4,
   },
   marginRight_8: {
      marginRight: 8,
   },
   marginRight_12: {
      marginRight: 12,
   },
   marginRight_28: {
      marginRight: 24,
   },
   marginBottom_6: {
      marginBottom: 6,
   },
   marginBottom_8: {
      marginBottom: 8,
   },
   marginBottom_10: {
      marginBottom: 10,
   },
   marginBottom_55: {
      marginBottom: 55,
   },
   my_15: { marginVertical: 15 },
   mt_50: {
      marginTop: 50,
   },
   p_1: {
      padding: 1,
   },
   p_4: {
      padding: 4,
   },
   py_2: {
      paddingVertical: 2,
   },
   px_4: {
      paddingHorizontal: 4,
   },
   px_6: {
      paddingHorizontal: 6,
   },
   px_8: {
      paddingHorizontal: 8,
   },
   px_10: {
      paddingHorizontal: 10,
   },
   px_12: {
      paddingHorizontal: 12,
   },
   px_18: {
      paddingHorizontal: 18,
   },
   p_13: {
      padding: 13,
   },
   p_20: {
      padding: 20,
   },
   minWidth_250: {
      minWidth: 250,
   },
   minWidth_200: {
      minWidth: 200,
   },
   minWidth_30per: {
      minWidth: '30%',
   },
   maxWidth_90per: {
      maxWidth: '90%',
   },
   paddingHorizontal_4: {
      paddingHorizontal: 4,
   },
   paddingHorizontal_8: {
      paddingHorizontal: 8,
   },
   paddingVertical_8: {
      paddingVertical: 8,
   },
   paddingHorizontal_12: {
      paddingHorizontal: 12,
   },
   paddingVertical_12: {
      paddingVertical: 12,
   },
   paddingVertical_18: {
      paddingVertical: 18,
   },
   paddingHorizontal_16: {
      paddingHorizontal: 16,
   },
   marginRight_16: {
      marginRight: 16,
   },
   padding_2: {
      padding: 2,
   },
   padding_12: {
      padding: 12,
   },
   padding_8: {
      padding: 8,
   },
   padding_04: {
      padding: 0.4,
   },
   padding_10: {
      padding: 10,
   },
   padding_10_15: {
      paddingVertical: 10,
      paddingHorizontal: 15,
   },
   marginHorizontal_4: {
      marginHorizontal: 4,
   },
   marginHorizontal_10: {
      marginHorizontal: 10,
   },
   paddingHorizontal_6: {
      paddingHorizontal: 6,
   },
   paddingTop_0: {
      paddingTop: 0,
   },
   pt_15: {
      paddingTop: 15,
   },
   paddingLeft_0: {
      paddingLeft: 0,
   },
   paddingLeft_4: {
      paddingLeft: 4,
   },
   paddingRight_0: {
      paddingRight: 0,
   },
   pr_10: {
      paddingRight: 10,
   },
   alignSelfFlexStart: {
      alignSelf: 'flex-start',
   },
   alignSelfFlexEnd: {
      alignSelf: 'flex-end',
   },
   alignSelfCenter: {
      alignSelf: 'center',
   },
   bg_transparent: {
      backgroundColor: 'transparent',
   },
   fontWeight_bold: {
      fontWeight: 'bold',
   },
   fw_400: {
      fontWeight: '400',
   },
   fw_500: {
      fontWeight: '500',
   },
   fw_600: {
      fontWeight: '600',
   },
   colorWhite: {
      color: '#fff',
   },
   fontSize_11: {
      fontSize: 11,
   },
   fontSize_12: {
      fontSize: 12,
   },
   bgBlack: {
      backgroundColor: '#000',
   },
   bgBlack_04: {
      backgroundColor: 'rgba(0,0,0,0.4)',
   },
   bgBlack_01: {
      backgroundColor: 'rgba(0,0,0,0.1)',
   },
   overflowHidden: {
      overflow: 'hidden',
   },
   width_80: {
      width: 80,
   },
   width_100_per: {
      width: '100%',
   },
   height_90_per: {
      height: '80%',
   },
   height_100_per: {
      height: '100%',
   },
   borderRadius_4: {
      borderRadius: 4,
   },
   borderRadius_5: {
      borderRadius: 5,
   },
   borderRadius_6: {
      borderRadius: 6,
   },
   borderRadius_8: {
      borderRadius: 8,
   },
   borderRadius_12: {
      borderRadius: 12,
   },
   borderRadius_50: {
      borderRadius: 50,
   },
   borderWidth_0: {
      borderWidth: 0,
   },
   borderWidth_1: {
      borderWidth: 1,
   },
   borderWidth_3: {
      borderWidth: 3,
   },
   borderWidth_05: {
      borderWidth: 0.5,
   },
   borderColorWhite: {
      borderColor: '#fff',
   },
   borderColorGray: {
      borderColor: '#ccc',
   },
   borderColorBlack: {
      borderColor: '#000',
   },
   borderColorRed: {
      borderColor: 'red',
   },
   borderColorTransparent: {
      borderColor: 'transparent',
   },
   borderBottomWidth_1: {
      borderBottomWidth: 1,
   },
   borderTopWidth_1: {
      borderTopWidth: 1,
   },
   borderTopWidth_2: {
      borderTopWidth: 2,
   },
   borderBottomWidth_2: {
      borderBottomWidth: 2,
   },
   borderBottomColor_White: {
      borderBottomColor: '#fff',
   },
   borderBottomColor_Gray: {
      borderBottomColor: '#ccc',
   },
   borderBottomColor_Black: {
      borderBottomColor: '#000',
   },
   borderBottomColorTransparent: {
      borderBottomColor: 'transparent',
   },
   borderBottomColorBlack: {
      borderBottomColor: '#000',
   },
   borderBottomColorGray: {
      borderBottomColor: '#ccc',
   },
   resizeCover: {
      resizeMode: 'cover',
   },
   resizeContain: {
      resizeMode: 'contain',
   },
   b_0: {
      bottom: 0,
   },
   r_0: {
      right: 0,
   },
   b_m5: {
      bottom: -5,
   },
   r_5: {
      right: 5,
   },
   verticalDividerLine: {
      width: 1,
      backgroundColor: '#e3e3e3',
   },
   primarypilbtn: {
      height: 40,
      minHeight: 4,
      borderRadius: 25,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
   },
   primarypilbtntext: {
      fontSize: 16,
      paddingHorizontal: 25,
   },
   contentContainer: {
      flex: 1,
      maxWidth: '90%',
   },
   container: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   userName: {
      color: '#1f2937',
      fontWeight: 'bold',
   },
   textInput: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 10,
      paddingHorizontal: 10,
   },
   dividerLine: dividerBg => ({
      height: 0.5,
      backgroundColor: dividerBg,
   }),
   textDecorationLine: {
      textDecorationLine: 'underline',
   },
   mainTextColor: {
      color: ApplicationColors.mainColor,
   },
   opacity_0_5: {
      opacity: 0.5,
   },
   textColor: txtcolor => ({
      color: txtcolor,
   }),
   textFontFamily: txtFamily => ({
      fontFamily: txtFamily,
   }),
};

export default commonStyles;
