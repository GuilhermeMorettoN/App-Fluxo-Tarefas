// CRUD de exemplo. Copie este arquivo para criar outro recurso (clientes, tarefas, produtos…):
// troque a tabela, os campos validados e registre as rotas em app.js.
import { randomUUID } from "node:crypto";
import { naoEncontrado, texto } from "./http.js";
import { transacao } from "./db.js";

const sair = (l) => ({ ...l, concluido: l.concluido === 1 });

export function rotasDeItens(app, db) {
  const buscar = (id) => {
    const l = db.prepare("SELECT * FROM item WHERE id = ?").get(id);
    if (!l) throw naoEncontrado("Item");
    return l;
  };

  app.get("/api/itens", () => db.prepare("SELECT * FROM item ORDER BY posicao").all().map(sair));

  app.post("/api/itens", ({ corpo }) => {
    const agora = new Date().toISOString();
    const item = {
      id: randomUUID(), titulo: texto(corpo, "titulo", { max: 120 }), descricao: texto(corpo, "descricao", { min: 0, max: 5000, opcional: true }) ?? "",
      posicao: db.prepare("SELECT COALESCE(MAX(posicao), -1) + 1 AS p FROM item").get().p, criado_em: agora, atualizado_em: agora,
    };
    db.prepare("INSERT INTO item (id, titulo, descricao, posicao, criado_em, atualizado_em) VALUES (?, ?, ?, ?, ?, ?)")
      .run(item.id, item.titulo, item.descricao, item.posicao, item.criado_em, item.atualizado_em);
    return sair(buscar(item.id));
  });

  app.get("/api/itens/:id", ({ params }) => sair(buscar(params.id)));

  app.patch("/api/itens/:id", ({ params, corpo }) => {
    const atual = buscar(params.id);
    const titulo = texto(corpo, "titulo", { max: 120, opcional: true }) ?? atual.titulo;
    const descricao = texto(corpo, "descricao", { min: 0, max: 5000, opcional: true }) ?? atual.descricao;
    const concluido = typeof corpo.concluido === "boolean" ? Number(corpo.concluido) : atual.concluido;
    db.prepare("UPDATE item SET titulo = ?, descricao = ?, concluido = ?, atualizado_em = ? WHERE id = ?")
      .run(titulo, descricao, concluido, new Date().toISOString(), atual.id);
    return sair(buscar(atual.id));
  });

  /** Reordena: `posicao` é o índice de destino; as demais são renumeradas de 0 a n-1 na mesma transação. */
  app.post("/api/itens/:id/mover", ({ params, corpo, estado }) => {
    const item = buscar(params.id);
    estado.status = 200;
    return transacao(db, () => {
      const ids = db.prepare("SELECT id FROM item WHERE id <> ? ORDER BY posicao").all(item.id).map((l) => l.id);
      const destino = Math.max(0, Math.min(Number.isInteger(corpo.posicao) ? corpo.posicao : ids.length, ids.length));
      ids.splice(destino, 0, item.id);
      const gravar = db.prepare("UPDATE item SET posicao = ? WHERE id = ?");
      ids.forEach((id, i) => gravar.run(i, id));
      return sair(buscar(item.id));
    });
  });

  app.delete("/api/itens/:id", ({ params }) => {
    const item = buscar(params.id);
    transacao(db, () => {
      db.prepare("DELETE FROM item WHERE id = ?").run(item.id);
      const gravar = db.prepare("UPDATE item SET posicao = ? WHERE id = ?");
      db.prepare("SELECT id FROM item ORDER BY posicao").all().forEach((l, i) => gravar.run(i, l.id));
    });
  });
}
