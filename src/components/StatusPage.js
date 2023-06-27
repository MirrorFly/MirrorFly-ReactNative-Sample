import { FlatList } from 'react-native'
import React from 'react'
import ScreenHeader from '../components/ScreenHeader'
import { Text, HStack, Pressable, useToast, Modal, Box, AlertDialog, VStack, Divider, } from 'native-base';
import { EditIcon, TickMarkIcon } from '../common/Icons';
import SDK from '../SDK/SDK';
import { useNetworkStatus } from '../hooks';

const StatusPage = (props) => {
  const isNetworkConnected = useNetworkStatus()
  const [isToastShowing, setIsToastShowing] = React.useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = React.useState(false)
  const [isOpenDeleteAlert, setIsOpenDeleteAlert] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState("");
  const toast = useToast();
  const toastConfig = {
    duration: 2500,
    avoidKeyboard: true,
    onCloseComplete: () => {
      setIsToastShowing(false)
    }
  }

  const closeYesStatusHandler = () => {
    setIsOpenDeleteAlert(false);
    props.removeItem(
      selectedItem
    );
  }

  const handleBackBtn = () => {
    props.setNav("ProfileScreen");
  }

  const handleDeleteItem = (val) => {
    setIsOpenDeleteModal(true)
    setSelectedItem(val);
  };

  const handleSelectStatus = (item) => {
    setIsToastShowing(true)
    if (!isNetworkConnected && !isToastShowing) {
      return toast.show({
        ...toastConfig,
        render: () => {
          return <Box bg="black" px="2" py="1" rounded="sm" >
            <Text style={{ color: "#fff", padding: 5 }}>Please check your internet connectivity</Text>
          </Box>;
        }
      })
    }
    if (isNetworkConnected) {
      props.setProfileInfo({
        ...props.profileInfo,
        status: item,
      })
      SDK.setUserProfile(props?.profileInfo?.nickName, props.profileInfo.image, item, props.profileInfo?.mobileNumber, props.profileInfo?.email);
      if (item && !isToastShowing) {
        return toast.show({
          duration: 700,
          keyboardAvoiding: true,
          onCloseComplete: () => {
            setIsToastShowing(false)
          },
          render: () => {
            return <Box bg="black" px="2" py="1" rounded="sm" >
              <Text style={{ color: "#fff", padding: 5 }}>Status updated successfully </Text>
            </Box>
          }
        })
      }
    }
  }
  return (
    <>
      <ScreenHeader title='Status' onhandleBack={handleBackBtn} />
      <VStack p='5'>
        <Pressable onPress={() => props.setNav("EditStatusPage")}>
          <Text mb='3' color={"black"} fontSize="18" fontWeight={"500"}> Your current status</Text>
          <HStack justifyContent={'space-between'} >
            <Text color="#767676" fontSize="14" fontWeight={"400"}>{props.profileInfo?.status}</Text>
            <EditIcon />
          </HStack>
        </Pressable>
      </VStack>
      <VStack p='5'>
        <Text mb='3' color={"black"} fontSize="18" fontWeight={"500"}>Select Your new status</Text>
        <FlatList
          data={props.statusList}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            return <Pressable
              onLongPress={() => (props.profileInfo.status !== item) && handleDeleteItem(item)}
              onPress={() => handleSelectStatus(item)}
            >
              {({ isPressed }) => {
                return <HStack bg={isPressed ? 'rgba(0,0,0, 0.1)' : "transparent"} px='1' py='2.5' justifyContent={'space-between'} >
                  <Text
                    color="#767676" fontSize="14" fontWeight={"400"}>
                    {item}</Text>
                  {props.profileInfo.status === item && <TickMarkIcon />}
                </HStack>
              }}
            </Pressable>
          }}
        />
        <Divider />
      </VStack>
      <Modal isOpen={isOpenDeleteModal} onClose={() => setIsOpenDeleteModal(false)} >
        <Modal.Content borderRadius={0}>
          <Pressable py="15"
            onPress={() => { setIsOpenDeleteAlert(true); setIsOpenDeleteModal(false) }}>
            <Text px="3" >Delete </Text>
          </Pressable>
        </Modal.Content>
      </Modal>
      <AlertDialog isOpen={isOpenDeleteAlert} onClose={() => setIsOpenDeleteAlert(false)}>
        <AlertDialog.Content borderRadius={0}>
          <AlertDialog.Body>
            <Text color='#767676' fontSize={"15"}>Do you want to delete the status? </Text>
            <HStack mt='5' alignSelf={'flex-end'}>
              <Pressable mr='5' onPress={() => setIsOpenDeleteAlert(false)} >
                <Text fontSize={"16"} color={"blue.500"}>No</Text>
              </Pressable>
              <Pressable onPress={closeYesStatusHandler}>
                <Text fontSize={"16"} color={"blue.500"}>Yes</Text>
              </Pressable>
            </HStack>
          </AlertDialog.Body>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  )
}
export default StatusPage