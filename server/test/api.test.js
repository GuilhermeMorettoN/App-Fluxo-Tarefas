import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { criarApp } from "../src/app.js";

let base, servidor, cookie = "";
const chamar = async (metodo, caminho, corpo) => {
  const r = await fetch(base + caminho, { method: metodo, headers: { "content-type": "application/json", cookie }, body: corpo ? JSON.stringify(corpo) : undefined });
  const novo = r.headers.get("set-cookie");
  if (novo) cookie = novo.split(";")[0];
  return { status: r.status, dados: r.status === 204 ? null : await r.json() };
};

before(async () => {
  ({ servidor } = criarApp());
  await new Promise((r) => servidor.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${servidor.address().port}`;
});
after(() => servidor.close());

test("saúde e rota desconhecida", async () => {
  assert.deepEqual((await chamar("GET", "/api/saude")).dados, { ok: true });
  assert.equal((await chamar("GET", "/api/nada")).status, 404);
});

test("itens: criar, listar, editar, mover e excluir mantêm a ordem densa", async () => {
  const a = (await chamar("POST", "/api/itens", { titulo: "  A  " })).dados;
  const b = (await chamar("POST", "/api/itens", { titulo: "B", descricao: "nota" })).dados;
  const c = (await chamar("POST", "/api/itens", { titulo: "C" })).dados;
  assert.equal(a.titulo, "A");
  assert.deepEqual([a.posicao, b.posicao, c.posicao], [0, 1, 2]);
  assert.equal((await chamar("PATCH", `/api/itens/${b.id}`, { concluido: true })).dados.concluido, true);
  assert.equal((await chamar("POST", `/api/itens/${c.id}/mover`, { posicao: 0 })).status, 200);
  assert.deepEqual((await chamar("GET", "/api/itens")).dados.map((i) => i.titulo), ["C", "A", "B"]);
  assert.equal((await chamar("DELETE", `/api/itens/${a.id}`)).status, 204);
  assert.deepEqual((await chamar("GET", "/api/itens")).dados.map((i) => [i.titulo, i.posicao]), [["C", 0], ["B", 1]]);
});

test("itens: validação e não encontrado", async () => {
  assert.equal((await chamar("POST", "/api/itens", { titulo: "   " })).status, 400);
  assert.equal((await chamar("POST", "/api/itens", {})).status, 400);
  assert.equal((await chamar("GET", "/api/itens/nao-existe")).status, 404);
});

test("autenticação: cadastro abre sessão, login confere a senha, logout encerra", async () => {
  assert.equal((await chamar("GET", "/api/auth/eu")).status, 401);
  const u = await chamar("POST", "/api/auth/cadastro", { email: "Ana@Exemplo.com", nome: "Ana", senha: "segredo-longo" });
  assert.equal(u.status, 201);
  assert.equal(u.dados.email, "ana@exemplo.com");
  assert.equal(u.dados.senha_hash, undefined);
  assert.equal((await chamar("GET", "/api/auth/eu")).dados.nome, "Ana");
  assert.equal((await chamar("POST", "/api/auth/cadastro", { email: "ana@exemplo.com", nome: "Outra", senha: "segredo-longo" })).status, 409);
  assert.equal((await chamar("POST", "/api/auth/logout")).status, 204);
  assert.equal((await chamar("GET", "/api/auth/eu")).status, 401);
  assert.equal((await chamar("POST", "/api/auth/login", { email: "ana@exemplo.com", senha: "errada" })).status, 401);
  assert.equal((await chamar("POST", "/api/auth/login", { email: "ana@exemplo.com", senha: "segredo-longo" })).status, 200);
  assert.equal((await chamar("GET", "/api/auth/eu")).status, 200);
});
