import { Context } from "telegraf";
import { Telegraf } from 'telegraf';
import { getMessageText } from './getMessageText';
const MINI_APP_URL = 'https://bubblemaps.vercel.app/home.html';

async function determineChain(token: string) {
	const chain = token.split('/')[1];
	if (chain) {
		return chain;
	}
	return 'bsc';
}

async function tokenNameToAddress(token: string) {
	let url = `https://api.dexscreener.com/latest/dex/search?q=${token}`
	let response = await fetch(url)
	let data = await response.json()
	if (!data.pairs.length || !data.pairs.length) {
		return null
	}
	let highestVolumePair = data.pairs.reduce((a: any, b: any) => a.volume.h24 > b.volume.h24 ? a : b)
	let tokenInfo = data.pairs.find((pair: any) => pair.address === highestVolumePair.address)
	console.log(tokenInfo)
	return tokenInfo
}

export const setupListeners = (bot: Telegraf) => {
	bot.start((ctx: Context) => {
		ctx.reply('Welcome to BubbleMap Viewer! Send me a token address and blockchain in format: token/chain');
	});

	bot.help((ctx: Context) => {
		ctx.reply(
			'How to use this bot:\n\n' +
			'1. Send a message with token address and blockchain in format: token/chain\n' +
			'   Example: 0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95/bsc\n\n' +
			'2. Click the "Open Bubblemap" button to view the token visualization'
		);
	});

	bot.hears(/^(0x[a-fA-F0-9]+)\/(bsc|eth|polygon|sol)$/i, async (ctx: Context & { match: RegExpExecArray }) => {
		try {
			const token = ctx.match[1];
			const chain = ctx.match[2].toLowerCase();

			console.log(`${MINI_APP_URL}?token=${token}&chain=${chain}`);
			const messageText = await getMessageText(token, chain);
			ctx.reply(messageText, {
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [
						[{
							text: 'Open Bubblemap',
							web_app: { url: `${MINI_APP_URL}?token=${token}&chain=${chain}` }
						}]
					]
				},
				link_preview_options: {
					is_disabled: true
				}
			});
		} catch (error) {
			console.error(error);
			ctx.reply('Something went wrong. Please try again later.');
		}
	});

	bot.hears(/^(0x[a-fA-F0-9]+)$/i, async (ctx: Context & { match: RegExpExecArray }) => {
		try {
			const token = ctx.match[1];

			console.log(`${MINI_APP_URL}?token=${token}&chain=bsc`);
			const messageText = await getMessageText(token, 'bsc');
			ctx.reply(messageText, {
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [
						[{
							text: 'Open Bubblemap',
							web_app: { url: `${MINI_APP_URL}?token=${token}&chain=bsc` }
						}]
					]
				},
				link_preview_options: {
					is_disabled: true
				}
			});
		} catch (error) {
			console.error(error);
			ctx.reply('Something went wrong. Please try again later.');
		}
	});

	bot.hears(/^([1-9A-HJ-NP-Za-km-z]{32,44})\/(sol)$/i, async (ctx: Context & { match: RegExpExecArray }) => {
		try {
			const token = ctx.match[1];
			const chain = ctx.match[2].toLowerCase();

			console.log(`${MINI_APP_URL}?token=${token}&chain=${chain}`);
			const messageText = await getMessageText(token, chain);
			ctx.reply(messageText, {
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [
						[{
							text: 'Open Bubblemap',
							web_app: { url: `${MINI_APP_URL}?token=${token}&chain=${chain}` }
						}]
					]
				},
				link_preview_options: {
					is_disabled: true
				}
			});
		} catch (error) {
			console.error(error);
			ctx.reply('Something went wrong. Please try again later.');
		}
	});

	bot.hears(/^([1-9A-HJ-NP-Za-km-z]{32,44})$/i, async (ctx: Context & { match: RegExpExecArray }) => {
		try {
			const token = ctx.match[1];

			console.log(`${MINI_APP_URL}?token=${token}&chain=sol`);
			const messageText = await getMessageText(token, 'sol');
			ctx.reply(messageText, {
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [
						[{
							text: 'Open Bubblemap',
							web_app: { url: `${MINI_APP_URL}?token=${token}&chain=sol` }
						}]
					]
				},
				link_preview_options: {
					is_disabled: true
				}
			});
		} catch (error) {
			console.error(error);
			ctx.reply('Something went wrong. Please try again later.');
		}

	});

	bot.on('text', async (ctx: Context) => {
		let text = (ctx.message as any).text
		if (!text) {
			ctx.reply(
				'Please send a token address with blockchain in format: token/chain\n' +
				'Example: 0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95/bsc\n\n' +
				'Or just send a token address (BSC will be used by default).'
			);
			return
		}
		if (text?.startsWith("$")) {
			text = text.slice(1)
			let tokenInfo = await tokenNameToAddress(text)
			let chainId = ""
			if (tokenInfo.chainId === "solana") {
				chainId = "sol"
			} else {
				chainId = tokenInfo.chainId
			}
			const messageText = await getMessageText(tokenInfo.baseToken.address, chainId);
			ctx.reply(messageText, {
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [
						[{
							text: 'Open Bubblemap',
							web_app: { url: `${MINI_APP_URL}?token=${tokenInfo.baseToken.address}&chain=${chainId}` }
						}]
					]
				},
				link_preview_options: {
					is_disabled: true
				}
			})
			return
		}
		ctx.reply(
			'Please send a token address with blockchain in format: token/chain\n' +
			'Example: 0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95/bsc\n\n' +
			'Or just send a token address (BSC will be used by default).'
		);
		
	});
}; 