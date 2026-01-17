import { Container, Group, Button, Title, Text } from "@mantine/core";
import { Link } from "react-router-dom";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function PortalShell({ title, subtitle, children }: Props) {
  return (
    <div style={{ padding: "24px 0" }}>
      <Container size="lg">
        <Group justify="space-between" align="flex-end" mb="md">
          <div>
            <Title order={2}>{title}</Title>
            {subtitle ? (
              <Text c="dimmed" size="sm">
                {subtitle}
              </Text>
            ) : null}
          </div>

          <Button component={Link} to="/" variant="light">
            Home
          </Button>
        </Group>

        {children}
      </Container>
    </div>
  );
}
