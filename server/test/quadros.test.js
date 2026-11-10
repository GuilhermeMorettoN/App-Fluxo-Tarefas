import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { criarApp } from "../src/app.js";

let base, servidor;
const chamar = async (metodo, caminho, corpo) => {
  const r = await fetch(base + caminho, { method: metodo, headers: { "content-type": "application/json" }, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
  return { status: r.status, dados: r.status === 204 ? null : await r.json() };
};
const criarBoard = async (title) => (await chamar("POST", "/api/boards", { title })).dados.board;
const criarList = async (boardId, title) => (await chamar("POST", `/api/boards/${boardId}/lists`, { title })).dados.list;
const criarCard = async (listId, title, description) => (await chamar("POST", `/api/lists/${listId}/cards`, { title, description })).dados.card;
const detalhe = async (boardId) => (await chamar("GET", `/api/boards/${boardId}`)).dados;

before(async () => {
  ({ servidor } = criarApp());
  await new Promise((r) => servidor.listen(0, "127.0.0.1", r));
  base = `http://127.0.0.1:${servidor.address().port}`;
});
after(() => servidor.close());

test("seeds existem na primeira criação do banco e a listagem devolve {boards}", async () => {
  const r = await chamar("GET", "/api/boards");
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.dados.boards));
  assert.ok(r.dados.boards.some((b) => b.title === "Sprint da semana"));
  assert.ok(r.dados.boards.every((b) => typeof b.id === "string" && typeof b.title === "string"));
  const semente = await detalhe(r.dados.boards.find((b) => b.title === "Sprint da semana").id);
  assert.deepEqual(semente.lists.map((l) => l.title), ["A fazer", "Fazendo", "Pronto para revisar"]);
  assert.ok(semente.lists.every((l) => Array.isArray(l.cards)));
});

test("boards: criar, editar e apagar; título aparado e validado", async () => {
  const board = await criarBoard("  Meu quadro  ");
  assert.equal(board.title, "Meu quadro");
  assert.equal(typeof board.id, "string");
  const editado = (await chamar("PATCH", `/api/boards/${board.id}`, { title: "Renomeado" })).dados.board;
  assert.deepEqual(editado, { id: board.id, title: "Renomeado" });
  assert.equal((await chamar("POST", "/api/boards", { title: "   " })).status, 400);
  assert.equal((await chamar("PATCH", `/api/boards/${board.id}`, {})).dados.board.title, "Renomeado");
  assert.deepEqual((await chamar("DELETE", `/api/boards/${board.id}`)).dados, { ok: true });
  assert.equal((await chamar("GET", `/api/boards/${board.id}`)).status, 404);
});

test("excluir board derruba listas e cartões em cascata", async () => {
  const board = await criarBoard("Para apagar");
  const lista = await criarList(board.id, "Só ida");
  const card = await criarCard(lista.id, "Some junto", "descrição");
  assert.equal((await chamar("DELETE", `/api/boards/${board.id}`)).status, 200);
  assert.equal((await chamar("PATCH", `/api/lists/${lista.id}`, { title: "x" })).status, 404);
  assert.equal((await chamar("PATCH", `/api/cards/${card.id}`, { title: "x" })).status, 404);
});

test("lists: criar ordena no fim, editar título, excluir renumera e derruba cartões", async () => {
  const board = await criarBoard("Com listas");
  const a = await criarList(board.id, "A");
  const b = await criarList(board.id, "B");
  const c = await criarList(board.id, "C");
  assert.deepEqual([a.position, b.position, c.position], [0, 1, 2]);
  assert.equal(a.boardId, board.id);
  const card = await criarCard(b.id, "Dentro de B");
  assert.equal((await chamar("PATCH", `/api/lists/${b.id}`, { title: "B2" })).dados.list.title, "B2");
  assert.deepEqual((await chamar("DELETE", `/api/lists/${b.id}`)).dados, { ok: true });
  const resto = (await detalhe(board.id)).lists;
  assert.deepEqual(resto.map((l) => [l.title, l.position]), [["A", 0], ["C", 1]]);
  assert.equal((await chamar("PATCH", `/api/cards/${card.id}`, { title: "x" })).status, 404);
});

