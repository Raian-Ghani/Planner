// --- ALL TERMINAL STATE STRUCTS ---
let taskMatrix = JSON.parse(localStorage.getItem('systemDirectives')) || [];
let totalDirectivesCount = parseInt(localStorage.getItem('totalDirectivesCount')) || 0;
let slotTokens = parseInt(localStorage.getItem('slotTokens')) || 0;
let savedInterests = JSON.parse(localStorage.getItem('userVectors')) || ["Coding", "Hardware", "Music"];
let breakRegistry = JSON.parse(localStorage.getItem('breakWeeklyRegistry')) || [];
let currentViewMode = "BOARD"; 
let isSpinning = false;

// --- CONFIG ARRAYS FOR WORK TIMER ---
let workInterval = null;
let workSecondsLeft = 25 * 60;
let workIsRunning = false;

// --- DYNAMIC ENGINE BACKGROUND THREAD BINDINGS ---
let activeBackgroundTimers = {}; 
let activeBreakIntervals = {}; 

// --- GENESIS CANVAS BACKGROUND PARTICLE ENGINE ---
const canvas = document.getElementById('blob-canvas'); const ctx = canvas.getContext('2d');
let mouse = { x: -1000, y: -1000 }; let blobs = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initBlobs(); }
function initBlobs() {
    blobs = [];
    for (let i = 0; i < 1500; i++) {
        let randomX = Math.random() * window.innerWidth; let randomY = Math.random() * window.innerHeight;
        blobs.push({
            baseX: randomX, baseY: randomY, x: randomX, y: randomY, vx: 0, vy: 0, radius: Math.random() * 2 + 1,
            color: ['#64ffe8', '#37a1ff', '#2cff5d', '#b52cff', '#ff2c6f'][Math.floor(Math.random() * 5)],
            isScared: false
        });
    }
}
document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('resize', resizeCanvas); resizeCanvas();
requestAnimationFrame(function anim(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blobs.forEach(b => {
        let dx = mouse.x - b.x, dy = mouse.y - b.y; let d = Math.sqrt(dx*dx + dy*dy);
        if (d < 100) { 
            let f = (100 - d) / 100; let a = Math.atan2(dy, dx); 
            b.vx -= Math.cos(a) * f * 2.0; b.vy -= Math.sin(a) * f * 2.0; 
            b.isScared = true;
        } else {
            b.isScared = false;
        }
        b.vx += (b.baseX - b.x) * 0.05; b.vy += (b.baseY - b.y) * 0.05; b.vx *= 0.85; b.vy *= 0.85; b.x += b.vx; b.y += b.vy;
        
        ctx.beginPath(); 
        ctx.arc(b.x, b.y, b.isScared ? b.radius * 3 : b.radius, 0, Math.PI*2); 
        ctx.fillStyle = b.color; 
        ctx.globalAlpha = b.isScared ? 0.89 : 0.5; 
        
        if (b.isScared) {
            ctx.shadowBlur = 90;
            ctx.shadowColor = b.color;
        } else {
            ctx.shadowBlur = 0;
        }
        
        ctx.fill();
    });
    ctx.shadowBlur = 0; // Reset canvas context state shadows
    requestAnimationFrame(anim);
});

// --- ENCRYPT LEET CIPHER LAYER ---
const characterMatrix = { 'A': ['4'], 'B': ['8'], 'C': ['0'], 'E': ['3'], 'G': ['6'], 'I': ['1'], 'L': ['1'], 'O': ['0'], 'S': ['5'], 'T': ['7'], 'Z': ['2'] };
function parseToMatrixPattern(rawString) {
    const cleanStr = rawString.toUpperCase().replace(/[^A-Z0-9]/g, ''); let finalOutput = "";
    for (let i = 0; i < cleanStr.length; i++) {
        if (i % 2 === 1 && characterMatrix[cleanStr[i]]) finalOutput += characterMatrix[cleanStr[i]][0];
        else finalOutput += cleanStr[i];
    }
    return finalOutput || cleanStr;
}

