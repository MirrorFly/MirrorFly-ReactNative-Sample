import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Pressable,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import ScreenHeader from 'components/ScreenHeader';
import { ArrowForwardIcon } from 'native-base';

const Location = props => {
  const [currentLocation, setCurrentLocation] = React.useState(null);
  const [currentAddress, setCurrentAddress] = useState('');

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'App needs access to your location.',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted.');
        getCurrentLocation();
      } else {
        console.log('Location permission denied.');
        handleLocationPermissionDenied();
      }
    } catch (error) {
      console.error('Failed to request location permission:', error);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, []);
  const handleBackBtn = () => {
    props.setLocalNav('CHATCONVERSATION');
  };

  const handleBackNav = () => {
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

  React.useEffect(() => {
    if (currentLocation) {
      const { latitude, longitude } = currentLocation;
      fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(responseJson => {
          setCurrentAddress(responseJson);
        })
        .catch(error => {
          console.error('Error fetching address:', error);
        });
    }
  }, [currentLocation]);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      },
      error => {
        console.error('Error getting current location:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <ScreenHeader title="User Location" onhandleBack={handleBackBtn} />
      </View>

      <MapView
        style={styles.map}
        region={
          currentLocation
            ? {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : null
        }>
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
          />
        )}
      </MapView>
      <View style={styles.mapFooter}>
        <Text style={styles.LocText}>Send this location</Text>
        <View style={styles.addressContainer}>
        {currentLocation !=null  && ( <View style={{ flexDirection: 'column', flex: 0.6 }}>
          <Text style={styles.addSubText}>
              {`${currentAddress.address?.neighbourhood}` +
                ',' +
                `${currentAddress.address?.suburb}` +
                ' , ' +
                `${currentAddress.address?.city_district}`}
            </Text>
             <Text style={styles.addCityText}>
              {`${currentAddress.address?.city}` +
                ' , ' +
                `${currentAddress.address?.state}` +
                ' , ' +
                `${currentAddress.address?.postcode}`}
            </Text>
          </View> )}
          <View style={styles.elevationContainer}>
            <View style={styles.ArrowIcon}>
              <Pressable onPress={handleBackNav}>
                <ArrowForwardIcon color={'#fff'} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Location;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E2E2',
    elevation: 6,
  },
  map: {
    flex: 1,
    paddingHorizontal: 100,
    paddingVertical: 100,
  },
  mapFooter: {
    backgroundColor: '#fff',
    flex: 0.2,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  LocText: {
    color: '#4879F9',
    fontSize: 12,
    fontWeight: '400',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  addressText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 7,
    flex: 0.4,
    marginRight: 5,
  },
  addSubText: {
    color: '#4D4D4D',
    paddingTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  addCityText: {
    color: '#4D4D4D',
    fontSize: 13,
    fontWeight: '400',
    paddingBottom: 4,
  },
  ArrowIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#4879F9',
    justifyContent: 'center',
    borderRadius: 20,
    paddingLeft: 12,
    position: 'absolute',
    right: 2,
    top: -5,
    elevation: 4,
    borderColor: '#4879F9',
  },
  elevationContainer: {
    position: 'absolute',
    right: 14,
    top: 6,
    elevation: 4,
  },
});
