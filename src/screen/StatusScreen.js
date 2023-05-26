// import { StyleSheet, TouchableOpacity } from 'react-native'
// import React from 'react'
// import ScreenHeader from '../components/ScreenHeader'
// import { EDITSTATUSSCREEN, PROFILESCREEN } from '../constant'
// import { useDispatch } from 'react-redux';
// import { navigate } from '../redux/navigationSlice';
// import { View, Text, HStack, VStack, Pressable } from 'native-base';
// import { EditIcon, TickMarkIcon } from '../common/Icons';

// const StatusScreen = () => {
//   const [clicked, setclicked] = React.useState("");
//   const statusList = [
//     { id: 1, value: "Available" },
//     { id: 2, value: "Sleeping..." },
//     { id: 3, value: "Urgent calls only" },
//     { id: 4, value: "At the movies" },
//     { id: 5, value: "I am in Mirror Fly" },
//     { id: 6, value: "Avail" },

//   ];
//   const dispatch = useDispatch();

//   const handleBackBtn = () => {
//     let x = { screen: PROFILESCREEN }
//     dispatch(navigate(x))
//     return true;
//   }

//   const EditPagehHandler = () => {
//     let x = { screen: EDITSTATUSSCREEN }
//     dispatch(navigate(x))
//     return true;
//   }

//   const handlePress = (item) => {
//     console.log(item.value);
//     setclicked(item.value)
//   }
//   return (
//     <>
//       <ScreenHeader
//         title='Status'
//         onhandleBack={handleBackBtn}
//       />
//       <View mx="6" mt='4'>
//         <Text color={"black"} fontSize="18" fontWeight={"500"} >
//           Your current status
//         </Text>
//         <Pressable onPress={EditPagehHandler}>
//           <HStack mt="5" justifyContent={"space-between"}>
//             <Text color="#767676" fontSize="14" fontWeight={"400"}>Urgent calls only</Text>
//             <EditIcon />
//           </HStack>
//         </Pressable>
//         <Text mt="8" color={"black"} fontSize="15" fontWeight={"500"} > Select Your new status</Text>
      
//         {statusList.map((item, index) =>
//           <Pressable onPress={() => { handlePress(item) }}>
//             <HStack borderBottomColor={statusList.length==index+1?"#BFBFBF":"#f2f2f2"} pb="4" borderBottomWidth='1' mt="5" justifyContent={"space-between"}   >
            
//               <Text color="#767676" fontSize="14" fontWeight={"400"}>{item.value}</Text> 
//               {clicked == item.value ? <TickMarkIcon /> : null}
//             </HStack>

//           </Pressable>

//         )
//         }
//       </View>
//     </>
//   )
// }
// export default StatusScreen
// const styles = StyleSheet.create({})