const STORAGE_KEY = 'googleSheetsConfig';
const SYNC_KEY    = 'googleSheetsSyncLog';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

export const DEFAULT_CONFIG = {
  spreadsheetId: '',
  hojas: {
    stock:      { tab: 'Stock',      activa: true  },
    productos:  { tab: 'Productos',  activa: true  },
    ventas:     { tab: 'Ventas',     activa: true  },
    clientes:   { tab: 'Clientes',   activa: true  },
    vendedores: { tab: 'Vendedores', activa: false },
  },
  autoSync:     false,
  syncInterval: 60, // minutos
};

const loadSyncLog = () => {
  try { return JSON.parse(localStorage.getItem(SYNC_KEY) || '{}'); }
  catch { return {}; }
};

const saveSyncLog = (log) => localStorage.setItem(SYNC_KEY, JSON.stringify(log));

export const googleSheetsService = {

  getConfig: async () => {
    await delay(250);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CONFIG };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  },

  saveConfig: async (config) => {
    await delay(400);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return { success: true };
  },

  testConnection: async (spreadsheetId) => {
    await delay(1600);
    if (!spreadsheetId || spreadsheetId.trim().length < 20) {
      return { success: false, message: 'El ID del spreadsheet parece inválido. Debe tener al menos 20 caracteres.' };
    }
    // Mock: simula conexión exitosa
    return {
      success: true,
      spreadsheetName: 'Edhen — Stock y Ventas 2025',
      hojasTabs: ['Stock', 'Productos', 'Ventas', 'Clientes', 'Vendedores'],
    };
  },

  syncEntity: async (entityKey, tabName) => {
    await delay(2000);
    const recordCounts = {
      stock: 143, productos: 143, ventas: 17, clientes: 284, vendedores: 2,
    };
    const records = recordCounts[entityKey] ?? 0;
    const now = new Date().toISOString();

    const log = loadSyncLog();
    log[entityKey] = { syncedAt: now, records, tab: tabName, success: true };
    saveSyncLog(log);

    return { success: true, entity: entityKey, tab: tabName, records, syncedAt: now };
  },

  syncAll: async (hojas) => {
    await delay(3500);
    const now = new Date().toISOString();
    const log = loadSyncLog();
    const results = {};

    Object.entries(hojas).forEach(([key, hoja]) => {
      if (!hoja.activa) return;
      const recordCounts = { stock: 143, productos: 143, ventas: 17, clientes: 284, vendedores: 2 };
      const records = recordCounts[key] ?? 0;
      results[key] = { success: true, records, tab: hoja.tab };
      log[key] = { syncedAt: now, records, tab: hoja.tab, success: true };
    });

    saveSyncLog(log);
    return { success: true, results, syncedAt: now };
  },

  getSyncLog: () => loadSyncLog(),
};
