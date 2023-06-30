
import React from 'react';
import {  StyleSheet, View} from 'react-native';
import CollapsingToolbar from './CollapsibleToolbar';

const UserInfo = (props) => {
   
  return (
    <View style={styles.container}>
      <CollapsingToolbar setLocalNav={props.setLocalNav} />  
    </View>
  );
}
export default UserInfo;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  
  }
});
