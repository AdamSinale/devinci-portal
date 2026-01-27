import { Card, Text, Stack, Group, Badge, Divider } from "@mantine/core";
import type { UserUpdate } from "../../api/http";
import { convert_iso_to_Date, set_date_IL, today_Date } from "../../api/dates_utils";

export type UpdateRow = { e: UserUpdate; start: Date; end: Date };


export function get_row_dates(updates: UserUpdate[]): UpdateRow[] {
  return updates
    .map((e) => {
      const s = convert_iso_to_Date(e.start_date_time);
      const en = convert_iso_to_Date(e.end_date_time);
      if (!s || !en) return null;
      return { e, start: s, end: en };
    })
    .filter(Boolean) as UpdateRow[];
}

export function closest_upcoming_updates(rows: UpdateRow[]): UpdateRow[] {
  const now = new Date();
  return rows
    .filter(({ end }) => end.getTime() >= now.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function recent_ended_updates(rows: UpdateRow[]): UpdateRow[] {
  const now = new Date();
  return rows
    .filter(({ end }) => end.getTime() < now.getTime())
    .sort((a, b) => b.start.getTime() - a.start.getTime());
}


type Props = {
  title: string;
  badgeText: string;
  rows: UpdateRow[];
};

export function UpdatesPanel({ title, badgeText, rows }: Props) {
  const today = today_Date(new Date());
  const isToday = (dt: Date) => today_Date(dt).getTime() === today.getTime();

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
        {rows.map(({ e, start, end }) => (
          <Card key={e.id} withBorder radius="md" p="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={700}>{e.update}</Text>
                <Text size="sm" c="dimmed">
                  @{e.user_t_name}
                </Text>
              </div>

              <Stack gap={6} align="flex-end">
                <Badge variant={ isToday(start) ? "filled" : "light"}> 
                  {set_date_IL(start)}
                </Badge>
                <Text size="xs" c="dimmed">
                  {set_date_IL(start)} → {set_date_IL(end)}
                </Text>
              </Stack>
            </Group>
          </Card>
        ))}

        {rows.length === 0 && <Text c="dimmed">Didn't find results</Text>}
      </Stack>
    </Card>
  );
}
