import { useState } from "react";
import { Alert, Button, Card, Container, PasswordInput, Stack, TextInput, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { login } from "./api/auth";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const [tName, setTName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  const { login: setAuth } = useAuth();

  async function submit() {
    setErr(null);
    setLoading(true);
    try {
      const u = await login(tName.trim(), password);
      setAuth(u);
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
            value={tName}
            onChange={(e) => setTName(e.currentTarget.value)}
          />

          <PasswordInput
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          <Button onClick={submit} loading={loading} disabled={!tName.trim() || !password}>
            Login
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
