import { Botao } from "./Botao.jsx";
import { Dialogo } from "./Dialogo.jsx";

/** Confirmação para ações destrutivas: o texto diz o que será apagado e que não dá para desfazer. */
export function Confirmar({ aberto, titulo, descricao, rotuloConfirmar = "Excluir", aoConfirmar, aoFechar }) {
  return (
    <Dialogo aberto={aberto} titulo={titulo} descricao={descricao} aoFechar={aoFechar}>
      <div className="acoes">
        <Botao onClick={aoFechar}>Cancelar</Botao>
        <Botao variante="perigo-solido" onClick={aoConfirmar}>{rotuloConfirmar}</Botao>
      </div>
    </Dialogo>
  );
}
