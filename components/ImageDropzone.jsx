import { useEffect } from 'react';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { Text, Group, Image, Flex } from '@mantine/core';
import { MdInsertPhoto, MdCloudUpload } from 'react-icons/md';
import styles from '../styles/SmartForm.module.css';

const ImageDropzone = ({ label, onImageUpload, imageUrl, error }) => {

  const handleDrop = (files) => {
    const file = files[0];
    const imageUrl = URL.createObjectURL(file);
    onImageUpload(file, imageUrl); // Passing file and image URL back to form
  };

  return (
    <div>
      <Text size="sm" c='white' weight={500} mb={2}>{label}</Text>
      <Dropzone
        onDrop={handleDrop}
        onReject={() => onImageUpload(null, null)}
        maxSize={3 * 1024 ** 2}
        accept={IMAGE_MIME_TYPE}
        multiple={false}
        style={{
          border: error ? '1px solid red' : '2px solid white',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '120px',
          backgroundColor: error ? '#ffe6e6' : 'inherit',
        }}
      >
        {imageUrl ? (
          <Image src={imageUrl} height={100} w='100%' fit="cover" />
        ) : (
          <Flex justify="center" align="center" direction="column">
            <MdCloudUpload color='white' size={40} />
            <Text c='white' my='7px' size="sm" inline>
              Upload a photo
            </Text>
            <Text c='white' size="sm" fw='100' inline>
              Drag and drop image here
            </Text>
          </Flex>
        )}
      </Dropzone>
      {error && <Text c="red" size="xs">{error}</Text>}
    </div>
  );
};

export default ImageDropzone;
