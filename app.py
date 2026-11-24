from flask import Flask, request, jsonify, render_template
import re

app = Flask(__name__)

def check_password(pw):
    score = 0
    tips = []

    if len(pw) >= 8:
        score += 1
    else:
        tips.append("Use at least 8 characters")

    if len(pw) >= 12:
        score += 1
    else:
        tips.append("12 or more characters is even better")

    if re.search(r"[a-z]", pw) and re.search(r"[A-Z]", pw):
        score += 1
    else:
        tips.append("Mix uppercase and lowercase letters")

    if re.search(r"\d", pw):
        score += 1
    else:
        tips.append("Add at least one number")

    if re.search(r"[^A-Za-z0-9]", pw):
        score += 1
    else:
        tips.append("Add a symbol like ! @ # $")

    if pw.lower() in ["password", "123456", "qwerty", "admin", "12345678"]:
        score = 0
        tips.insert(0, "This is a very common password. Avoid it!")

    if score <= 2:
        level = "Weak"
    elif score <= 4:
        level = "Medium"
    else:
        level = "Strong"

    return {"level": level, "score": score, "tips": tips}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/check", methods=["POST"])
def check():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON payload"}), 400

    pw = data.get("password", "")
    if not isinstance(pw, str):
        return jsonify({"error": "Password must be a string"}), 400

    return jsonify(check_password(pw))

if __name__ == "__main__":
    app.run(debug=True)