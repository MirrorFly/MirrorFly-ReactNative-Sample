import { Alert, StyleSheet, ScrollView, FlatList } from 'react-native'
import React from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { View, Text, HStack, Pressable, useToast, Modal, Center, Spinner, Box, AlertDialog, } from 'native-base';
import { EditIcon, TickMarkIcon } from '../common/Icons';

const StatusPage = (props) => {

  const [clicked, setclicked] = React.useState({ value: props.profileInfo?.status });
  const [loading, setLoading] = React.useState(false);
  const [isModified, setModified] = React.useState(false);
  const [delteItem, setDeleteItem] =React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState("");
  const [deleteStatus, setDeleteStatus] =React.useState(false);
  const toast = useToast();
  const statusList = props.statusList;

  const HandleAlertStatus =()=>{
    setDeleteStatus(true);
    //setDeleteItem(false);
   }

  const CloseNoStatusHandler =()=>{
    setDeleteStatus(false);
    setDeleteItem(false);
     
   }

  const CloseYesStatusHandler =()=>
  {
    
    setDeleteStatus(false);
    props.removeItem(
      selectedItem?.value
      );
      setDeleteItem(false);

  }

  const handleBackBtn = () => {
    props.setNav("ProfileScreen");
  }

  const EditPagehHandler = () => {
    props.setNav("EditStatusPage");


  }

  const handleDeleteItem = (val) => {
    
    setDeleteItem(true);
    setSelectedItem(val);
  
  };

  const handleRemove = () => {
 

    setDeleteStatus(true);
    
   
    
  };




  const handlePress = (item) => {
    

    setModified(true)

    

    props.setProfileInfo({
      ...props.profileInfo,
      status: item.value,
      

    })

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

  React.useEffect(() => {
    setclicked(props.profileInfo.status)
  }, [props.profileInfo])
  return (
    <>
      <ScreenHeader
        title='Status'
        onhandleBack={handleBackBtn}
      />

      <>

        <Text mx='3' mt="4" color={"black"} fontSize="18" fontWeight={"500"} >
          Your current status
        </Text>
        <Pressable mx='3' onPress={EditPagehHandler}>
          <HStack mt="5" justifyContent={"space-between"}>
            <Text numberOfLines={1} flex="1" marginRight="4"
              color="#767676" fontSize="14" fontWeight={"400"}>{ props.profileInfo?.status  || 'Urgent calls only'}</Text>
            <EditIcon />
          </HStack>
        </Pressable>
        <Text mt="5" mx='2' color={"black"} fontSize="15" fontWeight={"500"} > Select Your new status</Text>

        <FlatList
          style={{ marginHorizontal: 15 }}
          data={statusList}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            return <Pressable

            // disabled={clicked == item.value}

             onLongPress={ () => { !(clicked == item.value) && handleDeleteItem(item)  } } 
          
              onPress={() => { handlePress(item) }} >
             
              <HStack mt="5" flex={"0.4"} borderBottomColor={statusList.length == index + 1 ? "#BFBFBF" : "#f2f2f2"} pb="4" borderBottomWidth='1' justifyContent={"space-between"}   >

                <Text numberOfLines={1} color="#767676" flex="1" marginRight="4" fontSize="14" fontWeight={"400"}>{item.value}

                </Text>
                
                {clicked == item.value ?  <TickMarkIcon  /> : null}

              </HStack>

            </Pressable>
          }}
        />
      </>
      <View ml="5" mr="4" mt='4'>

        <Modal isOpen={loading} onClose={() => setLoading(false)} >
          <Modal.Content  >
            <Center w="100%" h="full">

              <Spinner size="lg" color={'#3276E2'} />

            </Center>
          </Modal.Content>
        </Modal>

        <Modal isOpen={delteItem} onClose={() => setDeleteItem(false)} >
          <Modal.Content >
            
               <Pressable py="15" 
     
       onPress={handleRemove}>
               <Text px="3" >Delete </Text>
               </Pressable>
          

           
          </Modal.Content>
        </Modal>


        <Center px="120" py="50" >
            <AlertDialog isOpen={deleteStatus} onClose={HandleAlertStatus}>
              <AlertDialog.Content>


                <AlertDialog.Body  >
                 Do you want to delete the status ?
                  <HStack ml="119"mr="6" space={10} py="5" justifyContent={"flex-end"} >
                    <Pressable  onPress={CloseNoStatusHandler} >
                      <Text color={"blue.500"} >No</Text>
                    </Pressable>
                    <Pressable  onPress={CloseYesStatusHandler}>
                      <Text color={"blue.500"} >Yes</Text>
                    </Pressable> 

                  </HStack>


                </AlertDialog.Body>


              </AlertDialog.Content>
            </AlertDialog>
          </Center>
      </View>
    </>
  )
}

export default StatusPage

const styles = StyleSheet.create({})