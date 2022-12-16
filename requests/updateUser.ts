type Params = {
	id: string;
	title: string;
	firstName: string;
	lastName: string;
	picture: string;
};

export const updateUser = async (params: Params) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/user/${params.id}`,
		{
			headers: {
				"app-id": process.env.NEXT_PUBLIC_API_APP_ID!,
				"Content-Type": "application/json",
			},
			method: "PUT",
			body: JSON.stringify({
				title: params.title,
				firstName: params.firstName,
				lastName: params.lastName,
				picture: params.picture,
			}),
		}
	);

	if (!response.ok) {
		throw new Error("Failed to update user");
	}

	return response.json();
};
