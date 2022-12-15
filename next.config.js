/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: [
			"img.dummyapi.io",
			"picsum.photos",
			"fr.web.img3.acsta.net",
			"cdn0-production-images-kly.akamaized.net",
			"asset.kompas.com",
			"randomuser.me",
			"media.istockphoto.com",
		],
	},
};

module.exports = nextConfig;
