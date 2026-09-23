// Estado do quadro Kanban
//
// O quadro é escrito pela sua cena e lido pelas cenas de evento. A
// chave do registry e as operações vivem aqui e não em uma cena.

import {ITENS_INICIAIS} from "./quadro.js";

export const CHAVE_DO_ESTADO = "itensDoQuadro";

export function lerItensDoQuadro(registry) {
    const salvos = registry.get(CHAVE_DO_ESTADO);
    if (salvos) {
        return salvos;
    }

    const copia = ITENS_INICIAIS.map(function(item) {
        return Object.assign({}, item);
    });
    registry.set(CHAVE_DO_ESTADO, copia);
    return copia;
}

export function salvarItensDoQuadro(registry, itens) {
    registry.set(CHAVE_DO_ESTADO, itens);
}

// Usado pelo Planning, que enche a coluna A FAZER, e pela Review, que devolve
// ao quadro o que a escola pediu
export function acrescentarItem(registry, item, coluna) {
    const itens = lerItensDoQuadro(registry);
    const jaExiste = itens.some(function(existente) {
        return existente.id === item.id;
    });

    if (jaExiste) {
        return itens;
    }

    itens.push(Object.assign({}, item, {coluna: coluna}));
    salvarItensDoQuadro(registry, itens);
    return itens;
}

export function itensDaColuna(registry, coluna) {
    return lerItensDoQuadro(registry).filter(function(item) {
        return item.coluna === coluna;
    });
}
