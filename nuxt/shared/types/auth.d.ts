import type { GithubUser } from '~~/shared/types/github';

// auth.d.ts
declare module '#auth-utils' {
	interface User extends GithubUser {
	  // Add your own fields
	}

	interface UserSession {
	  // Add your own fields
	}

	interface SecureSessionData {
	  // Add your own fields
	}
  }

  export {}
