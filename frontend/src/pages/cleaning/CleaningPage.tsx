// src/pages/cleaning/CleaningPage.tsx
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Group,
  Loader,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePickerInput, type DatesRangeValue } from "@mantine/dates";
import { IconPlus, IconPencil, IconTrash } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import PortalShell from "../components/PortalShell";
import { useAsync } from "../components/handlers";
import {
  type CleaningDuty,
  createCleaningDuty,
  deleteCleaningDuty,
  getCleaningDuties,
  getUserEventsInRange,
  updateCleaningDuty,
} from "../../api/http";

type FormState = {
  id?: number;
  username1: string;
  username2: string;
  range: DatesRangeValue;
};

type AuthUser = { username: string; roles: string[] };
function useAuth(): { user: AuthUser | null } {
  return { user: { username: "adam sin", roles: ["CLEANING_MANAGER"] } };
}

function toDateOnly(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function toIsoDate(date: Date | string | null): string | null {
  if (!date) return null;
  if (typeof date === "string") return date; // כבר ISO
  return date.toISOString();
}

export default function CleaningPage() {
  const { user } = useAuth();
  const isManager = !!user?.roles?.includes("CLEANING_MANAGER");

  const { data, loading, err, reload } = useAsync<CleaningDuty[]>(
    () => getCleaningDuties(),
    []
  );

  const sorted = useMemo(() => {
    const rows = [...(data ?? [])];
    rows.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    return rows;
  }, [data]);

  const [modalOpen, setModalOpen] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    username1: "",
    username2: "",
    range: [null, null],
  });

  function openCreate() {
    setFormErr(null);
    setForm({ username1: "", username2: "", range: [null, null] });
    setModalOpen(true);
  }

  function openEdit(row: CleaningDuty) {
    setFormErr(null);
    setForm({
      id: row.id,
      username1: row.username1,
      username2: row.username2,
      range: [new Date(row.start_date), new Date(row.end_date)],
    });
    setModalOpen(true);
  }

  async function precheckUserConflicts(username: string, startIso: string, endIso: string) {
    const events = await getUserEventsInRange(username, startIso, endIso);
    if (events.length > 0) {
      // מספיק משפט קצר, בלי לפרט יותר מדי
      return `למשתמש "${username}" יש אירועים (UserEvent) בטווח התאריכים שנבחר. אי אפשר לשבץ אותו.`;
    }
    return null;
  }

  async function onSave() {
    setFormErr(null);

    const [start, end] = form.range;
    if (!form.username1.trim() || !form.username2.trim()) {
      setFormErr("חייב למלא username1 ו-username2");
      return;
    }
    if (!start || !end) {
      setFormErr("חייב לבחור טווח תאריכים (start/end)");
      return;
    }

    const startIso = toIsoDate(start);
    const endIso = toIsoDate(end);
    if (!startIso || !endIso) {
      throw new Error("בחר טווח תאריכים מלא");
    }
    
    try {
      setBusySave(true);

      // 1) בדיקת התנגשות בפרונט (שני המשתמשים)
      const conflict1 = await precheckUserConflicts(form.username1.trim(), startIso, endIso);
      if (conflict1) throw new Error(conflict1);

      const conflict2 = await precheckUserConflicts(form.username2.trim(), startIso, endIso);
      if (conflict2) throw new Error(conflict2);

      // 2) שמירה
      if (form.id) {
        await updateCleaningDuty(form.id, {
          username1: form.username1.trim(),
          username2: form.username2.trim(),
          start_date: startIso,
          end_date: endIso,
        });
      } else {
        await createCleaningDuty({
          username1: form.username1.trim(),
          username2: form.username2.trim(),
          start_date: startIso,
          end_date: endIso,
        });
      }

      setModalOpen(false);
      reload();
    } catch (e: any) {
      // אם הבקאנד מחזיר 409/400 עם detail — זה יגיע לכאן
      setFormErr(e?.response?.data?.detail ?? e?.message ?? "שמירה נכשלה");
    } finally {
      setBusySave(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("למחוק את התורנות?")) return;
    try {
      await deleteCleaningDuty(id);
      reload();
    } catch (e: any) {
      alert(e?.response?.data?.detail ?? "מחיקה נכשלה");
    }
  }

  return (
    <PortalShell title="Cleaning" subtitle="Weekly cleaning duty roster">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Cleaning Duties</Title>
          <Text c="dimmed" size="sm">
            {isManager
              ? "כמנהל ניקיון אתה יכול להוסיף/לערוך/למחוק תורנויות."
              : "אין לך הרשאות עריכה — אתה יכול רק לצפות."}
          </Text>
        </div>

        <Group>
          <Button variant="light" onClick={reload} disabled={loading}>
            Refresh
          </Button>

          {isManager && (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
              Add duty
            </Button>
          )}
        </Group>
      </Group>

      {loading && <Loader />}
      {err && <Alert color="red">{String(err)}</Alert>}

      {!loading && !err && (
        <Card withBorder radius="md" p="lg">
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>username1</Table.Th>
                <Table.Th>username2</Table.Th>
                <Table.Th>start_date</Table.Th>
                <Table.Th>end_date</Table.Th>
                {isManager && <Table.Th w={120}>actions</Table.Th>}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {sorted.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={isManager ? 5 : 4}>
                    <Text c="dimmed">אין תורנויות עדיין.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                sorted.map((row) => (
                  <Table.Tr key={row.id}>
                    <Table.Td>{row.username1}</Table.Td>
                    <Table.Td>{row.username2}</Table.Td>
                    <Table.Td>{toDateOnly(row.start_date)}</Table.Td>
                    <Table.Td>{toDateOnly(row.end_date)}</Table.Td>

                    {isManager && (
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon variant="light" onClick={() => openEdit(row)}>
                            <IconPencil size={16} />
                          </ActionIcon>
                          <ActionIcon color="red" variant="light" onClick={() => onDelete(row.id)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? "Edit duty" : "Add duty"}
        centered
      >
        <Stack>
          {formErr && <Alert color="red">{formErr}</Alert>}

          <TextInput
            label="username1"
            placeholder="e.g. adam sin"
            value={form.username1}
            onChange={(e) => setForm((f) => ({ ...f, username1: e.target.value }))}
          />

          <TextInput
            label="username2"
            placeholder="e.g. john doe"
            value={form.username2}
            onChange={(e) => setForm((f) => ({ ...f, username2: e.target.value }))}
          />

          <DatePickerInput
            type="range"
            value={form.range}
            onChange={(range) =>
              setForm((f) => ({
                ...f,
                range: range ?? [null, null],
              }))
            }
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onSave} loading={busySave}>
              Save
            </Button>
          </Group>

          <Text size="xs" c="dimmed">
            הערה: גם הבקאנד צריך לאכוף את בדיקת ההתנגשות (UserEvent), כדי שלא יעקפו את זה.
          </Text>
        </Stack>
      </Modal>
    </PortalShell>
  );
}
