import { StyleSheet } from 'react-native';
import ApplicationColors from '../config/appColors';

export const toastStyles = StyleSheet.create({
  toastContainer: {
    backgroundColor: ApplicationColors.invertedBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  toastContent: {
    color: ApplicationColors.mainbg,
    padding: 8,
  },
});

export const pressableStyles = StyleSheet.create({
  highlightView: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: ApplicationColors.pressedBg,
    zIndex: 10,
  },
});

const commonStyles = StyleSheet.create({
  flex1: { flex: 1 },
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
  justifyContentFlexStart: {
    justifyContent: 'flex-start',
  },
  justifyContentFlexEnd: {
    justifyContent: 'flex-end',
  },
  alignItemsCenter: {
    alignItems: 'center',
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
  hstack: {
    flexDirection: 'row',
  },
  vstack: {
    flexDirection: 'column',
  },
  iconButton: {
    borderRadius: 50,
    overflow: 'hidden',
  },
  positionRelative: {
    position: 'relative',
  },
  pressedBg: {
    backgroundColor: ApplicationColors.pressedBg,
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
  marginRight_28: {
    marginRight: 24,
  },
  marginBottom_6: {
    marginBottom: 6,
  },
  p_4: {
    padding: 4,
  },
  minWidth_250: {
    minWidth: 250,
  },
  minWidth_200: {
    minWidth: 200,
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
  paddingHorizontal_6: {
    paddingHorizontal: 6,
  },
  paddingTop_0: {
    paddingTop: 0,
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
  alignSelfFlexStart: {
    alignSelf: 'flex-start',
  },
  alignSelfFlexEnd: {
    alignSelf: 'flex-end',
  },
  bg_transparent: {
    backgroundColor: 'transparent',
  },
  fontWeight_bold: {
    fontWeight: 'bold',
  },
  overflowHidden: {
    overflow: 'hidden',
  },
});

export default commonStyles;
