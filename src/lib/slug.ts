export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug plus a short random suffix to avoid collisions without a lookup. */
export function uniqueSlug(input: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${slugify(input) || "org"}-${suffix}`;
}
