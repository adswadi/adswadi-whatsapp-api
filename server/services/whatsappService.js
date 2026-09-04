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

// Submits a template to Meta for review. Approval is asynchronous (minutes
// to a day) — the caller gets back whatever status Meta assigns immediately
// (usually PENDING), not a guarantee it's usable yet.
const createTemplate = async (waAccount, { name, category, language, components }) => {
  const token = decrypt(waAccount.accessToken);
  const client = getClient(token);
  const response = await client.post(`/${waAccount.wabaId}/message_templates`, {
    name,
    category,
    language,
    components,
  });
  return response.data;
};

const deleteTemplate = async (waAccount, name) => {
  const token = decrypt(waAccount.accessToken);
  const client = getClient(token);
  const response = await client.delete(`/${waAccount.wabaId}/message_templates`, { params: { name } });
  return response.data;
};

const BUSINESS_PROFILE_FIELDS = 'about,address,description,email,profile_picture_url,websites,vertical';

const getBusinessProfile = async (waAccount) => {
  const token = decrypt(waAccount.accessToken);
  const client = getClient(token);
  const response = await client.get(`/${waAccount.phoneNumberId}/whatsapp_business_profile`, {
    params: { fields: BUSINESS_PROFILE_FIELDS },
  });
  return response.data.data?.[0] || {};
};

const updateBusinessProfile = async (waAccount, fields) => {
  const token = decrypt(waAccount.accessToken);
  const client = getClient(token);
  const response = await client.post(`/${waAccount.phoneNumberId}/whatsapp_business_profile`, {
    messaging_product: 'whatsapp',
    ...fields,
  });
  return response.data;
};

// Meta requires the photo bytes to be re-hosted on ITS servers first (the
// "resumable upload" API) before whatsapp_business_profile will accept
// them — a plain image URL isn't enough. Three calls: open a session sized
// for this exact file, PUT the bytes into it to get a handle, then point
// the business profile at that handle.
const setProfilePhoto = async (waAccount, buffer, mimeType) => {
  const token = decrypt(waAccount.accessToken);

  const sessionRes = await axios.post(
    `${META_BASE_URL}/${META_API_VERSION}/${process.env.META_APP_ID}/uploads`,
    null,
    { params: { file_length: buffer.length, file_type: mimeType, access_token: token } }
  );
  const sessionId = sessionRes.data.id; // already formatted "upload:xxxx"

  const uploadRes = await axios.post(
    `${META_BASE_URL}/${META_API_VERSION}/${sessionId}`,
    buffer,
    { headers: { Authorization: `OAuth ${token}`, file_offset: '0', 'Content-Type': 'application/octet-stream' } }
  );
  const handle = uploadRes.data.h;

  return updateBusinessProfile(waAccount, { profile_picture_handle: handle });
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
  createTemplate,
  deleteTemplate,
  getBusinessProfile,
  updateBusinessProfile,
  setProfilePhoto,
  getPhoneNumbers,
  uploadMedia,
  getMediaUrl,
  downloadMedia,
};
