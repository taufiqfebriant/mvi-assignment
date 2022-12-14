import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getLayout } from "../components/Layout";
import { queries } from "../requests/keys";
import { NextPageWithLayout } from "./_app";

const HomePage: NextPageWithLayout = () => {
	const users = useQuery(queries.users.list({ limit: 10, page: 1 }));

	useEffect(() => {
		console.log("users:", users.data);
	}, [users.data]);

	return (
		<input
			type="text"
			className="border border-gray-300 w-80 h-10 px-2.5 rounded-md focus:outline-none focus:border-slate-900"
			placeholder="Search by tag..."
		/>
	);
};

HomePage.getLayout = getLayout;

export default HomePage;
