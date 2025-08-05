from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
modelo = genai.GenerativeModel("gemini-1.5-flash")

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/preguntar", methods=["POST"])
def preguntar():
    pregunta = request.json.get("mensaje", "")
    respuesta = modelo.generate_content(pregunta)
    return jsonify({"respuesta": respuesta.text.strip()})

if __name__ == "__main__":
    app.run(debug=True)
