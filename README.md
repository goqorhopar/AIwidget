# Neuro Sales Widget

Виджет нейропродавца lidorubov.net: скрипт продаж, OpenAI, Telegram уведомления, интеграция, примеры сценариев.

## Описание

Интерактивный чат-виджет для сайта, который строго следует скрипту из 6 этапов, сохраняет контекст диалога в сессии, интегрируется с OpenAI API (GPT-5) для генерации сообщений, поддерживает голосовое взаимодействие и отправляет уведомления о лидах в Telegram.

## Особенности

- Голосовое взаимодействие (распознавание и синтез речи)
- Интеграция с GPT-5 от OpenAI
- Поддержка выявления потребностей клиента (средний чек, каналы привлечения, сайт, отдел продаж)
- Отправка уведомлений в Telegram двум администраторам
- Гибкий скрипт продаж с 6 этапами
- Сохранение контекста диалога в сессии

## Техническое задание

### 1. Цель
Создать интерактивный чат-виджет с голосовой функцией, который работает по строгому скрипту продаж, выявляет потребности клиента и отправляет уведомления в Telegram.

### 2. Функциональные требования
- Веб-компонент (HTML/CSS/JS) для встраивания на любой сайт
- Кнопка открытия/закрытия в углу экрана
- Сохранение контекста диалога в течение сессии
- Интеграция с OpenAI (GPT-5), температура 0.3
- Системный промпт с четкими этапами продаж и выявлением потребностей
- Логика триггеров лида (согласие на Zoom, контакты, явный интерес, попытка уйти)
- Уведомления в Telegram по формату
- Голосовой ввод/вывод с использованием Web Speech API

### 3. Скрипт нейропродавца (обязательная структура)

**ЭТАП 1: Приветствие**
"Вас приветствует нейропродавец компании lidorubov.net. Мы передаем вам только тех клиентов, которые голосом подтвердили, что хотят у вас купить. Это не реклама, а готовые продажи. У вас есть 2 минуты?"

**ЭТАП 2: Авторитет**
"Мы работаем с крупными компаниями: Открытие Банк, BMW, Skillbox, Сбербанк и другими. Более 7 лет в нише, с кейсами роста продаж на 30-50% за 2-3 месяца. Я понимаю, что вы получаете десятки предложений, поэтому сразу к сути."

**ЭТАП 3: Диагностика (5 вопросов)**
"Скажите:
1. Какой у вас текущий средний чек?
2. Каким образом вы привлекаете клиентов? (реклама, рекомендации, холдколы и т.д.)
3. У вас есть сайт? Если да, поделитесь URL.
4. Вы используете Яндекс Директ или другие рекламные каналы?
5. У вас есть отдел продаж? Если да, занимаются ли они холодными звонками?"

**ЭТАП 4: Презентация**
"Наши алгоритмы находят людей, которые прямо сейчас ищут ваши услуги, фильтруем их по критериям, подтверждают интерес голосом, и передаём вам уже готовых к покупке клиентов. Это экономит бюджет и даёт быстрый рост выручки."

**ЭТАП 5: Закрытие на Zoom или получение контакта**
"Предлагаю за 20 минут в Zoom показать конкретные цифры и кейсы по вашей нише. Когда вам удобнее — завтра в 10:00 или в 14:00? Или оставьте телефон, и мы с вами свяжемся."

**ЭТАП 6: Обработка возражений**
Ключевые фразы для распознавания возражений:
- "Нужно подумать" / "Нужно посоветоваться"
- "У нас нет бюджета" / "Сейчас не время"
- "Нас всё устраивает" / "Мы не заинтересованы"
- "Нам это не нужно"

Ответы:
"Понимаю, что вы сначала хотите всё обдумать. Но решение здесь простое: либо вы видите, как это работает в вашей нише, либо нет. 20 минут в Zoom — и вы сами решите. Когда ставим встречу?"

### 4. Архитектура

#### Frontend (Виджет)
- Чистый JavaScript, CSS (без зависимостей)
- Fetch API для HTTP-запросов
- Web Speech API для голосового взаимодействия
- Local Storage для сохранения session ID
- Адаптивный дизайн (десктоп/мобильные)

#### Backend (Node.js/Express)
```javascript
// Серверная логика
POST /api/chat
{
  "message": "Пользовательский ввод",
  "sessionId": "uuid-сессии"
}

Response:
{
  "response": "Ответ от OpenAI",
  "isLead": true/false,
  "leadStage": "этап скрипта"
}
```

#### База данных
В текущей версии — Map() в памяти (для продакшна использовать Redis/MongoDB)

### 5. Уведомления в Telegram

**Поддержка множественных администраторов:**
Теперь система поддерживает отправку уведомлений сразу нескольким администраторам. В переменной окружения `TELEGRAM_CHAT_ID` можно указать несколько chat_id через запятую:

```
TELEGRAM_CHAT_ID=123456789,987654321
```

