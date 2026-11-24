// Itens do menu. "termo" é o texto enviado para /api/produto/busca/{termo},
// então ele precisa aparecer no nome, descrição ou keywords dos produtos.
export interface Categoria {
  rotulo: string;
  termo: string;
}

export const CATEGORIAS: Categoria[] = [
  { rotulo: 'Violões', termo: 'violão' },
  { rotulo: 'Guitarras', termo: 'guitarra' },
  { rotulo: 'Baixos', termo: 'baixo' },
  { rotulo: 'Teclados', termo: 'teclado' },
  { rotulo: 'Baterias', termo: 'bateria' },
  { rotulo: 'Sopros', termo: 'sopro' },
  { rotulo: 'Acessórios', termo: 'acessório' },
];
