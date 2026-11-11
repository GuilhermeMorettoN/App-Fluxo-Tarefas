import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { criarApp } from "./app.js";

// .env local (fora do git): AGENT_RUNTIME, GITHUB_REPO e, se preciso, GITHUB_TOKEN.
const raizEnv = join(dirname(fileURLToPath(import.meta.url)), "..", "..", ".env");
if (existsSync(raizEnv)) process.loadEnvFile(raizEnv);

const porta = Number(process.env.API_PORT ?? process.env.PORT ?? 3001);
const banco = process.env.BANCO ?? join(dirname(fileURLToPath(import.meta.url)), "..", "dados", "app.sqlite");
const { servidor } = criarApp({ banco });
servidor.listen(porta, "127.0.0.1", () => console.log(`API em http://127.0.0.1:${porta}/api`));
