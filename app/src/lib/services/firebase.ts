import type { FirebaseApp } from 'firebase/app';

import { initializeApp } from 'firebase/app';


class Firebase {
	private firebaseConfig = {
		apiKey            : 'AIzaSyBwrlnAn2_Z7ZlzIx4ILbItv2ms2rbsf0Y',
		authDomain        : 'kohoutek-349c1.firebaseapp.com',
		projectId         : 'kohoutek-349c1',
		storageBucket     : 'kohoutek-349c1.appspot.com',
		messagingSenderId : '656530145205',
		appId             : '1:656530145205:web:c2e6121f21fd8e0b2363fc',
		measurementId     : 'G-DEHY2N61K9',
	};

	public app : FirebaseApp;


	constructor() {
		this.app = this.init() as FirebaseApp;
	}


	private init() : FirebaseApp | void {
		let app;

		try {
			app = initializeApp(this.firebaseConfig);
		} catch (e) {
			console.error(e);

			return;
		}

		return app;
	}
}

export const firebase = new Firebase();
