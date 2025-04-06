import { Telegraf } from 'telegraf';
import { setupListeners } from './handlers/listeners';

const bot = new Telegraf(process.env.BOT_TOKEN as string);

setupListeners(bot);

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));