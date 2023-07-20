import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { HStack, Icon, Image, Pressable, Text, View } from "native-base";
import React from "react";
import ScreenHeader from "../components/ScreenHeader";
import { useSelector } from "react-redux";
import { ActivityIndicator, BackHandler, FlatList, ImageBackground } from "react-native";
import { CameraSmallIcon, FolderIcon, VideoSmallIcon } from "../common/Icons";
import GalleryHeader from "../components/GalleryHeader";

const Gallery = (props = {}) => {
    const PAGE_SIZE = 20;
    const { setLocalNav, selectedImages, handleSelectImage,setSelectedImages } = props
    const profileDetails = useSelector(state => state.navigation.profileDetails);
    const [galleryData, setGalleryData] = React.useState([]);
    const [grpView, setGrpView] = React.useState('')
    const [photos, setPhotos] = React.useState([])
    const [loading, setLoading] = React.useState(false)
    const [hasNextPage, setHasNextPage] = React.useState(false);
    const [endCursor, setEndCursor] = React.useState(null);

    const handleBackBtn = () => {
        if (grpView.length) {
            setGrpView('')
        }else if(selectedImages.length){
            setSelectedImages([])
        }else {
            setLocalNav("CHATCONVERSATION")
        }
    }

    const renderItem = ({ item }) => {
        return (
            <Pressable position={'relative'} padding={1}
                onPress={() => handleSelectImage(item.node)}
                onLongPress={() => handleSelectImage(item.node)}
            >
                <Image alt="" size={130} source={{ uri: item?.node?.image.uri }} />
                <HStack px={"1"} style={{ backgroundColor: 'rgba(0,0,0,0.3))', position: 'absolute', bottom: 7, left: 4 }}>
                    {item?.node.type.split("/")[0] === "video" && <Icon as={VideoSmallIcon} name="emoji-happy" />}
                </HStack>
            </Pressable>
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
            }} padding='1' style={{ width: '33.33%', }}>
                <View style={{ position: 'relative' }}>
                    <Image resizeMode="cover" alt={item.value.title} width={130} height={130} source={{ uri: item.value?.uri }} />
                    <HStack px={"1"} justifyContent={"space-between"} alignItems={"center"} style={{ backgroundColor: 'rgba(0,0,0,0.3))', position: 'absolute', bottom: 0, width: '100%' }}>
                        {item.value.title === "Camera" ? <Icon as={CameraSmallIcon} name="emoji-happy" /> : <Icon as={FolderIcon} name="emoji-happy" />}
                        <Text color='#fff' width={"60%"} numberOfLines={1} ellipsizeMode="tail" fontSize={10}>
                            {item.value.title}
                        </Text>
                        <Text color='#fff' fontSize={10}>
                            {item.value.count}
                        </Text>
                    </HStack>
                </View>
            </Pressable>
        )
    }

    return (
        <>
            {grpView ?
                <View mb='20'>
                    <GalleryHeader title={
                        selectedImages.length ? selectedImages.length + "/10 Selected" :
                            grpView}
                        selectedImages={selectedImages}
                        onhandleBack={handleBackBtn} />
                    <FlatList
                        numColumns={3}
                        data={photos}
                        keyExtractor={(item, index) => item.id + index.toString()}
                        horizontal={false}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={16}
                        ListFooterComponent={renderFooter}
                        bounces={true}
                        renderItem={renderItem}
                    />
                </View>
                :
                <View mb="20">
                    <ScreenHeader title={'Send to ' + profileDetails?.nickName} onhandleBack={handleBackBtn} />
                    <FlatList
                        numColumns={3}
                        data={galleryData}
                        keyExtractor={(item) => item.value.title.toString()}
                        bounces={false}
                        renderItem={albumRender}
                    />
                </View>
            }
        </>
    )
}
export default Gallery