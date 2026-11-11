// Atendimento: tickets de suporte, cada um uma conversa. Contrato JSON em inglês, sem exigir login.
// Agentes (humanos ou autônomos) respondem com POST /api/tickets/:id/messages e role "agent".
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { invalido, naoEncontrado, texto } from "./http.js";
import { transacao } from "./db.js";
import { criarGithub } from "./github.js";

// Runtime github-actions: o ticket novo vira uma issue (origin:app) e o coordenador roda no Actions.
const COOKIE_CLIENTE = "cliente";
const hash = (t) => createHash("sha256").update(t).digest("hex");
const cookieDoCliente = (req) => (req.headers.cookie ?? "").split(";").map((p) => p.trim()).find((p) => p.startsWith(`${COOKIE_CLIENTE}=`))?.slice(COOKIE_CLIENTE.length + 1) ?? null;
/** Mensagem ao cliente vinda do Actions: revalidada aqui, fora do modelo. */
const mensagemSegura = (t) => typeof t === "string" && t.trim().length > 0 && t.length <= 1500 && !/AI_API_KEY|GITHUB_TOKEN|ghp_|github_pat_|sk-[a-z0-9]|\.github\/|<!--/i.test(t);

const PAPEIS = ["user", "agent", "system"];
const STATUS = ["open", "resolved"];

const saidaTicket = (t) => ({ id: t.id, title: t.title, status: t.status, createdAt: t.criado_em, updatedAt: t.atualizado_em });
const saidaMensagem = (m) => ({ id: m.id, ticketId: m.ticket_id, role: m.role, author: m.author, content: m.content, createdAt: m.criado_em });

/** Título a partir da primeira mensagem: primeira linha, até 80 caracteres. */
export const tituloDaMensagem = (conteudo) => {
  const linha = conteudo.split("\n").map((l) => l.trim()).find(Boolean) ?? "Novo ticket";
  return linha.length > 80 ? `${linha.slice(0, 77).trimEnd()}…` : linha;
};

