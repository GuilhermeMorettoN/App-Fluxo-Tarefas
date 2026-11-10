// client/src/componentes/Icone.jsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var DESENHOS = {
  colunas: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "5", height: "16", rx: "1.5" }),
    /* @__PURE__ */ jsx("rect", { x: "10", y: "4", width: "5", height: "10", rx: "1.5" }),
    /* @__PURE__ */ jsx("rect", { x: "17", y: "4", width: "4", height: "14", rx: "1.5" })
  ] }),
  mais: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12 5v14" }),
    /* @__PURE__ */ jsx("path", { d: "M5 12h14" })
  ] }),
  lapis: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12 20h9" }),
    /* @__PURE__ */ jsx("path", { d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" })
  ] }),
  lixeira: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M3 6h18" }),
    /* @__PURE__ */ jsx("path", { d: "M8 6V4h8v2" }),
    /* @__PURE__ */ jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }),
    /* @__PURE__ */ jsx("path", { d: "M10 11v6" }),
    /* @__PURE__ */ jsx("path", { d: "M14 11v6" })
  ] }),
  fechar: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
    /* @__PURE__ */ jsx("path", { d: "M6 6l12 12" })
  ] }),
  mover: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M4 12h15" }),
    /* @__PURE__ */ jsx("path", { d: "m13 6 6 6-6 6" })
  ] }),
  "chevron-direita": /* @__PURE__ */ jsx("path", { d: "m9 6 6 6-6 6" }),
  "chevron-baixo": /* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" }),
  elipse: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "5", r: "1.4" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "1.4" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "19", r: "1.4" })
  ] }),
  nota: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M4 6h16" }),
    /* @__PURE__ */ jsx("path", { d: "M4 12h10" }),
    /* @__PURE__ */ jsx("path", { d: "M4 18h7" })
  ] }),
  alerta: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12 9v4" }),
    /* @__PURE__ */ jsx("path", { d: "M12 17h.01" }),
    /* @__PURE__ */ jsx("path", { d: "M10.3 4.3 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" })
  ] }),
  pasta: /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("path", { d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" }) }),
  arrastar: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "6", r: "1.3" }),
    /* @__PURE__ */ jsx("circle", { cx: "15", cy: "6", r: "1.3" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "12", r: "1.3" }),
    /* @__PURE__ */ jsx("circle", { cx: "15", cy: "12", r: "1.3" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "18", r: "1.3" }),
    /* @__PURE__ */ jsx("circle", { cx: "15", cy: "18", r: "1.3" })
  ] }),
  atualizar: /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M20 12a8 8 0 1 1-2.3-5.6" }),
    /* @__PURE__ */ jsx("path", { d: "M20 3v6h-6" })
  ] })
};
function Icone({ nome, tamanho = 18, rotulo, className = "", ...resto }) {
  const desenho = DESENHOS[nome];
  if (!desenho) return null;
  return /* @__PURE__ */ jsx(
    "svg",
    {
      className,
      width: tamanho,
      height: tamanho,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.75",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      role: rotulo ? "img" : void 0,
      "aria-label": rotulo,
      "aria-hidden": rotulo ? void 0 : "true",
      focusable: "false",
      ...resto,
      children: desenho
    }
  );
}

// client/src/componentes/Botao.jsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function Botao({ variante = "suave", className = "", icone, children, ...resto }) {
  const somenteIcone = !children && icone;
  return /* @__PURE__ */ jsxs2(
    "button",
    {
      type: "button",
      className: `botao botao-${variante} ${somenteIcone ? "botao-icone" : ""} ${className}`.trim(),
      ...resto,
      children: [
        icone ? /* @__PURE__ */ jsx2(Icone, { nome: icone, tamanho: 18 }) : null,
        children
      ]
    }
  );
}

// client/src/BarraLateral.jsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
function BarraLateral({ quadros: quadros2, quadroId, aoSelecionar, aoNovoQuadro, aoRenomear, aoExcluir }) {
  return /* @__PURE__ */ jsxs3("aside", { className: "lateral", "aria-label": "Quadros", children: [
    /* @__PURE__ */ jsxs3("div", { className: "marca", children: [
      /* @__PURE__ */ jsx3("span", { className: "marca-simbolo", "aria-hidden": "true", children: /* @__PURE__ */ jsx3(Icone, { nome: "colunas", tamanho: 18 }) }),
      /* @__PURE__ */ jsx3("span", { className: "marca-nome", children: "Fluxo" })
    ] }),
    /* @__PURE__ */ jsxs3("div", { className: "lateral-topo", children: [
      /* @__PURE__ */ jsx3("h2", { className: "lateral-titulo", children: "Quadros" }),
      /* @__PURE__ */ jsx3(Botao, { variante: "fantasma", icone: "mais", "aria-label": "Criar quadro", onClick: aoNovoQuadro })
    ] }),
    quadros2 === null ? /* @__PURE__ */ jsx3("p", { className: "lateral-vazio", children: "Carregando quadros\u2026" }) : quadros2.length ? /* @__PURE__ */ jsx3("ul", { className: "lateral-lista", children: quadros2.map((quadro) => /* @__PURE__ */ jsx3("li", { children: /* @__PURE__ */ jsxs3("div", { className: "lateral-item", "data-ativo": quadro.id === quadroId ? "" : void 0, children: [
      /* @__PURE__ */ jsx3(
        "button",
        {
          type: "button",
          className: "lateral-escolha",
          "aria-current": quadro.id === quadroId ? "page" : void 0,
          onClick: () => aoSelecionar(quadro.id),
          children: quadro.title
        }
      ),
      /* @__PURE__ */ jsxs3("span", { className: "lateral-acoes", children: [
        /* @__PURE__ */ jsx3(Botao, { variante: "fantasma", icone: "lapis", "aria-label": `Renomear quadro ${quadro.title}`, onClick: () => aoRenomear(quadro) }),
        /* @__PURE__ */ jsx3(Botao, { variante: "fantasma", icone: "lixeira", "aria-label": `Excluir quadro ${quadro.title}`, onClick: () => aoExcluir(quadro) })
      ] })
    ] }) }, quadro.id)) }) : /* @__PURE__ */ jsx3("p", { className: "lateral-vazio", children: "Nenhum quadro ainda. Crie o primeiro para come\xE7ar." })
  ] });
}

// client/src/TelaQuadro.jsx
import { useState as useState3 } from "react";

// client/src/componentes/Campo.jsx
import { useId } from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function Campo({ rotulo, erro, multilinha = false, ...resto }) {
  const id = useId();
  const Entrada = multilinha ? "textarea" : "input";
  return /* @__PURE__ */ jsxs4("label", { className: "campo", htmlFor: id, children: [
    /* @__PURE__ */ jsx4("span", { className: "campo-rotulo", children: rotulo }),
    /* @__PURE__ */ jsx4(Entrada, { id, className: "campo-entrada", "aria-invalid": erro ? true : void 0, "aria-describedby": erro ? `${id}-erro` : void 0, ...resto }),
    erro ? /* @__PURE__ */ jsx4("span", { id: `${id}-erro`, className: "campo-erro", role: "alert", children: erro }) : null
  ] });
}

// client/src/Lista.jsx
import { useState as useState2 } from "react";

// client/src/componentes/Menu.jsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Fragment as Fragment2, jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var MARGEM = 12;
function Menu({ rotulo, icone = "elipse", itens = [], submenu, className = "" }) {
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
  useEffect(() => {
    if (!aberto) return;
    const primeiro = painel.current?.querySelector('[role="menuitem"]');
    primeiro?.focus();
  }, [aberto]);
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
    const itensMenu = [...e.currentTarget.querySelectorAll('[role="menuitem"]') ?? []];
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
  return /* @__PURE__ */ jsxs5(Fragment2, { children: [
    /* @__PURE__ */ jsx5(
      "button",
      {
        type: "button",
        ref: gatilho,
        className: `botao botao-fantasma botao-icone ${className}`.trim(),
        "aria-label": rotulo,
        "aria-haspopup": "menu",
        "aria-expanded": aberto,
        onClick: () => {
          setAberto((v) => !v);
          setSubAberto(false);
        },
        children: /* @__PURE__ */ jsx5(Icone, { nome: icone, tamanho: 18 })
      }
    ),
    aberto ? createPortal(
      /* @__PURE__ */ jsxs5("div", { ref: painel, className: "menu", role: "menu", "aria-label": rotulo, style: { top: pos.top, left: pos.left }, onKeyDown: navegar, children: [
        itens.map((item) => /* @__PURE__ */ jsx5("li", { className: "menu-item", role: "none", children: /* @__PURE__ */ jsxs5(
          "button",
          {
            type: "button",
            role: "menuitem",
            className: "menu-botao",
            "data-perigo": item.perigo ? "" : void 0,
            onClick: () => {
              fechar(false);
              item.aoClicar?.();
            },
            children: [
              item.icone ? /* @__PURE__ */ jsx5(Icone, { nome: item.icone, tamanho: 16 }) : null,
              item.rotulo
            ]
          }
        ) }, item.rotulo)),
        submenu ? /* @__PURE__ */ jsx5("li", { className: "menu-item", role: "none", children: /* @__PURE__ */ jsxs5(
          "button",
          {
            type: "button",
            role: "menuitem",
            ref: itemSub,
            className: "menu-botao",
            "aria-haspopup": "menu",
            "aria-expanded": subAberto,
            onClick: () => subAberto ? setSubAberto(false) : abrirSub(),
            onPointerEnter: () => setSubAberto(true),
            onKeyDown: (e) => {
              if (e.key === "ArrowRight") {
                e.preventDefault();
                abrirSub();
              }
            },
            children: [
              submenu.icone ? /* @__PURE__ */ jsx5(Icone, { nome: submenu.icone, tamanho: 16 }) : null,
              submenu.rotulo,
              /* @__PURE__ */ jsx5(Icone, { nome: "chevron-direita", tamanho: 16, className: "menu-seta" })
            ]
          }
        ) }) : null
      ] }),
      document.body
    ) : null,
    aberto && subAberto ? createPortal(
      /* @__PURE__ */ jsxs5(
        "div",
        {
          ref: subPainel,
          className: "menu",
          role: "menu",
          "aria-label": submenu.rotulo,
          style: { top: subPos.top, left: subPos.left },
          onKeyDown: (e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              fechar();
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              setSubAberto(false);
              itemSub.current?.focus();
            } else navegar(e);
          },
          children: [
            /* @__PURE__ */ jsx5("p", { className: "menu-grupo", children: submenu.rotulo }),
            submenu.itens.map((item) => /* @__PURE__ */ jsx5("li", { className: "menu-item", role: "none", children: /* @__PURE__ */ jsxs5(
              "button",
              {
                type: "button",
                role: "menuitem",
                className: "menu-botao",
                onClick: () => {
                  fechar(false);
                  item.aoClicar?.();
                },
                children: [
                  item.icone ? /* @__PURE__ */ jsx5(Icone, { nome: item.icone, tamanho: 16 }) : null,
                  item.rotulo
                ]
              }
            ) }, item.id ?? item.rotulo))
          ]
        }
      ),
      document.body
    ) : null
  ] });
}

// client/src/Cartao.jsx
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function Cartao({
  cartao,
  listas: listas2,
  arrastando,
  apontado,
  aoEditar,
  aoExcluir,
  aoMover,
  aoArrastarInicio,
  aoArrastarFim,
  aoApontar
}) {
  return /* @__PURE__ */ jsxs6(
    "article",
    {
      className: "cartao",
      draggable: true,
      "data-arrastando": arrastando ? "" : void 0,
      "data-alvo": apontado ? "" : void 0,
      onDragStart: (e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", cartao.id);
        aoArrastarInicio(cartao.id);
      },
      onDragEnd: aoArrastarFim,
      onDragOver: (e) => {
        e.preventDefault();
        e.stopPropagation();
        aoApontar(cartao.id);
      },
      children: [
        /* @__PURE__ */ jsxs6("div", { className: "cartao-topo", children: [
          /* @__PURE__ */ jsx6("button", { type: "button", className: "cartao-titulo", onClick: aoEditar, children: cartao.title }),
          /* @__PURE__ */ jsx6(
            Menu,
            {
              rotulo: `Op\xE7\xF5es do cart\xE3o ${cartao.title}`,
              itens: [
                { rotulo: "Editar cart\xE3o", icone: "lapis", aoClicar: aoEditar },
                { rotulo: "Excluir cart\xE3o", icone: "lixeira", perigo: true, aoClicar: aoExcluir }
              ],
              submenu: {
                rotulo: "Mover para",
                icone: "mover",
                itens: listas2.map((lista) => ({
                  id: lista.id,
                  rotulo: lista.title,
                  aoClicar: () => aoMover(lista.id)
                }))
              }
            }
          )
        ] }),
        cartao.description ? /* @__PURE__ */ jsx6("p", { className: "cartao-descricao", children: cartao.description }) : null,
        /* @__PURE__ */ jsxs6("footer", { className: "cartao-rodape", children: [
          cartao.description ? /* @__PURE__ */ jsxs6("span", { className: "cartao-selo", children: [
            /* @__PURE__ */ jsx6(Icone, { nome: "nota", tamanho: 14, rotulo: "Tem descri\xE7\xE3o" }),
            "Descri\xE7\xE3o"
          ] }) : /* @__PURE__ */ jsx6("span", {}),
          /* @__PURE__ */ jsx6(Icone, { nome: "arrastar", tamanho: 14, className: "cartao-empunho", rotulo: "Arraste para mover o cart\xE3o" })
        ] })
      ]
    }
  );
}

