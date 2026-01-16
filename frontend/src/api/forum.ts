import { http } from "./http";

export type ForumIdea = {
  id: number;
  idea: string;
  user_id: number;
  team_id: number;
};

export type ForumEvent = {
  id: number;
  name: string;
  date_time: string;
  team_id: number;
};

export type ForumSettings = {
  first_forum_datetime: string;
  participants_order: string[];
};

export type AddForumEventIn = {
  name: string;
  date_time: string;
  team_id: number;
};

export async function getTeamForumIdeas(teamId: number) {
  const res = await http.get<ForumIdea[]>("/forum/teamForumIdeas", {
    params: { team_id: teamId },
  });
  return res.data;
}

export async function getFutureForumEvents() {
  const res = await http.get<ForumEvent[]>("/forum/futureForumEvents");
  return res.data;
}

export async function getForumSettings() {
  const res = await http.get<ForumSettings>("/forum/ForumSettings");
  return res.data;
}

export async function addForumEvent(payload: AddForumEventIn) {
  const res = await http.post<ForumEvent>("/forum/addForumEvent", payload);
  return res.data;
}
