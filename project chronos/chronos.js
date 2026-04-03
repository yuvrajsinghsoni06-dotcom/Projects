// --- 1. CONFIG & AUDIO ---
const dictionary = {
    productive: ['code', 'debug', 'deploy', 'git', 'study', 'read', 'gym', 'work', 'write', 'learn', 'plan', 'design', 'fix', 'build', 'test', 'math', 'project'],
    wasteful: ['netflix', 'game', 'instagram', 'tiktok', 'youtube', 'sleep', 'scroll', 'reddit', 'twitter', 'fb', 'movie', 'tv', 'chat', 'chill']
};

// --- DEFAULT AI ENTREPRENEUR ROADMAP ---
const aiEntrepreneurRoadmap = `// INIT_SEQUENCE: AI_SOLOPRENEUR_PATHWAY_v1.0
// TARGET: AGILE DEVELOPMENT & MARKET DOMINATION

[PHASE 01: FOUNDATION_LAYER]
[ ] Python Mastery (OOP, AsyncIO, Decorators)
[ ] Math For AI (Linear Algebra, Calc, Prob/Stats)
[ ] Data Engineering (Pandas, NumPy, SQL, Web Scraping)
[ ] Version Control (Git/GitHub, CI/CD Basics)

[PHASE 02: INTELLIGENCE_CORE]
[ ] Machine Learning (Scikit-Learn, Regression, Classification)
[ ] Deep Learning Basics (PyTorch or TensorFlow)
[ ] NLP Fundamentals (Tokenization, Embeddings, Transformers)
[ ] LLM Engineering (LangChain, OpenAI API, Prompt Eng, RAG)

[PHASE 03: PRODUCT_ARCHITECTURE]
[ ] Backend Engineering (FastAPI/Flask, REST/GraphQL)
[ ] Database Design (PostgreSQL, Vector DBs like Pinecone/Weaviate)
[ ] Frontend for AI (Streamlit, Next.js, React)
[ ] Deployment (Docker, AWS/GCP, Serverless, HuggingFace Spaces)

[PHASE 04: BUSINESS_SYNTHESIS]
[ ] Idea Validation (Market Research, Problem-Solution Fit)
[ ] MVP Development (Speed-to-market, "Good Enough" Code)
[ ] Monetization (Stripe Integration, SaaS Models)
[ ] Legal (Privacy Policy, Data Security, GDPR)

[PHASE 05: GROWTH_&_SCALE]
[ ] Marketing Automation (Content, SEO, Cold Email AI)
[ ] Analytics & Iteration (User Feedback Loops)
[ ] Automation (Make/Zapier Integration)
[ ] Exit Strategy or Empire Building

// STATUS: AWAITING_EXECUTION...`;

let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSfx(type) {
    initAudio(); // Try to init if not already done
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    if (type === 'type') { 
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(800 + Math.random()*200, audioCtx.currentTime); 
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime); 
        osc.start(); osc.stop(audioCtx.currentTime + 0.05); 
    }
    if (type === 'error') { 
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, audioCtx.currentTime); 
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime); 
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5); 
        osc.start(); osc.stop(audioCtx.currentTime + 0.5); 
    }
    if (type === 'success') { 
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, audioCtx.currentTime); 
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime); 
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3); 
        osc.start(); osc.stop(audioCtx.currentTime + 0.3); 
    }
    osc.connect(gain); gain.connect(audioCtx.destination);
}

// --- 2. STATE MANAGEMENT ---
let state = { 
    tasks: [], 
    health: 100, 
    xp: 0, 
    logs: [],
    roadmap: aiEntrepreneurRoadmap,
    stats: { totalCreated: 0, totalCompleted: 0, totalViolations: 0, violationLog: [] }
};

try { 
    const saved = localStorage.getItem('chronos_v2_data'); 
    if(saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
        // Safety check for stats structure in case of version migration
        if(!state.stats) state.stats = { totalCreated: 0, totalCompleted: state.xp, totalViolations: 0, violationLog: [] };
        if(!state.stats.violationLog) state.stats.violationLog = [];
        // If roadmap is empty or undefined, force the default one
        if(!state.roadmap || state.roadmap.trim() === "") state.roadmap = aiEntrepreneurRoadmap;
    }
} catch (e) { localStorage.removeItem('chronos_v2_data'); }

