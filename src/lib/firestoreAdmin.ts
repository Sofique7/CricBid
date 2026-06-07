import * as admin from 'firebase-admin';

const getProjectId = () => {
  const envVal = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (envVal && envVal.trim() !== '' && envVal !== 'undefined' && envVal !== 'null') {
    return envVal.trim();
  }
  return 'cricbid-demo'; // Default fallback
};

const initAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = getProjectId();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (privateKey && clientEmail) {
    // Standard service account credentials (usually set in production Vercel env)
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  // Fallback (for local development, fallback defaults or default credentials)
  return admin.initializeApp({
    projectId,
  });
};

export const adminApp = initAdmin();
export const adminDb = admin.firestore(adminApp);
