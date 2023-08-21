import React from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import CollapsingToolbar from './CollapsibleToolbar';
import { useSelector } from 'react-redux';

const UserInfo = props => {
  const profileDetails = useSelector(state => state.navigation.profileDetails);
  const handleBackBtn = () => {
    props.setLocalNav('CHATCONVERSATION');
  };

  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  React.useEffect(() => {
    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <CollapsingToolbar
        bgColor={profileDetails.colorCode}
        title={profileDetails.nickName}
        titleColor={profileDetails.colorCode}
        titleStatus={profileDetails.status}
        mobileNo={profileDetails.mobileNumber}
        email={profileDetails.email}
        setLocalNav={props.setLocalNav}
        handleBackBtn={handleBackBtn}
      />
    </View>
  );
};
export default UserInfo;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
