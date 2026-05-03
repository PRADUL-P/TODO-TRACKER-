import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import BIMTracker from './pages/BIMTracker';
import PSCTracker from './pages/PSCTracker';
import ProjectTracker from './pages/ProjectTracker';
import ImportExport from './pages/ImportExport';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/bim" element={<BIMTracker />} />
          <Route path="/psc" element={<PSCTracker />} />
          <Route path="/projects" element={<ProjectTracker />} />
          <Route path="/data" element={<ImportExport />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
