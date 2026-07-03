// Anonymous per-device identity, used in place of real accounts while auth is
// disconnected (see project memory / lib/supabase for the real-auth path this
// replaces). Middleware assigns this cookie on first visit; every server read
// after that just trusts it's there.
export const DEVICE_ID_COOKIE = "cm_uid";
