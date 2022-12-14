import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html>
			<Head />
			<link
				rel="preload"
				href="/images/sprite.svg"
				as="image"
				type="image/svg+xml"
			/>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
