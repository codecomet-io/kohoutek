import type { ServiceAccount } from 'firebase-admin';
import type { Firestore as FirestoreType } from 'firebase-admin/firestore';

import type { Pipeline } from './model.js';

import { initializeApp, cert } from 'firebase-admin/app';

import { getFirestore } from 'firebase-admin/firestore';

import * as dotenv from 'dotenv';

import { deepCopy } from 'briznads-helpers';


export class Firestore {
	serviceAccount : ServiceAccount;
	db : FirestoreType;


	constructor() {
		this.serviceAccount = this.getServiceAccount();

		this.init();
	}


	private getServiceAccount() : ServiceAccount {
		dotenv.config();

		return {
			projectId   : process.env.FIREBASE_PROJECT_ID,
			clientEmail : process.env.FIREBASE_CLIENT_EMAIL,
			privateKey  : process.env.FIREBASE_PRIVATE_KEY,
		};
	}


	private init() : void {
		let app;

		try {
			app = initializeApp({
				databaseURL : 'https://kohoutek-349c1.firebaseio.com',
				credential  : cert(this.serviceAccount),
			});
		} catch (e) {
			console.error(e);

			return;
		}

		this.db = getFirestore(app);
	}

	async saveRun(run : Pipeline) : Promise<void> {
		// Add a new document with a generated id.
		const res = await this.db.collection('runs').add(deepCopy(run));

		console.log('Added document with ID: ', res.id);

		return;
	}
}
