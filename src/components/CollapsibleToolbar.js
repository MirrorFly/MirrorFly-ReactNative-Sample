import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { BackArrowIcon, CallIcon, FrontArrowIcon, GalleryAllIcon, MailIcon, ReportIcon, StatusIcon } from '../common/Icons';
import { Animated, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { AlertDialog, Center, Text, HStack, Switch, View, Pressable } from 'native-base';
const image = { uri: 'https://legacy.reactjs.org/logo-og.png' };
const propTypes = {
    src: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.number,
    ]),
    title: PropTypes.string,
    titleStatus: PropTypes.string,
    titleColor: PropTypes.string,
    leftItem: PropTypes.element,
    leftItemPress: PropTypes.func,
    rightItem: PropTypes.element,
    rightItemPress: PropTypes.func,
    toolbarColor: PropTypes.string,
    toolbarMaxHeight: PropTypes.number,
    toolbarMinHeight: PropTypes.number,
};

const defaultProps = {
    leftItem: null,
    leftItemPress: null,
    rightItem: null,
    rightItemPress: null,
    title: 'Ashik',
    titleStatus: "Last Seen today 10 a.m",
    titleColor: '#000',
    toolbarColor: 'red',
    toolbarMaxHeight: 450,
    toolbarMinHeight: 60,
};

