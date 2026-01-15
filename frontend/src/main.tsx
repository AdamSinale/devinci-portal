import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light">
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>,
);
