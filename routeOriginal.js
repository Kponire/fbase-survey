import { db } from '@/lib/db';
import { upload } from '@/lib/upload';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  try {
    await new Promise((resolve, reject) => {
      upload.fields([
        { name: 'photos[location1]', maxCount: 1 },
        { name: 'photos[location2]', maxCount: 1 },
        { name: 'photos[power1]', maxCount: 1 },
        { name: 'photos[power2]', maxCount: 1 },
        { name: 'photos[cableRoute]', maxCount: 1 },
        { name: 'photos[routerLocation]', maxCount: 1 },
        { name: 'photos.extraLocation', maxCount: 10 },
        { name: 'photos.extraPowerSource', maxCount: 10 },
        { name: 'photos.extraCableRoute', maxCount: 10 },
        { name: 'photos.extraRouterLocation', maxCount: 10 },
      ])(req, {}, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const formData = await req.json(); 

    console.log('Parsed Form Data:', formData);  // Now log the parsed form data

    // Log dynamic fields to ensure they are being passed correctly
    const photos = formData.photos || {}; // Handle uploaded photos
    const extraLocations = formData?.extraLocations ?? []; 
    const extraPowerSources = formData?.extraPowerSources ?? [];
    const extraCableRoutes = formData?.extraCableRoutes ?? [];
    const extraRouterLocations = formData?.extraRouterLocations ?? [];

    // Check if all required fields are present
    const requiredFields = [
      formData.name,
      formData.email,
      formData.phoneNumber,
      formData.address,
      formData.location1,
      formData.location2,
      formData.obstructionDescription,
      formData.distanceToPower1,
      formData.distanceToPower2,
      formData.cableRoute,
      formData.routerLocationDescription,
    ];

    // Log requiredFields to see which ones are missing or undefined
    console.log('Required Fields:', requiredFields);

    // If any required fields are missing, log and return a response
    if (requiredFields.some(field => !field)) {
      console.log('Missing required fields:', requiredFields);
      return NextResponse.json(
        { success: false, message: 'Please fill all the required fields.' },
        { status: 400 }
      );
    }

    // Insert form data into MySQL
    const [result] = await db.query(
      `INSERT INTO survey_responses (
        name, email, phoneNumber, address, location1, location2, obstructionDescription, 
        distanceToPower1, distanceToPower2, cableRoute, routerLocationDescription, photos, 
        extraLocations, extraPowerSources, extraCableRoutes, extraRouterLocations, agreed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        formData.name,
        formData.email,
        formData.phoneNumber,
        formData.address,
        formData.location1,
        formData.location2,
        formData.obstructionDescription,
        formData.distanceToPower1,
        formData.distanceToPower2,
        formData.cableRoute,
        formData.routerLocationDescription,
        JSON.stringify(photos), // Store image paths as JSON
        JSON.stringify(extraLocations), // Handle extra fields with default empty array
        JSON.stringify(extraPowerSources),
        JSON.stringify(extraCableRoutes),
        JSON.stringify(extraRouterLocations),
        formData.agreed ? 1 : 0,
      ]
    );

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing the form:', error); // Log the error to identify the issue
    return NextResponse.json(
      { success: false, message: 'Error submitting the form. Please try again later.' },
      { status: 500 }
    );
  }
}




