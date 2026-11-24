

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORTA = 8081;
const PREFIXO = '/api';
const ARQUIVO = path.join(__dirname, 'banco.json');

const produtosIniciais = [
  { codigo: 1, nome: 'Violão Folk Aço Natural', descritivo: 'Violão folk com tampo de abeto e cordas de aço.', quantidade: 8, valor: 1290, promo: 0, destaque: 1, keywords: 'violao violoes folk aco acustico' },
  { codigo: 2, nome: 'Violão Clássico Cordas de Nylon', descritivo: 'Violão clássico ideal para iniciantes, cordas de nylon.', quantidade: 10, valor: 890, promo: 0, destaque: 1, keywords: 'violao violoes classico nylon' },
  { codigo: 3, nome: 'Guitarra Stratocaster Sunburst', descritivo: 'Guitarra elétrica modelo strato, 3 captadores single.', quantidade: 5, valor: 2490, promo: 2190, destaque: 1, keywords: 'guitarra guitarras eletrica strato' },
  { codigo: 4, nome: 'Guitarra Les Paul Preta', descritivo: 'Guitarra modelo Les Paul com captadores humbucker.', quantidade: 4, valor: 3190, promo: 0, destaque: 0, keywords: 'guitarra guitarras eletrica les paul' },
  { codigo: 5, nome: 'Baixo Jazz Bass 4 Cordas', descritivo: 'Contrabaixo elétrico de 4 cordas, timbre versátil.', quantidade: 6, valor: 2790, promo: 0, destaque: 1, keywords: 'baixo baixos contrabaixo jazz bass' },
  { codigo: 6, nome: 'Baixo Precision 5 Cordas', descritivo: 'Contrabaixo de 5 cordas com som encorpado.', quantidade: 3, valor: 3390, promo: 2990, destaque: 0, keywords: 'baixo baixos contrabaixo precision' },
  { codigo: 7, nome: 'Teclado Arranjador 61 Teclas', descritivo: 'Teclado com ritmos e timbres para estudo e shows.', quantidade: 7, valor: 1890, promo: 0, destaque: 1, keywords: 'teclado teclados arranjador' },
  { codigo: 8, nome: 'Piano Digital 88 Teclas', descritivo: 'Piano digital com teclas pesadas e pedal sustain.', quantidade: 2, valor: 4590, promo: 4190, destaque: 1, keywords: 'teclado teclados piano digital' },
  { codigo: 9, nome: 'Jogo de Cordas Nylon', descritivo: 'Jogo de cordas de nylon para violão clássico.', quantidade: 50, valor: 49, promo: 0, destaque: 0, keywords: 'cordas acessorios nylon violao' },
  { codigo: 10, nome: 'Afinador Digital Clip', descritivo: 'Afinador cromático de clipe para qualquer instrumento.', quantidade: 30, valor: 79, promo: 59, destaque: 0, keywords: 'afinador acessorios' },
];

const dadosIniciais = { produtos: produtosIniciais, clientes: [], pedidos: [] };

function lerDados() {
  if (!fs.existsSync(ARQUIVO)) salvarDados(dadosIniciais);
  return JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
}

function salvarDados(dados) {
  fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2), 'utf8');
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(res, status, corpo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...CORS });
  res.end(JSON.stringify(corpo));
}

function texto(res, status, mensagem) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', ...CORS });
  res.end(mensagem);
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let t = '';
    req.on('data', (p) => (t += p));
    req.on('end', () => {
      if (!t) return resolve({});
      try { resolve(JSON.parse(t)); } catch { reject(new Error('JSON inválido')); }
    });
  });
}

