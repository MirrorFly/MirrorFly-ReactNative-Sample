import React from 'react'
import { BackHandler, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { Box, Divider, HStack, Icon, IconButton, Text, View, useToast } from 'native-base'
import { useSelector } from 'react-redux'
import { DeleteBinIcon, LeftArrowIcon, PreViewAddIcon, SendBlueIcon } from '../common/Icons'
import Avathar from '../common/Avathar'
import { SceneMap, TabView } from 'react-native-tab-view';
import { handleGalleryPickerMulti } from '../common/utils'

function GalleryPickView(props) {
    const toast = useToast()
    const toastConfig = {
        duration: 2500,
        avoidKeyboard: true
    }

    const fromUserJId = useSelector(state => state.navigation.fromUserJid)
    const handleBackBtn = () => {
        props.setLocalNav('CHATCONVERSATION')
        return true;
    }

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackBtn
    );

    React.useEffect(() => {
        return () => {
            backHandler.remove();
        }
    }, [])
    const [index, setIndex] = React.useState(0);

    const handleIndexChange = (index) => {
        setIndex(index);
    };

    const renderTabBar = () => {
        return (
            <></>
        );
    };

    const renderScene = SceneMap(
        props.selectedImages?.reduce((scenes, item, itemIndex) => {
            scenes[`tab${itemIndex + 1}`] = () => (
                <>
                    <IconButton alignSelf={'flex-end'} onPress={() => {
                        let filtered = props.selectedImages?.filter((item, i) => i !== itemIndex)
                        props.setSelectedImages(filtered)
                    }} _pressed={{ bg: 'rgba(50,118,226, 0.1)' }} icon={<Icon as={<DeleteBinIcon color="#fff" />} name="emoji-happy" />} borderRadius="full" />
                    <View position='relative' flex='1' px='7' my='5' keyboardShouldPersistTaps="handled">
                        <Image resizeMode='contain' source={{ uri: item.image.fileCopyUri }} style={styles.tabContainer} />
                        <IconButton position='absolute' p='0' right='5' bottom='0' alignSelf={'flex-end'} onPress={() => {
                            props.setSendSelected(true)
                            props.setLocalNav('CHATCONVERSATION')
                        }} _pressed={{ bg: 'rgba(50,118,226, 0.1)' }} icon={<Icon as={<SendBlueIcon color="#fff" />} name="emoji-happy" />} borderRadius="full" />
                    </View>
                    <HStack ml='2' mb='3' alignItems={'center'}>
                        <IconButton _pressed={{ bg: "rgba(50,118,226, 0.1)" }} onPress={async () => {
                            const res = await handleGalleryPickerMulti(toast)
                            let length = props.selectedImages.length
                            const transformedArray = res.map((obj, index) => {
                                return {
                                    caption: '',
                                    image: obj
                                };
                            });
                            if ((res.length + length) <= 5) {
                                props.setSelectedImages([...props.selectedImages, ...transformedArray])
                            } else {
                                props.setSelectedImages([...props.selectedImages, ...transformedArray.slice(0, 5 - length)])
                                return toast.show({
                                    ...toastConfig,
                                    render: () => {
                                        return (
                                            <Box bg="black" px="2" py="1" rounded="sm">
                                                <Text style={{ color: '#fff', padding: 5 }}>5 Images Only</Text>
                                            </Box>
                                        );
                                    },
                                });
                            }
                        }} icon={<Icon as={PreViewAddIcon} name="emoji-happy" />} borderRadius="full" />
                        <Divider h='7' bg="#7f7f7f" thickness="1" mx="2" orientation="vertical" />
                        <TextInput
                            style={{
                                flex: 1,
                                color: '#fff',
                                fontSize: 14,
                                minHeight: 20,
                                maxHeight: 100,
                            }}
                            defaultValue={props.selectedImages[index] ? props.selectedImages[index].caption : ""}
                            numberOfLines={1}
                            multiline={true}
                            onChangeText={(text) => {
                                props.selectedImages[index].caption = text
                            }}
                            placeholderTextColor="#7f7f7f"
                            selectionColor={'#3276E2'}
                            placeholder='Add a caption...'
                        />
                    </HStack>
                </>
            );
            return scenes;
        }, {})
    );

    return (
        <>
            <View style={styles.container}>
                <HStack mt='5' alignItems={'center'}>
                    <IconButton _pressed={{ bg: "rgba(50,118,226, 0.1)" }} onPress={handleBackBtn} icon={<Icon as={() => LeftArrowIcon('#fff')} name="emoji-happy" />} borderRadius="full" />
                    <Avathar width={30} height={30} fontsize={14} data={fromUserJId || '91'} />
                </HStack>
                <TabView
                    navigationState={{ index, routes: props.selectedImages?.map((_, i) => ({ key: `tab${i + 1}` })) }}
                    renderTabBar={renderTabBar}
                    renderScene={renderScene}
                    onIndexChange={handleIndexChange}
                />
                <HStack mb='5' ml='4'>
                    <Text color='#7f7f7f'>{`>${fromUserJId.split('@')[0]}`}</Text>
                </HStack>
                <HStack>
                    {props.selectedImages?.map((item, i) => (
                        <TouchableOpacity
                            activeOpacity={1}
                            key={item.image.fileCopyUri}
                            style={styles.tabButton}
                            onPress={() => handleIndexChange(i)}
                        >
                            <Image
                                source={{ uri: item.image.fileCopyUri }}
                                style={[
                                    styles.tabImage,
                                    index === i && styles.selectedTabImage,
                                ]}
                            />
                        </TouchableOpacity>
                    ))}
                </HStack>
            </View>
        </>
    )
}

export default GalleryPickView

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    imageContainer: {
        flex: 1,
        paddingHorizontal: 0
    },
    tabContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabImage: {
        width: 45,
        height: 45,
        borderColor: '#7f7f7f',
        borderWidth: 0.25
    },
    tabButton: {
        paddingHorizontal: 2
    },
    selectedTabImage: {
        width: 45,
        height: 45,
        borderColor: '#3276E2',
        borderWidth: 2
    },
});

