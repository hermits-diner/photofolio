import type { SchemaTypeDefinition } from "sanity";

import { exhibition } from "./exhibition";
import { photo } from "./photo";
import { photobook } from "./photobook";
import { series } from "./series";
import { siteSettings } from "./siteSettings";

export const schemaTypes: SchemaTypeDefinition[] = [
  siteSettings,
  series,
  photo,
  photobook,
  exhibition,
];
