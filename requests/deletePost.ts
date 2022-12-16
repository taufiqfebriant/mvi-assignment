type Params = {
	id: string;
};

export const deletePost = async (params: Params) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/post/${params.id}`,
		{
			headers: {
				"app-id": process.env.NEXT_PUBLIC_API_APP_ID!,
			},
			method: "DELETE",
		}
	);

	if (!response.ok) {
		throw new Error("Failed to delete post");
	}

	return response.json();
};
