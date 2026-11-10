import assert from "node:assert/strict";
import { test } from "node:test";
import { indiceDeDestino, mover, moverCartaoEntreListas } from "../src/ordem.js";

const detalhe = () => ({
  board: { id: "b1", title: "Quadro" },
  lists: [
    {
      id: "l1",
      title: "A fazer",
      cards: [
        { id: "c1", title: "Um", listId: "l1", position: 0 },
        { id: "c2", title: "Dois", listId: "l1", position: 1 },
        { id: "c3", title: "Três", listId: "l1", position: 2 },
      ],
    },
    {
      id: "l2",
      title: "Feito",
      cards: [{ id: "c4", title: "Quatro", listId: "l2", position: 0 }],
    },
  ],
});

test("mover reposiciona sem alterar a lista original", () => {
  const lista = ["a", "b", "c", "d"];
  assert.deepEqual(mover(lista, 0, 2), ["b", "c", "a", "d"]);
  assert.deepEqual(mover(lista, 3, 0), ["d", "a", "b", "c"]);
  assert.deepEqual(mover(lista, 1, 99), ["a", "c", "d", "b"]);
  assert.equal(mover(lista, 2, 2), lista);
  assert.deepEqual(lista, ["a", "b", "c", "d"]);
});

test("índice de destino pelo item alvo", () => {
  const lista = [{ id: "x" }, { id: "y" }, { id: "z" }];
  assert.equal(indiceDeDestino(lista, "x", "z"), 2);
  assert.equal(indiceDeDestino(lista, "x", "nada"), -1);
});

test("mover cartão entre listas não lança erro e devolve as listas", () => {
  const entrada = detalhe();
  const resultado = moverCartaoEntreListas(entrada, "c2", "l2", 0);

  assert.deepEqual(
    resultado.lists.map((l) => l.id),
    ["l1", "l2"]
  );
  assert.deepEqual(resultado.lists[0].cards.map((c) => c.id), ["c1", "c3"]);
  assert.deepEqual(resultado.lists[1].cards.map((c) => c.id), ["c2", "c4"]);
  assert.equal(resultado.lists[1].cards[0].listId, "l2");
  assert.equal(resultado.board, entrada.board);
});

test("mover cartão dentro da mesma lista mantém a ordem", () => {
  const entrada = detalhe();
  const resultado = moverCartaoEntreListas(entrada, "c1", "l1", 2);

  assert.deepEqual(resultado.lists[0].cards.map((c) => c.id), ["c2", "c3", "c1"]);
  assert.deepEqual(resultado.lists[1].cards.map((c) => c.id), ["c4"]);
});

test("mover cartão não altera os dados de entrada", () => {
  const entrada = detalhe();
  const copia = structuredClone(entrada);

  moverCartaoEntreListas(entrada, "c2", "l2", 0);
  moverCartaoEntreListas(entrada, "c1", "l1", 2);

  assert.deepEqual(entrada, copia);
});
