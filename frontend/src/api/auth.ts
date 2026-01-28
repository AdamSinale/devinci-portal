import { http } from "./http";

export type LoginResult = {
  t_name: string;
  name: string;
  team_name: string | null;
  roles: string[] | null;
  release_date: string | null;
  access_token: string;
  token_type: "bearer";
};

export async function login(t_name: string, password: string): Promise<LoginResult> {
  const res = await http.post<LoginResult>("/auth/login", { t_name, password });
  const data = res.data;
  localStorage.setItem("access_token", data.access_token);
  return data;
}

export function logout() {
  localStorage.removeItem("access_token");
}
