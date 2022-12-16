type Params = {
	id: string;
};

export const deleteUser = async (params: Params) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/user/${params.id}`,
		{
			headers: {
				"app-id": process.env.NEXT_PUBLIC_API_APP_ID!,
			},
			method: "DELETE",
		}
	);

	if (!response.ok) {
		throw new Error("Failed to delete user");
	}

	return response.json();
};
