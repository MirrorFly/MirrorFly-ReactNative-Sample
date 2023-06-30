import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { BackArrowIcon, CallIcon, FrontArrowIcon, GalleryAllIcon, MailIcon, ReportIcon, StatusIcon } from '../common/Icons';
import {
    Animated,
    View,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    BackHandler,

} from 'react-native';
import { AlertDialog, Center, Text, HStack, Switch } from 'native-base';
const image = { uri: 'https://legacy.reactjs.org/logo-og.png' };
const propTypes = {
    children: PropTypes.node.isRequired,
    src: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.number,
    ]).isRequired,
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
    setLocalNav

}) => {
    const [visible, setVisible] = useState(false);
    const scrollY = useRef(new Animated.Value(0)).current;
    const [animatedTitleColor, setAnimatedTitleColor] = useState(300)
    const scrollDistance = toolbarMaxHeight - toolbarMinHeight;


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

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackHandler
    );

    const handleBackHandler = ()=> {
        setLocalNav('CHATCONVERSATION');
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

    React.useEffect(() => {
        return () => {
            backHandler.remove();
        }
    }, [])
    return (
        <View style={styles.fill}>
            <Animated.ScrollView
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
                <View style={{ marginTop: toolbarMaxHeight, minHeight: 600 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 20,marginRight:10 }}>
                        <Text style={{  fontSize: 14, color: "black", fontWeight: "600", paddingLeft: 10, }}> Mute Notification </Text>
                        <Switch size="md" offTrackColor="indigo.100" onTrackColor="indigo.200" onThumbColor="blue.500" offThumbColor="indigo.50" />
                    </View>
                    <View style={{ marginHorizontal: 10, marginTop: 10, justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 14, color: "black", fontWeight: "700" }}> Email </Text>
                        <View style={{
                            flexDirection: "row", marginHorizontal: 2, justifyContent: "space-between", alignItems: "center", borderBottomColor: "#F2F2F2",
                            borderBottomWidth: 1
                        }}>
                            <MailIcon />
                            <TextInput
                                style={{
                                    color: '#959595',
                                    flex: 1,
                                    fontSize: 13,
                                    marginLeft: 10,
                                }}
                                editable={false}
                                placeholder='mdashik@gmail.com'
                                placeholderTextColor='#959595'
                                keyboardType='email-address'
                                numberOfLines={1}
                            />
                        </View>
                    </View>
                    <View style={{
                        marginHorizontal: 10, marginTop: 12, justifyContent: "space-between", borderBottomColor: "#F2F2F2",
                        borderBottomWidth: 1
                    }}>
                        <Text style={{ fontSize: 14, color: "black", fontWeight: "700" }}> Mobile Number </Text>
                        <View style={{ flexDirection: "row", marginHorizontal: 7, justifyContent: "space-between", alignItems: "center" }}>
                            <CallIcon />
                            <TextInput
                                style={{
                                    color: '#959595',
                                    flex: 1,
                                    fontSize: 13,
                                    marginLeft: 10, 
                                }}
                                editable={false}
                                placeholder='+ 91-8838160009'
                                placeholderTextColor='#959595'
                                keyboardType='email-address'
                                numberOfLines={1}
                            />
                        </View>
                    </View>
                    <View style={{
                        marginHorizontal: 10, marginTop: 12, justifyContent: "space-between", borderBottomColor: "#F2F2F2",
                        borderBottomWidth: 1
                    }}>
                        <Text style={{ fontSize: 13, color: "black", fontWeight: "700" }}> Status </Text>
                        <View style={{ flexDirection: "row", marginHorizontal: 7, justifyContent: "space-between", alignItems: "center" }}>
                            <StatusIcon />
                            <TextInput
                                style={{
                                    color: '#959595',
                                    flex: 1,
                                    fontSize: 13,
                                    marginLeft: 10, 
                                }}
                                editable={false}
                               
                                placeholder='Urgent calls only'
                                placeholderTextColor='#959595'
                                keyboardType="default"
                                numberOfLines={1}
                            />
                        </View>
                    </View>
                    <View style={{
                        flexDirection: "row", marginHorizontal: 13, paddingVertical: 16, justifyContent: "space-between", alignItems: "center", borderBottomColor: "#F2F2F2",
                        borderBottomWidth: 1
                    }}>
                        <View style={{ paddingLeft: 8 }}>
                            <GalleryAllIcon />
                        </View>
                        <Text style={{ fontSize: 14, color: "black", fontWeight: "700", flex: 0.9 }} > View All Media </Text>
                        <TouchableOpacity style={{ padding: 8 }}
                            onPress={handleTapDetails}
                        >
                            <FrontArrowIcon />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: "row", marginHorizontal: 16, marginTop: 12, justifyContent: "flex-start", alignItems: "center", paddingBottom: 300 }}>
                        <TouchableOpacity
                            onPress={handleModel}
                            style={{ flexDirection: "row" }}>
                            <ReportIcon />
                            <Text style={{ fontSize: 14, color: "red", fontWeight: "700", paddingLeft: 14, }} > report </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.ScrollView>
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
                    <View style={{ flexDirection: "column" }}>
                        <Animated.Text style={[styles.title,
                        {
                            color: animatedTitleColor < 330 ? "#fff" : '#000'
                        }
                        ]}>{title}</Animated.Text>
                        {animatedTitleColor < 330 && <Text style={[styles.titleStatus, { color: '#fff' }]}>
                            {titleStatus}
                        </Text>}
                    </View>
                </Animated.View>
            </Animated.View>
            <Animated.View style={styles.bar}>
                <TouchableOpacity onPress={leftItemPress}>
                    <View style={styles.left}>
                        <TouchableOpacity onPress={handleBackHandler} >
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
        </View>
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
        marginVertical:13,
        position: 'absolute',
    },
    bar: {
        top:0,
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
        fontFamily: 'Roboto_medium',
        fontSize: 30,
        padding: 2,
        marginTop: 30
    },
    titleStatus: {
        fontFamily: 'Roboto_medium',
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