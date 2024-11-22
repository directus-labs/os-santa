import type { Schema } from '#shared/types/schema';
import {
	aggregate,
	createDirectus,
	readItem,
	readItems,
	readSingleton,
	rest,
	createItem,
	updateItem,
	staticToken,
	withToken,
} from '@directus/sdk';

const { directusUrl, directusServerToken } = useRuntimeConfig();

const directusServer = createDirectus<Schema>(directusUrl).with(rest()).with(staticToken(directusServerToken));

export { directusServer, readItem, readItems, readSingleton, createItem, updateItem, withToken, aggregate };
