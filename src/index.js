async function checkUserInChannel(chatId, userId, channelUsername, telegramApiKey) {
	const getChatMemberUrl = `https://api.telegram.org/bot${telegramApiKey}/getChatMember`;
	const response = await fetch(`${getChatMemberUrl}?chat_id=@${channelUsername}&user_id=${userId}`);
	const data = await response.json();
	console.log(data);
	return data.ok && ['member', 'administrator', 'creator'].includes(data.result.status);
}

async function generateSimplifiedTweet(AI, userMessage) {
	const response = await AI.run("@cf/meta/llama-3-8b-instruct", {
		max_tokens: 2048,
		messages: [
			{
				role: "system", content: `You are a Twitter user who just saw an interesting tweet. You want to share the idea,
				but you don't want to copy it directly. Your task is to rewrite the tweet in your own words, following these
				guidelines: 1. Approach the rewrite step-by-step, thinking carefully about each part.
				2. Be creative and put your own spin on the idea.
				3. Use simple, everyday language - you're in a hurry before a meeting.
				4. Make a few typos or minor grammatical errors to seem more human.
				 5. Keep it concise, like a real tweet.
				 6. Add a touch of your own personality or reaction to the idea.
				 Remember, you're quickly typing this out on your phone before rushing into a meeting,
				 so it shouldn't be too polished.
				 After I give you the original tweet, rewrite it according to these instructions.`
			},
			{
				role: "user",
				content: `The original tweet: <original_tweet>${userMessage}</original_tweet>.

Write your version of the tweet inside <simplified_tweet> xml tags.
Make sure to close the tag with </simplified_tweet> .
Your response should only contain the tweet, nothing else.`
			}
		],
	});

	let simplifiedTweet = response.response;
	return simplifiedTweet.replace(/<simplified_tweet>/, '').replace(/<\/simplified_tweet>/, '');
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
		const userId = telegramUpdate.message.from.id;
		const userMessage = telegramUpdate.message.text;

		const channelUsername = 'zyloxcommunity';
		const isUserInChannel = await checkUserInChannel(chatId, userId, channelUsername, env.TELEGRAM_API_KEY);

		if (!isUserInChannel) {
			await sendTelegramMessage(chatId, `Please join our channel @${channelUsername} to use this bot.`, env.TELEGRAM_API_KEY);
			return new Response('User not in channel', {status: 200});
		}


		for (let i = 0; i < 4; i++) {
			const tweet = await generateSimplifiedTweet(env.AI, userMessage);
			await sendTelegramMessage(chatId, tweet, env.TELEGRAM_API_KEY);
		}

		return new Response('Messages sent to Telegram successfully', {status: 200});
	},
};
