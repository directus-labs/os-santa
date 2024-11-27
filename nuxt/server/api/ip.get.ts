export default defineEventHandler(async (event) => {
	// Creating a route to test IPs from headers on Vercel
	const ipGetRequestIp = getRequestIP(event);
	const ipNuxtEventXForwardedFor = event.node.req.headers['x-forwarded-for'];
	const xVercelForwardedFor = event.node.req.headers['x-vercel-forwarded-for'];
	const xVercelRealIp = event.node.req.headers['x-vercel-real-ip'];
	return { ipGetRequestIp, ipNuxtEventXForwardedFor, xVercelForwardedFor, xVercelRealIp };
});
