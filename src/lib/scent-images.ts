const SCENT_MAP: Record<string, { folder: string; prefix: string }> = {
  "oud-essence":     { folder: "Oud Essence",     prefix: "oud_essence" },
  "forget-me-not":   { folder: "Forget me not",   prefix: "forget_me_not" },
  "honeysuckle":     { folder: "Honeysuckle",      prefix: "honeysuckle" },
  "rose-geranium":   { folder: "Rose Geranium",    prefix: "rose_geranium" },
  "strawberry-rose": { folder: "Strawberry Rose",  prefix: "strawberry_rose" },
  "tea-rose":        { folder: "Tea Rose",          prefix: "tea_rose" },
  "vanilla":         { folder: "Vanilla",           prefix: "vanilla" },
  "musk":            { folder: "Musk",              prefix: "musk" },
  "green-apple":     { folder: "Green Apple",       prefix: "green_apple" },
};

function base(slug: string) {
  const m = SCENT_MAP[slug];
  if (!m) return null;
  const folder = m.folder.replace(/ /g, "%20");
  return `/images/scents/${folder}/${m.prefix}`;
}

export function getProductImages(slug: string): [string, string, string] {
  const b = base(slug);
  if (!b) return ["", "", ""];
  return [`${b}_1.png`, `${b}_2.png`, `${b}_3.png`];
}

export function getCarouselImages(slugs: string[]): string[] {
  return slugs.flatMap((slug) => {
    const b = base(slug);
    if (!b) return [];
    return [`${b}_1.png`, `${b}_rand_1.png`, `${b}_rand_2.png`];
  });
}
