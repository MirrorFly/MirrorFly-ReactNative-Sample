import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { Image, Pressable, Text, View } from "native-base";
import React from "react";
import ScreenHeader from "../components/ScreenHeader";
import { useSelector } from "react-redux";
import { ActivityIndicator, FlatList, ImageBackground } from "react-native";


function organizeByGroupName(data) {
    const organizedData = {};
    data.forEach(item => {
        const groupName = item.node.group_name;
        if (!organizedData[groupName]) {
            organizedData[groupName] = [];
        }
        organizedData[groupName].push(item);
    });

    return organizedData;
}

export default function SavePicture(props) {
    const PAGE_SIZE = 20;
    const profileDetails = useSelector(state => state.navigation.profileDetails);
    const [galleryData, setGalleryData] = React.useState([]);
    const [grpView, setGrpView] = React.useState('')
    const [photos, setPhotos] = React.useState()
    const [loading, setLoading] = React.useState(false)
    const [hasNextPage, setHasNextPage] = React.useState(false);
    const [endCursor, setEndCursor] = React.useState(null);

    const handleBackBtn = () => {
        props.setLocalNav("CHATCONVERSATION")
    }

    const renderItem = ({ item }) => {
        return (
            <View padding={1}>
                <Image alt="" size={130} source={{ uri: item.node.image.uri }} />
            </View>
        )
    }
    const fetchGallery = async () => {
        const photo = await CameraRoll.getAlbums({
            assetType: "Videos"
        });
        console.log(photo);
        const params = {
            first: 100,
            assetType: "All"
        }
        const data = await CameraRoll.getPhotos(params);
        const organizedData = organizeByGroupName(data.edges);
        setGalleryData(organizedData)
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
            console.log(has_next_page);
            if (after) {
                setPhotos(prevData => [...prevData, ...data.edges]);
            } else {
                setPhotos(data.edges);
            }
            setGrpView(groupName)
        } catch (error) {
            
        }finally{
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

    React.useEffect(() => {
        fetchGallery()
    }, [])

    return (
        <>
            {grpView ?
                <View mb='20'>
                    <ScreenHeader title={grpView} onhandleBack={() => setGrpView('')} />
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
                <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
                    <ScreenHeader title={'Send to ' + profileDetails.nickName} onhandleBack={handleBackBtn} />
                    {Object.keys(galleryData).map((item, index) => (
                        <Pressable onPress={() => {
                            fetchPhotos(item)
                        }} padding='1' key={index} style={{ width: '33.33%', }}>
                            <View style={{ position: 'relative' }}>
                                <Image resizeMode="cover" alt={item} width={130} height={130} source={{ uri: galleryData[item][0].node.image.uri }} />
                                <View style={{ backgroundColor: 'rgba(0,0,0,0.3))', position: 'absolute', bottom: 0, width: '100%' }}>
                                    <Text color='#fff' fontSize={10} textAlign='center'>
                                        {item}
                                    </Text>
                                </View>
                            </View>
                        </Pressable>
                    ))}
                </View>
            }
        </>
    )
}


