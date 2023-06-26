import type { Firestore as FirestoreType } from 'firebase/firestore';

import type { Pipeline, Run } from '$pantry/types';

import { getFirestore, doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

import { firebase } from '$services/firebase';



export class Firestore {
	private db : FirestoreType;


	constructor() {
		this.db = getFirestore(firebase.app);
	}


	async getPipeline(id : string) : Promise<Pipeline | void> {
		const docRef = doc(this.db, 'pipelines', id);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			console.error('No such document!');

			return;
		}

		return docSnap.data() as Pipeline;
	}

	async getRun(id : string) : Promise<Run | void> {
		const docRef = doc(this.db, 'runs', id);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			console.error('No such document!');

			return;
		}

		return docSnap.data() as Run;
	}

	async getRunsByPipelineId(id : string, sortByNewest : boolean = true, limitDocuments? : number) : Promise<Run[]> {
		const collectionRef = collection(this.db, 'runs');

		const queryParameters : any[] = [
			where('pipeline.id', '==', id),
		];

		if (sortByNewest) {
			queryParameters.push(orderBy('started', 'desc'));
		}

		if (limitDocuments != null) {
			queryParameters.push(limit(limitDocuments));
		}

		const q = query(collectionRef, ...queryParameters);

		const querySnapshot = await getDocs(q);

		const docs : any[] = querySnapshot.docs;

		const runs : Run[] = docs
			.map((doc) => doc.data());

		return runs;
	}

	async getPipelinesByOrg(org : string) : Promise<Pipeline[]> {
		const collectionRef = collection(this.db, 'pipelines');

		const q = query(collectionRef, where('org', '==', org), orderBy('name'));

		const querySnapshot = await getDocs(q);

		return querySnapshot.docs
			.map((doc) => doc.data() as Pipeline);
	}
}
