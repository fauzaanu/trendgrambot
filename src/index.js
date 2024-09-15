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
					content: `You are an AI assistant that generates relevant hashtags for given text. Your task is to analyze the content and provide exactly 10 relevant hashtags${isFinancialRelated ? ' or $tags' : ''}. The goal is to help users discover more content related to the given text while maintaining a balance between specificity and popularity.

					Guidelines:
					1. Use #[word] format for general topics.
					${isFinancialRelated ? '2. Use $[symbol] format for cryptocurrencies or financial markets.' : ''}
					${isFinancialRelated ? '3' : '2'}. Prefer single-word hashtags, but use compound words or multi-word tags when necessary for clarity or specificity.
					${isFinancialRelated ? '4' : '3'}. Ensure relevance to the main topics in the text.
					${isFinancialRelated ? '5' : '4'}. Strike a balance between specific and general tags to maximize discoverability.
					${isFinancialRelated ? '6' : '5'}. Consider trending topics if applicable.
					${isFinancialRelated ? '7' : '6'}. Avoid duplicates or very similar tags.
					${isFinancialRelated ? '8' : '7'}. Do not use spaces within tags.
					${isFinancialRelated ? '9' : '8'}. Use lowercase for all characters in the tags.

					Always return exactly 10 tags, no more, no less.`
				},
				{
					role: "user",
					content: `Generate 10 relevant hashtags${isFinancialRelated ? ' or $tags' : ''} for the following text: "${userMessage}". 
					Return only the tags, separated by spaces, without any additional text or explanation. Ensure all tags are in lowercase.`
				}
			],
		});

		const tags = tagResponse.response.trim().toLowerCase().split(/\s+/);
		const validTags = tags.filter(tag => tag.startsWith('#') || (isFinancialRelated && tag.startsWith('$')));

		if (validTags.length === 10) {
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
		let userMessage = telegramUpdate.message.text;

		// Check if the message contains a caption (for images or files)
		if (!userMessage && telegramUpdate.message.caption) {
			userMessage = telegramUpdate.message.caption;
		}

		// If there's still no text content, we can't generate hashtags
		if (!userMessage) {
			await sendTelegramMessage(chatId, "Please send a message with text content to generate hashtags.", env.TELEGRAM_API_KEY);
			return new Response('No text content to process', {status: 200});
		}

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
