import React, { useState, useEffect } from 'react';
import storageService from '../services/storageService';
import { 
  GraduationCap, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2,
  BookOpen,
  Award,
  History
} from 'lucide-react';
import { motion } from 'framer-motion';

const PSCTracker = () => {
  const [items, setItems] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Quantitative Aptitude');

  useEffect(() => { loadData(); }, []);
  const loadData = () => { setItems(storageService.getData('PSC_TRACKER')); };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTopic) return;
    storageService.addItem('PSC_TRACKER', {
      topic: newTopic,
      subject: selectedSubject,
      completed: false,
      revisionCount: 0
    });
    setNewTopic('');
    loadData();
  };

  const toggleStatus = (id, current) => {
    storageService.updateItem('PSC_TRACKER', id, { completed: !current });
    loadData();
  };

  const incrementRevision = (id, currentCount) => {
    storageService.updateItem('PSC_TRACKER', id, { revisionCount: currentCount + 1 });
    loadData();
  };

  const deleteItem = (id) => {
    if (confirm('Delete topic?')) {
      storageService.deleteItem('PSC_TRACKER', id);
      loadData();
    }
  };

  const subjects = ['Quantitative Aptitude', 'Reasoning', 'GK / Current Affairs', 'English'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">PSC Exam Tracker</h1>
          <p className="text-slate-500">Master your syllabus with structured topic tracking.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
            <Award className="text-amber-500" size={24} />
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Topics Mastered</p>
              <p className="text-lg font-bold">{items.filter(i => i.completed).length} / {items.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Topic Input */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Topic</label>
              <input 
                type="text" 
                placeholder="e.g. Time and Work, Coding Decoding..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="md:w-64">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subject</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {subjects.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full md:w-auto bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-100 dark:shadow-none">
                Add to Syllabus
              </button>
            </div>
          </form>
        </div>

        {/* Syllabus by Subject */}
        {subjects.map(subject => {
          const subjectItems = items.filter(i => i.subject === subject);
          return (
            <div key={subject} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">{subject}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                  {subjectItems.filter(i => i.completed).length} / {subjectItems.length} Complete
                </p>
              </div>
              <div className="p-4 space-y-3 flex-1">
                {subjectItems.length > 0 ? subjectItems.map(item => (
                  <div key={item.id} className="group relative flex items-start gap-2">
                    <button onClick={() => toggleStatus(item.id, item.completed)} className={`mt-0.5 ${item.completed ? 'text-green-500' : 'text-slate-300'}`}>
                      {item.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {item.topic}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          onClick={() => incrementRevision(item.id, item.revisionCount)}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 flex items-center gap-1 hover:bg-slate-200"
                        >
                          <History size={8} /> Rev {item.revisionCount}
                        </button>
                      </div>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 text-center py-4 italic">No topics added</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PSCTracker;
