export interface GitHubUserData {
	followers: {
		totalCount: number;
	};
	contributionsCollection: {
		totalCommitContributions: number;
		totalPullRequestContributions: number;
		totalPullRequestReviewContributions: number;
		totalIssueContributions: number;
	};

	repositories: {
		nodes: Array<{
			name: string;
			stargazerCount: number;
			isFork: boolean;
			pushedAt: string;
			issues: {
				totalCount: number;
			};
			createdAt: string;
		}>;
	};
	organizations: {
		nodes: Array<{
			name: string;
		}>;
	};
	sponsorshipsAsSponsor: {
		totalCount: number;
	};
}

export interface GitHubOrgData {
	repositories: {
		totalCount: number;
		nodes: Array<{
			name: string;
			stargazerCount: number;
			forkCount: number;
			issues: {
				totalCount: number;
			};
			pushedAt: string;
			createdAt: string;
		}>;
	};
	membersWithRole: {
		totalCount: number;
	};
	teams: {
		totalCount: number;
	};
	sponsorshipsAsSponsor: {
		totalCount: number;
	};
}

export interface ScoreMetric {
	raw: number;
	score: number;
	explanation: string;
}

export interface ScoreBreakdown {
	commits: ScoreMetric;
	pullRequests: ScoreMetric;
	reviews: ScoreMetric;
	issues: ScoreMetric;
	followers: ScoreMetric;
	projectImpact: ScoreMetric;
	forkPenalty: ScoreMetric;
	sponsorships: ScoreMetric;
	multipliers: {
		value: number;
		explanation: string;
	};
	finalScore: number;
	list: 'naughty' | 'nice';
}

export interface Badge {
	id: string;
	name: string;
	description: string;
	criteria: (data: GitHubUserData) => boolean;
};

export const NICE_SCORE_THRESHOLD = 500;

export function calculateOrgNiceScore(data: GitHubOrgData): ScoreBreakdown {
	try {
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		let score = 0;
		const breakdown = {} as ScoreBreakdown;

		// Core Contributions
		const activeRepos = data.repositories.nodes.filter(
			(repo) => new Date(repo.pushedAt) > sixMonthsAgo
		).length;
		const repoScore = activeRepos * 50;

		breakdown.commits = {
			raw: activeRepos,
			score: repoScore,
			explanation: `${activeRepos} active repositories = ${repoScore} points (50 points per active repo)`,
		};

		score += repoScore;

		// Project Impact
		const totalStars = data.repositories.nodes.reduce((acc, repo) => acc + repo.stargazerCount, 0);
		const projectImpactScore = totalStars * 2;

		breakdown.projectImpact = {
			raw: totalStars,
			score: projectImpactScore,
			explanation: `${totalStars} total stars = ${projectImpactScore} points (2 points per star)`,
		};

		score += projectImpactScore;


		// Sponsorships
		const sponsorshipScore = data.sponsorshipsAsSponsor.totalCount * 25;
		score += sponsorshipScore;

		breakdown.sponsorships = {
			raw: data.sponsorshipsAsSponsor.totalCount,
			score: sponsorshipScore,
			explanation: `${data.sponsorshipsAsSponsor.totalCount} sponsorships = ${sponsorshipScore} points (25 points per sponsorship)`,
		};

		// Bonus Multipliers
		let multiplier = 1;
		const multiplierExplanation: string[] = [];

		if (data.repositories.nodes.some((repo) => repo.stargazerCount > 500)) {
			multiplier *= 1.2;
			multiplierExplanation.push('20% bonus for having a project with >500 stars');
		}

		if (data.teams.totalCount > 0) {
			multiplier *= 1.1;
			multiplierExplanation.push('10% bonus for having organized teams');
		}

		score = Math.round(score * multiplier);

		breakdown.multipliers = {
			value: multiplier,
			explanation: multiplierExplanation.join(', ') || 'No bonuses applied',
		};

		breakdown.finalScore = score;

		breakdown.list = score < NICE_SCORE_THRESHOLD ? 'naughty' : 'nice';

		return breakdown;
	} catch (error) {
		console.error('Error calculating organization nice score:', error);
		throw new Error('Failed to calculate organization nice score');
	}
}

