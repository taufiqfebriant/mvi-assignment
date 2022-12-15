/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: ["img.dummyapi.io", "picsum.photos"],
	},
};

module.exports = nextConfig;
