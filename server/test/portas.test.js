import assert from "node:assert/strict";
import { createServer } from "node:net";
import { test } from "node:test";
import { acharPorta, portaLivre } from "../../scripts/portas.mjs";

test("porta ocupada em todas as interfaces não é livre; a busca pula para a próxima e respeita as reservadas", async () => {
  const ocupante = createServer();
  await new Promise((r) => ocupante.listen(0, "0.0.0.0", r));
  const porta = ocupante.address().port;
  try {
    assert.equal(await portaLivre(porta), false);
    const achada = await acharPorta(porta);
    assert.ok(achada > porta);
    assert.notEqual(await acharPorta(porta, [achada]), achada);
  } finally { ocupante.close(); }
});
