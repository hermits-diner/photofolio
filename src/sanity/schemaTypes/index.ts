import type { SchemaTypeDefinition } from "sanity";

import { photo } from "./photo";
import { series } from "./series";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [siteSettings, series, photo];
