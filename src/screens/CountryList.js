import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ScreenHeader from '../common/ScreenHeader';
import Text from '../common/Text';
import { countriescodes } from '../common/countries';
import CountryItems from '../components/CountryItems';

const CountryList = () => {
   const [filteredData, setFilteredData] = React.useState(countriescodes);

   const handleSearch = text => {
      const filtered = countriescodes.filter(item => item.name.toLowerCase().includes(text.toLowerCase()));
      setFilteredData(filtered);
   };

   return (
      <>
         <View>
            <ScreenHeader title="Select Country" onChangeText={handleSearch} />
         </View>
         <View>
            {!filteredData.length ? (
               <View style={styles.CountryContainer}>
                  <Text style={{ fontSize: 20 }}>No countries found</Text>
               </View>
            ) : (
               <FlatList
                  data={filteredData}
                  removeClippedSubviews={true}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={item => item.code}
                  renderItem={({ item }) => <CountryItems renderItem={item} />}
               />
            )}
         </View>
      </>
   );
};

export default CountryList;

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 70,
      paddingHorizontal: 10,
      backgroundColor: '#F2F2F2',
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
   },
   titleContainer: {
      flex: 1,
      justifyContent: 'center',
   },
   title: {
      color: '#181818',
      fontSize: 22,
      fontWeight: 'bold',
      paddingLeft: 24,
   },
   iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 6,
   },
   icon: {
      width: 20,
      height: 20,
      marginHorizontal: 5,
   },
   headerStyle: {
      backgroundColor: '#F2F2F2',
      height: 60,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
   },
   imageView: {
      width: 25,
      height: 20,
   },
   countryListStyle: {
      padding: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
   inputStyle: {
      marginHorizontal: 10,
      width: 150,
      fontSize: 20,
      flex: 0.9,
   },
   SearchImage: {
      width: 18,
      height: 18,
   },
   CloseImage: {
      width: 16,
      height: 16,
   },
   CountryContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 100,
   },
});
