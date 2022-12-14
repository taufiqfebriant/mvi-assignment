import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Icon } from "../components/Icon";
import { getLayout } from "../components/Layout";
import { queries } from "../requests/keys";
import { NextPageWithLayout } from "./_app";

type PostsListProps = {
	tag?: string;
};

const PostsList = (props: PostsListProps) => {
	const [page, setPage] = useState(0);

	useEffect(() => {
		setPage(0);
	}, [props.tag]);

	const posts = useQuery({
		...queries.posts.list({ limit: 8, page, tag: props.tag }),
		keepPreviousData: true,
	});

	if (posts.isLoading || posts.isPreviousData) {
		return (
			<div className="flex justify-center items-center mt-10">
				<Icon
					id="spinner"
					className="h-8 w-8 animate-spin fill-slate-900 text-gray-300"
				/>
			</div>
		);
	}

	if (posts.isError) {
		return (
			<div className="flex justify-center items-center mt-10">
				<p>Something went wrong.</p>
			</div>
		);
	}

	if (!posts.data.data.length) {
		return (
			<div className="flex justify-center items-center mt-10">
				<p>No posts yet.</p>
			</div>
		);
	}

	return (
		<>
			<article className="grid grid-cols-4 gap-6 mt-10">
				{posts.data.data.map((post) => (
					<article
						key={post.id}
						className="border border-gray-300 rounded-md overflow-hidden"
					>
						<div className="relative h-[200px]">
							<Image
								fill={true}
								src={post.image}
								alt="Post image"
								className="object-cover"
								sizes="100%"
							/>
						</div>
						<div className="px-3 pt-2 pb-4">
							<h1 className="font-medium">
								{post.owner.firstName} {post.owner.lastName}
							</h1>

							<p className="text-sm text-gray-500 mt-1">{post.text}</p>

							<div className="flex text-sm gap-x-2.5 mt-2 text-blue-500 flex-wrap">
								{post.tags.map((tag) => (
									<p key={tag}>#{tag}</p>
								))}
							</div>
						</div>
					</article>
				))}
			</article>

			<div className="flex items-center mt-6 gap-x-10 justify-center">
				<button
					type="button"
					onClick={() => setPage((prev) => prev - 1)}
					disabled={page === 0}
					className={clsx({ underline: page !== 0 })}
				>
					Previous
				</button>

				<div className="flex gap-x-3">
					{Array.from({ length: posts.data.totalPages }, (_, i) => i).map(
						(n) => (
							<button
								type="button"
								key={n}
								disabled={page === n}
								className={clsx({ underline: page !== n })}
								onClick={() => setPage(n)}
							>
								{n + 1}
							</button>
						)
					)}
				</div>

				<button
					type="button"
					onClick={() => setPage((prev) => prev + 1)}
					disabled={!page || page === posts.data.totalPages}
					className={clsx({
						underline: page && page !== posts.data.totalPages,
					})}
				>
					Next
				</button>
			</div>
		</>
	);
};

const HomePage: NextPageWithLayout = () => {
	const [tag, setTag] = useState<string>();
	const [debouncedTag, setDebouncedTag] = useState<string | undefined>(tag);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedTag(tag);
		}, 1000);

		return () => clearTimeout(handler);
	}, [tag]);

	return (
		<>
			<Head>
				<title>Home</title>
			</Head>

			<input
				type="text"
				className="border border-gray-300 w-80 h-10 px-2.5 rounded-md focus:outline-none focus:border-slate-900"
				placeholder="Search by tag..."
				onChange={(e) => setTag(e.target.value)}
			/>

			<PostsList tag={debouncedTag} />
		</>
	);
};

HomePage.getLayout = getLayout;

export default HomePage;
