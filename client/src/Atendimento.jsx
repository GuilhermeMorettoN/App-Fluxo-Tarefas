import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api.js";
import { Botao } from "./componentes/Botao.jsx";
import { Icone } from "./componentes/Icone.jsx";

// Enquanto um ticket está aberto, busca respostas novas (agentes respondem pela API).
const INTERVALO_ATUALIZACAO = 5000;

const ROTULO_STATUS = { open: "Aberto", resolved: "Resolvido" };

const horario = (iso) => {
  const d = new Date(iso);
  const hoje = new Date().toDateString() === d.toDateString();
  return hoje
    ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

/** Estado e ações do atendimento, compartilhados entre a lateral (lista) e a tela (conversa). */
export function useAtendimento(ativo) {
  const [tickets, setTickets] = useState(null);
  const [ticketId, setTicketId] = useState(null); // null = conversa nova
  const [conversa, setConversa] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [pedidoNovo, setPedidoNovo] = useState(0); // cada clique em "Novo ticket" limpa e foca o compositor

  const novo = () => {
    setTicketId(null);
    setErro(null);
    setPedidoNovo((n) => n + 1);
  };

  const recarregarLista = useCallback(async () => {
    const dados = await api.tickets.listar();
    setTickets(dados?.tickets ?? []);
  }, []);

  useEffect(() => {
    if (!ativo) return;
    recarregarLista().catch((e) => { setErro(e.message); setTickets([]); });
  }, [ativo, recarregarLista]);

  useEffect(() => {
    if (!ativo || !ticketId) { setConversa(null); return; }
    let vivo = true;
    const buscar = () => api.tickets.detalhe(ticketId)
      .then((d) => { if (vivo) setConversa((atual) => (atual?.messages?.length === d.messages.length && atual?.ticket?.status === d.ticket.status ? atual : d)); })
      .catch((e) => { if (vivo) setErro(e.message); });
    setConversa((atual) => (atual?.ticket?.id === ticketId ? atual : null)); // ticket recém-aberto já está em mãos
    buscar();
    const timer = setInterval(buscar, INTERVALO_ATUALIZACAO);
    return () => { vivo = false; clearInterval(timer); };
  }, [ativo, ticketId]);

  const enviar = async (conteudo) => {
    setEnviando(true);
    setErro(null);
    try {
      if (!ticketId) {
        const r = await api.tickets.abrir(conteudo);
        setConversa(r);
        setTicketId(r.ticket.id);
      } else {
        const r = await api.tickets.enviar(ticketId, conteudo);
        setConversa((atual) => ({ ticket: r.ticket, messages: [...(atual?.messages ?? []), r.message] }));
      }
      await recarregarLista();
      return true;
    } catch (e) {
      setErro(e.message);
      return false;
    } finally {
      setEnviando(false);
    }
  };

  const mudarStatus = async (status) => {
    if (!ticketId) return;
    try {
      const r = await api.tickets.editar(ticketId, { status });
      setConversa((atual) => ({ ...atual, ticket: r.ticket }));
      await recarregarLista();
    } catch (e) { setErro(e.message); }
  };

  const excluir = async (id) => {
    try {
      await api.tickets.excluir(id);
      if (id === ticketId) setTicketId(null);
      await recarregarLista();
    } catch (e) { setErro(e.message); }
  };

  return { tickets, ticketId, conversa, enviando, erro, setErro, pedidoNovo, selecionar: setTicketId, novo, enviar, mudarStatus, excluir };
}

/** Lista de tickets na lateral, como o histórico de conversas. */
export function ListaTickets({ atendimento, aoExcluir }) {
  const { tickets, ticketId, selecionar, novo } = atendimento;
  return (
    <>
      <Botao className="botao-bloco novo-ticket" icone="mais" aria-pressed={ticketId === null} onClick={novo}>Novo ticket</Botao>
      <h2 className="lateral-titulo">Seus tickets</h2>
      {tickets === null ? (
        <p className="lateral-vazio">Carregando tickets…</p>
      ) : tickets.length ? (
        <ul className="lateral-lista">
          {tickets.map((t) => (
            <li key={t.id}>
              <div className="lateral-item" data-ativo={t.id === ticketId ? "" : undefined}>
                <button type="button" className="lateral-escolha ticket-escolha" aria-current={t.id === ticketId ? "page" : undefined} onClick={() => selecionar(t.id)}>
                  <span className="ticket-ponto" data-status={t.status} aria-label={ROTULO_STATUS[t.status]} />
                  <span className="ticket-escolha-texto">{t.title}</span>
                </button>
                <span className="lateral-acoes">
                  <Botao variante="fantasma" icone="lixeira" aria-label={`Excluir ticket ${t.title}`} onClick={() => aoExcluir(t)} />
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="lateral-vazio">Nenhum ticket ainda. Descreva sua dúvida para abrir o primeiro.</p>
      )}
    </>
  );
}

function Compositor({ aoEnviar, enviando, placeholder, rolarAoMontar = false }) {
  const [texto, setTexto] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    if (rolarAoMontar) ref.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [rolarAoMontar]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [texto]);

  const enviar = async () => {
    const t = texto.trim();
    if (!t || enviando) return;
    if (await aoEnviar(t)) setTexto("");
    ref.current?.focus();
  };

  return (
    <form className="compositor" onSubmit={(e) => { e.preventDefault(); void enviar(); }}>
      <textarea
        ref={ref}
        className="compositor-entrada"
        rows={1}
        value={texto}
        maxLength={5000}
        placeholder={placeholder}
        aria-label="Mensagem"
        autoFocus
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void enviar(); }
        }}
      />
      <button type="submit" className="compositor-enviar" disabled={!texto.trim() || enviando} aria-label="Enviar mensagem">
        <Icone nome="enviar" tamanho={18} />
      </button>
    </form>
  );
}

