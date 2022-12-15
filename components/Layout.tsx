import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { MdHome } from "react-icons/md";
import { inter } from "../utils/fonts";

type Props = {
	children: ReactNode;
};

export const Layout = (props: Props) => {
	const router = useRouter();

	return (
		<div className={`${inter.variable} font-sans flex min-h-screen`}>
			<nav className="h-screen w-72 bg-black text-white text-xl shrink-0 sticky top-0">
				<ul>
					<li className="border-b border-[#202020]">
						<Link
							href="/"
							className={clsx(
								"flex justify-center py-4 hover:bg-[#181818] transition-colors text-3xl",
								{ "bg-[#181818]": router.asPath === "/" }
							)}
						>
							<MdHome />
						</Link>
					</li>
					<li className="border-b border-[#202020]">
						<Link
							href="/users"
							className={clsx(
								"flex justify-center py-4 hover:bg-[#181818] transition-colors",
								{ "bg-[#181818]": router.asPath === "/users" }
							)}
						>
							User
						</Link>
					</li>
					<li className="border-b border-[#202020]">
						<Link
							href="/posts"
							className={clsx(
								"flex justify-center py-4 hover:bg-[#181818] transition-colors",
								{ "bg-[#181818]": router.asPath === "/posts" }
							)}
						>
							Post
						</Link>
					</li>
				</ul>
			</nav>

			<main className="px-10 py-8 flex-1">{props.children}</main>
		</div>
	);
};

export const getLayout = (page: ReactNode) => {
	return <Layout>{page}</Layout>;
};
