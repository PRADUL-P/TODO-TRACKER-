import React, { useState, useEffect } from 'react';
import storageService from '../services/storageService';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  ExternalLink,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectTracker = () => {
  const [projects, setProjects] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    status: 'In Progress',
    progress: 0,
    notes: ''
  });

  useEffect(() => { loadData(); }, []);
  const loadData = () => { setProjects(storageService.getData('PROJECTS')); };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newProject.name) return;
    storageService.addItem('PROJECTS', newProject);
    setNewProject({ name: '', status: 'In Progress', progress: 0, notes: '' });
    setShowAdd(false);
    loadData();
  };

  const updateProgress = (id, progress) => {
    storageService.updateItem('PROJECTS', id, { progress: parseInt(progress) });
    loadData();
  };

  const updateStatus = (id, status) => {
    storageService.updateItem('PROJECTS', id, { status });
    loadData();
  };

  const deleteProject = (id) => {
    if (confirm('Delete project?')) {
      storageService.deleteItem('PROJECTS', id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Management</h1>
          <p className="text-slate-500">Track milestones and progress for your major projects.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map(project => (
          <motion.div 
            key={project.id}
            layout
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
                <Briefcase size={24} />
              </div>
              <button onClick={() => deleteProject(project.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={18} />
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{project.name}</h3>
            
            <div className="flex items-center gap-3 mb-6">
              <select 
                value={project.status}
                onChange={(e) => updateStatus(project.id, e.target.value)}
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border-none ring-1 ring-inset ${
                  project.status === 'Completed' 
                    ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' 
                    : project.status === 'Not Started'
                    ? 'bg-slate-50 text-slate-600 ring-slate-200'
                    : 'bg-amber-50 text-amber-600 ring-amber-200'
                }`}
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tighter">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={project.progress} 
                onChange={(e) => updateProgress(project.id, e.target.value)}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {project.notes && (
              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <p className="text-xs text-slate-500 leading-relaxed italic">"{project.notes}"</p>
              </div>
            )}
          </motion.div>
        ))}

        {projects.length === 0 && !showAdd && (
          <div className="md:col-span-2 xl:col-span-3 text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 font-medium">No projects yet. Start by creating one!</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl"
          >
            <h2 className="text-2xl font-black mb-8">Launch New Project</h2>
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Project Title</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Enter a descriptive name..."
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-4 focus:ring-indigo-500/10 text-lg font-semibold"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Initial Notes</label>
                <textarea 
                  placeholder="Project goals, links, or context..."
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none focus:ring-4 focus:ring-indigo-500/10 min-h-[100px]"
                  value={newProject.notes}
                  onChange={(e) => setNewProject({...newProject, notes: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Dismiss
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95"
                >
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectTracker;
