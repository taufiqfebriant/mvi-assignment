import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { getUsers } from "./getUsers";

type UsersListFilters = {
	limit: number;
	page: number;
};

export const queries = createQueryKeyStore({
	users: {
		list: (filters: UsersListFilters) => ({
			queryKey: [{ ...filters }],
			queryFn: () =>
				getUsers({
					limit: filters.limit,
					page: filters.page,
				}),
		}),
	},
});
