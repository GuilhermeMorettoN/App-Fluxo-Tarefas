import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { criarApp } from "./app.js";

const porta = Number(process.env.API_PORT ?? process.env.PORT ?? 3001);
const banco = process.env.BANCO ?? join(dirname(fileURLToPath(import.meta.url)), "..", "dados", "app.sqlite");
const { servidor } = criarApp({ banco });
servidor.listen(porta, "127.0.0.1", () => console.log(`API em http://127.0.0.1:${porta}/api`));
