// WhatsApp needs the full international number with no punctuation
// (e.g. 919304595002). Numbers arriving from Meta's webhooks are already in
// that shape, which is why replying from the inbox always worked — but
// contacts typed in or imported from a CSV are whatever the customer had in
// their spreadsheet ("+91 93045 95002", "09304595002", "9304595002"). Meta
// accepts a send to a malformed number (it even returns a message id, so it
// looks sent) and then silently never delivers it.
const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || '91';

const normalizePhone = (raw) => {
  if (!raw) return '';

  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';

  // Local formats often carry a trunk prefix (09304595002).
  digits = digits.replace(/^0+/, '');

  // A bare 10-digit number starting 6-9 is an Indian mobile missing its
  // country code. Anything else is left alone — a number that already
  // carries a country code must not get a second one bolted on.
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    digits = DEFAULT_COUNTRY_CODE + digits;
  }

  return digits;
};

module.exports = { normalizePhone };
