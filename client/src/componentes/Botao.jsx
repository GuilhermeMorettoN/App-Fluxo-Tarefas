import { Icone } from "./Icone.jsx";

/** Botão com variantes: "primario" (ação principal), "suave" (secundária), "perigo" (destrutiva) e "fantasma" (discreta). */
export function Botao({ variante = "suave", className = "", icone, children, ...resto }) {
  const somenteIcone = !children && icone;
  return (
    <button
      type="button"
      className={`botao botao-${variante} ${somenteIcone ? "botao-icone" : ""} ${className}`.trim()}
      {...resto}
    >
      {icone ? <Icone nome={icone} tamanho={18} /> : null}
      {children}
    </button>
  );
}
