import type { Profile } from '#shared/types/schema.js';
import type { GithubUser } from '#shared/types/github.js';



export interface LikesResponse {
	username: string;
	totalLikes: number;
	userLikeCount: number;
}

export interface ProfileResponse extends Profile {
	is_new?: boolean;
}


export interface RoastResponse extends Partial<Profile> {
	redirect: string;
}

export interface SearchResponse {
	status: 'SUCCESS' | 'ERROR';
	users: Partial<GithubUser>[] | [];
}

export interface ProfileWithLikes extends Profile {
	meta: {
		totalLikes: number;
	};
}
