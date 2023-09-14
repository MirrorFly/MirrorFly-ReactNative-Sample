import { StyleSheet } from 'react-native';

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
});

export default commonStyles;
