import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icone } from "./Icone.jsx";

const MARGEM = 12;

/**
 * Menu popup acessível: `role="menu"`, navegação por setas, Esc fecha,
 * foco volta para o botão que abriu e o submenu "Mover para" abre com →.
 * O painel vai para o fim do `body` para não ser cortado pelo scroll do quadro.
 */
export function Menu({ rotulo, icone = "elipse", itens = [], submenu, className = "" }) {
  const [aberto, setAberto] = useState(false);
  const [subAberto, setSubAberto] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [subPos, setSubPos] = useState({ top: 0, left: 0 });
  const gatilho = useRef(null);
  const painel = useRef(null);
  const subPainel = useRef(null);
  const itemSub = useRef(null);

  const fechar = (devolverFoco = true) => {
    setAberto(false);
    setSubAberto(false);
    if (devolverFoco) gatilho.current?.focus();
  };

  // Posiciona o painel junto ao gatilho e o mantém dentro da janela.
  useLayoutEffect(() => {
    if (!aberto || !gatilho.current || !painel.current) return;
    const g = gatilho.current.getBoundingClientRect();
    const p = painel.current.getBoundingClientRect();
    let top = g.bottom + 6;
    let left = g.right - p.width;
    if (left + p.width > window.innerWidth - MARGEM) left = window.innerWidth - MARGEM - p.width;
    if (left < MARGEM) left = MARGEM;
    if (top + p.height > window.innerHeight - MARGEM) top = Math.max(MARGEM, g.top - p.height - 6);
    setPos({ top, left });
  }, [aberto]);

  useLayoutEffect(() => {
    if (!subAberto || !itemSub.current || !painel.current) return;
    const i = itemSub.current.getBoundingClientRect();
    const p = painel.current.getBoundingClientRect();
    let top = i.top - 6;
    let left = p.right - 6;
    if (left + 208 > window.innerWidth - MARGEM) left = p.left - 202;
    if (top < MARGEM) top = MARGEM;
    setSubPos({ top, left });
  }, [subAberto]);

  // Foco entra no primeiro item quando o menu abre.
  useEffect(() => {
    if (!aberto) return;
    const primeiro = painel.current?.querySelector('[role="menuitem"]');
    primeiro?.focus();
  }, [aberto]);

  // Fecha ao clicar fora, rolar a página ou redimensionar.
  useEffect(() => {
    if (!aberto) return;
    const fora = (e) => {
      if (painel.current?.contains(e.target)) return;
      if (subPainel.current?.contains(e.target)) return;
      if (gatilho.current?.contains(e.target)) return;
      fechar(false);
    };
    document.addEventListener("pointerdown", fora);
    window.addEventListener("resize", () => fechar(false));
    window.addEventListener("scroll", () => fechar(false), true);
    return () => {
      document.removeEventListener("pointerdown", fora);
      window.removeEventListener("resize", () => fechar(false));
      window.removeEventListener("scroll", () => fechar(false), true);
    };
  }, [aberto]);

  const navegar = (e) => {
    const itensMenu = [...(e.currentTarget.querySelectorAll('[role="menuitem"]') ?? [])];
    const i = itensMenu.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      itensMenu[(i + 1) % itensMenu.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      itensMenu[(i - 1 + itensMenu.length) % itensMenu.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      itensMenu[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      itensMenu[itensMenu.length - 1]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      fechar();
    } else if (e.key === "Tab") {
      fechar(false);
    }
  };

  const abrirSub = () => {
    setSubAberto(true);
    requestAnimationFrame(() => subPainel.current?.querySelector('[role="menuitem"]')?.focus());
  };

  return (
    <>
      <button
        type="button"
        ref={gatilho}
        className={`botao botao-fantasma botao-icone ${className}`.trim()}
        aria-label={rotulo}
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => { setAberto((v) => !v); setSubAberto(false); }}
      >
        <Icone nome={icone} tamanho={18} />
      </button>

      {aberto
        ? createPortal(
            <div ref={painel} className="menu" role="menu" aria-label={rotulo} style={{ top: pos.top, left: pos.left }} onKeyDown={navegar}>
              {itens.map((item) => (
                <li key={item.rotulo} className="menu-item" role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="menu-botao"
                    data-perigo={item.perigo ? "" : undefined}
                    onClick={() => { fechar(false); item.aoClicar?.(); }}
                  >
                    {item.icone ? <Icone nome={item.icone} tamanho={16} /> : null}
                    {item.rotulo}
                  </button>
                </li>
              ))}

              {submenu ? (
                <li className="menu-item" role="none">
                  <button
                    type="button"
                    role="menuitem"
                    ref={itemSub}
                    className="menu-botao"
                    aria-haspopup="menu"
                    aria-expanded={subAberto}
                    onClick={() => (subAberto ? setSubAberto(false) : abrirSub())}
                    onPointerEnter={() => setSubAberto(true)}
                    onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); abrirSub(); } }}
                  >
                    {submenu.icone ? <Icone nome={submenu.icone} tamanho={16} /> : null}
                    {submenu.rotulo}
                    <Icone nome="chevron-direita" tamanho={16} className="menu-seta" />
                  </button>
                </li>
              ) : null}
            </div>,
            document.body,
          )
        : null}

      {aberto && subAberto
        ? createPortal(
            <div
              ref={subPainel}
              className="menu"
              role="menu"
              aria-label={submenu.rotulo}
              style={{ top: subPos.top, left: subPos.left }}
              onKeyDown={(e) => {
                if (e.key === "Escape") { e.preventDefault(); fechar(); }
                else if (e.key === "ArrowLeft") { e.preventDefault(); setSubAberto(false); itemSub.current?.focus(); }
                else navegar(e);
              }}
            >
              <p className="menu-grupo">{submenu.rotulo}</p>
              {submenu.itens.map((item) => (
                <li key={item.id ?? item.rotulo} className="menu-item" role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className="menu-botao"
                    onClick={() => { fechar(false); item.aoClicar?.(); }}
                  >
                    {item.icone ? <Icone nome={item.icone} tamanho={16} /> : null}
                    {item.rotulo}
                  </button>
                </li>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
