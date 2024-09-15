async function generateRelevantHashtags(AI, userMessage) {
	const maxRetries = 3;
	let retries = 0;
	
	while (retries < maxRetries) {
		// First prompt: Check if the text is related to currency or financial markets
		const checkResponse = await AI.run("@cf/meta/llama-3-8b-instruct", {
			max_tokens: 2048,
			messages: [
				{
					role: "system",
					content: "You are an AI assistant that analyzes text to determine if it's related to currencies or financial markets. Respond with only 'yes' or 'no'."
				},
				{
					role: "user",
					content: `Is the following text related to currencies or financial markets? Answer only 'yes' or 'no': "${userMessage}"`
				}
			],
		});

		const isFinancialRelated = checkResponse.response.trim().toLowerCase() === 'yes';

		// Second prompt: Generate hashtags based on the first prompt's result
		const tagResponse = await AI.run("@cf/meta/llama-3-8b-instruct", {
			max_tokens: 2048,
			messages: [
				{
					role: "system",
					content: `You are an AI assistant that generates relevant hashtags for given text. Your task is to analyze the content and provide exactly 5 relevant hashtags${isFinancialRelated ? ' or $tags' : ''}.

					Guidelines:
					1. Use #[word] format for general topics.
					${isFinancialRelated ? '2. Use $[symbol] format for cryptocurrencies or financial markets.' : ''}
					${isFinancialRelated ? '3' : '2'}. Ensure relevance to the main topics in the text.
					${isFinancialRelated ? '4' : '3'}. Be specific but not too niche.
					${isFinancialRelated ? '5' : '4'}. Consider trending topics if applicable.
					${isFinancialRelated ? '6' : '5'}. Avoid duplicates or very similar tags.
					${isFinancialRelated ? '7' : '6'}. Do not use spaces within tags.
					${isFinancialRelated ? '8' : '7'}. Use lowercase for all characters in the tags.

					Always return exactly 5 tags, no more, no less.`
				},
				{
					role: "user",
					content: `Generate 5 relevant hashtags${isFinancialRelated ? ' or $tags' : ''} for the following text: "${userMessage}". 
					Return only the tags, separated by spaces, without any additional text or explanation. Ensure all tags are in lowercase.`
				}
			],
		});

		const tags = tagResponse.response.trim().toLowerCase().split(/\s+/);
		const validTags = tags.filter(tag => tag.startsWith('#') || (isFinancialRelated && tag.startsWith('$')));

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

		let hashtags;
		let attempts = 0;
		const maxAttempts = 3;

		while (attempts < maxAttempts) {
			try {
				hashtags = await generateRelevantHashtags(env.AI, userMessage);
				await sendTelegramMessage(chatId, hashtags, env.TELEGRAM_API_KEY);
				return new Response('Hashtags sent to Telegram successfully', {status: 200});
			} catch (error) {
				console.error(`Attempt ${attempts + 1} failed. Error generating hashtags:`, error);
				attempts++;
			}
		}

		console.error('Failed to generate hashtags after maximum attempts');
		return new Response('Error generating hashtags', {status: 500});
	},
};
