// Roda antes de qualquer outra rota do site.
// Garante que o endereço antigo /desenho.js não sirva mais o código do desenho.
export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname === "/desenho.js") {
    return new Response("Não encontrado.", { status: 404 });
  }

  return context.next(); // qualquer outro endereço segue normalmente
}
