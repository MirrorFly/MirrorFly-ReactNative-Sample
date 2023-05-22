import { BackHandler, StyleSheet, Text, TouchableOpacity, View, Image, TextInput, ScrollView } from 'react-native'
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RECENTCHATSCREEN } from '../constant';
import { navigate } from '../redux/navigationSlice';
import { CallIcon, MailIcon, StatusIcon } from '../common/Icons';
const logo = require('../assets/profile.png');
import { Modal, Center, Box, VStack, useToast, Spinner } from "native-base";
import { SDK } from '../SDK';

const ProfileScreen = () => {

  const phoneNumber = useSelector(state => state.auth.userData);
  const userJid = useSelector(state => state.auth.currentUserJID);
  const toast = useToast();
  const [placement, setPlacement] = React.useState(undefined);
  const [open, setOpen] = React.useState(false);

  const openModal = placement => {
    setOpen(true);
    setPlacement(placement);
  };
  const [name, setName] = React.useState("");
  const [mail, setMail] = React.useState("");
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [status, setStatus] = React.useState("Available");
  const dispatch = useDispatch();
  const [loading, setloading] =React.useState(false);
  
  React.useEffect(() => {
    (async () => {  
      let userId = userJid.split("@")[0]
      let getUserId = await SDK.getUserProfile(userId);
      setName(getUserId?.data?.nickName)
      setMail(getUserId?.data?.email)
      setStatus(getUserId?.data?.status)
    })()
  }, [])

  const selectCountryHandler = async () => {
   
    if (!name) {
      return toast.show({
        duration: 700,
        render: () => {
       
          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>UserName cannot be empty</Text>
            
          </Box>
        }
      })
    }

    if (name.length < '4') {
      return toast.show({
        duration: 700,
        render: () => {
         
          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>User Name is too short</Text>
           
          </Box>
        }
      })
    }
   
    if (!mail) {
      return toast.show({
        duration: 700,
        render: () => {
          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>Please Enter the Mail</Text>
      
          </Box>
        }
      })
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(mail)) {

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
    let UserInfo = await SDK.setUserProfile(name, '', status, mobileNumber, mail);
    
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

  return (
    < >
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
            <TouchableOpacity activeOpacity={1} onPress={() => openModal("bottom")} style={{ position: "relative" }}>
              <Image resizeMode="contain" source={logo} style={{ height: 150, width: 150 }} />
              <TouchableOpacity activeOpacity={1} onPress={() => openModal("bottom")} style={{ position: "absolute", right: 1, bottom: 1 }}  >
                <Image resizeMode="contain" source={require('../assets/camera.png')} style={styles.CameraImage} />
              </TouchableOpacity>

            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.ContentContainer} >
          <TextInput
            style={styles.userText}
            value={name}
            placeholder='Username'
            onChangeText={setName}
            maxLength={30}
            placeholderTextColor={"#959595"}
            keyboardType="default"
            numberOfLines={1}
          />
        </View>
        <View style={{ marginTop: 20, marginHorizontal: 10, }}>
          <View style={styles.mainCotainer}>
            <Text style={{ fontSize: 13, color: "black", fontWeight: "600", }}>
              Email
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center"
            }}>
              <MailIcon />
              <TextInput
                style={{ marginLeft: 6, color: "#959595", flex: 1,fontSize: 11 }}
                value={mail}
                onChangeText={setMail}
                placeholder='Enter Email Id'
                placeholderTextColor={"#959595"}
                keyboardType="email-address"
                numberOfLines={1}
              />
            </View>
          </View>
          <View style={styles.mainCotainer}>
            <Text style={styles.numberText}>
              Mobile Number
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center"
            }}>
              {/* 
               */}
              <CallIcon />
              <TextInput
                style={{ marginLeft: 9, color: "#959595", flex: 1,fontSize: 11 }}
                value={"+" + phoneNumber.username}
                onChangeText={setMobileNumber}
                HStack  placeholder='Enter Your Mobile Number'
                maxLength={15}
                editable={false}
                placeholderTextColor={"#959595"}
                keyboardType="numeric"
                numberOfLines={1}
              />
            </View>
          </View>
          <View style={styles.mainCotainer}>
            <Text style={{ fontSize: 13, color: "black", fontWeight: "600", }}>
              Status
            </Text>
            <View style={{
              flexDirection: "row", alignItems: "center"
            }}>
              <StatusIcon />
              <TextInput
                style={{ marginLeft: 6, color: "#959595", flex: 1,fontSize: 11 }}
                value={status}
                onChangeText={setStatus}
                placeholder='Available'
                maxLength={20}
                editable={false}
                placeholderTextColor={"#959595"}
                keyboardType="default"
                numberOfLines={1}
              />
            </View>
            <View style={{}} />
          </View>
          <View style={{ marginTop: 10, alignItems: "center" }}>
            <TouchableOpacity style={styles.button} onPress={selectCountryHandler}>
              <Text style={{ fontSize: 15, color: "#FFFf", textAlign: "center", fontWeight: "300" }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal isOpen={open} onClose={() => setOpen(false)} safeAreaTop={true} >
        <Modal.Content width="1100" style={styles.bottom} >
          <Center w="100%">
            <Box maxW="350" w="120%">
              <VStack space={4}>
                <View style={{ padding: 4, }}>
                  <Text style={{ fontSize: 14, color: "#767676", }} >Options</Text>
                  <TouchableOpacity style={{ paddingVertical: 20 }}>
                    <Text style={{ fontSize: 14, color: "#767676", fontWeight: "500" }}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={{ fontSize: 14, color: "#767676", fontWeight: "500" }}>Choose from Gallery</Text>
                  </TouchableOpacity>
                </View>
              </VStack>
            </Box>
          </Center>
        </Modal.Content>
      </Modal>
  
      <Modal isOpen={loading} onClose={() => setloading(false)} style={styles.center} safeAreaTop={true} >
        <Modal.Content width="45" height="45" >
          <Center w="100%" h="full">
           
            <Spinner size="lg" color={'#3276E2'} />
          
          </Center>
        </Modal.Content>
      </Modal>
     
    </>
  )
}

export default ProfileScreen

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
    color:"black",
    fontSize: 18,
  },
  userText:{
     fontWeight: "700", 
     textAlign: "center",
      width: 400 
  },
  ContentContainer:{
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
    width: 100,
    borderRadius: 22,
    padding: 9,
    marginTop: 30,
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
  center: {
   
  },
  numberText: {
 
    fontSize: 13, 
    color: "black",
     fontWeight: "600"
  },
  CameraImage:{
   height: 40,
     width: 40
   }

})