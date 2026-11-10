// Gera a página estática de conferência visual a partir dos componentes reais.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";

const aqui = dirname(fileURLToPath(import.meta.url));
const saida = resolve(aqui, "preview.mjs");

await build({
  entryPoints: [resolve(aqui, "Previa.jsx")],
  bundle: true,
  format: "esm",
  platform: "node",
  jsx: "automatic",
  outfile: saida,
  external: ["react", "react/jsx-runtime", "react-dom", "react-dom/server"],
  logLevel: "error",
});

const { Previa } = await import(pathToFileURL(saida).href);
const { renderToStaticMarkup } = await import("react-dom/server");

const css = readFileSync(resolve(aqui, "../src/estilos.css"), "utf8");
const corpo = renderToStaticMarkup(createElement(Previa));

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fluxo — conferência visual</title>
    <style>${css}</style>
  </head>
  <body>${corpo}</body>
</html>
`;

mkdirSync(resolve(aqui, "saida"), { recursive: true });
const destino = resolve(aqui, "saida/preview.html");
writeFileSync(destino, html);
console.log(destino);
