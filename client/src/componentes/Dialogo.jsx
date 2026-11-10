import { useEffect, useId, useRef } from "react";
import { Icone } from "./Icone.jsx";

/** Diálogo modal nativo: fecha com Esc e ao clicar fora; devolve o foco a quem o abriu. */
export function Dialogo({ aberto, titulo, descricao, aoFechar, children }) {
  const ref = useRef(null);
  const idTitulo = useId();
  const idDescricao = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) d.showModal();
    if (!aberto && d.open) d.close();
  }, [aberto]);
  return (
    <dialog
      ref={ref}
      className="dialogo"
      aria-labelledby={idTitulo}
      aria-describedby={descricao ? idDescricao : undefined}
      onClose={aoFechar}
      onClick={(e) => { if (e.target === ref.current) aoFechar(); }}
    >
      <div className="dialogo-caixa">
        <header className="dialogo-topo">
          <h2 id={idTitulo}>{titulo}</h2>
          <button type="button" className="botao botao-fantasma botao-icone" aria-label="Fechar" onClick={aoFechar}>
            <Icone nome="fechar" tamanho={18} />
          </button>
        </header>
        {descricao ? <p id={idDescricao} className="dialogo-texto">{descricao}</p> : null}
        {children}
      </div>
    </dialog>
  );
}
