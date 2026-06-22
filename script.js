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

const BLOB_COLORS = [
    '#64ffe8', '#37a1ff', '#2cff5d', '#ffa56d', '#ff8286'
];

function initBlobs() {
    blobs = [];
    const totalBlobs = 1500; 

    for (let i = 0; i < totalBlobs; i++) {
        let randomX = Math.random() * canvas.width;
        let randomY = Math.random() * canvas.height;

        blobs.push({
            baseX: randomX,
            baseY: randomY,
            x: randomX,
            y: randomY,
            vx: 0,
            vy: 0,
            radius: Math.random() * 2 + 2,
            color: BLOB_COLORS[Math.floor(Math.random() * BLOB_COLORS.length)]
        });
    }
}

document.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    blobs.forEach(b => {
        let dx = mouse.x - b.x;
        let dy = mouse.y - b.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceRadius = 200; 
        
        if (distance < forceRadius) {
            let force = (forceRadius - distance) / forceRadius;
            let angle = Math.atan2(dy, dx);
            
            b.vx -= Math.cos(angle) * force * 1.8;
            b.vy -= Math.sin(angle) * force * 1.8;
        }
        
        let homeDx = b.baseX - b.x;
        let homeDy = b.baseY - b.y;
        b.vx += homeDx * 0.07;
        b.vy += homeDy * 0.07;
        
        b.vx *= 0.85;
        b.vy *= 0.85;
        
        b.x += b.vx;
        b.y += b.vy;
        
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        
        let displacement = Math.sqrt(homeDx * homeDx + homeDy * homeDy);
        ctx.globalAlpha = Math.min(0.3 + (displacement * 0.05), 0.9);
        
        ctx.fill();
    });
    
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();


// --- FIXED: STANDARD 1-CHARACTER LEET SPEAK ONLY (FALLS BACK TO ALPHA IF > 1 CHAR) ---
const characterMatrix = {
    'A': ['4'],
    'B': ['8'],
    'C': ['0'], // standard classic fallback or 'C'
    'E': ['3'],
    'G': ['6'],
    'I': ['1'],
    'L': ['1'],
    'O': ['0'],
    'S': ['5'],
    'T': ['7'],
    'Z': ['2']
};

function parseToMatrixPattern(rawString) {
    // Keep alpha-numeric characters, strip spaces/special symbols
    const cleanStr = rawString.toUpperCase().replace(/[^A-Z0-9]/g, ''); 
    let finalOutput = "";

    for (let i = 0; i < cleanStr.length; i++) {
        const currentChar = cleanStr[i];
        
        // Follow absolute pattern: alpha -> leet -> alpha -> leet
        if (i % 2 === 1 && characterMatrix[currentChar]) {
            const variants = characterMatrix[currentChar];
            const randomVariant = variants[Math.floor(Math.random() * variants.length)];
            finalOutput += randomVariant;
        } else {
            // Falls back immediately to the original single alpha character if no 1-char leet exists
            finalOutput += currentChar;
        }
    }
    return finalOutput || cleanStr;
}

function parseToMatrixPattern(rawString) {
    const cleanStr = rawString.toUpperCase().replace(/[^A-Z0-9]/g, ''); 
    let finalOutput = "";

    for (let i = 0; i < cleanStr.length; i++) {
        const currentChar = cleanStr[i];
        
        // Strictly maintains the clean alternating Letter -> 1-Char Sign -> Letter pattern
        if (i % 2 === 1 && characterMatrix[currentChar]) {
            const variants = characterMatrix[currentChar];
            const randomVariant = variants[Math.floor(Math.random() * variants.length)];
            finalOutput += randomVariant;
        } else {
            finalOutput += currentChar;
        }
    }
    return finalOutput || cleanStr;
}


// --- DATA ENGINE ARCHITECTURE STRATEGY ---
const task = document.getElementById('task1');
const button = document.getElementById('submitButt');
const priority = document.getElementById('priority1');
const time = document.getElementById('time1');
const liveTasksList = document.getElementById('active-task-list');

let taskMatrix = JSON.parse(localStorage.getItem('systemDirectives')) || [];

function renderDirectives() {
    liveTasksList.innerHTML = '';
    taskMatrix.forEach((item, idx) => {
        const li = document.createElement('li');
        if (item.priority === 'High') li.classList.add('high-priority');
        
        li.innerHTML = `
            <div>
                <span>${item.time}-${item.matrixText}-${item.priority.toUpperCase()}</span>
            </div>
            <button onclick="clearDirective(${idx})">Resolve</button>
        `;
        liveTasksList.appendChild(li);
    });
}

