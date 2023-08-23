import { View, Text } from 'native-base';
import React from 'react';
import { Image, Pressable, Linking, ImageBackground } from 'react-native';

const MapCard = (props) => {
 
  
  const mapHandler = () => {
    Linking.openURL("https://www.google.co.in/maps/place/CONTUS+TECH/@13.0104824,80.2064899,17z/data=!3m2!4b1!5s0x3a5267401095b6c3:0x8e18de1ed0748b0a!4m6!3m5!1s0x3a5260d084dc54cd:0xb3e84ab20dc3785e!8m2!3d13.0104824!4d80.2090648!16s%2Fg%2F1tjym3x5?entry=ttu");
    
  };
  const imageUrl = 'https://subli.info/wp-content/uploads/2015/05/google-maps-blur.png';

  return (
    <View  borderColor={'#E2E8F7'} borderWidth={2} borderRadius={10} >
    <View  width={195} height={170}>
      <Pressable onPress={mapHandler}>
        <Image
          source={{ uri: imageUrl }}
          resizeMode="cover"
          style={{
            width: 194,
            height: 171,
            borderRadius: 8
          }}
        />
      </Pressable>
      <View position="absolute" borderRadius={10} bottom={0.4} right={1}>
        <ImageBackground
          source={require('../assets/ic_baloon.png')}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", width: 130, resizeMode:'cover',borderTopRightRadius:20,borderBottomRightRadius:20 }}
        >
          {props.status}
          <Text pl={1} pr="2" color="#FFF" fontSize="10" fontWeight={400}>
            {props.timeStamp}
          </Text>
        </ImageBackground>
      </View>
    </View>
    </View>
  );
};
export default MapCard;
