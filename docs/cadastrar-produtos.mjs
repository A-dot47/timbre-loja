// Envia o catálogo de exemplo para a API da loja.
// Uso:  node docs/cadastrar-produtos.mjs            (usa http://localhost:8081/api)
//       node docs/cadastrar-produtos.mjs http://outro-host:8081/api
// Pode rodar de novo sem medo: produtos que já existem (mesmo nome) são pulados.
import { readFile } from 'node:fs/promises';

const base = (process.argv[2] ?? 'http://localhost:8081/api').replace(/\/$/, '');
const catalogo = JSON.parse(await readFile(new URL('./catalogo-exemplo.json', import.meta.url), 'utf8'));

async function pedir(caminho, opcoes) {
  try {
    const r = await fetch(base + caminho, opcoes);
    return { ok: r.ok, status: r.status, texto: await r.text() };
  } catch (e) {
    console.error(`\nNão consegui falar com a API em ${base}.\nO backend está rodando? (${e.cause?.code ?? e.message})`);
    process.exit(1);
  }
}

const nomeDe = (p) => (p?.nome ?? p?.descricao ?? '').trim().toLowerCase();

// Quem já está cadastrado
const lista = await pedir('/produtos');
if (!lista.ok) {
  console.error(`GET /produtos respondeu ${lista.status}:\n${lista.texto}`);
  process.exit(1);
}
const existentes = new Set(JSON.parse(lista.texto || '[]').map(nomeDe));

let verificado = false;
for (const produto of catalogo) {
  if (existentes.has(nomeDe(produto))) {
    console.log(`= já existe: ${produto.nome}`);
    continue;
  }

  const r = await pedir('/produto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // manda o preço promocional com os dois nomes possíveis (valorPromo e promo)
    body: JSON.stringify({ ...produto, promo: produto.valorPromo }),
  });

  if (!r.ok) {
    console.error(`\n✗ A API recusou "${produto.nome}" (HTTP ${r.status}):\n${r.texto}`);
    console.error('\nCole essa mensagem no chat que eu ajusto os campos.');
    process.exit(1);
  }
  console.log(`+ ${r.texto.trim()}  (${produto.nome})`);

  // No primeiro cadastro, confere se a API guardou os campos da loja de verdade.
  if (!verificado) {
    verificado = true;
    const id = /(\d+)\s*$/.exec(r.texto)?.[1];
    if (id) {
      const lido = await pedir(`/produto/${id}`);
      const salvo = lido.ok ? JSON.parse(lido.texto || '{}') : {};
      const promoSalva = Number(salvo.valorPromo ?? salvo.promo ?? 0);
      if (salvo.nome && produto.valorPromo > 0 && promoSalva !== produto.valorPromo) {
        console.error(`\n! O produto foi gravado, mas sem o preço promocional. Campos devolvidos: ${Object.keys(salvo).join(', ')}`);
        console.error('Cole isso no chat que eu ajusto o nome do campo antes de enviar o resto.');
        process.exit(1);
      }
      if (!salvo.nome) {
        console.error(`\n! A API gravou, mas o produto voltou sem "nome". Campos devolvidos: ${Object.keys(salvo).join(', ') || '(nenhum)'}`);
        console.error('Cole isso no chat que eu ajusto o catálogo antes de enviar o resto.');
        process.exit(1);
      }
    }
  }
}

// Resumo: código de cada produto = nome da foto em public/
const final = await pedir('/produtos');
const todos = JSON.parse(final.texto || '[]');
const doCatalogo = new Set(catalogo.map(nomeDe));
console.log('\nFotos: salve cada imagem em public/{codigo}.jpg\n');
for (const p of todos.filter((p) => doCatalogo.has(nomeDe(p)))) {
  console.log(`  public/${p.codigo}.jpg  ←  ${p.nome ?? p.descricao}`);
}
