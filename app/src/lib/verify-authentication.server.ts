import type { Cookies } from '@sveltejs/kit';

import * as jose from 'jose';
import type {JWTVerifyResult} from "jose";


export type GitHubUser = {
	id                  : string;
	name                : string;
	profileImage        : string;
	personalAccessToken : string;
	repos?              : string[];
};

// This MUST be put into some form of configuration - this one is the public key for the local dev server
const pubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxl8JsSmJk1a2oAsbtSzp
Ci66GgNsIfGDZ7MykrUJSr7i2W4g33mgT/rXW7KdoVsrJJslMMtOgTsKA/PpT59P
JkF3/WCWjSD5BwGFBqWX9LfVeBF3BP/d8z9RGMfbIqS9Px785PZSr1rsQUezH8tr
z8IioML7yRcvGIPCjY8GLLXNYHPsWLjfmYqfZC6kTapFj9yKjSu2LuqRDNjDKFCH
j8KBTVyFjYV9EsAFs4ndJqf/IcDqVchyxivXq53IvVpAfA3ig6EQzJDK1RrLskAL
sThoXq1j1m3ha2GZwXozEA5miziA6zboNy+sZlBpyX56bq0DHQpjlXw6GLtQqNNA
eQIDAQAB
-----END PUBLIC KEY-----`;

// And this one is the staging one:
/*
const pubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyWStRb9i+hGWb6ZrCc1l
3DOXIwpyNGIss2yUtAt/42EqWeuPZTNNztXe5ZlWJH6jYsFREU9IsbQI+6itNqRi
44I2tJat1r6OXse4OwroTSmNG4CluoVQkNgdJa3LoJyHOlAnNQoeroYKKKdwSd9p
oq6N7Mh4E6yZHxkcS7nvK5DoKon39u8RklFTCGb7Rlwiz4gReV1wHunHSCUA9sWh
vi6d/vip0P2yQ2s8/yKAeyjfb2X9kLLzL1kWU9cWB7zbqKG9wRcdMLpNzu1mTylz
4thAZ15UaZeKldlI47kmEMcp74Hebpkhknd3l79yF83+Ngelj6rQmIYdfVAZOpzh
vQIDAQAB
-----END PUBLIC KEY-----`
 */


export class VerifyAuthentication {
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

