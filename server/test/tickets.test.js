import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { criarApp } from "../src/app.js";
import { tituloDaMensagem } from "../src/tickets.js";

let base, servidor;
const chamar = async (metodo, caminho, corpo) => {
  const r = await fetch(base + caminho, { method: metodo, headers: { "content-type": "application/json" }, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
  return { status: r.status, dados: r.status === 204 ? null : await r.json() };
};

before(async () => {
  ({ servidor } = criarApp());
  await new Promise((r) => servidor.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${servidor.address().port}`;
});
after(() => servidor.close());

test("seeds: tickets de exemplo com última mensagem", async () => {
  const r = await chamar("GET", "/api/tickets");
  assert.equal(r.status, 200);
  assert.ok(r.dados.tickets.length >= 2);
  const t = r.dados.tickets.find((x) => x.id === "ticket-boas-vindas");
  assert.equal(t.status, "open");
  assert.equal(t.lastMessage.role, "agent");
});

test("abrir ticket cria conversa com a primeira mensagem e título derivado", async () => {
  const r = await chamar("POST", "/api/tickets", { content: "  Não consigo mover cartões\nDetalhes aqui  " });
  assert.equal(r.status, 201);
  assert.equal(r.dados.ticket.title, "Não consigo mover cartões");
  assert.equal(r.dados.ticket.status, "open");
  assert.equal(r.dados.messages.length, 1);
  assert.equal(r.dados.messages[0].role, "user");
  const lista = (await chamar("GET", "/api/tickets")).dados.tickets;
  assert.equal(lista[0].id, r.dados.ticket.id, "mais recente primeiro");
  assert.equal((await chamar("POST", "/api/tickets", { content: "   " })).status, 400);
});

test("mensagens: agente responde, usuário reabre ticket resolvido", async () => {
  const { ticket } = (await chamar("POST", "/api/tickets", { content: "Ajuda" })).dados;
  const resp = await chamar("POST", `/api/tickets/${ticket.id}/messages`, { role: "agent", content: "Claro!" });
  assert.equal(resp.status, 201);
  assert.equal(resp.dados.message.author, "Suporte Fluxo");
  assert.equal((await chamar("PATCH", `/api/tickets/${ticket.id}`, { status: "resolved" })).dados.ticket.status, "resolved");
  const volta = await chamar("POST", `/api/tickets/${ticket.id}/messages`, { content: "Mais uma dúvida" });
  assert.equal(volta.dados.ticket.status, "open");
  const detalhe = (await chamar("GET", `/api/tickets/${ticket.id}`)).dados;
  assert.deepEqual(detalhe.messages.map((m) => m.role), ["user", "agent", "user"]);
  assert.equal((await chamar("POST", `/api/tickets/${ticket.id}/messages`, { role: "robo", content: "x" })).status, 400);
  assert.equal((await chamar("PATCH", `/api/tickets/${ticket.id}`, { status: "x" })).status, 400);
});

test("excluir ticket apaga as mensagens", async () => {
  const { ticket } = (await chamar("POST", "/api/tickets", { content: "Some" })).dados;
  assert.deepEqual((await chamar("DELETE", `/api/tickets/${ticket.id}`)).dados, { ok: true });
  assert.equal((await chamar("GET", `/api/tickets/${ticket.id}`)).status, 404);
  assert.equal((await chamar("POST", `/api/tickets/${ticket.id}/messages`, { content: "x" })).status, 404);
});

test("tituloDaMensagem corta textos longos", () => {
  assert.equal(tituloDaMensagem("\n\n  Oi  \nresto"), "Oi");
  assert.ok(tituloDaMensagem("a".repeat(200)).length <= 80);
});