// --- DOM REGISTRY REFERENCE TARGETS ---
const task = document.getElementById('task1'); const button = document.getElementById('submitButt'); const priority = document.getElementById('priority1'); const time = document.getElementById('time1');
const viewToggleSwitch = document.getElementById('view-toggle-switch'); const currentViewLabel = document.getElementById('current-view-label');
const boardViewLayout = document.getElementById('view-board-layout'); const compactViewLayout = document.getElementById('view-compact-layout');
const colBacklog = document.getElementById('col-backlog'); const colProgress = document.getElementById('col-progress'); const colDone = document.getElementById('col-done'); const compactStreamList = document.getElementById('compact-stream-list');

const sidebarToggleTrigger = document.getElementById('sidebar-toggle-trigger'); const uiContainer = document.getElementById('ui-container'); const expandTab = document.getElementById('sidebar-expand-tab');

const workMinutesInput = document.getElementById('work-minutes-input'); const workTimerDigits = document.getElementById('work-timer-digits'); const workStartBtn = document.getElementById('work-start-btn'); const workResetBtn = document.getElementById('work-reset-btn');
const breakShelfContainer = document.getElementById('break-shelf-container'); const weekLogStatus = document.getElementById('week-log-status');
const timerStatusMsg = document.getElementById('timer-status-msg');

const interestInput = document.getElementById('customInterest'); const addInterestBtn = document.getElementById('addInterestButt'); const tagCloud = document.getElementById('interestTags');

// --- ENTER INTERCEPT HANDLERS ---
function executeDirectiveFormSubmission() {
    let timeRawString = time.value.trim();
    if (task.value.trim() === '' || priority.value === '' || timeRawString === '' || parseFloat(timeRawString) <= 0){ alert('Validation Failure!'); return; }
    
    let totalSeconds = 0;
    if (timeRawString.includes('.')) {
        let parts = timeRawString.split('.');
        let mins = parseInt(parts[0]) || 0;
        let decimalPart = parts[1] || "0";
        if (decimalPart.length === 1) decimalPart += "0";
        let secs = parseInt(decimalPart.slice(0, 2)) || 0;
        totalSeconds = (mins * 60) + secs;
    } else {
        totalSeconds = parseInt(timeRawString) * 60;
    }

    taskMatrix.push({
        id: 'MX-' + Math.random().toString(36).substr(2, 9).toUpperCase(), text: task.value.trim(),
        matrixText: parseToMatrixPattern(task.value.trim()), priority: priority.value, 
        totalSeconds: totalSeconds, status: 'backlog'
    });
    totalDirectivesCount++; localStorage.setItem('totalDirectivesCount', totalDirectivesCount);
    localStorage.setItem('systemDirectives', JSON.stringify(taskMatrix)); renderDirectives();
    task.value = ''; priority.value = ''; time.value = '';
}

function executeVectorFormSubmission() {
    const v = interestInput.value.trim(); 
    if (v && !savedInterests.includes(v)) { 
        savedInterests.push(v); 
        localStorage.setItem('userVectors', JSON.stringify(savedInterests)); 
        renderTags(); 
        interestInput.value = ''; 
    }
}

// Attach listeners to input blocks
[task, time, priority].forEach(element => {
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeDirectiveFormSubmission();
        }
    });
});

interestInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        executeVectorFormSubmission();
    }
});

button.addEventListener('click', executeDirectiveFormSubmission);
addInterestBtn.addEventListener('click', executeVectorFormSubmission);

time.addEventListener('keydown', (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
});

function updateTokenDisplay() { document.getElementById('token-display').innerText = slotTokens; }

// --- COLLAPSE MECHANICS LAYER ENGINE ---
function toggleSidebarState() { uiContainer.classList.toggle('sidebar-collapsed'); }
sidebarToggleTrigger.addEventListener('click', toggleSidebarState);
if (expandTab) { expandTab.addEventListener('click', toggleSidebarState); }

// GLOBAL HOTKEY ("C")
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        toggleSidebarState();
    }
});

viewToggleSwitch.addEventListener('click', () => {
    viewToggleSwitch.classList.toggle('active-on');
    if (currentViewMode === "BOARD") {
        currentViewMode = "COMPACT"; currentViewLabel.innerText = "STREAM VIEW";
        boardViewLayout.classList.add('hidden'); compactViewLayout.classList.remove('hidden');
    } else {
        currentViewMode = "BOARD"; currentViewLabel.innerText = "BOARD VIEW";
        compactViewLayout.classList.add('hidden'); boardViewLayout.classList.remove('hidden');
    }
    renderDirectives();
});

