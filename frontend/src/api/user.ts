import { http } from "./http";


export type Message = {
  id: number;
  title: string;
  message: string;
  user_t_name: string;
  date_time: string;
};

export async function getMessages(): Promise<Message[]> {
  const res = await http.get("/messages");
  return res.data.items;
}

export type User = {
  t_name: string;
  name: string;
  birthday: string;
  release_date: string;
  joined_date: string;
  team_name: string;
};

export async function getUserEvents(): Promise<User[]> {
  const res = await http.get("/users");
  return res.data.items;
}

