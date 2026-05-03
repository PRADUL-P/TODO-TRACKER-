import React, { useState, useEffect } from 'react';
import storageService from '../services/storageService';
import { 
  CheckCircle2, 
  Circle, 
  Layers, 
  Plus,
  Trash2,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const BIMTracker = () => {
  const [items, setItems] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [selectedStage, setSelectedStage] = useState('Revit');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setItems(storageService.getData('BIM_PROGRESS'));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTopic) return;
    storageService.addItem('BIM_PROGRESS', {
      topic: newTopic,
      stage: selectedStage,
      completed: false
    });
    setNewTopic('');
    loadData();
  };

  const toggleStatus = (id, current) => {
    storageService.updateItem('BIM_PROGRESS', id, { completed: !current });
    loadData();
  };

  const deleteItem = (id) => {
    if (confirm('Delete topic?')) {
      storageService.deleteItem('BIM_PROGRESS', id);
      loadData();
    }
  };

  const stages = ['Revit', 'Navisworks', 'Automation', 'Standards'];
  
  const getProgressByStage = (stage) => {
    const stageItems = items.filter(i => i.stage === stage);
    if (stageItems.length === 0) return 0;
    const completed = stageItems.filter(i => i.completed).length;
    return Math.round((completed / stageItems.length) * 100);
  };

  const totalProgress = items.length > 0 
    ? Math.round((items.filter(i => i.completed).length / items.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">BIM Learning Tracker</h1>
          <p className="text-slate-500">Track your progress across core BIM competencies.</p>
        </div>
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-bold uppercase">Overall Completion</p>
            <p className="text-xl font-bold text-indigo-600">{totalProgress}%</p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative overflow-hidden">
            <div 
              className="absolute bottom-0 left-0 w-full bg-indigo-500 transition-all duration-1000" 
              style={{ height: `${totalProgress}%` }}
            />
            <span className="relative z-10 text-[10px] font-bold">{totalProgress}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stages Progress Cards */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Layers className="text-indigo-500" size={20} />
            Stages
          </h2>
          {stages.map(stage => (
            <div key={stage} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">{stage}</span>
                <span className="text-xs font-bold text-slate-400">{getProgressByStage(stage)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressByStage(stage)}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Topic List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Add Learning Topic</h2>
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Enter topic name..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
              />
              <select 
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {stages.map(s => <option key={s}>{s}</option>)}
              </select>
              <button className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                <Plus size={24} />
              </button>
            </form>
          </div>

          <div className="space-y-3">
            {items.map(item => (
              <motion.div 
                key={item.id}
                layout
                className={`flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm group ${item.completed ? 'opacity-60' : ''}`}
              >
                <button onClick={() => toggleStatus(item.id, item.completed)} className={item.completed ? 'text-green-500' : 'text-slate-300'}>
                  {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
                <div className="flex-1">
                  <h4 className={`font-semibold ${item.completed ? 'line-through text-slate-400' : ''}`}>{item.topic}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.stage}</span>
                </div>
                <button onClick={() => deleteItem(item.id)} className="p-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all">
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BIMTracker;
