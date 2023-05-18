import type { Firestore as FirestoreType } from 'firebase/firestore';

import type { Run } from '../../../pantry/src/lib/model';

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';


export class Firestore {
	private db : FirestoreType;
	private firebaseConfig = {
		apiKey : "AIzaSyBwrlnAn2_Z7ZlzIx4ILbItv2ms2rbsf0Y",
		authDomain : "kohoutek-349c1.firebaseapp.com",
		projectId : "kohoutek-349c1",
		storageBucket : "kohoutek-349c1.appspot.com",
		messagingSenderId : "656530145205",
		appId : "1:656530145205:web:c2e6121f21fd8e0b2363fc",
		measurementId : "G-DEHY2N61K9",
	};


	constructor() {
		this.db = this.initDb() as FirestoreType;
	}


	private initDb() : FirestoreType | void {
		let app;

		try {
			app = initializeApp(this.firebaseConfig);
		} catch (e) {
			console.error(e);

			return;
		}

		return getFirestore(app);
	}

	async getRun(documentId : string) : Promise<Run | void> {
		const docRef = doc(this.db, 'runs', documentId);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			console.error('No such document!');

			return;
		}

		return docSnap.data() as Run;
	}

	async getRunsByPipelineId(pipelineId : string, sortByNewest : boolean = true, limitDocuments? : number, excludeRun? : string) : Promise<Run[]> {
		const collectionRef = collection(this.db, 'runs');

		const queryParameters : any[] = [
			where('pipelineId', '==', pipelineId),
		];

		if (sortByNewest) {
			queryParameters.push(orderBy('started', 'desc'));
		}

		if (limitDocuments != null) {
			queryParameters.push(limit(limitDocuments + (excludeRun ? 1 : 0)));
		}

		const q = query(collectionRef, ...queryParameters);

		const querySnapshot = await getDocs(q);

		let runs : any[] = querySnapshot.docs;

		if (excludeRun) {
			runs = runs.filter((doc) => doc.id !== excludeRun);
		}

		runs = runs
			.map((doc) => doc.data())
			.slice(0, limitDocuments);

		return runs;
	}
}
