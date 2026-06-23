// --- HIDDEN ARCHITECTURE SYSTEMS (PERSISTED LOCAL DATABASE VARIABLES) ---
let taskMatrix = JSON.parse(localStorage.getItem('systemDirectives')) || [];
let totalDirectivesCount = parseInt(localStorage.getItem('totalDirectivesCount')) || 0;
let slotTokens = parseInt(localStorage.getItem('slotTokens')) || 0;
let savedInterests = JSON.parse(localStorage.getItem('userVectors')) || ["Coding", "Hardware", "Music"];
let currentViewMode = "BOARD"; 
let isSpinning = false;

// --- ORIGINAL BLOB PARTICLE INTERACTIVE BACKGROUND CANVAS ENGINE ---
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
    for (let i = 0; i < 400; i++) {
        let randomX = Math.random() * window.innerWidth;
        let randomY = Math.random() * window.innerHeight;
        blobs.push({
            baseX: randomX, baseY: randomY, x: randomX, y: randomY,
            vx: 0, vy: 0, radius: Math.random() * 2 + 1,
            color: ['#64ffe8', '#37a1ff', '#2cff5d'][Math.floor(Math.random() * 3)]
        });
    }
}

document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
document.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blobs.forEach(b => {
        let dx = mouse.x - b.x, dy = mouse.y - b.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 120) {
            let force = (120 - distance) / 120;
            let angle = Math.atan2(dy, dx);
            b.vx -= Math.cos(angle) * force * 1.5;
            b.vy -= Math.sin(angle) * force * 1.5;
        }
        b.vx += (b.baseX - b.x) * 0.05; b.vy += (b.baseY - b.y) * 0.05;
        b.vx *= 0.85; b.vy *= 0.85;
        b.x += b.vx; b.y += b.vy;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color; ctx.globalAlpha = 0.3; ctx.fill();
    });
    requestAnimationFrame(animate);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); animate();


// --- STANDARD 1-CHARACTER LEET SPEAK ONLY ---
const characterMatrix = {
    'A': ['4'], 'B': ['8'], 'C': ['0'], 'E': ['3'], 'G': ['6'],
    'I': ['1'], 'L': ['1'], 'O': ['0'], 'S': ['5'], 'T': ['7'], 'Z': ['2']
};

function parseToMatrixPattern(rawString) {
    const cleanStr = rawString.toUpperCase().replace(/[^A-Z0-9]/g, ''); 
    let finalOutput = "";
    for (let i = 0; i < cleanStr.length; i++) {
        const currentChar = cleanStr[i];
        if (i % 2 === 1 && characterMatrix[currentChar]) {
            finalOutput += characterMatrix[currentChar][0];
        } else {
            finalOutput += currentChar;
        }
    }
    return finalOutput || cleanStr;
}


// --- INTERFACE LAYOUT & WORKFLOW MANAGEMENT ---
const task = document.getElementById('task1');
const button = document.getElementById('submitButt');
const priority = document.getElementById('priority1');
const time = document.getElementById('time1');

const viewToggleSwitch = document.getElementById('view-toggle-switch');
const currentViewLabel = document.getElementById('current-view-label');
const boardViewLayout = document.getElementById('view-board-layout');
const compactViewLayout = document.getElementById('view-compact-layout');

const sidebarToggleTrigger = document.getElementById('sidebar-toggle-trigger');
const uiContainer = document.getElementById('ui-container');

const colBacklog = document.getElementById('col-backlog');
const colProgress = document.getElementById('col-progress');
const colDone = document.getElementById('col-done');
const compactStreamList = document.getElementById('compact-stream-list');

function updateTokenDisplay() {
    document.getElementById('token-display').innerText = slotTokens;
}

// Collapsible Sidebar Panel Toggle Handler
sidebarToggleTrigger.addEventListener('click', () => {
    uiContainer.classList.toggle('sidebar-collapsed');
});

