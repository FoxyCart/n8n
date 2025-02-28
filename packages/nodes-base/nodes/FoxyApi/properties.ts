import { type INodeProperties } from 'n8n-workflow';

export const uiProperties: INodeProperties[] = [
	{
		displayName: 'Action Type',
		name: 'actionType',
		noDataExpression: true,
		type: 'options',
		options: [
			{
				name: 'Direct API',
				value: 'api',
			},
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-resource-with-plural-option
				name: 'Pre-Built Actions',
				value: 'pre-built',
			},
		],
		default: 'api',
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		hint: "Explore available endpoints in the Foxy Admin's API Browser",
		placeholder: 'e.g. /stores/12345/webhooks',
		required: true,
		description: 'Resource URL',
		displayOptions: {
			show: {
				actionType: ['api'],
			},
		},
	},
	{
		displayName: 'Method',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				actionType: ['api'],
			},
		},
		options: [
			{
				name: 'DELETE',
				value: 'delete',
				action: 'Delete a resource',
			},
			{
				name: 'GET',
				value: 'get',
				action: 'Get a resource',
			},
			{
				name: 'PATCH',
				value: 'patch',
				action: 'Patch a resource',
			},
			{
				name: 'POST',
				value: 'post',
				action: 'Create a resource',
			},
			{
				name: 'PUT',
				value: 'put',
				action: 'Update a resource',
			},
		],
		default: 'GET',
	},
	{
		displayName: 'Send Query Parameters',
		name: 'sendQuery',
		type: 'boolean',
		default: false,
		noDataExpression: true,
		description: 'Whether the request has query params or not',
		displayOptions: {
			show: {
				actionType: ['api'],
				operation: ['get'],
			},
		},
	},
	{
		displayName: 'Query Parameters',
		name: 'queryParameters',
		type: 'fixedCollection',
		displayOptions: {
			show: {
				actionType: ['api'],
				operation: ['get'],
				sendQuery: [true],
			},
		},
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Parameter',
		default: {
			parameters: [
				{
					name: '',
					value: '',
				},
			],
		},
		options: [
			{
				name: 'parameters',
				displayName: 'Parameter',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
					},
				],
			},
		],
	},
	{
		displayName: 'Request Body',
		name: 'body',
		type: 'json',
		default: '{}',
		placeholder: 'Should be a Valid JSON',
		displayOptions: {
			show: {
				actionType: ['api'],
				operation: ['post', 'patch', 'put'],
			},
		},
		typeOptions: {
			rows: 4,
		},
	},
	{
		displayName:
			'Coming soon: Simplified API interactions with pre-built actions - no raw requests needed',
		name: 'note',
		type: 'notice',
		description: 'Simplified API interactions with pre-built actions - no raw requests needed',
		default: '',
		displayOptions: {
			show: { actionType: ['pre-built'] },
		},
	},
];
