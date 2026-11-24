// Atividade da API: 10 produtos (POST), 2 clientes (POST), alterar 1 cliente (PUT) e consultar produtos (GET).
//
// Uso:  node docs/atividade-api.mjs                          (API em http://localhost:8081/api)
//       node docs/atividade-api.mjs http://outro-host/api    (outra API)
//
// Endpoints conforme EndPointsAPIProduto.pdf e EndPointsAPICliente.pdf.
// Pode rodar de novo: produtos com o mesmo nome e clientes com o mesmo e-mail não são duplicados.

const base = (process.argv[2] ?? "http://localhost:8081/api").replace(/\/$/, "");

// ---------------- dados ----------------
// O PDF mostra "descricao" e "valor"; o frontend usa "nome", "descritivo" etc.
// Mandamos os dois nomes (a API ignora o que não conhece).
const produtos = [
  ["Cavaquinho Estudante", "Cavaquinho de 4 cordas com afinação de estudo. Ótimo para samba e pagode.", 420, 0, 14, 0, "cavaquinho cordas samba pagode"],
  ["Violão Eletroacústico Cutaway", "Violão de cordas de aço com captação e afinador embutidos. Pronto para o palco.", 1890, 1690, 9, 1, "violão eletroacústico cordas aço afinador"],
  ["Guitarra Telecaster Azul", "Dois captadores single coil e braço em maple. Timbre brilhante para country, blues e rock.", 3190, 2790, 5, 1, "guitarra elétrica telecaster"],
  ["Contrabaixo 5 Cordas Ativo", "Baixo ativo de cinco cordas, com graves profundos e escala em pau-ferro.", 3690, 0, 4, 0, "baixo 5 cordas elétrico ativo"],
  ["Teclado Sintetizador 49 Teclas", "Sintetizador com centenas de timbres e saída USB. Compacto e leve.", 1750, 1550, 8, 1, "teclado sintetizador 49 teclas"],
  ["Pandeiro 10 Polegadas", "Pele de nylon e aro de madeira, com platinelas de latão. Som limpo e firme.", 180, 0, 25, 0, "percussão pandeiro samba"],
  ["Trompete Bb Laqueado", "Trompete em Si bemol, laqueado dourado, com estojo e bocal. Ideal para banda escolar.", 2490, 0, 3, 0, "sopro trompete metais"],
  ["Clarinete Bb Preto", "Clarinete de resina com chaves niqueladas e estojo. Afinação estável para estudo.", 1650, 1450, 6, 0, "sopro clarinete madeira"],
  ["Afinador Digital Clip", "Afinador de pressão para violão, guitarra, baixo e ukulele. Tela colorida e bateria inclusa.", 79, 0, 50, 0, "acessório afinador clip"],
  ["Kit de Palhetas 12 Unidades", "Doze palhetas de espessuras variadas para violão e guitarra, em estojo.", 29, 0, 80, 0, "acessório palheta guitarra violão"],
].map(([nome, descritivo, valor, promo, quantidade, destaque, keywords]) => ({
  nome,
  descricao: nome,
  descritivo,
  valor,
  valorPromo: promo,
  promo,
  quantidade,
  destaque,
  keywords,
}));

const clientes = [
  { nome: "Ana Beatriz Souza", email: "ana.souza@exemplo.com", senha: "Senha@123", documento: "52998224725", telefone: "11987654321", logradouro: "Rua das Flores, 100, Centro, São Paulo - SP" },
  { nome: "Carlos Eduardo Lima", email: "carlos.lima@exemplo.com", senha: "Senha@456", documento: "11144477735", telefone: "11976543210", logradouro: "Av. Brasil, 2500, Jardim América, São Bernardo do Campo - SP" },
];

