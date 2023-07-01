
import React from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import CollapsingToolbar from './CollapsibleToolbar';

const UserInfo = (props) => {


  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn
  );

  const handleBackBtn = () => {
    props.setLocalNav('CHATCONVERSATION');
  }

  React.useEffect(() => {
    return () => {
      backHandler.remove();
    }
  }, [])

  return (
    <View style={styles.container}>
      <CollapsingToolbar setLocalNav={props.setLocalNav} handleBackBtn={handleBackBtn} />
    </View>
  );
}
export default UserInfo;
const styles = StyleSheet.create({
  container: {
    flex: 1,

  }
});
