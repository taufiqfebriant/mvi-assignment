import { User } from "./getUsers";

type ResponseJson = {
	data: Post[];
	total: number;
	page: number;
	limit: number;
};

type Post = {
	id: string;
	image: string;
	likes: number;
	tags: string[];
	text: string;
	publishDate: string;
	updatedDate: string;
	owner: User;
};

type Params = {
	limit: number;
	page: number;
	tag?: string;
};

export const getPosts = async (params: Params) => {
	const requestParams = new URLSearchParams({
		limit: String(params.limit),
		page: String(params.page),
		created: "1",
	});

	if (params.tag) {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/tag/${
				params.tag
			}/post?${requestParams.toString()}`,
			{
				headers: {
					"app-id": process.env.NEXT_PUBLIC_API_APP_ID!,
				},
				method: "GET",
			}
		);

		if (!response.ok) {
			throw new Error("Failed to get posts by tag");
		}

		const json: ResponseJson = await response.json();

		return {
			data: json.data,
			page: json.page,
			totalPages: Math.ceil(json.total / json.limit),
		};
	}

	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/post?${requestParams.toString()}`,
		{
			headers: {
				"app-id": process.env.NEXT_PUBLIC_API_APP_ID!,
			},
			method: "GET",
		}
	);

	if (!response.ok) {
		throw new Error("Failed to get posts");
	}

	const json: ResponseJson = await response.json();

	return {
		data: json.data,
		page: json.page,
		totalPages: Math.ceil(json.total / json.limit),
	};
};
