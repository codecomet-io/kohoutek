import type { ServiceAccount } from 'firebase-admin';
import type { Firestore as FirestoreType } from 'firebase-admin/firestore';
import type { AnyMap } from 'briznads-helpers';

import type { Run, Pipeline, PipelineStats } from './model.js';

import { initializeApp, cert } from 'firebase-admin/app';

import { getFirestore } from 'firebase-admin/firestore';

import * as dotenv from 'dotenv';

import { deepCopy, objectEntries } from 'briznads-helpers';


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

	async getPipelineByFqn(fqn : string) : Promise<undefined | Pipeline> {
		const querySnapshot = await this.db.collection('pipelines')
			.where('fqn', '==', fqn)
			.get();

		if (querySnapshot.empty) {
			return;
		}

		return querySnapshot.docs[0]?.data() as Pipeline;
	}

	async savePipeline(pipeline : Pipeline) : Promise<void> {
		try {
			// Add a new document
			await this.db.collection('pipelines').doc(pipeline.id).set(pipeline);
		} catch (e) {
			console.error(e);

			return;
		}

		console.info('Added document to "pipelines" collection with ID: ', pipeline.id);

		return;
	}

	async updatePipeline(id : string, updates : AnyMap, stats : PipelineStats) : Promise<Pipeline> {
		const ref = this.db.collection('pipelines').doc(id);

		let pipeline : Pipeline;

		try {
			await this.db.runTransaction(async (transaction) => {
				const currentPipeline : Pipeline = (await transaction.get(ref)).data() as Pipeline;

				const pipelineStats = this.parsePipelineStats(currentPipeline, stats);

				pipeline = {
					...currentPipeline,
					...updates,
					...pipelineStats,
				};

				transaction.update(ref, { ...updates, ...pipelineStats });
			});

			console.info('Updated Pipeline with ID: ', id);
		} catch (e) {
			console.log('Transaction failure:', e);
		}

		return pipeline;
	}

	private parsePipelineStats(pipeline : Pipeline, stats : PipelineStats) : PipelineStats {
		for (const [ key, value ] of objectEntries(stats)) {
			if (typeof value === 'number') {
				stats[ key ] += pipeline[ key ];
			} else if (typeof value === 'object') {
				for (const [ mapKey, mapValue ] of objectEntries(value)) {
					if (pipeline[ key ][ mapKey ] == null) {
						pipeline[ key ][ mapKey ] = mapValue;
					} else if (key === 'actorsMap') {
						pipeline[ key ][ mapKey as string ].count += mapValue.count;
					} else {
						pipeline[ key ][ mapKey ] += mapValue;
					}
				}

				stats[ key ] = pipeline[ key ];
			}
		}

		return stats;
	}
}
