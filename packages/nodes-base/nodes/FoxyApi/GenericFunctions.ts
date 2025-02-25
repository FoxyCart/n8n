import * as FoxySDK from '@foxy.io/sdk';
import { randomBytes } from 'crypto';
import { type IHookFunctions, type IExecuteFunctions, ApplicationError } from 'n8n-workflow';

import type { FoxyCredentials, FoxyWebhook } from './types';

export async function generateEncryptionKey() {
	return randomBytes(32).toString('hex');
}

export async function getApi(functions: IExecuteFunctions | IHookFunctions) {
	try {
		const credentials: FoxyCredentials = await functions.getCredentials('foxyJwtApi');

		const api = new FoxySDK.Backend.API(credentials);

		return api;
	} catch (error) {
		console.error(error);
		throw new ApplicationError('Failed to get Foxy API');
	}
}

async function getWebhooks(functions: IExecuteFunctions | IHookFunctions) {
	try {
		const api = await getApi(functions);

		// @ts-expect-error fx:webhooks is not typed but does exist
		const response = await api.follow('fx:store').follow('fx:webhooks').get();

		// @ts-expect-error fx:webhooks is not typed but does exist
		const {
			_embedded: { 'fx:webhooks': webhooks },
		}: FoxyWebhooksResponse = await response.json();

		return webhooks as FoxyWebhook[];
	} catch (error) {
		console.error(error);
		throw new ApplicationError('Failed to get Foxy Webhooks');
	}
}

function matchWebhook(webhooks: FoxyWebhook[], webhookUrl: string) {
	return webhooks.find((item: FoxyWebhook) => item.url === webhookUrl);
}

export async function getFoxyWebhookByUrl(
	functions: IExecuteFunctions | IHookFunctions,
	webhookUrl: string,
) {
	const webhooks = await getWebhooks(functions);
	return matchWebhook(webhooks, webhookUrl);
}

export async function createFoxyWebhook(
	functions: IExecuteFunctions | IHookFunctions,
	webhookUrl: string,
	resource: string,
) {
	const api = await getApi(functions);
	const encryptionKey = await generateEncryptionKey();

	// @ts-expect-error fx:webhooks is not typed but does exist
	const node = api.follow('fx:store').follow('fx:webhooks');

	const body = {
		format: 'json',
		name: 'Foxy Automations Webhook',
		event_resource: resource,
		url: webhookUrl,
		is_active: 1,
		encryption_key: encryptionKey,
	};

	const response = await node.post(body);

	if (!response.ok) {
		throw new ApplicationError('Failed to create Foxy Webhook');
	}
}

export async function handleExecute(functions: IExecuteFunctions) {
	const api = await getApi(functions);

	type Options = {
		method?: string;
		body?: string;
		headers?: HeadersInit;
	};

	type Method = 'get' | 'post' | 'delete' | 'patch' | 'put';

	const options: Options = {};

	let url = functions.getNodeParameter('url', 0) as string;
	const method = functions.getNodeParameter('method', 0) as Method;
	const query = functions.getNodeParameter('query', 0, null) as string;
	const body = functions.getNodeParameter('body', 0, null) as string;

	options.method = method;

	if (query) {
		url += query;
	}

	if (body) {
		options.body = functions.getNodeParameter('body', 0) as string;
	}

	const foxyResponse = await api
		.fetch(url, options)
		.then((response: { json: () => any }) => {
			return response.json();
		})
		.then((data: any) => {
			return data;
		});

	return foxyResponse;
}
