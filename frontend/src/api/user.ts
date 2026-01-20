import { http } from "./http";


export type Message = {
  id: number;
  title: string;
  message: string;
  user_t_name: string;
  date_time: string;
};

export async function fetchMessages(): Promise<Message[]> {
  const res = await http.get("/messages");
  return res.data.items;
}