function updateCounters() {
    document.getElementById('count-active').innerText = taskMatrix.filter(t => t.status === 'backlog').length;
    document.getElementById('count-resolved').innerText = taskMatrix.filter(t => t.status === 'done').length;
    document.getElementById('count-total').innerText = totalDirectivesCount; updateTokenDisplay();
}

// --- RENDERING WORKSPACE CARDS ---
function renderDirectives() {
    colBacklog.innerHTML = ''; colProgress.innerHTML = ''; colDone.innerHTML = ''; compactStreamList.innerHTML = '';
    taskMatrix.forEach((item) => {
        const li = document.createElement('li'); 
        
        if (item.priority === 'High') li.classList.add('priority-high');
        else if (item.priority === 'Mid') li.classList.add('priority-mid');
        else if (item.priority === 'Low') li.classList.add('priority-low');

        let backgroundClockBadge = '';
        if (item.status === 'progress' && activeBackgroundTimers[item.id]) {
            let left = activeBackgroundTimers[item.id].timeLeft;
            backgroundClockBadge = `<span class="bg-clock-badge">AUTO: ${Math.floor(left / 60).toString().padStart(2, '0')}:${(left % 60).toString().padStart(2, '0')}</span>`;
        }

        let actionButtons = '';
        if (item.status === 'backlog') actionButtons = `<button onclick="advanceTicket('${item.id}', 'progress')">Start Work ➔</button>`;
        else if (item.status === 'progress') actionButtons = `<button onclick="advanceTicket('${item.id}', 'backlog')">↩ Halt</button> <button onclick="advanceTicket('${item.id}', 'done')">Complete ✓</button>`;
        else if (item.status === 'done') actionButtons = `<button onclick="purgeTicket('${item.id}')">Archive</button>`;

        let displayMins = Math.floor(item.totalSeconds / 60);
        let displaySecs = item.totalSeconds % 60;
        
        let timeString = displayMins > 0 ? (displaySecs > 0 ? `${displayMins}m ${displaySecs}s` : `${displayMins}m`) : `${displaySecs}s`;

        li.innerHTML = `
            ${backgroundClockBadge}
            <div><strong>${timeString} - ${item.matrixText} - ${item.priority.toUpperCase()}</strong></div>
            <div class="card-actions"><span>UID: #${item.id.slice(0,4)}</span>${actionButtons}</div>
        `;
        if (currentViewMode === "BOARD") {
            if (item.status === 'backlog') colBacklog.appendChild(li);
            if (item.status === 'progress') colProgress.appendChild(li);
            if (item.status === 'done') colDone.appendChild(li);
        } else { compactStreamList.appendChild(li); }
    });
    updateCounters();
}

window.advanceTicket = function(ticketId, newStatus) {
    if (activeBackgroundTimers[ticketId]) { clearInterval(activeBackgroundTimers[ticketId].intervalId); delete activeBackgroundTimers[ticketId]; }
    taskMatrix = taskMatrix.map(t => {
        if (t.id === ticketId) {
            if (t.status !== 'done' && newStatus === 'done') { slotTokens++; localStorage.setItem('slotTokens', slotTokens); }
            return { ...t, status: newStatus };
        }
        return t;
    });
    localStorage.setItem('systemDirectives', JSON.stringify(taskMatrix));

    if (newStatus === 'progress') {
        const targetTask = taskMatrix.find(t => t.id === ticketId);
        if (targetTask) {
            activeBackgroundTimers[ticketId] = {
                timeLeft: targetTask.totalSeconds,
                intervalId: setInterval(() => {
                    if (activeBackgroundTimers[ticketId].timeLeft > 0) { activeBackgroundTimers[ticketId].timeLeft--; renderDirectives(); }
                    else {
                        clearInterval(activeBackgroundTimers[ticketId].intervalId); delete activeBackgroundTimers[ticketId];
                        window.advanceTicket(ticketId, 'done');
                        timerStatusMsg.innerText = `AUTO-DEPLOY COMPLETE: #${ticketId.slice(0,4)}`;
                    }
                }, 1000)
            };
        }
    }
    renderDirectives();
};

