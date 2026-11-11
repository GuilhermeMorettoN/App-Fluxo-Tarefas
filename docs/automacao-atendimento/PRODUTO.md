# Fluxo: o que é e como usar

Fluxo é um quadro de tarefas web: quadros com listas em colunas e cartões dentro das listas. Tem uma área de Atendimento onde o usuário abre tickets de suporte em formato de conversa.

## Como usar

- **Abrir o app:** página inicial em `/`; botão "Abrir meus quadros" leva a `/quadro`.
- **Quadros:** criar pelo `+` na lateral; renomear (lápis) ou excluir (lixeira) passando o mouse sobre o quadro. Excluir apaga listas e cartões juntos, sem desfazer.
- **Listas:** "Adicionar lista" no fim do quadro; clicar no nome renomeia; o menu da lista permite excluir.
- **Cartões:** "Adicionar cartão" no rodapé da lista; clicar no título edita título e descrição; arrastar move entre listas ou muda a ordem.
- **Atendimento:** menu "Atendimento" na lateral (`/atendimento`). "Novo ticket" abre uma conversa; a primeira mensagem vira o título. Enter envia, Shift+Enter quebra linha. O ticket pode ser marcado como resolvido ou reaberto; escrever num ticket resolvido o reabre.

## O que não existe hoje

- Convite de pessoas, permissões por quadro ou contas separadas: quadros e tickets são visíveis para todos que acessam o app.
- Exportação (planilha, PDF), etiquetas, datas de entrega, anexos e notificações.
- Planos, preços e prazos de entrega de recursos: não há informação. Ver `automacao/commercial-catalog.json`.

## Para agentes: como responder um ticket

`POST /api/tickets/:id/messages` com `{"role":"agent","content":"..."}`. Tickets esperando resposta: `GET /api/tickets`, `status` igual a `"open"` e `lastMessage.role` igual a `"user"`.
