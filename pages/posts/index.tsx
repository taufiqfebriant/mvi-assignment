import { Dialog, Listbox } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Toast from "@radix-ui/react-toast";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import clsx from "clsx";
import { atom, useAtom } from "jotai";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { FaTrash } from "react-icons/fa";
import { MdCheck, MdClose, MdExpandMore } from "react-icons/md";
import { useInView } from "react-intersection-observer";
import { z } from "zod";
import { Icon } from "../../components/Icon";
import { getLayout } from "../../components/Layout";
import { createPost } from "../../requests/createPost";
import { deletePost } from "../../requests/deletePost";
import { getPosts } from "../../requests/getPosts";
import { queries } from "../../requests/keys";
import { updatePost } from "../../requests/updatePost";
import { inter } from "../../utils/fonts";
import { NextPageWithLayout } from "../_app";

const imageSchema = z.string().url();

const selectedPostAtom = atom<
	Awaited<ReturnType<typeof getPosts>>["data"][number] | null
>(null);

const isFormDialogOpenAtom = atom(false);

type ToastContent = {
	message: string;
	type: "success" | "error";
};

const toastContentAtom = atom<ToastContent | null>(null);
const isConfirmDialogOpenAtom = atom(false);

const isImagePreviewDialogOpenAtom = atom(false);

const editSchema = z.object({
	text: z.string().min(6, { message: "Please enter the text." }),
	image: z.string().url({ message: "Please enter a valid URL." }),
	likes: z.coerce
		.number()
		.min(0, { message: "Please enter the amount of likes." }),
	tags: z
		.array(
			z.object({
				name: z.string().min(1),
			})
		)
		.min(1, { message: "Please enter at least one tag." }),
});

const hasOwner = z.object({
	owner: z.string().min(1, { message: "Please choose an owner." }),
});

const createSchema = editSchema.merge(hasOwner);

type CreateSchema = z.infer<typeof createSchema>;
type EditSchema = z.infer<typeof editSchema>;

