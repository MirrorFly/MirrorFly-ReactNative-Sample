import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { REGISTERSCREEN } from '../screens/constants';

const CountryItems = props => {
   const navigation = useNavigation();
   const countrySelectHandler = () => {
      navigation.navigate(REGISTERSCREEN, { selectcountry: props.renderItem });
   };
   return (
      <View>
         <TouchableOpacity style={styles.countryListStyle} onPress={countrySelectHandler}>
            <Text style={{ fontSize: 15, color: 'black', fontWeight: '400' }}>{props.renderItem.name}</Text>
            <Text style={{ fontSize: 15, color: '#767676', fontWeight: '400' }}>+{props.renderItem.dial_code}</Text>
         </TouchableOpacity>
      </View>
   );
};

export default CountryItems;

const styles = StyleSheet.create({
   countryListStyle: {
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
});
