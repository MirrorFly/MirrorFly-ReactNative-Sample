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

const commonStyles = StyleSheet.create({
  flex1: { flex: 1 },
  justifyContentCenter: {
    justifyContent: 'center',
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
  pressedBg: {
    backgroundColor: ApplicationColors.pressedBg,
  },
  marginLeft_5: {
    marginLeft: 5,
  },
  paddingHorizontal_4: {
    paddingHorizontal: 4,
  },
  paddingHorizontal_8: {
    paddingHorizontal: 8,
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
  paddingRight_0: {
    paddingRight: 0,
  },
});

export default commonStyles;
