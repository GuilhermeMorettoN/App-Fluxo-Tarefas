// Ponte mínima com o GitHub para o runtime github-actions: cria a issue do ticket, dispara o workflow
// e lê o comentário de controle publicado pelo Actions. Token: GITHUB_TOKEN do .env ou, na falta,
// a credencial já guardada no Git (git credential fill). Nunca é registrado em log nem no banco.
import { execFileSync } from "node:child_process";

export const MARCA_CONTROLE = "<!-- fluxo-control -->";
export const AUTOR_CONTROLE = "github-actions[bot]";

function tokenDoGit() {
  try {
    const saida = execFileSync("git", ["credential", "fill"], { input: "protocol=https\nhost=github.com\n\n", encoding: "utf8", timeout: 15_000 });
    return /^password=(.+)$/m.exec(saida)?.[1] ?? null;
  } catch { return null; }
}

export function criarGithub({ repo = process.env.GITHUB_REPO, api = process.env.GITHUB_API_URL ?? "https://api.github.com", token } = {}) {
  let cache = token ?? process.env.GITHUB_TOKEN ?? null;
  const pedir = async (metodo, caminho, corpo) => {
    if (!repo) throw new Error("Defina GITHUB_REPO (dono/repositorio).");
    cache ??= tokenDoGit();
    if (!cache) throw new Error("Sem credencial GitHub: defina GITHUB_TOKEN no .env ou autentique o Git.");
    const r = await fetch(`${api}/repos/${repo}${caminho}`, {
      method: metodo,
      headers: { authorization: `Bearer ${cache}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "content-type": "application/json" },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
      signal: AbortSignal.timeout(20_000),
    });
    if (!r.ok) throw new Error(`GitHub ${metodo} ${caminho}: ${r.status}`);
    return r.status === 204 ? null : r.json();
  };
  return {
    criarIssue: (title, body) => pedir("POST", "/issues", { title, body, labels: ["origin:app"] }),
    disparar: (inputs) => pedir("POST", "/actions/workflows/ai-agents.yml/dispatches", { ref: "main", inputs }),
    /** Estado do comentário de controle, só se escrito pelo Actions. */
    async controle(issue) {
      const lista = await pedir("GET", `/issues/${issue}/comments?per_page=100`);
      const c = lista.find((x) => x.user?.login === AUTOR_CONTROLE && x.body?.startsWith(MARCA_CONTROLE));
      if (!c) return null;
      try { return JSON.parse(/```json\n([\s\S]*?)\n```/.exec(c.body)[1]); } catch { return null; }
    },
  };
}
