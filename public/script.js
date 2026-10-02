// script.js
// A página não desenha mais: envia número + token ao servidor e mostra o SVG.

const formulario = document.getElementById("formulario");
const campoNumero = document.getElementById("numero");
const area = document.getElementById("desenho");
const mensagem = document.getElementById("mensagem");
const botaoBaixar = document.getElementById("baixar");
const usuario = document.getElementById("usuario");

let token = "";    // id_token que o Google entrega após o login
let svgAtual = ""; // último SVG recebido, para o botão de baixar

// O Google chama esta função quando o login termina (data-callback="aoEntrar").
function aoEntrar(resposta) {
  token = resposta.credential;

  // Mostra o e-mail na tela. É só visual: quem decide é o servidor.
  const conteudo = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const dados = JSON.parse(atob(conteudo));
  usuario.textContent = "Conectado como " + dados.email;
  mensagem.textContent = "";
}

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  mensagem.textContent = "";

  const numero = Number(campoNumero.value);

  const resposta = await fetch("/api/desenho", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify({ numero: numero }),
  });

  if (resposta.status === 400) {
    mensagem.textContent = "Erro 400: digite um número inteiro entre 1 e 100.";
    return;
  }
  if (resposta.status === 401) {
    mensagem.textContent = "Erro 401: faça login com sua conta Google (ou entre de novo se o login expirou).";
    return;
  }
  if (!resposta.ok) {
    mensagem.textContent = "Erro " + resposta.status + " ao gerar o desenho.";
    return;
  }

  svgAtual = await resposta.text();
  area.innerHTML = svgAtual;
  botaoBaixar.hidden = false;
});

botaoBaixar.addEventListener("click", () => {
  const arquivo = new Blob([svgAtual], { type: "image/svg+xml" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exemplo.svg";
  link.click();
  URL.revokeObjectURL(url);
});