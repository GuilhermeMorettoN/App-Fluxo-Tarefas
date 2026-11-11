// SQLite embutido do Node (node:sqlite). Migrações em ordem; cada uma roda uma única vez.
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

const MIGRACOES = [
  `CREATE TABLE item (
     id TEXT PRIMARY KEY,
     titulo TEXT NOT NULL,
     descricao TEXT NOT NULL DEFAULT '',
     concluido INTEGER NOT NULL DEFAULT 0,
     posicao INTEGER NOT NULL,
     criado_em TEXT NOT NULL,
     atualizado_em TEXT NOT NULL
   )`,
  `CREATE TABLE usuario (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     nome TEXT NOT NULL,
     senha_hash TEXT NOT NULL,
     criado_em TEXT NOT NULL
   );
   CREATE TABLE sessao (
     token_hash TEXT PRIMARY KEY,
     usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
     expira_em TEXT NOT NULL
   )`,
  `CREATE TABLE board (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     criado_em TEXT NOT NULL
   );
   CREATE TABLE list (
     id TEXT PRIMARY KEY,
     board_id TEXT NOT NULL REFERENCES board(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     position INTEGER NOT NULL
   );
   CREATE TABLE card (
     id TEXT PRIMARY KEY,
     list_id TEXT NOT NULL REFERENCES list(id) ON DELETE CASCADE,
     title TEXT NOT NULL,
     description TEXT NOT NULL DEFAULT '',
     position INTEGER NOT NULL
   )`,
  // Seeds rodam uma única vez (controlado pelo user_version), só na primeira criação do banco.
  `INSERT INTO board (id, title, criado_em) VALUES
     ('board-sprint', 'Sprint da semana', '2026-11-10T09:00:00.000Z'),
     ('board-ideias', 'Ideias do produto', '2026-11-10T09:00:01.000Z');
   INSERT INTO list (id, board_id, title, position) VALUES
     ('list-a-fazer', 'board-sprint', 'A fazer', 0),
     ('list-fazendo', 'board-sprint', 'Fazendo', 1),
     ('list-pronto', 'board-sprint', 'Pronto para revisar', 2),
     ('list-backlog', 'board-ideias', 'Backlog', 0);
   INSERT INTO card (id, list_id, title, description, position) VALUES
     ('card-requisitos', 'list-a-fazer', 'Levantar requisitos do quadro', 'O que o quadro precisa resolver antes da primeira versão.', 0),
     ('card-telas', 'list-a-fazer', 'Desenhar as telas do quadro', '', 1),
     ('card-api', 'list-fazendo', 'Montar a API de quadros', 'Boards, listas e cartões com movimentação entre listas.', 0),
     ('card-paleta', 'list-pronto', 'Escolher a paleta de cores', '', 0),
     ('card-metricas', 'list-backlog', 'Medir tempo por cartão', '', 0);`,
  // Atendimento: cada ticket é uma conversa; mensagens de usuário, agente (humano ou autônomo) ou sistema.
  `CREATE TABLE ticket (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
     criado_em TEXT NOT NULL,
     atualizado_em TEXT NOT NULL
   );
   CREATE TABLE ticket_message (
     id TEXT PRIMARY KEY,
     ticket_id TEXT NOT NULL REFERENCES ticket(id) ON DELETE CASCADE,
     role TEXT NOT NULL CHECK (role IN ('user', 'agent', 'system')),
     author TEXT NOT NULL DEFAULT '',
     content TEXT NOT NULL,
     criado_em TEXT NOT NULL
   );
   CREATE INDEX ticket_message_por_ticket ON ticket_message (ticket_id, criado_em);
   INSERT INTO ticket (id, title, status, criado_em, atualizado_em) VALUES
     ('ticket-boas-vindas', 'Como convido minha equipe para um quadro?', 'open', '2026-11-10T10:00:00.000Z', '2026-11-10T10:02:00.000Z'),
     ('ticket-exportar', 'Exportar cartões para planilha', 'resolved', '2026-11-09T15:00:00.000Z', '2026-11-09T15:20:00.000Z');
   INSERT INTO ticket_message (id, ticket_id, role, author, content, criado_em) VALUES
     ('msg-1', 'ticket-boas-vindas', 'user', 'Você', 'Olá! Quero que outras pessoas da equipe vejam o quadro "Sprint da semana". Como faço o convite?', '2026-11-10T10:00:00.000Z'),
     ('msg-2', 'ticket-boas-vindas', 'agent', 'Suporte Fluxo', 'Oi! Por enquanto os quadros ficam visíveis para todos que acessam o Fluxo. O convite por e-mail está no nosso planejamento e aviso por aqui assim que estiver disponível.', '2026-11-10T10:02:00.000Z'),
     ('msg-3', 'ticket-exportar', 'user', 'Você', 'Existe alguma forma de exportar os cartões de uma lista para uma planilha?', '2026-11-09T15:00:00.000Z'),
     ('msg-4', 'ticket-exportar', 'agent', 'Suporte Fluxo', 'Ainda não há exportação direta. Registramos o pedido e vamos encerrar este ticket; abra um novo se precisar de algo mais.', '2026-11-09T15:20:00.000Z');`,
];

/** `caminho` = arquivo do banco; `:memory:` nos testes. */
export function abrirBanco(caminho = ":memory:") {
  if (caminho !== ":memory:") mkdirSync(dirname(caminho), { recursive: true });
  const db = new DatabaseSync(caminho);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  const atual = db.prepare("PRAGMA user_version").get().user_version;
  for (let i = atual; i < MIGRACOES.length; i++) {
    db.exec("BEGIN");
    try { db.exec(MIGRACOES[i]); db.exec(`PRAGMA user_version = ${i + 1}`); db.exec("COMMIT"); }
    catch (e) { db.exec("ROLLBACK"); throw e; }
  }
  return db;
}

/** Roda `fn` numa transação; desfaz tudo se ela lançar. */
export function transacao(db, fn) {
  db.exec("BEGIN");
  try { const r = fn(); db.exec("COMMIT"); return r; }
  catch (e) { db.exec("ROLLBACK"); throw e; }
}
