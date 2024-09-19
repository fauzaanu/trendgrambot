# Trendgrambot

Trendgrambot generates hashtags for text on Telegram using Meta llama3 models from Cloudflare. To use it you would forward any post with text to the bot and it will generate 10 hashtags for you. You can then click them one by one to discover more content and Telegram Stories on the topics.

> It works for both captions and actual text in the post.

## 🚀 Quick Deploy

Get Trendgrambot up and running in no time with Cloudflare Workers:

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fauzaanu/trendgrambot)

## 🛠️ Setup

### Important: API Key Configuration

Before deploying, make sure to set up your Telegram bot:

1. Create a new bot on Telegram using BotFather
2. Obtain the API key for your bot
3. Add the API key as an environment variable in your Cloudflare Workers dashboard:
```
TELEGRAM_API_KEY=your_api_key_here
```

## 🤝 Contributing

We welcome contributions to Trendgrambot! If you have suggestions or improvements, feel free to open an issue or submit a pull request.
