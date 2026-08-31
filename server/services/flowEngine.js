const Flow = require('../models/Flow');
const Conversation = require('../models/Conversation');
const Contact = require('../models/Contact');
const whatsappService = require('./whatsappService');
const WhatsAppAccount = require('../models/WhatsAppAccount');

const matchTrigger = (flow, message, conversation, isNewConversation) => {
  const trigger = flow.trigger;

  if (trigger.type === 'first_message') {
    // Conversation has no messageCount field — this trigger never fired for
    // anyone until this was wired up to whether the conversation was just
    // created for this exact incoming message.
    return !!isNewConversation;
  }

  if (trigger.type === 'keyword') {
    const text = (message.content?.text || '').toLowerCase().trim();
    return trigger.keywords.some((kw) => {
      const keyword = kw.toLowerCase().trim();
      return trigger.exactMatch ? text === keyword : text.includes(keyword);
    });
  }

  if (trigger.type === 'opt_in') {
    return false; // handled separately
  }

  return false;
};

const executeStep = async (step, conversation, contact, waAccount) => {
  try {
    switch (step.type) {
      case 'send_message': {
        const text = interpolateVariables(step.config.text || '', contact);
        await whatsappService.sendTextMessage(waAccount, conversation.phoneNumber, text);
        break;
      }

      case 'send_template': {
        await whatsappService.sendTemplateMessage(
          waAccount,
          conversation.phoneNumber,
          step.config.templateName,
          step.config.language || 'en',
          step.config.components || []
        );
        break;
      }

      case 'add_tag': {
        const tag = step.config.tag;
        if (tag) {
          await Contact.findByIdAndUpdate(contact._id, { $addToSet: { tags: tag } });
        }
        break;
      }

      case 'remove_tag': {
        const tag = step.config.tag;
        if (tag) {
          await Contact.findByIdAndUpdate(contact._id, { $pull: { tags: tag } });
        }
        break;
      }

      case 'assign_agent': {
        const agentId = step.config.agentId;
        if (agentId) {
          await Conversation.findByIdAndUpdate(conversation._id, { assignedTo: agentId });
        }
        break;
      }

      case 'wait': {
        // In production: schedule next step after delay
        // Here we just continue immediately for simplicity
        await new Promise((resolve) => setTimeout(resolve, (step.config.delay || 0) * 1000));
        break;
      }

      case 'end': {
        await Conversation.findByIdAndUpdate(conversation._id, {
          flowActive: false,
          activeFlowId: null,
          activeFlowStep: 0,
        });
        await Flow.findByIdAndUpdate(conversation.activeFlowId, {
          $inc: { 'stats.completed': 1 },
        });
        return null; // signal end
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Flow step error [${step.type}]:`, err.message);
  }

  return step.nextStepId;
};

const interpolateVariables = (text, contact) => {
  return text
    .replace(/{{name}}/gi, contact.name || '')
    .replace(/{{phone}}/gi, contact.phone || '')
    .replace(/{{email}}/gi, contact.email || '');
};

const processIncomingMessage = async (userId, message, conversation, isNewConversation = false) => {
  try {
    // Check if conversation has an active flow
    if (conversation.flowActive && conversation.activeFlowId) {
      return; // already in flow, handle step progression
    }

    // Find matching flows
    const flows = await Flow.find({ userId, isActive: true });
    const contact = await Contact.findById(conversation.contactId);
    // Resolve to whichever account is active *now*, not whatever the
    // conversation was originally linked to — otherwise automated replies
    // keep going out through a stale account after the user reconnects.
    let waAccount = await WhatsAppAccount.findOne({ userId, isActive: true }).sort({ updatedAt: -1 });
    if (!waAccount) waAccount = await WhatsAppAccount.findById(conversation.waAccountId);
    else if (String(waAccount._id) !== String(conversation.waAccountId)) {
      await Conversation.findByIdAndUpdate(conversation._id, { waAccountId: waAccount._id });
    }

    if (!contact || !waAccount) return;

    for (const flow of flows) {
      if (matchTrigger(flow, message, conversation, isNewConversation)) {
        // Start flow
        await Conversation.findByIdAndUpdate(conversation._id, {
          flowActive: true,
          activeFlowId: flow._id,
          activeFlowStep: 0,
        });
        await Flow.findByIdAndUpdate(flow._id, { $inc: { 'stats.triggered': 1 } });

        // Execute first step
        const firstStep = flow.steps.find((s) => s.order === 0);
        if (firstStep) {
          await executeStep(firstStep, conversation, contact, waAccount);
        }
        break;
      }
    }
  } catch (err) {
    console.error('Flow engine error:', err.message);
  }
};

module.exports = { processIncomingMessage, matchTrigger, executeStep };
