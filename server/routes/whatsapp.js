const express = require('express');
const router = express.Router();
const WhatsAppAccount = require('../models/WhatsAppAccount');
const { authenticate } = require('../middleware/auth');
const { encrypt } = require('../utils/encryption');
const { success, error } = require('../utils/responseHelper');
const whatsappService = require('../services/whatsappService');

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
router.post('/send', authenticate, async (req, res) => {
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

    // Exchange code for access token
    const tokenRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      params: {
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: 'https://adswadi.in/',
        code,
      }
    });

    const accessToken = tokenRes.data.access_token;

    // Return token only — user will enter WABA ID and phone number manually
    return success(res, { accessToken, businesses: [] });
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

    const accountResponse = account.toObject();
    delete accountResponse.accessToken;

    return success(res, { account: accountResponse }, 'WhatsApp account connected via Embedded Signup', 201);
  } catch (err) {
    console.error('Embedded signup connect error:', err);
    return error(res, 'Failed to connect account', 500);
  }
});

module.exports = router;
