import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { Router } from "./Router.jsx";
import "./index.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div className="w-full antialiased bg-neutral-50">
      <RouterProvider router={Router} />
    </div>
  </StrictMode>
);
