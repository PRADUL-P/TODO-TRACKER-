import { createIcons, LayoutDashboard, CheckSquare, Layers, GraduationCap, Briefcase, Database, Menu, X, Bell, Sun, Moon, Plus, Trash2, Download, CheckCircle2, Circle, Tag, Calendar, Clock, TrendingUp, AlertCircle, Eye, Save, ClipboardPaste, FileJson, FileSpreadsheet, Upload, History, Award, Pencil } from 'lucide';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

// --- 1. STORAGE SERVICE ---
const STORAGE_KEYS = {
  TASKS: 'ludarp_tasks',
  BIM_PROGRESS: 'ludarp_bim',
  PSC_TRACKER: 'ludarp_psc',
  PROJECTS: 'ludarp_projects'
};

const storage = {
  get: (key) => JSON.parse(localStorage.getItem(STORAGE_KEYS[key]) || '[]'),
  set: (key, data) => localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data)),
  add: (key, item) => {
    const data = storage.get(key);
    const newItem = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...item };
    data.push(newItem);
    storage.set(key, data);
    return newItem;
  },
  update: (key, id, updates) => {
    const data = storage.get(key);
    const index = data.findIndex(i => i.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      storage.set(key, data);
    }
  },
  remove: (key, id) => {
    const data = storage.get(key).filter(i => i.id !== id);
    storage.set(key, data);
  }
};

// --- 2. STATE & UI ELEMENTS ---
let currentSection = 'dashboard';
let progressChart = null;
let taskChart = null;

const sections = ['dashboard', 'tasks', 'bim', 'psc', 'projects', 'data', 'about'];
const sectionElements = sections.reduce((acc, s) => {
  acc[s] = document.getElementById(`section-${s}`);
  return acc;
}, {});

// --- 3. CORE FUNCTIONS ---
function initIcons() {
  createIcons({
    icons: { LayoutDashboard, CheckSquare, Layers, GraduationCap, Briefcase, Database, Menu, X, Bell, Sun, Moon, Plus, Trash2, Download, CheckCircle2, Circle, Tag, Calendar, Clock, TrendingUp, AlertCircle, Eye, Save, ClipboardPaste, FileJson, FileSpreadsheet, Upload, History, Award, Pencil }
  });
}

function switchSection(sectionId) {
  sections.forEach(s => {
    sectionElements[s].classList.toggle('hidden', s !== sectionId);
    const navBtn = document.querySelector(`[data-section="${s}"]`);
    navBtn.classList.toggle('active', s === sectionId);
  });
  
  currentSection = sectionId;
  document.getElementById('current-section-title').textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
  renderCurrentSection();
  
  // Close mobile sidebar
  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('sidebar-overlay').classList.add('hidden');
}

function renderCurrentSection() {
  if (currentSection === 'dashboard') renderDashboard();
  else if (currentSection === 'tasks') renderTasks();
  else if (currentSection === 'bim') renderBIM();
  else if (currentSection === 'psc') renderPSC();
  else if (currentSection === 'projects') renderProjects();
  else if (currentSection === 'data') renderData();
  else if (currentSection === 'about') { /* Section content is static in HTML */ }
  
  initIcons();
}

// --- 4. RENDERERS ---