// client/src/Lista.jsx
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function Lista({
  lista,
  listas: listas2,
  arrastando,
  apontado,
  listaAlvo,
  aoCriarCartao,
  aoRenomear,
  aoExcluir,
  aoEditarCartao,
  aoExcluirCartao,
  aoMoverCartao,
  aoArrastarInicio,
  aoArrastarFim,
  aoApontar,
  aoApontarLista,
  aoSoltar
}) {
  const [novo, setNovo] = useState2(false);
  const [titulo, setTitulo] = useState2("");
  const adicionar = (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    aoCriarCartao(lista.id, titulo.trim());
    setTitulo("");
    setNovo(false);
  };
  const apontar = (cartaoId) => {
    aoApontar(cartaoId);
    aoApontarLista(lista.id);
  };
  return /* @__PURE__ */ jsxs7(
    "section",
    {
      className: "lista",
      "aria-label": lista.title,
      "data-alvo": listaAlvo ? "" : void 0,
      onDragOver: (e) => {
        e.preventDefault();
        apontar(null);
      },
      onDrop: (e) => {
        e.preventDefault();
        aoSoltar(lista.id);
      },
      children: [
        /* @__PURE__ */ jsxs7("header", { className: "lista-topo", children: [
          /* @__PURE__ */ jsx7("button", { type: "button", className: "lista-nome", onClick: aoRenomear, title: "Renomear lista", children: lista.title }),
          /* @__PURE__ */ jsx7("span", { className: "lista-contagem", children: lista.cards?.length ?? 0 }),
          /* @__PURE__ */ jsx7(
            Menu,
            {
              rotulo: `Op\xE7\xF5es da lista ${lista.title}`,
              itens: [
                { rotulo: "Renomear lista", icone: "lapis", aoClicar: aoRenomear },
                { rotulo: "Excluir lista", icone: "lixeira", perigo: true, aoClicar: aoExcluir }
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs7("div", { className: "lista-cartoes", children: [
          lista.cards?.map((cartao) => /* @__PURE__ */ jsx7(
            Cartao,
            {
              cartao,
              listas: listas2,
              arrastando: arrastando === cartao.id,
              apontado: apontado === cartao.id,
              aoEditar: () => aoEditarCartao(cartao),
              aoExcluir: () => aoExcluirCartao(cartao),
              aoMover: (listaId) => aoMoverCartao(cartao, listaId),
              aoArrastarInicio,
              aoArrastarFim,
              aoApontar: apontar
            },
            cartao.id
          )),
          lista.cards?.length ? null : /* @__PURE__ */ jsx7("p", { className: "lista-vazia", children: "Nenhum cart\xE3o nesta lista." })
        ] }),
        /* @__PURE__ */ jsx7("div", { className: "lista-rodape", children: novo ? /* @__PURE__ */ jsxs7("form", { className: "form-linha", onSubmit: adicionar, children: [
          /* @__PURE__ */ jsx7(
            Campo,
            {
              rotulo: "T\xEDtulo do cart\xE3o",
              value: titulo,
              onChange: (e) => setTitulo(e.target.value),
              placeholder: "O que precisa ser feito?",
              maxLength: 200,
              autoFocus: true
            }
          ),
          /* @__PURE__ */ jsxs7("div", { className: "rodape-linha", children: [
            /* @__PURE__ */ jsx7(Botao, { variante: "primario", type: "submit", disabled: !titulo.trim(), children: "Adicionar cart\xE3o" }),
            /* @__PURE__ */ jsx7(Botao, { variante: "fantasma", icone: "fechar", "aria-label": "Cancelar novo cart\xE3o", onClick: () => {
              setNovo(false);
              setTitulo("");
            } })
          ] })
        ] }) : /* @__PURE__ */ jsx7(Botao, { variante: "suave", className: "botao-bloco", icone: "mais", onClick: () => setNovo(true), children: "Adicionar cart\xE3o" }) })
      ]
    }
  );
}

// client/src/ordem.js
function posicaoDeDestino(cartoes, idAlvo) {
  if (!idAlvo) return cartoes.length;
  const i = cartoes.findIndex((c) => c.id === idAlvo);
  return i < 0 ? cartoes.length : i;
}

// client/src/TelaQuadro.jsx
import { Fragment as Fragment3, jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function TelaQuadro({
  board,
  listas: listas2,
  aoRenomearQuadro,
  aoExcluirQuadro,
  aoCriarLista,
  aoRenomearLista,
  aoExcluirLista,
  aoCriarCartao,
  aoEditarCartao,
  aoExcluirCartao,
  aoMoverCartao,
  aoSoltarCartao
}) {
  const [arrastando, setArrastando] = useState3(null);
  const [apontado, setApontado] = useState3(null);
  const [listaAlvo, setListaAlvo] = useState3(null);
  const [novaLista, setNovaLista] = useState3(false);
  const [tituloLista, setTituloLista] = useState3("");
  const criarLista = (e) => {
    e.preventDefault();
    if (!tituloLista.trim()) return;
    aoCriarLista(tituloLista.trim());
    setTituloLista("");
    setNovaLista(false);
  };
  const soltar = (listaId) => {
    const cartaoId = arrastando;
    setArrastando(null);
    setApontado(null);
    setListaAlvo(null);
    if (!cartaoId) return;
    const lista = listas2.find((l) => l.id === listaId);
    const semCartao = (lista?.cards ?? []).filter((c) => c.id !== cartaoId);
    aoSoltarCartao(cartaoId, listaId, posicaoDeDestino(semCartao, apontado));
  };
  return /* @__PURE__ */ jsxs8(Fragment3, { children: [
    /* @__PURE__ */ jsxs8("header", { className: "quadro-topo", children: [
      /* @__PURE__ */ jsx8("h1", { className: "quadro-titulo", children: board.title }),
      /* @__PURE__ */ jsxs8("div", { className: "quadro-acoes", children: [
        /* @__PURE__ */ jsx8(Botao, { variante: "fantasma", icone: "lapis", "aria-label": "Renomear quadro", onClick: aoRenomearQuadro }),
        /* @__PURE__ */ jsx8(Botao, { variante: "fantasma", icone: "lixeira", "aria-label": "Excluir quadro", onClick: aoExcluirQuadro })
      ] })
    ] }),
    listas2.length ? null : /* @__PURE__ */ jsxs8("div", { className: "vazio-canvas", children: [
      /* @__PURE__ */ jsx8("h2", { children: "Nenhuma lista neste quadro" }),
      /* @__PURE__ */ jsx8("p", { children: 'As listas s\xE3o as colunas do quadro: "A fazer", "Em andamento", "Pronto". Comece pela primeira.' }),
      /* @__PURE__ */ jsx8(Botao, { variante: "primario", icone: "mais", onClick: () => setNovaLista(true), children: "Adicionar lista" })
    ] }),
    /* @__PURE__ */ jsxs8("div", { className: "listas", children: [
      listas2.map((lista) => /* @__PURE__ */ jsx8(
        Lista,
        {
          lista,
          listas: listas2,
          arrastando,
          apontado,
          listaAlvo: listaAlvo === lista.id,
          aoCriarCartao,
          aoRenomear: () => aoRenomearLista(lista),
          aoExcluir: () => aoExcluirLista(lista),
          aoEditarCartao,
          aoExcluirCartao,
          aoMoverCartao,
          aoArrastarInicio: setArrastando,
          aoArrastarFim: () => {
            setArrastando(null);
            setApontado(null);
            setListaAlvo(null);
          },
          aoApontar: setApontado,
          aoApontarLista: setListaAlvo,
          aoSoltar: soltar
        },
        lista.id
      )),
      /* @__PURE__ */ jsx8("div", { className: "nova-lista", children: novaLista ? /* @__PURE__ */ jsxs8("form", { className: "form-linha", onSubmit: criarLista, children: [
        /* @__PURE__ */ jsx8(
          Campo,
          {
            rotulo: "T\xEDtulo da lista",
            value: tituloLista,
            onChange: (e) => setTituloLista(e.target.value),
            placeholder: "Ex.: A fazer",
            maxLength: 120,
            autoFocus: true
          }
        ),
        /* @__PURE__ */ jsxs8("div", { className: "rodape-linha", children: [
          /* @__PURE__ */ jsx8(Botao, { variante: "primario", type: "submit", disabled: !tituloLista.trim(), children: "Adicionar lista" }),
          /* @__PURE__ */ jsx8(Botao, { variante: "fantasma", icone: "fechar", "aria-label": "Cancelar nova lista", onClick: () => {
            setNovaLista(false);
            setTituloLista("");
          } })
        ] })
      ] }) : /* @__PURE__ */ jsx8(Botao, { variante: "suave", className: "botao-bloco", icone: "mais", onClick: () => setNovaLista(true), children: "Adicionar lista" }) })
    ] }),
    arrastando ? /* @__PURE__ */ jsxs8("p", { className: "carregando-line", role: "status", "aria-live": "polite", children: [
      /* @__PURE__ */ jsx8(Icone, { nome: "arrastar", tamanho: 16 }),
      "Solte o cart\xE3o na lista desejada."
    ] }) : null
  ] });
}

// client/preview/Previa.jsx
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var quadros = [
  { id: "b1", title: "Lan\xE7amento do site" },
  { id: "b2", title: "Suporte de agosto" },
  { id: "b3", title: "Pesquisa de clientes" }
];
var listas = [
  {
    id: "l1",
    title: "A fazer",
    cards: [
      {
        id: "c1",
        title: "Revisar textos da p\xE1gina inicial",
        description: "Ajustar os blocos de pre\xE7o e a se\xE7\xE3o de depoimentos com as novas mensagens."
      },
      { id: "c2", title: "Preparar imagens do banner" },
      { id: "c3", title: "Configurar o formul\xE1rio de contato" }
    ]
  },
  {
    id: "l2",
    title: "Em andamento",
    cards: [
      {
        id: "c4",
        title: "Migrar o cat\xE1logo antigo",
        description: "Faltam duas categorias. O time de conte\xFAdo valida as fotos antes de publicar."
      },
      { id: "c5", title: "Testar o checkout no celular" }
    ]
  },
  {
    id: "l3",
    title: "Pronto",
    cards: [{ id: "c6", title: "Definir paleta do site" }]
  },
  { id: "l4", title: "Arquivo", cards: [] }
];
function Previa() {
  return /* @__PURE__ */ jsxs9("div", { className: "app", children: [
    /* @__PURE__ */ jsx9(
      BarraLateral,
      {
        quadros,
        quadroId: "b1",
        aoSelecionar: () => {
        },
        aoNovoQuadro: () => {
        },
        aoRenomear: () => {
        },
        aoExcluir: () => {
        }
      }
    ),
    /* @__PURE__ */ jsx9("main", { className: "canvas", children: /* @__PURE__ */ jsx9(
      TelaQuadro,
      {
        board: quadros[0],
        listas,
        aoRenomearQuadro: () => {
        },
        aoExcluirQuadro: () => {
        },
        aoCriarLista: () => {
        },
        aoRenomearLista: () => {
        },
        aoExcluirLista: () => {
        },
        aoCriarCartao: () => {
        },
        aoEditarCartao: () => {
        },
        aoExcluirCartao: () => {
        },
        aoMoverCartao: () => {
        },
        aoSoltarCartao: () => {
        }
      }
    ) })
  ] });
}
export {
  Previa
};
