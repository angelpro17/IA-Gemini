// Variables globales
let currentChatId = null;
let chatHistory = [];
let isTyping = false;

// Elementos del DOM
let chatContainer, messagesContainer, messageInput, sendButton, welcomeScreen, sidebar, mobileMenuBtn, newChatBtn, chatHistoryContainer;

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
    sidebar = document.querySelector('.sidebar');
    mobileMenuBtn = document.getElementById('mobileMenuBtn');
    newChatBtn = document.getElementById('newChatBtn');
    chatHistoryContainer = document.querySelector('.chat-history');
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
            this.style.height = Math.min(this.scrollHeight, 200) + 'px';
        });
    }
    
    // Nuevo chat
    if (newChatBtn) {
        newChatBtn.addEventListener('click', createNewChat);
    }
    
    // Menú móvil
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }
    
    // Cerrar sidebar en móvil al hacer click fuera
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768 && sidebar && !sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });
    
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
    
    // Agregar al historial
    addChatToHistory(currentChatId, 'Nuevo chat');
    
    // Limpiar input
    if (messageInput) {
        messageInput.value = '';
        messageInput.style.height = 'auto';
    }
}

function addChatToHistory(chatId, title) {
    if (!chatHistoryContainer) return;
    
    // Crear elemento de historial
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.dataset.chatId = chatId;
    
    historyItem.innerHTML = `
        <span class="material-icons">chat_bubble_outline</span>
        <span class="history-text">${title}</span>
        <button class="history-menu">
            <span class="material-icons">more_vert</span>
        </button>
    `;
    
    // Evento para cambiar de chat
    historyItem.addEventListener('click', function(e) {
        if (!e.target.closest('.history-menu')) {
            switchToChat(chatId);
        }
    });
    
    // Agregar al inicio del historial
    chatHistoryContainer.insertBefore(historyItem, chatHistoryContainer.firstChild);
    
    // Marcar como activo
    document.querySelectorAll('.history-item').forEach(item => {
        item.classList.remove('active');
    });
    historyItem.classList.add('active');
}

function switchToChat(chatId) {
    currentChatId = chatId;
    
    // Marcar como activo en el historial
    document.querySelectorAll('.history-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.chatId === chatId) {
            item.classList.add('active');
        }
    });
    
    // Aquí podrías cargar los mensajes del chat si los tuvieras guardados
    // Por ahora solo limpiamos y mostramos la pantalla de bienvenida
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
    if (welcomeScreen) {
        welcomeScreen.style.display = 'flex';
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
    
    // Actualizar título del chat en el historial
    updateChatTitle(currentChatId, message);
    
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
        
        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }
        
        const data = await response.json();
        
        // Ocultar indicador de escritura
        hideTypingIndicator();
        
        // Agregar respuesta del bot
        addMessage(data.response, 'bot');
        
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addMessage('Lo siento, ocurrió un error. Por favor, intenta de nuevo.', 'bot');
    }
}

function addMessage(content, sender) {
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = sender === 'user' ? '👤' : '🤖';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (sender === 'bot' && typeof marked !== 'undefined') {
        // Renderizar Markdown para respuestas del bot
        messageContent.innerHTML = marked.parse(content);
    } else {
        messageContent.textContent = content;
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    messagesContainer.appendChild(messageDiv);
    
    // Scroll al final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Animación de entrada
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    });
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

function updateChatTitle(chatId, firstMessage) {
    const historyItem = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (historyItem) {
        const titleElement = historyItem.querySelector('.history-text');
        if (titleElement && titleElement.textContent === 'Nuevo chat') {
            // Usar las primeras palabras del mensaje como título
            const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
            titleElement.textContent = title;
        }
    }
}

function toggleSidebar() {
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Responsive
window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && sidebar) {
        sidebar.classList.remove('active');
    }
});
