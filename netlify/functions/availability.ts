import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const calendar = google.calendar('v3');

interface AvailabilityRequest {
  timezone?: string;
  meetingType?: '15' | '30';
  startDate?: string;
}

interface TimeSlot {
  date: string;
  time: string;
  isoTime: string;
}

interface AvailabilityResponse {
  slots: TimeSlot[];
  timezone: string;
  nextAvailable: string | null;
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

  try {
    const query = event.queryStringParameters || {};
    const timezone = query.timezone || 'America/New_York';
    const meetingType = (query.meetingType || '30') as '15' | '30';
    const meetingDuration = parseInt(meetingType);

    // Initialize OAuth2 client with refresh token
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Get available slots for next 30 days
    const now = new Date();
    const slots: TimeSlot[] = [];

    // Business hours: 9 AM - 5 PM, Monday - Friday
    const businessHourStart = 9;
    const businessHourEnd = 17;

    for (let daysAhead = 1; daysAhead <= process.env.MAX_ADVANCE_DAYS || 30; daysAhead++) {
      const date = new Date(now);
      date.setDate(date.getDate() + daysAhead);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Check 30-minute slots throughout the day
      for (let hour = businessHourStart; hour < businessHourEnd; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotStart = new Date(date);
          slotStart.setHours(hour, minute, 0, 0);

          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + meetingDuration);

          // Check if slot is available in Google Calendar
          const isAvailable = await checkAvailability(
            oauth2Client,
            slotStart,
            slotEnd
          );

          if (isAvailable) {
            const localTime = formatTimeInTimezone(slotStart, timezone);
            slots.push({
              date: date.toISOString().split('T')[0],
              time: localTime,
              isoTime: slotStart.toISOString(),
            });
          }

          if (slots.length >= 20) break;
        }
        if (slots.length >= 20) break;
      }

      if (slots.length >= 20) break;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        slots: slots.slice(0, 20),
        timezone,
        nextAvailable: slots.length > 0 ? slots[0].isoTime : null,
      } as AvailabilityResponse),
    };
  } catch (error) {
    console.error('Availability error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to fetch availability' }),
    };
  }
};

async function checkAvailability(
  oauth2Client: OAuth2Client,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  try {
    const response = await calendar.freebusy.query({
      auth: oauth2Client,
      requestBody: {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
      },
    });

    const busy = response.data.calendars?.[process.env.GOOGLE_CALENDAR_ID!]?.busy || [];
    return busy.length === 0; // No conflicts = available
  } catch (error) {
    console.error('Error checking availability:', error);
    return false;
  }
}

function formatTimeInTimezone(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return formatter.format(date);
}
