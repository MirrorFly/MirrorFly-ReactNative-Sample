import { Image, ImageBackground, StyleSheet } from 'react-native'
import React from 'react'
import { HStack, Stack, Text, View } from 'native-base'


const PdfCard = () => {
   // const image = { uri: 'https://via.placeholder.com/500' };
    return (
        <Stack>


            <Stack mx={3} my={2}>
                <Image source={{ uri: 'https://reactnative.dev/img/tiny_logo.png'}}resizeMode={"cover"}   style={{ paddingHorizontal:100,paddingVertical:110 }} />

            </Stack>
            <HStack alignItems={"center"} backgroundColor={"#D0D8EB"} borderBottomLeftRadius={5} borderBottomRightRadius={5} borderColor={"#D0D8EB"} px={"1"} py={"1"}>
                <View borderRadius={5} mx={1} my={1} px={1} py={1} backgroundColor={"red.500"} >

                    <Text color={"#ffff"} fontWeight={400}>Pdf</Text>

                </View>
                <Text px={2} py={2}>Demo.pdf</Text>
            </HStack>

        </Stack>
    )
}

export default PdfCard

const styles = StyleSheet.create({})