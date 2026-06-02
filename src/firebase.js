import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, writeBatch } from 'firebase/firestore';
import { initialVendingItems } from './vendingData';

// Check for config in localStorage or environment variables
export const getStoredFirebaseConfig = () => {
  try {
    const configStr = localStorage.getItem('vending_firebase_config');
    if (configStr) return JSON.parse(configStr);
  } catch (e) {
    console.error("Failed to read Firebase config from localStorage", e);
  }
  return null;
};

export const saveStoredFirebaseConfig = (config) => {
  try {
    if (config) {
      localStorage.setItem('vending_firebase_config', JSON.stringify(config));
    } else {
      localStorage.removeItem('vending_firebase_config');
    }
    // Reload page to apply changes
    window.location.reload();
  } catch (e) {
    console.error("Failed to write Firebase config to localStorage", e);
  }
};

export const getFirebaseConfig = () => {
  // Hardcoded fallback keys for seamless out-of-the-box deployment (Firebase API keys are public by design)
  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBraQqchO129F3cKPRGNjdd6VFtwni-GA",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vending-e47b9.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vending-e47b9",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vending-e47b9.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "783599279804",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:783599279804:web:995044f8e76b2f587b3ab9",
  };

  return envConfig;
};

let db = null;
let isMock = true;

const config = getFirebaseConfig();
if (config && config.apiKey) {
  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    db = getFirestore(app);
    isMock = false;
    console.log("Firebase initialized successfully in REAL CLOUD mode.");
  } catch (error) {
    console.error("Firebase failed to initialize. Falling back to Mock mode.", error);
  }
} else {
  console.log("No active Firebase configuration found. Running in Local Mock mode.");
}

export const isDatabaseMock = () => isMock;

// Real-time listener for the vending items
export const subscribeToVendingItems = (callback) => {
  if (!isMock && db) {
    const colRef = collection(db, "vending_items");
    return onSnapshot(colRef, async (snapshot) => {
      if (snapshot.empty) {
        // Seed database
        await Promise.all(initialVendingItems.map((item) =>
          setDoc(doc(db, "vending_items", item.id), item)
        ));
        callback(initialVendingItems);
      } else {
        const items = [];
        snapshot.forEach((doc) => {
          items.push(doc.data());
        });
        items.sort((a, b) => a.id.localeCompare(b.id));
        callback(items);
      }
    }, (error) => {
      console.error("Firestore subscription error. Falling back to local mock:", error);
      setupMockSubscription(callback);
    });
  } else {
    return setupMockSubscription(callback);
  }
};

// Mock subscription utilities using LocalStorage
let mockListeners = [];

const setupMockSubscription = (callback) => {
  if (!localStorage.getItem('vending_items_mock')) {
    localStorage.setItem('vending_items_mock', JSON.stringify(initialVendingItems));
  }

  const getCurrentItems = () => {
    try {
      const data = localStorage.getItem('vending_items_mock');
      const items = data ? JSON.parse(data) : initialVendingItems;
      items.sort((a, b) => a.id.localeCompare(b.id));
      return items;
    } catch (e) {
      return initialVendingItems;
    }
  };

  callback(getCurrentItems());
  mockListeners.push(callback);

  return () => {
    mockListeners = mockListeners.filter(l => l !== callback);
  };
};

const notifyMockListeners = () => {
  try {
    const data = localStorage.getItem('vending_items_mock');
    const items = data ? JSON.parse(data) : initialVendingItems;
    items.sort((a, b) => a.id.localeCompare(b.id));
    mockListeners.forEach(listener => listener(items));
    localStorage.setItem('vending_items_last_updated', new Date().toISOString());
    window.dispatchEvent(new Event('vending_items_updated'));
  } catch (e) {
    console.error("Failed to notify mock database listeners", e);
  }
};

// Update a single item's stock status
export const updateVendingItem = async (id, inStock) => {
  const lastUpdatedTime = new Date().toISOString();
  if (!isMock && db) {
    try {
      const docRef = doc(db, "vending_items", id);
      await setDoc(docRef, { inStock, lastUpdated: lastUpdatedTime }, { merge: true });
      await setDoc(doc(db, "vending_meta", "status"), { lastUpdated: lastUpdatedTime });
    } catch (error) {
      console.error("Failed to update Firestore. Falling back to local:", error);
      updateMockVendingItem(id, inStock);
    }
  } else {
    updateMockVendingItem(id, inStock);
  }
};

const updateMockVendingItem = (id, inStock) => {
  try {
    const data = localStorage.getItem('vending_items_mock');
    const items = data ? JSON.parse(data) : [...initialVendingItems];
    const idx = items.findIndex(item => item.id === id);
    if (idx > -1) {
      items[idx].inStock = inStock;
      localStorage.setItem('vending_items_mock', JSON.stringify(items));
      notifyMockListeners();
    }
  } catch (e) {
    console.error("Failed to update mock item", e);
  }
};

// Batch update from AI results
export const batchUpdateVendingItems = async (mappings) => {
  const lastUpdatedTime = new Date().toISOString();
  if (!isMock && db) {
    try {
      const batch = writeBatch(db);
      Object.entries(mappings).forEach(([id, inStock]) => {
        const docRef = doc(db, "vending_items", id);
        batch.set(docRef, { inStock, lastUpdated: lastUpdatedTime }, { merge: true });
      });
      batch.set(doc(db, "vending_meta", "status"), { lastUpdated: lastUpdatedTime });
      await batch.commit();
      console.log("Firestore batch update completed successfully.");
    } catch (error) {
      console.error("Firestore batch update failed. Falling back to local:", error);
      batchUpdateMockVendingItems(mappings);
    }
  } else {
    batchUpdateMockVendingItems(mappings);
  }
};

const batchUpdateMockVendingItems = (mappings) => {
  try {
    const data = localStorage.getItem('vending_items_mock');
    const items = data ? JSON.parse(data) : [...initialVendingItems];
    Object.entries(mappings).forEach(([id, inStock]) => {
      const idx = items.findIndex(item => item.id === id);
      if (idx > -1) {
        items[idx].inStock = inStock;
      }
    });
    localStorage.setItem('vending_items_mock', JSON.stringify(items));
    notifyMockListeners();
  } catch (e) {
    console.error("Failed to batch update mock items", e);
  }
};

// Metadata (Last Updated tracking) listener
export const subscribeToMetadata = (callback) => {
  if (!isMock && db) {
    const docRef = doc(db, "vending_meta", "status");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        callback({ lastUpdated: new Date().toISOString() });
      }
    }, (error) => {
      console.error("Metadata Firestore subscription failed. Falling back to local:", error);
      setupMockMetadataSubscription(callback);
    });
  } else {
    return setupMockMetadataSubscription(callback);
  }
};

const setupMockMetadataSubscription = (callback) => {
  const getMeta = () => {
    const time = localStorage.getItem('vending_items_last_updated') || new Date().toISOString();
    return { lastUpdated: time };
  };
  
  callback(getMeta());

  const handleUpdate = () => {
    callback(getMeta());
  };

  window.addEventListener('vending_items_updated', handleUpdate);
  return () => {
    window.removeEventListener('vending_items_updated', handleUpdate);
  };
};
