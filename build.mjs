// Build do site estático do Empório do Saber.
// Junta head/header/footer às páginas de src/pages e gera dist/ com URLs amigáveis (/sobre/, /ensino/ ...).
// Uso: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { icons } from "./src/icons.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "src");
const dist = join(here, "dist");

// URL pública (GitHub Pages por agora; trocar quando o domínio próprio estiver definido)
const SITE_URL = "https://rodasil-angola.github.io/emporio-do-saber";

const read = (p) => readFileSync(join(src, p), "utf8");
const partials = {
  head: read("partials/head.html"),
  header: read("partials/header.html"),
  footer: read("partials/footer.html"),
};

const nav = [
  ["inicio", "", "Início"],
  ["sobre", "sobre/", "Sobre nós"],
  ["ensino", "ensino/", "Ensino"],
  ["atividades", "atividades/", "Atividades"],
  ["matriculas", "matriculas/", "Matrículas"],
  ["precario", "precario/", "Preçário"],
  ["contactos", "contactos/", "Contactos"],
];

function render(tpl, vars) {
  return tpl
    .replace(/\{\{include:([\w-]+)\}\}/g, (_, n) => read("sections/" + n + ".html"))
    .replace(/\{\{icon:([\w-]+)\}\}/g, (_, n) => {
      if (!icons[n]) throw new Error("Ícone em falta: " + n);
      return icons[n];
    })
    .replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
// cópia manual: fs.cpSync rebenta no Windows com caminhos acentuados ("Empório")
function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from, { withFileTypes: true })) {
    if (e.isDirectory()) copyDir(join(from, e.name), join(to, e.name));
    else copyFileSync(join(from, e.name), join(to, e.name));
  }
}
copyDir(join(src, "assets"), join(dist, "assets"));

const pages = readdirSync(join(src, "pages")).filter((f) => f.endsWith(".html"));
for (const file of pages) {
  const raw = read("pages/" + file);
  const metaMatch = raw.match(/^<!--\s*(\{[\s\S]*?\})\s*-->/);
  if (!metaMatch) throw new Error("Sem meta JSON: " + file);
  const meta = JSON.parse(metaMatch[1]);
  const body = raw.slice(metaMatch[0].length);
  const slug = meta.slug; // "" para a página inicial
  const ROOT = slug ? "../" : "";

  const navItems = (cls) =>
    nav
      .map(([id, href, label]) => {
        const cur = id === meta.nav ? ' aria-current="page"' : "";
        return `<li><a href="${ROOT}${href}"${cur}>${cls === "upper" ? label.toUpperCase() : label}</a></li>`;
      })
      .join("\n          ");

  const vars = {
    ROOT,
    TITLE: meta.title,
    DESCRIPTION: meta.description,
    CANONICAL: SITE_URL + "/" + slug + (slug ? "/" : ""),
    OG_IMAGE: SITE_URL + "/assets/img/" + (meta.ogImage || "alunos-celebracao.jpg"),
    SITE_URL,
    HEADER_SOLID: meta.solidHeader ? " data-solid" : "",
    NAV_DESKTOP: navItems("upper"),
    NAV_MOBILE: navItems("normal"),
    EXTRA_HEAD: meta.extraHead || "",
  };

  const html = render(
    `<!doctype html>\n<html lang="pt-AO" class="rd-no-js">\n${partials.head}\n<body>\n${partials.header}\n<main id="conteudo">\n${body}\n</main>\n${partials.footer}\n</body>\n</html>\n`,
    vars
  );
  // segundo passo: placeholders que vieram dos partials
  const out = render(html, vars);
  const dir = slug ? join(dist, slug) : dist;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), out);
  console.log("✓", (slug || "/") + " ← " + file);
}

// sitemap e robots
const urls = pages.map((f) => JSON.parse(read("pages/" + f).match(/^<!--\s*(\{[\s\S]*?\})\s*-->/)[1]).slug);
writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((s) => `  <url><loc>${SITE_URL}/${s}${s ? "/" : ""}</loc></url>`)
    .join("\n")}\n</urlset>\n`
);
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log("✓ sitemap.xml, robots.txt");
