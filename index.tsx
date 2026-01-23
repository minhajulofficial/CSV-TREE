
import { GoogleGenAI, Type } from "@google/genai";
import { 
  auth, 
  db, 
  googleProvider,
  signInWithPopup, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  onSnapshot 
} from "./services/firebase";

// --- Configuration ---
const PLATFORMS = [
  { id: 'AdobeStock', label: 'AdobeStock', color: '#fa0f00' },
  { id: 'Freepik', label: 'Freepik', color: '#0055ff' },
  { id: 'Shutterstock', label: 'Shutterstock', color: '#e02020' },
  { id: 'Vecteezy', label: 'Vecteezy', color: '#ff7b00' },
  { id: 'General', label: 'General', color: '#64748b' }
];

// --- State Management ---
const state = {
  user: null as any,
  profile: null as any,
  authMode: 'login', // login, signup, reset
  settings: {
    mode: 'Metadata',
    engine: 'Gemini',
    platform: 'AdobeStock',
    fileType: 'Images',
    maxTitle: 18,
    maxKeywords: 45,
    deepAnalysis: true,
    safeWords: true
  },
  items: [] as any[],
  theme: localStorage.getItem('theme') || 'light' // Changed default from 'dark' to 'light'
};

// --- Initializations ---
// Core logic uses centralized firebase service

async function init() {
  setupAuth();
  setupUIListeners();
  setupAuthListeners();
  renderApp();
  applyTheme();
}

function setupAuth() {
  onAuthStateChanged(auth, async (user) => {
    state.user = user;
    const authView = document.getElementById('authView');
    const appView = document.getElementById('appView');

    if (user) {
      authView?.classList.add('hidden');
      appView?.classList.remove('hidden');
      
      const userRef = doc(db, 'users', user.uid);
      onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          state.profile = snap.data();
        } else {
          const initProfile = { credits: 100, maxCredits: 100, tier: 'Free' };
          setDoc(userRef, initProfile);
          state.profile = initProfile;
        }
        renderNavbar();
      });
    } else {
      appView?.classList.add('hidden');
      authView?.classList.remove('hidden');
      state.profile = null;
      updateAuthMode('login');
    }
    renderNavbar();
  });
}

function setupUIListeners() {
  // Theme Toggle
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', state.theme);
    applyTheme();
  });

  // File Upload
  document.getElementById('fileInput')?.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files) handleFiles(target.files);
  });
  
  // Dropzone
  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('bg-primary/5', 'border-primary/40');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('bg-primary/5', 'border-primary/40'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-primary/5', 'border-primary/40');
      if (e.dataTransfer) handleFiles(e.dataTransfer.files);
    });
  }

  // Global Buttons
  document.getElementById('exportAllBtn')?.addEventListener('click', exportBatchCSV);
  document.getElementById('clearAllBtn')?.addEventListener('click', () => {
    if (confirm('Wipe analysis hub?')) {
      state.items = [];
      updateResultsUI();
    }
  });

  // File type buttons
  document.querySelectorAll('.file-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.settings.fileType = btn.getAttribute('data-type')!;
      renderApp();
    });
  });
}

