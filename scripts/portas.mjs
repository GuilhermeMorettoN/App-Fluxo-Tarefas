import { createServer } from "node:net";

function escuta(porta, host) {
  return new Promise((resolver) => {
    const s = createServer();
    s.once("error", () => resolver(false));
    s.once("listening", () => s.close(() => resolver(true)));
    s.listen(porta, host);
  });
}

/** Livre de verdade: nem em 127.0.0.1 nem ocupada por outro programa em todas as interfaces. */
export async function portaLivre(porta) {
  return (await escuta(porta, "127.0.0.1")) && (await escuta(porta, "0.0.0.0"));
}

/** Primeira porta livre a partir da preferida (até `tentativas` adiante), pulando as já reservadas. */
export async function acharPorta(preferida, reservadas = [], tentativas = 50) {
  for (let p = preferida; p < preferida + tentativas; p++) {
    if (!reservadas.includes(p) && (await portaLivre(p))) return p;
  }
  throw new Error(`Nenhuma porta livre entre ${preferida} e ${preferida + tentativas - 1}.`);
}
