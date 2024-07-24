import type { WorkflowTitleStatus } from '@/Interface';
import { useSettingsStore } from '@/stores/settings.store';

export function useTitleChange() {
	const prependBeta = (title: string) => {
		const settingsStore = useSettingsStore();
		const { releaseChannel } = settingsStore.settings;
		return releaseChannel === 'stable' ? title : `[${releaseChannel.toUpperCase()}] ${title}`;
	};

	const titleSet = (workflow: string, status: WorkflowTitleStatus) => {
		let icon = '⚠️';
		if (status === 'EXECUTING') {
			icon = '🔄';
		} else if (status === 'IDLE') {
			icon = '▶️';
		}

		window.document.title = prependBeta(`${icon} ${workflow} - Automations | Foxy.io`);
	};

	const titleReset = () => {
		window.document.title = prependBeta('Automations | Foxy.io');
	};

	return {
		titleSet,
		titleReset,
	};
}
