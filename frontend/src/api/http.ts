import axios from "axios";
import { now_iso } from "../utils/dates_utils";

export const http = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


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

export type Team = {
  name: string;
};

export async function getTeams(): Promise<Team[]> {
  const res = await http.get(`/teams`);
  return res.data.items;
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

export type ForumIdea = {
  id: number;
  idea: string;
  user_t_name: string;
  team_name: string;
};

export async function getTeamForumIdeas(team_name: string): Promise<ForumIdea[]> {
  const res = await http.get(`/forum_ideas/teamForumIdeas/${team_name}`);
  return res.data;
}

export type ForumScheduleItem = {
  id: number | null;
  name: string;
  date_time: string;
  team_name: string;
  minute_length: number;
  source: "generated" | "override";
};

export async function getFutureForumSchedule() {
  const res = await http.get<ForumScheduleItem[]>("/forum_settings/futureForumSchedule");
  return res.data;
}

export type ForumEvent = {
  id: number;
  name: string;
  date_time: string;
  team_name: string;
};

export async function getFutureForumEvents() {
  const res = await http.get<ForumEvent[]>("/forum_events/futureForumEvents");
  return res.data;
}

export type UserEvent = {
  id: number;
  username: string;
  date_time: string;
};

export async function get_user_events_in_range(username: string, startIso: string, endIso: string): Promise<UserEvent[]> {
  const res = await http.get("/api/user_events", {params: { username, start: startIso, end: endIso }});
  return res.data;
}

export type CleaningDuty = {
  id : number | null;
  name1: string;
  name2: string;
  start_date: string; 
  end_date: string;   
};
export type CleaningDutyCreate = Omit<CleaningDuty, "id">;
export type CleaningDutyUpdate = Partial<CleaningDutyCreate>;

export async function get_cleaning_duties(): Promise<CleaningDuty[]> {
  const res = await http.get("/cleaning_duties");
  return res.data.items;
}

export async function create_cleaning_duty(payload: CleaningDutyCreate): Promise<CleaningDuty> {
  const res = await http.post("/cleaning_duties", payload);
  return res.data;
}

export async function update_cleaning_duty(id: number, payload: CleaningDutyUpdate): Promise<CleaningDuty> {
  const res = await http.patch(`/cleaning_duties/${id}`, payload);
  return res.data;
}

export async function delete_cleaning_duty(id: number): Promise<void> {
  await http.delete(`/cleaning_duties/${id}`);
}
