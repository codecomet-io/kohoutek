import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { deepCopy } from 'briznads-helpers';
export class Firestore {
    constructor() {
        this.serviceAccount = this.getServiceAccount();
        this.init();
    }
    getServiceAccount() {
        dotenv.config();
        return {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
        };
    }
    init() {
        let app;
        try {
            app = initializeApp({
                databaseURL: 'https://kohoutek-349c1.firebaseio.com',
                credential: cert(this.serviceAccount),
            });
        }
        catch (e) {
            console.error(e);
            return;
        }
        this.db = getFirestore(app);
    }
    async saveRun(run) {
        try {
            // Add a new document
            await this.db.collection('runs').doc(run.id).set(deepCopy(run));
        }
        catch (e) {
            console.error(e);
            return;
        }
        console.info('Added document with ID: ', run.id);
        return;
    }
}
//# sourceMappingURL=firestore.js.map