import React, { useState, useEffect } from 'react';
import storageService from '../services/storageService';
import { 
  CheckCircle2, 
  Clock, 
  Layers, 
  GraduationCap, 
  Briefcase,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    tasks: { total: 0, completed: 0, pending: 0 },
    bim: { progress: 0 },
    psc: { progress: 0 },
    projects: { active: 0 }
  });

  useEffect(() => {
    const tasks = storageService.getData('TASKS');
    const bim = storageService.getData('BIM_PROGRESS');
    const psc = storageService.getData('PSC_TRACKER');
    const projects = storageService.getData('PROJECTS');

    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    
    // BIM Progress calculation
    const bimCompleted = bim.filter(i => i.completed).length;
    const bimProgress = bim.length > 0 ? Math.round((bimCompleted / bim.length) * 100) : 0;

    // PSC Progress calculation
    const pscCompleted = psc.filter(i => i.completed).length;
    const pscProgress = psc.length > 0 ? Math.round((pscCompleted / psc.length) * 100) : 0;

    setStats({
      tasks: { 
        total: tasks.length, 
        completed: completedTasks, 
        pending: tasks.length - completedTasks 
      },
      bim: { progress: bimProgress },
      psc: { progress: pscProgress },
      projects: { active: projects.filter(p => p.status === 'In Progress').length }
    });
  }, []);

  const barData = {
    labels: ['BIM', 'PSC', 'Project Tasks'],
    datasets: [
      {
        label: 'Progress %',
        data: [stats.bim.progress, stats.psc.progress, stats.tasks.total > 0 ? Math.round((stats.tasks.completed / stats.tasks.total) * 100) : 0],
        backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(147, 51, 234, 0.7)', 'rgba(245, 158, 11, 0.7)'],
        borderRadius: 8,
      },
    ],
  };

  const doughnutData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [stats.tasks.completed, stats.tasks.pending],
        backgroundColor: ['#4f46e5', '#e2e8f0'],
        borderWidth: 0,
      },
    ],
  };

  const cards = [
    { 
      label: 'Total Tasks', 
      value: stats.tasks.total, 
      sub: `${stats.tasks.completed} completed`, 
      icon: <CheckCircle2 className="text-indigo-600" />,
      color: 'bg-indigo-50 dark:bg-indigo-900/20'
    },
    { 
      label: 'BIM Progress', 
      value: `${stats.bim.progress}%`, 
      sub: 'Predefined stages', 
      icon: <Layers className="text-purple-600" />,
      color: 'bg-purple-50 dark:bg-purple-900/20'
    },
    { 
      label: 'PSC Progress', 
      value: `${stats.psc.progress}%`, 
      sub: 'Syllabus coverage', 
      icon: <GraduationCap className="text-amber-600" />,
      color: 'bg-amber-50 dark:bg-amber-900/20'
    },
    { 
      label: 'Active Projects', 
      value: stats.projects.active, 
      sub: 'Currently ongoing', 
      icon: <Briefcase className="text-emerald-600" />,
      color: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back, Pradul! Here's your productivity summary.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <TrendingUp size={18} className="text-green-500" />
          <span className="text-sm font-medium">Daily Streak: 5 days</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500 font-medium">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</h3>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Progress Distribution</h3>
          <div className="h-64">
            <Bar 
              data={barData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` } }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Task Status</h3>
          <div className="h-48 flex items-center justify-center">
            <Doughnut 
              data={doughnutData} 
              options={{ 
                cutout: '70%',
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Completed</span>
              <span className="font-semibold">{stats.tasks.completed}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Pending</span>
              <span className="font-semibold">{stats.tasks.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions / Recent Activity */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10 max-w-md">
          <h3 className="text-xl font-bold mb-2">Smart Import is here!</h3>
          <p className="text-indigo-100 mb-4 text-sm">Paste your planning text from ChatGPT or Notes and we'll automatically categorize it into BIM, PSC, and Projects.</p>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg">
            Try Paste & Convert
          </button>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-20">
          <Layers size={200} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