function Mensagem({ m }) {
  if (m.role === "user") {
    return (
      <div className="msg msg-usuario">
        <div className="msg-balao">{m.content}</div>
        <time className="msg-hora" dateTime={m.createdAt}>{horario(m.createdAt)}</time>
      </div>
    );
  }
  if (m.role === "system") {
    return <div className="msg msg-sistema">{m.content}</div>;
  }
  return (
    <div className="msg msg-agente">
      <span className="msg-avatar" aria-hidden="true"><Icone nome="suporte" tamanho={16} /></span>
      <div className="msg-corpo">
        <div className="msg-autor">{m.author}<time className="msg-hora" dateTime={m.createdAt}>{horario(m.createdAt)}</time></div>
        <div className="msg-texto">{m.content}</div>
      </div>
    </div>
  );
}

/** Tela de atendimento: conversa do ticket aberto, ou a tela inicial para abrir um ticket novo. */
export function TelaAtendimento({ atendimento }) {
  const { ticketId, conversa, enviando, erro, setErro, pedidoNovo, enviar, mudarStatus } = atendimento;
  const fim = useRef(null);
  const total = conversa?.messages?.length ?? 0;

  useEffect(() => { fim.current?.scrollIntoView({ block: "end" }); }, [total, ticketId]);

  const aviso = erro ? (
    <div className="aviso atendimento-aviso" role="alert">
      <span className="aviso-texto"><Icone nome="alerta" tamanho={18} /><span>{erro}</span></span>
      <Botao variante="fantasma" icone="fechar" aria-label="Fechar aviso" onClick={() => setErro(null)} />
    </div>
  ) : null;

  if (!ticketId) {
    return (
      <section className="atendimento atendimento-inicio" aria-label="Novo ticket">
        <div className="atendimento-boas-vindas">
          <span className="atendimento-selo" aria-hidden="true"><Icone nome="conversa" tamanho={22} /></span>
          <h1>Como podemos ajudar?</h1>
          <p>Descreva o problema ou a dúvida. Cada ticket vira uma conversa com o nosso atendimento.</p>
        </div>
        <div className="atendimento-rodape">
          {aviso}
          <Compositor key={`novo-${pedidoNovo}`} rolarAoMontar={pedidoNovo > 0} aoEnviar={enviar} enviando={enviando} placeholder="Escreva sua mensagem…" />
          <p className="compositor-dica">Enter envia · Shift+Enter quebra a linha</p>
        </div>
      </section>
    );
  }

  if (!conversa) {
    return <section className="atendimento"><p className="carregando-line atendimento-carregando" role="status">Carregando conversa…</p></section>;
  }

  const { ticket, messages } = conversa;
  const ultima = messages[messages.length - 1];
  const aguardando = ticket.status === "open" && ultima?.role === "user";

  return (
    <section className="atendimento" aria-label={ticket.title}>
      <header className="atendimento-topo">
        <div className="atendimento-topo-texto">
          <h1 className="atendimento-titulo">{ticket.title}</h1>
          <span className="ticket-status" data-status={ticket.status}>{ROTULO_STATUS[ticket.status]}</span>
        </div>
        {ticket.status === "open"
          ? <Botao variante="fantasma" icone="check" onClick={() => mudarStatus("resolved")}>Marcar como resolvido</Botao>
          : <Botao variante="fantasma" icone="atualizar" onClick={() => mudarStatus("open")}>Reabrir</Botao>}
      </header>

      <div className="atendimento-mensagens" aria-live="polite">
        <div className="atendimento-coluna">
          {messages.map((m) => <Mensagem key={m.id} m={m} />)}
          {aguardando ? (
            <div className="msg msg-agente msg-aguardando" role="status">
              <span className="msg-avatar" aria-hidden="true"><Icone nome="suporte" tamanho={16} /></span>
              <div className="msg-corpo"><span className="digitando" aria-hidden="true"><i /><i /><i /></span> Aguardando resposta do atendimento</div>
            </div>
          ) : null}
          <div ref={fim} />
        </div>
      </div>

      <div className="atendimento-rodape">
        {aviso}
        <Compositor key={ticket.id} aoEnviar={enviar} enviando={enviando} placeholder={ticket.status === "resolved" ? "Escreva para reabrir o ticket…" : "Responder…"} />
      </div>
    </section>
  );
}
