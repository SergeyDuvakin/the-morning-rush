"""Отвечает на /start кнопкой «Играть» и включает такую же кнопку у поля ввода."""
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

GAME_URL = "https://sergeyduvakin.github.io/the-morning-rush/?v=5"
EXPECTED_USERNAME = "TheMorningRush_bot"
ROOT = Path(__file__).resolve().parent


def load_token():
    env = ROOT / ".env"
    if not env.exists():
        raise SystemExit("Создайте файл bot/.env со строкой BOT_TOKEN=токен_от_BotFather")
    token = ""
    for line in env.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() == "BOT_TOKEN":
            token = value.strip().strip('"').strip("'")
    if not token or token == "вставьте_токен":
        raise SystemExit("В файле bot/.env нет настоящего BOT_TOKEN")
    return token


TOKEN = load_token()


def api(method, payload=None, timeout=70):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{TOKEN}/{method}",
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        try:
            desc = json.loads(detail).get("description") or "HTTP error"
        except json.JSONDecodeError:
            desc = "HTTP error"
        raise RuntimeError(desc) from None
    if not body.get("ok"):
        raise RuntimeError(str(body.get("description") or "Telegram API error"))
    return body["result"]


def play_markup():
    return {
        "inline_keyboard": [[{
            "text": "🚇 Играть",
            "web_app": {"url": GAME_URL},
        }]]
    }


def setup():
    me = api("getMe")
    username = me.get("username")
    if username != EXPECTED_USERNAME:
        raise SystemExit(
            f"В .env токен другого бота: @{username}. Нужен токен @{EXPECTED_USERNAME}."
        )
    api("setChatMenuButton", {
        "menu_button": {
            "type": "web_app",
            "text": "Start",
            "web_app": {"url": GAME_URL},
        }
    })
    print(f"Бот @{username} слушает сообщения.", flush=True)


def handle(update):
    message = update.get("message") or update.get("edited_message")
    if not message or message.get("chat", {}).get("type") != "private":
        return
    text = message.get("text") or ""
    command = text.split()[0].split("@")[0] if text.startswith("/") else ""
    if command and command not in ("/start", "/play"):
        return
    if not text:
        return
    api("sendMessage", {
        "chat_id": message["chat"]["id"],
        "text": "Опоздал красиво.\nЖми кнопку и пробивайся сквозь метро.",
        "reply_markup": play_markup(),
    })


def main():
    setup()
    offset = 0
    while True:
        try:
            updates = api("getUpdates", {"timeout": 50, "offset": offset}, timeout=70)
        except Exception as exc:
            print("сеть:", exc, flush=True)
            time.sleep(3)
            continue
        for update in updates:
            offset = update["update_id"] + 1
            try:
                handle(update)
            except Exception as exc:
                print("сообщение:", exc, flush=True)


if __name__ == "__main__":
    main()