// Switch Toggle Logic
viewToggleSwitch.addEventListener('click', () => {
    viewToggleSwitch.classList.toggle('active-on');
    
    if (currentViewMode === "BOARD") {
        currentViewMode = "COMPACT";
        currentViewLabel.innerText = "STREAM VIEW";
        boardViewLayout.classList.add('hidden');
        compactViewLayout.classList.remove('hidden');
    } else {
        currentViewMode = "BOARD";
        currentViewLabel.innerText = "BOARD VIEW";
        compactViewLayout.classList.add('hidden');
        boardViewLayout.classList.remove('hidden');
    }
    renderDirectives();
});

function updateCounters() {
    const backlogCount = taskMatrix.filter(t => t.status === 'backlog').length;
    const doneCount = taskMatrix.filter(t => t.status === 'done').length;

    if (document.getElementById('count-active')) document.getElementById('count-active').innerText = backlogCount;
    if (document.getElementById('count-resolved')) document.getElementById('count-resolved').innerText = doneCount;
    if (document.getElementById('count-total')) document.getElementById('count-total').innerText = totalDirectivesCount;
    updateTokenDisplay();
}

function renderDirectives() {
    colBacklog.innerHTML = '';
    colProgress.innerHTML = '';
    colDone.innerHTML = '';
    compactStreamList.innerHTML = '';

    taskMatrix.forEach((item) => {
        const li = document.createElement('li');
        if (item.priority === 'High') li.classList.add('high-priority');
        
        let actionButtons = '';
        if (item.status === 'backlog') {
            actionButtons = `<button onclick="advanceTicket('${item.id}', 'progress')">Start Work ➔</button>`;
        } else if (item.status === 'progress') {
            actionButtons = `
                <button onclick="advanceTicket('${item.id}', 'backlog')">↩ Halt</button>
                <button onclick="advanceTicket('${item.id}', 'done')">Complete ✓</button>
            `;
        } else if (item.status === 'done') {
            actionButtons = `<button onclick="purgeTicket('${item.id}')">Archive</button>`;
        }

        li.innerHTML = `
            <div><strong>${item.time}-${item.matrixText}-${item.priority.toUpperCase()}</strong> [Status: ${item.status.toUpperCase()}]</div>
            <div class="card-actions">
                <span>UID: #${item.id.slice(0,4)}</span>
                ${actionButtons}
            </div>
        `;

        if (currentViewMode === "BOARD") {
            if (item.status === 'backlog') colBacklog.appendChild(li);
            if (item.status === 'progress') colProgress.appendChild(li);
            if (item.status === 'done') colDone.appendChild(li);
        } else {
            compactStreamList.appendChild(li);
        }
    });

    updateCounters();
}

button.addEventListener('click', () => {
    if (task.value.trim() === '' || priority.value === '' || isNaN(parseInt(time.value)) || parseInt(time.value) <= 0){
        alert('Validation Failure!'); return;
    }

    const randomizedMatrixString = parseToMatrixPattern(task.value.trim());

    taskMatrix.push({
        id: 'MX-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        text: task.value.trim(),
        matrixText: randomizedMatrixString,
        priority: priority.value,
        time: time.value,
        status: 'backlog'
    });

    totalDirectivesCount++; 
    localStorage.setItem('totalDirectivesCount', totalDirectivesCount);
    localStorage.setItem('systemDirectives', JSON.stringify(taskMatrix));
    renderDirectives();

    task.value = ''; priority.value = ''; time.value = '';
});

window.advanceTicket = function(ticketId, newStatus) {
    taskMatrix = taskMatrix.map(t => {
        if (t.id === ticketId) {
            if (t.status !== 'done' && newStatus === 'done') {
                slotTokens++;
                localStorage.setItem('slotTokens', slotTokens);
            }
            return { ...t, status: newStatus };
        }
        return t;
    });
    localStorage.setItem('systemDirectives', JSON.stringify(taskMatrix));
    renderDirectives();
};

