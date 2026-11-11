// Atendimento: tickets de suporte, cada um uma conversa. Contrato JSON em inglês, sem exigir login.
// Agentes (humanos ou autônomos) respondem com POST /api/tickets/:id/messages e role "agent".
import { randomUUID } from "node:crypto";
import { invalido, naoEncontrado, texto } from "./http.js";
import { transacao } from "./db.js";

const PAPEIS = ["user", "agent", "system"];
const STATUS = ["open", "resolved"];

const saidaTicket = (t) => ({ id: t.id, title: t.title, status: t.status, createdAt: t.criado_em, updatedAt: t.atualizado_em });
const saidaMensagem = (m) => ({ id: m.id, ticketId: m.ticket_id, role: m.role, author: m.author, content: m.content, createdAt: m.criado_em });

/** Título a partir da primeira mensagem: primeira linha, até 80 caracteres. */
export const tituloDaMensagem = (conteudo) => {
  const linha = conteudo.split("\n").map((l) => l.trim()).find(Boolean) ?? "Novo ticket";
  return linha.length > 80 ? `${linha.slice(0, 77).trimEnd()}…` : linha;
};

export function rotasDeTickets(app, db) {
  const buscar = (id) => {
    const t = db.prepare("SELECT * FROM ticket WHERE id = ?").get(id);
    if (!t) throw naoEncontrado("Ticket");
    return t;
  };
  const mensagens = (id) => db.prepare("SELECT * FROM ticket_message WHERE ticket_id = ? ORDER BY criado_em, rowid").all(id).map(saidaMensagem);
  const inserirMensagem = (ticketId, role, author, content, quando) => {
    const m = { id: randomUUID(), ticket_id: ticketId, role, author, content, criado_em: quando };
    db.prepare("INSERT INTO ticket_message (id, ticket_id, role, author, content, criado_em) VALUES (?, ?, ?, ?, ?, ?)")
      .run(m.id, m.ticket_id, m.role, m.author, m.content, m.criado_em);
    return saidaMensagem(m);
  };

  app.get("/api/tickets", () => ({
    tickets: db.prepare("SELECT * FROM ticket ORDER BY atualizado_em DESC, rowid DESC").all().map((t) => {
      const ultima = db.prepare("SELECT role, content FROM ticket_message WHERE ticket_id = ? ORDER BY criado_em DESC, rowid DESC LIMIT 1").get(t.id);
      return { ...saidaTicket(t), lastMessage: ultima ? { role: ultima.role, content: ultima.content.slice(0, 140) } : null };
    }),
  }));

  // Abre um ticket já com a primeira mensagem do usuário, como uma conversa nova.
  app.post("/api/tickets", ({ corpo }) => {
    const content = texto(corpo, "content", { max: 5000 });
    const title = texto(corpo, "title", { max: 120, opcional: true }) ?? tituloDaMensagem(content);
    const author = texto(corpo, "author", { max: 80, opcional: true }) ?? "Você";
    const agora = new Date().toISOString();
    const id = randomUUID();
    return transacao(db, () => {
      db.prepare("INSERT INTO ticket (id, title, status, criado_em, atualizado_em) VALUES (?, ?, 'open', ?, ?)").run(id, title, agora, agora);
      const primeira = inserirMensagem(id, "user", author, content, agora);
      return { ticket: saidaTicket(buscar(id)), messages: [primeira] };
    });
  });

  app.get("/api/tickets/:id", ({ params }) => {
    const t = buscar(params.id);
    return { ticket: saidaTicket(t), messages: mensagens(t.id) };
  });

  app.patch("/api/tickets/:id", ({ params, corpo }) => {
    const t = buscar(params.id);
    const title = texto(corpo, "title", { max: 120, opcional: true }) ?? t.title;
    let status = t.status;
    if (corpo.status !== undefined) {
      if (!STATUS.includes(corpo.status)) throw invalido(`status deve ser ${STATUS.join(" ou ")}.`);
      status = corpo.status;
    }
    db.prepare("UPDATE ticket SET title = ?, status = ?, atualizado_em = ? WHERE id = ?").run(title, status, new Date().toISOString(), t.id);
    return { ticket: saidaTicket(buscar(t.id)) };
  });

  app.delete("/api/tickets/:id", ({ params }) => {
    const t = buscar(params.id);
    db.prepare("DELETE FROM ticket WHERE id = ?").run(t.id); // mensagens caem em cascata
    return { ok: true };
  });

  // Nova mensagem na conversa. Usuário escrevendo num ticket resolvido reabre o ticket.
  app.post("/api/tickets/:id/messages", ({ params, corpo }) => {
    const t = buscar(params.id);
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
