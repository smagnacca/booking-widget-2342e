import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Resend } from 'resend';

const calendar = google.calendar('v3');
const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingRequest {
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  visitorName: string;
  visitorEmail: string;
  meetingType: '15' | '30';
  source?: string; // data-source attribute from widget
  timezone?: string;
}

interface BookingResponse {
  success: boolean;
  eventId?: string;
  confirmationUrl?: string;
  error?: string;
}

export const handler = async (event: any): Promise<any> => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body) as BookingRequest;

    // Validate input
    if (!body.startTime || !body.visitorName || !body.visitorEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Initialize OAuth2 client
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Create event in Google Calendar
    const eventBody = {
      summary: `Meeting with ${body.visitorName}`,
      description: `Meeting type: ${body.meetingType}-minute\nBooked from: ${body.source || 'direct'}\nVisitor: ${body.visitorEmail}`,
      start: {
        dateTime: body.startTime,
        timeZone: body.timezone || 'America/New_York',
      },
      end: {
        dateTime: body.endTime,
        timeZone: body.timezone || 'America/New_York',
      },
      attendees: [
        { email: body.visitorEmail, responseStatus: 'needsAction' },
      ],
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}`,
          conferenceSolutionKey: { conferenceSolution: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      requestBody: eventBody,
      conferenceDataVersion: 1,
    });

    const eventId = response.data.id;
    const startTime = new Date(body.startTime);

    // Send confirmation email via Resend
    await resend.emails.send({
      from: process.env.CONFIRMATION_EMAIL_FROM || 'bookings@book.scottmagnacca.com',
      to: body.visitorEmail,
      subject: `Meeting Confirmed — ${startTime.toLocaleDateString()}`,
      html: generateConfirmationEmail(
        body.visitorName,
        startTime,
        body.meetingType,
        response.data.hangoutLink || ''
      ),
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        eventId,
        confirmationUrl: response.data.htmlLink,
      } as BookingResponse),
    };
  } catch (error) {
    console.error('Booking error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: false,
        error: 'Failed to create booking',
      } as BookingResponse),
    };
  }
};

function generateConfirmationEmail(
  visitorName: string,
  startTime: Date,
  duration: string,
  hangoutLink: string
): string {
  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + parseInt(duration));

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Meeting Confirmed! ✓</h2>
      <p>Hi ${visitorName},</p>
      <p>Your meeting has been scheduled. Here are the details:</p>

      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date & Time:</strong> ${startTime.toLocaleString()}</p>
        <p><strong>Duration:</strong> ${duration} minutes</p>
        ${hangoutLink ? `<p><strong>Video Call:</strong> <a href="${hangoutLink}">${hangoutLink}</a></p>` : ''}
      </div>

      <p>A calendar invitation has been sent to your email. You can also add it to your calendar directly.</p>

      <p>Looking forward to speaking with you!</p>
      <p>Scott Magnacca</p>
    </div>
  `;
}
