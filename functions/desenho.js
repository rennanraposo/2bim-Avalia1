   // Garante que /desenho.js não exista mais no site publicado
   // (evita que uma cópia antiga em cache seja servida).
   export function onRequest() {
     return new Response("Não encontrado.", { status: 404 });
   }
