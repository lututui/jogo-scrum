// Estado do quadro Kanban
//
// O quadro é escrito pela sua cena e lido pelas cenas de evento. Cada cadeira
// tem o seu, guardado na sprint dela: é salvo no navegador com o progresso e
// volta ao estado inicial quando a sprint fecha.

import {ITEM_DO_JOGADOR, PRODUTO_BACKLOG} from "./eventos.js";
import {COLUNAS, ETIQUETA_DE_BLOQUEIO, RITMO_DO_TIME, esforcoDe, motivoParaRecusar} from "./quadro.js";
import {
    diaDaSprint,
    diaDoTime,
    marcarDiaDoTime,
    quadroDaCadeira,
    salvarQuadroDaCadeira,
    sprintsConcluidas
} from "./progresso.js";

export const ETIQUETA_DO_JOGADOR = "SEU";

// Quem lê o quadro já o encontra com o trabalho do time em dia
export function lerItensDoQuadro(registry, cadeira) {
    avancarOTime(registry, cadeira);
    return quadroDaCadeira(registry, cadeira);
}

export function salvarItensDoQuadro(registry, cadeira, itens) {
    salvarQuadroDaCadeira(registry, cadeira, itens);
}

// Todo cartão que entra no quadro leva o número da sprint em que entrou; o
// que já estava lá quando a sprint começou não leva
function sprintAtual(registry, cadeira) {
    return sprintsConcluidas(registry, cadeira) + 1;
}

// Trabalho desta sprint: o que entrou no quadro durante ela. É o que a Review
// pode mostrar
export function entrouNestaSprint(registry, cadeira, item) {
    return item.sprint === sprintAtual(registry, cadeira);
}

// O que ficou pronto do Sprint Backlog, e onde parou o que não ficou. É só
// informação: não entra no placar
export function entregaDaSprint(registry, cadeira) {
    const plano = lerItensDoQuadro(registry, cadeira).filter(function (item) {
        return item.planejado && entrouNestaSprint(registry, cadeira, item);
    });
    const faltaram = plano.filter(function (item) {
        return item.coluna !== "concluido";
    });

    return {
        total: plano.length,
        prontos: plano.length - faltaram.length,
        faltaram: faltaram.map(function (item) {
            return {id: item.id, titulo: item.titulo, coluna: item.coluna, parado: Boolean(item.bloqueado)};
        }),
        foraDaMeta: plano.filter(function (item) {
            return item.alinhado === false;
        }).map(function (item) {
            return item.titulo;
        })
    };
}

export function descreverEntrega(entrega) {
    if (entrega.total === 0) {
        return "O Sprint Backlog ficou vazio: não há item planejado para mostrar.";
    }

    let texto = entrega.prontos + " de " + entrega.total + " itens do Sprint Backlog prontos.";
    if (entrega.faltaram.length > 0) {
        texto += " Ficou de fora: " + entrega.faltaram.map(function (item) {
            return item.titulo + (item.parado ? ", parado em " : ", em ") + tituloDaColuna(item.coluna);
        }).join("; ") + ".";
    }

    // Pronto não quer dizer útil: o mentor diz o que não serve à meta
    const fora = entrega.foraDaMeta || [];
    if (fora.length === entrega.total) {
        texto += (entrega.prontos > 0 ? " Mas" : " E") + " nenhum item do plano serve à meta de presença da turma.";
    } else if (fora.length > 0) {
        texto += " Fora da meta de presença da turma: " + fora.join("; ") + ".";
    }
    return texto;
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

    itens.push(Object.assign({}, item, {coluna: coluna, sprint: sprintAtual(registry, cadeira)}));
    salvarItensDoQuadro(registry, cadeira, itens);
    return itens;
}

