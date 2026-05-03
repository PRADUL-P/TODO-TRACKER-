import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Layers, 
  GraduationCap, 
  Briefcase, 
  Database,
  Menu,
  X,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../hooks/usePWA';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isInstallable, handleInstall } = usePWA();
  const navItems = [

    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <CheckSquare size={20} />, label: 'Tasks', path: '/tasks' },
    { icon: <Layers size={20} />, label: 'BIM Tracker', path: '/bim' },
    { icon: <GraduationCap size={20} />, label: 'PSC Tracker', path: '/psc' },
    { icon: <Briefcase size={20} />, label: 'Projects', path: '/projects' },
    { icon: <Database size={20} />, label: 'Data Management', path: '/data' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -280,
          transition: { type: 'spring', damping: 20, stiffness: 100 }
        }}
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 lg:translate-x-0 transition-none`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LUDARP Tracker
            </h1>
            <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-500">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600"
                  />
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {isInstallable && (
              <button 
                onClick={handleInstall}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all"
              >
                <Download size={18} />
                <span>Install App</span>
              </button>
            )}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <p className="text-xs text-slate-500 dark:text-slate-500 uppercase tracking-wider font-semibold mb-1">Status</p>
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Offline Ready
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
