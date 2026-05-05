# AI Widget

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--5-412991.svg)](https://openai.com)
[![Telegram](https://img.shields.io/badge/Telegram-Notifications-blue.svg)](https://core.telegram.org/bots)

Интерактивный чат-виджет с AI-агентом для сайта. Скрипт продаж, голосовое взаимодействие, Telegram-уведомления о лидах.

> Вариант виджета нейропродавца. Полная версия: [neuro-sales-widget](https://github.com/goqorhopar/neuro-sales-widget)

## Быстрый старт

```bash
npm install
npm run dev
```

## Структура

```
├── server/
│   └── index.js
├── public/
│   ├── neuro-sales-widget.js
│   └── neuro-sales-widget.css
├── package.json
└── .env.example
```

## Переменные окружения

| Переменная | Описание |
|---|---|
| `OPENAI_API_KEY` | API ключ OpenAI |
| `OPENAI_MODEL` | Модель (gpt-5, gpt-4o) |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота |
| `TELEGRAM_CHAT_ID` | ID чата(ов) для уведомлений |
| `COMPANY_NAME` | Название компании |
| `PORT` | Порт сервера |

## Лицензия

MIT
