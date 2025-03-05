import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.dispatcher.filters import CommandStart
from config import BOT_TOKEN, WEBAPP_URL
from database.db import SessionLocal, get_user, create_user
from urllib.parse import quote

# Инициализация бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(bot)

# Регистрация обработчика команды /start
@dp.message_handler(CommandStart())
async def start_command(message: types.Message):
    telegram_id = message.from_user.id
    username = message.from_user.username or message.from_user.full_name

    session = SessionLocal()
    user = get_user(session, telegram_id)
    if not user:
        user = create_user(session, telegram_id, username)
    session.close()

    # Формируем URL с параметрами и экранируем его
    webapp_url_with_params = f"{WEBAPP_URL}?username={quote(username)}&balance={user.balance}&telegram_id={telegram_id}"

    # Создаем обычную клавиатуру с кнопкой WebApp
    reply_keyboard = types.ReplyKeyboardMarkup(
        keyboard=[
            [types.KeyboardButton(text="Открыть игру", web_app=WebAppInfo(url=webapp_url_with_params))]
        ],
        resize_keyboard=True
    )

    # Создаем Inline-клавиатуру с кнопкой WebApp
    inline_keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Играть прямо сейчас", web_app=WebAppInfo(url=webapp_url_with_params))]
        ]
    )

    # Отправляем сообщение с Reply-клавиатурой и Inline-кнопкой
    await message.answer(
        f"Привет, {username}! Ваш баланс: {user.balance}",
        reply_markup=reply_keyboard
    )
    await message.answer(
        "Или вы можете нажать эту кнопку:",
        reply_markup=inline_keyboard
    )

# Главная асинхронная функция
async def main():
    print("Бот запущен")
    await dp.start_polling()

if __name__ == "__main__":
    asyncio.run(main())
