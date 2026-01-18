import { http } from "./http";

export type AuthUser = {
  id: number;
  name: string;
  team_id: number;
};

export async function loginByName(name: string) {
  const res = await http.post<{ user: AuthUser }>("/auth/login", { name });
  return res.data.user;
}

