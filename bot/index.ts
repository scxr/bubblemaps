import type { Context } from "telegraf";

import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN as string);

const MINI_APP_URL = 'http://localhost:80/';

bot.start((ctx : Context) => {
  ctx.reply('Welcome to BubbleMap Viewer! Send me a token address and blockchain in format: token/chain');
});

bot.help((ctx : Context) => {
  ctx.reply(
    'How to use this bot:\n\n' +
    '1. Send a message with token address and blockchain in format: token/chain\n' +
    '   Example: 0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95/bsc\n\n' +
    '2. Click the "Open Bubblemap" button to view the token visualization'
  );
});

bot.hears(/^(0x[a-fA-F0-9]+)\/(bsc|eth|polygon)$/i, (ctx : Context) => {
  const token = ctx.match[1];
  const chain = ctx.match[2].toLowerCase();
  
  ctx.reply(`Token: ${token}\nChain: ${chain}`, {
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Open Bubblemap',
          web_app: { url: `${MINI_APP_URL}?token=${token}&chain=${chain}` }
        }]
      ]
    }
  });
});

bot.hears(/^(0x[a-fA-F0-9]+)$/i, (ctx : Context) => {
  const token = ctx.match[1];
  
  ctx.reply(`Token: ${token}\nChain: bsc (default)`, {
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Open Bubblemap',
          web_app: { url: `${MINI_APP_URL}?token=${token}&chain=bsc` }
        }]
      ]
    }
  });
});

bot.on('text', (ctx : Context) => {
  ctx.reply(
    'Please send a token address with blockchain in format: token/chain\n' +
    'Example: 0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95/bsc\n\n' +
    'Or just send a token address (BSC will be used by default).'
  );
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));