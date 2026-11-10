// Prévia estática da interface: renderiza os componentes reais com dados de exemplo
// para conferência visual (captura de tela) sem subir servidor.
import { BarraLateral } from "../src/BarraLateral.jsx";
import { TelaQuadro } from "../src/TelaQuadro.jsx";

const quadros = [
  { id: "b1", title: "Lançamento do site" },
  { id: "b2", title: "Suporte de agosto" },
  { id: "b3", title: "Pesquisa de clientes" },
];

const listas = [
  {
    id: "l1",
    title: "A fazer",
    cards: [
      {
        id: "c1",
        title: "Revisar textos da página inicial",
        description: "Ajustar os blocos de preço e a seção de depoimentos com as novas mensagens.",
      },
      { id: "c2", title: "Preparar imagens do banner" },
      { id: "c3", title: "Configurar o formulário de contato" },
    ],
  },
  {
    id: "l2",
    title: "Em andamento",
    cards: [
      {
        id: "c4",
        title: "Migrar o catálogo antigo",
        description: "Faltam duas categorias. O time de conteúdo valida as fotos antes de publicar.",
      },
      { id: "c5", title: "Testar o checkout no celular" },
    ],
  },
  {
    id: "l3",
    title: "Pronto",
    cards: [{ id: "c6", title: "Definir paleta do site" }],
  },
  { id: "l4", title: "Arquivo", cards: [] },
];

export function Previa() {
  return (
    <div className="app">
      <BarraLateral
        quadros={quadros}
        quadroId="b1"
        aoSelecionar={() => {}}
        aoNovoQuadro={() => {}}
        aoRenomear={() => {}}
        aoExcluir={() => {}}
      />
      <main className="canvas">
        <TelaQuadro
          board={quadros[0]}
          listas={listas}
          aoRenomearQuadro={() => {}}
          aoExcluirQuadro={() => {}}
          aoCriarLista={() => {}}
          aoRenomearLista={() => {}}
          aoExcluirLista={() => {}}
          aoCriarCartao={() => {}}
          aoEditarCartao={() => {}}
          aoExcluirCartao={() => {}}
          aoMoverCartao={() => {}}
          aoSoltarCartao={() => {}}
        />
      </main>
    </div>
  );
}