export function calculateNiceScore(data: GitHubUserData | GitHubOrgData, type: 'user' | 'organization' = 'user'): ScoreBreakdown {

	console.log('data', data);
	console.log('type', type);
	if (type === 'organization') {
		return calculateOrgNiceScore(data as GitHubOrgData);
	}

	const sixMonthsAgo = new Date()
	sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

	let score = 0;
	const breakdown = {} as ScoreBreakdown;

	// Core Contributions
	const commitScore = Math.floor(data.contributionsCollection.totalCommitContributions);
	const prScore = data.contributionsCollection.totalPullRequestContributions * 2;
	const reviewScore = data.contributionsCollection.totalPullRequestReviewContributions * 3;
	const issueScore = data.contributionsCollection.totalIssueContributions * 0.5;
	const followerScore = data.followers.totalCount * 2;

	breakdown.commits = {
		raw: data.contributionsCollection.totalCommitContributions,
		score: commitScore,
		explanation: `${data.contributionsCollection.totalCommitContributions} commits = ${commitScore} points (1 point per 1 commit)`,
	};

	breakdown.pullRequests = {
		raw: data.contributionsCollection.totalPullRequestContributions,
		score: prScore,
		explanation: `${data.contributionsCollection.totalPullRequestContributions} PRs = ${prScore} points (2 points per PR)`,
	};

	breakdown.reviews = {
		raw: data.contributionsCollection.totalPullRequestReviewContributions,
		score: reviewScore,
		explanation: `${data.contributionsCollection.totalPullRequestReviewContributions} reviews = ${reviewScore} points (3 points per review)`,
	};

	breakdown.issues = {
		raw: data.contributionsCollection.totalIssueContributions,
		score: issueScore,
		explanation: `${data.contributionsCollection.totalIssueContributions} issues = ${issueScore} points (0.5 point per issue)`,
	};

	breakdown.followers = {
		raw: data.followers.totalCount,
		score: followerScore,
		explanation: `${data.followers.totalCount} followers = ${followerScore} points (2 points per follower)`,
	};

	score += commitScore + prScore + reviewScore + issueScore + followerScore;

	// Project Impact
	const ownedRepos = data.repositories.nodes.filter((repo) => !repo.isFork);
	const totalStars = ownedRepos.reduce((acc, repo) => acc + repo.stargazerCount, 0);
	const projectImpactScore = totalStars * 2;

	breakdown.projectImpact = {
		raw: totalStars,
		score: projectImpactScore,
		explanation: `${totalStars} total stars = ${projectImpactScore} points (2 points per star)`,
	};

	score += projectImpactScore;

	// Negative Signals
	const abandonedForks = data.repositories.nodes.filter((repo) => repo.isFork && new Date(repo.pushedAt) < sixMonthsAgo).length;
	const forkPenalty = abandonedForks * -2;

	breakdown.forkPenalty = {
		raw: abandonedForks,
		score: forkPenalty,
		explanation: `${abandonedForks} abandoned forks = ${forkPenalty} points (-2 points per abandoned fork)`,
	};

	score += forkPenalty;

	// Sponsorships
	const sponsorshipScore = data.sponsorshipsAsSponsor.totalCount * 25;
	score += sponsorshipScore;

	breakdown.sponsorships = {
		raw: data.sponsorshipsAsSponsor.totalCount,
		score: sponsorshipScore,
		explanation: `${data.sponsorshipsAsSponsor.totalCount} sponsorships = ${sponsorshipScore} points (25 points per sponsorship)`,
	};

	// Bonus Multipliers
	let multiplier = 1;
	const multiplierExplanation: string[] = [];

	// Has popular projects (>500 stars)
	if (ownedRepos.some((repo) => repo.stargazerCount > 500)) {
		multiplier *= 1.2;
		multiplierExplanation.push('20% bonus for having a project with >500 stars');
	}

	// Organization membership
	if (data.organizations.nodes.length > 0) {
		multiplier *= 1.1;
		multiplierExplanation.push('10% bonus for organization membership');
	}

	score = Math.round(score * multiplier);

	breakdown.multipliers = {
		value: multiplier,
		explanation: multiplierExplanation.join(', ') || 'No bonuses applied',
	};

	breakdown.finalScore = score;

	// Determine naughty/nice status
	let list: 'naughty' | 'nice';
	if (score < NICE_SCORE_THRESHOLD) list = 'naughty';
	else list = 'nice';

	breakdown.list = list;


	return breakdown;
}
