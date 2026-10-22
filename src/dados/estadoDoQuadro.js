// Estado do quadro Kanban
//
// O quadro é escrito pela sua cena e lido pelas cenas de evento. Cada cadeira
// tem o seu, guardado na sprint dela: é salvo no navegador com o progresso e
// volta ao estado inicial quando a sprint fecha.

import {ITEM_DO_JOGADOR} from "./eventos.js";
import {COLUNAS} from "./quadro.js";
import {diaDaSprint, diaDoTime, marcarDiaDoTime, quadroDaCadeira, salvarQuadroDaCadeira} from "./progresso.js";

export const ETIQUETA_DO_JOGADOR = "SEU";

// Quem lê o quadro já o encontra com o trabalho do time em dia
export function lerItensDoQuadro(registry, cadeira) {
    avancarOTime(registry, cadeira);
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

// Itens do Product Backlog que entram no Sprint Backlog, em A FAZER. A marca
// de planejado é o que a Review procura para a conquista
export function planejarItens(registry, cadeira, itens) {
    itens.forEach(function (item) {
        const doJogador = ITEM_DO_JOGADOR[cadeira] === item.id;
        acrescentarItem(registry, cadeira, {
            id: item.id,
            tipo: item.tipo,
            titulo: item.titulo,
            etiquetas: doJogador ? [ETIQUETA_DO_JOGADOR] : [],
            planejado: true,
            doJogador: doJogador
        }, "afazer");
    });
}

// ---------------------------------------------------------
// trabalho do time
//
// A cada dia da sprint, cada cartão anda no máximo uma coluna, respeitando
// os limites. O time termina antes de começar: as colunas da direita andam
// primeiro e liberam espaço. Dentro da coluna, o Sprint Backlog vem antes.
// Não andam sozinhos o que está concluído, o que está bloqueado e o cartão do
// jogador, que anda pela mão dele; o time deixa uma vaga para ele na coluna
// seguinte, para o limite não travar só o jogador.

export function avancarOTime(registry, cadeira) {
    const hoje = diaDaSprint(registry, cadeira);
    const ultimo = diaDoTime(registry, cadeira);

    if (ultimo === null) {
        marcarDiaDoTime(registry, cadeira, hoje);
        return;
    }
    if (ultimo >= hoje) {
        return;
    }

    const itens = quadroDaCadeira(registry, cadeira);
    for (let dia = ultimo + 1; dia <= hoje; dia++) {
        umDiaDeTrabalho(itens, dia);
    }
    salvarQuadroDaCadeira(registry, cadeira, itens);
    marcarDiaDoTime(registry, cadeira, hoje);
}

function andaSozinho(item, dia) {
    return !item.sprintAnterior && !item.bloqueado && !item.doJogador && item.diaDoUltimoPasso !== dia;
}

function cabeNaColuna(itens, coluna, reserva) {
    if (!coluna.limite) {
        return true;
    }
    return itens.filter(function (item) {
        return item.coluna === coluna.id;
    }).length < coluna.limite - reserva;
}

function umDiaDeTrabalho(itens, dia) {
    for (let posicao = COLUNAS.length - 2; posicao >= 0; posicao--) {
        const origem = COLUNAS[posicao].id;
        const destino = COLUNAS[posicao + 1];
        const daColuna = itens.filter(function (item) {
            return item.coluna === origem && andaSozinho(item, dia);
        }).sort(function (a, b) {
            return Number(Boolean(b.planejado)) - Number(Boolean(a.planejado));
        });

        const reserva = itens.some(function (item) {
            return item.doJogador && item.coluna === origem;
        }) ? 1 : 0;

        daColuna.forEach(function (item) {
            if (cabeNaColuna(itens, destino, reserva)) {
                item.coluna = destino.id;
                item.diaDoUltimoPasso = dia;
            }
        });
    }
}

export function itensDaColuna(registry, cadeira, coluna) {
    return lerItensDoQuadro(registry, cadeira).filter(function (item) {
        return item.coluna === coluna;
    });
}
