import { Dialog, Listbox } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MdCheck, MdExpandMore } from "react-icons/md";
import { z } from "zod";
import { Icon } from "../../components/Icon";
import { getLayout } from "../../components/Layout";
import { createUser } from "../../requests/createUser";
import { queries } from "../../requests/keys";
import { titles } from "../../utils/constants";
import { inter } from "../../utils/fonts";
import { NextPageWithLayout } from "../_app";

const pictureSchema = z.string().url();

const UsersList = () => {
	const [page, setPage] = useState(0);

	const users = useQuery({
		...queries.users.list({ limit: 10, page }),
		keepPreviousData: true,
	});

	if (users.isLoading || users.isPreviousData) {
		return (
			<div className="flex justify-center items-center mt-10">
				<Icon
					id="spinner"
					className="h-8 w-8 animate-spin fill-black text-gray-300"
				/>
			</div>
		);
	}

	if (users.isError) {
		return <p>Something went wrong.</p>;
	}

	if (!users.data.data.length) {
		return <p>No users yet.</p>;
	}

	const validatePicture = (
		params: Pick<typeof users["data"]["data"][number], "picture">
	) => {
		return pictureSchema.safeParse(params.picture).success;
	};

	return (
		<>
			<div className="border border-gray-300 rounded-md mt-10">
				<table className="w-full">
					<thead className="border-b border-gray-300">
						<tr className="h-10">
							<th className="border-r border-gray-300">Name</th>
							<th className="border-r border-gray-300">Picture</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{users.data.data.map((user, index) => (
							<tr
								key={user.id}
								className={clsx("border-gray-300 h-14", {
									"border-b": index + 1 !== users.data.data.length,
								})}
							>
								<td className="border-r border-gray-300 px-4">
									{user.firstName} {user.lastName}
								</td>
								<td className="border-r border-gray-300">
									<div className="flex justify-center">
										{validatePicture({ picture: user.picture }) ? (
											<div className="relative h-[40px] w-[40px]">
												<Image
													fill={true}
													src={user.picture}
													alt="User picture"
													className="object-cover"
													sizes="100%"
												/>
											</div>
										) : (
											"-"
										)}
									</div>
								</td>
								<td>
									<div className="flex justify-center gap-x-1">
										<button type="button">Edit</button>
										<span>|</span>
										<button type="button" className="text-red-500">
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
					disabled={page === 1}
					className={clsx({ underline: page !== 1 })}
				>
					Previous
				</button>

				<div className="flex gap-x-3">
					{Array.from({ length: users.data.totalPages }, (_, i) => i).map(
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
					disabled={page === users.data.totalPages}
					className={clsx({ underline: page !== users.data.totalPages })}
				>
					Next
				</button>
			</div>
		</>
	);
};

const schema = z.object({
	title: z.enum(titles, { required_error: "Please choose a title." }),
	firstName: z.string().min(1, { message: "Please enter your first name." }),
	lastName: z.string().min(1, { message: "Please enter your last name." }),
	email: z.string().email({ message: "Please enter a valid email." }),
	picture: z.string().url({ message: "Please enter a valid URL." }),
});

type Schema = z.infer<typeof schema>;

const UsersPage: NextPageWithLayout = () => {
	let [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();
	const [isSuccess, setIsSuccess] = useState(false);

	const form = useForm<Schema>({ resolver: zodResolver(schema) });
	const createUserMutation = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries();
		},
	});

	const onSubmit = (data: Schema) => {
		createUserMutation.mutate(data);
		setIsOpen(false);
		setIsSuccess(true);
	};

	const mutationIsLoading =
		form.formState.isSubmitting || createUserMutation.isLoading;

	return (
		<>
			<div className="max-w-2xl mx-auto">
				<div className="flex justify-center">
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						className="bg-black text-white px-6 py-3 font-medium rounded-md"
					>
						Create User
					</button>
				</div>

				<UsersList />
			</div>

			<Dialog
				open={isOpen}
				onClose={() => setIsOpen(false)}
				className={`relative z-50 ${inter.className} font-sans`}
			>
				<div className="fixed inset-0 bg-black/50" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center">
					<Dialog.Panel className="w-[42rem] rounded-md bg-white p-8">
						<div className="max-w-md mx-auto">
							<Dialog.Title className="font-semibold text-xl text-center">
								Create User
							</Dialog.Title>

							<form onSubmit={form.handleSubmit(onSubmit)}>
								<div className="flex flex-col gap-y-4">
									<Controller
										control={form.control}
										name="title"
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
																		? value.charAt(0).toUpperCase() +
																		  value.slice(1)
																		: "Title"}
																</span>
																<MdExpandMore className="text-2xl" />
															</Listbox.Button>

															<Listbox.Options className="border-x border-b border-gray-300 rounded-b-md flex flex-col divide-y divide-gray-300 absolute w-full bg-white shadow">
																{titles.map((title) => (
																	<Listbox.Option
																		key={title}
																		value={title}
																		className="h-10 flex items-center px-4 cursor-default hover:bg-gray-100 justify-between"
																	>
																		{({ selected }) => (
																			<>
																				<span>
																					{title.charAt(0).toUpperCase() +
																						title.slice(1)}
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

												{form.formState.errors.title ? (
													<p className="mt-1 text-sm text-red-500">
														{form.formState.errors.title.message}
													</p>
												) : null}
											</div>
										)}
									/>

									<div>
										<input
											{...form.register("firstName")}
											placeholder="First Name"
											className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
										/>

										{form.formState.errors.firstName ? (
											<p className="mt-1 text-sm text-red-500">
												{form.formState.errors.firstName.message}
											</p>
										) : null}
									</div>

									<div>
										<input
											{...form.register("lastName")}
											placeholder="Last Name"
											className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
										/>

										{form.formState.errors.lastName ? (
											<p className="mt-1 text-sm text-red-500">
												{form.formState.errors.lastName.message}
											</p>
										) : null}
									</div>

									<div>
										<input
											{...form.register("email")}
											type="email"
											placeholder="Email"
											className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
										/>

										{form.formState.errors.email ? (
											<p className="mt-1 text-sm text-red-500">
												{form.formState.errors.email.message}
											</p>
										) : null}
									</div>

									<div>
										<input
											{...form.register("picture")}
											placeholder="Picture"
											className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-black w-full"
										/>

										{form.formState.errors.picture ? (
											<p className="mt-1 text-sm text-red-500">
												{form.formState.errors.picture.message}
											</p>
										) : null}
									</div>
								</div>

								<div className="flex justify-end mt-6 gap-x-4">
									<button
										type="button"
										className="px-8 py-3 border border-gray-300 rounded-md font-medium text-sm text-gray-500 hover:border-black hover:text-black transition-all"
										onClick={() => setIsOpen(false)}
									>
										Close
									</button>

									<button
										type="submit"
										disabled={mutationIsLoading}
										className="px-8 py-3 text-white rounded-md font-medium text-sm hover:bg-[#181818] transition-all disabled:bg-black/80 bg-black"
									>
										{mutationIsLoading ? (
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
						</div>
					</Dialog.Panel>
				</div>
			</Dialog>
		</>
	);
};

UsersPage.getLayout = getLayout;

export default UsersPage;
