import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { ArrowForwardIcon } from 'native-base';
import Geocoder from 'react-native-geocoder';
import Geolocation from 'react-native-geolocation-service';
import ScreenHeader from '../../components/ScreenHeader';
import { showToast } from '../../Helper/index';
import ApplicationColors from '../../config/appColors';
import config from '../chat/common/config';
import { useNetworkStatus } from '../../hooks';
import { CHATCONVERSATION } from '../../constant';

Geocoder.fallbackToGoogle(config.GOOGLE_LOCATION_API_KEY);

/**
 * @typedef LocationState
 * @prop {number} latitude
 * @prop {number} longitude
 * @prop {number} latitudeDelta
 * @prop {number} longitudeDelta
 */

/**
 * @type {LocationState|null}
 */
const locationInitialValue = null;

const Location = ({ setLocalNav, handleSendMsg }) => {
  const [location, setLocation] = React.useState(locationInitialValue);
  const [locationAddress, setLocationAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const mapViewRef = useRef();
  const mapDeltaValue = useRef({
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const isInternetReachable = useNetworkStatus();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      goBackToPreviousScreen,
    );
    // fetching current location
    getCurrentLocation();
    return () => {
      backHandler.remove();
    };
  }, []);

  React.useEffect(() => {
    if (location) {
      fetchAddressForLocation(location);
    }
  }, [location]);

  const goBackToPreviousScreen = () => {
    setLocalNav(CHATCONVERSATION);
  };

  const handleSendLocation = () => {
    if (isInternetReachable) {
      const locationObj = {
        type: 'location',
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      };
      handleSendMsg(locationObj);
      setLocalNav(CHATCONVERSATION);
    } else {
      showNoConnectivityToast();
    }
  };

  const fetchAddressForLocation = _location => {
    const { latitude, longitude } = _location;
    if (!isInternetReachable) {
      return;
    }
    if (latitude && longitude) {
      Geocoder.geocodePosition({
        lat: latitude,
        lng: longitude,
      }).then(res => {
        // find the nearest coords address
        const nearestAddress = getNearestCoordsData(
          {
            lat: latitude,
            lng: longitude,
          },
          res,
        );
        if (nearestAddress) {
          let {
            formattedAddress = '',
            subLocality = '',
            locality = '',
            adminArea = '',
            postalCode = '',
          } = nearestAddress;
          const doesHaveCode = formattedAddress
            .substring(0, formattedAddress.indexOf(' '))
            .includes('+');
          if (doesHaveCode) {
            formattedAddress = formattedAddress.substring(
              formattedAddress.indexOf(' ') + 1,
            );
          }
          // extracting local address like "No 2 John street, Triplicane, "
          const localityAddress = formattedAddress.substring(
            0,
            formattedAddress.indexOf(locality) - 2,
          );
          setLocationAddress({
            streetAddress: localityAddress,
            subLocality,
            locality,
            adminArea,
            postalCode,
          });
        } else {
          setLocationAddress({
            streetAddress: '',
            subLocality: '',
            locality: '',
            adminArea: '',
            postalCode: '',
          });
        }
      });
    }
  };

  const getNearestCoordsData = (targetCoords, addressArray) => {
    // Function to calculate Euclidean distance between two points
    const calculateDistance = (_lat, _lng) => {
      const dx = _lat - targetCoords.lat;
      const dy = _lng - targetCoords.lng;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Initialize variables to store the nearest coordinates and minimum distance
    let nearestCoordsAddress = null;
    let minDistance = Infinity;

    // Loop through the addressArray to find the nearest coordinates
    for (const address of addressArray) {
      const { lat, lng } = address.position;
      const distance = calculateDistance(lat, lng);

      // Update the nearest coordinates if the current distance is smaller
      if (distance < minDistance) {
        minDistance = distance;
        nearestCoordsAddress = address;
      }
    }
    return nearestCoordsAddress;
  };

  const getCurrentLocation = () => {
    try {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLocation({
            latitude,
            longitude,
            latitudeDelta: mapDeltaValue.current.latitudeDelta,
            longitudeDelta: mapDeltaValue.current.longitudeDelta,
          });
          setIsLoading(false);
        },
        error => {
          setIsLoading(false);
          console.error('Error getting current location:', error);
          showToast('Unable to get current location', {
            id: 'location-error-toast',
          });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch (error) {
      setIsLoading(false);
      console.error('Failed to get current location: ', error);
    }
  };

  const showNoConnectivityToast = () => {
    showToast('Please check your internet connection', {
      id: 'location-no-internet-toast',
    });
  };

  const handleMapPress = e => {
    const { coordinate } = e.nativeEvent;
    const newRegion = {
      ...coordinate,
      latitudeDelta: mapDeltaValue.current.latitudeDelta,
      longitudeDelta: mapDeltaValue.current.longitudeDelta,
    };
    setLocation(newRegion);
    mapViewRef.current.animateToRegion(newRegion, 500);
  };

  const handleRegionChange = region => {
    mapDeltaValue.current.latitudeDelta = region.latitudeDelta;
    mapDeltaValue.current.longitudeDelta = region.longitudeDelta;
  };

  const renderMapView = () => {
    if (isLoading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size={'large'}
            color={ApplicationColors.mainColor}
          />
        </View>
      );
    }

    return (
      <MapView
        style={styles.map}
        initialRegion={location}
        ref={mapViewRef}
        onRegionChangeComplete={handleRegionChange}
        showsCompass={true}
        showsMyLocationButton={true}
        showsScale={true}
        onPress={handleMapPress}>
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
          />
        )}
      </MapView>
    );
  };

  const renderCityDistrictAndPostalCode = () => {
    const _locaility = locationAddress.locality
      ? locationAddress.locality + ', '
      : '';
    const _adminArea = locationAddress.adminArea
      ? locationAddress.adminArea + ', '
      : '';
    const _postalCode = locationAddress.postalCode || '';
    return _locaility + _adminArea + _postalCode;
  };

  const renderFooter = () => {
    if (location != null && Boolean(locationAddress) && isInternetReachable) {
      return (
        <View style={styles.mapFooter}>
          <View style={styles.addressContainer}>
            <Text style={styles.LocText}>Send this location</Text>
            <View>
              <Text style={styles.addSubText}>
                {locationAddress.streetAddress}
              </Text>
              <Text style={styles.addCityText}>
                {renderCityDistrictAndPostalCode()}
              </Text>
            </View>
          </View>
          <View style={styles.elevationContainer}>
            <Pressable onPress={handleSendLocation}>
              <View style={styles.ArrowIcon}>
                <ArrowForwardIcon color={'#fff'} />
              </View>
            </Pressable>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ScreenHeader
          title="User Location"
          onhandleBack={goBackToPreviousScreen}
        />
      </View>
      {renderMapView()}
      {renderFooter()}
    </View>
  );
};

export default Location;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
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
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  LocText: {
    color: '#4879F9',
    fontSize: 14,
    fontWeight: '400',
  },
  addressContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 15,
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
    paddingTop: 4,
    fontSize: 15,
    fontWeight: 'bold',
  },
  addCityText: {
    color: '#4D4D4D',
    fontSize: 13,
    fontWeight: '400',
    paddingBottom: 4,
  },
  ArrowIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#4879F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    elevation: 4,
    borderColor: '#4879F9',
  },
  elevationContainer: {
    elevation: 4,
    marginTop: 6,
  },
});
