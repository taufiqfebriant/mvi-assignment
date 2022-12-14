type Params = {
	title: string;
	firstName: string;
	lastName: string;
	email: string;
	picture: string;
};

export const createUser = async (params: Params) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_API_URL}/user/create`,
		{
			headers: {
				"app-id": process.env.NEXT_PUBLIC_API_APP_ID!,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify({
				title: params.title,
				firstName: params.firstName,
				lastName: params.lastName,
				email: params.email,
				picture: params.picture,
			}),
		}
	);

	if (!response.ok) {
		throw new Error("Failed to create user");
	}

	return response.json();
};