const semAcento = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const proximoCodigo = (lista, campo) => lista.reduce((m, i) => Math.max(m, Number(i[campo]) || 0), 0) + 1;
const hash = (senha) => crypto.createHash('sha256').update(String(senha)).digest('hex');
const semSenha = (c) => ({ ...c, senha: '' });

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`${req.method} ${url.pathname}`);

  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  if (!url.pathname.startsWith(PREFIXO)) return json(res, 404, { erro: 'Use o prefixo /api' });

  const p = url.pathname.slice(PREFIXO.length).split('/').filter(Boolean).map(decodeURIComponent);
  const m = req.method;

  try {
    const dados = lerDados();

    // ===================== PRODUTOS =====================
    if (m === 'GET' && p[0] === 'produtos' && p.length === 1) {
      return json(res, 200, dados.produtos);
    }

    if (p[0] === 'produto') {
      if (m === 'GET' && p[1] === 'vitrine') {
        return json(res, 200, dados.produtos.filter((x) => x.destaque > 0));
      }

      if (m === 'GET' && p[1] === 'busca') {
        const termo = semAcento(p.slice(2).join('/'));
        const achados = dados.produtos.filter((x) =>
          [x.nome, x.descritivo, x.keywords].some((campo) => semAcento(campo).includes(termo))
        );
        return json(res, 200, achados);
      }

      if (m === 'GET' && p[1]) {
        const prod = dados.produtos.find((x) => x.codigo === Number(p[1]));
        return prod ? json(res, 200, prod) : json(res, 404, {});
      }

      if (m === 'POST' && !p[1]) {
        const corpo = await lerCorpo(req);
        if (!corpo.nome) return texto(res, 400, 'Informe o nome do produto');
        const existente = dados.produtos.find((x) => x.codigo === Number(corpo.codigo));
        if (existente) {
          Object.assign(existente, corpo, { codigo: existente.codigo });
          salvarDados(dados);
          return texto(res, 200, 'Produto alterado com sucesso');
        }
        const novo = { ...corpo, codigo: proximoCodigo(dados.produtos, 'codigo') };
        dados.produtos.push(novo);
        salvarDados(dados);
        return texto(res, 201, 'Produto gravado com sucesso');
      }
    }

    // ===================== CLIENTES =====================
    if (p[0] === 'cliente') {
      if (m === 'POST' && p[1] === 'login') {
        const { email, senha } = await lerCorpo(req);
        const cli = dados.clientes.find(
          (c) => semAcento(c.email) === semAcento(email) && c.senha === hash(senha)
        );
        return json(res, 200, cli ? semSenha(cli) : {});
      }

      if (m === 'PATCH' && p[1] === 'resetarSenha') {
        const { email } = await lerCorpo(req);
        const cli = dados.clientes.find((c) => semAcento(c.email) === semAcento(email));
        if (!cli) return texto(res, 404, 'E-mail não cadastrado');
        return texto(res, 200, 'Enviamos as instruções para ' + cli.email);
      }

      if (m === 'PATCH' && p[1] === 'alterarSenha') {
        const { email, documento, senha } = await lerCorpo(req);
        const cli = dados.clientes.find(
          (c) => semAcento(c.email) === semAcento(email) && String(c.documento) === String(documento)
        );
        if (!cli) return texto(res, 404, 'E-mail ou CPF não conferem');
        if (!senha) return texto(res, 400, 'Informe a nova senha');
        cli.senha = hash(senha);
        salvarDados(dados);
        return texto(res, 200, 'Senha alterada com sucesso');
      }

      if (m === 'GET' && p[1]) {
        const cli = dados.clientes.find((c) => c.codigo === Number(p[1]));
        return cli ? json(res, 200, semSenha(cli)) : json(res, 404, {});
      }

      if (m === 'POST' && !p[1]) {
        const corpo = await lerCorpo(req);
        if (!corpo.email || !corpo.senha) return texto(res, 400, 'Informe e-mail e senha');
        if (dados.clientes.some((c) => semAcento(c.email) === semAcento(corpo.email))) {
          return texto(res, 409, 'Este e-mail já está cadastrado');
        }
        const novo = { ...corpo, codigo: proximoCodigo(dados.clientes, 'codigo'), senha: hash(corpo.senha) };
        dados.clientes.push(novo);
        salvarDados(dados);
        return texto(res, 201, 'Cliente cadastrado com sucesso');
      }

      if (m === 'PUT' && !p[1]) {
        const corpo = await lerCorpo(req);
        const cli = dados.clientes.find((c) => c.codigo === Number(corpo.codigo));
        if (!cli) return texto(res, 404, 'Cliente não encontrado');
        const senha = corpo.senha ? hash(corpo.senha) : cli.senha;
        Object.assign(cli, corpo, { codigo: cli.codigo, senha });
        salvarDados(dados);
        return texto(res, 200, 'Cliente alterado com sucesso');
      }

      if (m === 'DELETE' && p[1]) {
        const antes = dados.clientes.length;
        dados.clientes = dados.clientes.filter((c) => c.codigo !== Number(p[1]));
        if (dados.clientes.length === antes) return texto(res, 404, 'Cliente não encontrado');
        salvarDados(dados);
        return texto(res, 200, 'Cliente removido com sucesso');
      }
    }

    // ===================== PEDIDOS =====================
    if (p[0] === 'pedido') {
      if (m === 'GET' && p[1] === 'cliente' && p[2]) {
        return json(res, 200, dados.pedidos.filter((x) => x.codigoCliente === Number(p[2])));
      }

      if (m === 'GET' && p[1]) {
        const ped = dados.pedidos.find((x) => x.codigoPedido === Number(p[1]));
        return ped ? json(res, 200, ped) : json(res, 404, {});
      }

      if (m === 'POST' && !p[1]) {
        const corpo = await lerCorpo(req);
        const itens = Array.isArray(corpo.itens) ? corpo.itens : [];
        if (itens.length === 0) return texto(res, 400, 'O pedido não tem itens');

        for (const it of itens) {
          const prod = dados.produtos.find((x) => x.codigo === Number(it.codigoProduto));
          if (!prod) return texto(res, 400, `Produto ${it.codigoProduto} não existe`);
          if (prod.quantidade < it.quantidade) return texto(res, 400, `Estoque insuficiente de ${prod.nome}`);
        }
        for (const it of itens) {
          dados.produtos.find((x) => x.codigo === Number(it.codigoProduto)).quantidade -= it.quantidade;
        }

        const codigoPedido = proximoCodigo(dados.pedidos, 'codigoPedido');
        let proxItem = dados.pedidos.reduce(
          (mx, pd) => Math.max(mx, ...pd.itens.map((i) => i.codigoItemPedido || 0)), 0
        );
        const pedido = {
          ...corpo,
          codigoPedido,
          dataPedido: corpo.dataPedido || new Date().toISOString(),
          valorTotal: corpo.valorTotal || itens.reduce((s, i) => s + i.valor * i.quantidade, 0),
          itens: itens.map((i) => ({ ...i, codigoItemPedido: ++proxItem })),
        };
        dados.pedidos.push(pedido);
        salvarDados(dados);
        return texto(res, 201, 'Pedido ' + codigoPedido + ' gravado com sucesso');
      }

      if (m === 'PUT' && !p[1]) {
        const corpo = await lerCorpo(req);
        const ped = dados.pedidos.find((x) => x.codigoPedido === Number(corpo.codigoPedido));
        if (!ped) return texto(res, 404, 'Pedido não encontrado');
        Object.assign(ped, corpo, { codigoPedido: ped.codigoPedido });
        salvarDados(dados);
        return texto(res, 200, 'Pedido alterado com sucesso');
      }
    }

    return json(res, 404, { erro: `Rota ${m} ${url.pathname} não existe` });
  } catch (erro) {
    return texto(res, 400, erro.message);
  }
});

servidor.listen(PORTA, () => {
  console.log(`API da Timbre rodando em http://localhost:${PORTA}${PREFIXO}`);
  console.log(`Teste: http://localhost:${PORTA}${PREFIXO}/produtos`);
});