/** Public files need the same build-time prefix as Next routes in previews. */
export function publicAsset(path: string): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}
