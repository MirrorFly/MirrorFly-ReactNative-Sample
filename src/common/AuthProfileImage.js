import React from 'react';
import { Box, Image, Spinner } from 'native-base';
import RNFetchBlob from 'rn-fetch-blob';
import { getExtention } from './utils';
import Avathar from './Avathar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthProfileImage = (props) => {
    const [imageSource, setImageSource] = React.useState(null);
    const [isFetching, setIsFetching] = React.useState(false)
    const profileImageKey = props.image.split('.')[0]

    const handleAuthImage = async () => {
        if (props.image) {
            let profileImage = JSON.parse(await AsyncStorage.getItem('profileImage'))
            if (profileImage && profileImage[profileImageKey]) {
                setImageSource(profileImage[profileImageKey])
            }
            else {
                AsyncStorage.removeItem('profileImage')
                getImageURL()
            }
        }
    }

    const storeProfileImage = (imageBase64) => {
        AsyncStorage.setItem('profileImage', JSON.stringify({ [profileImageKey]: imageBase64 }))
    }

    const getImageURL = async () => {
        const imageUrl = await SDK.getMediaURL(props.image)
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
        const imageBase64 = `data:image/png;base64,${base64}`;
        if (props.component == 'profileImage') storeProfileImage(imageBase64)
        setImageSource(imageBase64)
        setIsFetching(false)
    };

    React.useEffect(() => {
        handleAuthImage()
    }, [props.image]);

    return (
        <Box>
            {isFetching || props.imageUploading
                ? <Spinner />
                : <>
                    {imageSource ?
                        <Image
                            {...props}
                            source={{ uri: imageSource }}
                            resizeMode="contain"
                            alt='profile_image'
                        />
                        :
                        <Avathar fontSize={60} width={157} height={157} data={props?.nickName} backgroundColor={"blue"} />
                    }
                </>
            }
        </Box>
    );
};

export default AuthProfileImage;
