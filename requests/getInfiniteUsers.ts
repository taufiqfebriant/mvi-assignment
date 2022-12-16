export type ResponseJson = {
	data: User[];
	total: number;
	page: number;
	limit: number;
};

export type User = {
	id: string;
	title: string;
	firstName: string;
	lastName: string;
	picture: string;
};

type Params = {
	limit: number;
	page: number;
};

export const getInfiniteUsers = async (params: Params) => {
	const requestParams = new URLSearchParams({
		limit: String(params.limit),
		page: String(params.page),
		created: "1",
	});

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/user?${requestParams.toString()}`,
		{
			headers: {
				"app-id": process.env.NEXT_PUBLIC_API_APP_ID!,
			},
			method: "GET",
		}
	);

	if (!response.ok) {
		throw new Error("Failed to get users");
	}

	const json: ResponseJson = await response.json();

	const totalPages = Math.ceil(json.total / json.limit) - 1;
	const nextPage =
		json.page === totalPages || totalPages === 0 ? undefined : json.page + 1;

	return {
		data: json.data,
		page: json.page,
		totalPages,
		nextPage,
	};
};
