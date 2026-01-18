import { useState } from "react";
import { Alert, Button, Card, Container, Stack, TextInput, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { loginByName } from "./api/auth";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const { login } = useAuth();

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      const user = await loginByName(name.trim());
      login(user);
      nav("/");
    } catch (e: any) {
      setErr(e?.response?.data?.detail ?? e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container size="xs" py="xl">
      <Card withBorder p="lg" radius="md">
        <Stack>
          <Title order={2}>Login</Title>
          {err && <Alert color="red">{err}</Alert>}
          <TextInput
            label="t_name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Button onClick={submit} loading={loading} disabled={!name.trim()}>
            Login
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
