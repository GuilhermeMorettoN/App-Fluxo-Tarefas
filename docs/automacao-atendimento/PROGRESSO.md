# Progresso: automação do atendimento

## Etapa 00: preparar o projeto e o acesso (2026-11-11)

- Cópia local: `C:\Users\sup.011\App-Fluxo-Tarefas-V1`
- URL da cópia no GitHub: https://github.com/GuilhermeMorettoN/App-Fluxo-Tarefas (público, remote `origin`).
- Original do professor: https://github.com/bittencourtthulio/App-Fluxo-Tarefas-V1 (remote `upstream-original`, push desativado).
- Node: v26.13.0 (exigido: >= 22.13).
- Comandos: `npm install`, `npm run dev`, `npm test`, `npm run build`, `npm run preflight`, `npm start`.
- Abrir o app: `npm run dev` e acessar http://127.0.0.1:5173 (atendimento em `/atendimento`).
- Build: `npm run build` concluiu com sucesso (`dist/` gerado).
- App aberto: `/atendimento` e `/api/tickets` responderam 200.
- Dados locais preservados: `server/dados/app.sqlite`; sem `.env`.

### Credenciais (nunca registrar valores)

- Backend local: sem credencial hoje; se precisar, vai em `.env` (já no `.gitignore`).
- Actions: secret `COPILOT_AGENT_TOKEN`, separado do backend, configurado só no repositório GitHub.

### Pendências

- Actions: habilitadas no repositório (`allowed_actions: all`).
- GitHub Copilot cloud agent: não disponível; o Copilot não aparece entre os atores atribuíveis do repositório (precisa de plano Copilot pago habilitado para a conta).

## Etapa 03: app → issue → coordenador no Actions (2026-11-11)

- Backend (`AGENT_RUNTIME=github-actions`): ticket novo cria issue `origin:app`, guarda dono/requestId/fase em `ticket_github` e dispara `ai-agents.yml`; ao abrir o ticket, lê o comentário de controle e publica a mensagem N1 uma única vez.
- Actions: `.github/workflows/ai-agents.yml` + `automacao/coordenador.mjs`; dry-run por padrão; sem PR nesta etapa (pedido de mudança vai para pessoa da equipe).
- Pendente para o ensaio real: provedor de IA ainda não definido (`AI_PROVIDER`/`AI_MODEL`); o controlador recusa a chamada real até ser implementado.
