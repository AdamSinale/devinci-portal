import { http } from "./http";

export type ForumIdea = {
  id: number;
  idea: string;
  user_t_name: string;
  team_name: string;
};

export type ForumEvent = {
  id: number;
  name: string;
  date_time: string;
  team_name: string;
};

export type AddForumEventIn = {
  name: string;
  date_time: string;
  team_name: string;
};

export type ForumScheduleItem = {
  id: number | null;
  name: string;
  date_time: string;
  team_name: string;
  minute_length: number;
  source: "generated" | "override";
};

export async function getTeamForumIdeas(teamName: string) {
  const res = await http.get<ForumIdea[]>("/forum_ideas/teamForumIdeas", {
    params: { team_name: teamName },
  });
  return res.data;
}

export async function getFutureForumSchedule() {
  const res = await http.get<ForumScheduleItem[]>("/forum_settings/futureForumSchedule");
  return res.data;
}

export async function getFutureForumEvents() {
  const res = await http.get<ForumEvent[]>("/forum_events/futureForumEvents");
  return res.data;
}

