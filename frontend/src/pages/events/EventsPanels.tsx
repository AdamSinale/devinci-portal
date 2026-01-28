import {
  Card,
  Text,
  Stack,
  Group,
  Badge,
  Divider,
} from "@mantine/core";
import type { User } from "../../api/http";
import { convert_iso_to_Date, set_date_IL, today_Date } from "../../utils/dates_utils";

export type EventRow = { user: User; event: Date };


function next_birthday(birthday: Date, today: Date): Date {
  const t = today_Date(today);
  const thisYear = new Date(t.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (thisYear.getTime() >= t.getTime()) return thisYear;
  return new Date(t.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
}

export function get_sorted_birthday(users: User[]): EventRow[] {
  const today = today_Date(new Date());
  const rows = users
    .map((user) => {
      const b = convert_iso_to_Date(user.birthday);
      if (!b) return null;
      const next_bd = next_birthday(b, today);
      return { user, event: next_bd };
    })
    .filter(Boolean) as EventRow[];
  rows.sort((a, b) => a.event.getTime() - b.event.getTime());
  return rows;
}

export function get_sorted_releases(users: User[]): EventRow[] {
  const rows = users
    .map((user) => {
      const release = convert_iso_to_Date(user.release_date);
      if (!release) return null;
      return { user, event: release };
    })
    .filter(Boolean) as EventRow[];
  rows.sort((a, b) => a.event.getTime() - b.event.getTime());
  return rows;
}


type Props = {
  title: string;
  badgeText: string;
  rows: EventRow[];
};

export function EventsPanel({ title, badgeText, rows }: Props) {
  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="xs">
        <Text fw={700} size="lg">
          {title}
        </Text>
        <Badge variant="light">{badgeText}</Badge>
      </Group>

      <Divider my="sm" />

      <Stack gap="sm">
        {rows.map(({ user, event }) => (
          <Card key={user.t_name} withBorder radius="md" p="md">
            <Group justify="space-between">
              <Text fw={700}>{user.name}</Text>
              <Badge variant="light">{set_date_IL(event)}</Badge>
            </Group>
            <Text size="sm" c="dimmed">
              {user.t_name}
            </Text>
          </Card>
        ))}

        {rows.length === 0 && <Text c="dimmed">Didn't find results</Text>}
      </Stack>
    </Card>

  );
}
