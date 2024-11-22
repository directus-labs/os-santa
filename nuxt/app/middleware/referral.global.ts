export default defineNuxtRouteMiddleware((to) => {
	const referral = to.query.ref;

	const referralCookie = useCookie('ref');

	if (referral) {
		referralCookie.value = referral as string;
	}
});
