import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

type PrerenderRoute = {
  canonicalPath: string;
  description: string;
  path: string;
  title: string;
  type: "article" | "website";
};

type ServerEntry = {
  getPrerenderRoutes: () => PrerenderRoute[];
  renderRoute: (pathname: string) => Promise<string>;
};

const SITE_ORIGIN = "https://shuklabhay.github.io";
const DEFAULT_SOCIAL_IMAGE_PATH = "/static/landing-1280.webp";
const SOCIAL_IMAGE_ALT = "Abhay Shukla portfolio landing image";
const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const DIST_DIR = path.join(PROJECT_ROOT, "dist");
const DIST_SSR_DIR = path.join(PROJECT_ROOT, "dist-ssr");

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function replaceRequiredHtml(
  html: string,
  pattern: RegExp,
  replacement: string,
  label: string,
): string {
  if (!pattern.test(html)) {
    throw new Error(`Missing ${label} in app shell HTML`);
  }
  return html.replace(pattern, replacement);
}

function routeFilePath(routePath: string): string {
  if (routePath === "/") return path.join(DIST_DIR, "index.html");
  return path.join(DIST_DIR, routePath.replace(/^\/+/, ""), "index.html");
}

function addClassToTag(
  html: string,
  tagName: string,
  className: string,
): string {
  return html.replace(
    new RegExp(`<${tagName}([^>]*)>`),
    (_match: string, attrs: string): string => {
      const classMatch = attrs.match(/\sclass="([^"]*)"/);
      if (classMatch) {
        const classes = new Set(classMatch[1].split(/\s+/).filter(Boolean));
        classes.add(className);
        return `<${tagName}${attrs.replace(
          /\sclass="[^"]*"/,
          ` class="${Array.from(classes).join(" ")}"`,
        )}>`;
      }
      return `<${tagName}${attrs} class="${className}">`;
    },
  );
}

function createPrerenderedHtml(
  appShellHtml: string,
  route: PrerenderRoute,
  appHtml: string,
): string {
  const canonicalUrl = `${SITE_ORIGIN}${route.canonicalPath}`;
  const socialImageUrl = `${SITE_ORIGIN}${DEFAULT_SOCIAL_IMAGE_PATH}`;
  const escapedTitle = escapeHtmlAttribute(route.title);
  const escapedDescription = escapeHtmlAttribute(route.description);
  const escapedImageAlt = escapeHtmlAttribute(SOCIAL_IMAGE_ALT);
  const isHomeVisualRoute = route.path === "/" || route.path === "/contact";
  let html = appShellHtml;

  if (!isHomeVisualRoute) {
    html = html.replace(
      /\s*<link\s+rel="preload"\s+href="\/static\/landing-1280\.webp"[\s\S]*?\/>\n/,
      "\n",
    );
  }

  html = replaceRequiredHtml(
    html,
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapedTitle}</title>`,
    "title",
  );
  html = replaceRequiredHtml(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${escapedDescription}" />`,
    "description meta",
  );
  html = replaceRequiredHtml(
    html,
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:type" content="${route.type}" />`,
    "Open Graph type meta",
  );
  html = replaceRequiredHtml(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${escapedTitle}" />`,
    "Open Graph title meta",
  );
  html = replaceRequiredHtml(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${escapedDescription}" />`,
    "Open Graph description meta",
  );
  html = replaceRequiredHtml(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    "Open Graph URL meta",
  );
  html = replaceRequiredHtml(
    html,
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:image" content="${socialImageUrl}" />`,
    "Open Graph image meta",
  );
  html = replaceRequiredHtml(
    html,
    /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:image:alt" content="${escapedImageAlt}" />`,
    "Open Graph image alt meta",
  );
  html = replaceRequiredHtml(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${escapedTitle}" />`,
    "Twitter title meta",
  );
  html = replaceRequiredHtml(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${escapedDescription}" />`,
    "Twitter description meta",
  );
  html = replaceRequiredHtml(
    html,
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:image" content="${socialImageUrl}" />`,
    "Twitter image meta",
  );
  html = replaceRequiredHtml(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    "canonical link",
  );
  html = replaceRequiredHtml(
    html,
    /<div id="root"><\/div>/,
    `<div id="root" data-prerendered="true">${appHtml}</div>`,
    "root element",
  );

  if (isHomeVisualRoute) {
    html = addClassToTag(html, "html", "route-home");
    html = addClassToTag(html, "body", "route-home");
  }

  return html;
}

async function findServerEntryPath(): Promise<string> {
  const candidates = ["entry-server.js", "entry-server.mjs"].map(
    (fileName: string): string => path.join(DIST_SSR_DIR, fileName),
  );

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new Error("Missing SSR entry build output");
}

async function main(): Promise<void> {
  const appShellHtml = await fs.readFile(
    path.join(DIST_DIR, "index.html"),
    "utf8",
  );
  const serverEntryPath = await findServerEntryPath();
  const { getPrerenderRoutes, renderRoute } = (await import(
    pathToFileURL(serverEntryPath).href
  )) as ServerEntry;
  const routes = getPrerenderRoutes();

  for (const route of routes) {
    const appHtml = await renderRoute(route.path);
    const outputPath = routeFilePath(route.canonicalPath);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(
      outputPath,
      createPrerenderedHtml(appShellHtml, route, appHtml),
    );
  }

  const canonicalPaths = [
    ...new Set(routes.map((route) => route.canonicalPath)),
  ];
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...canonicalPaths.map(
      (canonicalPath) =>
        `  <url><loc>${escapeHtmlAttribute(`${SITE_ORIGIN}${canonicalPath}`)}</loc></url>`,
    ),
    "</urlset>",
    "",
  ].join("\n");
  await fs.writeFile(path.join(DIST_DIR, "sitemap.xml"), sitemap);

  console.log(`Prerendered ${routes.length} routes.`);
}

main().catch((error: unknown): void => {
  console.error(error);
  process.exitCode = 1;
});
