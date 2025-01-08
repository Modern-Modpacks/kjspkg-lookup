import { PRIVATE_GITHUB_CLIENT_SECRET } from '$env/static/private';
import { PUBLIC_GITHUB_CLIENT_ID } from '$env/static/public';
import type { RequestHandler } from './$types';

// Exchange github temporary code for token, used for github auth
export const GET: RequestHandler = async ({ url }) => {
	const params = new URLSearchParams({
		client_id: PUBLIC_GITHUB_CLIENT_ID,
		client_secret: PRIVATE_GITHUB_CLIENT_SECRET,
		code: url.searchParams.get('code') ?? ''
	});
	return new Response(
		await fetch(`https://github.com/login/oauth/access_token?${params.toString()}`, {
			method: 'POST',
			headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }
		}).then((r) => r.text())
	);
};
