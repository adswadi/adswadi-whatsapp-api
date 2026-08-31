const express = require('express');
const router = express.Router();
const WhatsAppAccount = require('../models/WhatsAppAccount');
const { authenticate } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/subscription');
const { encrypt } = require('../utils/encryption');
const { success, error } = require('../utils/responseHelper');
const whatsappService = require('../services/whatsappService');
const crypto = require('crypto');

// Subscribes our app to the customer's WABA (needed to receive their
// incoming messages) and registers the phone number for Cloud API
// messaging. A number that's verified + approved but never registered
// stays stuck in "Pending" in WhatsApp Manager forever — this is what
// actually activates it. Both steps are safe to retry: they no-op with
// an error we swallow if already done.
const activateWhatsAppNumber = async (wabaId, phoneNumberId, accessToken) => {
  const axios = require('axios');
  try {
    await axios.post(`https://graph.facebook.com/v21.0/${wabaId}/subscribed_apps`, null, {
      params: { access_token: accessToken },
    });
  } catch (err) {
    console.error('WABA subscribe error:', err?.response?.data || err.message);
  }
  try {
    await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/register`,
      { messaging_product: 'whatsapp', pin: crypto.randomInt(100000, 999999).toString() },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch (err) {
    console.error('Phone number register error:', err?.response?.data || err.message);
  }
};

// Only one connected number drives sending at a time today — nothing in the
// UI lets a conversation pick between multiple, so leaving old accounts
// marked active left conversations pointing at stale, possibly unapproved
// numbers after a reconnect. Called only after the new account is safely
// created, so a failed create never leaves the user with zero active accounts.
const deactivateOtherAccounts = async (userId, keepAccountId) => {
  await WhatsAppAccount.updateMany(
    { userId, isActive: true, _id: { $ne: keepAccountId } },
    { isActive: false }
  );
};

// GET /api/whatsapp/accounts
router.get('/accounts', authenticate, async (req, res) => {
  try {
    const accounts = await WhatsAppAccount.find({ userId: req.user._id }).select('-accessToken');
    return success(res, { accounts });
  } catch (err) {
    return error(res, 'Failed to fetch accounts', 500);
  }
});

// POST /api/whatsapp/accounts
router.post('/accounts', authenticate, async (req, res) => {
  try {
    const { displayName, phoneNumber, phoneNumberId, wabaId, accessToken, businessName } = req.body;

    if (!displayName || !phoneNumber || !phoneNumberId || !wabaId || !accessToken) {
      return error(res, 'All fields are required', 400);
    }

    await activateWhatsAppNumber(wabaId, phoneNumberId, accessToken);

    const encryptedToken = encrypt(accessToken);

    const account = await WhatsAppAccount.create({
      userId: req.user._id,
      displayName,
      phoneNumber,
      phoneNumberId,
      wabaId,
      accessToken: encryptedToken,
      businessName: businessName || displayName,
    });

    await deactivateOtherAccounts(req.user._id, account._id);

    const accountResponse = account.toObject();
    delete accountResponse.accessToken;

    return success(res, { account: accountResponse }, 'WhatsApp account connected', 201);
  } catch (err) {
    console.error('WA account create error:', err);
    return error(res, 'Failed to connect account', 500);
  }
});

// PUT /api/whatsapp/accounts/:id
router.put('/accounts/:id', authenticate, async (req, res) => {
  try {
    const { displayName, businessName, accessToken } = req.body;
    const updates = {};
    if (displayName) updates.displayName = displayName;
    if (businessName) updates.businessName = businessName;
    if (accessToken) updates.accessToken = encrypt(accessToken);

    const account = await WhatsAppAccount.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    ).select('-accessToken');

    if (!account) return error(res, 'Account not found', 404);
    return success(res, { account });
  } catch (err) {
    return error(res, 'Failed to update account', 500);
  }
});

// DELETE /api/whatsapp/accounts/:id
router.delete('/accounts/:id', authenticate, async (req, res) => {
  try {
    const account = await WhatsAppAccount.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!account) return error(res, 'Account not found', 404);
    return success(res, {}, 'Account removed');
  } catch (err) {
    return error(res, 'Failed to remove account', 500);
  }
});

// GET /api/whatsapp/accounts/:id/templates
router.get('/accounts/:id/templates', authenticate, async (req, res) => {
  try {
    const account = await WhatsAppAccount.findOne({ _id: req.params.id, userId: req.user._id });
    if (!account) return error(res, 'Account not found', 404);

    const templates = await whatsappService.getTemplates(account);
    return success(res, { templates });
  } catch (err) {
    console.error('Templates fetch error:', err);
    return error(res, 'Failed to fetch templates', 500);
  }
});

// POST /api/whatsapp/send
router.post('/send', authenticate, requireActiveSubscription, async (req, res) => {
  try {
    const { accountId, to, type, text, mediaUrl, templateName, templateLanguage, components } = req.body;

    const account = await WhatsAppAccount.findOne({ _id: accountId, userId: req.user._id });
    if (!account) return error(res, 'Account not found', 404);

    let result;
    if (type === 'template') {
      result = await whatsappService.sendTemplateMessage(account, to, templateName, templateLanguage, components);
    } else if (['image', 'video', 'audio', 'document'].includes(type)) {
      result = await whatsappService.sendMediaMessage(account, to, type, mediaUrl);
    } else {
      result = await whatsappService.sendTextMessage(account, to, text);
    }

    return success(res, { result });
  } catch (err) {
    console.error('Send message error:', err?.response?.data || err.message);
    return error(res, err?.response?.data?.error?.message || 'Failed to send message', 500);
  }
});

// POST /api/whatsapp/embedded-signup — Exchange code for token & fetch WABA details
router.post('/embedded-signup', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return error(res, 'Code is required', 400);

    const axios = require('axios');
    const redirectUri = `${process.env.CLIENT_URL || 'https://app.adswadi.com'}/`;

    // Exchange code for a short-lived access token
    const tokenRes = await axios.get(`https://graph.facebook.com/v20.0/oauth/access_token`, {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: redirectUri,
        code,
      }
    });

    let accessToken = tokenRes.data.access_token;

    // Exchange for a long-lived token (~60 days) so customers don't get disconnected quickly
    try {
      const longLivedRes = await axios.get(`https://graph.facebook.com/v20.0/oauth/access_token`, {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: accessToken,
        }
      });
      accessToken = longLivedRes.data.access_token;
    } catch (exchangeErr) {
      console.log('Long-lived token exchange failed, using short-lived token:', exchangeErr?.response?.data?.error?.message);
    }

    // Try to fetch WABA + phone numbers automatically
    let wabas = [];
    try {
      const wabaRes = await axios.get(`https://graph.facebook.com/v18.0/me/whatsapp_business_accounts`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,phone_numbers{id,display_phone_number,verified_name,code_verification_status}',
        }
      });
      wabas = wabaRes.data.data || [];
    } catch (wabaErr) {
      console.log('Could not auto-fetch WABA (normal for some apps):', wabaErr?.response?.data?.error?.message);
    }

    return success(res, { accessToken, wabas });
  } catch (err) {
    console.error('Embedded signup error:', err?.response?.data || err.message);
    return error(res, err?.response?.data?.error?.message || 'Embedded signup failed', 500);
  }
});

// POST /api/whatsapp/embedded-signup/connect — Save connected account
router.post('/embedded-signup/connect', authenticate, async (req, res) => {
  try {
    const { accessToken, phoneNumberId, wabaId, displayName, phoneNumber } = req.body;
    if (!accessToken || !phoneNumberId || !wabaId) return error(res, 'Missing required fields', 400);

    await activateWhatsAppNumber(wabaId, phoneNumberId, accessToken);

    const encryptedToken = encrypt(accessToken);

    const account = await WhatsAppAccount.create({
      userId: req.user._id,
      displayName: displayName || 'My WhatsApp',
      phoneNumber: phoneNumber || '',
      phoneNumberId,
      wabaId,
      accessToken: encryptedToken,
      businessName: displayName || 'My Business',
    });

    await deactivateOtherAccounts(req.user._id, account._id);

    const accountResponse = account.toObject();
    delete accountResponse.accessToken;

    return success(res, { account: accountResponse }, 'WhatsApp account connected via Embedded Signup', 201);
  } catch (err) {
    console.error('Embedded signup connect error:', err);
    return error(res, 'Failed to connect account', 500);
  }
});

module.exports = router;
