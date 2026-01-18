import { http } from "./http";

export type LoginResult = {
  name: string;
  team_name: string|null;
  release_date: string;
};

export async function loginByName(name: string) {
  const res = await http.post<LoginResult>("/auth/login", { name });
  return res.data;
}