// ---------------- auxiliares ----------------
async function chamar(metodo, caminho, corpo) {
  try {
    const r = await fetch(base + caminho, {
      method: metodo,
      headers: corpo ? { "Content-Type": "application/json" } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    const texto = await r.text();
    let json;
    try { json = JSON.parse(texto); } catch { /* a API também responde texto puro */ }
    return { ok: r.ok, status: r.status, texto: texto.trim(), json };
  } catch (e) {
    console.error(`\nNão consegui falar com a API em ${base}.\nO backend está rodando? (${e.cause?.code ?? e.message})`);
    process.exit(1);
  }
}

// "Produto gravado com sucesso! 7" -> 7
const idDaResposta = (texto) => Number(/(\d+)\s*$/.exec(texto)?.[1] ?? 0);
const nome = (p) => String(p?.nome ?? p?.descricao ?? "").trim().toLowerCase();
const dinheiro = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
let falhas = 0;
const falhou = (passo, r) => { falhas++; console.error(`  ✗ ${passo} (HTTP ${r.status}): ${r.texto.slice(0, 200)}`); };

// ---------------- 1) POST de 10 produtos ----------------
console.log("\n1) POST /produto — inserindo 10 produtos");
const antes = await chamar("GET", "/produtos");
const existentes = new Set((Array.isArray(antes.json) ? antes.json : []).map(nome));
const codigos = [];
for (const p of produtos) {
  if (existentes.has(nome(p))) { console.log(`  = já existe: ${p.nome}`); continue; }
  const r = await chamar("POST", "/produto", p);
  if (!r.ok) { falhou(`POST produto "${p.nome}"`, r); continue; }
  codigos.push(idDaResposta(r.texto));
  console.log(`  + ${r.texto}  (${p.nome})`);
}

// ---------------- 2) POST de 2 clientes ----------------
console.log("\n2) POST /cliente — inserindo 2 clientes");
const codigosCliente = [];
for (const c of clientes) {
  const r = await chamar("POST", "/cliente", c);
  let codigo = r.ok ? idDaResposta(r.texto) : 0;
  if (!r.ok) {
    // provavelmente já existe: o login devolve o código
    const l = await chamar("POST", "/cliente/login", { email: c.email, senha: c.senha });
    codigo = Number(l.json?.codigo ?? 0);
    if (codigo > 0) console.log(`  = já existe: ${c.nome} (código ${codigo})`);
    else falhou(`POST cliente "${c.nome}"`, r);
  } else {
    console.log(`  + ${r.texto}  (${c.nome})`);
  }
  codigosCliente.push(codigo);
}

// ---------------- 3) PUT em um cliente ----------------
console.log("\n3) PUT /cliente — alterando os dados do primeiro cliente");
if (codigosCliente[0] > 0) {
  const alterado = {
    ...clientes[0],
    codigo: codigosCliente[0],
    nome: "Ana Beatriz Souza Lima",
    telefone: "11911112222",
    logradouro: "Rua dos Músicos, 45, Vila Mariana, São Paulo - SP",
  };
  const r = await chamar("PUT", "/cliente", alterado);
  if (!r.ok || /não encontrado/i.test(r.texto)) falhou("PUT cliente", r);
  else console.log(`  ✓ ${r.texto}`);

  const conferir = await chamar("GET", `/cliente/${codigosCliente[0]}`);
  console.log(`  GET /cliente/${codigosCliente[0]} depois do PUT:`, conferir.texto);
} else {
  falhas++;
  console.error("  ✗ sem código de cliente para alterar");
}

// ---------------- 4) GET dos produtos ----------------
console.log("\n4) GET — consultando os produtos");
const todos = await chamar("GET", "/produtos");
const lista = Array.isArray(todos.json) ? todos.json : [];
console.log(`  GET /produtos -> ${lista.length} produto(s):`);
for (const p of lista) {
  console.log(`    ${String(p.codigo).padStart(3)}  ${(p.nome ?? p.descricao ?? "").padEnd(34)} ${dinheiro(p.valor ?? 0)}`);
}

if (codigos[0] > 0) {
  const um = await chamar("GET", `/produto/${codigos[0]}`);
  console.log(`\n  GET /produto/${codigos[0]} ->`, um.texto.slice(0, 160));
}
const vitrine = await chamar("GET", "/produto/vitrine");
console.log(`\n  GET /produto/vitrine -> ${Array.isArray(vitrine.json) ? vitrine.json.length : "?"} produto(s) em destaque`);
const busca = await chamar("GET", `/produto/busca/${encodeURIComponent("violão")}`);
console.log(`  GET /produto/busca/violão -> ${Array.isArray(busca.json) ? busca.json.length : "?"} resultado(s)`);

console.log(falhas === 0 ? "\nConcluído sem erros." : `\nConcluído com ${falhas} erro(s). Veja as linhas com ✗ acima.`);
process.exit(falhas === 0 ? 0 : 1);
