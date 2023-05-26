import { Alert, StyleSheet,ScrollView } from 'react-native'
import React from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { View, Text, HStack, Pressable, useToast, Modal, Center, Spinner, Box,  } from 'native-base';
import { EditIcon, TickMarkIcon } from '../common/Icons';
const StatusPage = (props) => {
  const [clicked, setclicked] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isModified, setModified] = React.useState(false);
  const toast = useToast();
  const statusList = props.statusList 

  const handleBackBtn = () => {
    props.setNav("ProfileScreen");
  }

  const EditPagehHandler = () => {
    props.setNav("EditStatusPage");

  }

  const handlePress = (item) => {
    setModified(true)
    props.setProfileInfo({
      ...props.profileInfo,
      status:item.value
    })
    setclicked(item.value)

    if (item.value && !isModified) {
      return toast.show({
        duration: 700,
        keyboardAvoiding: true,
        onCloseComplete: () => {
          setModified(false)
        },
        render: () => {


          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>Status updated successfully </Text>

          </Box>

        }
      })
    }


  }
  return (
    <>
      <ScreenHeader
        title='Status'
        onhandleBack={handleBackBtn}
      />

      <View mx="5" mt='4'>
     
        <Text color={"black"} fontSize="18" fontWeight={"500"} >
          Your current status
        </Text>
        <Pressable onPress={EditPagehHandler}>
          <HStack mt="5" justifyContent={"space-between"}>
            <Text numberOfLines={1} color="#767676" flex={"0.9"} fontSize="14" fontWeight={"400"}>{props.profileInfo?.status || 'Urgent calls only'}</Text>
            <EditIcon />
          </HStack>
        </Pressable>
        <Text mt="8" color={"black"} fontSize="15" fontWeight={"500"} > Select Your new status</Text>



        {statusList.map((item, index) =>
          <ScrollView  showsVerticalScrollIndicator={true} > 
          <Pressable onPress={() => { handlePress(item) }}>
        
          
            <HStack mt="3" flex={"0.4"} borderBottomColor={statusList.length == index + 1 ? "#BFBFBF" : "#f2f2f2"} pb="4" borderBottomWidth='1'  justifyContent={"space-between"}   >

          <Text  numberOfLines={1} color="#767676" fontSize="14" fontWeight={"400"}>{item.value}
              
              </Text>  
              {clicked == item.value ? <TickMarkIcon /> : null}
            </HStack>
            
          </Pressable>
          </ScrollView>
       

        )
        }


        <Modal isOpen={loading} onClose={() => setLoading(false)} style={styles.center} safeAreaTop={true} >
          <Modal.Content width="45" height="45" >
            <Center w="100%" h="full">

              <Spinner size="lg" color={'#3276E2'} />

            </Center>
          </Modal.Content>
        </Modal>
      </View>
    </>
  )
}

export default StatusPage

const styles = StyleSheet.create({})