type ResponseJson = {
	data: User[];
	total: number;
	page: number;
	limit: number;
};

type User = {
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

export const getUsers = async (params: Params): Promise<ResponseJson> => {
	const requestParams = new URLSearchParams({
		limit: String(params.limit),
		page: String(params.page),
		created: "1",
	});

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/user?${requestParams.toString()}`,
		{
			headers: {
				"app-id": "62996cb2689bf0731cb00285",
			},
			method: "GET",
		}
	);

	if (!response.ok) {
		throw new Error("Failed to get users");
	}

	return response.json();
};