// Itens do Product Backlog que entram no Sprint Backlog, em A FAZER. A marca
// de planejado é o que a Review procura para a conquista. O time puxa os
// itens na ordem do Product Backlog, que é a do PO: a ordem em que foram
// marcados no Planning não conta, e o resultado depende da escolha, não do
// clique
export function planejarItens(registry, cadeira, itens) {
    const posicao = function (item) {
        const indice = PRODUTO_BACKLOG.findIndex(function (outro) {
            return outro.id === item.id;
        });
        return indice < 0 ? PRODUTO_BACKLOG.length : indice;
    };
    itens.slice().sort(function (a, b) {
        return posicao(a) - posicao(b);
    }).forEach(function (item) {
        acrescentarItem(registry, cadeira, cartaoPlanejado(cadeira, item), "afazer");
    });
}

function cartaoPlanejado(cadeira, item) {
    const doJogador = ITEM_DO_JOGADOR[cadeira] === item.id;
    return {
        id: item.id,
        tipo: item.tipo,
        titulo: item.titulo,
        esforco: item.esforco,
        etiquetas: doJogador ? [ETIQUETA_DO_JOGADOR] : [],
        planejado: true,
        alinhado: Boolean(item.alinhado),
        doJogador: doJogador,
        bloqueado: (item.bloqueadoEm || []).indexOf(cadeira) >= 0,
        travaNoFim: Boolean(item.travaNoFim)
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
//   {cartao: id, desbloqueiaNoDia: d} o cartão volta a andar no dia d
//   {cartao: id, avanca}      o cartão anda uma coluna, se couber
//   {cartao: id, aumenta: n}  o cartão custa n pontos a mais (retrabalho)
//   {noSprintBacklog, aumenta: n} o mesmo, no item do Sprint Backlog que
//                             o time está fazendo
//   {coluna: id, avancam: n}  até n cartões do time saem da coluna
//   {naRevisao, ...}          o mesmo que {cartao}, num cartão do time que
//                             está na REVISÃO (do Sprint Backlog, se houver)
//   {cartao: id, volta}       da REVISÃO o cartão volta para EM PROGRESSO
//   {cartao: id, continuaParado} nada muda, mas o quadro mostra que o cartão
//                             segue parado: é o custo de não destravar
// Devolve a mudança, {antes, depois, texto, parados}, ou null se não há o
// que mostrar

export function aplicarNoQuadro(registry, cadeira, efeitos) {
    if (!efeitos || efeitos.length === 0) {
        return null;
    }

    const itens = lerItensDoQuadro(registry, cadeira);
    const antes = JSON.parse(JSON.stringify(itens));
    const quando = {dia: diaDaSprint(registry, cadeira), sprint: sprintAtual(registry, cadeira)};

    efeitos.forEach(function (efeito) {
        aplicarEfeito(itens, efeito, cadeira, quando);
    });

    const parados = efeitos.filter(function (efeito) {
        const item = efeito.continuaParado && buscar(itens, efeito.cartao);
        return item && item.bloqueado;
    }).map(function (efeito) {
        return buscar(itens, efeito.cartao);
    });

    if (JSON.stringify(itens) === JSON.stringify(antes)) {
        return parados.length === 0 ? null : {
            antes: antes,
            depois: itens,
            parados: parados.map(function (item) {
                return item.id;
            }),
            texto: parados.map(function (item) {
                return item.titulo + " continua parado";
            }).join("; ") + "."
        };
    }
    salvarItensDoQuadro(registry, cadeira, itens);
    return {antes: antes, depois: itens, parados: [], texto: descreverMudanca(antes, itens)};
}

// Uma frase por cartão que mudou
export function descreverMudanca(antes, depois) {
    return depois.map(function (item) {
        const anterior = buscar(antes, item.id);
        const coluna = tituloDaColuna(item.coluna);

        if (!anterior) {
            return item.titulo + " entra em " + coluna;
        }
        if (anterior.coluna === "revisao" && item.coluna === "progresso") {
            return item.titulo + " volta para EM PROGRESSO, com " + esforcoDe(item) + " pt";
        }
        if (anterior.coluna !== item.coluna) {
            return item.titulo + (anterior.bloqueado && !item.bloqueado ? " destrava e vai para " : " vai para ") + coluna;
        }
        if (esforcoDe(item) > esforcoDe(anterior)) {
            return item.titulo + " passa de " + esforcoDe(anterior) + " para " + esforcoDe(item) + " pt";
        }
        if (item.desbloqueiaNoDia && !anterior.desbloqueiaNoDia) {
            return item.titulo + " só destrava no dia " + item.desbloqueiaNoDia;
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

function aplicarEfeito(itens, efeito, cadeira, quando) {
    const dia = quando.dia;

    if (efeito.entra) {
        if (!buscar(itens, efeito.entra.id)) {
            itens.push(Object.assign({}, efeito.entra, {
                etiquetas: (efeito.entra.etiquetas || []).slice(),
                coluna: efeito.coluna,
                sprint: quando.sprint
            }));
        }
        return;
    }

    if (efeito.planeja) {
        const doBacklog = PRODUTO_BACKLOG.find(function (item) {
            return item.id === efeito.planeja;
        });
        if (doBacklog && !buscar(itens, doBacklog.id)) {
            itens.push(Object.assign(cartaoPlanejado(cadeira, doBacklog), {coluna: "afazer", sprint: quando.sprint}));
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

    const item = efeito.noSprintBacklog ? itemDoTimeNoPlano(itens)
        : efeito.naRevisao ? cartaoDoTimeNaRevisao(itens)
        : buscar(itens, efeito.cartao);
    if (!item) {
        return;
    }
    if (efeito.aumenta && item.coluna !== "concluido") {
        item.esforco = esforcoDe(item) + efeito.aumenta;
    }
    if (efeito.desbloqueiaNoDia && item.bloqueado) {
        item.desbloqueiaNoDia = efeito.desbloqueiaNoDia;
    }
    if (efeito.mostraBloqueio && item.bloqueado && item.etiquetas.indexOf(ETIQUETA_DE_BLOQUEIO) < 0) {
        item.etiquetas.push(ETIQUETA_DE_BLOQUEIO);
    }
    if (efeito.desbloqueia) {
        item.bloqueado = false;
        item.travaNoFim = false;
        delete item.desbloqueiaNoDia;
        item.etiquetas = item.etiquetas.filter(function (etiqueta) {
            return etiqueta !== ETIQUETA_DE_BLOQUEIO;
        });
    }
    if (efeito.avanca) {
        avancar(itens, item, dia);
    }
    if (efeito.volta && item.coluna === "revisao") {
        item.coluna = "progresso";
        item.diaDoUltimoPasso = dia;
    }
}

// O item do Sprint Backlog que o time está fazendo; se ainda não começou
// nenhum, o próximo da fila
function itemDoTimeNoPlano(itens) {
    const doTime = itens.filter(function (item) {
        return item.planejado && !item.doJogador;
    });
    return doTime.find(function (item) {
        return item.coluna === "progresso";
    }) || doTime.find(function (item) {
        return item.coluna === "afazer";
    });
}

function cartaoDoTimeNaRevisao(itens) {
    const naRevisao = itens.filter(function (item) {
        return !item.doJogador && !item.sprintAnterior && item.coluna === "revisao";
    });
    return naRevisao.find(function (item) {
        return item.planejado;
    }) || naRevisao[0];
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
        if (item.coluna === "progresso") {
            item.feito = esforcoDe(item);
        }
        item.coluna = destino.id;
        item.diaDoUltimoPasso = dia;
    }
}

// ---------------------------------------------------------
// trabalho do time
//
// A cada dia o time trabalha RITMO_DO_TIME pontos nos cartões de EM
// PROGRESSO, e um cartão só vai para a REVISÃO quando o esforço dele foi
// todo feito. Depois cada cartão anda no máximo uma coluna, respeitando os
// limites; a REVISÃO leva um dia. O time termina antes de começar: as
// colunas da direita andam primeiro e liberam espaço. Em tudo, o Sprint
// Backlog vem antes.
// Não andam sozinhos o que está concluído, o que está bloqueado, o que ficou
// para a próxima sprint e o cartão do jogador, que anda pela mão dele; o time
// deixa uma vaga para ele na coluna seguinte, para o limite não travar só o
// jogador.

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

function terminado(item) {
    return (item.feito || 0) >= esforcoDe(item);
}

// O que passa na frente vem antes de tudo; depois, o Sprint Backlog
function planejadosPrimeiro(a, b) {
    return Number(Boolean(b.passaNaFrente)) - Number(Boolean(a.passaNaFrente))
        || Number(Boolean(b.planejado)) - Number(Boolean(a.planejado));
}

function trabalhar(itens) {
    let resta = RITMO_DO_TIME.pontosPorDia;

    itens.filter(function (item) {
        return item.coluna === "progresso" && doTime(item) && !terminado(item);
    }).sort(planejadosPrimeiro).forEach(function (item) {
        const pontos = Math.min(resta, RITMO_DO_TIME.pontosPorCartao, esforcoDe(item) - (item.feito || 0));
        item.feito = (item.feito || 0) + pontos;
        resta -= pontos;
    });
}

// O bloqueio com dia marcado acaba; quem trava no fim para quando termina a
// sua parte
function atualizarBloqueios(itens, dia) {
    itens.forEach(function (item) {
        if (item.bloqueado && item.desbloqueiaNoDia && item.desbloqueiaNoDia <= dia) {
            item.bloqueado = false;
            delete item.desbloqueiaNoDia;
        }
    });
}

function travarNoFim(itens) {
    itens.forEach(function (item) {
        if (item.travaNoFim && item.coluna === "progresso" && terminado(item)) {
            item.bloqueado = true;
        }
    });
}

// O jogador trabalha no próprio cartão enquanto ele está em EM PROGRESSO, no
// mesmo ritmo de uma pessoa do time
function trabalharNoDoJogador(itens) {
    itens.forEach(function (item) {
        if (item.doJogador && item.coluna === "progresso" && !item.bloqueado && !terminado(item)) {
            item.feito = (item.feito || 0) + RITMO_DO_TIME.pontosPorCartao;
        }
    });
}

function umDiaDeTrabalho(itens, dia) {
    atualizarBloqueios(itens, dia);
    trabalhar(itens);
    trabalharNoDoJogador(itens);
    travarNoFim(itens);

    for (let posicao = COLUNAS.length - 2; posicao >= 0; posicao--) {
        const origem = COLUNAS[posicao].id;
        const destino = COLUNAS[posicao + 1];
        const daColuna = itens.filter(function (item) {
            return item.coluna === origem && andaSozinho(item, dia)
                && (origem !== "progresso" || terminado(item));
        }).sort(planejadosPrimeiro);

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

// ---------------------------------------------------------
// cartão do jogador
//
// O jogador move o próprio cartão, uma coluna por dia, mas ele só sai de EM
// PROGRESSO quando o trabalho estiver feito.

export function motivoDoTrabalho(item, destino) {
    if (item.coluna !== "progresso" || destino !== "revisao") {
        return null;
    }
    if (item.bloqueado) {
        return "o seu cartão está parado; ele não sai de EM PROGRESSO assim";
    }
    if (!terminado(item)) {
        return "o seu cartão ainda tem trabalho: " + (item.feito || 0) + " de " + esforcoDe(item)
            + " pt feitos; você trabalha nele 1 pt por dia";
    }
    return null;
}

// Para onde o cartão do jogador pode ir hoje, ou null
export function proximoPassoDoJogador(registry, cadeira) {
    const itens = lerItensDoQuadro(registry, cadeira);
    const item = itens.find(function (outro) {
        return outro.doJogador;
    });
    if (!item || item.coluna === "concluido" || item.diaDoUltimoPasso === diaDaSprint(registry, cadeira)) {
        return null;
    }

    const posicao = COLUNAS.findIndex(function (coluna) {
        return coluna.id === item.coluna;
    });
    const destino = COLUNAS[posicao + 1];
    const recusa = motivoParaRecusar(item, destino.id) || motivoDoTrabalho(item, destino.id);

    return !recusa && cabeNaColuna(itens, destino, 0) ? destino.id : null;
}

export function itensDaColuna(registry, cadeira, coluna) {
    return lerItensDoQuadro(registry, cadeira).filter(function (item) {
        return item.coluna === coluna;
    });
}
