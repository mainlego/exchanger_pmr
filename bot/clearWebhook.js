// Script to clear webhook and check for conflicts
require('dotenv').config();
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN || '8200049903:AAETV6_6XOLA6SP-jaW2Hizsm5hVjv_p5CY');

async function clearWebhook() {
  try {
    console.log('Clearing webhook and checking for conflicts...');
    
    // Delete webhook
    await bot.telegram.deleteWebhook({ drop_pending_updates: true });
    console.log('✅ Webhook cleared');
    
    // Get bot info to verify connection
    const botInfo = await bot.telegram.getMe();
    console.log(`✅ Bot connected: @${botInfo.username}`);
    
    // Get webhook info to verify it's cleared
    const webhookInfo = await bot.telegram.getWebhookInfo();
    if (webhookInfo.url) {
      console.log('⚠️  Webhook still set:', webhookInfo.url);
    } else {
      console.log('✅ No webhook is set');
    }
    
    // Check for polling conflicts
    console.log('\nChecking for polling conflicts...');
    try {
      await bot.telegram.getUpdates({ limit: 1, timeout: 1 });
      console.log('✅ No polling conflicts detected');
    } catch (error) {
      if (error.response?.error_code === 409) {
        console.log('⚠️  Another instance is polling. Please stop it manually.');
        console.log('   You may need to:');
        console.log('   1. Check if bot.js is running elsewhere');
        console.log('   2. Wait a few minutes for the conflict to clear');
        console.log('   3. Restart your deployment platform');
      }
    }
    
    console.log('\n✅ Cleanup complete. You can now start the bot.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearWebhook();