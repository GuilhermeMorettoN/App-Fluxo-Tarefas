import { useId } from "react";

/** Campo de texto com rótulo e mensagem de erro acessíveis. `multilinha` troca por textarea. */
export function Campo({ rotulo, erro, multilinha = false, ...resto }) {
  const id = useId();
  const Entrada = multilinha ? "textarea" : "input";
  return (
    <label className="campo" htmlFor={id}>
      <span className="campo-rotulo">{rotulo}</span>
      <Entrada id={id} className="campo-entrada" aria-invalid={erro ? true : undefined} aria-describedby={erro ? `${id}-erro` : undefined} {...resto} />
      {erro ? <span id={`${id}-erro`} className="campo-erro" role="alert">{erro}</span> : null}
    </label>
  );
}
