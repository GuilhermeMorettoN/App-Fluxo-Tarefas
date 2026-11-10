import { Icone } from "./componentes/Icone.jsx";
import { Menu } from "./componentes/Menu.jsx";

/** Cartão de uma lista: título, descrição e menu com editar, mover e excluir. */
export function Cartao({
  cartao,
  listas,
  arrastando,
  apontado,
  aoEditar,
  aoExcluir,
  aoMover,
  aoArrastarInicio,
  aoArrastarFim,
  aoApontar,
}) {
  return (
    <article
      className="cartao"
      draggable
      data-arrastando={arrastando ? "" : undefined}
      data-alvo={apontado ? "" : undefined}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", cartao.id);
        aoArrastarInicio(cartao.id);
      }}
      onDragEnd={aoArrastarFim}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        aoApontar(cartao.id);
      }}
    >
      <div className="cartao-topo">
        <button type="button" className="cartao-titulo" onClick={aoEditar}>
          {cartao.title}
        </button>
        <Menu
          rotulo={`Opções do cartão ${cartao.title}`}
          itens={[
            { rotulo: "Editar cartão", icone: "lapis", aoClicar: aoEditar },
            { rotulo: "Excluir cartão", icone: "lixeira", perigo: true, aoClicar: aoExcluir },
          ]}
          submenu={{
            rotulo: "Mover para",
            icone: "mover",
            itens: listas.map((lista) => ({
              id: lista.id,
              rotulo: lista.title,
              aoClicar: () => aoMover(lista.id),
            })),
          }}
        />
      </div>

      {cartao.description ? <p className="cartao-descricao">{cartao.description}</p> : null}

      <footer className="cartao-rodape">
        {cartao.description ? (
          <span className="cartao-selo">
            <Icone nome="nota" tamanho={14} rotulo="Tem descrição" />
            Descrição
          </span>
        ) : (
          <span />
        )}
        <Icone nome="arrastar" tamanho={14} className="cartao-empunho" rotulo="Arraste para mover o cartão" />
      </footer>
    </article>
  );
}
