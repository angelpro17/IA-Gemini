// Variables globales
let currentChatId = null;
let isTyping = false;

// Elementos del DOM
let chatContainer, messagesContainer, messageInput, sendButton, welcomeScreen;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    createNewChat();
});

function initializeElements() {
    chatContainer = document.getElementById('chatContainer');
    messagesContainer = document.getElementById('chat-messages');
    messageInput = document.getElementById('message-input');
    sendButton = document.getElementById('send-btn');
    welcomeScreen = document.getElementById('welcome-screen');
}

function initializeEventListeners() {
    // Botón de enviar
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Enter para enviar
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
        
    // Habilitar/deshabilitar botón de envío
    if (messageInput && sendButton) {
        messageInput.addEventListener('input', function() {
            const hasText = this.value.trim().length > 0;
            sendButton.disabled = !hasText;
            
            // Auto-resize del textarea
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
    
    // Sugerencias de la pantalla de bienvenida
    document.querySelectorAll('.suggestion-card').forEach(card => {
        card.addEventListener('click', function() {
            const text = this.querySelector('span:last-child').textContent;
            if (messageInput) {
                messageInput.value = text;
                sendMessage();
            }
        });
    });
}

function createNewChat() {
    currentChatId = 'chat_' + Date.now();
    
    // Limpiar mensajes
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
    
    // Mostrar pantalla de bienvenida
    if (welcomeScreen) {
        welcomeScreen.style.display = 'flex';
    }
    
    // Limpiar input
    if (messageInput) {
        messageInput.value = '';
        messageInput.style.height = 'auto';
    }
}

async function sendMessage() {
    const message = messageInput?.value?.trim();
    if (!message || isTyping) return;
    
    // Ocultar pantalla de bienvenida y mostrar chat
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
    if (messagesContainer) {
        messagesContainer.style.display = 'block';
    }
    
    // Agregar mensaje del usuario
    addMessage(message, 'user');
    
    // Limpiar input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Mostrar indicador de escritura
    showTypingIndicator();
    
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        // Ocultar indicador de escritura
        hideTypingIndicator();
        
        // Verificar si hay una respuesta exitosa o de fallback
        if (data.response) {
            // Si es una respuesta de fallback, mostrar indicador visual
            if (data.is_fallback) {
                addMessage(data.response, 'bot', true);
            } else {
                addMessage(data.response, 'bot');
            }
        } else if (data.error) {
            // Manejar diferentes tipos de errores
            handleErrorResponse(data);
        } else {
            throw new Error('Respuesta inesperada del servidor');
        }
        
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        
        // Error de conexión o del servidor
        addMessage('❌ **Error de Conexión**\n\nNo se pudo conectar con el servidor. Por favor:\n- Verifica tu conexión a internet\n- Intenta recargar la página\n- Contacta al administrador si el problema persiste', 'bot', false, true);
    }
}

function handleErrorResponse(data) {
    let errorMessage = '';
    
    switch (data.error_type) {
        case 'quota_exceeded':
            errorMessage = '⏰ **Servicio Temporalmente Limitado**\n\nHe alcanzado mi cuota diaria de consultas. El servicio se restablecerá automáticamente en unas horas.\n\n💡 **Sugerencia**: Guarda tu pregunta e intenta más tarde.';
            break;
        case 'api_error':
            errorMessage = '⚙️ **Error de Configuración**\n\nHay un problema con la configuración del servicio.\n\n📞 **Acción requerida**: Contacta al administrador del sistema.';
            break;
        case 'general_error':
        default:
            errorMessage = '❌ **Error Temporal**\n\nOcurrió un error inesperado.\n\n🔄 **Solución**: Intenta de nuevo en unos momentos.';
            break;
    }
    
    addMessage(errorMessage, 'bot', false, true);
}

function addMessage(content, sender, isFallback = false, isError = false) {
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    // Agregar clases especiales para fallback y errores
    if (isFallback) {
        messageDiv.classList.add('fallback-message');
    }
    if (isError) {
        messageDiv.classList.add('error-message');
    }
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    
    // Cambiar avatar según el tipo de mensaje
    if (sender === 'user') {
        avatar.textContent = '👤';
    } else if (isFallback) {
        avatar.textContent = '⚠️';
    } else if (isError) {
        avatar.textContent = '❌';
    } else {
        avatar.textContent = '🤖';
    }
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Procesar contenido según el tipo de mensaje
    if (sender === 'bot' && !isError) {
        // Para mensajes del bot, usar marked para procesar Markdown
        if (typeof marked !== 'undefined') {
            messageContent.innerHTML = marked.parse(content);
        } else {
            // Fallback si marked no está disponible
            messageContent.innerHTML = content.replace(/\n/g, '<br>');
        }
    } else {
        // Para mensajes del usuario y errores, mostrar como texto plano
        messageContent.textContent = content;
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll automático
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
    if (!messagesContainer) return;
    
    isTyping = true;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'message-content';
    typingContent.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(typingContent);
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
    isTyping = false;
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}
