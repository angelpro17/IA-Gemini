# 💬 Angel Chat

Una aplicación web de chat impulsada por la API de Gemini de Google, construida con Flask.

## 🚀 Características

- Interfaz tipo ChatGPT, moderna y amigable
- Comunicación con Gemini (modelo gemini-1.5-flash)
- Respuestas inteligentes vía Google Generative AI
- Despliegue listo para Render, Railway o Fly.io
- Frontend limpio con HTML, CSS y JavaScript
- Historial de conversación en tiempo real
- Diseño responsive para móviles y escritorio

## 📸 Demo

https://ia-angel.onrender.com

## 🧱 Requisitos

- Python 3.8 o superior
- Cuenta con acceso a la API de Gemini
- Clave API de Gemini (`GEMINI_API_KEY`)

## 📦 Instalación local

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tuusuario/angel-chat.git
cd angel-chat
```

2. **Crear entorno virtual:**
```bash
python -m venv venv
source venv/bin/activate  # en Windows: venv\Scripts\activate
```

3. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno:**
Crea un archivo `.env` en la raíz del proyecto con tu clave:
```env
GEMINI_API_KEY=tu_clave_secreta_aquí
```

5. **Ejecutar el servidor:**
```bash
python app.py
```

6. **Abrir en el navegador:**
Ve a `http://localhost:5000`

## ☁️ Despliegue en Render

1. Sube el proyecto a un repositorio en GitHub
2. Ve a [https://render.com](https://render.com) y crea un nuevo servicio web
3. Conecta tu repositorio y configura:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
   - **Environment Variable:** `GEMINI_API_KEY` con tu clave API

Render se encargará del resto. El sitio quedará disponible con una URL pública segura (HTTPS).

## 🚀 Otros servicios de despliegue

### Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Desplegar
railway login
railway init
railway add
railway deploy
```

### Fly.io
```bash
# Instalar Fly CLI
fly auth login
fly launch
fly deploy
```

## 📂 Estructura del proyecto

```
angel-chat/
│
├── app.py                # Backend principal con Flask
├── requirements.txt      # Dependencias de Python
├── Procfile              # Comando para gunicorn
├── .env                  # Variables de entorno (no se sube)
├── .gitignore           # Archivos a ignorar por Git
├── templates/
│   └── index.html        # Interfaz principal del chat
├── static/
│   ├── style.css         # Estilos del frontend
│   └── chat.js           # Lógica de interacción
└── README.md             # Este archivo
```

## 🛠️ Archivos principales

### `requirements.txt`
```
Flask==2.3.3
google-generativeai==0.3.2
python-dotenv==1.0.0
gunicorn==21.2.0
```

### `Procfile`
```
web: gunicorn app:app
```

### `.gitignore`
```
.env
__pycache__/
*.pyc
venv/
.DS_Store
```

## 🔧 Configuración de la API

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key para Gemini
3. Copia la clave y agrégala a tu archivo `.env`
4. Asegúrate de que la API esté habilitada en tu proyecto de Google Cloud

## 🎨 Personalización

### Cambiar el modelo de Gemini
En `app.py`, puedes cambiar el modelo:
```python
model = genai.GenerativeModel('gemini-1.5-pro')  # Modelo más avanzado
```

### Personalizar la personalidad del asistente
Modifica el prompt del sistema en `app.py`:
```python
system_prompt = "Eres Angel, un asistente helpful y amigable..."
```

### Estilos personalizados
Edita `static/style.css` para cambiar colores, fuentes y diseño.

## 🔐 Notas de seguridad

- ⚠️ **No compartas tu `GEMINI_API_KEY`**
- ✅ Agrega `.env` al `.gitignore` para evitar subirlo a GitHub
- 🔄 Puedes rotar tu API key desde Google AI Studio si es necesario
- 🛡️ Las variables de entorno en producción se configuran desde el panel del servicio

## 🐛 Solución de problemas

### Error: "API key not found"
- Verifica que el archivo `.env` esté en la raíz del proyecto
- Asegúrate de que la variable se llame exactamente `GEMINI_API_KEY`

### Error: "Module not found"
```bash
pip install -r requirements.txt
```

### El chat no responde
- Revisa la consola del navegador (F12)
- Verifica que la API key sea válida
- Comprueba los logs del servidor

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## ✨ Créditos

- Basado en **Flask** + **Google Generative AI**
- Desarrollado por @Angel
- Inspirado en la interfaz de Gemini
