// Progresso do jogador
//
// Guarda pontos, os três medidores, eventos concluídos por cadeira e
// conquistas obtidas.
//
// O estado vive no registry durante a partida e é gravado no navegador a cada
// mudança, sem servidor nem cadastro.

import {CONQUISTAS} from "./conquistas.js";

export const CHAVE_DO_PROGRESSO = "progresso";
const CHAVE_NO_NAVEGADOR = "jogo-scrum:progresso";

export const MEDIDORES = {
    valor: {nome: "Valor entregue"},
    confianca: {nome: "Confiança do cliente"},
    saude: {nome: "Saúde do time"}
};

// Quanto cada avaliação vale em pontos e quanto move os medidores
const PESO_DA_AVALIACAO = {
    boa: {pontos: 10, medidores: 8},
    media: {pontos: 4, medidores: -2},
    ruim: {pontos: 0, medidores: -8}
};

const MEDIDOR_INICIAL = 50;
const MEDIDOR_MINIMO = 0;
const MEDIDOR_MAXIMO = 100;

function progressoVazio() {
    return {
        pontos: 0,
        medidores: {valor: MEDIDOR_INICIAL, confianca: MEDIDOR_INICIAL, saude: MEDIDOR_INICIAL},
        decisoes: {boa: 0, media: 0, ruim: 0},
        decisoesSozinho: 0,
        eventosConcluidos: {po: [], sm: [], dev: []},
        contextuaisResolvidos: {po: [], sm: [], dev: []},
        sprintsConcluidas: {po: 0, sm: 0, dev: 0},
        conquistas: [],
        marcas: {}
    };
}

// ---------------------------------------------------------
// leitura e escrita

export function lerProgresso(registry) {
    const emMemoria = registry.get(CHAVE_DO_PROGRESSO);

    if (emMemoria) {
        return emMemoria;
    }

    const progresso = lerDoNavegador() || progressoVazio();
    registry.set(CHAVE_DO_PROGRESSO, progresso);

    return progresso;
}

export function salvarProgresso(registry, progresso) {
    registry.set(CHAVE_DO_PROGRESSO, progresso);
    gravarNoNavegador(progresso);

    return progresso;
}

// O armazenamento do navegador pode estar bloqueado; o jogo segue sem ele
function lerDoNavegador() {
    try {
        const texto = window.localStorage.getItem(CHAVE_NO_NAVEGADOR);

        return texto ? Object.assign(progressoVazio(), JSON.parse(texto)) : null;
    } catch (erro) {
        return null;
    }
}

function gravarNoNavegador(progresso) {
    try {
        window.localStorage.setItem(CHAVE_NO_NAVEGADOR, JSON.stringify(progresso));

        return true;
    } catch (erro) {
        return false;
    }
}

export function apagarProgresso(registry) {
    const limpo = progressoVazio();
    registry.set(CHAVE_DO_PROGRESSO, limpo);

    try {
        window.localStorage.removeItem(CHAVE_NO_NAVEGADOR);
    } catch (erro) {
        return limpo;
    }

    return limpo;
}

// ---------------------------------------------------------
// registro das decisões

function limitar(valor) {
    return Math.min(Math.max(valor, MEDIDOR_MINIMO), MEDIDOR_MAXIMO);
}

// Cada decisão soma pontos e move os medidores que ela toca. Uma decisão sem
// avaliação declarada não pontua: o placar mede escolha, não clique
export function registrarDecisao(registry, decisao) {
    const progresso = lerProgresso(registry);
    const peso = PESO_DA_AVALIACAO[decisao.avaliacao];

    if (!peso) {
        return progresso;
    }

    const multiplicador = decisao.semMentor ? 2 : 1;
    progresso.pontos += peso.pontos * multiplicador;
    progresso.decisoes[decisao.avaliacao] += 1;

    if (decisao.semMentor && decisao.avaliacao === "boa") {
        progresso.decisoesSozinho += 1;
    }

    const alvos = decisao.medidores || Object.keys(MEDIDORES);
    alvos.forEach(function (chave) {
        progresso.medidores[chave] = limitar(progresso.medidores[chave] + peso.medidores);
    });

    if (decisao.marca) {
        progresso.marcas[decisao.marca] = (progresso.marcas[decisao.marca] || 0) + 1;
    }

    return salvarProgresso(registry, atualizarConquistas(progresso));
}

// ---------------------------------------------------------
// progressão

export function registrarEventoConcluido(registry, cadeira, chaveDoEvento) {
    const progresso = lerProgresso(registry);
    const lista = progresso.eventosConcluidos[cadeira];

    if (lista.indexOf(chaveDoEvento) < 0) {
        lista.push(chaveDoEvento);
    }

    return salvarProgresso(registry, atualizarConquistas(progresso));
}

export function eventosConcluidos(registry, cadeira) {
    return lerProgresso(registry).eventosConcluidos[cadeira] || [];
}

// Eventos contextuais já vividos naquela cadeira
export function contextuaisResolvidos(registry, cadeira) {
    return lerProgresso(registry).contextuaisResolvidos[cadeira] || [];
}

export function registrarContextualResolvido(registry, cadeira, id) {
    const progresso = lerProgresso(registry);
    const lista = progresso.contextuaisResolvidos[cadeira];

    if (lista.indexOf(id) < 0) {
        lista.push(id);
    }

    return salvarProgresso(registry, atualizarConquistas(progresso));
}

export function registrarSprintConcluida(registry, cadeira) {
    const progresso = lerProgresso(registry);
    progresso.sprintsConcluidas[cadeira] += 1;

    return salvarProgresso(registry, atualizarConquistas(progresso));
}

export function cadeirasConcluidas(registry) {
    const progresso = lerProgresso(registry);

    return Object.keys(progresso.sprintsConcluidas).filter(function (cadeira) {
        return progresso.sprintsConcluidas[cadeira] > 0;
    });
}

// ---------------------------------------------------------
// conquistas

// As conquistas são recalculadas a cada mudança: a condição olha o estado
// inteiro, então nenhuma delas depende da ordem em que as coisas aconteceram
export function atualizarConquistas(progresso) {
    CONQUISTAS.forEach(function (conquista) {
        const jaTem = progresso.conquistas.indexOf(conquista.id) >= 0;

        if (!jaTem && conquista.condicao(progresso)) {
            progresso.conquistas.push(conquista.id);
        }
    });

    return progresso;
}

export function conquistasObtidas(progresso) {
    return CONQUISTAS.filter(function (conquista) {
        return progresso.conquistas.indexOf(conquista.id) >= 0;
    });
}