test("cards: criar com descrição opcional, editar campos e excluir renumera", async () => {
  const board = await criarBoard("Com cartões");
  const lista = await criarList(board.id, "Trabalho");
  const a = await criarCard(lista.id, "  Primeiro  ");
  const b = await criarCard(lista.id, "Segundo");
  assert.deepEqual([a.title, a.description, a.listId, a.position], ["Primeiro", "", lista.id, 0]);
  assert.equal(b.position, 1);
  const c = await criarCard(lista.id, "Terceiro", "com nota");
  assert.equal(c.description, "com nota");
  const editado = (await chamar("PATCH", `/api/cards/${b.id}`, { title: "Segundo!", description: "detalhe" })).dados.card;
  assert.deepEqual([editado.title, editado.description, editado.position], ["Segundo!", "detalhe", 1]);
  assert.deepEqual((await chamar("DELETE", `/api/cards/${a.id}`)).dados, { ok: true });
  assert.deepEqual((await detalhe(board.id)).lists[0].cards.map((k) => [k.title, k.position]), [["Segundo!", 0], ["Terceiro", 1]]);
  assert.equal((await chamar("POST", `/api/lists/${lista.id}/cards`, { title: "" })).status, 400);
});

test("mover cartão dentro da lista reordena com posições densas", async () => {
  const board = await criarBoard("Reordenar");
  const lista = await criarList(board.id, "Fila");
  const a = await criarCard(lista.id, "A");
  const b = await criarCard(lista.id, "B");
  const c = await criarCard(lista.id, "C");
  const movido = (await chamar("PATCH", `/api/cards/${c.id}`, { position: 0 })).dados.card;
  assert.deepEqual([movido.id, movido.position], [c.id, 0]);
  assert.deepEqual((await detalhe(board.id)).lists[0].cards.map((k) => k.title), ["C", "A", "B"]);
  await chamar("PATCH", `/api/cards/${c.id}`, { position: 99 });
  assert.deepEqual((await detalhe(board.id)).lists[0].cards.map((k) => [k.title, k.position]), [["A", 0], ["B", 1], ["C", 2]]);
});

test("mover cartão entre listas atualiza as duas atomicamente", async () => {
  const board = await criarBoard("Entre listas");
  const origem = await criarList(board.id, "Origem");
  const destino = await criarList(board.id, "Destino");
  const a = await criarCard(origem.id, "Fica");
  const b = await criarCard(origem.id, "Viaja");
  const c = await criarCard(destino.id, "Anciada");
  const movido = (await chamar("PATCH", `/api/cards/${b.id}`, { listId: destino.id, position: 0 })).dados.card;
  assert.deepEqual([movido.listId, movido.position], [destino.id, 0]);
  const depois = (await detalhe(board.id)).lists;
  assert.deepEqual(depois.find((l) => l.id === origem.id).cards.map((k) => [k.title, k.position]), [["Fica", 0]]);
  assert.deepEqual(depois.find((l) => l.id === destino.id).cards.map((k) => [k.title, k.position]), [["Viaja", 0], ["Anciada", 1]]);
  // trocar só a lista sem posição: vai para o fim
  const troca = (await chamar("PATCH", `/api/cards/${a.id}`, { listId: destino.id })).dados.card;
  assert.equal(troca.position, 2);
});

test("validação e erros: corpo com formato {error} e status adequado", async () => {
  const board = await criarBoard("Erros");
  const lista = await criarList(board.id, "Lista");
  const naoExiste = (await chamar("GET", "/api/boards/id-inexistente"));
  assert.equal(naoExiste.status, 404);
  assert.equal(typeof naoExiste.dados.error, "string");
  assert.equal((await chamar("GET", "/api/boards/id-inexistente")).status, 404);
  assert.equal((await chamar("POST", `/api/boards/${board.id}/lists`, { title: "x", extra: 1 })).status, 201); // campos extras são ignorados
  const card = await criarCard(lista.id, "Para validar");
  assert.equal((await chamar("PATCH", `/api/cards/${card.id}`, { position: -1 })).status, 400);
  assert.equal((await chamar("PATCH", `/api/cards/${card.id}`, { position: 1.5 })).status, 400);
  assert.equal((await chamar("PATCH", `/api/cards/${card.id}`, { listId: "lista-inexistente" })).status, 404);
  assert.equal((await chamar("DELETE", "/api/cards/id-inexistente")).status, 404);
  assert.equal((await chamar("POST", "/api/boards", "não-objeto")).status, 400);
});
