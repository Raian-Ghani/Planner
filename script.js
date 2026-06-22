const canvas = document.getElementById('blob-canvas');
const ctx = canvas.getContext('2d');

let mouse = { x: -1000, y: -1000 };
let blobs = [];

//This Here resizes the canvas to fit the viewports dimensions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initBlobs();
}

const BLOB_COLORS = [
    '#64ffe8', // Your original signature teal
    '#37a1ff', // Deeper jungle teal
    '#2cff5d', // Soft mint neon
    '#ffa56d', // Dark tactical sage
    '#ff8286'  // High-brightness electric ice
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
            // Assign a random color from our array to this specific blob
            color: BLOB_COLORS[Math.floor(Math.random() * BLOB_COLORS.length)]
        });
    }
}

// Tracks Mouse Movement smoothly
document.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

// if you quickly leave the webpage this will alow the blobs to reform and not be stuck in a frosen state of activity. idk if u get what I mean.
document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

//Physics ANimation
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    blobs.forEach(b => {
        // Calculation of distance from mouse
        let dx = mouse.x - b.x;
        let dy = mouse.y - b.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        let forceRadius = 200; //how close the mouse needs to be to scare to mous . (to be honest Id be scared the second someone was scared of a mouse)
        
        if (distance < forceRadius) {
            // Push calculation
            let force = (forceRadius - distance) / forceRadius;
            let angle = Math.atan2(dy, dx);
            
            // Accelerate AWAY from cursor direction
            b.vx -= Math.cos(angle) * force * 1.8;
            b.vy -= Math.sin(angle) * force * 1.8;
        }
        
        // Code that allows them to be unscared
        let homeDx = b.baseX - b.x;
        let homeDy = b.baseY - b.y;
        b.vx += homeDx * 0.07;
        b.vy += homeDy * 0.07;
        
        // Friction and drag so that they dont move forever u can remove it if u want its SUPER FUNNY
        b.vx *= 0.85;
        b.vy *= 0.85;
        
        // Update physical position tracking
        b.x += b.vx;
        b.y += b.vy;
        
        // DRAW THE GLOWING BLOB
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        
        // FIXED: Dynamically pulls the unique color assigned to this specific blob particle
        ctx.fillStyle = b.color;
        
        // Dynamically boost brightness when pushed from home
        let displacement = Math.sqrt(homeDx * homeDx + homeDy * homeDy);
        ctx.globalAlpha = Math.min(0.3 + (displacement * 0.05), 0.9);
        
        ctx.fill();
    });
    
    requestAnimationFrame(animate);
}

// Fire up canvas initialization systems
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();

// Keep your original input forms submit validation code perfectly intact down here...
const task = document.getElementById('task1');
const button = document.getElementById('submitButt');
const priority = document.getElementById('priority1');
const time = document.getElementById('time1');

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

    // Success clearing loop
    task.value = '';
    priority.value = '';
    time.value = '';
});

// PERSISTENT INTEREST MATRIX STORAGE
const interestInput = document.getElementById('customInterest');
const addInterestBtn = document.getElementById('addInterestButt');
const tagCloud = document.getElementById('interestTags');
let savedInterests = JSON.parse(localStorage.getItem('userVectors')) || [];

function renderTags() {
    tagCloud.innerHTML = ''; // Clear layout
    savedInterests.forEach((interest, index) => {
        const chip = document.createElement('span');
        chip.className = 'tag';
        chip.textContent = interest;
        
        // Click to remove vector node
        chip.addEventListener('click', () => {
            savedInterests.splice(index, 1);
            updateStorage();
        });
        
        tagCloud.appendChild(chip);
    });
}

function updateStorage() {
    localStorage.setItem('userVectors', JSON.stringify(savedInterests));
    renderTags(); // Dynamic UI refresh
}

// 2. Event Listeners for injection
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

// 3. Initial Boot Trigger
renderTags();