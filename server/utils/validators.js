// Shared so every place a password gets set — register, invite acceptance,
// forgot-password reset, change-password — enforces the same rule instead
// of each route drifting to its own minimum.
const validatePassword = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
  return null;
};

module.exports = { validatePassword };
