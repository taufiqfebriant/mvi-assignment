import { Dialog, Listbox } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MdCheck, MdExpandMore } from "react-icons/md";
import { z } from "zod";
import { Icon } from "../../components/Icon";
import { getLayout } from "../../components/Layout";
import { createPost } from "../../requests/createPost";
import { queries } from "../../requests/keys";
import { inter } from "../../utils/fonts";
import { NextPageWithLayout } from "../_app";

const schema = z.object({
	owner: z.string().min(1, { message: "Please choose an owner." }),
	text: z.string().min(6, { message: "Please enter the text." }),
	image: z.string().url({ message: "Please enter a valid URL." }),
	likes: z.coerce
		.number()
		.min(0, { message: "Please enter the amount of likes." }),
	tags: z.string().min(1, { message: "Please enter at least one tag." }),
});

type Schema = z.infer<typeof schema>;

const PostsPage: NextPageWithLayout = () => {
	let [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();
	const form = useForm<Schema>({ resolver: zodResolver(schema) });

	const users = useQuery(queries.users.list({ limit: 10, page: 1 }));

	const createPostMutation = useMutation({
		mutationFn: createPost,
		onSuccess: () => {
			queryClient.invalidateQueries();
		},
	});

	const onSubmit = (data: Schema) => {
		createPostMutation.mutate({ ...data, tags: [data.tags] });
	};

	const mutationIsLoading =
		form.formState.isSubmitting || createPostMutation.isLoading;

	const getCurrentOwner = (params: { id: Schema["owner"] }) => {
		const relatedUser = users.data?.data.find((user) => user.id === params.id);
		if (relatedUser) {
			return `${relatedUser.firstName} ${relatedUser.lastName}`;
		}

		return "Owner";
	};

	return (
		<>
			<button type="button" onClick={() => setIsOpen(true)}>
				Create Post
			</button>

			<Dialog
				open={isOpen}
				onClose={() => setIsOpen(false)}
				className={`relative z-50 ${inter.className} font-sans`}
			>
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center">
					<Dialog.Panel className="w-[42rem] rounded-md bg-white p-8">
						<div className="max-w-md mx-auto">
							{users.isLoading ? (
								<div className="flex justify-center">
									<Icon
										id="spinner"
										className="h-8 w-8 animate-spin fill-slate-900 text-gray-300"
									/>
								</div>
							) : users.isError ? (
								<p className="text-center">Something went wrong.</p>
							) : (
								<>
									<Dialog.Title className="font-semibold text-xl text-center">
										Create Post
									</Dialog.Title>

									<form onSubmit={form.handleSubmit(onSubmit)}>
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
																			"border w-full border-gray-300 h-10 mt-8 text-left px-4 flex items-center justify-between cursor-default",
																			{ "rounded-t-md": open },
																			{ "rounded-md": !open }
																		)}
																	>
																		<span
																			className={clsx({
																				"text-gray-400": !value,
																			})}
																		>
																			{value
																				? getCurrentOwner({ id: value })
																				: "Owner"}
																		</span>
																		<MdExpandMore className="text-2xl" />
																	</Listbox.Button>

																	<Listbox.Options className="border-x border-b border-gray-300 rounded-b-md flex flex-col divide-y divide-gray-300 absolute w-full bg-white shadow">
																		{users.data.data.map((user) => (
																			<Listbox.Option
																				key={user.id}
																				value={user.id}
																				className="h-10 flex items-center px-4 cursor-default hover:bg-gray-100 justify-between"
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
												<textarea
													{...form.register("text")}
													placeholder="Text"
													className="border border-gray-300 rounded-md px-4 focus:outline-none focus:border-slate-900 w-full py-2.5"
													rows={5}
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
													className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-slate-900 w-full"
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
													className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-slate-900 w-full"
													type="text"
													inputMode="numeric"
													pattern="[0-9]*"
												/>

												{form.formState.errors.likes ? (
													<p className="mt-1 text-sm text-red-500">
														{form.formState.errors.likes.message}
													</p>
												) : null}
											</div>

											<div>
												<input
													{...form.register("tags")}
													placeholder="Tags"
													className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-slate-900 w-full"
												/>

												{form.formState.errors.tags ? (
													<p className="mt-1 text-sm text-red-500">
														{form.formState.errors.tags.message}
													</p>
												) : null}
											</div>
										</div>

										<div className="flex justify-end mt-6 gap-x-4">
											<button
												type="button"
												className="px-8 py-3 border border-gray-300 rounded-md font-medium text-sm text-gray-500 hover:border-slate-900 hover:text-slate-900 transition-all"
												onClick={() => setIsOpen(false)}
											>
												Close
											</button>

											<button
												type="submit"
												disabled={mutationIsLoading}
												className="px-8 py-3 text-white rounded-md font-medium text-sm hover:bg-slate-800 transition-all disabled:bg-slate-900/80 bg-slate-900"
											>
												{mutationIsLoading ? (
													<Icon
														id="spinner"
														className="h-5 w-5 animate-spin fill-slate-400 text-gray-300"
													/>
												) : (
													"Submit"
												)}
											</button>
										</div>
									</form>
								</>
							)}
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>
		</>
	);
};

PostsPage.getLayout = getLayout;

export default PostsPage;
