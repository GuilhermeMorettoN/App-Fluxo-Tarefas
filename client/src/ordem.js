// Lógica pura de reordenação (sem DOM): usada no arrastar e testável direto no Node.

/** Move o elemento do índice `de` para o índice `para`, devolvendo uma lista nova. */
export function mover(lista, de, para) {
  if (de === para || de < 0 || de >= lista.length) return lista;
  const copia = [...lista];
  const [item] = copia.splice(de, 1);
  copia.splice(Math.max(0, Math.min(para, copia.length)), 0, item);
  return copia;
}

/** Índice de destino ao soltar `idArrastado` sobre `idAlvo`. */
export function indiceDeDestino(lista, idArrastado, idAlvo) {
  const de = lista.findIndex((i) => i.id === idArrastado);
  const para = lista.findIndex((i) => i.id === idAlvo);
  return de < 0 || para < 0 ? -1 : para;
}

/** Posição de um cartão solto sobre `cartoes`: índice do alvo ou o fim da lista. */
export function posicaoDeDestino(cartoes, idAlvo) {
  if (!idAlvo) return cartoes.length;
  const i = cartoes.findIndex((c) => c.id === idAlvo);
  return i < 0 ? cartoes.length : i;
}

/**
 * Move um cartão para a lista `listaDestinoId` na posição `posicao`.
 * A posição é contada sobre a lista já sem o cartão arrastado, então mover
 * para baixo dentro da mesma lista não desloca o alvo.
 */
export function moverCartaoEntreListas(detalhe, cartaoId, listaDestinoId, posicao) {
  if (!detalhe?.lists) return detalhe;
  const origem = detalhe.lists.find((l) => l.cards?.some((c) => c.id === cartaoId));
  const cartao = origem?.cards.find((c) => c.id === cartaoId);
  if (!cartao) return detalhe;
  const listas = detalhe.lists.map((l) => {
    const semCartao = { ...l, cards: (l.cards ?? []).filter((c) => c.id !== cartaoId) };
    if (l.id !== listaDestinoId) return semCartao;
    const cards = [...semCartao.cards];
    const limite = Math.max(0, Math.min(posicao, cards.length));
    cards.splice(limite, 0, { ...cartao, listId: l.id });
    return { ...semCartao, cards };
  });
  return { ...detalhe, lists: listas };
}
