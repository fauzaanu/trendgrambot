async function generateRelevantHashtags(AI, userMessage) {
	const maxRetries = 3;
	let retries = 0;
	
	while (retries < maxRetries) {
		const response = await AI.run("@cf/meta/llama-3-8b-instruct", {
			max_tokens: 2048,
			messages: [
				{
					role: "system",
					content: `You are an AI assistant that generates relevant hashtags for given text. Your task is to analyze the content and provide exactly 5 relevant hashtags or $tags.

					Guidelines:
					1. Use #[word] format for general topics.
					2. Use $[symbol] format for cryptocurrencies or financial markets.
					3. Ensure relevance to the main topics in the text.
					4. Be specific but not too niche.
					5. Consider trending topics if applicable.
					6. Avoid duplicates or very similar tags.
					7. Do not use spaces within tags.
					8. Use lowercase for all characters in the tags.

					Always return exactly 5 tags, no more, no less.`
				},
				{
					role: "user",
					content: `Generate 5 relevant hashtags or $tags for the following text: "${userMessage}". 
					Return only the tags, separated by spaces, without any additional text or explanation. Ensure all tags are in lowercase.`
				}
			],
		});

		const tags = response.response.trim().toLowerCase().split(/\s+/);
		const validTags = tags.filter(tag => tag.startsWith('#') || tag.startsWith('$'));

		if (validTags.length === 5) {
			return validTags.join(' ');
		}

		retries++;
	}

	throw new Error("Failed to generate valid hashtags after multiple attempts");
}

async function sendTelegramMessage(chatId, text, telegramApiKey) {
	const telegramApiUrl = `https://api.telegram.org/bot${telegramApiKey}/sendMessage`;
	const response = await fetch(telegramApiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			chat_id: chatId,
			text: text,
		}),
	});
	return response.ok;
}

export default {
	async fetch(request, env, ctx) {
		let telegramUpdate;

		try {
			telegramUpdate = await request.json();
		} catch (error) {
			return new Response(null, {
				status: 302,
				headers: {
					'Location': 'https://fauzaanu.com',
				},
			});
		}

		const chatId = telegramUpdate.message.chat.id;
		const userMessage = telegramUpdate.message.text;

		try {
			const hashtags = await generateRelevantHashtags(env.AI, userMessage);
			await sendTelegramMessage(chatId, hashtags, env.TELEGRAM_API_KEY);
			return new Response('Hashtags sent to Telegram successfully', {status: 200});
		} catch (error) {
			console.error('Error generating hashtags:', error);
			await sendTelegramMessage(chatId, "Sorry, I couldn't generate hashtags for your message. Please try again.", env.TELEGRAM_API_KEY);
			return new Response('Error generating hashtags', {status: 500});
		}
	},
};
