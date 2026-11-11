import { Botao } from "./componentes/Botao.jsx";
import { Icone } from "./componentes/Icone.jsx";

const TELAS = [
  { id: "quadros", rotulo: "Quadros", icone: "colunas" },
  { id: "atendimento", rotulo: "Atendimento", icone: "conversa" },
];

/** Lateral: menu entre as telas e, abaixo, o conteúdo da tela atual (quadros ou tickets em `children`). */
export function BarraLateral({ tela, aoTrocarTela, quadros, quadroId, aoSelecionar, aoNovoQuadro, aoRenomear, aoExcluir, children }) {
  return (
    <aside className="lateral" aria-label="Navegação">
      <a className="marca" href="/" aria-label="Fluxo, voltar ao início" style={{ textDecoration: "none" }}>
        <span className="marca-simbolo" aria-hidden="true">
          <Icone nome="colunas" tamanho={18} />
        </span>
        <span className="marca-nome">Fluxo</span>
      </a>

      <nav className="lateral-menu" aria-label="Telas">
        {TELAS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="lateral-menu-item"
            aria-current={tela === t.id ? "page" : undefined}
            onClick={() => aoTrocarTela(t.id)}
          >
            <Icone nome={t.icone} tamanho={18} />
            {t.rotulo}
          </button>
        ))}
      </nav>

      {tela === "quadros" ? (
        <>
          <div className="lateral-topo">
            <h2 className="lateral-titulo">Quadros</h2>
            <Botao variante="fantasma" icone="mais" aria-label="Criar quadro" onClick={aoNovoQuadro} />
          </div>

          {quadros === null ? (
            <p className="lateral-vazio">Carregando quadros…</p>
          ) : quadros.length ? (
            <ul className="lateral-lista">
              {quadros.map((quadro) => (
                <li key={quadro.id}>
                  <div className="lateral-item" data-ativo={quadro.id === quadroId ? "" : undefined}>
                    <button
                      type="button"
                      className="lateral-escolha"
                      aria-current={quadro.id === quadroId ? "page" : undefined}
                      onClick={() => aoSelecionar(quadro.id)}
                    >
                      {quadro.title}
                    </button>
                    <span className="lateral-acoes">
                      <Botao variante="fantasma" icone="lapis" aria-label={`Renomear quadro ${quadro.title}`} onClick={() => aoRenomear(quadro)} />
                      <Botao variante="fantasma" icone="lixeira" aria-label={`Excluir quadro ${quadro.title}`} onClick={() => aoExcluir(quadro)} />
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="lateral-vazio">Nenhum quadro ainda. Crie o primeiro para começar.</p>
          )}
        </>
      ) : (
        children
      )}
    </aside>
  );
}
