import type { ProfileCarol } from '#shared/types/schema.js';

export interface SubmitCarolRequest {
	linkedin_profile_url: string;
	submitted_by_email: string;
	submitted_by_name: string;
}

export interface SubmitCarolResponse {
	success: boolean;
	message: string;
	redirect?: string;
}

export interface ValidateLinkedInRequest {
	url: string;
}

export interface ValidateLinkedInResponse {
	valid: boolean;
	message?: string;
}

export interface CarolResponse extends ProfileCarol {
	is_processing?: boolean;
}

export interface CarolCountResponse {
	count: number;
}
