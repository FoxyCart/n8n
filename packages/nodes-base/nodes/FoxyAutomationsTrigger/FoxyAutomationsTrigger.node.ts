import type {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

type eventType = 'Instance started' | 'Workflow activated' | 'Workflow updated' | undefined;

export class FoxyAutomationsTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Foxy Automations Trigger',
		name: 'foxyAutomationsTrigger',
		icon: 'file:foxy.svg',
		group: ['trigger'],
		version: 1,
		description: 'Handle events and perform actions on your Foxy Automations instance.',
		eventTriggerDescription: '',
		mockManualExecution: true,
		defaults: {
			name: 'Foxy Automations Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				description: `Specifies under which conditions an execution should happen:
				<ul>
					<li><b>Active Workflow Updated</b>: Triggers when this workflow is updated</li>
					<li><b>Instance Started</b>:  Triggers when this Foxy Automations instance is started or re-started</li>
					<li><b>Workflow Activated</b>: Triggers when this workflow is activated</li>
				</ul>`,
				options: [
					{
						name: 'Active Workflow Updated',
						value: 'update',
						description: 'Triggers when this workflow is updated',
					},
					{
						name: 'Instance Started',
						value: 'init',
						description: 'Triggers when this Foxy Automations instance is started or re-started',
					},
					{
						name: 'Workflow Activated',
						value: 'activate',
						description: 'Triggers when this workflow is activated',
					},
				],
			},
		],
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		const events = (this.getNodeParameter('events') as string[]) || [];

		const activationMode = this.getActivationMode();

		if (events.includes(activationMode)) {
			let event: eventType;
			if (activationMode === 'activate') {
				event = 'Workflow activated';
			}
			if (activationMode === 'update') {
				event = 'Workflow updated';
			}
			if (activationMode === 'init') {
				event = 'Instance started';
			}
			this.emit([
				this.helpers.returnJsonArray([
					{ event, timestamp: new Date().toISOString(), workflow_id: this.getWorkflow().id },
				]),
			]);
		}

		const manualTriggerFunction = async () => {
			this.emit([
				this.helpers.returnJsonArray([
					{
						event: 'Manual execution',
						timestamp: new Date().toISOString(),
						workflow_id: this.getWorkflow().id,
					},
				]),
			]);
		};

		return {
			manualTriggerFunction,
		};
	}
}