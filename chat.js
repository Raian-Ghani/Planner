/* BACKGROUND CANVAS */
const canvas = document.getElementById('blob-canvas');
const ctx = canvas.getContext('2d');
let mouse = { x: -1000, y: -1000 };
let blobs = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBlobs();
}

function initBlobs() {
    blobs = [];
    const colors = ['#64ffe8', '#37a1ff', '#2cff5d', '#b52cff', '#ff2c6f'];
    for (let i = 0; i < 800; i++) {
        let x = Math.random() * window.innerWidth;
        let y = Math.random() * window.innerHeight;
        blobs.push({
            baseX: x, baseY: y, x, y,
            vx: 0, vy: 0,
            radius: Math.random() * 2 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            isScared: false
        });
    }
}

document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

requestAnimationFrame(function anim() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blobs.forEach(b => {
        let dx = mouse.x - b.x;
        let dy = mouse.y - b.y;
        let d = Math.sqrt(dx * dx + dy * dy);

        if (d < 100) {
            let f = (100 - d) / 100;
            let a = Math.atan2(dy, dx);
            b.vx -= Math.cos(a) * f * 2;
            b.vy -= Math.sin(a) * f * 2;
            b.isScared = true;
        } else b.isScared = false;

        b.vx += (b.baseX - b.x) * 0.05;
        b.vy += (b.baseY - b.y) * 0.05;
        b.vx *= 0.85;
        b.vy *= 0.85;
        b.x += b.vx;
        b.y += b.vy;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.isScared ? b.radius * 3 : b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.globalAlpha = b.isScared ? 0.89 : 0.5;
        ctx.shadowBlur = b.isScared ? 90 : 0;
        ctx.shadowColor = b.color;
        ctx.fill();
    });
    ctx.shadowBlur = 0;
    requestAnimationFrame(anim);
});

/* SIDEBAR COLLAPSE (IDENTICAL TO PAGE 1) */
const uiContainer = document.getElementById('ui-container');
const sidebarToggleTrigger = document.getElementById('sidebar-toggle-trigger');
const expandTab = document.getElementById('sidebar-expand-tab');

function toggleSidebarState() {
    uiContainer.classList.toggle('sidebar-collapsed');
}

sidebarToggleTrigger.addEventListener('click', toggleSidebarState);
expandTab.addEventListener('click', toggleSidebarState);

document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key.toLowerCase() === 'c') toggleSidebarState();
});

/* CHAT SYSTEM */
const messagesContainer = document.getElementById('messages');
const typingIndicator = document.getElementById('typing-indicator');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatWindow = document.getElementById('chat-window');

function addMessageBubble(text, sender) {
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    bubble.classList.add(sender === 'user' ? 'message-user' : 'message-ai');
    bubble.textContent = text.trim();
    messagesContainer.appendChild(bubble);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function showTyping() { typingIndicator.classList.remove('hidden'); }
function hideTyping() { typingIndicator.classList.add('hidden'); }

function getBurstResponse(text) {
    return [
        "okay so listen",
        `you said: "${text}"`,
        "I’m going to respond in bursts now",
        "later this will be wired to the real AI wrapper",
        "but the chat UI is already peak texting mode"
    ];
}

function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessageBubble(text, 'user');
    chatInput.value = '';

    const bursts = getBurstResponse(text);
    let delay = 0;

    bursts.forEach(chunk => {
        delay += 500 + Math.random() * 300;

        setTimeout(showTyping, delay - 300);
        setTimeout(() => {
            hideTyping();
            addMessageBubble(chunk, 'ai');
        }, delay);
    });
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
    }
});
