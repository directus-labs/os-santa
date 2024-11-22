import { useDebounceFn } from '@vueuse/core';

export default function useQueryParams(options: { callback?: Function } = {}) {
	const route = useRoute();
	const router = useRouter();

	function updateQuery(key: string, value: any) {
		const newQuery = {
			...route.query,
			[key]: value ?? undefined,
		};

		// Use router.replace() instead of router.push() to prevent adding a new history entry
		router.replace({
			query: newQuery,
		});
	}

	const debouncedUpdateQuery = useDebounceFn(updateQuery, 500);

	function removeQuery(key: string) {
		const newQuery = {
			...route.query,
		};

		delete newQuery[key];

		router.replace({
			query: newQuery,
		});
	}

	function clearQuery() {
		router.replace({
			query: {},
		});
	}

	// Watch for changes in the route query params and call the callback
	watch(
		() => route.query,
		(query) => {
			if (options.callback) {
				options.callback(query);
			}
		},
	);

	return { updateQuery, debouncedUpdateQuery, removeQuery, clearQuery };
}
