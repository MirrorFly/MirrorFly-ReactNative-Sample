import React from 'react';
import IconButton from '../../common/IconButton';
import { DownArrowIcon } from '../../common/Icons';
import { StyleSheet, View } from 'react-native';
import ApplicationColors from '../../config/appColors';
import commonStyles from '../../common/commonStyles';

const CloseCallModalButton = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <IconButton
        onPress={onPress}
        style={commonStyles.padding_12}
        containerStyle={styles.iocnButtonWrapper}>
        <DownArrowIcon width={16} height={10} color={ApplicationColors.white} />
      </IconButton>
    </View>
  );
};

export default CloseCallModalButton;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  iocnButtonWrapper: {
    width: 40,
  },
});
