import { Box, Image, Spinner } from 'native-base'
import React from 'react'
import RNFetchBlob from 'rn-fetch-blob';
import { getExtention } from './utils';
import SDK from '../SDK/SDK';
import Avathar from './Avathar';

function RecentChatProfile(props) {

    const [imageSource, setImageSource] = React.useState(null);
    const [isFetching, setIsFetching] = React.useState(false)

    const getImageURL = async () => {
        const imageUrl = await SDK.getMediaURL(props.data.image)
        return fetchImage(imageUrl.data.fileUrl, imageUrl.data.token)
    }

    const fetchImage = async (fileUrl, authToken) => {
        setIsFetching(true)
        let ext = getExtention(fileUrl);
        ext = ext[0];
        let options = {
            fileCache: true,
            appendExt: ext,
        };
        const response = await RNFetchBlob.config(options).fetch('GET', fileUrl, {
            Authorization: authToken
        }).progress((received, total) => { });
        const base64 = await response.readFile('base64');
        response.flush();
        const imageBase64 = `data:image/jpg;base64,${base64}`;
        if (props.component == 'profileImage') storeProfileImage(imageBase64)
        setImageSource(imageBase64)
        setIsFetching(false)
    };

    React.useEffect(() => {
        getImageURL()
    }, [props.data.image]);


    return (
        <Box>
            {isFetching || props.imageUploading
                ? <Spinner />
                : <>
                    {imageSource ?
                        <Image
                            size={45}
                            borderRadius={100}
                            source={{ uri: imageSource }}
                            resizeMode="contain"
                            alt='profile_image'
                        />
                        :
                        <Avathar fontSize={20} width={48} height={48} data={props?.data?.nickName} backgroundColor={"blue"} />
                    }
                </>
            }
        </Box>
    )
}

export default RecentChatProfile