function renderDashboard() {
  const tasks = storage.get('TASKS');
  const bim = storage.get('BIM_PROGRESS');
  const psc = storage.get('PSC_TRACKER');
  const projects = storage.get('PROJECTS');

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const bimProgress = bim.length ? Math.round((bim.filter(i => i.completed).length / bim.length) * 100) : 0;
  const pscProgress = psc.length ? Math.round((psc.filter(i => i.completed).length / psc.length) * 100) : 0;
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;

  document.getElementById('dashboard-stats').innerHTML = `
    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div class="flex items-center justify-between mb-4"><div class="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600"><i data-lucide="check-circle-2"></i></div></div>
      <p class="text-xs text-slate-500 font-bold uppercase">Total Tasks</p>
      <h3 class="text-2xl font-black mt-1">${tasks.length}</h3>
      <p class="text-[10px] text-slate-400 font-medium">${completedTasks} completed</p>
    </div>
    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div class="flex items-center justify-between mb-4"><div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600"><i data-lucide="layers"></i></div></div>
      <p class="text-xs text-slate-500 font-bold uppercase">BIM Progress</p>
      <h3 class="text-2xl font-black mt-1">${bimProgress}%</h3>
      <p class="text-[10px] text-slate-400 font-medium">Core stages</p>
    </div>
    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div class="flex items-center justify-between mb-4"><div class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600"><i data-lucide="graduation-cap"></i></div></div>
      <p class="text-xs text-slate-500 font-bold uppercase">PSC Syllabus</p>
      <h3 class="text-2xl font-black mt-1">${pscProgress}%</h3>
      <p class="text-[10px] text-slate-400 font-medium">Mock test ready</p>
    </div>
    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <div class="flex items-center justify-between mb-4"><div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600"><i data-lucide="briefcase"></i></div></div>
      <p class="text-xs text-slate-500 font-bold uppercase">Active Projects</p>
      <h3 class="text-2xl font-black mt-1">${activeProjects}</h3>
      <p class="text-[10px] text-slate-400 font-medium">Ongoing delivery</p>
    </div>
  `;

  if (progressChart) progressChart.destroy();
  if (taskChart) taskChart.destroy();

  progressChart = new Chart(document.getElementById('progressChart'), {
    type: 'bar',
    data: {
      labels: ['BIM', 'PSC', 'Projects'],
      datasets: [{ data: [bimProgress, pscProgress, projects.length ? Math.round(projects.reduce((a, b) => a + b.progress, 0) / projects.length) : 0], backgroundColor: ['#4f46e5', '#9333ea', '#f59e0b'], borderRadius: 12 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
  });

  taskChart = new Chart(document.getElementById('taskChart'), {
    type: 'doughnut',
    data: { labels: ['Done', 'Todo'], datasets: [{ data: [completedTasks, tasks.length - completedTasks], backgroundColor: ['#4f46e5', '#f1f5f9'], borderWidth: 0 }] },
    options: { cutout: '75%', plugins: { legend: { display: false } } }
  });
}

function renderTasks() {
  const tasks = storage.get('TASKS');
  const header = tasks.length > 0 ? `<div class="flex justify-between items-center mb-4 px-2"><span class="text-xs font-bold text-slate-400 uppercase tracking-widest">${tasks.length} Tasks</span><button onclick="clearAllTasks()" class="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"><i data-lucide="trash-2" size="12"></i> Clear All</button></div>` : '';
  const list = tasks.length === 0 ? '<p class="text-center py-20 text-slate-400">No tasks yet.</p>' : tasks.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(t => {
    const pColor = t.priority === 'High' ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : t.priority === 'Medium' ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    return `
    <div class="flex items-start gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group">
      <button onclick="toggleTask('${t.id}', '${t.status}')" class="mt-1 ${t.status === 'Completed' ? 'text-green-500' : 'text-slate-200 hover:text-indigo-500'}">
        <i data-lucide="${t.status === 'Completed' ? 'check-circle-2' : 'circle'}" size="24"></i>
      </button>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <h4 class="font-bold truncate ${t.status === 'Completed' ? 'line-through opacity-40' : ''}">${t.name}</h4>
          ${t.priority ? `<span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${pColor}">${t.priority}</span>` : ''}
        </div>
        ${t.notes ? `<p class="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2 ${t.status === 'Completed' ? 'opacity-40' : ''}">${t.notes}</p>` : ''}
        <div class="flex flex-wrap gap-3 mt-1">
          <span class="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><i data-lucide="tag" size="10"></i> ${t.type}</span>
          ${t.date ? `<span class="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><i data-lucide="calendar" size="10"></i> ${t.date}</span>` : ''}
          ${t.time ? `<span class="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><i data-lucide="clock" size="10"></i> ${t.time}m</span>` : ''}
        </div>
      </div>
      <div class="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
        <button onclick="renameTask('${t.id}', \`${t.name.replace(/`/g, '\\`')}\`)" title="Rename" class="text-slate-300 hover:text-amber-500 p-1"><i data-lucide="tag" size="16"></i></button>
        <button onclick="editTaskModal('${t.id}')" title="Edit" class="text-slate-300 hover:text-indigo-500 p-1"><i data-lucide="pencil" size="16"></i></button>
        <button onclick="deleteTask('${t.id}')" title="Delete" class="text-slate-300 hover:text-red-500 p-1"><i data-lucide="trash-2" size="16"></i></button>
      </div>
    </div>
  `}).join('');
  document.getElementById('task-list-container').innerHTML = header + list;
}

function renderBIM() {
  const items = storage.get('BIM_PROGRESS');
  const stages = ['Revit', 'Navisworks', 'Automation', 'Standards'];
  const progress = items.length ? Math.round((items.filter(i => i.completed).length / items.length) * 100) : 0;

  sectionElements.bim.innerHTML = `
    <div class="space-y-8">
      <div class="flex justify-between items-center"><h2 class="text-xl font-bold">BIM Tracker</h2><span class="text-lg font-black text-indigo-600">${progress}%</span></div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="space-y-4">${stages.map(s => {
          const sItems = items.filter(i => i.stage === s);
          const sProg = sItems.length ? Math.round((sItems.filter(i => i.completed).length / sItems.length) * 100) : 0;
          return `<div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800"><div class="flex justify-between mb-2"><span class="font-bold text-sm">${s}</span><span class="text-[10px] font-bold text-slate-400">${sProg}%</span></div><div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-indigo-500" style="width: ${sProg}%"></div></div></div>`;
        }).join('')}</div>
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex gap-3">
            <input id="bim-topic" type="text" placeholder="Topic..." class="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2">
            <select id="bim-stage" class="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold">${stages.map(s => `<option>${s}</option>`).join('')}</select>
            <button onclick="addBIM()" class="bg-indigo-600 text-white p-2 rounded-xl"><i data-lucide="plus"></i></button>
          </div>
          <div class="space-y-2">${items.map(i => `
            <div class="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 group">
              <button onclick="toggleBIM('${i.id}', ${i.completed})" class="${i.completed ? 'text-green-500' : 'text-slate-200'}"><i data-lucide="${i.completed ? 'check-circle-2' : 'circle'}" size="20"></i></button>
              <div class="flex-1"><p class="text-sm font-bold ${i.completed ? 'line-through opacity-40' : ''}">${i.topic}</p><span class="text-[10px] font-black uppercase text-slate-400">${i.stage}</span></div>
              <button onclick="deleteBIM('${i.id}')" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500"><i data-lucide="trash-2" size="16"></i></button>
            </div>`).join('')}</div>
        </div>
      </div>
    </div>
  `;
}

function renderPSC() {
  const items = storage.get('PSC_TRACKER');
  const subs = ['Quantitative Aptitude', 'Reasoning', 'GK / Current Affairs', 'English'];
  sectionElements.psc.innerHTML = `
    <div class="space-y-8">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3">
        <input id="psc-topic" type="text" placeholder="Topic..." class="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2">
        <select id="psc-sub" class="md:w-64 bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-bold">${subs.map(s => `<option>${s}</option>`).join('')}</select>
        <button onclick="addPSC()" class="bg-amber-500 text-white px-6 py-2 rounded-xl font-bold">Add</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${subs.map(s => `<div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden"><div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100"><h4 class="font-bold text-xs uppercase tracking-widest">${s}</h4></div><div class="p-4 space-y-2">
          ${items.filter(i => i.subject === s).map(i => `<div class="flex items-start gap-2 group"><button onclick="togglePSC('${i.id}', ${i.completed})" class="mt-0.5 ${i.completed ? 'text-green-500' : 'text-slate-200'}"><i data-lucide="${i.completed ? 'check-circle-2' : 'circle'}" size="14"></i></button><div class="flex-1"><p class="text-[11px] font-medium leading-tight ${i.completed ? 'line-through text-slate-400' : ''}">${i.topic}</p><button onclick="revPSC('${i.id}', ${i.revisionCount || 0})" class="text-[9px] font-black uppercase text-slate-400 mt-1 flex items-center gap-1"><i data-lucide="history" size="8"></i> REV ${i.revisionCount || 0}</button></div><button onclick="deletePSC('${i.id}')" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500"><i data-lucide="trash-2" size="12"></i></button></div>`).join('')}
        </div></div>`).join('')}
      </div>
    </div>
  `;
}

function renderProjects() {
  const projects = storage.get('PROJECTS');
  sectionElements.projects.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-center"><h2 class="text-xl font-bold">Projects</h2><button onclick="addProjectModal()" class="bg-indigo-600 text-white p-2 rounded-xl"><i data-lucide="plus"></i></button></div>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        ${projects.map(p => `<div class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 group"><div class="flex justify-between mb-4"><div class="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600"><i data-lucide="briefcase"></i></div><button onclick="deleteProject('${p.id}')" class="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500"><i data-lucide="trash-2" size="18"></i></button></div><h3 class="text-lg font-black mb-1">${p.name}</h3><div class="flex justify-between text-[10px] font-black text-slate-400 mt-4 uppercase"><span>Progress</span><span>${p.progress}%</span></div><input type="range" value="${p.progress}" onchange="updateProjectProgress('${p.id}', this.value)" class="w-full mt-2"></div>`).join('')}
      </div>
    </div>
  `;
}

function renderData() {
  sectionElements.data.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
        <h2 class="text-xl font-black mb-6">Backup</h2>
        <div class="flex gap-4"><button onclick="exportJSON()" class="flex-1 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl font-bold text-xs uppercase">Export JSON</button><button onclick="exportCSV()" class="flex-1 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl font-bold text-xs uppercase">Export CSV</button></div>
        <label class="mt-4 block p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center cursor-pointer text-xs font-bold text-slate-400 uppercase">Restore Backup <input type="file" onchange="importJSON(event)" class="hidden"></label>
      </div>
      <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
        <h2 class="text-xl font-black mb-2">Smart Import</h2>
        <select id="smart-import-cat" class="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-bold text-sm mb-4 outline-none">
          <option value="TASKS">Tasks Scheduler</option>
          <option value="BIM_PROGRESS">BIM Tracker</option>
          <option value="PSC_TRACKER">PSC Tracker</option>
        </select>
        <textarea id="smart-text" class="w-full h-40 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 font-mono text-xs mb-4" placeholder="Paste your syllabus or tasks here..."></textarea>
        <button onclick="smartImport()" class="w-full bg-orange-500 hover:bg-orange-600 transition-colors text-white py-4 rounded-2xl font-black uppercase tracking-widest">Import All</button>
      </div>
    </div>
  `;
}

// --- 5. WINDOW FUNCTIONS ---
window.toggleTask = (id, cur) => { storage.update('TASKS', id, { status: cur === 'Completed' ? 'Pending' : 'Completed' }); renderTasks(); initIcons(); };
window.deleteTask = (id) => { if(confirm('Delete this task?')){ storage.remove('TASKS', id); renderTasks(); initIcons(); } };
window.clearAllTasks = () => { if(confirm('WARNING: Are you sure you want to delete ALL tasks? This cannot be undone.')){ storage.set('TASKS', []); renderTasks(); initIcons(); } };

window.renameTask = (id, currentName) => {
  const m = document.getElementById('modal-container');
  const c = document.getElementById('modal-content');
  m.classList.remove('hidden');
  c.innerHTML = `
    <button onclick="document.getElementById('modal-container').classList.add('hidden')" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
      <i data-lucide="x"></i>
    </button>
    <h2 class="text-xl font-black mb-2">Rename Task</h2>
    <p class="text-xs text-slate-400 mb-6 font-medium">Change only the task name, nothing else.</p>
    <input id="rename-input" type="text" value="${currentName}" class="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-6 font-bold border-2 border-indigo-200 dark:border-indigo-800 outline-none focus:border-indigo-500 transition-colors">
    <div class="flex gap-3">
      <button onclick="document.getElementById('modal-container').classList.add('hidden')" class="flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
      <button onclick="confirmRename('${id}')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 dark:shadow-none">Rename</button>
    </div>`;
  initIcons();
  setTimeout(() => { const inp = document.getElementById('rename-input'); if(inp){ inp.focus(); inp.select(); } }, 50);
};

window.confirmRename = (id) => {
  const newName = document.getElementById('rename-input').value.trim();
  if (!newName) return;
  storage.update('TASKS', id, { name: newName });
  document.getElementById('modal-container').classList.add('hidden');
  renderTasks(); initIcons();
};

window.addTask = () => { const name = document.getElementById('t-name').value; if(!name) return; storage.add('TASKS', { name, type: document.getElementById('t-type').value, priority: document.getElementById('t-priority').value, time: document.getElementById('t-time').value, notes: document.getElementById('t-notes').value, status: 'Pending', date: document.getElementById('t-date').value }); document.getElementById('modal-container').classList.add('hidden'); renderTasks(); initIcons(); };

window.editTaskModal = (id) => {
  const t = storage.get('TASKS').find(x => x.id === id);
  if(!t) return;
  const m = document.getElementById('modal-container'); const c = document.getElementById('modal-content'); m.classList.remove('hidden');
  c.innerHTML = `
    <button onclick="document.getElementById('modal-container').classList.add('hidden')" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
      <i data-lucide="x"></i>
    </button>
    <h2 class="text-xl font-black mb-6">Edit Task</h2>
    <input id="e-name" type="text" value="${t.name}" class="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-3 font-bold border-none outline-none">
    <textarea id="e-notes" class="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-3 font-medium text-sm border-none outline-none h-20 resize-none">${t.notes || ''}</textarea>
    <div class="grid grid-cols-2 gap-3 mb-3">
      <select id="e-type" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none"><option ${t.type==='BIM'?'selected':''}>BIM</option><option ${t.type==='PSC'?'selected':''}>PSC</option><option ${t.type==='Project'?'selected':''}>Project</option><option ${t.type==='Personal'?'selected':''}>Personal</option></select>
      <select id="e-priority" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none"><option ${t.priority==='Low'?'selected':''}>Low</option><option ${t.priority==='Medium'?'selected':''}>Medium</option><option ${t.priority==='High'?'selected':''}>High</option></select>
    </div>
    <div class="grid grid-cols-2 gap-3 mb-6">
      <input id="e-date" type="date" value="${t.date || ''}" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none">
      <input id="e-time" type="number" value="${t.time || ''}" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none">
    </div>
    <button onclick="updateTask('${t.id}')" class="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 dark:shadow-none">Save Changes</button>`;
  initIcons();
};

window.updateTask = (id) => {
  const name = document.getElementById('e-name').value; if(!name) return;
  storage.update('TASKS', id, { name, type: document.getElementById('e-type').value, priority: document.getElementById('e-priority').value, time: document.getElementById('e-time').value, notes: document.getElementById('e-notes').value, date: document.getElementById('e-date').value });
  document.getElementById('modal-container').classList.add('hidden'); renderTasks(); initIcons();
};
window.addBIM = () => { const topic = document.getElementById('bim-topic').value; if(!topic) return; storage.add('BIM_PROGRESS', { topic, stage: document.getElementById('bim-stage').value, completed: false }); renderBIM(); initIcons(); };
window.toggleBIM = (id, cur) => { storage.update('BIM_PROGRESS', id, { completed: !cur }); renderBIM(); initIcons(); };
window.deleteBIM = (id) => { if(confirm('Delete?')){ storage.remove('BIM_PROGRESS', id); renderBIM(); initIcons(); } };
window.addPSC = () => { const topic = document.getElementById('psc-topic').value; if(!topic) return; storage.add('PSC_TRACKER', { topic, subject: document.getElementById('psc-sub').value, completed: false, revisionCount: 0 }); renderPSC(); initIcons(); };
window.togglePSC = (id, cur) => { storage.update('PSC_TRACKER', id, { completed: !cur }); renderPSC(); initIcons(); };
window.revPSC = (id, cur) => { storage.update('PSC_TRACKER', id, { revisionCount: cur + 1 }); renderPSC(); initIcons(); };
window.deletePSC = (id) => { if(confirm('Delete?')){ storage.remove('PSC_TRACKER', id); renderPSC(); initIcons(); } };
window.addProjectModal = () => { const m = document.getElementById('modal-container'); const c = document.getElementById('modal-content'); m.classList.remove('hidden'); c.innerHTML = `<h2 class="text-xl font-black mb-6">New Project</h2><input id="p-name" type="text" placeholder="Name..." class="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4 font-bold border-none"><button onclick="confirmProj()" class="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black">Create</button>`; };
window.confirmProj = () => { const n = document.getElementById('p-name').value; if(!n) return; storage.add('PROJECTS', { name: n, status: 'In Progress', progress: 0 }); document.getElementById('modal-container').classList.add('hidden'); renderProjects(); initIcons(); };
window.updateProjectProgress = (id, p) => { storage.update('PROJECTS', id, { progress: parseInt(p) }); renderProjects(); };
window.deleteProject = (id) => { if(confirm('Delete?')){ storage.remove('PROJECTS', id); renderProjects(); initIcons(); } };
window.exportJSON = () => { const d = { TASKS: storage.get('TASKS'), BIM: storage.get('BIM_PROGRESS'), PSC: storage.get('PSC_TRACKER'), PROJECTS: storage.get('PROJECTS') }; const b = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'ludarp_backup.json'; a.click(); };
window.exportCSV = () => { const t = storage.get('TASKS'); const c = "Name,Type,Status,Date\n" + t.map(x => `${x.name},${x.type},${x.status},${x.date}`).join("\n"); const b = new Blob([c], { type: 'text/csv' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'tasks.csv'; a.click(); };
window.importJSON = (e) => { const f = e.target.files[0]; const r = new FileReader(); r.onload = (v) => { const d = JSON.parse(v.target.result); storage.set('TASKS', d.TASKS || []); storage.set('BIM_PROGRESS', d.BIM || []); storage.set('PSC_TRACKER', d.PSC || []); storage.set('PROJECTS', d.PROJECTS || []); alert('Imported!'); renderData(); }; r.readAsText(f); };
window.smartImport = () => {
  const text = document.getElementById('smart-text').value;
  const targetCategory = document.getElementById('smart-import-cat').value;
  const lines = text.split('\n');
  let currentWeek = '';
  let currentDayOffset = 0;
  let today = new Date();
  let count = 0;

  lines.forEach(line => {
    let t = line.trim();
    if (!t) return;
    
    if (t.toUpperCase().includes('WEEK')) {
      currentWeek = t.replace(/🗓️/g, '').trim();
    } else if (t.toLowerCase().startsWith('day')) {
      let match = t.match(/day\s*(\d+)/i);
      if (match) currentDayOffset = parseInt(match[1]) - 1;
    } else if (t.includes('|') || t.startsWith('-')) {
      let parts = t.includes('|') ? t.split('|').map(s => s.trim()) : [t.replace(/^-/, '').trim()];
      let name = parts[0];
      let subject = parts[1] || 'Imported';
      let priority = parts[2] || 'Medium';
      
      if (!['High', 'Medium', 'Low'].includes(priority)) priority = 'Medium';
      
      if (targetCategory === 'TASKS') {
        let targetDate = new Date(today);
        targetDate.setDate(today.getDate() + currentDayOffset);
        storage.add('TASKS', {
          name: `${name} [${subject}]`,
          type: 'PSC',
          priority: priority,
          notes: currentWeek ? `${currentWeek} - Day ${currentDayOffset + 1}` : `Day ${currentDayOffset + 1}`,
          time: '',
          status: 'Pending',
          date: targetDate.toISOString().split('T')[0]
        });
      } else if (targetCategory === 'BIM_PROGRESS') {
        storage.add('BIM_PROGRESS', { topic: name, stage: subject !== 'Imported' ? subject : 'Revit', completed: false });
      } else if (targetCategory === 'PSC_TRACKER') {
        storage.add('PSC_TRACKER', { topic: name, subject: subject !== 'Imported' ? subject : 'GK / Current Affairs', completed: false, revisionCount: 0 });
      }
      count++;
    }
  });
  
  if (count > 0) {
    alert(`Successfully imported ${count} items into ${targetCategory}!`);
    document.getElementById('smart-text').value = '';
    renderData();
    renderTasks();
    renderBIM();
    renderPSC();
  } else {
    alert('No valid items found. Use "Topic | Subject | Priority" format.');
  }
};

document.getElementById('add-task-btn').addEventListener('click', () => {
  const m = document.getElementById('modal-container'); const c = document.getElementById('modal-content'); m.classList.remove('hidden');
  c.innerHTML = `
    <button onclick="document.getElementById('modal-container').classList.add('hidden')" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
      <i data-lucide="x"></i>
    </button>
    <h2 class="text-xl font-black mb-6">New Task</h2>
    <input id="t-name" type="text" placeholder="What's next?" class="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-3 font-bold border-none outline-none">
    <textarea id="t-notes" placeholder="Notes (optional)..." class="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-3 font-medium text-sm border-none outline-none h-20 resize-none"></textarea>
    <div class="grid grid-cols-2 gap-3 mb-3">
      <select id="t-type" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none"><option>BIM</option><option>PSC</option><option>Project</option><option>Personal</option></select>
      <select id="t-priority" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none"><option>Low</option><option selected>Medium</option><option>High</option></select>
    </div>
    <div class="grid grid-cols-2 gap-3 mb-6">
      <input id="t-date" type="date" value="${new Date().toISOString().split('T')[0]}" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none">
      <input id="t-time" type="number" placeholder="Est. Mins" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none">
    </div>
    <button onclick="addTask()" class="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 dark:shadow-none">Add Task</button>`;
  initIcons();
});

// Sidebar & Theme
const navBtns = document.querySelectorAll('[data-section]');
navBtns.forEach(b => b.addEventListener('click', () => switchSection(b.dataset.section)));
document.getElementById('theme-toggle').addEventListener('click', () => { document.documentElement.classList.toggle('dark'); document.getElementById('sun-icon').classList.toggle('hidden'); document.getElementById('moon-icon').classList.toggle('hidden'); });

// Init
switchSection('dashboard');
initIcons();

// --- 6. PWA INSTALL LOGIC ---
let deferredPrompt;
const installBtn = document.getElementById('pwa-install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI to notify the user they can add to home screen
  installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
    installBtn.classList.add('hidden');
  }
});