const CreateForm = () => {
	const form = useForm<CreateSchema>({
		resolver: zodResolver(createSchema),
		defaultValues: {
			tags: [
				{
					name: "",
				},
			],
		},
	});

	const tagsFieldArray = useFieldArray({
		control: form.control,
		name: "tags",
	});

	const queryClient = useQueryClient();

	const [, setIsFormDialogOpen] = useAtom(isFormDialogOpenAtom);
	const [, setToastContent] = useAtom(toastContentAtom);

	const users = useInfiniteQuery({
		...queries.users.infinite({ limit: 10 }),
		getNextPageParam: (lastPage) => lastPage.nextPage,
	});

	const inView = useInView({ trackVisibility: true });
	useEffect(() => {
		const fetchMore = async () => {
			await users.fetchNextPage();
		};

		if (inView.entry?.isIntersecting) {
			fetchMore();
		}
	}, [inView.entry?.isIntersecting, users]);

	const mutation = useMutation({
		mutationFn: createPost,
		onSuccess: () => {
			queryClient.invalidateQueries();
			setIsFormDialogOpen(false);
			setToastContent({
				message: "Post created successfully.",
				type: "success",
			});
		},
	});

	const onSubmit = (data: CreateSchema) => {
		const { tags, ...rest } = data;
		const flatTags = tags.flatMap((tag) => tag.name);

		mutation.mutate({ ...rest, tags: flatTags });
	};

	const isMutating = form.formState.isSubmitting || mutation.isLoading;

	if (users.isLoading) {
		return <p>Loading...</p>;
	}

	if (users.isError) {
		return <p>Something went wrong.</p>;
	}

	const flatUsers = users.data.pages.flatMap((page) => page.data);

	const getFullName = (
		params: Pick<typeof users["data"]["pages"][number]["data"][number], "id">
	) => {
		const relatedUser = flatUsers.find((user) => user.id === params.id);
		if (relatedUser) {
			return `${relatedUser.firstName} ${relatedUser.lastName}`;
		}

		return "Owner";
	};

	return (
		<>
			<Dialog.Title className="font-semibold text-xl text-center">
				Create Post
			</Dialog.Title>

			<form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
				<div className="flex flex-col gap-y-4">
					<Controller
						control={form.control}
						name="owner"
						render={({ field: { value, ...rest } }) => (
							<div>
								<Listbox {...rest} as="div" className="relative">
									{({ open }) => (
										<>
											<Listbox.Button
												className={clsx(
													"border w-full border-gray-300 h-10 text-left px-4 flex items-center justify-between cursor-default",
													{ "rounded-t-md": open },
													{ "rounded-md": !open }
												)}
											>
												<span
													className={clsx({
														"text-gray-400": !value,
													})}
												>
													{value ? getFullName({ id: value }) : "Owner"}
												</span>
												<MdExpandMore className="text-2xl" />
											</Listbox.Button>

											<Listbox.Options className="border-x border-b border-gray-300 rounded-b-md absolute w-full bg-white shadow overflow-y-auto max-h-32">
												{flatUsers.map((user) => (
													<Listbox.Option
														key={user.id}
														value={user.id}
														className="h-[40px] flex items-center px-4 cursor-default hover:bg-gray-100 justify-between"
													>
														{({ selected }) => (
															<>
																<span>
																	{user.firstName} {user.lastName}
																</span>
																{selected ? (
																	<MdCheck className="text-xl" />
																) : null}
															</>
														)}
													</Listbox.Option>
												))}

												<div ref={inView.ref} />
											</Listbox.Options>
										</>
									)}
								</Listbox>

								{form.formState.errors.owner ? (
									<p className="mt-1 text-sm text-red-500">
										{form.formState.errors.owner.message}
									</p>
								) : null}
							</div>
						)}
					/>

					<div>
						<input
							{...form.register("text")}
							placeholder="Text"
							className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
						/>

						{form.formState.errors.text ? (
							<p className="mt-1 text-sm text-red-500">
								{form.formState.errors.text.message}
							</p>
						) : null}
					</div>

					<div>
						<input
							{...form.register("image")}
							placeholder="Image"
							className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
						/>

						{form.formState.errors.image ? (
							<p className="mt-1 text-sm text-red-500">
								{form.formState.errors.image.message}
							</p>
						) : null}
					</div>

					<div>
						<input
							{...form.register("likes")}
							placeholder="Likes"
							className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
						/>

						{form.formState.errors.likes ? (
							<p className="mt-1 text-sm text-red-500">
								{form.formState.errors.likes.message}
							</p>
						) : null}
					</div>

					<div className="flex justify-end">
						<button
							type="button"
							onClick={() => tagsFieldArray.append({ name: "" })}
							className="border border-gray-300 px-3 rounded-md text-2xl h-10"
						>
							+
						</button>
					</div>

					<div className="flex flex-col gap-y-4">
						{tagsFieldArray.fields.map((field, index) => (
							<div key={field.id} className="flex gap-x-2">
								<input
									{...form.register(`tags.${index}.name` as const)}
									className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
									placeholder={`Tag ${index + 1}`}
								/>

								{tagsFieldArray.fields.length > 1 ? (
									<button
										className="shrink-0 border border-gray-300 rounded-md w-12 flex justify-center items-center"
										onClick={() => tagsFieldArray.remove(index)}
									>
										<FaTrash />
									</button>
								) : null}
							</div>
						))}
					</div>
				</div>

				<div className="flex justify-end mt-6 gap-x-4">
					<button
						type="button"
						className="px-8 py-3 border border-gray-300 rounded-md font-medium text-sm text-gray-500 hover:border-black hover:text-black transition-all"
						onClick={() => setIsFormDialogOpen(false)}
					>
						Close
					</button>

					<button
						type="submit"
						disabled={isMutating}
						className="px-8 py-3 text-white rounded-md font-medium text-sm hover:bg-[#181818] transition-all disabled:bg-black/80 bg-black"
					>
						{isMutating ? (
							<Icon
								id="spinner"
								className="h-5 w-5 animate-spin fill-black/30 text-gray-300"
							/>
						) : (
							"Submit"
						)}
					</button>
				</div>
			</form>
		</>
	);
};

