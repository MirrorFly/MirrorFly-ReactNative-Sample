import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { TabView, TabBar } from 'react-native-tab-view';
import ScreenHeader from './ScreenHeader';
const UsersTapBarInfo = props => {
   const [index, setIndex] = React.useState(0);
   const [routes] = React.useState([
      { key: '1', title: 'Media' },
      { key: '2', title: 'Docs' },
      { key: '3', title: 'Links' },
   ]);
   const handleBackBtn = () => {
      props.setLocalNav('UserInfo');
   };
   const renderScene = ({ route }) => {
      switch (route.key) {
         case '1':
            return (
               <View style={[styles.scene, { backgroundColor: '#FFFF' }]}>
                  <Text>No Media Found ...!!!</Text>
               </View>
            );
         case '2':
            return (
               <View style={[styles.scene, { backgroundColor: '#FFFF' }]}>
                  <Text>No Docs Found...!!!</Text>
               </View>
            );
         case '3':
            return (
               <View style={[styles.scene, { backgroundColor: '#FFFF' }]}>
                  <Text> No Links Found...!!!</Text>
               </View>
            );
         default:
            return null;
      }
   };
   const renderTabBar = props => (
      <View style={{}}>
         <ScreenHeader title="Ashik" onhandleBack={handleBackBtn} />
         <TabBar
            {...props}
            renderLabel={({ route, focused }) => (
               <Text style={[styles.tabLabel, focused && styles.activeTabLabel]}>{route.title}</Text>
            )}
            style={styles.tabBar}
            indicatorStyle={styles.tabIndicator}
         />
      </View>
   );
   return (
      <View style={styles.tabContainer}>
         <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={setIndex}
            initialLayout={{ width: '100%' }}
         />
      </View>
   );
};
export default UsersTapBarInfo;
const styles = StyleSheet.create({
   tabContainer: {
      flex: 0.8,
   },
   scene: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   tabBar: {
      backgroundColor: '#ffff',
   },
   activeTabLabel: {
      fontWeight: 'bold',
      color: '#3276E2',
      width: 60,
   },
   tabIndicator: {
      alignItems: 'center',
      backgroundColor: '#3276E2',
      width: 120,
   },
   tabLabel: {
      fontSize: 16,
      fontWeight: '400',
      color: 'black',
      margin: 2,
   },
});
