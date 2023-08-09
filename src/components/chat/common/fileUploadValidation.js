import {
  ALLOWED_ALL_FILE_FORMATS,
  ALLOWED_AUDIO_FORMATS,
  DOCUMENT_FORMATS,
} from '../../../Helper/Chat/Constant';
import config from './config';

const {
  fileSize,
  imageFileSize,
  videoFileSize,
  audioFileSize,
  documentFileSize,
} = config;

/**
 * @param  {string} name=""
 * find last "DOT" and get file Type
 */
export function getExtension(name = '', isDotrequired = true) {
  if (!name) {
    return '';
  }
  const lastDot = name.substring(name.lastIndexOf('.') + 1, name.length);
  return isDotrequired ? '.' + lastDot : lastDot;
}

export function getType(type = '') {
  return type && type.includes('/') ? type.split('/')[0] : type;
}
const getMaxAllowedFileSize = mediaType => {
  if (mediaType === 'image') {
    return imageFileSize;
  } else if (mediaType === 'video') {
    return videoFileSize;
  } else if (mediaType === 'audio') {
    return audioFileSize;
  } else if (mediaType === 'file') {
    return documentFileSize;
  }
  return fileSize;
};

export const validateFileSize = (size, mediaTypeFile) => {
  const filemb = Math.round(size / 1024);
  const maxAllowedSize = getMaxAllowedFileSize(mediaTypeFile);
  if (filemb >= maxAllowedSize * 1024) {
    const message = `File size is too large. Try uploading file size below ${maxAllowedSize}MB`;
    if (mediaTypeFile) {
      return message;
    }
  }
  return '';
};

export const validation = file => {
  const { name } = file;
  const fileExtension = getExtension(name);

  const allowedFilescheck = new RegExp(
    '([a-zA-Z0-9s_\\.-:])+(' + ALLOWED_ALL_FILE_FORMATS.join('|') + ')$',
    'i',
  );
  let mediaType = getType(file.type);
  if (!allowedFilescheck.test(fileExtension)) {
    let message = 'You can upload only ';
    if (mediaType === 'audio') {
      message = message + `${ALLOWED_AUDIO_FORMATS.join(', ')} files`;
    }
    return message;
  }
  return '';
};
export const isValidFileType = type => {
  return DOCUMENT_FORMATS.includes(type);
};