function setupAuthListeners() {
  const switchBtn = document.getElementById('authSwitchBtn');
  const forgotBtn = document.getElementById('forgotPassBtn');
  const googleBtn = document.getElementById('googleAuthBtn');
  const authForm = document.getElementById('authForm') as HTMLFormElement;

  switchBtn?.addEventListener('click', () => {
    if (state.authMode === 'login') updateAuthMode('signup');
    else updateAuthMode('login');
  });

  forgotBtn?.addEventListener('click', () => updateAuthMode('reset'));

  googleBtn?.addEventListener('click', async () => {
    try {
      showAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') showAuthError(err.message);
    }
  });

  authForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('authEmail') as HTMLInputElement;
    const passwordInput = document.getElementById('authPassword') as HTMLInputElement;
    const nameInput = document.getElementById('authName') as HTMLInputElement;
    const submitBtn = document.getElementById('authSubmitBtn') as HTMLButtonElement;

    const email = emailInput.value;
    const password = passwordInput.value;
    const name = nameInput.value;

    submitBtn.disabled = true;
    showAuthError(null);

    try {
      if (state.authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (state.authMode === 'signup') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(res.user, { displayName: name });
      } else {
        await sendPasswordResetEmail(auth, email);
        alert('Check your email for reset link.');
        updateAuthMode('login');
      }
    } catch (err: any) {
      showAuthError(err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function updateAuthMode(mode: string) {
  state.authMode = mode;
  const title = document.getElementById('authTitle');
  const subtitle = document.getElementById('authSubtitle');
  const nameField = document.getElementById('signupNameField');
  const passField = document.getElementById('passwordField');
  const submitText = document.getElementById('authSubmitText');
  const switchText = document.getElementById('authSwitchText');
  const switchBtn = document.getElementById('authSwitchBtn');

  if (!title || !subtitle) return;

  if (mode === 'login') {
    title.innerText = "Welcome Back";
    subtitle.innerText = "Enter your secure portal";
    nameField?.classList.add('hidden');
    passField?.classList.remove('hidden');
    submitText!.innerText = "Initialize Session";
    switchText!.innerText = "No terminal access?";
    switchBtn!.innerText = "Register Profile";
  } else if (mode === 'signup') {
    title.innerText = "Create Identity";
    subtitle.innerText = "Join the microstock network";
    nameField?.classList.remove('hidden');
    passField?.classList.remove('hidden');
    submitText!.innerText = "Register Operator";
    switchText!.innerText = "Already certified?";
    switchBtn!.innerText = "System Access";
  } else {
    title.innerText = "Access Recovery";
    subtitle.innerText = "Restore encrypted credentials";
    nameField?.classList.add('hidden');
    passField?.classList.add('hidden');
    submitText!.innerText = "Dispatch Link";
    switchText!.innerText = "Keys remembered?";
    switchBtn!.innerText = "Back to Login";
  }
  showAuthError(null);
}

function showAuthError(msg: string | null) {
  const errBox = document.getElementById('authError');
  const errMsg = document.getElementById('authErrorMessage');
  if (!msg) {
    errBox?.classList.add('hidden');
  } else {
    errBox?.classList.remove('hidden');
    if (errMsg) errMsg.innerText = msg;
  }
}

function applyTheme() {
  const isDark = state.theme === 'dark';
  document.documentElement.className = state.theme;
  const body = document.body;
  body.className = state.theme;
  
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) {
    themeIcon.innerHTML = isDark 
      ? '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>' 
      : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41-1.41"/>';
  }
}

function renderApp() {
  renderNavbar();
  renderSidebar();
  renderPlatforms();
  updateResultsUI();
  updateFileTypeButtons();
}

function renderNavbar() {
  const container = document.getElementById('authContainer');
  if (!container) return;
  if (state.user) {
    container.innerHTML = `
      <div class="flex items-center gap-5">
        <div class="flex flex-col items-end">
          <span class="text-[10px] font-black text-textMain uppercase tracking-wider">${state.user.displayName?.split(' ')[0] || 'Member'}</span>
          <span class="text-[8px] font-bold text-primary uppercase tracking-widest">${state.profile?.credits || 0} Credits</span>
        </div>
        <div id="profileBtn" class="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
          ${state.user.photoURL ? `<img src="${state.user.photoURL}" class="w-full h-full rounded-full">` : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'}
        </div>
      </div>
    `;
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) profileBtn.onclick = () => { if(confirm('Disconnect current session?')) signOut(auth); };
  } else {
    container.innerHTML = ``;
  }
}

function renderSidebar() {
  const container = document.getElementById('sidebarContent');
  if (!container) return;
  container.innerHTML = `
    <div>
      <label class="text-[9px] font-black text-textDim uppercase tracking-[0.4em] mb-6 block">Target Engine</label>
      <div class="flex bg-bgMain p-1 rounded-2xl border border-borderMain gap-1">
        <button class="flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${state.settings.engine === 'Gemini' ? 'bg-primary text-[#0a0c10] shadow-lg' : 'text-textDim'}" onclick="window.setEngine('Gemini')">Gemini</button>
        <button class="flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${state.settings.engine === 'Groq' ? 'bg-accent text-white shadow-lg' : 'text-textDim'}" onclick="window.setEngine('Groq')">Groq</button>
      </div>
    </div>

    <div>
      <label class="text-[9px] font-black text-textDim uppercase tracking-[0.4em] mb-8 block">Output Rules</label>
      <div class="space-y-10">
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] font-bold text-textMain uppercase tracking-widest">Title Limit</span>
            <span class="text-[11px] font-black text-primary">${state.settings.maxTitle} words</span>
          </div>
          <input type="range" min="5" max="50" value="${state.settings.maxTitle}" class="w-full" oninput="window.setSetting('maxTitle', this.value)">
        </div>
        <div>
          <div class="flex justify-between items-center mb-3">
            <span class="text-[10px] font-bold text-textMain uppercase tracking-widest">Tags Amount</span>
            <span class="text-[11px] font-black text-primary">${state.settings.maxKeywords} items</span>
          </div>
          <input type="range" min="10" max="100" value="${state.settings.maxKeywords}" class="w-full" oninput="window.setSetting('maxKeywords', this.value)">
        </div>
      </div>
    </div>

    <div>
      <label class="text-[9px] font-black text-textDim uppercase tracking-[0.4em] mb-6 block">AI Constraints</label>
      <div class="space-y-4 bg-bgMain/50 p-5 rounded-[2rem] border border-borderMain">
        ${renderToggle('Safe Filters', state.settings.safeWords, 'safeWords')}
        ${renderToggle('Deep Analysis', state.settings.deepAnalysis, 'deepAnalysis')}
      </div>
    </div>

    <div class="pt-10 border-t border-borderMain">
      <div class="p-5 rounded-[2rem] bg-primary/5 border border-primary/10">
        <div class="flex items-center gap-3 text-primary mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span class="text-[10px] font-black uppercase tracking-widest">Pricing Plan</span>
        </div>
        <p class="text-[9px] font-bold text-textDim leading-relaxed tracking-wide uppercase">Upgrade to Premium for unlimited batch extraction and custom prompts.</p>
      </div>
    </div>
  `;
}

function renderToggle(label: string, active: boolean, key: string) {
  return `
    <div class="flex items-center justify-between cursor-pointer" onclick="window.setSetting('${key}', ${!active})">
      <span class="text-[9px] font-black text-textDim uppercase tracking-widest">${label}</span>
      <div class="w-10 h-5 rounded-full border-2 transition-all relative ${active ? 'bg-primary border-primary' : 'bg-bgSidebar border-borderMain'}">
        <div class="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${active ? 'left-6' : 'left-1'}"></div>
      </div>
    </div>
  `;
}

function renderPlatforms() {
  const container = document.getElementById('platformPills');
  if (!container) return;
  container.innerHTML = PLATFORMS.map(p => {
    const active = state.settings.platform === p.id;
    return `
      <button onclick="window.setPlatform('${p.id}')" class="flex items-center gap-4 px-10 py-5 rounded-[1.75rem] border-2 transition-all whitespace-nowrap snap-center group ${active ? 'platform-pill-active' : 'border-borderMain text-textDim hover:border-primary/30'}">
        <span class="text-[11px] font-black uppercase tracking-[0.2em]">${p.label}</span>
      </button>
    `;
  }).join('');
}

function updateFileTypeButtons() {
  document.querySelectorAll('.file-type-btn').forEach(btn => {
    const active = btn.getAttribute('data-type') === state.settings.fileType;
    btn.className = `file-type-btn px-10 py-3.5 rounded-2xl text-[10px] font-black transition-all border-2 uppercase tracking-[0.3em] ${active ? 'bg-primary text-[#0a0c10] border-transparent shadow-xl scale-110' : 'border-borderMain bg-white dark:bg-bgSidebar text-textDim hover:border-primary/50'}`;
  });
}

// Global functions for inline event handlers
(window as any).setSetting = (key: string, val: any) => {
  (state.settings as any)[key] = val;
  renderSidebar();
};
(window as any).setEngine = (eng: string) => {
  state.settings.engine = eng as any;
  renderSidebar();
};
(window as any).setPlatform = (plt: string) => {
  state.settings.platform = plt as any;
  renderPlatforms();
};

async function handleFiles(files: FileList | File[] | null) {
  if (!state.user || !files) return;
  
  const filesArray = Array.from(files);
  for (const file of filesArray) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const item = {
        id: Math.random().toString(36).substr(2, 9),
        thumbnail: (e.target?.result as string) || '',
        fileName: file.name,
        status: 'processing'
      };
      state.items.unshift(item);
      updateResultsUI();
      processAI(item);
    };
    reader.readAsDataURL(file);
  }
}