button.addEventListener('click', () => {
    if (task.value.trim() === '') {
        alert('Error! Task Section Can Not be EMPTY!!!');
        return;
    }
    if (priority.value === '') {
        alert('Error! Priority section can NOT BE EMPTY!!!');
        return;
    }
    if (isNaN(parseInt(time.value)) || parseInt(time.value) <= 0){
        alert('Error! Time can not be less than 1!');
        return;
    }

    const randomizedMatrixString = parseToMatrixPattern(task.value.trim());

    taskMatrix.push({
        text: task.value.trim(),
        matrixText: randomizedMatrixString,
        priority: priority.value,
        time: time.value
    });

    localStorage.setItem('systemDirectives', JSON.stringify(taskMatrix));
    renderDirectives();

    task.value = '';
    priority.value = '';
    time.value = '';
});

window.clearDirective = function(idx) {
    taskMatrix.splice(idx, 1);
    localStorage.setItem('systemDirectives', JSON.stringify(taskMatrix));
    renderDirectives();
};


// --- PERSISTENT INTEREST MATRIX VECTOR STORAGE ---
const interestInput = document.getElementById('customInterest');
const addInterestBtn = document.getElementById('addInterestButt');
const tagCloud = document.getElementById('interestTags');
let savedInterests = JSON.parse(localStorage.getItem('userVectors')) || ["Coding", "Hardware", "Music"];

function renderTags() {
    tagCloud.innerHTML = ''; 
    savedInterests.forEach((interest, index) => {
        const chip = document.createElement('span');
        chip.className = 'tag';
        chip.textContent = interest;
        chip.addEventListener('click', () => {
            savedInterests.splice(index, 1);
            updateStorage();
        });
        tagCloud.appendChild(chip);
    });
}

function updateStorage() {
    localStorage.setItem('userVectors', JSON.stringify(savedInterests));
    renderTags(); 
}

addInterestBtn.addEventListener('click', () => {
    const value = interestInput.value.trim();
    if (value && !savedInterests.includes(value)) {
        savedInterests.push(value);
        updateStorage();
        interestInput.value = '';
    }
});

interestInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addInterestBtn.click();
});


// --- MECHANICAL VERTICAL TEXT SLOT MACHINE SLOTS ENGINE ---
let isSpinning = false;
const spinBtn = document.getElementById('spinButt');
const slot1Reel = document.getElementById('slot1-reel');
const slot2Reel = document.getElementById('slot2-reel');
const readout = document.getElementById('spin-readout');

window.executeRewardSequence = function() {
    if (isSpinning || savedInterests.length === 0) return;

    isSpinning = true;
    readout.innerText = "ENGAGING MECHANICAL SLOT LEVER...";

    const slot1Items = [];
    const slot2Items = [];
    
    for (let i = 0; i < 30; i++) {
        slot1Items.push(savedInterests[Math.floor(Math.random() * savedInterests.length)]);
        slot2Items.push((Math.floor(Math.random() * 45) + 15) + " Mins");
    }

    const targetVector = savedInterests[Math.floor(Math.random() * savedInterests.length)];
    const calculatedTime = (Math.floor(Math.random() * 45) + 30) + " Mins";

    const matrixTargetVector = parseToMatrixPattern(targetVector);

    slot1Items.push(matrixTargetVector);
    slot2Items.push(calculatedTime);

    buildReelTiles(slot1Reel, slot1Items);
    buildReelTiles(slot2Reel, slot2Items);

    slot1Reel.style.transition = "none";
    slot2Reel.style.transition = "none";
    slot1Reel.style.top = "0px";
    slot2Reel.style.top = "0px";

    slot1Reel.offsetHeight; 

    const targetOffset = -((slot1Items.length - 1) * 66); 
    
    slot1Reel.style.transition = "top 2.2s cubic-bezier(0.1, 0.8, 0.1, 1)";
    slot2Reel.style.transition = "top 2.6s cubic-bezier(0.1, 0.8, 0.1, 1)"; 
    
    slot1Reel.style.top = `${targetOffset}px`;
    slot2Reel.style.top = `${targetOffset}px`;

    setTimeout(() => {
        readout.innerText = `[WIN] VECTOR: ${matrixTargetVector.toUpperCase()} // ALLOCATION: ${calculatedTime.toUpperCase()}`;
        isSpinning = false;
    }, 2700);
};

function buildReelTiles(reelElement, itemsArray) {
    reelElement.innerHTML = '';
    itemsArray.forEach(text => {
        const tile = document.createElement('div');
        tile.className = 'slot-tile';
        tile.innerText = text;
        reelElement.appendChild(tile);
    });
}

spinBtn.onclick = window.executeRewardSequence;


// --- TOUCHSCREEN COMPATIBLE GESTURE ACCENT RESPONSE HANDLERS ---
function hookMobileGestures() {
    const targets = document.querySelectorAll('.Forum, .interest-panel');
    targets.forEach(panel => {
        panel.addEventListener('touchstart', () => {
            panel.classList.add('bubble-active');
        }, { passive: true });
        panel.addEventListener('touchend', () => {
            panel.classList.remove('bubble-active');
        }, { passive: true });
        panel.addEventListener('touchcancel', () => {
            panel.classList.remove('bubble-active');
        }, { passive: true });
    });
}

// Boot Trigger
renderTags();
renderDirectives();
hookMobileGestures();