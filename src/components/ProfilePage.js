import { BackHandler, StyleSheet, TouchableOpacity, View, Image, TextInput, ScrollView, PermissionsAndroid, ToastAndroid } from 'react-native'
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CallIcon, MailIcon, ProfileIcon, StatusIcon } from '../common/Icons';
const logo = require('../assets/profile.png');
import { Modal, Center, Box, Text, VStack, useToast, Spinner, Stack, Icon, Input, HStack, Avatar, AlertDialog, Button, Pressable } from "native-base";
import { SDK } from '../SDK';
import ImagePicker from 'react-native-image-crop-picker';
import Avathar from "../common/Avathar";
import { RECENTCHATSCREEN } from '../constant';
import { navigate } from '../redux/navigationSlice';
import { convertToFileType } from '../common/utils';

const ProfilePage = (props) => {

  const phoneNumber = useSelector(state => state.auth.userData);

  const userJid = useSelector(state => state.auth.currentUserJID);
  const toast = useToast();
  const [placement, setPlacement] = React.useState(undefined);
  const [open, setOpen] = React.useState(false);
  const [remove, setRemove] = React.useState(false);
  const onClose = () => setRemove(false);
  const [mobileNumber, setMobileNumber] = React.useState("");
  // const [status, setStatus] = React.useState("Available");
  const dispatch = useDispatch();
  const [loading, setloading] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(props.profileInfo.image);
  const [baseImage, setBaseImage] = React.useState(null);
  // const [isModified, setIsModified] = React.useState(false);
  const [receivedData, setReceivedData] = React.useState({});
  const [gettingData, setGettingData] = React.useState({});
  
  const OnStatusHandler = () => {
    props.setNav("statusPage");

  }
console.log(props.profileInfo);
  const handleImage = () => { 
    if (selectedImage) {

      
     props.setNav("ProfileImage");
      
    }

    else {
      setOpen(true);
      setPlacement(placement);
    }
 

    
  };

  React.useEffect(() => {
    (async () => {

      let userId = userJid.split("@")[0]
      let getUserInfo = await SDK.getUserProfile(userId);
      console.log("get profile", getUserInfo);
      // setName(getUserId?.data?.nickName)
      // setMail(getUserId?.data?.email)
      // setStatus(getUserId?.data?.status)
      // setSelectedImage(getUserId?.data?.image)

    })()
  }, [])

  const handleProfileUpdate = async () => {

    // console.log(gettingData);
    // const { userName, phone, email, status} = gettingData;
    // console.log(userName);
    // console.log(phone);
    // console.log(email);
    // console.log(status);

    if (!props?.profileInfo?.nickName ) {
      return toast.show({
        duration: 700,
        render: () => {

          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>UserName cannot be empty</Text>
          </Box>
        }
      })
    }

    if (props?.profileInfo?.nickName.length < '4') {
      return toast.show({
        duration: 700,
        keyboardAvoiding: true,
        onClose: () => {
          console.log('====================================');
          console.log("on close method ....");
          console.log('====================================');

        },
        render: () => {

          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>User Name is too short</Text>

          </Box>
        }
      })
    }

    if (!props?.profileInfo?.email) {
      return toast.show({
        duration: 700,
        render: () => {
          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>Please Enter the Mail</Text>

          </Box>
        }
      })
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(props?.profileInfo?.email )) {

      return toast.show({
        duration: 700,
        render: () => {
          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>Please enter a Valid E-Mail</Text>

          </Box>;
        }
      })
    }
    setloading(true);
    //inputRef.current.focus();
    //  props.setNav(StatusPage);
    // setIsModified(false);
    let UserInfo = await SDK.setUserProfile(userName,'', '', phone, email);

    console.log(UserInfo);

    let x = { screen: RECENTCHATSCREEN }
    dispatch(navigate(x))
    if (UserInfo) {
      return toast.show({
        duration: 700,
        render: () => {
          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>Profile Updated successfully</Text>
          </Box>;
        }
      })
    }
  }

  React.useEffect(() => {
    requestCameraPermission();


  }, []);

  React.useEffect(() => {

    requestStoragePermission();

  }, []);


  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your device storage to pick images.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Storage permission granted');
      } else {
        console.log('Storage permission denied');
      }
    } catch (error) {
      console.warn('Failed to request storage permission:', error);
    }
  };


  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs camera access to capture photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Camera permission granted');
      } else {
        console.log('Camera permission denied');
      }
    } catch (error) {
      console.warn('Failed to request camera permission:', error);
    }
  };


  const handleCameraPicker = () => {
    ImagePicker.openCamera({
      mediaType: 'photo',
      width: 150,
      height: 150,
      cropping: true,
      cropperCircleOverlay: true,
     // includeBase64: true,

    }).then((image) => {

      //  const blob= base64ToBlob(image.data);
      //  console.log('====================================');
      //  console.log(blob);
      //  console.log('====================================');
     
      setSelectedImage(image);

      console.log(image);
    
      props.setProfileInfo({
        ...props.profileInfo,
        image:image
       })
      // convertToFileType();
      // setBaseImage(blob);
      // console.log(blob);
      setOpen(false);

    }).catch((error) => {
      console.log('ImagePicker Error: ', error);
    });
  };

  const handleGalleryPicker = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      width: 150,
      height: 150,
      multiple: false,
      cropping: true,
      cropperCircleOverlay: true,
      // includeBase64: true,
    }).then(async(image) => {

      // const blob= base64ToBlob(image.data);
      // console.log('====================================');
      // console.log(blob);
      // console.log('====================================');
      //  console.log(image);
      setSelectedImage(image);

      props.setProfileInfo({
        ...props.profileInfo,
         image:image
       })
      // console.log(image);
      // let file = await convertToFileType(image.path);
      // console.log(file)
      // setBaseImage(file);
      setOpen(false);
      //console.log(blob);

    }).catch((error) => {
      console.log(' Gallery ImagePicker Error: ', error);
    });
    // Alert("Galery Working...");
  };

  const handleRemove = () => {
    setRemove(!remove)
  }

  // const handleUsername = (text) => {
  //   // setName(text);
  //   setGettingData({ ...gettingData, userName: text })
  //   setIsModified(true);
  // };

  // const handleEmail = (text) => {
  //   // setMail(text);
  //   setGettingData({ ...gettingData, email: text })
  //   setIsModified(true);
  // };

  // const handleStatus = (text) => {
  //   // setStatus(text);
  //   setGettingData({ ...gettingData, status: text })
  //   setIsModified(true);
  // };

  const handleChangeText = (name,value) => {
   props.setProfileInfo({
    ...props.profileInfo,
    [name] :value
   }
   )
  }

  React.useEffect(() => {
    //console.log(gettingData)
    handleChangeText('phone', phoneNumber.username)

  }, [phoneNumber])

  return (
    // <View style={{ flex: 1 }}>
    <>
      <Stack h={53} bg="#F2F2F2" w="full" justifyContent={"center"}>
        <Text color="black" fontSize="21" fontWeight="600" textAlign="center" >
          Profile
        </Text>
      </Stack>

      {/* <View style={{ flex: 1 }}> */}
      <VStack h='full' justifyContent={'center'} >
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack mt="16" flex="1" alignItems={"center"}>
            <TouchableOpacity activeOpacity={1} onPress={handleImage} style={{ position: "relative" }}>
              {selectedImage && <Image resizeMode="contain" source={{ uri: props.profileInfo.image.path  }} style={{ height: 157, width: 157, borderRadius: 100 }} />}
              {!selectedImage && gettingData.userName && <Avathar width={157} height={157} data={props.profileInfo.nickName} backgroundColor={"blue"} />}
              {!selectedImage && !gettingData.userName && <Image resizeMode="contain" source={require('../assets/profile.png')} style={{ height: 157, width: 157, }} />}

              <TouchableOpacity activeOpacity={1} onPress={() => setOpen(true)} style={{ position: "absolute", right: 0, bottom: 0, }}  >
                <Image resizeMode="contain" source={require('../assets/camera.png')} style={styles.CameraImage} />
              </TouchableOpacity>
            </TouchableOpacity>
            {/* <Stack mt="3"  flex="1"  alignItems="center" justifyContent="center"> */}
            <TextInput

              textAlign="center"
              style={{ fontSize: 18, fontWeight: "700", marginTop: 5, width: 95 }}
              value={gettingData?.userName}
              placeholder='Username'
              onChangeText={(text)=>{ handleChangeText('nickName',text)}}
              maxLength={15}
              placeholderTextColor={"#959595"}
              keyboardType="default"
              numberOfLines={1}
            />
            {/* </Stack> */}
          </VStack>
          <Stack mt="34"
            px="3"
            borderBottomColor="#F2F2F2"
            borderBottomWidth="1">
            <Text fontSize="14" color="black" fontWeight="500" >
              Email
            </Text>
            <HStack
              alignItems="center" >
              <MailIcon />
              <Input variant="unstyled"
                color="#959595"
                flex="1"
                fontSize="13"
               
                //onChangeText={handleEmail}
                onChangeText={(text) => handleChangeText('email', text)}
                placeholder='Enter Email Id'
                placeholderTextColor={"#959595"}
                keyboardType="email-address"
                numberOfLines={1}
              />
            </HStack>
          </Stack>
          <Stack mt="3"
            ml="3"
            borderBottomColor="#F2F2F2"
            borderBottomWidth="1">
            <Text fontSize="14" color="black" fontWeight="500">
              Mobile Number
            </Text>
            <HStack
              flexDirection="row" alignItems="center" >
              <CallIcon />
              <Input variant="unstyled"
                // ml="1"
                px="4"
                color="#959595"
                flex="1"
                fontSize="13"
                
                onChangeText={setMobileNumber}
                HStack placeholder='Enter Your Mobile Number'
                maxLength={15}
                editable={false}
                placeholderTextColor={"#959595"}
                keyboardType="numeric"
                numberOfLines={1}
              />
            </HStack>
          </Stack>
          <Stack mt="3"
            px="3"
            borderBottomColor="#F2F2F2"
            borderBottomWidth="1">
            <Text fontSize="14" color="black" fontWeight="500">
              Status
            </Text>
            <Pressable 
              onPress={OnStatusHandler} >
              <HStack
                flexDirection="row" mt="3" mb="3" flex={"1"}  alignItems="center" >

                <StatusIcon />
               
                <Text px={"3"} mr={"6"} numberOfLines={1}  color="#959595" fontSize="13"  fontWeight="500" >
                { props.profileInfo.status || "Avaliable" }
              
            </Text>       
              </HStack>
            </Pressable>
          </Stack>

          <Stack mt="50"  alignItems="center">
            <TouchableOpacity style={[styles.button, { width: gettingData ? 160 : 100 }]} onPress={handleProfileUpdate}>
              {/* {gettingData && <Text numberOfLines={1} style={{ fontSize: 15, color: "#FFFf", textAlign: "center", fontWeight: 300 }} >Update & Continue</Text>} */}

              <Text style={{ fontSize: 15, color: "#FFFf", textAlign: "center", fontWeight: 300 }} >Save</Text>
            </TouchableOpacity>
          </Stack>
          <Modal isOpen={open} onClose={() => setOpen(false)} safeAreaTop={true} >
            <Modal.Content width="1100" style={styles.bottom} >
              <Center w="100%">
                <Box maxW="350" w="120%">
                  <VStack space={4}>
                    <View style={{ padding: 4, }}>
                      <Text style={{ fontSize: 14, color: "#767676", }} >Options</Text>
                      <TouchableOpacity onPress={handleCameraPicker} style={{ paddingTop: 20 }}>
                        <Text style={{ fontSize: 14, color: "#767676", fontWeight: "500" }}>Take Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ paddingTop: 15 }} onPress={handleGalleryPicker}>
                        <Text style={{ fontSize: 14, color: "#767676", fontWeight: "500" }}>Choose from Gallery</Text>
                      </TouchableOpacity>
                      {selectedImage && !gettingData.userName && (<TouchableOpacity onPress={handleRemove} style={{ paddingTop: 15 }} >
                        <Text style={{ fontSize: 14, color: "#767676", fontWeight: "500" }}>Remove Photo</Text>
                      </TouchableOpacity>)}
                    </View>
                  </VStack>
                </Box>
              </Center>
            </Modal.Content>
          </Modal>

          <Center maxH={'40'} width={"50"} >
            <AlertDialog isOpen={remove} onClose={onClose}>
              <AlertDialog.Content>


                <AlertDialog.Body >
                  Are you sure you want to remove the photo?
                  <HStack ml="119" space={5}>
                    <TouchableOpacity onPress={onClose} >
                      <Text Color="red">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity color={"#3276E2"} onPress={onClose}>
                      <Text Color="#3276E2" >Remove</Text>
                    </TouchableOpacity>

                  </HStack>


                </AlertDialog.Body>




              </AlertDialog.Content>
            </AlertDialog>
          </Center>
          <Modal isOpen={loading} onClose={() => setloading(false)} style={styles.center} safeAreaTop={true} >
            <Modal.Content width="45" height="45" >
              <Center w="100%" h="full">

                <Spinner size="lg" color={'#3276E2'} />

              </Center>
            </Modal.Content>
          </Modal>
        </ScrollView>

      </VStack>
      {/* </View> */}

    </>

    // </View>
  )
}

export default ProfilePage

const styles = StyleSheet.create({
  imageContainer: {
    height: 65,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center"
  },
  imageView:
  {
    width: 20,
    height: 20
  },
  profileContainer: {
    marginHorizontal: 10,
    marginTop: 50,

  },
  profileText: {
    textAlign: "center",
    fontWeight: "700",
    color: "black",
    fontSize: 18,
  },
  userText: {
    fontWeight: "700",
    textAlign: "center",
    width: 400
  },
  ContentContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  mainCotainer:
  {
    marginTop: 15,
    paddingHorizontal: 10,
    borderBottomColor: "#F2F2F2",
    borderBottomWidth: 1

  },
  nameText: {
    fontSize: 20,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
    marginTop: 10
  },
  button: {
    backgroundColor: "#3276E2",
    borderRadius: 22,
    padding: 10

  },

  top: {
    marginBottom: "auto",
    marginTop: 0
  },
  bottom: {
    marginBottom: 0,
    paddingVertical: 12,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 3,
    borderColor: "#D0D8EB",
    marginTop: "auto",
    borderBottomWidth: 3,
    borderBottomColor: "#D0D8EB"

  },


  CameraImage: {
    height: 42,
    width: 42
  }
})