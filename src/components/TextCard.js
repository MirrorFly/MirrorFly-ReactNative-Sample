import {  Text, View } from 'native-base'
import React from 'react'
const TextCard = (props) => {
    return (
        <View px='1' >
            <Text style={{ fontSize: 14, paddingHorizontal: 3, paddingVertical: 4, color: "#313131" }}>{props.data?.message}</Text>
            <View style={{ flexDirection: "row", borderBottomLeftRadius: 6, borderBottomRightRadius: 6, padding: 2, alignItems: "center", justifyContent: "flex-end" }}>
                {props.data.status}
                <Text pl='1' color='#959595' fontSize='9'>{props.data.timeStamp}</Text>
            </View>
        </View>
    )
}
export default TextCard;
