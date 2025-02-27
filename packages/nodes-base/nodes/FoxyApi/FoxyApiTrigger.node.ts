import { ApplicationError, NodeConnectionType } from 'n8n-workflow';
import type {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IHookFunctions,
} from 'n8n-workflow';

import { createFoxyWebhook, getFoxyWebhookByUrl } from './GenericFunctions';

export class FoxyApiTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Foxy API Trigger',
		name: 'foxyApiTrigger',
		icon: 'file:foxy.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description:
			'Receive webhooks from Foxy and trigger workflows when e-commerce events occur, such as new transactions and more. Use this node to automate responses to Foxy store activities.',
		defaults: {
			name: 'Foxy API Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'foxyJwtApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiToken'],
					},
				},
			},
		],
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
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'API Token',
						value: 'apiToken',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'apiToken',
			},
			{
				displayName: 'Trigger On',
				name: 'triggerOn',
				type: 'options',
				required: true,
				default: '',
				noDataExpression: true,
				options: [
					{
						name: 'Transaction Events',
						value: 'transaction',
					},
					{
						name: 'Customer Events',
						value: 'customer',
					},
					{
						name: 'Subscription Events',
						value: 'subscription',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				try {
					const nodeWebhookUrl = this.getNodeWebhookUrl('default') as string;
					const triggerOn = this.getNodeParameter('triggerOn', 0) as string;

					const foxyWebhook = await getFoxyWebhookByUrl(this, nodeWebhookUrl);

					if (!foxyWebhook) {
						console.log('Foxy Webhook not found, creating a new one.');
						return false;
					}

					// Check for resource mismatch
					if (foxyWebhook?.event_resource !== triggerOn) {
						console.log(
							'Resource mismatch, the source of truth is the node parameter. Deleting the webhook and creating a new one.',
						);
						await foxyWebhook?._links.self.delete();
						return false;
					}

					return true;
				} catch (error) {
					console.error(error);
					return false;
				}
			},
			async create(this: IHookFunctions): Promise<boolean> {
				try {
					const nodeWebhookUrl = this.getNodeWebhookUrl('default') as string;
					const triggerOn = this.getNodeParameter('triggerOn', 0) as string;

					await createFoxyWebhook(this, nodeWebhookUrl, triggerOn);

					return true;
				} catch (error) {
					console.error(error);
					throw new ApplicationError('Failed to create Foxy Webhook');
				}
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				try {
					const nodeWebhookUrl = this.getNodeWebhookUrl('default') as string;
					const foxyWebhook = await getFoxyWebhookByUrl(this, nodeWebhookUrl);

					if (!foxyWebhook) {
						console.log('Foxy Webhook not found, nothing to delete.');
						return true;
					}

					await foxyWebhook._links.self.delete();

					return true;
				} catch (error) {
					console.error(error);
					throw new ApplicationError('Failed to delete Foxy Webhook');
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		return {
			workflowData: [this.helpers.returnJsonArray(req.body)],
		};
	}
}
