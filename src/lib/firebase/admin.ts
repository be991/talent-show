import * as admin from 'firebase-admin';

const getAdminApp = () => {
  if (admin.apps.length) return admin.apps[0];
  
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Firebase Admin environment variables are missing.');
    }
    return null;
  }

  try {
    const initializedApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    
    // Set settings
    initializedApp.firestore().settings({ ignoreUndefinedProperties: true });
    
    return initializedApp;
  } catch (error) {
    console.error('❌ Firebase admin initialization error:', error);
    return null;
  }
};

const app = getAdminApp();

// Use dummy objects during build if app initialization failed
export const adminDb = app ? app.firestore() : {
  collection: () => ({
    where: () => ({ get: async () => ({ docs: [], size: 0, forEach: () => {} }), limit: () => ({ get: async () => ({ docs: [], size: 0, forEach: () => {} }) }) }),
    add: async () => ({ id: 'dummy' }),
    doc: () => ({ get: async () => ({ exists: false, data: () => null }), update: async () => {}, set: async () => {} }),
    orderBy: () => ({ limit: () => ({ get: async () => ({ docs: [] }) }), get: async () => ({ docs: [] }) }),
    get: async () => ({ docs: [], size: 0, forEach: () => {} }),
  })
} as any;

export const adminAuth = app ? app.auth() : {
  verifyIdToken: async () => { throw new Error('Firebase Admin not initialized'); },
  getUser: async () => { throw new Error('Firebase Admin not initialized'); },
} as any;

export const adminField = admin.firestore.FieldValue;
export { admin };
