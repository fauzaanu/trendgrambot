# Trendgrambot

## Overview

Trendgrambot generates hashtags for text on Telegram using Meta-LLM models from Cloudflare. It aims to enhance content discovery and user engagement on the platform.

## Key Features

- 🤖 Hashtag Generation using AI
- 🔗 Telegram Integration
- ☁️ Cloudflare Workers Deployment

## Purpose

Trendgrambot helps users utilize Telegram's new hashtag feature more effectively. It can assist in improving content discovery and potentially reduce spam issues.

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

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgements

Special thanks to Cloudflare for providing the infrastructure and Meta-LLM models that power Trendgrambot.

---

Made with ❤️ by [fauzaanu](https://github.com/fauzaanu)
