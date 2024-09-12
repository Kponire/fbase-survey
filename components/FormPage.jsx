"use client"
import NextImage from 'next/image';
import { Text, TextInput, Button, Box, Image, ScrollArea } from '@mantine/core';
import Logo from '../images/Logo.png';
import styles from '../styles/SmartForm.module.css';
import SmartForm from './SmartForm';

const FormPage = () => {
  return (
    <Box className={styles.container}>
      <Image component={NextImage} src={Logo} className={styles.logo} alt="My image" />      
      <Box className={styles.sideForm}>
        {/* <Text className={styles.title} component="h1">Starlink Installation Survey Form</Text> */}
        <Box> <SmartForm /> </Box>
      </Box>

      <Box className={styles.sideImage}>
        <Box className={styles.sideImageOverlay} />
      </Box>

    </Box>
  );
}

export default FormPage