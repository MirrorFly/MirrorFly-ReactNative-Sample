// import { StyleSheet, View ,TouchableOpacity} from 'react-native'
// import React from 'react'
// import { Icon, Modal, Text, Center, Box, useToast, Spinner, HStack, VStack, Stack, Input, Pressable } from 'native-base';
// import { useDispatch } from 'react-redux';
// import { navigate } from '../redux/navigationSlice';
// import { STATUSSCREEN } from '../constant';
// import ScreenHeader from '../components/ScreenHeader';
// import { SmileIcon } from '../common/Icons';

// const EditStatusScreen = () => {
//   const dispatch = useDispatch();
//   const [number, setNumber] = React.useState("Avaliable");
//   const [Total, setTotal] =React.useState(0);
//   const handleBackBtn = () => {
//     let x = { screen: STATUSSCREEN }
//     dispatch(navigate(x))
//     return true;
//   }

//   const handleInput =(text)=>{
//     const count = text.length;
//     setTotal(count);
//     setNumber();
//   }

//   return (
//     <View style={{ flex: 1, }}>
//       <ScreenHeader
//         title=' Add New Status'
//         onhandleBack={handleBackBtn}
//       />
//       <HStack pb="2" pt="3"px="4" borderBottomColor={"#f2f2f2"} borderBottomWidth="1" alignItems={"center"} >
//       <Input variant="unstyled"
//         fontSize="15"
//         fontWeight="400"
//         color="black"
//         flex="1"
//         onChangeText={handleInput}
//         value={number}
//         selectionColor={'#3276E2'}
//         maxLength={130}
//         keyboardType="default"
//         numberOfLines={1}
//       />
//       <Text color={"black"} fontSize="15" fontWeight={"400"} px="4" >{Total}</Text>
//       <TouchableOpacity>
//       <SmileIcon />
//       </TouchableOpacity>
    
//       </HStack>
//       <Stack  flex= "1" > 
//       <HStack position={"absolute"}  pb="4" left={"0"}  right={"0"} bottom="0" alignItems={"center"} justifyContent={"space-evenly"} borderTopColor={"#BFBFBF"} borderTopWidth="1"  >
//         <TouchableOpacity >
//           <Text color={"black"}  fontSize="15" fontWeight={"400"} px="4">
//             Cancel
//           </Text>
//           </TouchableOpacity>
//           <Stack h="12"   borderLeftWidth="1" borderColor='#BFBFBF'/> 
//           <TouchableOpacity onPress={()=>{console.log("I'm Pressed")}}> 
//           <Text color={"black"}  fontSize="15" fontWeight={"400"} px="8">
//             Ok
//           </Text>
//           </TouchableOpacity>
//       </HStack>
//       </Stack>
//     </View>
//   )
// }

// export default EditStatusScreen

// const styles = StyleSheet.create({})