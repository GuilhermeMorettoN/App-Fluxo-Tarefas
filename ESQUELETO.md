# Esqueleto: Web React + API Node + SQLite

Base pronta e testada. Parta daqui: não recrie o que já existe.

## Comandos (na raiz)

- `npm install`: uma instalação só para tudo.
- `npm run dev`: sobe API e interface juntas, em portas livres, e mostra os endereços. Ctrl+C encerra.
- `npm test`: testes da API e da lógica da interface.
- `npm run build`: gera a interface em `dist/`.

## Onde fica cada coisa

| Pasta | O que tem |
|---|---|
| `server/src/http.js` | roteador, erros com status e validação de texto |
| `server/src/db.js` | banco SQLite e migrações (acrescente a sua no fim da lista) |
| `server/src/itens.js` | CRUD de exemplo com reordenação: copie para criar outro recurso |
| `server/src/auth.js` | cadastro, login, logout e `exigirSessao` para proteger rotas |
| `server/src/app.js` | registra as rotas: recurso novo entra com uma linha |
| `client/src/api.js` | cliente da API: toda chamada passa por aqui |
| `client/src/App.jsx` | tela de exemplo (lista com criar, editar, arrastar e excluir) |
| `client/src/componentes/` | Botao, Campo e Dialogo reutilizáveis |
| `client/src/estilos.css` | tokens visuais (cores, raios, espaços): mude a identidade aqui |
| `client/src/ordem.js` | lógica pura de reordenação, testada sem navegador |

## Como dividir o trabalho

- **API**: `server/` (uma tabela nova = migração em `db.js` + arquivo de rotas + linha em `app.js` + teste em `server/test/`).
- **Interface**: `client/` (telas e componentes novos; fale com o servidor só por `api.js`).
- A interface chama `/api/...`; o desenvolvimento encaminha para a API sozinho. Não fixe portas.
- Login: as rotas já existem. Para exigir sessão numa rota, ponha `exigirSessao(db)` antes do tratador.

## Primeira impressão

- Ao adaptar, deixe dados de exemplo criados na primeira execução (banco vazio), para a tela inicial nunca abrir em branco.
- Troque o título `Projeto` (em `client/index.html` e na tela) pelo nome do produto.
