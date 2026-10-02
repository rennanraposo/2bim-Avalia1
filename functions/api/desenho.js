// functions/api/desenho.js
// POST /api/desenho — verifica método (405), corpo (400) e token (401).

import { gerarDesenho, numeroValido } from "../../lib/desenho.js";

function erro(status, texto) {
  return new Response(texto, {
    status: status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

async function emailDoToken(token, clientId) {
  const url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(token);

  const resposta = await fetch(url);
  if (resposta.status !== 200) return null;

  const dados = await resposta.json();
  if (dados.aud !== clientId) return null;
  if (dados.email_verified !== "true") return null;
  return dados.email;
}

export async function onRequest(context) {
  const request = context.request;
  const env = context.env;

  // 1) Método
  if (request.method !== "POST") {
    return erro(405, "Método não permitido. Use POST.");
  }

    // 2) Corpo
  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return erro(400, "Corpo ausente ou JSON inválido.");
  }

  if (corpo === null || typeof corpo !== "object" || !numeroValido(corpo.numero)) {
    return erro(400, "O número deve ser um inteiro entre 1 e 100.");
  }

    // 3) Token
  const cabecalho = request.headers.get("Authorization") || "";
  if (!cabecalho.startsWith("Bearer ")) {
    return erro(401, "Token ausente. Faça login com o Google.");
  }
  const token = cabecalho.slice(7);

  const email = await emailDoToken(token, env.GOOGLE_CLIENT_ID);
  if (!email) {
    return erro(401, "Token inválido ou expirado.");
  }

  // Tudo certo: o e-mail vem do token verificado, nunca do formulário.
  const svg = gerarDesenho(corpo.numero, email);
  return new Response(svg, {
    status: 200,
    headers: { "Content-Type": "image/svg+xml" },
  });
}