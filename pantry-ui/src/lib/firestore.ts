import type { Firestore as FirestoreType } from 'firebase/firestore';

import type { Pipeline } from '../../../data_importer/src/lib/model';

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';


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
		this.init();
	}


	private init() : void {
		let app;

		try {
			app = initializeApp(this.firebaseConfig);
		} catch (e) {
			console.error(e);

			return;
		}

		this.db = getFirestore(app);
	}

	async getRun(documentId : string) : Promise<Pipeline | void> {
		const docRef = doc(this.db, 'runs', documentId);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			console.error('No such document!');

			return;
		}

		return docSnap.data() as Pipeline;
	}
}
