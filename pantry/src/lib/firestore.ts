import type { ServiceAccount } from 'firebase-admin';
import type { Firestore as FirestoreType } from 'firebase-admin/firestore';

import type { Run } from './model.js';

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

	async saveRun(run : Run) : Promise<void> {
		try {
			// Add a new document
			await this.db.collection('runs').doc(run.id).set(deepCopy(run));
		} catch (e) {
			console.error(e);

			return;
		}

		console.info('Added document to "runs" collection with ID: ', run.id);

		return;
	}

	async getPipelineIdFromPipelineFqn(pipelineFqn : string) : Promise<undefined | string> {
		const querySnapshot = await this.db.collection('pipelines')
			.where('pipelineFqn', '==', pipelineFqn)
			.get();

		if (querySnapshot.empty) {
			return;
		}

		return querySnapshot.docs[0].id;
	}

	async savePipeline(pipelineFqn : string, id : string) : Promise<void> {
		try {
			// Add a new document
			await this.db.collection('pipelines').doc(id).set({
				id,
				pipelineFqn,
			});
		} catch (e) {
			console.error(e);

			return;
		}

		console.info('Added document to "pipelines" collection with ID: ', id);

		return;
	}
}
