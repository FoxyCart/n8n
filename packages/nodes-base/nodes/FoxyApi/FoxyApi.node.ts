import {
	NodeConnectionType,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import { handleExecute } from './GenericFunctions';
import { uiProperties } from './properties';

export class FoxyApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Foxy API',
		name: 'foxyApi',
		icon: 'file:foxy.svg',
		group: ['transform'],
		version: 1,
		description: 'Consume Foxy API',
		defaults: {
			name: 'Foxy',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'foxyJwtApi',
				required: true,
			},
		],
		properties: uiProperties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const response = await handleExecute(this);
		return [this.helpers.returnJsonArray([response as unknown as IDataObject])];
	}
}
