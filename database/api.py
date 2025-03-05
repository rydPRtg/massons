# casi/database/api.py
from flask import Flask, request, jsonify
from sqlalchemy.orm import sessionmaker
from database.db import engine, User, SessionLocal  # Используем абсолютный импорт

app = Flask(__name__)

@app.route('/api/user/<int:telegram_id>', methods=['GET'])
def get_user_info(telegram_id):
    session = SessionLocal()
    user = session.query(User).filter(User.telegram_id == telegram_id).first()
    if user:
        return jsonify({"nickname": user.username, "balance": user.balance})
    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/api/update_balance/<int:telegram_id>', methods=['POST'])
def update_balance(telegram_id):
    data = request.get_json()
    bet_amount = data.get('betAmount')
    session = SessionLocal()
    user = session.query(User).filter(User.telegram_id == telegram_id).first()
    if user:
        user.balance -= bet_amount
        session.commit()
        session.refresh(user)
        return jsonify({"success": True, "newBalance": user.balance})
    else:
        return jsonify({"error": "User not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