window.purgeTicket = function(ticketId) {
    if (activeBackgroundTimers[ticketId]) { clearInterval(activeBackgroundTimers[ticketId].intervalId); delete activeBackgroundTimers[ticketId]; }
    taskMatrix = taskMatrix.filter(t => t.id !== ticketId); localStorage.setItem('systemDirectives', JSON.stringify(taskMatrix)); renderDirectives();
};

// --- CHRONOS WORK TIMER ---
function displayWorkClock() {
    workTimerDigits.innerText = `${Math.floor(workSecondsLeft / 60).toString().padStart(2, '0')}:${(workSecondsLeft % 60).toString().padStart(2, '0')}`;
}
workMinutesInput.addEventListener('input', () => { if (!workIsRunning) { workSecondsLeft = (parseInt(workMinutesInput.value) || 25) * 60; displayWorkClock(); } });
workStartBtn.addEventListener('click', () => {
    if (workIsRunning) { clearInterval(workInterval); workIsRunning = false; workStartBtn.innerText = "ENGAGE"; }
    else {
        workIsRunning = true; workStartBtn.innerText = "HALT";
        workInterval = setInterval(() => {
            if (workSecondsLeft > 0) { workSecondsLeft--; displayWorkClock(); }
            else { clearInterval(workInterval); workIsRunning = false; workStartBtn.innerText = "ENGAGE"; alert("Focus Run Complete!"); }
        }, 1000);
    }
});
workResetBtn.addEventListener('click', () => { clearInterval(workInterval); workIsRunning = false; workStartBtn.innerText = "ENGAGE"; workSecondsLeft = (parseInt(workMinutesInput.value) || 25) * 60; displayWorkClock(); });

// --- BREAK HOUSING INVENTORY DECK ---
window.triggerBreakActivation = function(chipId) {
    breakRegistry = breakRegistry.map(b => {
        if (b.id === chipId && b.state === 'saved') {
            b.state = 'in-use';
            activeBreakIntervals[chipId] = setInterval(() => {
                let target = breakRegistry.find(x => x.id === chipId);
                if (target && target.secondsLeft > 0) { target.secondsLeft--; renderBreakBankShelf(); }
                else {
                    clearInterval(activeBreakIntervals[chipId]); delete activeBreakIntervals[chipId];
                    breakRegistry = breakRegistry.filter(x => x.id !== chipId);
                    saveAndRefreshBreakHub(); alert("Break Expired and Archived.");
                }
            }, 1000);
        }
        return b;
    });
    saveAndRefreshBreakHub();
};

window.archiveBreakChip = function(chipId) {
    if (activeBreakIntervals[chipId]) { clearInterval(activeBreakIntervals[chipId]); delete activeBreakIntervals[chipId]; }
    breakRegistry = breakRegistry.filter(b => b.id !== chipId); saveAndRefreshBreakHub();
};

function saveAndRefreshBreakHub() {
    localStorage.setItem('breakWeeklyRegistry', JSON.stringify(breakRegistry));
    renderBreakBankShelf();
}

