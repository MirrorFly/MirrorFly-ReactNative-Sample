import { StyleSheet, Text, View, FlatList, BackHandler } from 'react-native';
import React from 'react';
import { countriescodes } from '../common/countries';
import CountryItems from '../model/CountryItems';
import { navigate } from '../redux/Actions/NavigationAction';
import { REGISTERSCREEN } from '../constant';
import { useDispatch } from 'react-redux';
import ScreenHeader from '../components/ScreenHeader';
import * as RootNav from '../Navigation/rootNavigation';

const CountryList = () => {
  const [filteredData, setFilteredData] = React.useState(countriescodes);
  const dispatch = useDispatch();
  const backHandler = BackHandler.addEventListener(
    'hardwareBackPress',
    handleBackBtn,
  );

  React.useEffect(() => {
    return () => backHandler.remove();
  }, []);

  const handleBackBtn = () => {
    let x = { screen: REGISTERSCREEN };
    dispatch(navigate(x));
    RootNav.navigate(REGISTERSCREEN);
    return true;
  };

  const handleSearch = text => {
    const filtered = countriescodes.filter(item =>
      item.name.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredData(filtered);
  };

  const handleReset = () => {
    setFilteredData(countriescodes);
  };

  return (
    <>
      <View>
        <ScreenHeader
          title="Select Country"
          onhandleBack={handleBackBtn}
          onhandleSearch={handleSearch}
          handleClear={handleReset}
        />
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
            renderItem={({ item, index }) => (
              <CountryItems key={index} renderItem={item} />
            )}
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
