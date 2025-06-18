import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../common/Text';
import { useThemeColorPalatte } from '../redux/reduxHook';
import { REGISTERSCREEN } from '../screens/constants';
import PropTypes from 'prop-types';

const CountryItems = props => {
   const navigation = useNavigation();
   const themeColorPalatte = useThemeColorPalatte();
   const countrySelectHandler = () => {
      navigation.navigate(REGISTERSCREEN, { selectcountry: props.renderItem });
   };
   return (
      <View>
         <TouchableOpacity style={styles.countryListStyle} onPress={countrySelectHandler}>
            <Text style={[{ fontSize: 15, color: themeColorPalatte.primaryTextColor, fontWeight: '400' }]}>{props.renderItem.name}</Text>
            <Text style={[{ fontSize: 15, color: themeColorPalatte.secondaryTextColor, fontWeight: '400' }]}>
               +{props.renderItem.dial_code}
            </Text>
         </TouchableOpacity>
      </View>
   );
};

CountryItems.propTypes = {
   renderItem: PropTypes.shape({
      name: PropTypes.string,
      dial_code: PropTypes.string,
   }),
};

export default CountryItems;

const styles = StyleSheet.create({
   countryListStyle: {
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
   },
});
