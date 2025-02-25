import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class FoxyJwtApi implements ICredentialType {
	name = 'foxyJwtApi';

	displayName = 'Foxy API Credentials';

	documentationUrl = 'https://api.foxycart.com/docs';

	properties: INodeProperties[] = [
		{
			displayName: 'Client Id',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'The client ID for the API key.',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description:
				'The secret key provided by Foxy for secure API authentication. Keep this confidential',
		},
		{
			displayName: 'Refresh Token',
			name: 'refreshToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'The long-lived token used to obtain new access tokens when they expire',
		},
	];
}
