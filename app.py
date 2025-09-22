from flask import Flask, render_template, request, jsonify
import os
from dotenv import load_dotenv
import google.generativeai as genai
import re
from datetime import datetime

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Configuración del modelo con personalidad profesional
generation_config = {
    "temperature": 0.7,
    "top_p": 0.8,
    "top_k": 40,
    "max_output_tokens": 2048,
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

modelo = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    safety_settings=safety_settings
)

app = Flask(__name__)

# Prompt del sistema para definir la personalidad del asistente
SYSTEM_PROMPT = """
Eres el Asistente Personal de Angel, un AI altamente capacitado y profesional. Tu nombre es Angel AI Assistant.

PERSONALIDAD Y COMPORTAMIENTO:
- Eres profesional, cortés y extremadamente útil
- Tienes conocimientos amplios y actualizados
- Respondes de manera clara, estructurada y concisa
- Eres proactivo en ofrecer soluciones y sugerencias
- Mantienes un tono amigable pero profesional
- Siempre buscas ser útil y resolver problemas eficientemente

FORMATO DE RESPUESTAS:
- Usa formato Markdown para estructurar tus respuestas
- Utiliza encabezados (##) para organizar información
- Usa listas con viñetas (-) o numeradas (1.) cuando sea apropiado
- Aplica **negritas** para resaltar puntos importantes
- Usa `código` para términos técnicos o comandos
- Incluye enlaces cuando sea relevante
- Estructura la información de manera clara y fácil de leer

INSTRUCCIONES ESPECÍFICAS:
- Siempre saluda cordialmente al inicio de la conversación
- Identifícate como el Asistente Personal de Angel
- Proporciona respuestas completas y bien estructuradas
- Si no sabes algo, admítelo honestamente y ofrece alternativas
- Mantén un registro mental del contexto de la conversación
- Ofrece seguimiento o preguntas adicionales cuando sea apropiado

Responde SIEMPRE en español y con el formato Markdown especificado.
"""

def format_response(text):
    """Mejora el formato de la respuesta asegurando un Markdown limpio"""
    # Limpiar espacios extra
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
    
    # Asegurar espacios después de encabezados
    text = re.sub(r'^(#{1,6})\s*(.+)$', r'\1 \2', text, flags=re.MULTILINE)
    
    # Mejorar formato de listas
    text = re.sub(r'^(\s*)-\s*(.+)$', r'\1- \2', text, flags=re.MULTILINE)
    text = re.sub(r'^(\s*)\d+\.\s*(.+)$', r'\1\2', text, flags=re.MULTILINE)
    
    return text.strip()

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'Mensaje vacío'}), 400
        
        # Crear el prompt completo con el contexto del sistema
        full_prompt = f"{SYSTEM_PROMPT}\n\nUsuario: {message}"
        
        # Generar respuesta con Gemini
        response = modelo.generate_content(full_prompt)
        respuesta = format_response(response.text)
        
        return jsonify({'response': respuesta})
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route("/health")
def health():
    """Endpoint para verificar el estado del servicio"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Angel AI Assistant"
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
