"use client"
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { IoMdCloseCircle } from 'react-icons/io';
import ImageDropzone from './ImageDropzone';
import jwt from 'jsonwebtoken';
import { useMemo, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { TextInput, FileInput, Textarea, Checkbox, Button, Title, Group, Stepper, Text, Box, Progress, Loader } from '@mantine/core';
import styles from '../styles/SmartForm.module.css';

const SmartForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [extraLocations, setExtraLocations] = useState([]);
  const [extraPowerSources, setExtraPowerSources] = useState([]);
  const [extraCableRoutes, setExtraCableRoutes] = useState([]);
  const [extraRouterLocations, setExtraRouterLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formLoaded, setFormLoaded] = useState(false);

  const totalSteps = 7;

    // Load saved data on page load (from localStorage or backend)
  useEffect(() => {
    const savedData = localStorage.getItem('savedSurveyData');
    if (savedData) {
      form.setValues(JSON.parse(savedData));
      setFormLoaded(true);
      notifications.show({
        title: 'Form Loaded',
        message: 'Your previously saved data has been loaded!',
        color: 'blue',
        position: 'top-right',
      });
    }
  }, []);

  // Step content based on the active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return {
          heading: 'Personal Information',
          subheading: 'Please provide your personal information to help us know you better.',
        };
      case 1:
        return {
          heading: 'Identify Preferred Installation Locations',
          subheading: 'Select at least two potential locations on your property for the installation of the Starlink dish.',
        };
      case 2:
        return {
          heading: 'Check for Obstructions',
          subheading: 'Ensure that each selected installation location has an unobstructed view of the sky.',
        };
      case 3:
        return {
          heading: 'Locate Nearby Power Sources',
          subheading: 'Identify the nearest power source to each chosen installation location.',
        };
      case 4:
        return {
          heading: 'Plan Cable Routing',
          subheading: 'Plan the route for cabling from the installation site to your desired network equipment location inside the building.',
        };
      case 5:
        return {
          heading: 'Identify Router Location',
          subheading: 'Choose a secure and central location within your premises for placing the Starlink router.',
        };  
      default:
        return {};
    }
  };

  const stepFieldGroups = {
    0: ['name', 'email', 'phoneNumber', 'address'],
    1: ['location1', 'photos.location1', 'location2','photos.location2', 
        ...extraLocations.map((_, i) => `extraLocations.${i}`), 
        ...extraLocations.map((_, i) => `photos.extraLocations.${i}`)],
    2: ['obstructionDescription'],
    3: ['distanceToPower1', 'photos.power1', 'distanceToPower2', 'photos.power2', 
        ...extraPowerSources.map((_, i) => `extraPowerSources.${i}`), 
        ...extraPowerSources.map((_, i) => `photos.extraPowerSource${i}`)],
    4: ['cableRoute', 'photos.cableRoute',
        ...extraCableRoutes.map((_, i) => `extraCableRoutes.${i}`), 
        ...extraCableRoutes.map((_, i) => `photos.extraCableRoute${i}`)],
    5: ['routerLocationDescription', 'photos.routerLocation',
        ...extraRouterLocations.map((_, i) => `extraRouterLocations.${i}`), 
        ...extraRouterLocations.map((_, i) => `photos.extraRouterLocation${i}`)],
    6: ['agreed'],
  };

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      location1: '',
      location2: '',
      obstructionDescription: '',
      distanceToPower1: '',
      distanceToPower2: '',
      cableRoute: '',
      routerLocationDescription: '',
      photos: {
        location1: null,
        location2: null,
        power1: null,
        power2: null,
        cableRoute: null,
        routerLocation: null,
        extraLocations: [],
        extraPowerSources: [],
        extraCableRoutes: [],
        extraRouterLocations: [],        
      },
      photoPreviews: {
        location1: null,
        location2: null,
        power1: null,
        power2: null,
        cableRoute: null,
        routerLocation: null,
        extraLocations: [],
        extraPowerSources: [],
        extraCableRoutes: [],
        extraRouterLocations: [],
      },
      extraLocations: [],
      extraPowerSources: [],
      extraCableRoutes: [],
      extraRouterLocations: [],      
      agreed: false,
    },
    validate: {
      name: (value) => (value ? null : 'Name is required'),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      phoneNumber: (value) => (value ? null : 'Invalid phone number'),
      address: (value) => (value ? null : 'Address is required'),
      location1: (value) => (value ? null : 'Location 1 is required'),
      location2: (value) => (value ? null : 'Location 2 is required'),
      obstructionDescription: (value) => (value ? null : 'Location 1 is required'),
      distanceToPower1: (value) => (value ? null : 'Distance to power source 1 is required'),
      distanceToPower2: (value) => (value ? null : 'Distance to power source 2 is required'),
      cableRoute: (value) => (value ? null : 'Cable route description is required'),
      routerLocationDescription: (value) => (value ? null : 'Router location description is required'),
      'photos.location1': (value) => (value ? null : 'Photo for location 1 is required'),
      'photos.location2': (value) => (value ? null : 'Photo for location 2 is required'),
      'photos.power1': (value) => (value ? null : 'Photo for power source 1 is required'),
      'photos.power2': (value) => (value ? null : 'Photo for power source 2 is required'),
      'photos.cableRoute': (value) => (value ? null : 'Photo for cable route is required'),
      'photos.routerLocation': (value) => (value ? null : 'Photo for router location is required'),
      agreed: (value) => (value ? null : 'You must agree to the terms'),

      // Validate extra locations
      ...extraLocations.reduce((acc, _, index) => ({
        ...acc,
        [`extraLocations.${index}`]: (value) => (value ? null : `Extra Location ${index + 3} is required`),
        [`photos.extraLocations.${index}`]: (value) => (value ? null : `Photo for Extra Location ${index + 3} is required`),
      }), {}),

      // Validate extra power sources
      ...extraPowerSources.reduce((acc, _, index) => ({
        ...acc,
        [`extraPowerSources.${index}`]: (value) => (value ? null : `Distance to Extra Power Source ${index + 3} is required`),
        [`photos.extraPowerSources.${index}`]: (value) => (value ? null : `Photo for Extra Power Source ${index + 3} is required`),
      }), {}),

      // Validate extra cable routes
      ...extraCableRoutes.reduce((acc, _, index) => ({
        ...acc,
        [`extraCableRoutes.${index}`]: (value) => (value ? null : `Extra Cable Route ${index + 2} is required`),
        [`photos.extraCableRoutes.${index}`]: (value) => (value ? null : `Photo for Extra Cable Route ${index + 2} is required`),
      }), {}),

      // Validate extra router locations
      ...extraRouterLocations.reduce((acc, _, index) => ({
        ...acc,
        [`extraRouterLocations.${index}`]: (value) => (value ? null : `Extra Router Location ${index + 2} is required`),
        [`photos.extraRouterLocations.${index}`]: (value) => (value ? null : `Photo for Extra Router Location ${index + 2} is required`),
      }), {}),      
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      // Collect all data from localStorage and the form
      //const personalInfo = jwt.decode(localStorage.getItem('personalInfo'));
      //const formData = { ...form.values, ...personalInfo };

      const formData = new FormData();

      // Append text fields
      Object.keys(values).forEach((key) => {
        if (key !== 'photos') {
          formData.append(key, values[key]);
        }
      });
  
      // Append files for photos
      Object.keys(values.photos).forEach((key) => {
        const photoField = values.photos[key];
        if (Array.isArray(photoField)) {
          photoField.forEach((file, index) => {
            if (file) {
              formData.append(`photos[${key}]`, file);
            }
          });
        } else if (photoField) {
          formData.append(`photos[${key}]`, photoField);
        }
      });

      console.log(formData);

      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        //body: formData,
      });

      if (!response.ok) {
        notifications.show({
          title: 'Error',
          message: 'Network response was not ok',
          color: 'red',
          position: 'top-right'
        });
        setLoading(false);
        return;
      }

      notifications.show({
        title: 'Success',
        message: 'Form submitted successfully!',
        color: 'green',
        position: 'top-right'
      });

      //setSubmitted(true);

    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'There was a problem with your fetch operation',
        color: 'red',
        position: 'top-right'
      });
      setLoading(false);
    }
  };

  const handleLogin = async (email) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      localStorage.setItem('token', data.token);
  
      notifications.show({
        title: 'Login Successful',
        message: 'You can now proceed with your form.',
        color: 'green',
        position: 'top-right',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to log in or start the form.',
        color: 'red',
        position: 'top-right',
      });
    }
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };
  

  const nextStep = () => {  
    const fieldsToValidate = stepFieldGroups[activeStep] || [];
    const hasErrors = fieldsToValidate.some((field) => form.validateField(field).hasError);
    if (hasErrors) {
      notifications.show({
        title: 'Error',
        message: 'Please fill out all required fields in the current step.',
        color: 'red',
        position: 'top-right'
      });
      return;
    }
    
    if (activeStep === 0) {
      // Create JWT with personal information
      const token = localStorage.getItem('token');
      if (!token) handleLogin(form.values.email);
      // Save step data to localStorage
      const savedData = JSON.stringify(form.values);
      localStorage.setItem('savedSurveyData', savedData);
    } else {
      // Save step data to localStorage
      const savedData = JSON.stringify(form.values);
      localStorage.setItem('savedSurveyData', savedData);
      // Store current step data in localStorage (progressive save)
      const stepData = {};
      fieldsToValidate.forEach(field => {
        stepData[field] = getNestedValue(form.values, field);
      });
      localStorage.setItem(`stepData-${activeStep}`, JSON.stringify(stepData));
    }

    setActiveStep((current) => (current < 6 ? current + 1 : current));
  };

  const prevStep = () => setActiveStep((current) => (current > 0 ? current - 1 : current));

  const handleAddExtraField = (fieldType) => {
    const baseFieldGroups = {
      location: ['location1', 'location2',
        ...extraLocations.map((_, i) => `extraLocations.${i}`), 
        ...extraLocations.map((_, i) => `photos.extraLocations.${i}`)],
      powerSource: ['distanceToPower1', 'distanceToPower2', 
        ...extraPowerSources.map((_, i) => `extraPowerSources.${i}`),
        ...extraPowerSources.map((_, i) => `photos.extraPowerSources.${i}`)],
      cableRoute: ['cableRoute', 
        ...extraCableRoutes.map((_, i) => `extraCableRoutes.${i}`),
        ...extraCableRoutes.map((_, i) => `photos.extraCableRoutes.${i}`)],
      routerLocation: ['routerLocationDescription', 
        ...extraRouterLocations.map((_, i) => `extraRouterLocations.${i}`),
        ...extraRouterLocations.map((_, i) => `photos.extraRouterLocations.${i}`)],
    };
  
    const fieldValidators = baseFieldGroups[fieldType];
    
    if (fieldValidators && fieldValidators.every((field) => !form.validateField(field).hasError)) {
      const newFields = {
        location: () => setExtraLocations((prev) => [...prev, '']),
        powerSource: () => setExtraPowerSources((prev) => [...prev, '']),
        cableRoute: () => setExtraCableRoutes((prev) => [...prev, '']),
        routerLocation: () => setExtraRouterLocations((prev) => [...prev, '']),
      };
      newFields[fieldType]();
    } else {
      notifications.show({
        title: 'Error',
        message: 'Please fill out the base fields for this section before adding more.',
        color: 'red',
        position: 'top-right'
      });
    }
  };

  const handleRemoveExtraField = (fieldType, index) => {
    if (fieldType === 'location') {
      setExtraLocations(extraLocations.filter((_, i) => i !== index));
      form.removeListItem('extraLocations', index);
      form.removeListItem('photos.extraLocations', index);
      form.removeListItem('photoPreviews.extraLocations', index);
    } else if (fieldType === 'powerSource') {
      setExtraPowerSources(extraPowerSources.filter((_, i) => i !== index));
      form.removeListItem('extraPowerSources', index);
      form.removeListItem('photos.extraPowerSources', index);
      form.removeListItem('photoPreviews.extraPowerSources', index);
    } else if (fieldType === 'cableRoute') {
      setExtraCableRoutes(extraCableRoutes.filter((_, i) => i !== index));
      form.removeListItem('extraCableRoutes', index);
      form.removeListItem('photos.extraCableRoutes', index);
      form.removeListItem('photoPreviews.extraCableRoutes', index);
    } else if (fieldType === 'routerLocation') {
      setExtraRouterLocations(extraRouterLocations.filter((_, i) => i !== index));
      form.removeListItem('extraRouterLocations', index);
      form.removeListItem('photos.extraRouterLocations', index);
      form.removeListItem('photoPreviews.extraRouterLocations', index);
    }
  };

  const isStepComplete = (step, form) => {
    const fieldsToValidate = stepFieldGroups[step] || [];
    return fieldsToValidate.every((field) => form.isValid(field));
  };

  // Calculate completed steps
  const completedSteps = useMemo(() => {
    let count = 0;
    for (let i = 0; i < totalSteps; i++) {
      if (isStepComplete(i, form)) {
        count += 1;
      }
    }
    return count;
  }, [form, extraLocations, extraPowerSources, extraCableRoutes, extraRouterLocations]);

  const progressPercentage = (completedSteps / totalSteps) * 100;
  const stepContent = getStepContent(activeStep);

  const handleImageUpload = (field, file, imageUrl) => {
    form.setFieldValue(`photos.${field}`, file);
    form.setFieldValue(`photoPreviews.${field}`, imageUrl);
  };

  return (
    <>
     {submitted ? (
        <Box className={styles.thankYouMessage}>
          {/* <img src="/thank-you.gif" alt="Thank You" className={styles.thankYouImage} /> */}
          <Title order={2} className={styles.thankYouTitle}>Thank you for filling out the form!</Title>
          <Text className={styles.thankYouText}>We greatly appreciate your time and effort in completing the survey. Your responses are invaluable to us, and we will use them to provide the best installation experience possible. Thank you for choosing our services!</Text>
        </Box>
      ) : (
      <>
      <Text className={styles.title} component="h1">Starlink Installation Survey Form</Text>
      <Box className={styles.formSection}>
        <Title order={2} className={styles.formHeading}>{stepContent.heading}</Title>
        <Text className={styles.formSubHeading}>{stepContent.subheading}</Text>
      </Box>
      <Box className={styles.displayStep}>
        <Text className={styles.stepnum}> Step {activeStep + 1}/7 </Text>
        {/* <Box className={styles.progressContainer}>
            <Progress value={progressPercentage} className={styles.progressBar} />
            <Text className={styles.progressText}>
            {completedSteps} of {totalSteps} completed
            </Text>
        </Box> */}
      </Box>
      <form className={styles.formCon}>
      <Stepper
        active={activeStep}
        breakpoint="sm"
        orientation='vertical'
        classNames={{
          steps: styles.stepperContainer,          
          stepBody: styles.stepBody,
          stepLabel: styles.stepLabel,
          stepDescription: styles.stepDescription,
          /* stepCompletedIcon: styles.completedStep,
          stepIcon: styles.stepIcon,
          active: styles.activeStep, */
        }}
      >
          {/* Step 1: Personal Details */}
          <Stepper.Step label="Personal Details" description="Enter personal information">
            <Box className={styles.form}>
              <TextInput
                label="Name"
                placeholder="John Doe"
                {...form.getInputProps('name')}
                classNames={{ label: styles.label, input: styles.input }}
                required
              />
              <TextInput
                label="Email"
                placeholder="johndoe@business.com"
                {...form.getInputProps('email')}
                classNames={{ label: styles.label, input: styles.input }}
                required
              />
              <TextInput
                label="Phone Number"
                placeholder="+123 456 7890"
                {...form.getInputProps('phoneNumber')}
                classNames={{ label: styles.label, input: styles.input }}
                required
              />
              <TextInput
                label="Address"
                placeholder="123 Main St, Springfield, IL"
                {...form.getInputProps('address')}
                classNames={{ label: styles.label, input: styles.input }}
                required
              />
            </Box>  
          </Stepper.Step>

          {/* Step 2: Installation Locations */}
          <Stepper.Step label="Installation Locations" description="Specify installation locations">
            <Box className={styles.form}>
              <TextInput
                label="Location 1"
                placeholder="Roof or open yard with clear sky"
                {...form.getInputProps('location1')}
                classNames={{ label: styles.label, input: styles.input }}
                required
              />
              <ImageDropzone
                label="Upload photo for Location 1"
                imageUrl={form.values.photoPreviews.location1}
                onImageUpload={(file, imageUrl) => handleImageUpload('location1', file, imageUrl)}
                error={form.errors['photos.location1']}
              />
              <TextInput
                label="Location 2"
                placeholder="Exterior wall or open space in the compound"
                {...form.getInputProps('location2')}
                classNames={{ label: styles.label, input: styles.input}}
                required
              />
              <ImageDropzone
                label="Upload photo for Location 2"
                imageUrl={form.values.photoPreviews.location2}
                onImageUpload={(file, imageUrl) => handleImageUpload('location2', file, imageUrl)}
                error={form.errors['photos.location2']}
              />
              {extraLocations.map((_, index) => (
                <Box key={index}>
                  <TextInput
                    label={`Extra Location ${index + 3}`}
                    placeholder={`Describe extra location ${index + 3}`}
                    {...form.getInputProps(`extraLocations.${index}`)}
                    classNames={{ label: styles.label, input: styles.input }}
                    required
                  />
                  <ImageDropzone
                    label={`Upload photo of extra location ${index + 3}`}
                    imageUrl={form.values.photoPreviews.extraLocations[index]}
                    onImageUpload={(file, imageUrl) => handleImageUpload(`extraLocations.${index}`, file, imageUrl)}
                    error={form.errors[`photos.extraLocations.${index}`]}
                  />
                <Text className={styles.remove} onClick={() => handleRemoveExtraField('location', index)}>[remove]</Text>             
                </Box>
              ))}
              <Button className={styles.submitButton} onClick={() => handleAddExtraField('location')}>Add More</Button>
            </Box>
          </Stepper.Step>

          {/* Step 3: Obstruction Details */}
          <Stepper.Step label="Obstructions" description="Describe obstructions">
            <Box className={styles.form}>
              <Textarea
                label="Obstruction Description"
                placeholder="Trees or tall buildings near the installation site"
                {...form.getInputProps('obstructionDescription')}
                classNames={{ label: styles.label, input: styles.areaInput }}
                required
              />
            </Box>
          </Stepper.Step>

          {/* Step 4: Power Source Details */}
          <Stepper.Step label="Power Sources" description="Specify power sources">
            <Box className={styles.form}>
              <Textarea
                label="Distance to power source for location 1 (meters)"
                placeholder="1.5 meters from the nearest outdoor socket"
                {...form.getInputProps('distanceToPower1')}
                classNames={{ label: styles.label, input: styles.input }}
                required
              />
              <ImageDropzone
                label="Upload photo of power source for location 1"
                imageUrl={form.values.photoPreviews.power1}
                onImageUpload={(file, imageUrl) => handleImageUpload('power1', file, imageUrl)}
                error={form.errors['photos.power1']}
              />
              {/* <FileInput
                label="Upload photo of power source for location 1"
                placeholder="Choose file"
                {...form.getInputProps('photos.power1')}
                classNames={{ label: styles.label, input: styles.input }}
                accept="image/png, image/jpeg"
                clearable required
              /> */}
              <Textarea
                label="Distance to power source for location 2 (meters)"
                placeholder="2 meters from nearest power outlet"
                {...form.getInputProps('distanceToPower2')}
                classNames={{ label: styles.label, input: styles.input }}
                required
              />
              <ImageDropzone
                label="Upload photo of power source for location 2"
                imageUrl={form.values.photoPreviews.power2}
                onImageUpload={(file, imageUrl) => handleImageUpload('power2', file, imageUrl)}
                error={form.errors['photos.power2']}
              />
              {/* <FileInput
                label="Upload photo of power source for location 2"
                placeholder="Choose file"
                {...form.getInputProps('photos.power2')}
                classNames={{ label: styles.label, input: styles.input }}
                accept="image/png, image/jpeg"
                clearable required
              /> */}
              {extraPowerSources.map((_, index) => (
                <Box key={index}>
                  <Textarea
                    label={`Distance to extra power source ${index + 3} (meters)`}
                    placeholder="Extimated distance"
                    {...form.getInputProps(`extraPowerSources.${index}`)}
                    classNames={{ label: styles.label, input: styles.input }}
                    required
                  />
                  <ImageDropzone
                    label={`Upload photo of extra power source ${index + 3}`}
                    imageUrl={form.values.photoPreviews.extraPowerSources[index]}
                    onImageUpload={(file, imageUrl) => handleImageUpload(`extraPowerSources.${index}`, file, imageUrl)}
                    error={form.errors[`photos.extraPowerSources.${index}`]}
                  />
                  {/* <FileInput
                    label={`Upload photo of extra power source ${index + 3}`}
                    placeholder="Choose file"
                    {...form.getInputProps(`photos.extraPowerSource${index}`)}
                    classNames={{ label: styles.label, input: styles.input }}
                    accept="image/png, image/jpeg"
                    clearable required
                  /> */}
                  <Text className={styles.remove} onClick={() => handleRemoveExtraField('powerSource', index)}>[remove]</Text>
                </Box>
              ))}
              <Button className={styles.submitButton} onClick={() => handleAddExtraField('powerSource')}>Add More</Button>
            </Box>
          </Stepper.Step>

          {/* Step 5: Cable Routing */}
          <Stepper.Step label="Cable Routing" description="Plan cable routing">
            <Box className={styles.form}>
              <Textarea
                label="Cable Route Description"
                placeholder="Route cable from roof to server room inside"
                {...form.getInputProps('cableRoute')}
                classNames={{ label: styles.label, input: styles.input }}
                required
              />
              <ImageDropzone
                label="Upload photo of planned cable route"
                imageUrl={form.values.photoPreviews.cableRoute}
                onImageUpload={(file, imageUrl) => handleImageUpload('cableRoute', file, imageUrl)}
                error={form.errors['photos.cableRoute']}
              />
              {/* <FileInput
                label="Upload photo of planned cable route"
                placeholder="Choose file"
                {...form.getInputProps('photos.cableRoute')}
                classNames={{ label: styles.label, input: styles.input }}
                accept="image/png, image/jpeg"
                clearable required
              /> */}
              {extraCableRoutes.map((_, index) => (
                <Box key={index}>
                  <Textarea
                    label={`Extra Cable Route ${index + 2}`}
                    placeholder={`Describe extra cable route ${index + 2}`}
                    {...form.getInputProps(`extraCableRoutes.${index}`)}
                    classNames={{ label: styles.label, input: styles.input }}
                    required
                  />
                  <ImageDropzone
                    label={`Upload photo of extra cable route ${index + 3}`}
                    imageUrl={form.values.photoPreviews.extraCableRoutes[index]}
                    onImageUpload={(file, imageUrl) => handleImageUpload(`extraCableRoutes.${index}`, file, imageUrl)}
                    error={form.errors[`photos.extraCableRoutes.${index}`]}
                  />
                  {/* <FileInput
                    label={`Upload photo of extra cable route ${index + 2}`}
                    placeholder="Choose file"
                    {...form.getInputProps(`photos.extraCableRoute${index}`)}
                    classNames={{ label: styles.label, input: styles.input }}
                    accept="image/png, image/jpeg"
                    clearable required
                  /> */}
                  <Text className={styles.remove} onClick={() => handleRemoveExtraField('cableRoute', index)}>[remove]</Text>
                </Box>
              ))}
              <Button className={styles.submitButton} onClick={() => handleAddExtraField('cableRoute')}>Add More</Button>
            </Box>
          </Stepper.Step>

          {/* Step 6: Router Location */}
          <Stepper.Step label="Router Location" description="Specify router location">
            <Box className={styles.form}>
              <TextInput
                label="Router Location Description"
                placeholder="Server room or central office location"
                {...form.getInputProps('routerLocationDescription')}
                classNames={{ label: styles.label, input: styles.input }}
                required
              />
              <ImageDropzone
                label="Upload photo of router location"
                imageUrl={form.values.photoPreviews.routerLocation}
                onImageUpload={(file, imageUrl) => handleImageUpload('routerLocation', file, imageUrl)}
                error={form.errors['photos.routerLocation']}
              />
              {/* <FileInput
                label="Upload photo of router location"
                placeholder="Choose file"
                {...form.getInputProps('photos.routerLocation')}
                classNames={{ label: styles.label, input: styles.input }}
                accept="image/png, image/jpeg"
                clearable required
              /> */}
              {extraRouterLocations.map((_, index) => (
                <Box key={index}>
                  <TextInput
                    label={`Extra Router Location ${index + 2}`}
                    placeholder={`Describe extra router location ${index + 2}`}
                    {...form.getInputProps(`extraRouterLocations.${index}`)}
                    classNames={{ label: styles.label, input: styles.input }}
                    required
                  />
                  <ImageDropzone
                    label={`Upload photo of extra router location ${index + 3}`}
                    imageUrl={form.values.photoPreviews.extraRouterLocations[index]}
                    onImageUpload={(file, imageUrl) => handleImageUpload(`extraRouterLocations.${index}`, file, imageUrl)}
                    error={form.errors[`photos.extraRouterLocations.${index}`]}
                  />
                  {/* <FileInput
                    label={`Upload photo of extra router location ${index + 2}`}
                    placeholder="Choose file"
                    {...form.getInputProps(`photos.extraRouterLocations.${index}`)}
                    classNames={{ label: styles.label, input: styles.input }}
                    accept="image/png, image/jpeg"
                    clearable required
                  /> */}
                  <Text className={styles.remove} onClick={() => handleRemoveExtraField('routerLocation', index)}>[remove]</Text>
                </Box>
              ))}
              <Button className={styles.submitButton} onClick={() => handleAddExtraField('routerLocation')}>Add More</Button>
            </Box>  
          </Stepper.Step>

          {/* Step 7: Acknowledgment */}
          <Stepper.Step label="Acknowledgment" description="Confirm details and submit">
              <Checkbox
                label="I acknowledge that inaccurate information may result in extra charges."
                {...form.getInputProps('agreed', { type: 'checkbox' })}
                className={styles.checkbox}
                required
              />
          </Stepper.Step>
        </Stepper>

        {/* Navigation Buttons */}
        <Group>
          {activeStep > 0 && (
            <Button variant="default" style={{ color: '#0E3465' }} onClick={prevStep} disabled={loading}>
              Back
            </Button>
          )}
          {activeStep < 6 ? (
            <Button onClick={nextStep} style={{ fontSize: '14px', paddingTop: '2px', backgroundColor: '#14B8FF', color: '#FFFFFF' }} disabled={loading}>
              Save & Continue
            </Button>
          ) : (
            <Button onClick={form.onSubmit(handleSubmit)} style={{ backgroundColor: '#14B8FF', color: '#FFFFFF' }} disabled={loading}>
              {loading ? <Loader color="white" size="sm" /> : 'Submit'}
            </Button>
          )}
        </Group>
      </form>
      </>
      )}
    </>
  );
};

export default SmartForm;
