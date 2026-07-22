declare module "piexifjs" {
  const piexif: {
    load(data: string): Record<string, Record<number, unknown>> & {
      thumbnail?: string | null;
    };
    dump(exif: Record<string, unknown>): string;
    insert(exifBytes: string, data: string): string;
  };
  export default piexif;
}
