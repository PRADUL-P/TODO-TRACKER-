const parserService = {
  parseText: (text) => {
    const lines = text.split('\n');
    const result = {
      tasks: [],
      bim: [],
      psc: [],
      projects: []
    };

    let currentSection = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Detect sections
      const lowerLine = trimmed.toLowerCase();
      if (lowerLine.startsWith('bim:')) {
        currentSection = 'bim';
        return;
      } else if (lowerLine.startsWith('psc:')) {
        currentSection = 'psc';
        return;
      } else if (lowerLine.startsWith('tasks:')) {
        currentSection = 'tasks';
        return;
      } else if (lowerLine.startsWith('projects:')) {
        currentSection = 'projects';
        return;
      }

      // Detect list items
      if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
        const content = trimmed.replace(/^[-*\d.]+\s*/, '');
        
        if (currentSection === 'bim') {
          // Detect stage
          let stage = 'Other';
          if (/revit/i.test(content)) stage = 'Revit';
          else if (/navis/i.test(content)) stage = 'Navisworks';
          else if (/auto/i.test(content)) stage = 'Automation';
          else if (/standard/i.test(content)) stage = 'Standards';

          result.bim.push({
            topic: content,
            stage: stage,
            completed: false
          });
        } else if (currentSection === 'psc') {
          // Detect subject
          let subject = 'GK';
          if (/quant|math|time|work|interest|ratio/i.test(content)) subject = 'Quantitative Aptitude';
          else if (/reasoning|coding|blood|direction/i.test(content)) subject = 'Reasoning';
          else if (/english|grammar|vocab/i.test(content)) subject = 'English';

          result.psc.push({
            topic: content,
            subject: subject,
            completed: false,
            revisionCount: 0
          });
        } else if (currentSection === 'tasks') {
          // Detect type
          let type = 'Personal';
          if (/bim/i.test(content)) type = 'BIM';
          else if (/psc/i.test(content)) type = 'PSC';
          else if (/proj/i.test(content)) type = 'Project';

          result.tasks.push({
            name: content,
            type: type,
            status: 'Pending',
            date: new Date().toISOString().split('T')[0],
            timeSpent: 0
          });
        } else if (currentSection === 'projects') {
          result.projects.push({
            name: content,
            status: 'In Progress',
            progress: 0,
            notes: ''
          });
        }
      }
    });

    return result;
  }
};

export default parserService;
