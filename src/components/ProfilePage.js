import { BackHandler, StyleSheet, TouchableOpacity, View, Image, TextInput, ScrollView, PermissionsAndroid, ToastAndroid } from 'react-native'
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CallIcon, MailIcon, StatusIcon } from '../common/Icons';
import { Modal, Center, Box, Text, VStack, useToast, Spinner, Stack, Input, HStack, AlertDialog, Pressable } from "native-base";
import { SDK } from '../SDK';
import ImagePicker from 'react-native-image-crop-picker';
import Avathar from "../common/Avathar";
import { RECENTCHATSCREEN, REGISTERSCREEN } from '../constant';
import { navigate } from '../redux/navigationSlice';
import ScreenHeader from './ScreenHeader';

const ProfilePage = (props) => {
  const selectProfileInfo = useSelector((state) => state.profile.profileInfoList);
  const userData = useSelector((state) => state.auth.userData);
  const prevPageInfo = useSelector((state) => state.navigation.prevScreen);
  const toast = useToast();
  const [placement, setPlacement] = React.useState(undefined);
  const [open, setOpen] = React.useState(false);
  const [remove, setRemove] = React.useState(false);
  const [mobileNumber, setMobileNumber] = React.useState("");
  const dispatch = useDispatch();
  const [loading, setloading] = React.useState(false);
  const [isToastShowing, setIsToastShowing] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState(props.profileInfo.image);
  const handleBackBtn = () => {
    let x = { screen: RECENTCHATSCREEN }
    dispatch(navigate(x))
    return true;
  }

  const OnStatusHandler = () => {
    props.onChangeEvent();
    props.setNav("statusPage");
  }

  const handleImage = () => {
    if (selectedImage) {
      props.setNav("ProfileImage");
    }

    else {
      setOpen(true);
      setPlacement(placement);
    }
  };

  const handleProfileUpdate = async () => {
    setIsToastShowing(true)
    if (!props?.profileInfo?.nickName && !isToastShowing) {
      return toast.show({
        duration: 2500,
        onCloseComplete: () => {
          setIsToastShowing(false)
        },
        render: () => {
          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>please enter your username</Text>
          </Box>
        }
      })
    }

    if (selectProfileInfo.nickName.length < '4' && !isToastShowing) {
      return toast.show({
        duration: 2500,
        keyboardAvoiding: true,
        onCloseComplete: () => {
          setIsToastShowing(false)
        },
        render: () => {

          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>User Name is too short</Text>
          </Box>
        }
      })
    }

    if (!selectProfileInfo.email && !isToastShowing) {
      return toast.show({
        duration: 2500,
        onCloseComplete: () => {
          setIsToastShowing(false)
        },
        render: () => {
          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>Email should not be empty</Text>
          </Box>
        }
      })
    }
    if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(selectProfileInfo.email && !isToastShowing)) {

      return toast.show({
        duration: 2500,
        onCloseComplete: () => {
          setIsToastShowing(false)
        },
        render: () => {
          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>Please enter a Valid E-Mail</Text>

          </Box>;
        }
      })
    }
    setloading(true);
    let UserInfo = await SDK.setUserProfile(props?.profileInfo?.nickName, '', props.profileInfo.status, mobileNumber, props.profileInfo.email);
    let x = { screen: RECENTCHATSCREEN, }
    dispatch(navigate(x))
    if (UserInfo && !isToastShowing) {
      return toast.show({
        duration: 2500,
        onCloseComplete: () => {
          setIsToastShowing(false)
        },
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


    }).then((image) => {
      setSelectedImage(image);
      props.setProfileInfo({
        ...props.profileInfo,
        image: image
      })
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
    }).then(async (image) => {
      setSelectedImage(image);
      props.setProfileInfo({
        ...props.profileInfo,
        image: image
      })
      setOpen(false);
    }).catch((error) => {
      console.log(' Gallery ImagePicker Error: ', error);
    });
  };

  const handleRemove = () => {
    setRemove(!remove);
  }

  const onClose = () => {
    setRemove(false)
    setOpen(false);
    setSelectedImage('');
  }

  const handleChangeText = (name, value) => {
    props.onChangeEvent()
    props.setProfileInfo({
      ...props.profileInfo,
      [name]: value,
    })
  }

  return (
    <>
      <Stack h={53} bg="#F2F2F2" w="full" justifyContent={"center"}>
        {prevPageInfo == REGISTERSCREEN ?
          <Text textAlign={"center"} fontSize='xl' fontWeight={'600'} >Profile</Text>
          : <ScreenHeader
            title='Profile'
            onhandleBack={handleBackBtn}
          />}
      </Stack>
      <VStack h='full' justifyContent={'center'} >
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack mt="16" flex="1" alignItems={"center"}>
            <TouchableOpacity activeOpacity={1} onPress={handleImage} style={{ position: "relative" }}>
              {selectedImage && <Image resizeMode="contain" source={{ uri: props.profileInfo.image.path }} style={{ height: 157, width: 157, borderRadius: 100 }} />}
              {!selectedImage && props?.profileInfo?.nickName && <Avathar fontSize={60} width={157} height={157} data={props.profileInfo.nickName} backgroundColor={"blue"} />}
              {!selectedImage && !props?.profileInfo?.nickName && <Image resizeMode="contain" source={require('../assets/profile.png')} style={{ height: 157, width: 157, }} />}
              <TouchableOpacity activeOpacity={1} onPress={() => setOpen(true)} style={{ position: "absolute", right: 0, bottom: 0, }}  >
                <Image resizeMode="contain" source={require('../assets/camera.png')} style={styles.CameraImage} />
              </TouchableOpacity>
            </TouchableOpacity>
            <TextInput
              textAlign="center"
              style={{ fontSize: 18, fontWeight: "700", marginTop: 5 }}
              defaultValue={props.profileInfo.nickName}
              placeholder='Username'
              onChangeText={(text) => { handleChangeText('nickName', text) }}
              maxLength={20}
              placeholderTextColor={"#959595"}
              keyboardType="default"
              numberOfLines={1}
            />
          </VStack>
          <Stack mt="7"
            px="3"
            borderBottomColor="#F2F2F2"
            borderBottomWidth="1">
            <Text fontSize="14" color="black" fontWeight="500">Email</Text>
            <HStack
              alignItems="center" >
              <MailIcon />
              <Input variant="unstyled"
                color="#959595"
                flex="1"
                fontSize="13"
                editable={(prevPageInfo == REGISTERSCREEN)}
                defaultValue={props.profileInfo.email}
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
            <HStack flexDirection="row" alignItems="center" mt="1" mb="3" >
              <CallIcon />
              <Text px={"3"} mt="2" mr={"6"} numberOfLines={1} color="#959595" fontSize="13" fontWeight="500">+{userData.username}</Text>
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
                flexDirection="row" mt="3" mb="3" flex={"1"} alignItems="center" >
                <StatusIcon />
                <Text px={"3"} mr={"6"} numberOfLines={1} color="#959595" fontSize="13" fontWeight="500" >
                  {props.profileInfo.status || "Avaliable"}
                </Text>
              </HStack>
            </Pressable>
          </Stack>
          <Stack mt="50" alignItems="center">
            {prevPageInfo == REGISTERSCREEN ?
              <TouchableOpacity style={[styles.button, { width: props.onChangeEvent() ? 160 : 100, backgroundColor: '#3276E2' }]} onPress={handleProfileUpdate}>
                {prevPageInfo == REGISTERSCREEN &&
                  <>
                    {props.onChangeEvent()
                      ? <Text numberOfLines={1} style={{ fontSize: 15, color: "#FFFf", textAlign: "center", fontWeight: 300 }} >Update & Continue</Text>
                      : <Text style={{ fontSize: 15, color: "#FFFf", textAlign: "center", fontWeight: 300 }} >Save</Text>
                    }
                  </>
                }
              </TouchableOpacity>
              : <TouchableOpacity disabled={!props.onChangeEvent()} style={[styles.button, { width: 100, backgroundColor: props.onChangeEvent() ? '#3276E2' : "#d3d3d3", }]} onPress={handleProfileUpdate}>
                   <Text style={{ fontSize: 15, color: "#FFFf", textAlign: "center", fontWeight: 300 }} >Save</Text>
              </TouchableOpacity>
            }
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
                      {selectedImage && (<TouchableOpacity onPress={handleRemove} style={{ paddingTop: 15 }} >
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
                      <Text color={"blue.800"} >Cancel</Text>
                    </TouchableOpacity>
                    {selectedImage && <TouchableOpacity color={"#3276E2"} onPress={onClose}>
                      <Text color={"blue.800"} >Remove</Text>
                    </TouchableOpacity>}
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
    </>
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