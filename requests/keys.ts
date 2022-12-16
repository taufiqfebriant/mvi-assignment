import { createQueryKeyStore } from "@lukemorales/query-key-factory";
import { getPosts } from "./getPosts";
import { getUsers } from "./getUsers";

type UsersListFilters = {
	limit: number;
	page: number;
};

type PostsListFilters = {
	limit: number;
	page: number;
	tag?: string;
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
	posts: {
		list: (filters: PostsListFilters) => ({
			queryKey: [{ ...filters }],
			queryFn: () =>
				getPosts({
					limit: filters.limit,
					page: filters.page,
					tag: filters.tag,
				}),
		}),
	},
});
