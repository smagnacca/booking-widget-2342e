export const handler = async (): Promise<any> => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
      clientIdPrefix: (process.env.GOOGLE_CLIENT_ID || '').slice(0, 20),
      secretPrefix: (process.env.GOOGLE_CLIENT_SECRET || '').slice(0, 8),
      tokenPrefix: (process.env.GOOGLE_REFRESH_TOKEN || '').slice(0, 8),
      calendarId: process.env.GOOGLE_CALENDAR_ID,
    }),
  };
};
