import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./src/sanity/env";

/**
 * CLI commands (dataset import/export, etc.) read the project from here.
 * The values come from .env.local, which the CLI loads Vite-style.
 */
export default defineCliConfig({ api: { projectId, dataset } });
