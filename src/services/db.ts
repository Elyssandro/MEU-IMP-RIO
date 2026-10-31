/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameSaveData } from '../types/game';

const DB_NAME = 'MeuImperioDB';
const DB_VERSION = 1;
const STORE_NAME = 'save_slots';
const PRIMARY_KEY = 'main_save';
const LOCAL_STORAGE_KEY = 'meu_imperio_save_backup';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      return reject(new Error('IndexedDB não suportado neste navegador'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveGame(saveData: GameSaveData): Promise<void> {
  const payload = {
    id: PRIMARY_KEY,
    ...saveData,
    lastSavedAt: new Date().toISOString(),
  };

  // Salvar no IndexedDB
  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putRequest = store.put(payload);
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    });
  } catch (err) {
    console.warn('Falha ao gravar no IndexedDB, usando fallback:', err);
  }

  // Backup redundante no localStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
  } catch (lsErr) {
    console.warn('Falha ao sincronizar localStorage:', lsErr);
  }
}

export async function loadGame(): Promise<GameSaveData | null> {
  // 1. Tentar ler do IndexedDB
  try {
    const db = await openIndexedDB();
    const result = await new Promise<GameSaveData | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getRequest = store.get(PRIMARY_KEY);
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          const { id, ...data } = getRequest.result;
          resolve(data as GameSaveData);
        } else {
          resolve(null);
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });

    if (result) return result;
  } catch (err) {
    console.warn('Tentativa IndexedDB falhou, buscando localStorage:', err);
  }

  // 2. Fallback para localStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      const parsed = JSON.parse(local);
      const { id, ...data } = parsed;
      return data as GameSaveData;
    }
  } catch (e) {
    console.error('Erro ao ler localStorage:', e);
  }

  return null;
}

export async function hasSavedGame(): Promise<boolean> {
  const save = await loadGame();
  return save !== null;
}

export async function deleteSave(): Promise<void> {
  try {
    const db = await openIndexedDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(PRIMARY_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Erro ao deletar IndexedDB:', e);
  }

  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.warn('Erro ao limpar localStorage:', e);
  }
}
