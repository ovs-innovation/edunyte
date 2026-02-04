import axios from "axios";

/**
 * Zoom Server-to-Server OAuth (account-level)
 *
 * Env required:
 * - ZOOM_ACCOUNT_ID
 * - ZOOM_CLIENT_ID
 * - ZOOM_CLIENT_SECRET
 * - ZOOM_USER_ID (optional; defaults to "me")
 *
 * WHY:
 * - Server-side OAuth avoids storing user refresh tokens.
 * - Lets backend create scheduled meetings after payment is confirmed.
 */

const ZOOM_OAUTH_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE = "https://api.zoom.us/v2";

let cachedToken = null;
let cachedTokenExp = 0;

const getAccessToken = async () => {
  const now = Date.now();
  if (cachedToken && cachedTokenExp - 30_000 > now) return cachedToken;

  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Zoom S2S OAuth env vars missing");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const resp = await axios.post(
    `${ZOOM_OAUTH_URL}?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`,
    null,
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      timeout: 10000,
    }
  );

  const token = resp.data?.access_token;
  const expiresIn = Number(resp.data?.expires_in || 0) * 1000;
  if (!token || !expiresIn) throw new Error("Failed to obtain Zoom access token");

  cachedToken = token;
  cachedTokenExp = Date.now() + expiresIn;
  return token;
};

export const createZoomMeeting = async ({
  topic,
  startTimeUTC,
  durationMinutes,
}) => {
  const token = await getAccessToken();
  const userId = process.env.ZOOM_USER_ID || "me";

  const resp = await axios.post(
    `${ZOOM_API_BASE}/users/${encodeURIComponent(userId)}/meetings`,
    {
      topic,
      type: 2, // scheduled
      start_time: new Date(startTimeUTC).toISOString(),
      duration: durationMinutes,
      timezone: "UTC",
      settings: {
        waiting_room: true,
        join_before_host: false,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  const meeting = resp.data;
  return {
    meetingId: meeting?.id ? String(meeting.id) : "",
    joinUrlStudent: meeting?.join_url || "",
    // Zoom API does not return a separate "teacher join URL" for API-created meetings reliably.
    // We treat host_start_url as teacher join URL.
    joinUrlTeacher: meeting?.start_url || "",
  };
};


