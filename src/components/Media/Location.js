import { BackHandler, StyleSheet, Text, View,Alert,PermissionsAndroid, TouchableOpacity } from 'react-native';
import React,{ useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import ScreenHeader from 'components/ScreenHeader';

const Location = props => {
    const [currentLocation, setCurrentLocation] = React.useState(null);

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
            // Handle the case where the user denied the location permission
          }
        } catch (error) {
          console.error('Failed to request location permission:', error);
        }
      };

      
    useEffect(() => {
      requestLocationPermission();
    }, []);
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

 React. useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
      },
      (error) => {
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
        }
      >
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
        <Text style={styles.addressText}>Defence Colony 2nd Ave</Text>
        <Text style={styles.addSubText} numberOfLines={1}>Sundar Nagar, Gandhi Nagar Chennai, Tamil Nadu 600032</Text>
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
    paddingHorizontal:100, 
    paddingVertical:100
  },
  mapFooter:{
    backgroundColor:"#fff",
   flex:0.6,
    paddingVertical:15,
    paddingHorizontal:18,
  },
  LocText:{  
    color:"#4879F9",
    fontSize:12,
    fontWeight:"400"
  },
  addressText:
  {
    color:"#000",
    fontSize:16,
    paddingTop:8,
    fontWeight:"bold"
  },
  addSubText:{
    color:"#4D4D4D",
    fontSize:12,
    flex:0.2,
    fontWeight:"400"
  }
});
