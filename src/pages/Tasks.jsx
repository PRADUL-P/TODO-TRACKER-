import React, { useState, useEffect } from 'react';
import storageService from '../services/storageService';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Filter, 
  Calendar,
  Tag,
  Search,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTask, setNewTask] = useState({
    name: '',
    type: 'Personal',
    date: new Date().toISOString().split('T')[0],
    timeSpent: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    setTasks(storageService.getData('TASKS'));
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.name) return;
    storageService.addItem('TASKS', {
      ...newTask,
      status: 'Pending',
      timeSpent: parseInt(newTask.timeSpent) || 0
    });
    setNewTask({ name: '', type: 'Personal', date: new Date().toISOString().split('T')[0], timeSpent: '' });
    setShowAddModal(false);
    loadTasks();
  };

  const toggleTaskStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    storageService.updateItem('TASKS', id, { status: newStatus });
    loadTasks();
  };

  const deleteTask = (id) => {
    if (window.confirm('Delete this task?')) {
      storageService.deleteItem('TASKS', id);
      loadTasks();
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filterType === 'All' || task.type === filterType;
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const types = ['All', 'BIM', 'PSC', 'Project', 'Personal'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Task Scheduler</h1>
          <p className="text-slate-500 text-sm">Manage your daily priorities and track time.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus size={18} />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === type 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border ${
                  task.status === 'Completed' 
                  ? 'border-slate-100 dark:border-slate-800 opacity-60' 
                  : 'border-slate-200 dark:border-slate-800'
                } flex items-center gap-4 group transition-all`}
              >
                <button 
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                  className={`flex-shrink-0 transition-colors ${
                    task.status === 'Completed' ? 'text-green-500' : 'text-slate-300 hover:text-indigo-500'
                  }`}
                >
                  {task.status === 'Completed' ? <CheckCircle size={24} /> : <Circle size={24} />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-slate-800 dark:text-white truncate ${
                    task.status === 'Completed' ? 'line-through' : ''
                  }`}>
                    {task.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag size={12} /> {task.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {task.date}
                    </span>
                    {task.timeSpent > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {task.timeSpent} mins
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-slate-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">No tasks found</h3>
              <p className="text-slate-500 text-sm mt-1">Add a new task to get started!</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-6">Create New Task</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Task Name</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="What needs to be done?"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                  value={newTask.name}
                  onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                    value={newTask.type}
                    onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                  >
                    <option>BIM</option>
                    <option>PSC</option>
                    <option>Project</option>
                    <option>Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                    value={newTask.date}
                    onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Time Spent (mins)</label>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                  value={newTask.timeSpent}
                  onChange={(e) => setNewTask({...newTask, timeSpent: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  Save Task
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
