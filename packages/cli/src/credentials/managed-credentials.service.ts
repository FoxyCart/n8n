import { Service } from '@n8n/di';

import type { CredentialsEntity } from '@/databases/entities/credentials-entity';

import { CredentialsService } from './credentials.service';

const CredentialsIntegrityStatus = {
	VALID: 'VALID',
	EXPIRED: 'EXPIRED',
	MISSING: 'MISSING',
	INVALID: 'INVALID',
};

@Service()
export class ManagedCredentialsService {
	constructor(private readonly credentialsService: CredentialsService) {}

	/**
	 * Checks the status of Foxy JWT API credentials
	 * @param credentials The credentials to check
	 * @returns Object with status and credential ID
	 */
	checkFoxyJwtApiCredentialsIntegrity(credentials: CredentialsEntity[]): {
		status: (typeof CredentialsIntegrityStatus)[keyof typeof CredentialsIntegrityStatus];
		id?: string;
		details: string[];
	} {
		const managedCredentials = credentials.filter((credential) => credential.isManaged);
		const foxyJwtApiCredentials = managedCredentials.find(
			(credential) => credential.type === 'foxyJwtApi',
		);

		if (!foxyJwtApiCredentials) {
			return {
				status: CredentialsIntegrityStatus.MISSING,
				details: ['No managed foxyJwtApi credentials found'],
			};
		}

		// check if lastupdated is older than 3 months
		const threeMonthsAgo = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000);
		if (foxyJwtApiCredentials.updatedAt < threeMonthsAgo) {
			return {
				status: CredentialsIntegrityStatus.EXPIRED,
				id: foxyJwtApiCredentials.id,
				details: ['Credentials are older than 3 months'],
			};
		}

		const decryptedData = this.credentialsService.decrypt(foxyJwtApiCredentials, true);

		if (!decryptedData) {
			return {
				status: CredentialsIntegrityStatus.INVALID,
				id: foxyJwtApiCredentials.id,
				details: ['Decrypted data is empty'],
			};
		}

		const { clientId, clientSecret, refreshToken } = decryptedData as unknown as {
			clientId: string;
			clientSecret: string;
			refreshToken: string;
		};

		// Check if clientId starts with "foxy_internal_n8n_"
		const isClientIDValid = clientId.startsWith('foxy_internal_n8n_');

		// For minimum 36 characters
		const tokenRegex = /^[a-zA-Z0-9]{30,}$/;
		const isClientSecretValid = tokenRegex.test(clientSecret);
		const isRefreshTokenValid = tokenRegex.test(refreshToken);

		let details = ['Credentials are valid'];

		const isValid = isClientIDValid && isClientSecretValid && isRefreshTokenValid;

		if (!isValid) {
			details = [];
		}

		if (!isClientIDValid) {
			details.push('Client ID does not match the expected format');
		}
		if (!isClientSecretValid) {
			details.push('Client secret does not match the expected format');
		}

		if (!isRefreshTokenValid) {
			details.push('Refresh token does not match the expected format');
		}

		return {
			status: isValid ? CredentialsIntegrityStatus.VALID : CredentialsIntegrityStatus.INVALID,
			id: foxyJwtApiCredentials.id,
			details,
		};
	}
}