// --- 3. UI REFERENCES ---
const ui = {
    body: document.getElementById('main-body'),
    input: document.getElementById('cmd-input'),
    list: document.getElementById('task-list'),
    audit: document.getElementById('audit-log'),
    hpBar: document.getElementById('hp-bar'),
    hpText: document.getElementById('hp-text'),
    panel: document.getElementById('health-panel'),
    status: document.getElementById('system-status'),
    heatmap: document.getElementById('heatmap'),
    gameOver: document.getElementById('game-over'),
    contract: document.getElementById('contract-overlay'),
    
    // Views
    viewTerm: document.getElementById('view-terminal'),
    viewDash: document.getElementById('view-dashboard'),
    viewRoad: document.getElementById('view-roadmap'),
    
    // Buttons
    btnTerm: document.getElementById('btn-term'),
    btnDash: document.getElementById('btn-dash'),
    btnRoad: document.getElementById('btn-road'),
    
    // Dash Stats
    effScore: document.getElementById('efficiency-score'),
    barComp: document.getElementById('bar-completion'),
    barVio: document.getElementById('bar-violation'),
    txtComp: document.getElementById('completion-text'),
    txtVio: document.getElementById('violation-text'),
    statDone: document.getElementById('stat-done'),
    statPending: document.getElementById('stat-pending'),
    statWaste: document.getElementById('stat-waste'),
    wasteLog: document.getElementById('waste-log-list'),

    // Roadmap
    mapDisplay: document.getElementById('roadmap-display'),
    mapEditor: document.getElementById('roadmap-editor'),
    btnEditMap: document.getElementById('btn-edit-map'),
    btnSaveMap: document.getElementById('btn-save-map'),
    mapStatus: document.getElementById('roadmap-status')
};

// --- 4. NAVIGATION ---
window.switchView = (view) => {
    playSfx('type');
    
    // Hide all
    [ui.viewTerm, ui.viewDash, ui.viewRoad].forEach(el => el.classList.add('hidden'));
    [ui.btnTerm, ui.btnDash, ui.btnRoad].forEach(el => el.classList.remove('active'));

    // Show selected
    if(view === 'terminal') {
        ui.viewTerm.classList.remove('hidden');
        ui.btnTerm.classList.add('active');
    } else if (view === 'dashboard') {
        ui.viewDash.classList.remove('hidden');
        ui.btnDash.classList.add('active');
        renderDashboard();
    } else if (view === 'roadmap') {
        ui.viewRoad.classList.remove('hidden');
        ui.btnRoad.classList.add('active');
        renderRoadmap();
    }
};

// --- 5. CORE LOGIC ---
function init() {
    render(); buildHeatmap(); checkHealth(); renderLogs();
    
    // Contract Listener
    const cInput = document.getElementById('contract-input');
    if(cInput) {
        cInput.focus();
        cInput.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                initAudio(); // Initialize audio on user interaction
                if(e.target.value.toUpperCase().includes('I ACCEPT')) {
                    playSfx('success');
                    const box = document.getElementById('contract-box');
                    box.innerHTML = `
                        <div class="welcome-anim flex flex-col items-center justify-center h-full">
                            <h1 class="text-3xl md:text-5xl text-[#00ff41] font-bold mb-4 text-center tracking-tighter">WELCOME CHALLENGER</h1>
                            <p class="text-[#00f0ff] animate-pulse text-xl text-center font-bold tracking-widest">> AI_ACTIVATED</p>
                        </div>
                    `;
                    setTimeout(() => {
                        ui.contract.style.opacity = '0';
                        setTimeout(() => {
                            ui.contract.remove();
                            ui.input.focus();
                        }, 1000);
                    }, 2000);
                } else {
                    playSfx('error');
                    e.target.value = '';
                }
            }
        });
    }

    ui.input.addEventListener('keydown', () => {
        playSfx('type');
        ui.input.classList.add('typing-active');
        setTimeout(() => ui.input.classList.remove('typing-active'), 100);
    });

    setInterval(() => {
        document.getElementById('clock').innerText = new Date().toLocaleTimeString();
        
        // If game is over, stop processing damage logic
        if(state.health <= 0) return;

        let damage = 0;
        state.tasks.forEach(t => {
            if(t.total > 0 && t.running) {
                t.remaining--;
                if(t.remaining < 0) damage += 1;
            }
        });

        if(damage > 0) {
            damageSystem(damage);
            ui.status.innerText = "OVERTIME DETECTED";
            ui.status.style.color = "red";
        }

        if(state.tasks.some(t => t.running)) render();
        save();
    }, 1000);
}

