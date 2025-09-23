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
        error_message = str(e)
        print(f"Error: {error_message}")
        
        # Detectar error de cuota excedida - proporcionar respuesta de fallback
        if "429" in error_message or "quota" in error_message.lower() or "exceeded" in error_message.lower():
            fallback_response = get_fallback_response(message)
            return jsonify({
                'response': fallback_response,
                'is_fallback': True,
                'error_type': 'quota_exceeded'
            })
        
        # Otros errores de API
        elif "400" in error_message or "401" in error_message or "403" in error_message:
            return jsonify({
                'error': 'Hay un problema con la configuración del servicio. Por favor, contacta al administrador.',
                'error_type': 'api_error'
            }), 500
        
        # Error genérico
        return jsonify({
            'error': 'Lo siento, ocurrió un error. Por favor, intenta de nuevo.',
            'error_type': 'general_error'
        }), 500

def get_fallback_response(message):
    """Proporciona respuestas de fallback cuando la API no está disponible"""
    message_lower = message.lower()
    
    # Respuestas para saludos
    if any(word in message_lower for word in ['hola', 'buenos', 'buenas', 'saludos', 'hey']):
        return """## ¡Hola! 👋

Soy el **Asistente Personal de Angel**, aunque actualmente tengo limitaciones temporales en mi servicio.

### Estado del Servicio
- 🔄 **Modo Limitado**: He alcanzado mi cuota diaria de consultas
- ⏰ **Disponibilidad**: El servicio se restablecerá en unas horas
- 💡 **Sugerencia**: Intenta de nuevo más tarde para una experiencia completa

¡Gracias por tu paciencia!"""
    
    # Respuestas para preguntas sobre programación
    elif any(word in message_lower for word in ['código', 'programar', 'javascript', 'python', 'html', 'css']):
        return """## 💻 Consulta de Programación

Actualmente estoy en **modo limitado** debido a restricciones de cuota.

### Recursos Recomendados
- 📚 **MDN Web Docs**: Para HTML, CSS y JavaScript
- 🐍 **Python.org**: Documentación oficial de Python
- 📖 **Stack Overflow**: Comunidad de desarrolladores
- 🎓 **FreeCodeCamp**: Tutoriales gratuitos

### ¿Necesitas ayuda urgente?
Intenta reformular tu pregunta más tarde cuando el servicio esté completamente disponible."""
    
    # Respuestas para información general
    elif any(word in message_lower for word in ['info', 'información', 'ayuda', 'qué', 'cómo', 'cuál']):
        return """## ℹ️ Información del Servicio

**Angel AI Assistant** está temporalmente en modo limitado.

### Estado Actual
- ⚠️ **Cuota Excedida**: He alcanzado el límite diario de consultas
- 🔄 **Reinicio**: El servicio se restablecerá automáticamente
- ⏱️ **Tiempo Estimado**: Unas horas

### Mientras Tanto
- Puedes guardar tus preguntas para más tarde
- El servicio completo estará disponible pronto
- Gracias por tu comprensión"""
    
    # Respuesta genérica
    else:
        return """## 🤖 Angel AI Assistant - Modo Limitado

Lo siento, actualmente estoy operando con **capacidad limitada** debido a restricciones de cuota diaria.

### ¿Qué Significa Esto?
- 📊 **Cuota Diaria**: He procesado el máximo de consultas permitidas hoy
- ⏰ **Renovación**: El servicio se restablecerá automáticamente
- 🔄 **Disponibilidad**: Intenta de nuevo en unas horas

### Tu Consulta
He recibido tu mensaje: *"{}"*

**Recomendación**: Guarda tu pregunta y vuelve a intentarlo más tarde para obtener una respuesta completa y personalizada.

¡Gracias por tu paciencia! 🙏""".format(message[:100] + "..." if len(message) > 100 else message)

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