	private async verifySignature(token: string): Promise<JWTVerifyResult> {
		// Keeping this around for later, to verify what happens with expired tokens
		// AUTHP_SESSION_ID=IHZ8uoesoib5v7VcF4CLaLGXtAkIKSMxGJrY742ruDUe1; access_token=eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJhZGRyIjoiMTI3LjAuMC4xIiwiZXhwIjoxNjg1MDYyNjUyLCJmb3J3YXJkZWRfdG9rZW4iOiJnaHVfelBRMXRleUUyUEZ1d2c3Vk1wc1BzM1NDcFRXeGpPM3p1T21SIiwiaWF0IjoxNjg1MDU5MDUyLCJpc3MiOiJodHRwczovL2F1dGguY29kZWNvbWV0LmxvY2FsL2F1dGgvb2F1dGgyL2dpdGh1Yi8iLCJqdGkiOiJJSFo4dW9lc29pYjV2N1ZjRjRDTGFMR1h0QWtJS1NNeEdKclk3NDJydURVZTEiLCJtZXRhZGF0YSI6eyJpZCI6MTA0OTU0MjUxfSwibmFtZSI6IlNwYWNlIFJhY2Nvb24iLCJuYmYiOjE2ODUwNTg5OTIsIm9yaWdpbiI6Imh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlciIsInBpY3R1cmUiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTA0OTU0MjUxP3Y9NCIsInJlYWxtIjoiZ2l0aHViIiwicm9sZXMiOlsiYXV0aHAvdXNlciIsImF1dGhwL2FkbWluIl0sInN1YiI6ImdpdGh1Yi5jb20vc3BhY2VkdWIifQ.TXIVey__EBTfTnGiTkuPSWlbes0jo-Wyu3ABWuQeV_hzmcM5Xx2MyPG5wGquCQkFM5SoulRQ6Qmjv7QKA-8JQ3VLJIqc84HAU4koBZnT3u1dzBcN1Maen_LwAuMeFY_0tdqSxHhvXfUPBDgJLf_sBZEBoV-Otk2hC1s1DQY5P5X-YM8yY4CNHWJXt45Ft20BnAa0GSHG9BKHz_ADjnMaqhE0mR3Y3mcpKT1OF1zcpvI_WbhZVFcZebrdhsN-vG7hTy0VjjsAI6SEsFCSirvXAoXidWBxvVMqzcRe2HitNdv1PhW7bQkN_YQQj-ZpvTBKoCVbDtikN6Y0VkzYJmEHoQ
		// document.cookie = "AUTHP_SESSION_ID=IHZ8uoesoib5v7VcF4CLaLGXtAkIKSMxGJrY742ruDUe1; path=/;";
		// document.cookie = "access_token=eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJhZGRyIjoiMTI3LjAuMC4xIiwiZXhwIjoxNjg1MDYyNjUyLCJmb3J3YXJkZWRfdG9rZW4iOiJnaHVfelBRMXRleUUyUEZ1d2c3Vk1wc1BzM1NDcFRXeGpPM3p1T21SIiwiaWF0IjoxNjg1MDU5MDUyLCJpc3MiOiJodHRwczovL2F1dGguY29kZWNvbWV0LmxvY2FsL2F1dGgvb2F1dGgyL2dpdGh1Yi8iLCJqdGkiOiJJSFo4dW9lc29pYjV2N1ZjRjRDTGFMR1h0QWtJS1NNeEdKclk3NDJydURVZTEiLCJtZXRhZGF0YSI6eyJpZCI6MTA0OTU0MjUxfSwibmFtZSI6IlNwYWNlIFJhY2Nvb24iLCJuYmYiOjE2ODUwNTg5OTIsIm9yaWdpbiI6Imh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlciIsInBpY3R1cmUiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTA0OTU0MjUxP3Y9NCIsInJlYWxtIjoiZ2l0aHViIiwicm9sZXMiOlsiYXV0aHAvdXNlciIsImF1dGhwL2FkbWluIl0sInN1YiI6ImdpdGh1Yi5jb20vc3BhY2VkdWIifQ.TXIVey__EBTfTnGiTkuPSWlbes0jo-Wyu3ABWuQeV_hzmcM5Xx2MyPG5wGquCQkFM5SoulRQ6Qmjv7QKA-8JQ3VLJIqc84HAU4koBZnT3u1dzBcN1Maen_LwAuMeFY_0tdqSxHhvXfUPBDgJLf_sBZEBoV-Otk2hC1s1DQY5P5X-YM8yY4CNHWJXt45Ft20BnAa0GSHG9BKHz_ADjnMaqhE0mR3Y3mcpKT1OF1zcpvI_WbhZVFcZebrdhsN-vG7hTy0VjjsAI6SEsFCSirvXAoXidWBxvVMqzcRe2HitNdv1PhW7bQkN_YQQj-ZpvTBKoCVbDtikN6Y0VkzYJmEHoQ; path=/;";

		// Or overriding the token value directly here
		// token = "eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJhZGRyIjoiMTI3LjAuMC4xIiwiZXhwIjoxNjg1MDYyNjUyLCJmb3J3YXJkZWRfdG9rZW4iOiJnaHVfelBRMXRleUUyUEZ1d2c3Vk1wc1BzM1NDcFRXeGpPM3p1T21SIiwiaWF0IjoxNjg1MDU5MDUyLCJpc3MiOiJodHRwczovL2F1dGguY29kZWNvbWV0LmxvY2FsL2F1dGgvb2F1dGgyL2dpdGh1Yi8iLCJqdGkiOiJJSFo4dW9lc29pYjV2N1ZjRjRDTGFMR1h0QWtJS1NNeEdKclk3NDJydURVZTEiLCJtZXRhZGF0YSI6eyJpZCI6MTA0OTU0MjUxfSwibmFtZSI6IlNwYWNlIFJhY2Nvb24iLCJuYmYiOjE2ODUwNTg5OTIsIm9yaWdpbiI6Imh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlciIsInBpY3R1cmUiOiJodHRwczovL2F2YXRhcnMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvMTA0OTU0MjUxP3Y9NCIsInJlYWxtIjoiZ2l0aHViIiwicm9sZXMiOlsiYXV0aHAvdXNlciIsImF1dGhwL2FkbWluIl0sInN1YiI6ImdpdGh1Yi5jb20vc3BhY2VkdWIifQ.TXIVey__EBTfTnGiTkuPSWlbes0jo-Wyu3ABWuQeV_hzmcM5Xx2MyPG5wGquCQkFM5SoulRQ6Qmjv7QKA-8JQ3VLJIqc84HAU4koBZnT3u1dzBcN1Maen_LwAuMeFY_0tdqSxHhvXfUPBDgJLf_sBZEBoV-Otk2hC1s1DQY5P5X-YM8yY4CNHWJXt45Ft20BnAa0GSHG9BKHz_ADjnMaqhE0mR3Y3mcpKT1OF1zcpvI_WbhZVFcZebrdhsN-vG7hTy0VjjsAI6SEsFCSirvXAoXidWBxvVMqzcRe2HitNdv1PhW7bQkN_YQQj-ZpvTBKoCVbDtikN6Y0VkzYJmEHoQ"

		// Loading the public key should only happen once in the lifecycle of the app
		const algorithm = 'RS512';
		const ecPublicKey = await jose.importSPKI(pubKey, algorithm);

		// Should be called everytime you read a new token, to ensure it is fine
		const result = await jose.jwtVerify(token, ecPublicKey);

		return result;
	}

	private authFailed(message : string, callback : (msg : string) => void) {
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
