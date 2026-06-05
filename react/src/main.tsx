/// <reference types="@arcgis/map-components/types/react" />
/// <reference types="@esri/calcite-components/types/react" />
// / <reference types="@esri/calcite-components/types/components" />
/// <reference types="@esri/calcite-components/types/components" />

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/cmp/App";

const root = document.getElementById("root");
if (root === null) throw new Error("Root element not found");

createRoot(root).render(
    <StrictMode>
        <App />
    </StrictMode>
);