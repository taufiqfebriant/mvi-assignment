type Params = {
	text: string;
	image: string;
	likes: number;
	tags: string[];
	owner: string;
};

export const createPost = async (params: Params) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/post/create`,
		{
			headers: {
				"app-id": "62996cb2689bf0731cb00285",
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify({
				text: params.text,
				image: params.image,
				likes: params.likes,
				tags: params.tags,
				owner: params.owner,
			}),
		}
	);

	if (!response.ok) {
		throw new Error("Failed to create post");
	}

	return response.json();
};