Формат сообщения:
```
🎯 НОВЫЙ ЛИД | lidorubov.net
──────────────
⏰ Время: {время}
📊 Этап: {этап скрипта}
📞 Контакты: {если есть}
📋 Выявленные потребности: {информация о потребностях клиента}
💬 Последнее сообщение: "{ключевая фраза пользователя}"
🔗 История: {последние 5 сообщений}
```

### 6. Настройка и запуск

**Переменные окружения (.env):**
```
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5
OPENAI_TEMPERATURE=0.3
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=123456789,987654321
SALES_SCRIPT_VERSION=1.0
COMPANY_NAME=lidorubov.net
PORT=3000
NODE_ENV=production
```

**Установка зависимостей:**
```bash
npm install
```

**Запуск в режиме разработки:**
```bash
npm run dev
```

**Запуск в продакшене:**
```bash
npm start
```

## Развертывание на VPS TimeWeb

### 1. Подготовка VPS

1. Зарегистрируйтесь в TimeWeb Cloud и создайте VPS с Ubuntu 20.04 или новее
2. Подключитесь к серверу по SSH:
   ```bash
   ssh root@your_vps_ip
   ```

### 2. Установка необходимых компонентов

1. Обновите систему:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Установите Node.js и npm:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Установите PM2 для управления процессами:
   ```bash
   sudo npm install -g pm2
   ```

4. Установите Git:
   ```bash
   sudo apt install git -y
   ```

### 3. Разворачивание приложения

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/your-username/neuro-sales-widget.git
   cd neuro-sales-widget
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Настройте переменные окружения:
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Заполните файл .env:
   ```bash
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-5
   OPENAI_TEMPERATURE=0.3
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=123456789,987654321
   SALES_SCRIPT_VERSION=1.0
   COMPANY_NAME=lidorubov.net
   PORT=3000
   NODE_ENV=production
   ```

### 4. Настройка PM2

1. Запустите приложение через PM2:
   ```bash
   pm2 start server/index.js --name "neuro-sales-widget"
   ```

2. Настройте автозапуск:
   ```bash
   pm2 startup
   pm2 save
   ```

### 5. Настройка Nginx (рекомендуется)

1. Установите Nginx:
   ```bash
   sudo apt install nginx -y
   ```

2. Создайте конфигурационный файл:
   ```bash
   sudo nano /etc/nginx/sites-available/neuro-sales-widget
   ```

3. Добавьте следующий конфиг:
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Активируйте сайт:
   ```bash
   sudo ln -s /etc/nginx/sites-available/neuro-sales-widget /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. Настройте SSL (рекомендуется):
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d your_domain.com
   ```

### 6. Настройка брандмауэра

1. Настройте UFW:
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   sudo ufw allow 3000  # если используете напрямую без Nginx
   ```

## Встраивание на сайт

### 1. Простой способ

Добавьте следующий код в тег `<head>` или перед закрывающим тегом `</body>` вашего HTML:

```html
<script>
window.neuroSalesConfig = {
  apiUrl: 'https://your-domain.com/api',  // Замените на ваш домен
  company: 'lidorubov.net',
  scriptVersion: '1.0'
};
</script>
<link rel="stylesheet" href="https://your-domain.com/neuro-sales-widget.css">
<script src="https://your-domain.com/neuro-sales-widget.js"></script>
```

### 2. Для размещения на нескольких сайтах

Если вы планируете использовать виджет на нескольких сайтах, рекомендуется:

1. Разместить файлы виджета на CDN или на своем сервере
2. Использовать разные конфигурации для разных сайтов:
   ```html
   <script>
   window.neuroSalesConfig = {
     apiUrl: 'https://your-domain.com/api',
     company: 'your-company-name',
     scriptVersion: '1.0'
   };
   </script>
   ```

### 3. Настройка CORS

Убедитесь, что в вашем `.env` файле настроен параметр `CORS`, если приложение будет получать запросы с других доменов.

## Запуск локально

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/your-username/neuro-sales-widget.git
   cd neuro-sales-widget
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Создайте файл `.env` на основе `.env.example`
4. Запустите сервер:
   ```bash
   npm run dev
   ```

## Структура проекта
```
neuro-sales-widget/
├─ server/
│  └─ index.js
├─ public/
│  ├─ neuro-sales-widget.js
│  └─ neuro-sales-widget.css
├─ package.json
├─ README.md
└─ .env.example
```

## Тестовые сценарии
- **Сценарий 1:** Пользователь сразу соглашается на Zoom
- **Сценарий 2:** Пользователь задаёт вопросы о потребностях и потом соглашается
- **Сценарий 3:** Пользователь отказывается, но оставляет телефон
- **Сценарий 4:** Пользователь уходит "подумать" (проверка настойчивости)
- **Сценарий 5:** Голосовое взаимодействие с клиентом

## Лицензия
MIT