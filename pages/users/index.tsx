import { Dialog, Listbox } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { MdCheck, MdExpandMore } from "react-icons/md";
import { z } from "zod";
import { getLayout } from "../../components/Layout";
import { createUser } from "../../requests/createUser";
import { titles } from "../../utils/constants";
import { inter } from "../../utils/fonts";
import { NextPageWithLayout } from "../_app";

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

	return (
		<>
			<button type="button" onClick={() => setIsOpen(true)}>
				Create User
			</button>

			<h1>Users page</h1>

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
											className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-slate-900 w-full"
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
											className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-slate-900 w-full"
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
											className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-slate-900 w-full"
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
											className="border border-gray-300 rounded-md h-10 px-4 focus:outline-none focus:border-slate-900 w-full"
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
										className="px-8 py-3 border border-gray-300 rounded-md font-medium text-sm text-gray-500 hover:border-slate-900 hover:text-slate-900 transition-all"
										onClick={() => setIsOpen(false)}
									>
										Close
									</button>

									<button
										type="submit"
										className="px-8 py-3 bg-slate-900 text-white rounded-md font-medium text-sm hover:bg-slate-800 transition-all"
									>
										Submit
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
