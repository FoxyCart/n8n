export type FoxyCredentials = {
	refreshToken: string;
	clientSecret: string;
	clientId: string;
	storeId: string;
};

export type FoxyWebhook = {
	_links: {
		self: {
			href: string;
			delete: () => Promise<void>;
		};
	};
	format: string;
	version: number;
	name: string;
	url: string;
	query: null | string;
	encryption_key: string;
	event_resource: string;
	config: null | object;
	is_active: number;
	date_created: string;
	date_modified: string;
};

export type FoxyWebhooksResponse = {
	_embedded: {
		'fx:webhooks': FoxyWebhook[];
	};
};

export type FoxyWebhookData = {
	id: number;
	display_id: number;
	is_test: boolean;
	hide_transaction: boolean;
	data_is_fed: boolean;
	type: string;
	source: string;
	transaction_date: string;
	locale_code: string;
	customer_first_name: string;
	customer_last_name: string;
	customer_tax_id: string;
	customer_email: string;
	customer_ip: string;
	ip_country: string;
	user_agent: string;
	total_item_price: number;
	total_tax: number;
	total_shipping: number;
	total_future_shipping: number;
	total_order: number;
	status: string;
	date_created: string;
	date_modified: string;
	currency_code: string;
	currency_symbol: string;
};
