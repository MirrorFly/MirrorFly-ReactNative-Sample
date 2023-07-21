import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { HStack, Icon, Image, Pressable, Text, View } from "native-base";
import React from "react";
import ScreenHeader from "../components/ScreenHeader";
import { useSelector } from "react-redux";
import { ActivityIndicator, BackHandler, FlatList, ImageBackground } from "react-native";
import { CameraSmallIcon, FolderIcon, TickIcon, VideoSmallIcon } from "../common/Icons";
import GalleryHeader from "../components/GalleryHeader";

const Gallery = (props = {}) => {
    const PAGE_SIZE = 20;
    const { setLocalNav, selectedImages, handleSelectImage, setSelectedImages } = props
    const profileDetails = useSelector(state => state.navigation.profileDetails);
    const [galleryData, setGalleryData] = React.useState([]);
    const [grpView, setGrpView] = React.useState('')
    const [photos, setPhotos] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [hasNextPage, setHasNextPage] = React.useState(false);
    const [endCursor, setEndCursor] = React.useState(null);
    const [checkBox, setCheckbox] = React.useState(false)

    const handleBackBtn = () => {
        if (!checkBox && selectedImages.length) {
            setCheckbox(false)
            setSelectedImages([])
        } else if (checkBox) {
            setCheckbox(false)
        } else {
            setLocalNav("CHATCONVERSATION")
        }
    }

    const renderItem = ({ item }) => {
        return (
            <View style={{ position: 'relative' }} p={0.5}>
                <Pressable
                    onPress={() => handleSelectImage(item.node)}
                    onLongPress={() => handleSelectImage(item.node)}
                >
                    <Image alt="" style={{ width: 135, height: 135 }} source={{ uri: item?.node?.image.uri }} />
                    <View style={{ position: 'absolute', padding: 1, width: 135, height: 135, marginRight: 3, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View position={"absolute"} left={50} bottom={50}>{<Icon as={TickIcon} name="emoji-happy" />}</View>
                    </View>
                    <HStack px={"1"} style={{ backgroundColor: 'rgba(0,0,0,0.3))', position: 'absolute', bottom: 7, left: 4 }}>
                        {item?.node.type.split("/")[0] === "video" && <Icon as={VideoSmallIcon} name="emoji-happy" />}
                    </HStack>
                </Pressable >
            </View >
        )
    }

    const fetchGallery = async () => {
        const photo = await CameraRoll.getAlbums({
            assetType: "All"
        });
        const galleryData = await Promise.allSettled(
            photo.map(async (item) => {
                const params = {
                    first: 1,
                    assetType: "All",
                    groupName: item.title,
                }
                return CameraRoll.getPhotos(params).then(res => ({
                    count: item.count,
                    title: item.title,
                    uri: res.edges[0].node.image.uri
                }));
            })
        );

        galleryData.sort((a, b) => {
            const titleA = a.value.title.toUpperCase();
            const titleB = b.value.title.toUpperCase();
            if (titleA < titleB) {
                return -1;
            } else if (titleA > titleB) {
                return 1;
            } else {
                return 0;
            }
        })

        setGalleryData(galleryData)
    }

    const fetchPhotos = async (groupName, after = null) => {
        try {
            setLoading(true);
            const params = {
                first: PAGE_SIZE,
                groupName: groupName,
                after
            }
            const data = await CameraRoll.getPhotos(params);
            const { has_next_page, end_cursor } = data.page_info;
            setEndCursor(end_cursor)
            setHasNextPage(has_next_page)
            if (after) {
                setPhotos(prevData => [...prevData, ...data.edges]);
            } else {
                setPhotos(data.edges);
            }
            setGrpView(groupName)
        } catch (error) {
            console.log("Photo_Error", error);
        } finally {
            setLoading(false);
        }
    }

    const handleLoadMore = async (after = null) => {
        if (!loading && hasNextPage) {
            fetchPhotos(grpView, endCursor)
        }
    }

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={{ marginBottom: 50 }}>
                <ActivityIndicator size="large" color={'#3276E2'} />
                <Text style={{ textAlign: 'center' }}>Loading Content...</Text>
            </View>
        )
    }

    const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleBackBtn
    );


    React.useEffect(() => {
        fetchGallery()
        return () => {
            backHandler.remove();
        }
    }, [])

    const albumRender = ({ item }) => {
        return (
            <Pressable onPress={() => {
                fetchPhotos(item.value.title)
            }} padding='0.5' style={{ justifyContent: "space-between" }}>
                <View style={{ position: 'relative', width: 135, height: 135 }}>
                    <Image resizeMode="cover" alt={item.value.title} size={135} source={{ uri: item?.value?.uri }} />
                    <HStack px={"0.5"} alignItems={"center"} style={{ backgroundColor: 'rgba(0,0,0,0.1))', position: 'absolute', bottom: 1, width: '100%' }}>
                        {item.value.title === "Camera" ? <Icon as={CameraSmallIcon} name="emoji-happy" /> : <Icon as={FolderIcon} name="emoji-happy" />}
                        <Text ml={1.5} color='#fff' width={"60%"} numberOfLines={1} ellipsizeMode="tail" fontSize={10}>
                            {item.value.title}
                        </Text>
                        <Text color='#fff' position={"absolute"} right={1} fontSize={10}>
                            {item.value.count}
                        </Text>
                    </HStack>
                </View>
            </Pressable>
        )
    }

    const getTitle = () => {
        if (selectedImages.length) {
            return selectedImages.length + "/10 Selected"
        } else if (checkBox) {
            return "Tap Photo to select"
        }
        else {
            return grpView
        }
    }

    return (
        <>
            {grpView ?
                <View mb='20'>
                    <GalleryHeader title={getTitle()}
                        setCheckbox={setCheckbox}
                        checkBox={checkBox}
                        selectedImages={selectedImages}
                        onhandleBack={handleBackBtn} />
                    <View ml="1" mb='16'>
                        <FlatList
                            numColumns={3}
                            data={photos}
                            keyExtractor={(item, index) => item.id + index.toString()}
                            horizontal={false}
                            showsVerticalScrollIndicator={false}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={16}
                            ListFooterComponent={renderFooter}
                            bounces={true}
                            renderItem={renderItem}
                        />
                    </View>
                </View>
                :
                <View mb="20">
                    <ScreenHeader title={'Send to ' + profileDetails?.nickName} onhandleBack={handleBackBtn} />
                    <View ml={"1"} mb='16'>
                        <FlatList
                            numColumns={3}
                            data={galleryData}
                            keyExtractor={(item) => item.value.title.toString()}
                            bounces={false}
                            renderItem={albumRender}
                        />
                    </View>
                </View>
            }
        </>
    )
}
export default Gallery