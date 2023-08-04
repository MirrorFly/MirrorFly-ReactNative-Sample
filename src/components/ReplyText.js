
import {Pressable} from 'react-native';
import React from 'react';
import {HStack, Text, View} from 'native-base';
import {ClearTextIcon} from '../common/Icons';
import {formatUserIdToJid} from '../Helper/Chat/ChatHelper';
import {useSelector} from 'react-redux';

const ReplyText = (props) => { 
 const {replyMsgItems,handleRemove}= props ;

const vCardProfile = useSelector(state => state.profile.profileDetails);
const currentUserJID = formatUserIdToJid(vCardProfile?.userId);

const RemoveHandle =()=> {
    handleRemove();
}

return (
<View>
<HStack justifyContent={'space-between'} alignItems={'center'}>
{replyMsgItems?.fromUserJid === currentUserJID ? (
<Text color={'#000'} fontSize={14} mb={1} fontWeight={600} py="0">
You
</Text>
) : (
<Text mb={2} color={'#000'} fontSize={14} fontWeight={600} py="0">
{replyMsgItems?.msgBody?.nickName}
</Text>
)}
<Pressable
style={{
padding: 5,
backgroundColor: '#FFF',
borderRadius: 20,
}}
onPress={RemoveHandle}>
<ClearTextIcon />
</Pressable>
</HStack>
<Text numberOfLines={1} fontSize={14} color="#313131">
{replyMsgItems?.msgBody?.message}
</Text>
</View>
);
};

export default ReplyText;