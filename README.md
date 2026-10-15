# The Morning Rush

Пиксельный beat'em-up в Telegram: опаздываешь на работу и пробиваешься через смешное метро. На экране игра называется «Давка до работы».

Сделано на HTML5 Canvas и JS, без сборки и без зависимостей. Картинки рисуются кодом, отдельных файлов в `assets/` нет.

## Что внутри
- `index.html`, `src/`, `telegram-web-app.js` — игра и локальный SDK Telegram
- `bot/` — ответ на «Старт» кнопкой «Играть». Токен лежит в `bot/.env` и в git не попадает
- `brand/` — обложка 640×360 и квадратная аватарка для BotFather
- `docs/` — диздок и заметки сборки

## Локальный запуск
```bash
py -3 -m http.server 8080
```
Открыть http://localhost:8080 . Через `file://` не проверять.

Сайт: https://sergeyduvakin.github.io/the-morning-rush/
