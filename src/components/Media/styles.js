import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: { marginBottom: 16, alignItems: 'flex-end' },
  audioControlContainer: {
    flex: 1,
  },
  audioControlTimeContainer: {
    position: 'absolute',
    top: '50%',
    fontSize: 11,
    marginLeft: 5,
    marginTop: 8,
  },
  thumbStyle: {
    height: 12,
    width: 12,
    backgroundColor: '#97A5C7',
  },
  sliderView: {
    position: 'relative',
    flexDirection: 'row',
    marginLeft: 3,
    flex: 1,
  },
  sliderStyle: {
    flex: 1,
  },
  trackStyle: {
    height: 3,
  },
});
