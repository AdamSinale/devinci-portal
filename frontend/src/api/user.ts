import { http } from "./http";
import { now_iso } from "./dates_utils";

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

export async function postMessage(title: string, message: string, user_t_name: string): Promise<Message> {
  const res = await http.post<Message>("/messages", { title, message, user_t_name, date_time: now_iso() });
  return res.data;
}

export type User = {
  t_name: string;
  name: string;
  birthday: string;
  release_date: string;
  joined_date: string;
  team_name: string;
};

export async function getUsers(): Promise<User[]> {
  const res = await http.get("/users");
  return res.data.items;
}

export type UserUpdate = {
  id: number;
  user_t_name: string;
  update: string;
  start_date_time: string;
  end_date_time: string;
};

export async function getUserUpdates(): Promise<UserUpdate[]> {
  const res = await http.get("/user_updates");
  return res.data.items;
}

export async function postUserUpdate(update: string, user_t_name: string, start_date_time: string, end_date_time: string): Promise<UserUpdate> {
  const res = await http.post<UserUpdate>("/user_updates", { user_t_name, update, start_date_time, end_date_time });
  return res.data;
}

export type TeamLink = {
  id: number;
  link: string;
  name: string;
  team_name: string;
};

export async function getTeamsLinks(team_name: string): Promise<TeamLink[]> {
  const res = await http.get(`/team_links/${team_name}`);
  return res.data;
}

export async function postLink(link: string, name: string, team_name: string): Promise<TeamLink> {
  const res = await http.post<TeamLink>("/team_links", { link, name, team_name });
  return res.data;
}