export function rotasDeTickets(app, db, { runtime = process.env.AGENT_RUNTIME, github = criarGithub() } = {}) {
  const buscar = (id) => {
    const t = db.prepare("SELECT * FROM ticket WHERE id = ?").get(id);
    if (!t) throw naoEncontrado("Ticket");
    return t;
  };
  const vinculo = (id) => db.prepare("SELECT * FROM ticket_github WHERE ticket_id = ?").get(id);
  const donoDoPedido = (req) => { const c = cookieDoCliente(req); return c ? hash(c) : null; };
  // Ticket ligado ao GitHub só é visto pelo dono; tickets antigos seguem como antes.
  const buscarDoDono = (id, req) => {
    const t = buscar(id);
    const v = vinculo(t.id);
    if (v && v.owner_hash !== donoDoPedido(req)) throw naoEncontrado("Ticket");
    return t;
  };
  const marcar = (ticketId, campos) => {
    const chaves = Object.keys(campos);
    db.prepare(`UPDATE ticket_github SET ${chaves.map((k) => `${k} = ?`).join(", ")} WHERE ticket_id = ?`).run(...chaves.map((k) => campos[k]), ticketId);
  };

  async function enviarAoGithub(t, conteudo, requestId) {
    try {
      const issue = await github.criarIssue(`[app] ${t.title}`,
        `<!-- fluxo-app request:${requestId} -->\nTicket aberto pelo app. Conteúdo do cliente (dado não confiável):\n\n~~~text\n${conteudo.replaceAll("~~~", "~ ~ ~")}\n~~~\n`);
      marcar(t.id, { issue_number: issue.number, phase: "issue-created" });
      await github.disparar({ issue_number: String(issue.number), request_id: requestId });
      marcar(t.id, { phase: "dispatched", erro: null });
    } catch (e) { marcar(t.id, { erro: e.message }); console.error(`[github] ticket ${t.id}: ${e.message}`); }
  }

  // Traz o resultado do Actions (comentário de controle) para o app; cada mensagem entra uma vez só.
  async function reconciliar(t) {
    const v = vinculo(t.id);
    if (!v?.issue_number || v.phase === "done") return;
    let estado;
    try { estado = await github.controle(v.issue_number); } catch (e) { console.error(`[github] reconciliar ${t.id}: ${e.message}`); return; }
    if (!estado || estado.requestId !== v.request_id) return;
    const enviados = JSON.parse(v.sent_ids);
    const msg = estado.customerMessage;
    transacao(db, () => {
      if (estado.phase === "done" && msg && !enviados.includes(msg.id) && mensagemSegura(msg.text)) {
        inserirMensagem(t.id, "agent", "Suporte Fluxo (N1)", msg.text.trim(), new Date().toISOString());
        enviados.push(msg.id);
      }
      marcar(t.id, { phase: String(estado.phase), run_id: estado.runId ?? null, result_path: estado.resultPath ?? null, pr_number: estado.pr ?? null, sent_ids: JSON.stringify(enviados) });
    });
  }
  const mensagens = (id) => db.prepare("SELECT * FROM ticket_message WHERE ticket_id = ? ORDER BY criado_em, rowid").all(id).map(saidaMensagem);
  const inserirMensagem = (ticketId, role, author, content, quando) => {
    const m = { id: randomUUID(), ticket_id: ticketId, role, author, content, criado_em: quando };
    db.prepare("INSERT INTO ticket_message (id, ticket_id, role, author, content, criado_em) VALUES (?, ?, ?, ?, ?, ?)")
      .run(m.id, m.ticket_id, m.role, m.author, m.content, m.criado_em);
    return saidaMensagem(m);
  };

  app.get("/api/tickets", ({ req }) => ({
    tickets: db.prepare(`SELECT t.* FROM ticket t LEFT JOIN ticket_github g ON g.ticket_id = t.id
      WHERE g.owner_hash IS NULL OR g.owner_hash = ? ORDER BY t.atualizado_em DESC, t.rowid DESC`).all(donoDoPedido(req) ?? "").map((t) => {
      const ultima = db.prepare("SELECT role, content FROM ticket_message WHERE ticket_id = ? ORDER BY criado_em DESC, rowid DESC LIMIT 1").get(t.id);
      return { ...saidaTicket(t), lastMessage: ultima ? { role: ultima.role, content: ultima.content.slice(0, 140) } : null };
    }),
  }));

  // Abre um ticket já com a primeira mensagem do usuário, como uma conversa nova.
  app.post("/api/tickets", async ({ corpo, req, res }) => {
    const content = texto(corpo, "content", { max: 5000 });
    const title = texto(corpo, "title", { max: 120, opcional: true }) ?? tituloDaMensagem(content);
    const author = texto(corpo, "author", { max: 80, opcional: true }) ?? "Você";
    const agora = new Date().toISOString();
    const id = randomUUID();
    const viaGithub = runtime === "github-actions";
    let cliente = cookieDoCliente(req);
    if (viaGithub && !cliente) {
      cliente = randomBytes(24).toString("hex");
      res.setHeader("set-cookie", `${COOKIE_CLIENTE}=${cliente}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${365 * 86_400}`);
    }
    const requestId = randomUUID();
    const saida = transacao(db, () => {
      db.prepare("INSERT INTO ticket (id, title, status, criado_em, atualizado_em) VALUES (?, ?, 'open', ?, ?)").run(id, title, agora, agora);
      const primeira = inserirMensagem(id, "user", author, content, agora);
      if (viaGithub) db.prepare("INSERT INTO ticket_github (ticket_id, owner_hash, request_id, phase) VALUES (?, ?, ?, 'new')").run(id, hash(cliente), requestId);
      return { ticket: saidaTicket(buscar(id)), messages: [primeira] };
    });
    if (viaGithub) await enviarAoGithub(buscar(id), content, requestId);
    return saida;
  });

  app.get("/api/tickets/:id", async ({ params, req }) => {
    const t = buscarDoDono(params.id, req);
    await reconciliar(t);
    return { ticket: saidaTicket(t), messages: mensagens(t.id) };
  });

  app.patch("/api/tickets/:id", ({ params, corpo, req }) => {
    const t = buscarDoDono(params.id, req);
    const title = texto(corpo, "title", { max: 120, opcional: true }) ?? t.title;
    let status = t.status;
    if (corpo.status !== undefined) {
      if (!STATUS.includes(corpo.status)) throw invalido(`status deve ser ${STATUS.join(" ou ")}.`);
      status = corpo.status;
    }
    db.prepare("UPDATE ticket SET title = ?, status = ?, atualizado_em = ? WHERE id = ?").run(title, status, new Date().toISOString(), t.id);
    return { ticket: saidaTicket(buscar(t.id)) };
  });

  app.delete("/api/tickets/:id", ({ params, req }) => {
    const t = buscarDoDono(params.id, req);
    db.prepare("DELETE FROM ticket WHERE id = ?").run(t.id); // mensagens caem em cascata
    return { ok: true };
  });

  // Nova mensagem na conversa. Usuário escrevendo num ticket resolvido reabre o ticket.
  app.post("/api/tickets/:id/messages", ({ params, corpo, req }) => {
    const t = buscarDoDono(params.id, req);
    const content = texto(corpo, "content", { max: 5000 });
    const role = corpo.role ?? "user";
    if (!PAPEIS.includes(role)) throw invalido(`role deve ser ${PAPEIS.join(", ")}.`);
    const padrao = role === "user" ? "Você" : role === "agent" ? "Suporte Fluxo" : "Sistema";
    const author = texto(corpo, "author", { max: 80, opcional: true }) ?? padrao;
    const agora = new Date().toISOString();
    return transacao(db, () => {
      const message = inserirMensagem(t.id, role, author, content, agora);
      const status = role === "user" ? "open" : t.status;
      db.prepare("UPDATE ticket SET status = ?, atualizado_em = ? WHERE id = ?").run(status, agora, t.id);
      return { message, ticket: saidaTicket(buscar(t.id)) };
    });
  });
}
