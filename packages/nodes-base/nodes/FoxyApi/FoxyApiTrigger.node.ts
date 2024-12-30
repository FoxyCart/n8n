import {
	NodeConnectionType,
	type IWebhookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookResponseData,
} from 'n8n-workflow';

// import { foxyApiRequest } from './GenericFunctions';

// import { snakeCase } from 'change-case';

export class FoxyApiTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Foxy API Trigger',
		name: 'foxyApiTrigger',
		icon: 'file:foxy.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Handle Foxy events via webhooks',
		defaults: {
			name: 'Foxy Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: '',
				options: [
					{
						name: 'Transaction Refeed',
						value: 'transaction/refeed',
					},
				],
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		return {
			workflowData: [this.helpers.returnJsonArray(req.body)],
		};
	}
}
