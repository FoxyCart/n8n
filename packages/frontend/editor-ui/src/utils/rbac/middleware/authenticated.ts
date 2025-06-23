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
		const redirect =
			to.query.redirect ??
			encodeURIComponent(`${window.location.pathname}${window.location.search}`);

		window.location.href = `/signin?redirect=${redirect}`;
	}
};
