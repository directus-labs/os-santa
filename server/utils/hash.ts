import { createHash } from 'node:crypto';

export function createVisitorHash(ip: string, salt: string): string {
	return createHash('sha256')
		.update(ip + salt)
		.digest('hex')
		.slice(0, 32);
}
