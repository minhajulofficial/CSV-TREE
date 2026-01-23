
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  signOut, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "./services/firebase";

// --- SECURITY: Change this to your actual email ---
const ADMIN_EMAIL = "admin@yourdomain.com"; 

let allUsers: any[] = [];

// --- Security Access Gate ---
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    // If not admin, boot them back to the main app
    window.location.href = "index.html";
  } else {
    // Admin verified, show dashboard
    document.getElementById('adminGate')?.classList.add('hidden');
    renderAdminUI(user);
    initAdminSync();
  }
});

function renderAdminUI(user: any) {
  const infoBox = document.getElementById('adminInfo');
  if (infoBox) {
    infoBox.innerHTML = `
      <div class="relative">
        <img src="${user.photoURL || 'https://via.placeholder.com/40'}" class="w-12 h-12 rounded-2xl border-2 border-primary/20 p-0.5">
        <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-bgMain rounded-full"></div>
      </div>
      <div class="overflow-hidden">
        <p class="text-[11px] font-black uppercase tracking-tight truncate">${user.displayName || 'System Root'}</p>
        <p class="text-[8px] text-primary font-black uppercase tracking-widest opacity-60">Level 10 Admin</p>
      </div>
    `;
  }
}

// --- Data Synchronization ---
function initAdminSync() {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('tier', 'desc'));

  onSnapshot(q, (snapshot) => {
    allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    updateDashboardStats();
    renderUserList();
  });

  // Search input listener
  document.getElementById('userSearch')?.addEventListener('input', renderUserList);
}

function updateDashboardStats() {
  const totalUsers = allUsers.length;
  const premiumUsers = allUsers.filter(u => u.tier === 'Premium').length;
  const totalCredits = allUsers.reduce((acc, u) => acc + (u.credits || 0), 0);

  const statUsers = document.getElementById('statUsers');
  const statPremium = document.getElementById('statPremium');
  const statCredits = document.getElementById('statCredits');

  if (statUsers) statUsers.innerText = totalUsers.toString();
  if (statPremium) statPremium.innerText = premiumUsers.toString();
  if (statCredits) statCredits.innerText = totalCredits.toLocaleString();
}

function renderUserList() {
  const tbody = document.getElementById('userTableBody');
  const searchVal = (document.getElementById('userSearch') as HTMLInputElement)?.value.toLowerCase() || '';
  
  if (!tbody) return;

  const filtered = allUsers.filter(u => 
    u.email?.toLowerCase().includes(searchVal) || 
    u.displayName?.toLowerCase().includes(searchVal)
  );

  tbody.innerHTML = filtered.map(user => `
    <tr class="border-b border-borderMain/30 hover:bg-white/[0.02] transition-colors group">
      <td class="px-10 py-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-primary/5 border border-borderMain flex items-center justify-center font-black text-primary text-xl">
            ${user.displayName ? user.displayName[0].toUpperCase() : 'O'}
          </div>
          <div>
            <p class="text-xs font-black uppercase tracking-tight">${user.displayName || 'Unknown Operator'}</p>
            <p class="text-[10px] text-gray-500 font-bold italic">${user.email || 'No Email'}</p>
          </div>
        </div>
      </td>
      <td class="px-10 py-8">
        <span class="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
          user.tier === 'Premium' 
            ? 'bg-primary/10 border-primary/40 text-primary' 
            : 'bg-white/5 border-borderMain text-gray-500'
        }">
          ${user.tier || 'Free'}
        </span>
      </td>
      <td class="px-10 py-8">
        <div class="space-y-1">
          <div class="flex items-baseline gap-2">
            <span class="text-lg font-black tracking-tighter tabular-nums">${user.credits || 0}</span>
            <span class="text-[9px] text-gray-600 font-black uppercase tracking-widest">Units</span>
          </div>
          <p class="text-[8px] text-gray-700 font-black uppercase">Cap: ${user.maxCredits || 100}</p>
        </div>
      </td>
      <td class="px-10 py-8 text-right space-x-3">
        <button onclick="window.adjustCredits('${user.id}', 100)" class="p-3 rounded-2xl bg-white/5 border border-borderMain hover:border-primary/50 hover:text-primary transition-all text-[9px] font-black uppercase tracking-widest">
          Refuel +100
        </button>
        <button onclick="window.toggleTier('${user.id}', '${user.tier}')" class="p-3 rounded-2xl bg-white/5 border border-borderMain hover:border-accent/50 hover:text-accent transition-all text-[9px] font-black uppercase tracking-widest">
          Switch Tier
        </button>
        <button onclick="window.wipeUser('${user.id}')" class="p-3 rounded-2xl bg-accent text-white shadow-xl shadow-accent/20 text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-90 transition-all">
          Wipe
        </button>
      </td>
    </tr>
  `).join('');
}

// --- Global Action Handlers ---

(window as any).adjustCredits = async (userId: string, amount: number) => {
  try {
    const user = allUsers.find(u => u.id === userId);
    const userRef = doc(db, 'users', userId);
    const newCredits = (user.credits || 0) + amount;
    const newMax = Math.max(user.maxCredits || 100, newCredits);
    
    await updateDoc(userRef, { 
      credits: newCredits,
      maxCredits: newMax
    });
  } catch (err) {
    alert("Command Failed: " + err);
  }
};

(window as any).toggleTier = async (userId: string, currentTier: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const newTier = currentTier === 'Premium' ? 'Free' : 'Premium';
    const newCredits = newTier === 'Premium' ? 6000 : 100;

    await updateDoc(userRef, { 
      tier: newTier,
      credits: newCredits,
      maxCredits: newCredits
    });
  } catch (err) {
    alert("Tier Shift Failed: " + err);
  }
};

(window as any).wipeUser = async (userId: string) => {
  if (confirm("Are you sure you want to PERMANENTLY WIPE this operator from the system?")) {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      alert("Wipe Failed: " + err);
    }
  }
};