window.purgeTicket = function(ticketId) {
    taskMatrix = taskMatrix.filter(t => t.id !== ticketId);
    localStorage.setItem('systemDirectives', JSON.stringify(taskMatrix));
    renderDirectives();
};


// --- VECTOR CORE SECTORS ---
const interestInput = document.getElementById('customInterest');
const addInterestBtn = document.getElementById('addInterestButt');
const tagCloud = document.getElementById('interestTags');

function renderTags() {
    tagCloud.innerHTML = ''; 
    savedInterests.forEach((interest, index) => {
        const chip = document.createElement('span');
        chip.className = 'tag'; chip.textContent = interest;
        chip.addEventListener('click', () => {
            savedInterests.splice(index, 1);
            localStorage.setItem('userVectors', JSON.stringify(savedInterests));
            renderTags();
        });
        tagCloud.appendChild(chip);
    });
}

addInterestBtn.addEventListener('click', () => {
    const value = interestInput.value.trim();
    if (value && !savedInterests.includes(value)) {
        savedInterests.push(value);
        localStorage.setItem('userVectors', JSON.stringify(savedInterests));
        renderTags(); interestInput.value = '';
    }
});


// --- SLOT MACHINE SLOTS REEL MODULE ENGINE ---
const spinBtn = document.getElementById('spinButt');
const slot1Reel = document.getElementById('slot1-reel');
const slot2Reel = document.getElementById('slot2-reel');
const readout = document.getElementById('spin-readout');

window.executeRewardSequence = function() {
    if (isSpinning) return;
    if (savedInterests.length === 0) {
        readout.innerText = "[ERROR] ADD INTEREST SCENE VECTORS FIRST!";
        return;
    }
    if (slotTokens < 1) {
        readout.innerText = "[LOCKED] EARN TOKENS BY DEPLOYING DIRECTIVES!";
        return;
    }

    slotTokens--;
    localStorage.setItem('slotTokens', slotTokens);
    updateTokenDisplay();

    isSpinning = true;
    readout.innerText = "ROLLING MATRIX REELS...";

    const slot1Items = []; const slot2Items = [];
    for (let i = 0; i < 20; i++) {
        slot1Items.push(savedInterests[Math.floor(Math.random() * savedInterests.length)]);
        slot2Items.push((Math.floor(Math.random() * 45) + 15) + "m");
    }

    const targetVector = savedInterests[Math.floor(Math.random() * savedInterests.length)];
    const calculatedTime = (Math.floor(Math.random() * 45) + 30) + "m";
    const matrixTargetVector = parseToMatrixPattern(targetVector);

    slot1Items.push(matrixTargetVector); slot2Items.push(calculatedTime);

    buildReelTiles(slot1Reel, slot1Items); buildReelTiles(slot2Reel, slot2Items);

    slot1Reel.style.transition = "none"; slot2Reel.style.transition = "none";
    slot1Reel.style.top = "0px"; slot2Reel.style.top = "0px";
    slot1Reel.offsetHeight; 

    const targetOffset = -((slot1Items.length - 1) * 48); 
    slot1Reel.style.transition = "top 2s cubic-bezier(0.1, 0.8, 0.1, 1)";
    slot2Reel.style.transition = "top 2.4s cubic-bezier(0.1, 0.8, 0.1, 1)"; 
    slot1Reel.style.top = `${targetOffset}px`; slot2Reel.style.top = `${targetOffset}px`;

    setTimeout(() => {
        readout.innerText = `[WIN] ${matrixTargetVector.toUpperCase()} // ${calculatedTime}`;
        isSpinning = false;
    }, 2500);
};

function buildReelTiles(reelElement, itemsArray) {
    reelElement.innerHTML = '';
    itemsArray.forEach(text => {
        const tile = document.createElement('div');
        tile.className = 'slot-tile'; tile.innerText = text;
        reelElement.appendChild(tile);
    });
}

spinBtn.onclick = window.executeRewardSequence;

// Boot Initializers
renderTags();
renderDirectives();