type Params = {
	id: string;
	text: string;
	image: string;
	likes: number;
	tags: string[];
};

export const updatePost = async (params: Params) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/post/${params.id}`,
		{
			headers: {
				"app-id": process.env.NEXT_PUBLIC_API_APP_ID!,
				"Content-Type": "application/json",
			},
			method: "PUT",
			body: JSON.stringify({
				text: params.text,
				image: params.image,
				likes: params.likes,
				tags: params.tags,
			}),
		}
	);

	if (!response.ok) {
		throw new Error("Failed to update post");
	}

	return response.json();
};
