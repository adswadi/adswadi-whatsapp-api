const axios = require('axios');
const { decrypt } = require('../utils/encryption');

const META_BASE_URL = process.env.META_BASE_URL || 'https://graph.facebook.com';
const META_API_VERSION = process.env.META_API_VERSION || 'v18.0';

const getClient = (accessToken) => {
  return axios.create({
    baseURL: `${META_BASE_URL}/${META_API_VERSION}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
};

const sendTextMessage = async (waAccount, to, text) => {
  const token = decrypt(waAccount.accessToken);
  const client = getClient(token);

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body: text },
  };

  const response = await client.post(`/${waAccount.phoneNumberId}/messages`, payload);
  return response.data;
};

const sendTemplateMessage = async (waAccount, to, templateName, languageCode, components = []) => {
  const token = decrypt(waAccount.accessToken);
  const client = getClient(token);

  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  };

  const response = await client.post(`/${waAccount.phoneNumberId}/messages`, payload);
  return response.data;
};

const sendMediaMessage = async (waAccount, to, type, mediaUrl, caption = '') => {
  const token = decrypt(waAccount.accessToken);
  const client = getClient(token);

  const mediaObj = { link: mediaUrl };
  if (caption) mediaObj.caption = caption;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type,
    [type]: mediaObj,
  };

  const response = await client.post(`/${waAccount.phoneNumberId}/messages`, payload);
  return response.data;
};

const sendInteractiveMessage = async (waAccount, to, interactive) => {
  const token = decrypt(waAccount.accessToken);
  const client = getClient(token);

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive,
  };

  const response = await client.post(`/${waAccount.phoneNumberId}/messages`, payload);
  return response.data;
};

const markMessageRead = async (waAccount, messageId) => {
  const token = decrypt(waAccount.accessToken);
  const client = getClient(token);

  const payload = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  };

  const response = await client.post(`/${waAccount.phoneNumberId}/messages`, payload);
  return response.data;
};

const getTemplates = async (waAccount) => {
  const token = decrypt(waAccount.accessToken);
  const client = getClient(token);
  const response = await client.get(`/${waAccount.wabaId}/message_templates?limit=100`);
  return response.data.data || [];
};

const getPhoneNumbers = async (wabaId, accessToken) => {
  const client = getClient(accessToken);
  const response = await client.get(`/${wabaId}/phone_numbers`);
  return response.data.data || [];
};

const uploadMedia = async (waAccount, buffer, mimeType, fileName) => {
  const token = decrypt(waAccount.accessToken);
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', buffer, { filename: fileName, contentType: mimeType });
  form.append('messaging_product', 'whatsapp');
  form.append('type', mimeType);

  const response = await axios.post(
    `${META_BASE_URL}/${META_API_VERSION}/${waAccount.phoneNumberId}/media`,
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders(),
      },
    }
  );
  return response.data;
};

const getMediaUrl = async (mediaId, accessToken) => {
  const client = getClient(accessToken);
  const response = await client.get(`/${mediaId}`);
  return response.data.url;
};

// Meta's media URL is short-lived and requires the same access token to
// fetch, so the browser can't load it directly — download the bytes here
// and hand back a buffer the caller can re-host (e.g. on Cloudinary).
const downloadMedia = async (mediaId, accessToken) => {
  const mediaUrl = await getMediaUrl(mediaId, accessToken);
  const response = await axios.get(mediaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    responseType: 'arraybuffer',
  });
  return { buffer: Buffer.from(response.data), mimeType: response.headers['content-type'] };
};

module.exports = {
  sendTextMessage,
  sendTemplateMessage,
  sendMediaMessage,
  sendInteractiveMessage,
  markMessageRead,
  getTemplates,
  getPhoneNumbers,
  uploadMedia,
  getMediaUrl,
  downloadMedia,
};
