import React from 'react'
import { HStack, Text, View } from 'native-base'
import { ApkIcon, DocIcon, DownloadIcon, PdfIcon, PPTIcon, XLSIcon } from '../common/Icons';

function convertBytesToKB(bytes) {
    const KB = bytes / 1024;
    return KB.toFixed(2);
}

const PdfCard = (props) => {

    const fileSizeInKB = convertBytesToKB(props.fileSize);
    const mediaData = props.data.msgBody.media
    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'pdf':
                return <PdfIcon />;
            case 'ppt':
                return <PPTIcon />;
            case 'xls':
                return <XLSIcon />;
            case 'apk':
                return <ApkIcon />;
            case 'docx':
                return <DocIcon />;
            default:
                return null;
        }
    }
    const fileExtension = mediaData?.fileName?.split('.').pop();
    return (
        <View  borderColor='#E2E8F7' borderWidth={2} borderRadius={5}  marginY={1} marginX={1} flex={1} width={220} height={70} position={"relative"}>
            <HStack borderRadius={5} backgroundColor={"#EFEFEF"} paddingX={2} paddingY={1}>
                <View py={2}>
                    {getFileIcon(fileExtension)}
                </View>
                <Text px={2} flex={1} numberOfLines={2} fontSize={10} py={1}>{mediaData.fileName}</Text>
                <View style={{ borderRadius: 5, width: 30, height: 30, borderWidth: 2, borderColor: "#AFB8D0", paddingHorizontal: 4, paddingVertical: 4, marginTop: 6 }}>
                    <DownloadIcon width='16' height='15' />
                </View>
            </HStack>
            <View flexDirection={"row"} position={'absolute'} bottom={1}   >
                <Text px={"2"} color={"#000"} fontWeight={"400"} fontSize='7'>{fileSizeInKB}KB</Text>
                {props.status}
                <Text pl={110} color='#767676' fontSize='8'>{props.timeStamp}</Text>
            </View>
        </View>
    )
}
export default PdfCard;
