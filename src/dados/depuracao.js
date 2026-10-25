// Opções de depuração

import {COR, FONTE} from "./tema.js";

export const CAMINHO_DA_CONFIGURACAO = "/depuracao.json";

export const OPCOES_DE_DEPURACAO = {
    npcsDeTeste: "personagens da escola parados no escritório, fora da cena deles",
    expressoesEmCiclo: "retrato troca de expressão a cada fala, para conferir as três",
    eventosLivres: "agenda abre qualquer reunião, em qualquer ordem",
    trocaDeCadeiraLivre: "P troca de cadeira a qualquer momento, sem terminar a sprint",
    atalhoDeSintese: "F encerra a sprint na hora e abre a síntese"
};

function semNada() {
    const opcoes = {ativa: false};

    Object.keys(OPCOES_DE_DEPURACAO).forEach(function (chave) {
        opcoes[chave] = false;
    });

    return opcoes;
}

export const DEPURACAO = semNada();

export function aplicarDepuracao(configuracao) {
    const dados = configuracao || {};
    let alguma = false;

    Object.keys(OPCOES_DE_DEPURACAO).forEach(function (chave) {
        DEPURACAO[chave] = dados[chave] === true;
        alguma = alguma || DEPURACAO[chave];
    });

    DEPURACAO.ativa = alguma;

    return DEPURACAO;
}

export async function carregarDepuracao() {
    try {
        const resposta = await fetch(CAMINHO_DA_CONFIGURACAO, {cache: "no-store"});

        if (!resposta.ok) {
            return aplicarDepuracao(null);
        }

        return aplicarDepuracao(await resposta.json());
    } catch (erro) {
        return aplicarDepuracao(null);
    }
}

export function opcoesLigadas() {
    return Object.keys(OPCOES_DE_DEPURACAO).filter(function (chave) {
        return DEPURACAO[chave];
    });
}

export function marcarDepuracao(cena, x, y) {
    if (!DEPURACAO.ativa) {
        return null;
    }

    return cena.add.text(x, y, "DEPURAÇÃO", {
        fontFamily: FONTE,
        fontSize: "10px",
        color: COR.alerta
    }).setOrigin(1, 0).setDepth(9500).setScrollFactor(0);
}
