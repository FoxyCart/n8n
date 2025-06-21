import type { RouterMiddleware } from '@/types/router';
import type { AuthenticatedPermissionOptions } from '@/types/rbac';
import { isAuthenticated } from '@/utils/rbac/checks';

export const authenticatedMiddleware: RouterMiddleware<AuthenticatedPermissionOptions> = async (
	to,
	_from,
	next,
	options,
) => {
	const valid = isAuthenticated(options);
	if (!valid) {
		const {
			VUE_APP_N8N_OAUTH_CLIENT_ID: N8N_OAUTH_CLIENT_ID,
			VUE_APP_FOXY_OIDC_BASE: FOXY_OIDC_BASE,
		} = import.meta.env;

		if (!N8N_OAUTH_CLIENT_ID || !FOXY_OIDC_BASE) {
			throw new Error('Authentication is not configured correctly');
		}

		const host = window.location.host;
		// Extract the store id from the host
		const store_id = host.split('.')[0].replace('store-', '');

		// Generate redirect URL
		const redirectParameters = new URLSearchParams();
		redirectParameters.set('response_type', 'code');
		redirectParameters.set('client_id', N8N_OAUTH_CLIENT_ID);
		redirectParameters.set('scope', `store_full_access store_id_${store_id}`);
		redirectParameters.set('state', 'store');

		const redirectURL = new URL('./authorize', FOXY_OIDC_BASE);
		const fullRedirectURL = redirectURL.toString() + '?' + redirectParameters.toString();

		window.location.href = fullRedirectURL;
	}
};