type EditFormProps = {
	post: Awaited<ReturnType<typeof getPosts>>["data"][number];
};

const EditForm = (props: EditFormProps) => {
	const form = useForm<EditSchema>({
		resolver: zodResolver(editSchema),
		defaultValues: {
			text: props.post.text,
			image: props.post.image,
			likes: props.post.likes,
			tags: props.post.tags.map((tag) => ({ name: tag })),
		},
	});

	const tagsFieldArray = useFieldArray({
		control: form.control,
		name: "tags",
	});

	const [, setIsFormDialogOpen] = useAtom(isFormDialogOpenAtom);
	const [, setToastContent] = useAtom(toastContentAtom);
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: updatePost,
		onSuccess: () => {
			queryClient.invalidateQueries();
			setIsFormDialogOpen(false);
			setToastContent({
				message: "Post updated successfully.",
				type: "success",
			});
		},
	});

	const onSubmit = (data: EditSchema) => {
		const { tags, ...rest } = data;
		const flatTags = tags.flatMap((tag) => tag.name);

		mutation.mutate({ ...rest, id: props.post.id, tags: flatTags });
	};

	const isMutating = form.formState.isSubmitting || mutation.isLoading;

	return (
		<>
			<Dialog.Title className="font-semibold text-xl text-center">
				Edit Post
			</Dialog.Title>

			<form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
				<div className="flex flex-col gap-y-4">
					<div>
						<input
							{...form.register("text")}
							placeholder="Text"
							className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
						/>

						{form.formState.errors.text ? (
							<p className="mt-1 text-sm text-red-500">
								{form.formState.errors.text.message}
							</p>
						) : null}
					</div>

					<div>
						<input
							{...form.register("image")}
							placeholder="Image"
							className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
						/>

						{form.formState.errors.image ? (
							<p className="mt-1 text-sm text-red-500">
								{form.formState.errors.image.message}
							</p>
						) : null}
					</div>

					<div>
						<input
							{...form.register("likes")}
							placeholder="Picture"
							className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
						/>

						{form.formState.errors.likes ? (
							<p className="mt-1 text-sm text-red-500">
								{form.formState.errors.likes.message}
							</p>
						) : null}
					</div>

					<div className="flex justify-end">
						<button
							type="button"
							onClick={() => tagsFieldArray.append({ name: "" })}
							className="border border-gray-300 px-3 rounded-md text-2xl h-10"
						>
							+
						</button>
					</div>

					<div className="flex flex-col gap-y-4">
						{tagsFieldArray.fields.map((field, index) => (
							<div key={field.id} className="flex gap-x-2">
								<input
									{...form.register(`tags.${index}.name` as const)}
									className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
									placeholder={`Tag ${index + 1}`}
								/>

								{tagsFieldArray.fields.length > 1 ? (
									<button
										className="shrink-0 border border-gray-300 rounded-md w-12 flex justify-center items-center"
										onClick={() => tagsFieldArray.remove(index)}
									>
										<FaTrash />
									</button>
								) : null}
							</div>
						))}
					</div>
				</div>

				<div className="flex justify-end mt-6 gap-x-4">
					<button
						type="button"
						className="px-8 py-3 border border-gray-300 rounded-md font-medium text-sm text-gray-500 hover:border-black hover:text-black transition-all"
						onClick={() => setIsFormDialogOpen(false)}
					>
						Close
					</button>

					<button
						type="submit"
						disabled={isMutating}
						className="px-8 py-3 text-white rounded-md font-medium text-sm hover:bg-[#181818] transition-all disabled:bg-black/80 bg-black"
					>
						{isMutating ? (
							<Icon
								id="spinner"
								className="h-5 w-5 animate-spin fill-black/30 text-gray-300"
							/>
						) : (
							"Submit"
						)}
					</button>
				</div>
			</form>
		</>
	);
};

