import { Image } from 'native-base'
import React from 'react'

function ImagePreView(props) {
  return (
    <>
      <Image
        // resizeMode='contain'
        source={{ uri: props.selectedImage.fileCopyUri }}
        alt={props.selectedImage.name}
      />
    </>
  )
}

export default ImagePreView