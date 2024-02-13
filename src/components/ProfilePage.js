import {
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CallIcon, MailIcon, StatusIcon } from '../common/Icons';
import {
  Modal,
  Center,
  Box,
  Text,
  VStack,
  useToast,
  Spinner,
  Stack,
  HStack,
  AlertDialog,
  Pressable,
} from 'native-base';
import SDK from '../SDK/SDK';
import ImagePicker from 'react-native-image-crop-picker';
import Avathar from '../common/Avathar';
import { PROFILESCREEN, RECENTCHATSCREEN, REGISTERSCREEN } from '../constant';
import { navigate } from '../redux/Actions/NavigationAction';
import ScreenHeader from './ScreenHeader';
import { getImageSource, mediaObjContructor, requestStoragePermission } from '../common/utils';
import { useNetworkStatus } from '../hooks';
import { PrimaryPillBtn } from '../common/Button';
import AuthProfileImage from '../common/AuthProfileImage';
import * as RootNav from '../Navigation/rootNavigation';
import ProfileImage from '../assets/profile.png';
import CamerIcon from '../assets/camera.png';
import { showToast } from '../Helper/index';

const ProfilePage = props => {
  const { selectProfileInfo, profileInfo } = props;
  const toast = useToast();
  const dispatch = useDispatch();
  const prevPageInfo = useSelector(state => state.navigation.prevScreen);
  const isFetchingProfile = useSelector(
    state => state.profile.status === 'loading',
  );
  const [open, setOpen] = React.useState(false);
  const [remove, setRemove] = React.useState(false);
  const [loading, setloading] = React.useState(false);
  const [imageUploading, setImageUploading] = React.useState(false);
  const [isToastShowing, setIsToastShowing] = React.useState(false);
  const [imageFileToken, setImageFileToken] = React.useState('');
  const isConnected = useNetworkStatus();
  let userName = selectProfileInfo?.nickName || profileInfo?.nickName;

  const [nickName, setNickName] = React.useState('');
  const toastConfig = {
    id: 'profile-toast',
    duration: 2500,
    avoidKeyboard: true,
  };

  React.useEffect(() => {
    setNickName(userName);
  }, [selectProfileInfo?.nickName]);

  const handleBackBtn = () => {
    let x = { prevScreen: PROFILESCREEN, screen: RECENTCHATSCREEN };
    if (prevPageInfo !== REGISTERSCREEN) {
      dispatch(navigate(x));
      RootNav.navigate(RECENTCHATSCREEN);
    }
    return true;
  };

  const OnStatusHandler = () => {
    props.onChangeEvent();
    props.setNav('statusPage');
  };

  const handleImage = position => {
    Keyboard.dismiss();

    setIsToastShowing(true);
    if (!isConnected && !isToastShowing) {
      return toast.show({
        ...toastConfig,
        render: () => {
          return (
            <Box bg="black" px="2" py="1" rounded="sm">
              <Text style={styles.toastText}>
                Please check your internet connectivity
              </Text>
            </Box>
          );
        },
      });
    } else if (isConnected) {
      if (position === 'big') {
        if (props?.profileInfo?.image) {
          props.setNav('ProfileImage');
        } else {
          setOpen(true);
        }
      } else {
        setOpen(true);
      }
    }
  };

  const handleProfileUpdate = async () => {
    setIsToastShowing(true);
    const validation =
      nickName?.trim() &&
      nickName?.trim()?.length > 2 &&
      props?.profileInfo?.email &&
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        props?.profileInfo?.email,
      );
    if (!nickName?.trim()) {
      return showToast('Please enter your username', toastConfig);
    }
    if (nickName?.trim()?.length < 3) {
      return showToast('Username is too short', toastConfig);
    }
    if (!props?.profileInfo?.email) {
      return showToast('Email should not be empty', toastConfig);
    }
    if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        props?.profileInfo?.email,
      )
    ) {
      return showToast('Please enter a Valid E-Mail', toastConfig);
    }
    if (!isConnected) {
      return showToast('Please check your internet connectivity', toastConfig);
    }
    if (isConnected && validation) {
      setloading(true);
      let UserInfo = await SDK.setUserProfile(
        nickName?.trim(),
        imageFileToken ? imageFileToken : props.selectProfileInfo.image,
        props.profileInfo?.status,
        props.profileInfo?.mobileNumber,
        props.profileInfo?.email,
      );
      setloading(false);
      if (UserInfo.statusCode === 200) {
        let x = { screen: RECENTCHATSCREEN, prevScreen: PROFILESCREEN };
        prevPageInfo === REGISTERSCREEN && dispatch(navigate(x));
        RootNav.reset(RECENTCHATSCREEN);
        return showToast('Profile Updated successfully', toastConfig);
      } else {
        return showToast(UserInfo.message, toastConfig);
      }
    }
  };

  const handleCameraPicker = () => {
    setOpen(false);
    ImagePicker.openCamera({
      mediaType: 'photo',
      width: 450,
      height: 450,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageQuality: 0.8,
    })
      .then(async image => {
        if (image.size > '10485760') {
          return toast.show({
            ...toastConfig,
            render: () => {
              return (
                <Box bg="black" px="2" py="1" rounded="sm">
                  <Text style={styles.toastText}>Image size too large</Text>
                </Box>
              );
            },
          });
        }
        setImageUploading(true);
        let sdkRes;
        if (image) {
          sdkRes = await SDK.profileUpdate(mediaObjContructor('IMAGE_PICKER',image));
        }
        console.log('sdkRes', sdkRes);
        if (sdkRes?.statusCode === 200) {
          setImageFileToken(sdkRes.imageFileToken);
          await SDK.setUserProfile(
            props?.selectProfileInfo?.nickName,
            sdkRes.imageFileToken,
            props?.selectProfileInfo?.status,
            props?.selectProfileInfo?.mobileNumber,
            props?.selectProfileInfo?.email,
          );
          setImageUploading(false);
        } else {
          setImageUploading(false);
          return toast.show({
            ...toastConfig,
            render: () => {
              return (
                <Box bg="black" px="2" py="1" rounded="sm">
                  <Text style={styles.toastText}>Image upload failed</Text>
                </Box>
              );
            },
          });
        }
      })
      .catch(error => {
        setImageUploading(false);
      });
  };

  const handleGalleryPicker = async () => {
    setOpen(false);
    let imageReadPermission = await requestStoragePermission();
    if (imageReadPermission === 'granted' || 'limited') {
      ImagePicker.openPicker({
        mediaType: 'photo',
        width: 450,
        height: 450,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
      })
        .then(async image => {
          console.log('image.size', image.size);
          if (image.size > '10485760') {
            return toast.show({
              ...toastConfig,
              render: () => {
                return (
                  <Box bg="black" px="2" py="1" rounded="sm">
                    <Text style={styles.toastText}>Image size too large</Text>
                  </Box>
                );
              },
            });
          }
          setImageUploading(true);
          let sdkRes;
          if (image) {
            sdkRes = await SDK.profileUpdate(mediaObjContructor('IMAGE_PICKER',image));
          }
          if (sdkRes?.statusCode === 200) {
            setImageFileToken(sdkRes.imageFileToken);
            await SDK.setUserProfile(
              props?.selectProfileInfo?.nickName,
              sdkRes.imageFileToken,
              props?.selectProfileInfo?.status,
              props?.selectProfileInfo?.mobileNumber,
              props?.selectProfileInfo?.email,
            );
            setImageUploading(false);
          } else {
            setImageUploading(false);
            return toast.show({
              ...toastConfig,
              render: () => {
                return (
                  <Box bg="black" px="2" py="1" rounded="sm">
                    <Text style={styles.toastText}>Image upload failed</Text>
                  </Box>
                );
              },
            });
          }
          setImageUploading(false);
        })
        .catch(error => {
          setImageUploading(false);
        });
    }
  };

  const handleRemove = () => {
    setRemove(!remove);
  };

  const onClose = async () => {
    setloading(true);
    setRemove(false);
    setOpen(false);
    let updateProfile = await SDK.setUserProfile(
      props?.selectProfileInfo?.nickName,
      '',
      props?.selectProfileInfo?.status,
      props?.selectProfileInfo?.mobileNumber,
      props?.selectProfileInfo?.email,
    );
    if (updateProfile.statusCode === 200) {
      props.setProfileInfo({
        ...props.profileInfo,
        image: '',
      });
      setImageFileToken('');
      toast.show({
        ...toastConfig,
        render: () => {
          return (
            <Box bg="black" px="2" py="1" rounded="sm">
              <Text style={styles.toastText}>
                Profile Image removed successfully
              </Text>
            </Box>
          );
        },
      });
    } else {
      toast.show({
        ...toastConfig,
        render: () => {
          return (
            <Box bg="black" px="2" py="1" rounded="sm">
              <Text style={styles.toastText}>{updateProfile.message}</Text>
            </Box>
          );
        },
      });
    }
    setloading(false);
  };

  const handleChangeText = (name, value) => {
    props.onChangeEvent();
    props.setProfileInfo({
      ...props.profileInfo,
      [name]: value,
    });
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

  const handleRenderAuthImage = React.useMemo(() => {
    return (
      <AuthProfileImage
        component="profileImage"
        borderRadius="100"
        borderColor={'#d3d3d3'}
        borderWidth={0.25}
        height="157"
        width="157"
        resizeMode="contain"
        imageUploading={imageUploading}
        image={props?.profileInfo?.image}
        nickName={props?.profileInfo?.nickName}
      />
    );
  }, [props.profileInfo, imageUploading]);

  React.useEffect(() => {
    if (!isConnected && loading) {
      setloading(false);
    }
  }, [isConnected]);

  const isUnsavedChangesAvailable = React.useMemo(() => {
    return props?.selectProfileInfo?.nickName !== nickName;
  }, [nickName, props?.selectProfileInfo]);

  const handleEmailChange = text => {
    handleChangeText('email', text);
  };

  const handleNicknameChange = text => {
    if (text.length < 31) {
      setNickName(text);
      handleChangeText('nickName', text);
    }
    if (text.length > 30) {
      setIsToastShowing(true);
      if (!isToastShowing) {
        return toast.show({
          ...toastConfig,
          render: () => {
            return (
              <Box bg="black" px="2" py="1" rounded="sm">
                <Text style={styles.toastText}>Maximum of 30 Characters</Text>
              </Box>
            );
          },
        });
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex1}>
      <Stack h="60" mb="10" bg="#F2F2F2" w="full" justifyContent={'center'}>
        {prevPageInfo === REGISTERSCREEN ? (
          <Text textAlign={'center'} fontSize="xl" fontWeight={'600'}>
            Profile
          </Text>
        ) : (
          <ScreenHeader title="Profile" onhandleBack={handleBackBtn} />
        )}
      </Stack>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.flex1}>
        <VStack h="full" justifyContent={'center'}>
          <VStack mt="6" flex="1" alignItems={'center'}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: 157,
                width: 157,
                position: 'relative',
              }}>
              <Pressable onPress={() => handleImage('big')}>
                {props.profileInfo?.image && handleRenderAuthImage}
                {!props.profileInfo?.image && nickName?.trim() && (
                  <Avathar
                    fontSize={60}
                    width={157}
                    height={157}
                    data={nickName?.trim()}
                    backgroundColor={'#3276E2'}
                  />
                )}
                {!props.profileInfo?.image && !nickName?.trim() && (
                  <Image
                    resizeMode="contain"
                    source={getImageSource(ProfileImage)}
                    style={{ height: 157, width: 157 }}
                  />
                )}
              </Pressable>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => handleImage('small')}
                style={{ position: 'absolute', right: 0, bottom: 0 }}>
                <Image
                  resizeMode="contain"
                  source={getImageSource(CamerIcon)}
                  style={styles.CameraImage}
                />
              </TouchableOpacity>
            </View>
            <TextInput
              style={{
                fontSize: 16,
                fontWeight: '600',
                marginTop: 5,
              }}
              textAlign="center"
              numberOfLines={1}
              value={nickName}
              placeholder="Username " // Adding a trailing space to fix a strange issue ( last letter "e" is not visible )
              onChangeText={handleNicknameChange}
              maxLength={31}
              placeholderTextColor="#959595"
              keyboardType="default"
            />
          </VStack>
          <Stack
            mt="7"
            px="3"
            borderBottomColor="#F2F2F2"
            borderBottomWidth="1">
            <Text fontSize="14" mb="2" color="black" fontWeight="500">
              Email
            </Text>
            <HStack mb="3" alignItems="center">
              <MailIcon />
              <TextInput
                editable={prevPageInfo === REGISTERSCREEN}
                style={{ color: '#959595', flex: 1, marginLeft: 8 }}
                defaultValue={props.profileInfo?.email}
                onChangeText={handleEmailChange}
                maxLength={35}
                placeholder="Enter Email Id"
                placeholderTextColor={'#959595'}
                keyboardType="default"
                numberOfLines={1}
              />
            </HStack>
          </Stack>
          <Stack
            mt="3"
            ml="3"
            borderBottomColor="#F2F2F2"
            borderBottomWidth="1">
            <Text fontSize="14" color="black" fontWeight="500">
              Mobile Number
            </Text>
            <HStack flexDirection="row" alignItems="center" mt="1" mb="3">
              <CallIcon />
              <Text
                px={'3'}
                mt="2"
                mr={'6'}
                numberOfLines={1}
                color="#959595"
                fontSize="13"
                fontWeight="500">
                +{props.profileInfo?.mobileNumber}
              </Text>
            </HStack>
          </Stack>
          <Stack
            mt="3"
            px="3"
            borderBottomColor="#F2F2F2"
            borderBottomWidth="1">
            <Text fontSize="14" color="black" fontWeight="500">
              Status
            </Text>
            <Pressable onPress={OnStatusHandler}>
              <HStack
                flexDirection="row"
                mt="3"
                mb="3"
                flex={'1'}
                alignItems="center">
                <StatusIcon />
                <Text
                  w="90%"
                  px={'3'}
                  mr={'6'}
                  color="#959595"
                  fontSize="13"
                  fontWeight="500">
                  {props.profileInfo?.status}
                </Text>
              </HStack>
            </Pressable>
          </Stack>
          <Stack mt="5" alignItems="center">
            {prevPageInfo === REGISTERSCREEN ? (
              <PrimaryPillBtn
                onPress={handleProfileUpdate}
                title={props.onChangeEvent() ? 'Update & Continue' : 'Save'}
              />
            ) : (
              <PrimaryPillBtn
                style={[
                  styles.button,
                  {
                    backgroundColor: isUnsavedChangesAvailable
                      ? '#3276E2'
                      : '#d3d3d3',
                  },
                ]}
                disabled={!isUnsavedChangesAvailable}
                onPress={handleProfileUpdate}
                title={'Save'}
              />
            )}
          </Stack>
          <Modal isOpen={open} onClose={() => setOpen(false)}>
            <Modal.Content width="1100" style={styles.bottom}>
              <Center w="100%">
                <Box maxW="350" w="120%">
                  <VStack space={4}>
                    <View style={{ padding: 4 }}>
                      <Text style={{ fontSize: 14, color: '#767676' }}>
                        Options
                      </Text>
                      <TouchableOpacity
                        onPress={handleCameraPicker}
                        style={{ paddingTop: 20 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: '#767676',
                            fontWeight: '500',
                          }}>
                          Take Photo
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{ paddingTop: 15 }}
                        onPress={handleGalleryPicker}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: '#767676',
                            fontWeight: '500',
                          }}>
                          Choose from Gallery
                        </Text>
                      </TouchableOpacity>
                      {props.profileInfo?.image && (
                        <TouchableOpacity
                          onPress={handleRemove}
                          style={{ paddingTop: 15 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              color: '#767676',
                              fontWeight: '500',
                            }}>
                            Remove Photo
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </VStack>
                </Box>
              </Center>
            </Modal.Content>
          </Modal>
          <Center maxH={'40'} width={'50'}>
            <AlertDialog isOpen={remove} onClose={onClose}>
              <AlertDialog.Content>
                <AlertDialog.Body>
                  Are you sure you want to remove the photo?
                  <HStack ml="119" space={5}>
                    <TouchableOpacity onPress={() => setRemove(false)}>
                      <Text color={'blue.800'}>Cancel</Text>
                    </TouchableOpacity>
                    {props.profileInfo?.image && (
                      <TouchableOpacity color={'#3276E2'} onPress={onClose}>
                        <Text color={'blue.800'}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </HStack>
                </AlertDialog.Body>
              </AlertDialog.Content>
            </AlertDialog>
          </Center>
          <Modal
            isOpen={loading || isFetchingProfile}
            style={styles.center}
            safeAreaTop={true}>
            <Modal.Content width="45" height="45">
              <Center w="100%" h="full">
                <Spinner size="lg" color={'#3276E2'} />
              </Center>
            </Modal.Content>
          </Modal>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  imageContainer: {
    height: 65,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageView: {
    width: 20,
    height: 20,
  },
  profileContainer: {
    marginHorizontal: 10,
    marginTop: 50,
  },
  profileText: {
    textAlign: 'center',
    fontWeight: '700',
    color: 'black',
    fontSize: 18,
  },
  userText: {
    fontWeight: '700',
    textAlign: 'center',
    width: 400,
  },
  ContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCotainer: {
    marginTop: 15,
    paddingHorizontal: 10,
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    borderRadius: 22,
    padding: 10,
  },
  top: {
    marginBottom: 'auto',
    marginTop: 0,
  },
  bottom: {
    marginBottom: 0,
    paddingVertical: 12,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 3,
    borderColor: '#D0D8EB',
    marginTop: 'auto',
    borderBottomWidth: 3,
    borderBottomColor: '#D0D8EB',
  },
  CameraImage: {
    height: 42,
    width: 42,
  },
  toastText: { color: '#fff', padding: 5 },
});
