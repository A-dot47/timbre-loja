// Backend de mentirinha para desenvolver o frontend sem o Spring Boot.
// Imita os endpoints dos PDFs (produto, cliente) e o pedido do frontend13.
// Sem dependências: só Node. Os dados ficam em backend-simulado/dados.json.
//   Rodar:   npm run api        (ou: node backend-simulado/servidor.mjs)
//   Zerar:   apague o arquivo dados.json e rode de novo.
// ATENÇÃO: é só para desenvolvimento. Senhas ficam em texto puro aqui.
import http from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

const PORTA = Number(process.env.PORT ?? 8081);
const ARQUIVO = new URL('./dados.json', import.meta.url);
const CATALOGO = new URL('../docs/catalogo-exemplo.json', import.meta.url);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

let db;
const salvar = () => writeFile(ARQUIVO, JSON.stringify(db, null, 2));
const norm = (s) => String(s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const publico = ({ senha, ...resto }) => resto;

function novoProduto(p) {
  const promo = p.valorPromo ?? p.promo ?? 0; // guarda os dois nomes: valorPromo e promo
  return { ...p, codigo: ++db.seq.produto, valorPromo: promo, promo };
}

async function carregar() {
  if (existsSync(ARQUIVO)) {
    db = JSON.parse(await readFile(ARQUIVO, 'utf8'));
    return;
  }
  db = { seq: { produto: 0, cliente: 0, pedido: 0, item: 0 }, produtos: [], clientes: [], pedidos: [] };
  for (const p of JSON.parse(await readFile(CATALOGO, 'utf8'))) db.produtos.push(novoProduto(p));
  await salvar();
  console.log(`Catálogo de exemplo carregado: ${db.produtos.length} produtos.`);
}

const texto = (res, msg, status = 200) => {
  res.writeHead(status, { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(msg);
};
const json = (res, obj, status = 200) => {
  res.writeHead(status, { ...CORS, 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
};

// [método, caminho, função(params, corpo, res)]
const rotas = [
  // ---------- produto ----------
  ['GET', /^\/api\/produto\/vitrine$/, (_, __, res) => json(res, db.produtos.filter((p) => Number(p.destaque) === 1))],
  ['GET', /^\/api\/produto\/busca\/(.+)$/, ([termo], _, res) => {
    const t = norm(decodeURIComponent(termo));
    json(res, db.produtos.filter((p) => norm(`${p.nome} ${p.descritivo} ${p.keywords}`).includes(t)));
  }],
  ['GET', /^\/api\/produtos$/, (_, __, res) => json(res, db.produtos)],
  ['GET', /^\/api\/produto\/(\d+)$/, ([id], _, res) => json(res, db.produtos.find((p) => p.codigo == id) ?? {})],
  ['POST', /^\/api\/produto$/, async (_, corpo, res) => {
    const p = novoProduto(corpo);
    db.produtos.push(p);
    await salvar();
    texto(res, `Produto gravado com sucesso! ${p.codigo}`);
  }],
  ['PUT', /^\/api\/produto$/, async (_, corpo, res) => {
    const i = db.produtos.findIndex((p) => p.codigo == corpo.codigo);
    if (i < 0) return texto(res, 'produto não encontrado!');
    db.produtos[i] = { ...db.produtos[i], ...corpo };
    await salvar();
    texto(res, `Produto alterado com sucesso! ${corpo.codigo}`);
  }],
  ['DELETE', /^\/api\/produto\/(\d+)$/, async ([id], _, res) => {
    db.produtos = db.produtos.filter((p) => p.codigo != id);
    await salvar();
    texto(res, 'Produto removido com sucesso!');
  }],

  // ---------- cliente ----------
  ['POST', /^\/api\/cliente\/login$/, ([], corpo, res) => {
    const c = db.clientes.find((c) => norm(c.email) === norm(corpo.email) && c.senha === corpo.senha);
    json(res, c ? publico(c) : {});
  }],
  ['GET', /^\/api\/cliente\/(\d+)$/, ([id], _, res) => {
    const c = db.clientes.find((c) => c.codigo == id);
    json(res, c ? publico(c) : {});
  }],
  ['POST', /^\/api\/cliente$/, async (_, corpo, res) => {
    if (db.clientes.some((c) => norm(c.email) === norm(corpo.email))) return texto(res, 'E-mail já cadastrado!', 409);
    const c = { ...corpo, codigo: ++db.seq.cliente };
    db.clientes.push(c);
    await salvar();
    texto(res, `Cliente gravado com sucesso! ${c.codigo}`);
  }],
  ['PUT', /^\/api\/cliente$/, async (_, corpo, res) => {
    const i = db.clientes.findIndex((c) => c.codigo == corpo.codigo);
    if (i < 0) return texto(res, 'Cliente não encontrado!');
    db.clientes[i] = { ...db.clientes[i], ...corpo };
    await salvar();
    texto(res, `Cliente alterado com sucesso! ${corpo.codigo}`);
  }],
  ['DELETE', /^\/api\/cliente\/(\d+)$/, async ([id], _, res) => {
    db.clientes = db.clientes.filter((c) => c.codigo != id);
    await salvar();
    texto(res, 'Cliente removido com sucesso!');
  }],
  ['PATCH', /^\/api\/cliente\/resetarSenha$/, async ([], corpo, res) => {
    const c = db.clientes.find((c) => norm(c.email) === norm(corpo.email));
    if (c) { c.senha = 'Senha1234'; await salvar(); } // igual ao PDF: senha fixa, sem envio de e-mail
    texto(res, 'Sua senha foi reiniciada, verifique o seu email!');
  }],
  ['PATCH', /^\/api\/cliente\/alterarSenha$/, async ([], corpo, res) => {
    const c = db.clientes.find((c) => norm(c.email) === norm(corpo.email) && c.documento === corpo.documento);
    if (!c) return texto(res, 'Cliente não encontrado!');
    c.senha = corpo.senha;
    await salvar();
    texto(res, 'Sua senha foi alterada, verifique o seu email!');
  }],

  // ---------- pedido ----------
  ['GET', /^\/api\/pedido\/cliente\/(\d+)$/, ([id], _, res) => json(res, db.pedidos.filter((p) => p.codigoCliente == id))],
  ['GET', /^\/api\/pedido\/(\d+)$/, ([id], _, res) => json(res, db.pedidos.find((p) => p.codigoPedido == id) ?? {})],
  ['POST', /^\/api\/pedido$/, async (_, corpo, res) => {
    const pedido = {
      ...corpo,
      codigoPedido: ++db.seq.pedido,
      dataPedido: new Date().toISOString(),
      itens: (corpo.itens ?? []).map((i) => ({ ...i, codigoItemPedido: ++db.seq.item })),
    };
    db.pedidos.push(pedido);
    await salvar();
    texto(res, `Pedido gravado com sucesso! ${pedido.codigoPedido}`);
  }],
  ['PUT', /^\/api\/pedido$/, async (_, corpo, res) => {
    const i = db.pedidos.findIndex((p) => p.codigoPedido == corpo.codigoPedido);
    if (i < 0) return texto(res, 'Pedido não encontrado!');
    db.pedidos[i] = { ...db.pedidos[i], ...corpo };
    await salvar();
    texto(res, `Pedido alterado com sucesso! ${corpo.codigoPedido}`);
  }],
  ['DELETE', /^\/api\/pedido\/(\d+)$/, async ([id], _, res) => {
    db.pedidos = db.pedidos.filter((p) => p.codigoPedido != id);
    await salvar();
    texto(res, 'Pedido removido com sucesso!');
  }],
];

await carregar();

http
  .createServer((req, res) => {
    const caminho = new URL(req.url, 'http://x').pathname;
    let bruto = '';
    req.on('data', (parte) => (bruto += parte));
    req.on('end', async () => {
      try {
        if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
        for (const [metodo, padrao, funcao] of rotas) {
          const m = req.method === metodo && padrao.exec(caminho);
          if (!m) continue;
          let corpo = {};
          if (bruto) {
            try { corpo = JSON.parse(bruto); } catch { return texto(res, 'JSON inválido', 400); }
          }
          await funcao(m.slice(1), corpo, res);
          console.log(`${req.method} ${caminho} -> ${res.statusCode}`);
          return;
        }
        console.log(`${req.method} ${caminho} -> 404`);
        json(res, { erro: 'rota não encontrada' }, 404);
      } catch (e) {
        console.error(e);
        texto(res, 'erro interno', 500);
      }
    });
  })
  .listen(PORTA, () => console.log(`API de teste em http://localhost:${PORTA}/api  (Ctrl+C para parar)`));
