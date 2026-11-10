// Roteador mínimo sobre node:http: rotas com parâmetros (`/api/itens/:id`), JSON e erros com status.
import { createServer } from "node:http";

export class ErroHttp extends Error {
  constructor(status, mensagem) { super(mensagem); this.status = status; }
}
export const naoEncontrado = (o = "Registro") => new ErroHttp(404, `${o} não encontrado.`);
export const invalido = (mensagem) => new ErroHttp(400, mensagem);

async function lerJson(req, limite = 1_000_000) {
  const partes = [];
  let bytes = 0;
  for await (const p of req) {
    bytes += p.length;
    if (bytes > limite) throw new ErroHttp(413, "Corpo grande demais.");
    partes.push(p);
  }
  if (partes.length === 0) return {};
  try {
    const v = JSON.parse(Buffer.concat(partes).toString("utf8"));
    if (v === null || typeof v !== "object" || Array.isArray(v)) throw new Error();
    return v;
  } catch { throw invalido("Envie um objeto JSON."); }
}

export function criarRoteador() {
  const rotas = [];
  const registrar = (metodo) => (caminho, ...tratadores) => {
    const nomes = [];
    const padrao = new RegExp(`^${caminho.replace(/:([a-z_]+)/gi, (_, n) => { nomes.push(n); return "([^/]+)"; })}$`);
    rotas.push({ metodo, padrao, nomes, tratadores });
  };
  const servidor = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const responder = (status, corpo) => {
      const texto = corpo === undefined ? "" : JSON.stringify(corpo);
      res.writeHead(status, corpo === undefined ? {} : { "content-type": "application/json; charset=utf-8" });
      res.end(texto);
    };
    try {
      const rota = rotas.find((r) => r.metodo === req.method && r.padrao.test(url.pathname));
      if (!rota) throw new ErroHttp(404, "Rota não encontrada.");
      const valores = rota.padrao.exec(url.pathname).slice(1).map(decodeURIComponent);
      const ctx = {
        req, res, url,
        params: Object.fromEntries(rota.nomes.map((n, i) => [n, valores[i]])),
        corpo: ["POST", "PUT", "PATCH"].includes(req.method) ? await lerJson(req) : {},
        estado: {},
      };
      let resultado;
      for (const t of rota.tratadores) resultado = await t(ctx);
      if (res.writableEnded) return;
      if (resultado === undefined) responder(204);
      else responder(req.method === "POST" && !ctx.estado.status ? 201 : ctx.estado.status ?? 200, resultado);
    } catch (e) {
      if (e instanceof ErroHttp) responder(e.status, { error: e.message });
      else { console.error(e); responder(500, { mensagem: "Erro interno." }); }
    }
  });
  return { get: registrar("GET"), post: registrar("POST"), patch: registrar("PATCH"), put: registrar("PUT"), delete: registrar("DELETE"), servidor };
}

/** Texto obrigatório, aparado, com tamanho entre `min` e `max`. */
export function texto(corpo, campo, { min = 1, max = 200, opcional = false } = {}) {
  const v = corpo[campo];
  if (v === undefined && opcional) return undefined;
  if (typeof v !== "string") throw invalido(`Informe ${campo}.`);
  const t = v.trim();
  if (t.length < min || t.length > max) throw invalido(`${campo} deve ter entre ${min} e ${max} caracteres.`);
  return t;
}
