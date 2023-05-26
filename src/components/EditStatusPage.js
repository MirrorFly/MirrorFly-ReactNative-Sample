import { StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Icon, Modal, Text, Center, Box, useToast, Spinner, HStack, VStack, Stack, Input, Pressable } from 'native-base';
import { useDispatch } from 'react-redux';
import { navigate } from '../redux/navigationSlice';
import { STATUSSCREEN } from '../constant';
import ScreenHeader from '../components/ScreenHeader';
import { SmileIcon } from '../common/Icons';

const EditStatusPage = (props) => {
    const dispatch = useDispatch();
    const [content, setContent] = React.useState(props.profileInfo.status);
    const [Total, setTotal] = React.useState(139);
    

    const handleBackBtn = () => {
        props.setNav("statusPage");
    }

    const handleInput = (text) => {

    
        const count = text.length;
        setTotal(139-count);
        setContent(text);
        
        
    }


  const handleStatus =()=>{
    
        props.setProfileInfo({
            ...props.profileInfo,
            status:content
        }
        
        )
      
    
    props.setNav("statusPage");

  }

  const handleInputFocus = () => {
   
    setContent(!content && "");
    
  };
  console.log(content)

    return (
        <View style={{ flex: 1, }}>
            <ScreenHeader
                title=' Add New Status'
                onhandleBack={handleBackBtn}
            />
            <HStack pb="2" pt="3" px="4" borderBottomColor={"#f2f2f2"} borderBottomWidth="1" alignItems={"center"} >
                <Input variant="unstyled"
                    fontSize="15"
                    fontWeight="400"
                    color="black"
                    flex="1"
                    onChangeText={(text)=>{handleInput(text)}}
                    onFocus={handleInputFocus}
                    selectionColor={'#3276E2'}
                    maxLength={139}
                    keyboardType="default"
                    numberOfLines={1}
                />
                <Text color={"black"} fontSize="15" fontWeight={"400"} px="4" >{Total?Total:"130"}</Text>
                <TouchableOpacity>
                    <SmileIcon />
                </TouchableOpacity>

            </HStack>
          { content &&  <Stack flex="1" >
                <HStack position={"absolute"} pb="4" left={"0"} right={"0"} bottom="0" alignItems={"center"} justifyContent={"space-evenly"} borderTopColor={"#BFBFBF"} borderTopWidth="1"  >
                    <TouchableOpacity >
                        <Text color={"black"} fontSize="15" fontWeight={"400"} px="4">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                    <Stack h="12" borderLeftWidth="1" borderColor='#BFBFBF' />
                    <TouchableOpacity onPress={handleStatus}>
                        <Text color={"black"} fontSize="15" fontWeight={"400"} px="8">
                            Ok
                        </Text>
                    </TouchableOpacity>
                </HStack>
            </Stack> }
        </View>
    )
}

export default EditStatusPage

const styles = StyleSheet.create({})