function renderBreakBankShelf() {
    breakShelfContainer.innerHTML = '';
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; const now = Date.now();
    breakRegistry = breakRegistry.filter(b => (now - b.timestamp) < SEVEN_DAYS_MS);
    localStorage.setItem('breakWeeklyRegistry', JSON.stringify(breakRegistry));
    
    if (breakRegistry.length === 0) { 
        breakShelfContainer.innerHTML = `<div style="font-size:11px;color:rgba(134,185,177,0.4);text-align:center;padding:10px;">INVENTORY EMPTY // ROLL SLOTS TO GENERATE BREAKS</div>`; 
        return;
    }
    
    breakRegistry.forEach(b => {
        const chip = document.createElement('div');
        chip.className = `break-chip-item ${b.state === 'in-use' ? 'state-in-use' : ''}`;
        let m = Math.floor(b.secondsLeft / 60).toString().padStart(2, '0');
        let s = (b.secondsLeft % 60).toString().padStart(2, '0');
        let displayLabel = b.state === 'in-use' ? `${m}:${s}` : `${b.durationMins}m`;
        let badgeClass = b.state === 'in-use' ? 'status-running' : 'status-saved';
        let badgeText = b.state === 'in-use' ? 'in use' : 'saved';
        let actionControls = b.state === 'saved' ? `<button class="btn-use" onclick="triggerBreakActivation('${b.id}')">Use</button>` : `<span></span>`;

        chip.innerHTML = `
            <div class="chip-meta-title">
                <span>[${displayLabel}] ${b.activityText}</span>
                <span class="chip-status-badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="chip-btn-group">
                ${actionControls}
                <button class="btn-archive" onclick="archiveBreakChip('${b.id}')">X</button>
            </div>
        `;
        breakShelfContainer.appendChild(chip);
    });
    weekLogStatus.innerText = `Active Weekly Break Blocks: ${breakRegistry.length}`;
}

// --- SLOT MACHINE ENGINE ---
const spinBtn = document.getElementById('spinButt'); const slot1Reel = document.getElementById('slot1-reel'); const slot2Reel = document.getElementById('slot2-reel'); const readout = document.getElementById('spin-readout');
window.executeRewardSequence = function() {
    if (isSpinning) return;
    if (savedInterests.length === 0 || slotTokens < 1) { readout.innerText = slotTokens < 1 ? "[LOCKED] NO TOKENS!" : "[ERROR] ADD INTERRESTS"; return; }
    
    slotTokens--; localStorage.setItem('slotTokens', slotTokens); updateTokenDisplay();
    isSpinning = true; readout.innerText = "ROLLING SLOTS...";
    
    const randomMins = Math.floor(Math.random() * 45) + 15; 
    const generatedActivity = savedInterests[Math.floor(Math.random() * savedInterests.length)];
    const matrixActivityText = parseToMatrixPattern(generatedActivity);
    
    const s1 = []; const s2 = []; 
    for (let i = 0; i < 20; i++) { 
        s1.push(savedInterests[Math.floor(Math.random() * savedInterests.length)]); 
        s2.push((Math.floor(Math.random() * 45) + 15) + "m"); 
    }
    
    s1.push(matrixActivityText); s2.push(randomMins + "m");
    slot1Reel.innerHTML = s1.map(x => `<div class="slot-tile">${x}</div>`).join(''); slot2Reel.innerHTML = s2.map(x => `<div class="slot-tile">${x}</div>`).join('');
    
    slot1Reel.style.transition = "none"; slot2Reel.style.transition = "none"; slot1Reel.style.top = "0px"; slot2Reel.style.top = "0px"; slot1Reel.offsetHeight;
    slot1Reel.style.transition = "top 2s cubic-bezier(0.1, 0.8, 0.1, 1)"; slot2Reel.style.transition = "top 2.4s cubic-bezier(0.1, 0.8, 0.1, 1)";
    slot1Reel.style.top = `${-((s1.length - 1) * 48)}px`; slot2Reel.style.top = `${-((s2.length - 1) * 48)}px`;
    
    setTimeout(() => {
        readout.innerText = `[WIN] ${matrixActivityText} // ${randomMins}m`;
        isSpinning = false;
        
        breakRegistry.push({
            id: 'BRK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            activityText: matrixActivityText,
            durationMins: randomMins,
            secondsLeft: randomMins * 60,
            state: 'saved',
            timestamp: Date.now()
        });
        saveAndRefreshBreakHub();
    }, 2500);
};
spinBtn.onclick = window.executeRewardSequence;

function renderTags() {
    tagCloud.innerHTML = '';
    savedInterests.forEach((interest, index) => {
        const chip = document.createElement('span'); chip.className = 'tag'; chip.textContent = interest;
        chip.addEventListener('click', () => { savedInterests.splice(index, 1); localStorage.setItem('userVectors', JSON.stringify(savedInterests)); renderTags(); });
        tagCloud.appendChild(chip);
    });
}

// Initial runtime boot configs
renderTags(); renderDirectives(); displayWorkClock(); renderBreakBankShelf();