import { Dialog, Listbox } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Toast from "@radix-ui/react-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { atom, useAtom } from "jotai";
import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MdCheck, MdClose, MdExpandMore } from "react-icons/md";
import { z } from "zod";
import { Icon } from "../../components/Icon";
import { getLayout } from "../../components/Layout";
import { createUser } from "../../requests/createUser";
import { deleteUser } from "../../requests/deleteUser";
import { getUsers } from "../../requests/getUsers";
import { queries } from "../../requests/keys";
import { updateUser } from "../../requests/updateUser";
import { titles } from "../../utils/constants";
import { inter } from "../../utils/fonts";
import { NextPageWithLayout } from "../_app";

const pictureSchema = z.string().url();

const selectedUserAtom = atom<
	Awaited<ReturnType<typeof getUsers>>["data"][number] | null
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
	title: z.string().min(1, { message: "Please choose a title." }),
	firstName: z.string().min(1, { message: "Please enter your first name." }),
	lastName: z.string().min(1, { message: "Please enter your last name." }),
	picture: z.string().url({ message: "Please enter a valid URL." }),
});

const hasEmail = z.object({
	email: z.string().email({ message: "Please enter a valid email." }),
});

const createSchema = editSchema.merge(hasEmail);

type CreateSchema = z.infer<typeof createSchema>;
type EditSchema = z.infer<typeof editSchema>;

const CreateForm = () => {
	const form = useForm<CreateSchema>({ resolver: zodResolver(createSchema) });
	const queryClient = useQueryClient();

	const [, setIsFormDialogOpen] = useAtom(isFormDialogOpenAtom);
	const [, setToastContent] = useAtom(toastContentAtom);

	const mutation = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries();
			setIsFormDialogOpen(false);
			setToastContent({
				message: "User created successfully.",
				type: "success",
			});
		},
	});

	const onSubmit = (data: CreateSchema) => {
		mutation.mutate(data);
	};

	const isMutating = form.formState.isSubmitting || mutation.isLoading;

	return (
		<>
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
								<Listbox
									{...rest}
									defaultValue={value}
									as="div"
									className="relative"
								>
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
														? value.charAt(0).toUpperCase() + value.slice(1)
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
	user: Awaited<ReturnType<typeof getUsers>>["data"][number];
};

const EditForm = (props: EditFormProps) => {
	const form = useForm<EditSchema>({
		resolver: zodResolver(editSchema),
		defaultValues: {
			title: props.user.title,
			firstName: props.user.firstName,
			lastName: props.user.lastName,
			picture: props.user.picture,
		},
	});

	const [, setIsFormDialogOpen] = useAtom(isFormDialogOpenAtom);
	const [, setToastContent] = useAtom(toastContentAtom);
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: updateUser,
		onSuccess: () => {
			queryClient.invalidateQueries();
			setIsFormDialogOpen(false);
			setToastContent({
				message: "User updated successfully.",
				type: "success",
			});
		},
	});

	const onSubmit = (data: EditSchema) => {
		mutation.mutate({ ...data, id: props.user.id });
	};

	const isMutating = form.formState.isSubmitting || mutation.isLoading;

	return (
		<>
			<Dialog.Title className="font-semibold text-xl text-center">
				Edit User
			</Dialog.Title>

			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-y-4">
					<Controller
						control={form.control}
						name="title"
						render={({ field: { value, ...rest } }) => (
							<div>
								<Listbox
									{...rest}
									defaultValue={value}
									as="div"
									className="relative"
								>
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
														? value.charAt(0).toUpperCase() + value.slice(1)
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

const UsersList = () => {
	const [page, setPage] = useState(0);
	const [, setIsFormDialogOpen] = useAtom(isFormDialogOpenAtom);
	const [, setIsConfirmDialogOpen] = useAtom(isConfirmDialogOpenAtom);
	const [, setImagePreviewDialogOpen] = useAtom(isImagePreviewDialogOpenAtom);
	const [, setSelectedUser] = useAtom(selectedUserAtom);

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
											<button
												type="button"
												className="relative h-[40px] w-[40px]"
												onClick={() => {
													setSelectedUser(user);
													setImagePreviewDialogOpen(true);
												}}
											>
												<Image
													fill={true}
													src={user.picture}
													alt="User picture"
													className="object-cover"
													sizes="100%"
												/>
											</button>
										) : (
											"-"
										)}
									</div>
								</td>
								<td>
									<div className="flex justify-center gap-x-1">
										<button
											type="button"
											onClick={() => {
												setSelectedUser(user);
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
												setSelectedUser(user);
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
					disabled={page + 1 === users.data.totalPages}
					className={clsx({
						underline: page + 1 !== users.data.totalPages,
					})}
				>
					Next
				</button>
			</div>
		</>
	);
};

const UsersPage: NextPageWithLayout = () => {
	const [isFormDialogOpen, setIsFormDialogOpen] = useAtom(isFormDialogOpenAtom);
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useAtom(
		isConfirmDialogOpenAtom
	);
	const [isImagePreviewDialogOpen, setIsImagePreviewDialogOpen] = useAtom(
		isImagePreviewDialogOpenAtom
	);

	const [selectedUser, setSelectedUser] = useAtom(selectedUserAtom);

	const [toastContent, setToastContent] = useAtom(toastContentAtom);

	const queryClient = useQueryClient();

	const deleteUserMutation = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries();
			setIsConfirmDialogOpen(false);
			setToastContent({
				message: "User deleted successfully.",
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
							setSelectedUser(null);
						}}
						className="bg-black text-white px-6 py-3 font-medium rounded-md"
					>
						Create User
					</button>
				</div>

				<UsersList />
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
									disabled={deleteUserMutation.isLoading}
									onClick={() => {
										if (selectedUser) {
											deleteUserMutation.mutate({ id: selectedUser.id });
										}
									}}
								>
									{deleteUserMutation.isLoading ? (
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
							{selectedUser ? <EditForm user={selectedUser} /> : <CreateForm />}
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
							{selectedUser ? (
								<Image
									fill={true}
									src={selectedUser.picture}
									alt="User picture"
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

UsersPage.getLayout = getLayout;

export default UsersPage;