const CollapsingToolbar = ({
    leftItemPress,
    title,
    titleStatus,
    toolbarMaxHeight,
    toolbarMinHeight,
    setLocalNav,
    handleBackBtn
}) => {
    const [visible, setVisible] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;
    const [animatedTitleColor, setAnimatedTitleColor] = useState(300)
    const scrollDistance = toolbarMaxHeight - toolbarMinHeight;
    const window = Dimensions.get('window');
    const screenHeight = window.height;
    const adaptiveMinHeight = screenHeight * 0.9;

    const headerTranslate = scrollY.interpolate({
        inputRange: [0, scrollDistance],
        outputRange: [0, -scrollDistance],
        extrapolate: 'clamp',
    });

    const imageOpacity = scrollY.interpolate({
        inputRange: [0, scrollDistance / 2, scrollDistance],
        outputRange: [1, 1, 0],
        extrapolate: 'clamp',
    });

    const imageTranslate = scrollY.interpolate({
        inputRange: [0, scrollDistance],
        outputRange: [0, 100],
        extrapolate: 'clamp',
    });

    const titleScale = scrollY.interpolate({
        inputRange: [0, scrollDistance / 2, scrollDistance],
        outputRange: [1, 1, 0.8],
        extrapolate: 'clamp',
    });

    const handleModel = () => {
        setVisible(true);
    }

    const handleTapDetails = () => {
        setLocalNav('UsersTapBarInfo');
    }
    const HandleClose = () => {
        setVisible(false)
    }

    const onClose = () => {
        setVisible(false);
    }

    return (
        <View style={styles.fill}>
            <Animated.ScrollView
                bounces={false}
                style={styles.fill}
                scrollEventThrottle={1}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    {
                        useNativeDriver: true,
                        listener: (event) => {
                            const { y } = event.nativeEvent.contentOffset;
                            setAnimatedTitleColor(y)
                        },
                    },
                )}
            >
                <View mx='3' mt={toolbarMaxHeight} minHeight={adaptiveMinHeight} >
                    <HStack my='7' justifyContent={'space-between'}>
                        <Text fontSize={14} fontWeight={600} color={'#000'}> Mute Notification </Text>
                        <Switch size="md" offTrackColor="indigo.100" onTrackColor="indigo.200" onThumbColor="blue.500" offThumbColor="indigo.50" />
                    </HStack>
                    <View mb={4} borderBottomWidth={1} borderBottomColor={'#f2f2f2'}>
                        <Text mb={2} fontSize={14} color={'#000'} fontWeight={700}>Email</Text>
                        <HStack>
                            <MailIcon />
                            <Text mb={2} ml={2} color='#959595' fontSize={13}>mdashik@gmail.com</Text>
                        </HStack>
                    </View>
                    <View mb={4} borderBottomWidth={1} borderBottomColor={'#f2f2f2'}>
                        <Text mb={2} fontSize={14} color={'#000'} fontWeight={700}>Mobile Number</Text>
                        <HStack>
                            <CallIcon />
                            <Text mb={2} ml={2} color='#959595' fontSize={13}>+ 91-8838160009</Text>
                        </HStack>
                    </View>
                    <View mb={4} borderBottomWidth={1} borderBottomColor={'#f2f2f2'}>
                        <Text mb={2} fontSize={14} color={'#000'} fontWeight={700}>Status</Text>
                        <HStack>
                            <StatusIcon />
                            <Text mb={2} ml={2} color='#959595' fontSize={13}>Urgent calls only</Text>
                        </HStack>
                    </View>
                    <Pressable onPress={handleTapDetails} borderBottomColor={'#f2f2f2'} borderBottomWidth={1}>
                        <HStack my='3' alignItems={'center'} justifyContent={'space-between'}>
                            <HStack alignItems={'center'}>
                                <GalleryAllIcon />
                                <Text ml='3' fontSize={14} color={'#000'} fontWeight={700}> View All Media</Text>
                            </HStack>
                            <FrontArrowIcon />
                        </HStack>
                    </Pressable>
                    <Pressable onPress={handleModel}>
                        <HStack my='3' alignItems={'center'} justifyContent={'space-between'}>
                            <HStack alignItems={'center'}>
                                <ReportIcon />
                                <Text ml='5' fontSize={14} color='#FF0000' fontWeight={700}>Report</Text>
                            </HStack>
                        </HStack>
                    </Pressable>
                </View>
            </Animated.ScrollView >
            <Animated.View
                style={[
                    styles.header,
                    {
                        backgroundColor: '#f2f2f2',
                        height: toolbarMaxHeight,
                        transform: [{ translateY: headerTranslate }],
                    },
                ]}
            >
                <Animated.Image
                    style={[
                        styles.backgroundImage,
                        {
                            height: toolbarMaxHeight,
                            opacity: imageOpacity,
                            transform: [{ translateY: imageTranslate }],
                        },
                    ]}
                    source={image}
                />
                <Animated.View
                    style={[
                        styles.action, {
                            backgroundColor: 'transparent',
                            transform: [{ scale: titleScale }],
                        },
                    ]}
                >
                    <View>
                        <Animated.Text style={[styles.title, {
                            marginTop: 35,
                            color: animatedTitleColor < 330 ? "#fff" : '#000'
                        }]}>{title}</Animated.Text>
                        {animatedTitleColor < 330 && <Text style={[styles.titleStatus, { color: '#fff' }]}>
                            {titleStatus}
                        </Text>}
                    </View>
                </Animated.View>
            </Animated.View>
            <Animated.View style={styles.bar}>
                <TouchableOpacity onPress={leftItemPress}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={handleBackBtn} >
                            <BackArrowIcon color={animatedTitleColor < 330 ? "#fff" : '#000'} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Animated.View>
            <Center maxH={'40'} width={"60"} >
                <AlertDialog isOpen={visible}
                    onClose={onClose}
                >
                    <AlertDialog.Content paddingY={"4"} fontSize={20} color={"black"} fontWeight={"600"} alignItems={"center"}>
                        <Text fontSize={16} color={"black"} fontWeight={"600"}>Report Mano Prod Dev?</Text>
                        <AlertDialog.Body paddingY={"4"} fontSize={20} color={"black"} fontWeight={"600"}>
                            <Text fontSize={16} color={"black"} fontWeight={"600"}>
                                The last 5 messages from this contact will be forwarded to the admin. This contact will not be notified.
                            </Text>
                            <HStack ml="119" paddingY={"2"} space={5}>
                                <TouchableOpacity onPress={HandleClose} >
                                    <Text color={"blue.800"}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Text color={"blue.800"}>Remove</Text>
                                </TouchableOpacity>
                            </HStack>
                        </AlertDialog.Body>
                    </AlertDialog.Content>

                </AlertDialog>
            </Center>
        </View >
    );
};

CollapsingToolbar.propTypes = propTypes;
CollapsingToolbar.defaultProps = defaultProps;

export default CollapsingToolbar;
const styles = StyleSheet.create({
    fill: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    header: {
        top: 0,
        left: 0,
        right: 0,
        overflow: 'hidden',
        position: 'absolute',
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        width: null,
        resizeMode: 'cover',
    },
    action: {
        left: 25,
        right: 0,
        bottom: 0,
        height: 70,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginVertical: 13,
        position: 'absolute',
    },
    bar: {
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        position: 'absolute',
        flexDirection: "row",
        justifyContent: 'space-between',
        backgroundColor: 'transparent'
    },
    left: {
        top: 0,
        left: 0,
        width: 50,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    right: {
        top: 0,
        right: 0,
        height: 56,
        minWidth: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 25,
        padding: 2,
        alignItems: 'center',
    },
    titleStatus: {
        fontSize: 14,
    },
    scrollViewContent: {
        paddingTop: 30,
    },
    row: {
        height: 40,
        margin: 16,
        backgroundColor: '#D3D3D3',
        alignItems: 'center',
        justifyContent: 'center',
    },
}); 