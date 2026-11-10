// Confere o ambiente antes de subir API e interface: o SQLite do esqueleto usa
// `node:sqlite`, que só existe a partir do Node 22.13 sem sinalizador extra.
import { pathToFileURL } from "node:url";

const VERSAO_MINIMA = [22, 13, 0];

function paraNumero(versao) {
  return versao.split("-")[0].split(".").map(Number);
}

function comparar(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

/**
 * Devolve `{ ok, problema }`. `problema` traz o motivo em português, já com o
 * caminho para resolver — nada de erro genérico de módulo ausente.
 */
export async function verificarAmbiente() {
  const atual = paraNumero(process.versions.node);
  if (comparar(atual, VERSAO_MINIMA) < 0) {
    return {
      ok: false,
      problema:
        `Node ${process.versions.node} não serve para este projeto. ` +
        `Use Node ${VERSAO_MINIMA.join(".")} ou mais novo (o SQLite embutido ` +
        `precisa de node:sqlite sem sinalizador).`,
    };
  }

  try {
    await import("node:sqlite");
  } catch {
    return {
      ok: false,
      problema:
        `Node ${process.versions.node} não expõe node:sqlite. ` +
        `Atualize para Node ${VERSAO_MINIMA.join(".")} ou mais novo.`,
    };
  }

  return { ok: true, problema: null };
}

/** Usado pelo `npm run dev`: imprime o problema e devolve o código de saída. */
export async function exigirAmbiente() {
  const { ok, problema } = await verificarAmbiente();
  if (!ok) {
    console.error(`\n  ${problema}\n`);
    return 1;
  }
  return 0;
}

// Executado direto (`node scripts/preflight.mjs`): confere e sai com o código.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const codigo = await exigirAmbiente();
  if (codigo === 0) {
    console.log(`Ambiente pronto: Node ${process.versions.node} com node:sqlite.`);
  }
  process.exit(codigo);
}
