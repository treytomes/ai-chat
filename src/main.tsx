import React from "react";
import ReactDOM from "react-dom/client";
import Home from "./app/page";
import RootLayout from "./layout";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <RootLayout>
    <Home />
  </RootLayout>
);
