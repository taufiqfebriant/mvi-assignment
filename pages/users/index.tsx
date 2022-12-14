import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { getLayout } from "../../components/Layout";
import { inter } from "../../utils/fonts";
import { NextPageWithLayout } from "../_app";

const UsersPage: NextPageWithLayout = () => {
	let [isOpen, setIsOpen] = useState(false);

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
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

				<div className="fixed inset-0 flex items-center justify-center">
					<Dialog.Panel className="max-w-3xl rounded bg-white">
						<Dialog.Title>Deactivate account</Dialog.Title>
						<Dialog.Description>
							This will permanently deactivate your account
						</Dialog.Description>

						<p>
							Are you sure you want to deactivate your account? All of your data
							will be permanently removed. This action cannot be undone.
						</p>

						<button onClick={() => setIsOpen(false)}>Deactivate</button>
						<button onClick={() => setIsOpen(false)}>Cancel</button>
					</Dialog.Panel>
				</div>
			</Dialog>
		</>
	);
};

UsersPage.getLayout = getLayout;

export default UsersPage;
