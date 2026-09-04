// A trailing slash on the CLIENT_URL env var (however it got set) silently
// doubles up wherever a path gets appended after it — /accept-invite,
// /reset-password, and the Embedded Signup OAuth redirect URI all built
// their own copy of "CLIENT_URL || fallback" with no normalization, so a
// single trailing slash broke all three at once. Stripped once, here.
const CLIENT_URL = (process.env.CLIENT_URL || 'https://app.adswadi.com').replace(/\/+$/, '');

module.exports = { CLIENT_URL };
