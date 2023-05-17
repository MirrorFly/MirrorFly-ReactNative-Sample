import React, { useState } from 'react';
import { View, TextInput, Button, Text, Image, TouchableOpacity } from 'react-native';
import { SendBtn } from '../common/Button';
import { AttachmentIcon } from '../common/Icons';

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (message) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
      <View style={{
        flexDirection: 'row',
        flex: 1,
        marginRight: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#c1c1c1",
        alignItems: 'center'
      }}>
        <TouchableOpacity>
          <Image
            source={require('../assets/smile.png')}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
        <TextInput
          value={message}
          style={{ marginStart: 5, flex: 1 }}
          onChangeText={(text) => setMessage(text)}
          placeholder="Start Typing..."
        />
        {/* <TouchableOpacity> */}
        <AttachmentIcon />
        {/* </TouchableOpacity> */}
      </View>
    {message &&  <SendBtn style={{ height: 30, width: 30, alignItems: 'center', justifyContent: 'center' }} onPress={sendMessage} />}
    </View>
  );
};

export default ChatInput;