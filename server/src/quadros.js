// CRUD de quadros, listas e cartões (Trello). Contrato JSON em inglês, sem exigir login.
import { randomUUID } from "node:crypto";
import { invalido, naoEncontrado, texto } from "./http.js";
import { transacao } from "./db.js";

const saidaLista = (l) => ({ id: l.id, boardId: l.board_id, title: l.title, position: l.position });
const saidaCartao = (c) => ({ id: c.id, listId: c.list_id, title: c.title, description: c.description, position: c.position });

/** Posição de destino válida: inteiro >= 0, aparado ao tamanho da lista. */
const posicaoDestino = (corpo, tamanho) => {
  if (corpo.position === undefined) return tamanho;
  if (!Number.isInteger(corpo.position) || corpo.position < 0) throw invalido("position deve ser um número inteiro não negativo.");
  return Math.min(corpo.position, tamanho);
};

export function rotasDeQuadros(app, db) {
  const buscarBoard = (id) => {
    const b = db.prepare("SELECT * FROM board WHERE id = ?").get(id);
    if (!b) throw naoEncontrado("Quadro");
    return b;
  };
  const buscarList = (id) => {
    const l = db.prepare("SELECT * FROM list WHERE id = ?").get(id);
    if (!l) throw naoEncontrado("Lista");
    return l;
  };
  const buscarCard = (id) => {
    const c = db.prepare("SELECT * FROM card WHERE id = ?").get(id);
    if (!c) throw naoEncontrado("Cartão");
    return c;
  };
  const renumerar = (listId, excetoId = null) => {
    const gravar = db.prepare("UPDATE card SET position = ? WHERE id = ?");
    db.prepare("SELECT id FROM card WHERE list_id = ? AND id <> ? ORDER BY position, rowid").all(listId, excetoId ?? "")
      .forEach((c, i) => gravar.run(i, c.id));
  };

  app.get("/api/boards", () => ({ boards: db.prepare("SELECT id, title FROM board ORDER BY criado_em, rowid").all() }));

  app.post("/api/boards", ({ corpo }) => {
    const board = { id: randomUUID(), title: texto(corpo, "title", { max: 120 }), criado_em: new Date().toISOString() };
    db.prepare("INSERT INTO board (id, title, criado_em) VALUES (?, ?, ?)").run(board.id, board.title, board.criado_em);
    return { board: { id: board.id, title: board.title } };
  });

  app.get("/api/boards/:id", ({ params }) => {
    const board = buscarBoard(params.id);
    const lists = db.prepare("SELECT * FROM list WHERE board_id = ? ORDER BY position, rowid").all(board.id)
      .map((l) => ({ ...saidaLista(l), cards: db.prepare("SELECT * FROM card WHERE list_id = ? ORDER BY position, rowid").all(l.id).map(saidaCartao) }));
    return { board: { id: board.id, title: board.title }, lists };
  });

  app.patch("/api/boards/:id", ({ params, corpo }) => {
    const board = buscarBoard(params.id);
    const title = texto(corpo, "title", { max: 120, opcional: true }) ?? board.title;
    db.prepare("UPDATE board SET title = ? WHERE id = ?").run(title, board.id);
    return { board: { id: board.id, title } };
  });

  app.delete("/api/boards/:id", ({ params }) => {
    const board = buscarBoard(params.id);
    db.prepare("DELETE FROM board WHERE id = ?").run(board.id); // listas e cartões caem em cascata (FK ON)
    return { ok: true };
  });

  app.post("/api/boards/:id/lists", ({ params, corpo }) => {
    const board = buscarBoard(params.id);
    const list = {
      id: randomUUID(), board_id: board.id, title: texto(corpo, "title", { max: 120 }),
      position: db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS p FROM list WHERE board_id = ?").get(board.id).p,
    };
    db.prepare("INSERT INTO list (id, board_id, title, position) VALUES (?, ?, ?, ?)")
      .run(list.id, list.board_id, list.title, list.position);
    return { list: saidaLista(list) };
  });

  app.patch("/api/lists/:id", ({ params, corpo }) => {
    const list = buscarList(params.id);
    const title = texto(corpo, "title", { max: 120, opcional: true }) ?? list.title;
    db.prepare("UPDATE list SET title = ? WHERE id = ?").run(title, list.id);
    return { list: { ...saidaLista(list), title } };
  });

  app.delete("/api/lists/:id", ({ params }) => {
    const list = buscarList(params.id);
    transacao(db, () => {
      db.prepare("DELETE FROM list WHERE id = ?").run(list.id); // cartões caem em cascata
      const gravar = db.prepare("UPDATE list SET position = ? WHERE id = ?");
      db.prepare("SELECT id FROM list WHERE board_id = ? ORDER BY position, rowid").all(list.board_id)
        .forEach((l, i) => gravar.run(i, l.id));
    });
    return { ok: true };
  });

  app.post("/api/lists/:id/cards", ({ params, corpo }) => {
    const list = buscarList(params.id);
    const card = {
      id: randomUUID(), list_id: list.id,
      title: texto(corpo, "title", { max: 200 }),
      description: texto(corpo, "description", { min: 0, max: 5000, opcional: true }) ?? "",
      position: db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS p FROM card WHERE list_id = ?").get(list.id).p,
    };
    db.prepare("INSERT INTO card (id, list_id, title, description, position) VALUES (?, ?, ?, ?, ?)")
      .run(card.id, card.list_id, card.title, card.description, card.position);
    return { card: saidaCartao(card) };
  });

  app.patch("/api/cards/:id", ({ params, corpo }) => {
    const card = buscarCard(params.id);
    const title = texto(corpo, "title", { max: 200, opcional: true }) ?? card.title;
    const description = texto(corpo, "description", { min: 0, max: 5000, opcional: true }) ?? card.description;
    let destino = card.list_id;
    if (corpo.listId !== undefined) {
      if (typeof corpo.listId !== "string") throw invalido("Informe listId.");
      destino = buscarList(corpo.listId).id;
    }
    return transacao(db, () => {
      const mudaLista = corpo.listId !== undefined && destino !== card.list_id;
      if (!mudaLista && corpo.position === undefined) {
        db.prepare("UPDATE card SET title = ?, description = ? WHERE id = ?").run(title, description, card.id);
        return { card: saidaCartao(buscarCard(card.id)) };
      }
      // Movimentação: renumera a lista de origem, encaixa no destino e renumera o destino.
      renumerar(card.list_id, card.id);
      const idsDestino = destino === card.list_id
        ? db.prepare("SELECT id FROM card WHERE list_id = ? AND id <> ? ORDER BY position, rowid").all(destino, card.id).map((c) => c.id)
        : db.prepare("SELECT id FROM card WHERE list_id = ? ORDER BY position, rowid").all(destino).map((c) => c.id);
      idsDestino.splice(posicaoDestino(corpo, idsDestino.length), 0, card.id);
      const gravar = db.prepare("UPDATE card SET position = ? WHERE id = ?");
      idsDestino.forEach((id, i) => gravar.run(i, id));
      db.prepare("UPDATE card SET list_id = ?, title = ?, description = ? WHERE id = ?").run(destino, title, description, card.id);
      return { card: saidaCartao(buscarCard(card.id)) };
    });
  });

  app.delete("/api/cards/:id", ({ params }) => {
    const card = buscarCard(params.id);
    transacao(db, () => {
      db.prepare("DELETE FROM card WHERE id = ?").run(card.id);
      renumerar(card.list_id);
    });
    return { ok: true };
  });
}
