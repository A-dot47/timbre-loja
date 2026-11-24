# Fotos dos produtos

Cada foto vai em `public/` com o **código do produto** como nome. Aceita `.jpg`, `.png`, `.jpeg` ou `.webp`
(não precisa converter). Sem foto, a loja mostra a ilustração do instrumento.

Os códigos abaixo valem para a API de teste (`npm run api`), na ordem em que os produtos são criados:
1 a 14 vêm do catálogo de exemplo e 15 a 24 do `atividade-api.mjs`. Em outra API os códigos podem mudar.
Para ver os códigos reais: abra `http://localhost:8081/api/produtos` no navegador.

Sugestão de busca (em inglês dá mais resultado em Unsplash e Pexels):

| Arquivo | Produto | Buscar por |
| --- | --- | --- |
| `1` | Violão Folk Cordas de Aço Natural | acoustic guitar |
| `2` | Violão Clássico Cordas de Nylon | classical guitar |
| `3` | Guitarra Stratocaster Sunburst | sunburst electric guitar |
| `4` | Guitarra Les Paul Preta | black electric guitar |
| `5` | Baixo Jazz Bass 4 Cordas | bass guitar |
| `6` | Teclado Arranjador 61 Teclas | electronic keyboard |
| `7` | Piano Digital 88 Teclas | digital piano |
| `8` | Bateria Acústica 5 Peças | drum kit |
| `9` | Cajón Acústico | cajon percussion |
| `10` | Ukulele Soprano | ukulele |
| `11` | Flauta Transversal Prateada | flute |
| `12` | Saxofone Alto Laqueado | alto saxophone |
| `13` | Encordoamento Violão Aço 0.11 | guitar strings |
| `14` | Cabo de Instrumento P10 5m | guitar cable |
| `15` | Cavaquinho Estudante | cavaquinho |
| `16` | Violão Eletroacústico Cutaway | electro acoustic guitar |
| `17` | Guitarra Telecaster Azul | blue telecaster guitar |
| `18` | Contrabaixo 5 Cordas Ativo | 5 string bass guitar |
| `19` | Teclado Sintetizador 49 Teclas | synthesizer keyboard |
| `20` | Pandeiro 10 Polegadas | tambourine |
| `21` | Trompete Bb Laqueado | trumpet |
| `22` | Clarinete Bb Preto | clarinet |
| `23` | Afinador Digital Clip | guitar tuner clip |
| `24` | Kit de Palhetas 12 Unidades | guitar picks |

## Dicas

- Fotos com o instrumento no centro e fundo limpo ficam melhores: o cartão corta a imagem em 4:3 e o detalhe em quadrado.
- Cerca de 800 a 1200 px de largura e até 300 KB cada é suficiente.
- Confira a licença de cada foto. Unsplash e Pexels são gratuitas, mas se for apresentar o trabalho, vale citar a fonte.
- Depois de colocar os arquivos, recarregue a loja com `Ctrl + Shift + R`. Não precisa reiniciar nada.
