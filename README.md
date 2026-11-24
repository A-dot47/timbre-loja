# Timbre — loja de instrumentos musicais (Angular)

Frontend da loja do P1 (Angular), com tema de instrumentos musicais, usando a mesma API do curso.

## Como rodar

```bash
npm install
npm start          # http://localhost:4200
```

O backend precisa estar rodando em `http://localhost:8081`. Para mudar o endereço, edite `src/app/config.ts`.

### Sem o backend do professor? Use a API de teste

```bash
npm run api        # em um terminal: sobe a API de teste em http://localhost:8081
npm start          # em outro terminal: sobe a loja
```

A API de teste (`backend-simulado/servidor.mjs`) imita os endpoints de produto, cliente e pedido, sem precisar
de banco nem de dependências. Ela já carrega os 14 produtos do `docs/catalogo-exemplo.json` na primeira vez
(8 aparecem na vitrine) e guarda tudo em `backend-simulado/dados.json`. Para zerar, apague esse arquivo.
É só para desenvolvimento: as senhas ficam em texto puro e não existe validação de verdade.

## Fotos dos produtos

A foto de cada produto é `public/{codigo}.jpg` (ou `.png`, `.jpeg`, `.webp`; o `codigo` vem da API). A lista do que buscar para cada produto está em `docs/FOTOS.md`. Se a foto não existir, aparece um
espaço reservado com uma nota musical, então a loja funciona mesmo sem imagens.

## Catálogo de exemplo

`docs/catalogo-exemplo.json` tem 14 instrumentos e acessórios com os campos do modelo `Produto`
(`nome`, `descritivo`, `valor`, `valorPromo`, `quantidade`, `destaque`, `keywords`). Os produtos com
`destaque: 1` são os candidatos à vitrine. Para enviá-los pela API (com o backend rodando), use `node docs/cadastrar-produtos.mjs`. O script pula o que já existe e, no fim, mostra o código de cada produto, que é o nome da foto.
Os itens do menu (`src/app/categorias.ts`) buscam por: violão, guitarra, baixo, teclado, bateria, sopro e acessório.
Esses termos precisam aparecer no nome, na descrição ou nas keywords dos produtos.

## Telas (mockup do P1)

| Rota | Tela |
| --- | --- |
| `/` e `/vitrine` | Vitrine com produtos em destaque |
| `/promo` | Só produtos com preço promocional |
| `/detalhe` | Detalhe do produto clicado |
| `/resultado-busca?termo=...` | Resultado da busca (sem termo lista todos) |
| `/cesta` | Cesta: quantidade, remover, limpar e **finalizar compra** (grava o pedido) |
| `/login` | Login |
| `/cadastro` | Cadastro (logado vira "Meu cadastro" e usa PUT) |
| `/reenvio` | Esqueci minha senha |
| `/pedido` | Meus pedidos (lista do cliente logado) |

## Atividade da API (POST, PUT e GET)

`node docs/atividade-api.mjs` (com a API rodando) executa, em ordem:

1. `POST /api/produto` com 10 produtos
2. `POST /api/cliente` com 2 clientes
3. `PUT /api/cliente` alterando os dados do primeiro cliente
4. `GET /api/produtos`, `GET /api/produto/{codigo}`, `GET /api/produto/vitrine` e `GET /api/produto/busca/{termo}`

Para usar outra API: `node docs/atividade-api.mjs http://endereco-da-api/api`. Pode rodar de novo sem duplicar.

## Como o código está organizado

- `model/`: classes que espelham o JSON da API (`Produto`, `Cliente`, `Pedido`, `ItemPedido`). `Cesta` e `ItemCesta` guardam as contas da cesta (totais, promoção, estoque).
- `services/`: um service por entidade, com as chamadas `HttpClient`. Cada método devolve um `Observable`.
- Cada tela chama o service com `.subscribe({ next, error })`, como nos exemplos da disciplina.
- `localStorage`: `cesta` (objeto `Cesta`), `cliente` (quem está logado, sem a senha), `produto` (último produto aberto) e `termoBusca` (o que foi digitado na busca).
- O endereço de entrega vem do cadastro (`logradouro`) e vai no pedido, no campo `entrega`.
- Sem foto em `public/{codigo}.jpg`, aparece uma ilustração do tipo de instrumento.

## Pendências conhecidas

- Não consegui rodar o Angular onde montei o projeto: o código passou só em checagem de sintaxe. O primeiro `npm start` pode apontar algum ajuste.
- O formato do pedido (`valorTotal`, `entrega`, `itens`...) foi deduzido do frontend de exemplo (`frontend13`), não do backend real.
- `ClienteService.alterarSenha` existe, mas não tem tela.
