const chatBox  = document.getElementById("chat-box");
const form     = document.getElementById("chat-form");
const textarea = document.getElementById("mensaje");
const sendBtn  = document.getElementById("enviar");

/* --- Helpers --- */
function addMessage(text, author) {
  const wrapper = document.createElement("div");
  wrapper.className = `msg ${author}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  wrapper.appendChild(bubble);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addTyping() {
  const wrapper = document.createElement("div");
  wrapper.className = "msg angel typing-wrapper";
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.className = "typing";
    wrapper.appendChild(dot);
  }
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  return wrapper;
}

/* --- Form submission --- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const texto = textarea.value.trim();
  if (!texto) return;

  addMessage(texto, "user");
  textarea.value = "";
  textarea.style.height = "42px";
  sendBtn.disabled = true;

  const typingNode = addTyping();

  try {
    const res = await fetch("/preguntar", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ mensaje: texto })
    });
    const data = await res.json();
    typingNode.remove();
    addMessage(data.respuesta, "angel");
  } catch (err) {
    typingNode.remove();
    addMessage("⚠️ Error al obtener respuesta.", "angel");
  } finally {
    sendBtn.disabled = false;
  }
});

/* --- Autoexpansión del textarea --- */
textarea.addEventListener("input", () => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
});

/* --- Atajo “Enter” sin shift --- */
textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    form.requestSubmit();
  }
});