document.getElementById('cmd-form').addEventListener('submit', (e) => {
    e.preventDefault();
    initAudio(); // Ensure audio context is ready
    const val = ui.input.value.trim();
    if(!val) return;

    if(val.toLowerCase() === 'rockstar') {
        ui.body.classList.add('god-mode');
        state.health = 200;
        addLog("SYSTEM", "GOD MODE ENABLED");
        ui.input.value = ''; return;
    }

    const timeMatch = val.match(/\s(\d+)(m|h|s)$/i);
    let seconds = 0;
    let text = val;
    if(timeMatch) {
        const num = parseInt(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();
        if(unit === 'm') seconds = num * 60;
        if(unit === 'h') seconds = num * 3600;
        if(unit === 's') seconds = num;
        text = val.replace(timeMatch[0], '').trim();
    }

    const isBad = dictionary.wasteful.some(w => text.toLowerCase().includes(w));
    const isGood = dictionary.productive.some(w => text.toLowerCase().includes(w));

    if(isBad) {
        damageSystem(20);
        state.stats.totalViolations++;
        state.stats.violationLog.unshift({ text: text, time: new Date().toLocaleTimeString() });
        ui.body.classList.add('shake-screen');
        setTimeout(()=>ui.body.classList.remove('shake-screen'), 500);
        addLog("VIOLATION", `BLOCKED: ${text}`);
    } else {
        state.stats.totalCreated++;
        state.tasks.push({ 
            id: Date.now(), 
            text: text, 
            total: seconds, 
            remaining: seconds, 
            running: seconds > 0, 
            type: isGood ? "OPTIMIZED" : "THREAD" 
        });
        if(isGood) healSystem(5);
        addLog("SYSTEM", `ALLOCATED: ${text}`);
    }

    ui.input.value = '';
    save(); render();
});

// --- 6. ACTIONS & DASHBOARD CALCS ---
window.toggleTimer = (id) => {
    const t = state.tasks.find(x => x.id === id);
    if(t) { t.running = !t.running; save(); render(); }
};

window.completeTask = (id) => {
    const t = state.tasks.find(x => x.id === id);
    if(t) addLog("SUCCESS", `COMPLETED: ${t.text}`);
    state.stats.totalCompleted++;
    state.xp++;
    state.tasks = state.tasks.filter(t => t.id !== id);
    healSystem(10);
    save(); render(); buildHeatmap();
};

window.deleteTask = (id) => {
    state.tasks = state.tasks.filter(t => t.id !== id);
    damageSystem(5);
    addLog("FAILURE", "TASK ABORTED");
    save(); render();
};

function renderDashboard() {
    const s = state.stats;
    const pending = state.tasks.length;
    const totalActions = s.totalCompleted + s.totalViolations + pending;

    let efficiency = 0;
    let completionRate = 0;
    let violationRate = 0;

    if (totalActions > 0) {
        const denominator = (s.totalCompleted + s.totalViolations) || 1;
        efficiency = Math.floor((s.totalCompleted / denominator) * 100);
        completionRate = Math.floor((s.totalCompleted / totalActions) * 100);
        violationRate = Math.floor((s.totalViolations / totalActions) * 100);
    }

    ui.effScore.innerText = `${efficiency}%`;
    ui.effScore.style.color = efficiency > 70 ? 'var(--term-green)' : (efficiency < 40 ? 'red' : 'var(--term-gold)');
    
    ui.barComp.style.width = `${completionRate}%`;
    ui.txtComp.innerText = `${completionRate}%`;
    
    ui.barVio.style.width = `${violationRate}%`;
    ui.txtVio.innerText = `${violationRate}%`;

    ui.statDone.innerText = s.totalCompleted;
    ui.statPending.innerText = pending;
    ui.statWaste.innerText = s.totalViolations;

    ui.wasteLog.innerHTML = '';
    if(s.violationLog) {
        s.violationLog.slice(0, 20).forEach(v => {
            const row = document.createElement('div');
            row.className = "flex justify-between border-b border-gray-900 pb-1 text-red-400";
            row.innerHTML = `<span>> ${v.text.toUpperCase()}</span> <span>${v.time}</span>`;
            ui.wasteLog.appendChild(row);
        });
    }
}

// --- 7. ROADMAP LOGIC ---
function renderRoadmap() {
    if(state.roadmap && state.roadmap.trim() !== "") {
        ui.mapDisplay.innerText = state.roadmap;
        ui.mapEditor.value = state.roadmap;
    } else {
        ui.mapDisplay.innerText = aiEntrepreneurRoadmap;
        ui.mapEditor.value = aiEntrepreneurRoadmap;
        // Auto-fix state if empty
        state.roadmap = aiEntrepreneurRoadmap;
        save();
    }
}

window.toggleRoadmapEdit = () => {
    playSfx('type');
    const isEditing = !ui.mapEditor.classList.contains('hidden');
    
    if(isEditing) {
        ui.mapDisplay.classList.remove('hidden');
        ui.mapEditor.classList.add('hidden');
        ui.btnEditMap.classList.remove('hidden');
        ui.btnSaveMap.classList.add('hidden');
        ui.mapStatus.innerText = "MODE: READ_ONLY";
    } else {
        ui.mapDisplay.classList.add('hidden');
        ui.mapEditor.classList.remove('hidden');
        ui.btnEditMap.classList.add('hidden');
        ui.btnSaveMap.classList.remove('hidden');
        ui.mapStatus.innerText = "MODE: WRITE_ACCESS";
        ui.mapEditor.focus();
    }
};

window.saveRoadmapContent = () => {
    state.roadmap = ui.mapEditor.value;
    save();
    playSfx('success');
    renderRoadmap();
    
    ui.mapDisplay.classList.remove('hidden');
    ui.mapEditor.classList.add('hidden');
    ui.btnEditMap.classList.remove('hidden');
    ui.btnSaveMap.classList.add('hidden');
    ui.mapStatus.innerText = "MODE: READ_ONLY";
    
    addLog("SYSTEM", "ROADMAP UPDATED");
};


// --- 8. HELPERS ---
function damageSystem(amt) {
    state.health = Math.max(0, state.health - amt);
    checkHealth();
}
function healSystem(amt) {
    state.health = Math.min(ui.body.classList.contains('god-mode')?200:100, state.health + amt);
    checkHealth();
}

function checkHealth() {
    ui.hpBar.style.width = Math.min(100, state.health) + "%";
    ui.hpText.innerText = Math.floor(state.health) + "%";
    if(state.health <= 0) {
        ui.gameOver.style.display = 'flex';
    } else if (state.health < 30) {
        ui.panel.classList.add('critical-alert');
        ui.hpBar.style.backgroundColor = "red";
        ui.status.innerText = "KERNEL PANIC";
    } else {
        ui.panel.classList.remove('critical-alert');
        ui.hpBar.style.backgroundColor = ""; 
        ui.status.innerText = "OPTIMAL";
        ui.gameOver.style.display = 'none';
    }
}

function addLog(type, msg) {
    const time = new Date().toLocaleTimeString().split(' ')[0];
    state.logs.unshift({time, type, msg});
    if(state.logs.length > 50) state.logs.pop();
    renderLogs();
}

function renderLogs() {
    ui.audit.innerHTML = '';
    state.logs.forEach(l => {
        const d = document.createElement('div');
        let c = 'text-gray-500';
        if(l.type==='VIOLATION'||l.type==='FAILURE') c='text-red-500';
        if(l.type==='SUCCESS') c='text-[#00ff41]';
        d.className = `flex gap-2 ${c}`;
        d.innerHTML = `<span>[${l.time}]</span> <b>${l.type}</b> <span>${l.msg}</span>`;
        ui.audit.appendChild(d);
    });
}

function formatTime(s) {
    if(s <= 0) return "00:00:00";
    const m = Math.floor(s/60).toString().padStart(2,'0');
    const sec = (s%60).toString().padStart(2,'0');
    return `00:${m}:${sec}`;
}

function render() {
    ui.list.innerHTML = '';
    state.tasks.forEach(t => {
        const el = document.createElement('div');
        let timeStr = "", timeClass = "text-gray-500";
        if(t.total > 0) {
            if(t.remaining < 0) {
                timeStr = "OVERTIME " + formatTime(Math.abs(t.remaining));
                timeClass = "text-red-500 font-bold animate-pulse";
            } else {
                timeStr = formatTime(t.remaining);
                if(t.running) timeClass = "text-[#00f0ff]";
            }
        }
        el.className = `p-2 border border-gray-700 flex justify-between items-center bg-black hover:bg-gray-900 transition ${t.type==='OPTIMIZED'?'border-l-4 border-l-current':''}`;
        el.innerHTML = `
            <div class="flex flex-col">
                <span>> ${t.text}</span>
                <span class="text-xs font-mono ${timeClass}">${timeStr}</span>
            </div>
            <div class="flex gap-2 text-xs">
                ${t.total > 0 ? `<button onclick="toggleTimer(${t.id})" class="hover:text-white">[${t.running?'PAUSE':'START'}]</button>` : ''}
                <button onclick="completeTask(${t.id})" class="hover:text-white text-green-500">[DONE]</button>
                <button onclick="deleteTask(${t.id})" class="hover:text-white text-red-500">[X]</button>
            </div>
        `;
        ui.list.appendChild(el);
    });
}

function buildHeatmap() {
    ui.heatmap.innerHTML = '';
    for(let i=0; i<100; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if(i < state.xp) cell.classList.add('cell-active');
        ui.heatmap.appendChild(cell);
    }
}

function save() { localStorage.setItem('chronos_v2_data', JSON.stringify(state)); }
window.factoryReset = () => { if(confirm("WIPE DATA?")) { localStorage.removeItem('chronos_v2_data'); location.reload(); } };

init();