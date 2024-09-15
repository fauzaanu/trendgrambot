async function generateRelevantHashtags(AI, userMessage) {
	const response = await AI.run("@cf/meta/llama-3-8b-instruct", {
		max_tokens: 2048,
		messages: [
			{
				role: "system",
				content: "You are an AI assistant that generates relevant hashtags for given text. Your task is to analyze the content and provide the 5 most relevant hashtags."
			},
			{
				role: "user",
				content: `Generate 5 relevant hashtags for the following text: "${userMessage}". 
				Return only the hashtags, separated by spaces, without any additional text or explanation.`
			}
		],
	});

	return response.response.trim();
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

		const hashtags = await generateRelevantHashtags(env.AI, userMessage);
		const response = `Here are the 5 most relevant hashtags for your message:\n${hashtags}`;

		await sendTelegramMessage(chatId, response, env.TELEGRAM_API_KEY);

		return new Response('Hashtags sent to Telegram successfully', {status: 200});
	},
};
