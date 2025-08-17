// Script to clear webhook for the bot
require('dotenv').config();
const axios = require('axios');

const BOT_TOKEN = process.env.BOT_TOKEN || '8200049903:AAETV6_6XOLA6SP-jaW2Hizsm5hVjv_p5CY';

async function clearWebhook() {
  try {
    console.log('Clearing webhook...');
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`,
      { drop_pending_updates: true }
    );
    
    console.log('Webhook cleared:', response.data);
    
    // Get webhook info to verify
    const info = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    
    console.log('Current webhook info:', info.data);
  } catch (error) {
    console.error('Error clearing webhook:', error.response?.data || error.message);
  }
}

clearWebhook();