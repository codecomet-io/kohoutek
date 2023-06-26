import type { Cookies } from '@sveltejs/kit';

import type { GitHubUser } from '$types/user';

import * as jose from 'jose';


export class Authentication {
	private decodedToken! : jose.JWTPayload;


	constructor(cookies : Cookies, failureCallback : (msg : string) => void = () => {}) {
		const token = cookies.get('access_token');

		if (!token) {
			this.authFailed('access token not found', failureCallback);

			return;
		}

		let decoded;

		if (token) {
			decoded = jose.decodeJwt(token);
		}

		if (!decoded) {
			this.authFailed('unable to decode access token', failureCallback);

			return;
		}

		if (this.hasTokenExpired(decoded)) {
			this.authFailed('access token has expired', failureCallback);

			return;
		}

		this.decodedToken = decoded;
	}

	private authFailed(message : string, callback : (msg : string) => void) : void {
		console.error(message);

		callback(message);
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
			id                  : this.decodedToken.sub as string,
			name                : this.decodedToken.name as string,
			profileImage        : this.decodedToken.picture as string,
			personalAccessToken : this.decodedToken.forwarded_token as string,
		};
	}
}
