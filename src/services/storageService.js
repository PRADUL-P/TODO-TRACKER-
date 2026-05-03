const STORAGE_KEYS = {
  TASKS: 'ludarp_tasks',
  BIM_PROGRESS: 'ludarp_bim',
  PSC_TRACKER: 'ludarp_psc',
  PROJECTS: 'ludarp_projects',
  SETTINGS: 'ludarp_settings'
};

const storageService = {
  getData: (key) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS[key] || key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from LocalStorage:', error);
      return [];
    }
  },

  setData: (key, data) => {
    try {
      localStorage.setItem(STORAGE_KEYS[key] || key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error writing to LocalStorage:', error);
      return false;
    }
  },

  updateItem: (key, id, updatedItem) => {
    const data = storageService.getData(key);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updatedItem };
      return storageService.setData(key, data);
    }
    return false;
  },

  deleteItem: (key, id) => {
    const data = storageService.getData(key);
    const filtered = data.filter(item => item.id !== id);
    return storageService.setData(key, filtered);
  },

  addItem: (key, item) => {
    const data = storageService.getData(key);
    const newItem = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...item
    };
    data.push(newItem);
    storageService.setData(key, data);
    return newItem;
  },

  exportAll: () => {
    const allData = {};
    Object.keys(STORAGE_KEYS).forEach(key => {
      allData[key] = storageService.getData(key);
    });
    return allData;
  },

  importAll: (allData) => {
    try {
      Object.keys(allData).forEach(key => {
        if (STORAGE_KEYS[key]) {
          storageService.setData(key, allData[key]);
        }
      });
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
};

export default storageService;
