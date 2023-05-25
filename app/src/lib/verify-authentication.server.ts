import type { Cookies } from '@sveltejs/kit';

import * as jose from 'jose';


export type GitHubUser = {
	id           : string;
	name         : string;
	profileImage : string;
	repos?       : string[];
};


export class VerifyAuthentication {
	private decodedToken! : jose.JWTPayload;


	constructor(cookies : Cookies, failureCallback : (msg : string) => void) {
		const token = cookies.get('access_token');

		if (!token) {
			failureCallback('access token not found');

			return;
		}

		let decoded;

		if (token) {
			decoded = jose.decodeJwt(token);
		}

		if (!decoded) {
			failureCallback('unable to decode access token');

			return;
		}

		if (this.hasTokenExpired(decoded)) {
			failureCallback('access token has expired');

			return;
		}

		this.decodedToken = decoded;
	}

	private hasTokenExpired(decoded : jose.JWTPayload) : boolean {
		const now = Date.now() / 1000;

		return (decoded.exp ?? 0) <= now;
	}

	public isAuthenticated() : boolean {
		return this.decodedToken != null;
	}

	public getGitHubUser() : GitHubUser {
		return {
			id           : this.decodedToken.sub as string,
			name         : this.decodedToken.name as string,
			profileImage : this.decodedToken.picture as string,
		};
	}

	public getPersonalAccessToken() : string {
		return this.decodedToken.forwarded_token as string;
	}
}
