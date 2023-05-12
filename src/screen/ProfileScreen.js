import { BackHandler, StyleSheet, Text, TouchableOpacity, View, Image, TextInput, ScrollView } from 'react-native'
import React from 'react';
//import { PrimaryPillBtn } from '../common/Button';
import { useDispatch, useSelector } from 'react-redux';
import { CHATSCREEN, RECENTCHATSCREEN } from '../constant';
import {navigate} from '../redux/navigationSlice';

const ProfileScreen = () => {
  const [imageUri, setImageUri] = React.useState(null);
  // const [mail, setMail] = React.useState("");
  // const [mobileNumber, setMobileNumber] = React.useState("");
  // const [status, setStatus] = React.useState("");
  const dispatch = useDispatch();
  const isLoading = useSelector(state => state.auth.status);
  const isConnect = useSelector(state => state.auth.isConnected);

  //   React.useEffect(() => {
  //     if (isConnect == CONNECTED) {
  //         let nav = { screen: CHATSCREEN }
  //         dispatch(navigate(nav))
  //     }
  // }, [isConnect])

  const selectImage = () => {
    ImagePicker.showImagePicker(
      {
        mediaType: 'photo',
        maxWidth: 150,
        maxHeight: 150,
        quality: 0.8,
      },
      response => {
        if (response.uri) {
          setImageUri(response.uri);
        }
      },
    );

    ImagePicker.launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 150,
        maxHeight: 150,
        quality: 0.8,
      },
      response => {
        if (response.uri) {
          setImageUri(response.uri);
        }
      },
    );
  };
  
  const selectCountryHandler = () => {
    let x = { screen: RECENTCHATSCREEN }
    dispatch(navigate(x))
}
  

  return (
    <View style={{}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Text style={styles.profileText}>Profile</Text>
        </View>
        <View style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={selectImage}>
              {imageUri && <Image style={styles.imageView} resizeMode="contain" source={{ uri: imageUri }} />}
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text style={styles.nameText} numberOfLines={1} >Ashik sikkanthar</Text>
        </View>
        <View style={{ marginTop: 50, }}>
          <View style={styles.mainCotainer}>
            <Text style={{ fontSize: 13, color: "black", fontWeight: "bold" }}>
              Email
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center", borderBottomColor: "#D3D3D3",
              borderBottomWidth: 1
            }}>
              <Image style={styles.imageView} resizeMode="contain" source={require('../assets/call.png')} />
              <TextInput
                style={{ marginLeft: 10 }}
                // value={mobileNumber}
                placeholder='Enter Email Id'
                maxLength={20}
                placisLoadingholderTextColor={"#959595"}
                keyboardType="numeric"
                numberOfLines={1}
              />
            </View>
          </View>
          <View style={styles.mainCotainer}>
            <Text style={{ fontSize: 13, color: "black", fontWeight: "bold" }}>
              Mobile Number
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center", borderBottomColor: "#D3D3D3",
              borderBottomWidth: 1
            }}>
              <Image style={styles.imageView} resizeMode="contain" source={require('../assets/call.png')} />
              <TextInput
                style={{ marginLeft: 10 }}
                // value={mobileNumber}
                placeholder='Enter Your Mobile Number'
                maxLength={20}
                placisLoadingholderTextColor={"#959595"}
                keyboardType="numeric"
                numberOfLines={1}
              />
            </View>
          </View>
          <View style={styles.mainCotainer}>
            <Text style={{ fontSize: 13, color: "black", fontWeight: "bold" }}>
              Status
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center", borderBottomColor: "#D3D3D3",
              borderBottomWidth: 1
            }}>
              <Image style={styles.imageView} resizeMode="contain" source={require('../assets/call.png')} />
              <TextInput
                style={{ marginLeft: 10 }}
                // value={mobileNumber}
                placeholder='Enter Your Mobile Number'
                maxLength={20}
                placisLoadingholderTextColor={"#959595"}
                keyboardType="numeric"
                numberOfLines={1}
              />
            </View>
            <View style={{}} />
          </View>
          <View style={{ marginTop: 10,  }}>
          <TouchableOpacity style={styles.button} onPress={selectCountryHandler} >

          <Text style={{fontSize:20,color:"#FFFf",textAlign:"center"}}>Save</Text>
          </TouchableOpacity>

          
            {/* <PrimaryPillBtn title='save' isLoading={isLoading}  
  //onPress={() => { handleSubmit() }}
   /> */}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({

  imageContainer: {
    height: 65,
    backgroundColor: "#E2E2E2",
    justifyContent: "center",
    alignItems: "center"
  },
  imageView:
  {
    width: 20,
    height: 20
  },
  profileContainer: {
    // flex:1,
    marginHorizontal: 10,
    backgroundColor: "#E2E2E2",
    borderRadius: 70,
    width: 150,
    height: 150,
    borderWidth: 1,
    marginTop: 50,


  },
  profileText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,


  },
  mainCotainer:
  {
    marginTop: 15,
    marginHorizontal: 24,
    // borderBottomColor:"red",
    // borderBottomWidth:1

  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginTop: 10
  },
  button:{
    backgroundColor:"#3276E2",
    marginHorizontal:85,
    borderRadius:8,  
    padding:7,
      alignItems: 'center',
    marginTop: 42,
   
  }
})