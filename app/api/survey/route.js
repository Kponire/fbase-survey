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
        { name: 'photos.extraLocations', maxCount: 10 },
        { name: 'photos.extraPowerSources', maxCount: 10 },
        { name: 'photos.extraCableRoutes', maxCount: 10 },
        { name: 'photos.extraRouterLocations', maxCount: 10 },
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


/* import { IncomingForm } from 'formidable';
import { db } from '@/lib/db'; // Your MySQL DB configuration
import path from 'path';
import fs from 'fs/promises';
import { Readable } from 'stream'; // Import Node.js Readable stream

// Disable bodyParser, since formidable will handle the parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to convert Next.js request to a Node.js-readable stream
async function requestToNodeReadable(req) {
  const reader = req.body.getReader();
  return new Readable({
    async read() {
      const { done, value } = await reader.read();
      this.push(done ? null : Buffer.from(value));
    },
  });
}

export async function POST(req) {
  // Convert the Next.js req to a readable stream for formidable
  const nodeReq = await requestToNodeReadable(req);

  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), 'uploads'),
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB limit
    multiples: true, // Handle multiple files
  });

  return new Promise((resolve, reject) => {
    form.parse(nodeReq, async (err, fields, files) => {
      if (err) {
        return resolve(new Response(JSON.stringify({ message: 'Error parsing form data', error: err }), { status: 500 }));
      }

      try {
        // Process uploaded files
        const uploadedPhotos = {};
        for (const key of Object.keys(files)) {
          const file = files[key];
          const filePath = path.join(form.uploadDir, file.newFilename);

          // Ensure directory exists before moving the file
          await fs.mkdir(form.uploadDir, { recursive: true });

          // Store photo path
          uploadedPhotos[key] = filePath;
        }

        // Combine text fields and photos into one data object, excluding `photoPreviews`
        const formData = { ...fields, photos: uploadedPhotos };

        // Store data in MySQL database
        const [result] = await db.query(
          `INSERT INTO survey_responses (name, email, phoneNumber, address, location1, location2, obstructionDescription, 
            distanceToPower1, distanceToPower2, cableRoute, routerLocationDescription, photos, 
            extraLocations, extraPowerSources, extraCableRoutes, extraRouterLocations, agreed) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            JSON.stringify(formData.photos), // Store photos as JSON
            JSON.stringify(formData.extraLocations || []),
            JSON.stringify(formData.extraPowerSources || []),
            JSON.stringify(formData.extraCableRoutes || []),
            JSON.stringify(formData.extraRouterLocations || []),
            formData.agreed ? 1 : 0, // Store boolean as an integer
          ]
        );

        // Send response back to the client
        return resolve(new Response(JSON.stringify({ message: 'Form submitted successfully!', data: result }), { status: 200 }));

      } catch (error) {
        // Handle any errors during database insertion
        return resolve(new Response(JSON.stringify({ message: 'Database insertion failed', error }), { status: 500 }));
      }
    });
  });
} */