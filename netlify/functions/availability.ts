import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const calendar = google.calendar('v3');

interface TimeSlot {
  date: string;
  time: string;
  isoTime: string;
}

// Create a UTC Date that represents a given wall-clock time in a specific timezone
function makeZonedDate(dateYmd: string, hour: number, minute: number, timezone: string): Date {
  // Parse "YYYY-MM-DD HH:MM" as if it's UTC, then shift by the tz offset
  const naiveUtc = new Date(`${dateYmd}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`);
  // sv-SE locale produces "YYYY-MM-DD HH:MM:SS" — clean to re-parse
  const inTzStr = naiveUtc.toLocaleString('sv-SE', { timeZone: timezone });
  const inTzUtc = new Date(inTzStr.replace(' ', 'T') + 'Z');
  const offsetMs = naiveUtc.getTime() - inTzUtc.getTime();
  return new Date(naiveUtc.getTime() + offsetMs);
}

export const handler = async (event: any): Promise<any> => {
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
    const maxDays = parseInt(process.env.MAX_ADVANCE_DAYS || '30');

    console.log('DEBUG ENV CHECK:', {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
      clientIdPrefix: (process.env.GOOGLE_CLIENT_ID || '').slice(0, 20),
      secretPrefix: (process.env.GOOGLE_CLIENT_SECRET || '').slice(0, 10),
      tokenPrefix: (process.env.GOOGLE_REFRESH_TOKEN || '').slice(0, 10),
    });

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    const now = new Date();
    const rangeEnd = new Date(now);
    rangeEnd.setDate(rangeEnd.getDate() + maxDays);

    // Single freebusy query for entire window
    const freebusyResponse = await calendar.freebusy.query({
      auth: oauth2Client,
      requestBody: {
        timeMin: now.toISOString(),
        timeMax: rangeEnd.toISOString(),
        items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
      },
    });

    const busyPeriods = (freebusyResponse.data.calendars?.[process.env.GOOGLE_CALENDAR_ID!]?.busy || [])
      .map((b: any) => ({ start: new Date(b.start), end: new Date(b.end) }));

    const slots: TimeSlot[] = [];

    for (let daysAhead = 1; daysAhead <= maxDays && slots.length < 20; daysAhead++) {
      const date = new Date(now);
      date.setDate(date.getDate() + daysAhead);
      const dateYmd = date.toISOString().split('T')[0];

      // Determine what day of week this date is in the target timezone
      const dayOfWeek = new Date(makeZonedDate(dateYmd, 12, 0, timezone)).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      // Business hours 9 AM – 5 PM in the caller's timezone
      for (let hour = 9; hour < 17 && slots.length < 20; hour++) {
        for (let minute = 0; minute < 60 && slots.length < 20; minute += 30) {
          const slotStart = makeZonedDate(dateYmd, hour, minute, timezone);
          const slotEnd = new Date(slotStart.getTime() + meetingDuration * 60 * 1000);

          // Skip past times
          if (slotStart <= now) continue;

          const isAvailable = !busyPeriods.some(
            (b: { start: Date; end: Date }) => slotStart < b.end && slotEnd > b.start
          );

          if (isAvailable) {
            const displayTime = new Intl.DateTimeFormat('en-US', {
              timeZone: timezone,
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }).format(slotStart);

            slots.push({
              date: dateYmd,
              time: displayTime,
              isoTime: slotStart.toISOString(),
            });
          }
        }
      }
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
      }),
    };
  } catch (error: any) {
    console.error('Availability error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to fetch availability', detail: error.message }),
    };
  }
};
