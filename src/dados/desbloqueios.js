// Desbloqueáveis
//
// Peças, óculos e acessório do editor que só valem depois de uma conquista
// do jogo. Bloqueado, o item aparece no editor com o cadeado fechado e pode
// ser provado na prévia, mas não confirmado; com a conquista, o cadeado
// abre. As conquistas são as de dados/conquistas.js, pelo id.

import {APARENCIA_PADRAO} from "./aparencia.js";
import {conquistasDoJogo} from "./progresso.js";

// campo da aparência -> valor -> conquista que o libera
export const DESBLOQUEIOS = {
    pecaDeCima: {
        meio_a_meio: "equilibrio",
        colete: "impedimento-removido",
        camiseta_alvo: "meta-acima-do-escopo",
        camiseta_visto: "pronto-quer-dizer-pronto",
        camiseta_post_it: "debito-na-luz-do-dia",
        camiseta_catavento: "tres-cadeiras"
    },
    oculos: {
        cristal: "recusa-transparente"
    },
    acessorio: {
        fone: "sozinho-na-sala"
    }
};

export const NOMES_DOS_DESBLOQUEAVEIS = {
    meio_a_meio: "Meio a meio",
    colete: "Colete de sinalização",
    camiseta_alvo: "Camiseta com alvo",
    camiseta_visto: "Camiseta com visto",
    camiseta_post_it: "Camiseta com post-it",
    camiseta_catavento: "Camiseta Catavento",
    cristal: "Óculos cristal",
    fone: "Fone de ouvido"
};

// a conquista que libera o valor, ou null se ele vale desde o começo
export function conquistaDoItem(campo, valor) {
    const doCampo = DESBLOQUEIOS[campo];

    if (!doCampo || valor === null || valor === undefined || !(valor in doCampo)) {
        return null;
    }
    return doCampo[valor];
}

export function itemDesbloqueavel(campo, valor) {
    return conquistaDoItem(campo, valor) !== null;
}

export function itemLiberado(registry, campo, valor) {
    const conquista = conquistaDoItem(campo, valor);

    return conquista === null || conquistasDoJogo(registry).indexOf(conquista) >= 0;
}

// o que a aparência usa e ainda está bloqueado, na ordem dos campos
export function itensBloqueados(registry, aparencia) {
    return Object.keys(DESBLOQUEIOS).filter(function (campo) {
        return !itemLiberado(registry, campo, aparencia[campo]);
    }).map(function (campo) {
        return {campo: campo, valor: aparencia[campo], conquista: conquistaDoItem(campo, aparencia[campo])};
    });
}

// a aparência com cada item bloqueado de volta ao padrão
export function semBloqueados(registry, aparencia) {
    const limpa = Object.assign({}, aparencia);

    itensBloqueados(registry, aparencia).forEach(function (item) {
        limpa[item.campo] = APARENCIA_PADRAO[item.campo];
    });
    return limpa;
}

// o que a conquista libera, com o nome de cada item
export function desbloqueiosDaConquista(id) {
    const itens = [];

    Object.keys(DESBLOQUEIOS).forEach(function (campo) {
        Object.keys(DESBLOQUEIOS[campo]).forEach(function (valor) {
            if (DESBLOQUEIOS[campo][valor] === id) {
                itens.push({campo: campo, valor: valor, nome: NOMES_DOS_DESBLOQUEAVEIS[valor]});
            }
        });
    });
    return itens;
}
