const DEFAULT_TITLE = 'Automations';

export function useDocumentTitle() {
	const suffix = 'Foxy.io';

	const set = (title: string) => {
		const sections = [title || DEFAULT_TITLE, suffix];
		document.title = sections.join(' | ');
	};

	const reset = () => {
		set('');
	};

	return { set, reset };
}
