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
}

export type Badge = {
	id: string;
	name: string;
	description: string;
	criteria: (data: GitHubUserData) => boolean;
};

export const NICE_SCORE_THRESHOLD = 250;

export const BADGES: Badge[] = [
	{
		id: 'star-gazer',
		name: 'Star Gazer',
		description: 'Received over 100 stars across their projects',
		criteria: (data: GitHubUserData) => {
			const ownedRepos = data.repositories.nodes.filter((repo) => !repo.isFork);
			const totalStars = ownedRepos.reduce((acc, repo) => acc + repo.stargazerCount, 0);
			return totalStars >= 100;
		},
	},
	{
		id: 'pr-pro',
		name: 'PR Pro',
		description: 'Made and reviewed over 10 pull requests',
		criteria: (data: GitHubUserData) =>
			data.contributionsCollection.totalPullRequestContributions >= 10 &&
			data.contributionsCollection.totalPullRequestReviewContributions >= 10,
	},
	{
		id: 'sleigh-star',
		name: 'Sleigh Star',
		description: 'Projects have reached over 5000 total stars',
		criteria: (data: GitHubUserData) => {
			const ownedRepos = data.repositories.nodes.filter((repo) => !repo.isFork);
			const totalStars = ownedRepos.reduce((acc, repo) => acc + repo.stargazerCount, 0);
			return totalStars >= 5000;
		},
	},
];

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
	multipliers: {
		value: number;
		explanation: string;
	};
	finalScore: number;
	list: 'naughty' | 'nice';
	badges: Badge[];
}

function calculateBadges(data: GitHubUserData): Badge[] {
	return BADGES.filter((badge) => badge.criteria(data));
}

export function calculateNiceScore(data: GitHubUserData): ScoreBreakdown {
	let score = 0;
	const breakdown = {} as ScoreBreakdown;

	// Core Contributions
	const commitScore = Math.floor(data.contributionsCollection.totalCommitContributions / 5);
	const prScore = data.contributionsCollection.totalPullRequestContributions;
	const reviewScore = data.contributionsCollection.totalPullRequestReviewContributions * 3;
	const issueScore = data.contributionsCollection.totalIssueContributions;
	const followerScore = data.followers.totalCount * 2;

	breakdown.commits = {
		raw: data.contributionsCollection.totalCommitContributions,
		score: commitScore,
		explanation: `${data.contributionsCollection.totalCommitContributions} commits = ${commitScore} points (1 point per 5 commits)`,
	};

	breakdown.pullRequests = {
		raw: data.contributionsCollection.totalPullRequestContributions,
		score: prScore,
		explanation: `${data.contributionsCollection.totalPullRequestContributions} PRs = ${prScore} points (1 points per PR)`,
	};

	breakdown.reviews = {
		raw: data.contributionsCollection.totalPullRequestReviewContributions,
		score: reviewScore,
		explanation: `${data.contributionsCollection.totalPullRequestReviewContributions} reviews = ${reviewScore} points (3 points per review)`,
	};

	breakdown.issues = {
		raw: data.contributionsCollection.totalIssueContributions,
		score: issueScore,
		explanation: `${data.contributionsCollection.totalIssueContributions} issues = ${issueScore} points (1 point per issue)`,
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
	const abandonedForks = data.repositories.nodes.filter((repo) => repo.isFork && repo.stargazerCount === 0).length;

	const forkPenalty = abandonedForks * -2;

	breakdown.forkPenalty = {
		raw: abandonedForks,
		score: forkPenalty,
		explanation: `${abandonedForks} abandoned forks = ${forkPenalty} points (-2 points per abandoned fork)`,
	};

	score += forkPenalty;

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

	// Calculate badges
	breakdown.badges = calculateBadges(data);

	return breakdown;
}
