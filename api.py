# casi/api.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy.orm import sessionmaker
from database.db import engine, User, SessionLocal  # Используем абсолютный импорт
import os

app = Flask(__name__, static_folder='slot2')
CORS(app)  # Включаем поддержку CORS

# Настройка переменных окружения
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///database/users.db')

@app.route('/')
def home():
    return "Welcome to the API!"

@app.route('/api/user/<int:telegram_id>', methods=['GET'])
def get_user_info(telegram_id):
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.telegram_id == telegram_id).first()
        if user:
            return jsonify({"nickname": user.username, "balance": user.balance})
        else:
            return jsonify({"error": "User not found"}), 404
    finally:
        session.close()

@app.route('/api/update_balance/<int:telegram_id>', methods=['POST'])
def update_balance(telegram_id):
    data = request.get_json()
    bet_amount = data.get('betAmount')
    print(f"Received request to update balance for user {telegram_id} with bet amount {bet_amount}")
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.telegram_id == telegram_id).first()
        if user:
            user.balance += bet_amount
            session.commit()
            session.refresh(user)
            print(f"Updated balance for user {telegram_id} to {user.balance}")
            return jsonify({"success": True, "newBalance": user.balance})
        else:
            return jsonify({"error": "User not found"}), 404
    finally:
        session.close()

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    app.run(debug=True)  # Включаем режим отладки для локального тестирования
