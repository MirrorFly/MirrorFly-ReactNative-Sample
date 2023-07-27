import config from "./config";

const { maxAllowedMediaCount, fileSize, imageFileSize, videoFileSize,
    audioFileSize, documentFileSize } = config;

/**
 * @param  {string} name=""
 * find last "DOT" and get file Type
 */
export function getExtension(name = "") {
    if (!name) return "";
    const lastDot = name.substring(name.lastIndexOf(".") + 1, name.length);
    return "." + lastDot;
}

export function getType(type = "") {
    return type && type.includes("/") ? type.split('/')[0] : type;
}
const getMaxAllowedFileSize = (mediaType) => {
    if (mediaType === "image") return imageFileSize;
    else if (mediaType === "video") return videoFileSize;
    else if (mediaType === "audio") return audioFileSize;
    else if (mediaType === "file") return documentFileSize;
    return fileSize;
};

export const validateFileSize = (file, mediaTypeFile) => {
    const filemb = Math.round(file.fileSize / 1024);
    const maxAllowedSize = getMaxAllowedFileSize(mediaTypeFile);

    if (filemb >= maxAllowedSize * 1024) {
        const message = `File size is too large. Try uploading file size below ${maxAllowedSize}MB`;
        if (mediaTypeFile) return message;
    }
    return false;
};