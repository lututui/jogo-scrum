// Estado do quadro Kanban
//
// O quadro é escrito pela sua cena e lido pelas cenas de evento. Cada cadeira
// tem o seu, guardado na sprint dela: é salvo no navegador com o progresso e
// volta ao estado inicial quando a sprint fecha.

import {quadroDaCadeira, salvarQuadroDaCadeira} from "./progresso.js";

export function lerItensDoQuadro(registry, cadeira) {
    return quadroDaCadeira(registry, cadeira);
}

export function salvarItensDoQuadro(registry, cadeira, itens) {
    salvarQuadroDaCadeira(registry, cadeira, itens);
}

// Usado pelo Planning, que enche a coluna A FAZER, e pela Review, que devolve
// ao quadro o que a escola pediu
export function acrescentarItem(registry, cadeira, item, coluna) {
    const itens = lerItensDoQuadro(registry, cadeira);
    const jaExiste = itens.some(function (existente) {
        return existente.id === item.id;
    });

    if (jaExiste) {
        return itens;
    }

    itens.push(Object.assign({}, item, {coluna: coluna}));
    salvarItensDoQuadro(registry, cadeira, itens);
    return itens;
}

export function itensDaColuna(registry, cadeira, coluna) {
    return lerItensDoQuadro(registry, cadeira).filter(function (item) {
        return item.coluna === coluna;
    });
}
