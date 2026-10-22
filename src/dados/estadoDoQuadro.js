// Estado do quadro Kanban
//
// O quadro é escrito pela sua cena e lido pelas cenas de evento. Cada cadeira
// tem o seu, guardado na sprint dela: é salvo no navegador com o progresso e
// volta ao estado inicial quando a sprint fecha.

import {ITEM_DO_JOGADOR, PRODUTO_BACKLOG} from "./eventos.js";
import {COLUNAS, ETIQUETA_DE_BLOQUEIO} from "./quadro.js";
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
        acrescentarItem(registry, cadeira, cartaoPlanejado(cadeira, item), "afazer");
    });
}

function cartaoPlanejado(cadeira, item) {
    const doJogador = ITEM_DO_JOGADOR[cadeira] === item.id;
    return {
        id: item.id,
        tipo: item.tipo,
        titulo: item.titulo,
        etiquetas: doJogador ? [ETIQUETA_DO_JOGADOR] : [],
        planejado: true,
        doJogador: doJogador
    };
}

// ---------------------------------------------------------
// efeito das decisões
//
// Uma opção pode declarar, no campo "quadro", o que muda no quadro quando é
// escolhida. Cada efeito é um destes:
//   {entra: cartão, coluna}   cartão novo
//   {planeja: id}             item do Product Backlog entra em A FAZER
//   {cartao: id, mostraBloqueio} o quadro passa a dizer que está parado
//   {cartao: id, desbloqueia} o cartão volta a andar
//   {cartao: id, avanca}      o cartão anda uma coluna, se couber
//   {coluna: id, avancam: n}  até n cartões do time saem da coluna
// Devolve a mudança, {antes, depois, texto}, ou null se nada mudou

export function aplicarNoQuadro(registry, cadeira, efeitos) {
    if (!efeitos || efeitos.length === 0) {
        return null;
    }

    const itens = lerItensDoQuadro(registry, cadeira);
    const antes = JSON.parse(JSON.stringify(itens));
    const dia = diaDaSprint(registry, cadeira);

    efeitos.forEach(function (efeito) {
        aplicarEfeito(itens, efeito, cadeira, dia);
    });

    if (JSON.stringify(itens) === JSON.stringify(antes)) {
        return null;
    }
    salvarItensDoQuadro(registry, cadeira, itens);
    return {antes: antes, depois: itens, texto: descreverMudanca(antes, itens)};
}

// Uma frase por cartão que mudou
export function descreverMudanca(antes, depois) {
    return depois.map(function (item) {
        const anterior = buscar(antes, item.id);
        const coluna = tituloDaColuna(item.coluna);

        if (!anterior) {
            return item.titulo + " entra em " + coluna;
        }
        if (anterior.coluna !== item.coluna) {
            return item.titulo + (anterior.bloqueado && !item.bloqueado ? " destrava e vai para " : " vai para ") + coluna;
        }
        if (item.etiquetas.indexOf(ETIQUETA_DE_BLOQUEIO) > anterior.etiquetas.indexOf(ETIQUETA_DE_BLOQUEIO)) {
            return item.titulo + " fica marcado " + ETIQUETA_DE_BLOQUEIO;
        }
        if (anterior.bloqueado && !item.bloqueado) {
            return item.titulo + " volta a andar";
        }
        return null;
    }).filter(Boolean).join("; ") + ".";
}

function tituloDaColuna(id) {
    return COLUNAS.find(function (coluna) {
        return coluna.id === id;
    }).titulo;
}

function aplicarEfeito(itens, efeito, cadeira, dia) {
    if (efeito.entra) {
        if (!buscar(itens, efeito.entra.id)) {
            itens.push(Object.assign({etiquetas: []}, efeito.entra, {coluna: efeito.coluna}));
        }
        return;
    }

    if (efeito.planeja) {
        const doBacklog = PRODUTO_BACKLOG.find(function (item) {
            return item.id === efeito.planeja;
        });
        if (doBacklog && !buscar(itens, doBacklog.id)) {
            itens.push(Object.assign(cartaoPlanejado(cadeira, doBacklog), {coluna: "afazer"}));
        }
        return;
    }

    if (efeito.avancam) {
        itens.filter(function (item) {
            return item.coluna === efeito.coluna && doTime(item);
        }).slice(0, efeito.avancam).forEach(function (item) {
            avancar(itens, item, dia);
        });
        return;
    }

    const item = buscar(itens, efeito.cartao);
    if (!item) {
        return;
    }
    if (efeito.mostraBloqueio && item.bloqueado && item.etiquetas.indexOf(ETIQUETA_DE_BLOQUEIO) < 0) {
        item.etiquetas.push(ETIQUETA_DE_BLOQUEIO);
    }
    if (efeito.desbloqueia) {
        item.bloqueado = false;
        item.etiquetas = item.etiquetas.filter(function (etiqueta) {
            return etiqueta !== ETIQUETA_DE_BLOQUEIO;
        });
    }
    if (efeito.avanca) {
        avancar(itens, item, dia);
    }
}

function buscar(itens, id) {
    return itens.find(function (item) {
        return item.id === id;
    });
}

function avancar(itens, item, dia) {
    const posicao = COLUNAS.findIndex(function (coluna) {
        return coluna.id === item.coluna;
    });
    const destino = COLUNAS[posicao + 1];

    if (destino && cabeNaColuna(itens, destino, 0)) {
        item.coluna = destino.id;
        item.diaDoUltimoPasso = dia;
    }
}

// ---------------------------------------------------------
// trabalho do time
//
// A cada dia da sprint, cada cartão anda no máximo uma coluna, respeitando
// os limites. O time termina antes de começar: as colunas da direita andam
// primeiro e liberam espaço. Dentro da coluna, o Sprint Backlog vem antes.
// Não andam sozinhos o que está concluído, o que está bloqueado, o que ficou
// para a próxima sprint e o cartão do jogador, que anda pela mão dele; o time deixa uma vaga para ele na coluna
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

function doTime(item) {
    return !item.sprintAnterior && !item.bloqueado && !item.foraDaSprint && !item.doJogador;
}

function andaSozinho(item, dia) {
    return doTime(item) && item.diaDoUltimoPasso !== dia;
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
