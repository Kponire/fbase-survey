import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req, res) {
  const { email } = req.body;  
  try {
    const user = { email };

    // Sign the JWT token with the user's email as the payload
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '50d' });

    // Send the token back to the client
    return NextResponse.json(
        { success: true, token },
        { status: 200 }
    );
  } catch (error) {
    console.error('Error processing the form:', error);
    return NextResponse.json(
        { success: true, message: 'Method not allowed' },
        { status: 405 }
    );
  }
}
