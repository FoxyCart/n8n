import * as FoxySDK from '@foxy.io/sdk';
import { randomBytes } from 'crypto';
import { type IHookFunctions, type IExecuteFunctions, ApplicationError } from 'n8n-workflow';

import type { FoxyCredentials, FoxyWebhook, FoxyWebhooksResponse } from './types';

export async function generateEncryptionKey() {
	return randomBytes(32).toString('hex');
}

export async function getApi(
	functions: IExecuteFunctions | IHookFunctions,
	options: { baseUrl?: string } = {},
) {
	try {
		const credentials: FoxyCredentials = await functions.getCredentials('foxyJwtApi');

		const api = new FoxySDK.Backend.API({
			...credentials,
			base: new URL(options.baseUrl ?? process.env.FOXY_API_BASE ?? 'https://api.foxycart.com'),
		});

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
		const data: FoxyWebhooksResponse = await response.json();
		const webhooks = data._embedded?.['fx:webhooks'];

		if (!webhooks) {
			throw new ApplicationError('Failed to get Foxy Webhooks');
		}

		return webhooks;
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
	resource: 'transaction' | 'customer' | 'subscription',
) {
	const api = await getApi(functions);
	const encryptionKey = await generateEncryptionKey();

	// @ts-expect-error fx:webhooks is not typed but does exist
	const node = api.follow('fx:store').follow('fx:webhooks');

	const transactionZoom =
		'zoom=applied_taxes,billing_addresses,custom_fields,customer,discounts,items,items:item_category,items:item_options,payments,shipments';
	const customerZoom =
		'zoom=default_billing_address,default_shipping_address,default_payment_method,customer_addresses';
	const subscriptionZoom =
		'zoom=customer,customer:default_billing_address,customer:default_shipping_address,transaction_template,transaction_template:discounts,transaction_template:items,transaction_template:items:item_category,transaction_template:items:item_options,transaction_template:applied_coupon_codes,transaction_template:custom_fields';

	const body = {
		format: 'json',
		name: 'Foxy Automations Webhook',
		event_resource: resource,
		url: webhookUrl,
		query:
			resource === 'transaction'
				? transactionZoom
				: resource === 'customer'
					? customerZoom
					: subscriptionZoom,
		is_active: 1,
		encryption_key: encryptionKey,
	};

	const response = await node.post(body);

	const data = await response.json();

	// @ts-expect-error message is not typed but does exist
	if (!(data.message as string)?.includes('created successfully')) {
		// @ts-expect-error fx:errors is not typed but does exist
		const errors = data._embedded?.['fx:errors'] as Array<{ message: string }>;

		if (errors?.[0]?.message) {
			throw new ApplicationError(`Failed to create Foxy Webhook: ${errors[0].message}`);
		}
	}
}

export async function handleExecute(functions: IExecuteFunctions) {
	const url = functions.getNodeParameter('url', 0) as string;
	const isFullUrl = url.startsWith('http');
	const inferedBaseUrl = isFullUrl ? `https://${new URL(url).hostname}` : process.env.FOXY_API_BASE;

	let finalRequestUrl = isFullUrl ? url : `${inferedBaseUrl}${url}`;

	if (!finalRequestUrl) {
		throw new ApplicationError('Failed to get Foxy API request URL');
	}

	const api = await getApi(functions, {
		baseUrl: inferedBaseUrl,
	});

	const method = functions.getNodeParameter('operation', 0) as Method;
	const body = functions.getNodeParameter('body', 0, null) as string;
	const sendQuery = functions.getNodeParameter('sendQuery', 0, false) as boolean;

	type Options = {
		method?: string;
		body?: string;
		headers?: HeadersInit;
	};

	type Method = 'get' | 'post' | 'delete' | 'patch' | 'put';

	const options: Options = {};

	options.method = method;

	if (sendQuery) {
		const query = functions.getNodeParameter('queryParameters', 0, null) as {
			parameters: Array<{ name: string; value: string }>;
		};

		const queryParams = new URLSearchParams();
		query.parameters.forEach((parameter) => {
			queryParams.set(parameter.name, parameter.value);
		});

		console.log('queryParams', queryParams.toString());

		finalRequestUrl += `?${queryParams.toString()}`;
	}

	if (body) {
		options.body = functions.getNodeParameter('body', 0) as string;
	}

	const foxyResponse = await api
		.fetch(finalRequestUrl, options)
		.then((response: { json: () => any }) => {
			return response.json();
		})
		.then((data: any) => {
			return data;
		})
		.catch((error: any) => {
			console.error(error);
			throw new ApplicationError(`Failed to execute Foxy API request: ${error.message}`);
		});

	return foxyResponse;
}
