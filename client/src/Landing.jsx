import { useEffect, useState } from "react";
import { api } from "./api.js";
import { Icone } from "./componentes/Icone.jsx";
import { Botao } from "./componentes/Botao.jsx";

function Preview() {
  const [quadro, setQuadro] = useState(null);
  const [estado, setEstado] = useState("carregando");
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let vivo = true;
    setEstado("carregando");
    api.quadros.listar().then(async (dados) => {
      const primeiro = dados?.boards?.[0];
      const detalhe = primeiro ? await api.quadros.detalhe(primeiro.id) : null;
      if (vivo) { setQuadro(detalhe); setEstado(detalhe ? "pronto" : "vazio"); }
    }).catch(() => { if (vivo) setEstado("erro"); });
    return () => { vivo = false; };
  }, [tentativa]);
  return <figure className="inicio-preview" aria-label="Prévia do seu quadro">
    <div className="inicio-preview-bar"><Icone nome="colunas" /><span>Seu espaço de trabalho</span><span className="inicio-preview-modo">Prévia</span></div>
    <div className="inicio-preview-conteudo">
      <div className="inicio-preview-titulo"><Icone nome="pasta" /><h2>{quadro?.board?.title ?? "Tudo começa com um quadro"}</h2></div>
      {estado === "carregando" && <div className="inicio-preview-estado" role="status"><Icone nome="colunas" tamanho={32} /><p>Carregando seu quadro…</p></div>}
      {estado === "erro" && <div className="inicio-preview-estado" role="alert"><Icone nome="alerta" tamanho={32} /><p>Não foi possível carregar a prévia. Tente novamente ou abra seus quadros.</p><Botao onClick={() => setTentativa(t => t + 1)} icone="atualizar">Tentar novamente</Botao></div>}
      {estado === "vazio" && <div className="inicio-preview-estado"><Icone nome="colunas" tamanho={32} /><h3>Seu primeiro projeto cabe aqui</h3><p>Crie um quadro e organize o trabalho em listas e cartões.</p><a className="botao" href="/quadro">Criar meu primeiro quadro</a></div>}
      {estado === "pronto" && <div className="inicio-preview-listas">{quadro.lists?.length ? quadro.lists.slice(0, 3).map(lista => <section className="inicio-preview-lista" key={lista.id}><h3>{lista.title}<span>{lista.cards?.length ?? 0}</span></h3>{lista.cards?.length ? lista.cards.slice(0, 3).map(cartao => <article className="cartao" key={cartao.id}><h4>{cartao.title}</h4>{cartao.description && <p className="cartao-descricao">{cartao.description}</p>}<Icone nome="nota" tamanho={14} /></article>) : <p className="lista-vazia">Nenhum cartão nesta lista.</p>}</section>) : <div className="inicio-preview-estado"><p>Seu quadro está pronto. Adicione a primeira lista para começar.</p></div>}</div>}
    </div>
    <figcaption>Uma prévia do seu quadro real. Abra o espaço para editar e mover cartões.</figcaption>
  </figure>;
}

export function Landing() {
  return <div className="inicio">
    <a className="inicio-pular" href="#conteudo">Pular para o conteúdo</a>
    <header className="inicio-topo inicio-largura">
      <a className="marca" href="/" aria-label="Fluxo, início"><span className="marca-simbolo"><Icone nome="colunas" tamanho={20} /></span><span className="marca-nome">Fluxo</span></a>
      <nav aria-label="Navegação principal"><a className="inicio-nav-recurso" href="#recursos">Como funciona</a><a className="botao botao-primario" href="/quadro">Abrir meus quadros<Icone nome="chevron-direita" /></a></nav>
    </header>
    <main id="conteudo">
      <section className="inicio-hero inicio-largura" aria-labelledby="inicio-titulo">
        <div className="inicio-hero-texto"><p className="inicio-assinatura"><span />Do primeiro passo à entrega</p><h1 id="inicio-titulo">Dê espaço para o trabalho fluir.</h1><p className="inicio-descricao">Tire as tarefas da cabeça e coloque tudo à vista. Organize seus projetos em quadros, acompanhe cada etapa e saiba o que vem depois.</p><div className="inicio-hero-acoes"><a className="botao botao-primario" href="/quadro">Abrir meus quadros<Icone nome="chevron-direita" /></a><a className="inicio-link" href="#recursos">Conhecer o Fluxo</a></div><p className="inicio-nota">Quadros, listas e cartões. O essencial para começar.</p></div>
        <Preview />
      </section>
      <section className="inicio-recursos inicio-largura" id="recursos" aria-labelledby="recursos-titulo"><div className="inicio-secao-topo"><h2 id="recursos-titulo">Menos coisas soltas.<br />Mais clareza no dia a dia.</h2><p>Um lugar para planejar o próximo passo e acompanhar o que já saiu do papel.</p></div><div className="inicio-recursos-grade">
        <article><span className="inicio-recurso-icone"><Icone nome="colunas" tamanho={24} /></span><h3>Um quadro para cada projeto</h3><p>Separe os trabalhos em quadros e dê a cada projeto o seu próprio espaço.</p></article>
        <article><span className="inicio-recurso-icone"><Icone nome="mover" tamanho={24} /></span><h3>Veja o trabalho avançar</h3><p>Crie listas para suas etapas. Arraste os cartões ou use o menu para movê-los.</p></article>
        <article><span className="inicio-recurso-icone"><Icone nome="nota" tamanho={24} /></span><h3>Guarde o contexto junto</h3><p>Adicione descrições aos cartões para manter detalhes e próximos passos à mão.</p></article>
      </div></section>
      <section className="inicio-final inicio-largura"><div><h2>Seu próximo passo tem lugar.</h2><p>Abra um quadro e comece pelo que precisa ser feito hoje.</p></div><a className="botao botao-primario" href="/quadro">Abrir meus quadros<Icone nome="chevron-direita" /></a></section>
    </main>
    <footer className="inicio-rodape inicio-largura"><span className="marca-nome">Fluxo</span><p>Organize o trabalho. Acompanhe o caminho.</p><a className="inicio-link" href="/quadro">Meus quadros</a></footer>
  </div>;
}