async function processAI(item: any) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = item.thumbnail.split(',')[1];
    
    const prompt = `
      Analyze this image for high-end microstock metadata (Target: ${state.settings.platform}).
      Output MUST be a strict JSON object.
      Rules:
      - title: SEO optimized, approx ${state.settings.maxTitle} words.
      - keywords: exactly ${state.settings.maxKeywords} single-word tags.
      - description: Detailed summary of visual elements.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Data } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING }
          },
          required: ["title", "keywords", "description"]
        },
        temperature: 0.2
      }
    });

    const result = JSON.parse(response.text);
    
    const userRef = doc(db, 'users', state.user.uid);
    await updateDoc(userRef, { credits: increment(-1) });

    const idx = state.items.findIndex(i => i.id === item.id);
    state.items[idx] = { ...item, ...result, status: 'completed' };
    updateResultsUI();
  } catch (err) {
    console.error(err);
    const idx = state.items.findIndex(i => i.id === item.id);
    state.items[idx].status = 'error';
    updateResultsUI();
  }
}

function updateResultsUI() {
  const container = document.getElementById('resultsList');
  const resultsArea = document.getElementById('resultsArea');
  const counter = document.getElementById('statsCounter');

  if (!container || !resultsArea || !counter) return;

  if (state.items.length === 0) {
    resultsArea.classList.add('hidden');
    return;
  }

  resultsArea.classList.remove('hidden');
  const processed = state.items.filter(i => i.status === 'completed').length;
  counter.innerText = `${processed} / ${state.items.length} Files Processed`;

  container.innerHTML = state.items.map(item => `
    <div class="bg-surface border border-borderMain rounded-[3rem] overflow-hidden flex flex-col lg:flex-row min-h-[550px] shadow-2xl transition-all hover:scale-[1.01] fade-up relative group">
      <div class="absolute top-8 right-8 z-20">
         <button onclick="window.deleteItem('${item.id}')" class="p-3 rounded-2xl bg-bgMain/50 text-textDim hover:text-accent hover:bg-accent/10 transition-all opacity-0 group-hover:opacity-100">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0-1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
         </button>
      </div>
      
      <div class="w-full lg:w-[40%] border-r border-borderMain p-12 bg-bgSidebar/20 flex items-center justify-center relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
        <img src="${item.thumbnail}" class="max-w-full max-h-[350px] object-contain rounded-3xl shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-110">
      </div>

      <div class="flex-1 p-14 flex flex-col justify-between">
        ${item.status === 'processing' ? `
          <div class="flex flex-col items-center justify-center h-full gap-6">
            <div class="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div class="text-center space-y-2">
              <p class="text-[12px] font-black uppercase tracking-[0.4em] text-primary">Scanning Visual Data</p>
              <p class="text-[10px] font-bold text-textDim italic">Generating SEO-optimized metadata...</p>
            </div>
          </div>
        ` : item.status === 'error' ? `
          <div class="flex flex-col items-center justify-center h-full gap-4 text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p class="font-black uppercase text-[10px] tracking-widest">Processing failed. Check API configuration.</p>
          </div>
        ` : `
          <div class="space-y-10">
            <div class="space-y-4">
              <label class="text-[10px] font-black text-primary uppercase tracking-[0.3em] block">SEO Optimized Title</label>
              <div class="bg-bgMain p-6 rounded-2xl border border-borderMain text-sm font-bold leading-relaxed shadow-inner">${item.title}</div>
            </div>

            <div class="space-y-4">
              <label class="text-[10px] font-black text-primary uppercase tracking-[0.3em] block">Tags Container (${item.keywords?.length || 0})</label>
              <div class="flex flex-wrap gap-2.5">
                ${(item.keywords || []).map((kw: string) => `<span class="px-4 py-1.5 bg-primary/5 text-primary border border-primary/20 text-[10px] font-black rounded-xl hover:bg-primary hover:text-white transition-all cursor-default uppercase tracking-widest">${kw}</span>`).join('')}
              </div>
            </div>

            <div class="pt-8 border-t border-borderMain space-y-3">
              <label class="text-[10px] font-black text-textDim uppercase tracking-[0.3em] block">Deep Content Analysis</label>
              <p class="text-xs text-textDim leading-relaxed italic font-medium">"${item.description}"</p>
            </div>
          </div>

          <div class="flex items-center justify-end pt-10">
            <button onclick="window.copyMetadata('${item.id}')" class="px-8 py-3.5 rounded-xl bg-bgMain border border-borderMain text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy Full Metadata
            </button>
          </div>
        `}
      </div>
    </div>
  `).join('');
}

(window as any).deleteItem = (id: string) => {
  state.items = state.items.filter(i => i.id !== id);
  updateResultsUI();
};

(window as any).copyMetadata = (id: string) => {
  const item = state.items.find(i => i.id === id);
  if (!item) return;
  const text = `Title: ${item.title}\nKeywords: ${item.keywords.join(', ')}\nDescription: ${item.description}`;
  navigator.clipboard.writeText(text);
  alert('Metadata copied to clipboard!');
};

function exportBatchCSV() {
  const completed = state.items.filter(i => i.status === 'completed');
  if (completed.length === 0) return alert('No processed files to export.');
  
  const headers = ['Filename', 'Title', 'Keywords', 'Description'];
  const rows = completed.map(i => [i.fileName, i.title, i.keywords.join(', '), i.description]);
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
  
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `CSV_TREE_BATCH_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

init();