const PostsList = () => {
	const [page, setPage] = useState(0);
	const [, setIsFormDialogOpen] = useAtom(isFormDialogOpenAtom);
	const [, setIsConfirmDialogOpen] = useAtom(isConfirmDialogOpenAtom);
	const [, setImagePreviewDialogOpen] = useAtom(isImagePreviewDialogOpenAtom);
	const [, setSelectedPost] = useAtom(selectedPostAtom);

	const posts = useQuery({
		...queries.posts.list({ limit: 10, page }),
		keepPreviousData: true,
	});

	if (posts.isLoading || posts.isPreviousData) {
		return (
			<div className="flex justify-center items-center mt-10">
				<Icon
					id="spinner"
					className="h-8 w-8 animate-spin fill-black text-gray-300"
				/>
			</div>
		);
	}

	if (posts.isError) {
		return <p>Something went wrong.</p>;
	}

	if (!posts.data.data.length) {
		return <p>No posts yet.</p>;
	}

	const validateImage = (
		params: Pick<typeof posts["data"]["data"][number], "image">
	) => {
		return imageSchema.safeParse(params.image).success;
	};

	return (
		<>
			<div className="border border-gray-300 rounded-md mt-10">
				<table className="w-full">
					<thead className="border-b border-gray-300">
						<tr className="h-10">
							<th className="border-r border-gray-300">Text</th>
							<th className="border-r border-gray-300">Tags</th>
							<th className="border-r border-gray-300">Image</th>
							<th className="border-r border-gray-300">User</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{posts.data.data.map((post, index) => (
							<tr
								key={post.id}
								className={clsx("border-gray-300 h-14", {
									"border-b": index + 1 !== posts.data.data.length,
								})}
							>
								<td className="border-r border-gray-300 px-4">{post.text}</td>
								<td className="border-r border-gray-300 px-4">
									{post.tags.map((tag) => (
										<p key={tag}>#{tag}</p>
									))}
								</td>
								<td className="border-r border-gray-300 px-4">
									<div className="flex justify-center">
										{validateImage({ image: post.image }) ? (
											<button
												type="button"
												className="relative h-[40px] w-[40px]"
												onClick={() => {
													setSelectedPost(post);
													setImagePreviewDialogOpen(true);
												}}
											>
												<Image
													fill={true}
													src={post.image}
													alt="Post image"
													className="object-cover"
													sizes="100%"
												/>
											</button>
										) : (
											"-"
										)}
									</div>
								</td>
								<td className="border-r border-gray-300 px-4">
									{post.owner.firstName} {post.owner.lastName}
								</td>
								<td className="px-4">
									<div className="flex justify-center gap-x-1">
										<button
											type="button"
											onClick={() => {
												setSelectedPost(post);
												setIsFormDialogOpen(true);
											}}
										>
											Edit
										</button>
										<span>|</span>
										<button
											type="button"
											className="text-red-500"
											onClick={() => {
												setSelectedPost(post);
												setIsConfirmDialogOpen(true);
											}}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

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
					disabled={page + 1 === posts.data.totalPages}
					className={clsx({ underline: page + 1 !== posts.data.totalPages })}
				>
					Next
				</button>
			</div>
		</>
	);
};

const PostsPage: NextPageWithLayout = () => {
	const [isFormDialogOpen, setIsFormDialogOpen] = useAtom(isFormDialogOpenAtom);
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useAtom(
		isConfirmDialogOpenAtom
	);
	const [isImagePreviewDialogOpen, setIsImagePreviewDialogOpen] = useAtom(
		isImagePreviewDialogOpenAtom
	);

	const [selectedPost, setSelectedPost] = useAtom(selectedPostAtom);

	const [toastContent, setToastContent] = useAtom(toastContentAtom);

	const queryClient = useQueryClient();

	const deletePostMutation = useMutation({
		mutationFn: deletePost,
		onSuccess: () => {
			queryClient.invalidateQueries();
			setIsConfirmDialogOpen(false);
			setToastContent({
				message: "Post deleted successfully.",
				type: "success",
			});
		},
	});

	return (
		<>
			<div className="max-w-2xl mx-auto">
				<div className="flex justify-center">
					<button
						type="button"
						onClick={() => {
							setIsFormDialogOpen(true);
							setSelectedPost(null);
						}}
						className="bg-black text-white px-6 py-3 font-medium rounded-md"
					>
						Create Post
					</button>
				</div>

				<PostsList />
			</div>

			<Dialog
				open={isConfirmDialogOpen}
				onClose={() => {
					setIsConfirmDialogOpen(false);
				}}
				className={`relative z-50 ${inter.className} font-sans`}
			>
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center">
					<Dialog.Panel className="w-[30rem] rounded-md bg-white p-8">
						<div className="max-w-md mx-auto">
							<Dialog.Description className="text-center">
								Are you sure want to delete this data?
							</Dialog.Description>

							<div className="flex justify-between gap-x-2 mt-10">
								<button
									type="button"
									className="basis-1/2 py-3 border border-gray-300 rounded-md font-medium text-sm text-gray-500 hover:border-black hover:text-black transition-all"
								>
									No
								</button>
								<button
									type="button"
									className="basis-1/2 py-3 rounded-md font-medium text-sm text-white transition-all bg-red-500 hover:bg-red-400 disabled:bg-red-500/80 flex justify-center"
									disabled={deletePostMutation.isLoading}
									onClick={() => {
										if (selectedPost) {
											deletePostMutation.mutate({ id: selectedPost.id });
										}
									}}
								>
									{deletePostMutation.isLoading ? (
										<Icon
											id="spinner"
											className="h-5 w-5 animate-spin fill-red-500/30 text-gray-300"
										/>
									) : (
										"Yes"
									)}
								</button>
							</div>
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>

			<Dialog
				open={isFormDialogOpen}
				onClose={() => {
					setIsFormDialogOpen(false);
				}}
				className={`relative z-50 ${inter.className} font-sans`}
			>
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center">
					<Dialog.Panel className="w-[42rem] rounded-md bg-white p-8">
						<div className="max-w-md mx-auto">
							{selectedPost ? <EditForm post={selectedPost} /> : <CreateForm />}
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>

			<Dialog
				open={isImagePreviewDialogOpen}
				onClose={() => {
					setIsImagePreviewDialogOpen(false);
				}}
				className={`relative z-50 ${inter.className} font-sans`}
			>
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center">
					<Dialog.Panel className="w-[30rem] rounded-md bg-white p-8 flex justify-center relative">
						<button
							type="button"
							onClick={() => setIsImagePreviewDialogOpen(false)}
							className="text-2xl absolute right-4 top-2"
						>
							<MdClose />
						</button>

						<div className="h-[225px] w-[225px] relative rounded-md overflow-hidden">
							{selectedPost ? (
								<Image
									fill={true}
									src={selectedPost.image}
									alt="Post image"
									className="object-cover"
									sizes="100%"
								/>
							) : null}
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>

			{toastContent ? (
				<Toast.Provider duration={4000}>
					<Toast.Root
						className="relative rounded-md bg-white px-4 py-3 text-[#151515] shadow-sm border border-gray-300"
						onOpenChange={(open) => {
							if (!open && toastContent) {
								setToastContent(null);
							}
						}}
					>
						<Toast.Title className="font-medium">
							{toastContent.type === "success" ? "Success" : "Error"}
						</Toast.Title>
						<Toast.Close
							aria-label="Close"
							className="absolute top-2 right-2 rounded-md border border-gray-500 p-[0.1rem] hover:bg-gray-200"
						>
							<MdClose aria-hidden />
						</Toast.Close>
						<Toast.Description className="text-sm text-gray-600">
							{toastContent.message}
						</Toast.Description>
					</Toast.Root>

					<Toast.Viewport className="fixed top-0 right-0 w-96 max-w-[100vw] p-6" />
				</Toast.Provider>
			) : null}
		</>
	);
};

PostsPage.getLayout = getLayout;

export default PostsPage;
