// Progresso do jogador
//
// Cada cadeira tem a sua sprint em andamento, com pontos, os três medidores,
// decisões, eventos vividos, marcas e conquistas próprios. Fora delas fica o
// que atravessa as cadeiras: quantas sprints cada uma já fechou e as
// conquistas obtidas no jogo inteiro.
//
// Quando a síntese fecha a sprint de uma cadeira, o retrato dela é entregue
// para exibição e a cadeira volta ao começo, pronta para ser jogada de novo.
//
// O estado vive no registry durante a partida e é gravado no navegador a cada
// mudança, sem servidor nem cadastro. O perfil do jogador (dados/perfil.js)
// também mora aqui, para que Nova partida o apague junto.

import {proximoCompromisso} from "./calendario.js";
import {ORDEM_DAS_CADEIRAS} from "./cadeiras.js";
import {CONQUISTAS} from "./conquistas.js";
import {ITENS_INICIAIS} from "./quadro.js";

export const CHAVE_DO_PROGRESSO = "progresso";
const CHAVE_NO_NAVEGADOR = "jogo-scrum:progresso";

// Muda quando o formato salvo muda; salvamento de outra versão é descartado
const VERSAO_DO_PROGRESSO = 2;

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

export const DIAS_DA_SPRINT = 10;

const MEDIDOR_INICIAL = 50;
const MEDIDOR_MINIMO = 0;
const MEDIDOR_MAXIMO = 100;

function sprintVazia() {
    return {
        pontos: 0,
        medidores: {valor: MEDIDOR_INICIAL, confianca: MEDIDOR_INICIAL, saude: MEDIDOR_INICIAL},
        decisoes: {boa: 0, media: 0, ruim: 0},
        decisoesSozinho: 0,
        eventosConcluidos: [],
        contextuaisResolvidos: [],
        acoesResolvidas: [],
        marcas: {},
        conquistas: [],
        paraRevisar: {},
        quadro: quadroInicial(),
        movimentosNoQuadro: 0,
        diaDaVisitaAoQuadro: null,
        diaDoTime: 1,
        entrega: null,
        recebido: false
    };
}

// Cada sprint começa com uma cópia do quadro inicial
function quadroInicial() {
    return ITENS_INICIAIS.map(function (item) {
        return Object.assign({}, item, {etiquetas: item.etiquetas.slice()});
    });
}

function porCadeira(criar) {
    const resultado = {};

    ORDEM_DAS_CADEIRAS.forEach(function (cadeira) {
        resultado[cadeira] = criar();
    });

    return resultado;
}

function progressoVazio() {
    return {
        versao: VERSAO_DO_PROGRESSO,
        sprints: porCadeira(sprintVazia),
        sprintsConcluidas: porCadeira(function () {
            return 0;
        }),
        conquistas: [],
        guiaVisto: false,
        dicasVistas: [],
        perfil: null
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
        const salvo = texto ? JSON.parse(texto) : null;

        if (!salvo || salvo.versao !== VERSAO_DO_PROGRESSO) {
            return null;
        }

        return salvo;
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

// O guia abre sozinho até ser visto uma vez; apagar o progresso o traz de
// volta, para o próximo jogador da mesma máquina
export function guiaJaVisto(registry) {
    return Boolean(lerProgresso(registry).guiaVisto);
}

export function marcarGuiaVisto(registry) {
    const progresso = lerProgresso(registry);
    progresso.guiaVisto = true;

    return salvarProgresso(registry, progresso);
}

// Dicas de primeira vez (dados/dicas.js), uma vez por partida
export function dicaVista(registry, id) {
    return (lerProgresso(registry).dicasVistas || []).indexOf(id) >= 0;
}

export function registrarDica(registry, id) {
    const progresso = lerProgresso(registry);
    progresso.dicasVistas = (progresso.dicasVistas || []).concat([id]);

    return salvarProgresso(registry, progresso);
}

// Sprint em andamento na cadeira
function sprintDaCadeira(registry, cadeira) {
    return lerProgresso(registry).sprints[cadeira];
}

// A reunião ou o evento contextual que vem agora; null com a sprint encerrada
export function compromissoDaVez(registry, cadeira) {
    const sprint = sprintDaCadeira(registry, cadeira);
    return proximoCompromisso(cadeira, sprint.eventosConcluidos, sprint.contextuaisResolvidos);
}

// Hoje é o dia do próximo compromisso; com a sprint encerrada, o último dia
export function diaDaSprint(registry, cadeira) {
    const proximo = compromissoDaVez(registry, cadeira);
    return proximo ? proximo.dia : DIAS_DA_SPRINT;
}

// ---------------------------------------------------------
// quadro

// Salvamentos anteriores ao quadro por cadeira não têm o campo
export function quadroDaCadeira(registry, cadeira) {
    const progresso = lerProgresso(registry);
    const sprint = progresso.sprints[cadeira];

    if (!sprint.quadro) {
        sprint.quadro = quadroInicial();
        salvarProgresso(registry, progresso);
    }

    return sprint.quadro;
}

export function salvarQuadroDaCadeira(registry, cadeira, itens) {
    const progresso = lerProgresso(registry);
    progresso.sprints[cadeira].quadro = itens;

    return salvarProgresso(registry, progresso);
}

// Último dia em que o time já trabalhou no quadro; save sem o campo devolve null
export function diaDoTime(registry, cadeira) {
    const dia = sprintDaCadeira(registry, cadeira).diaDoTime;
    return typeof dia === "number" ? dia : null;
}

export function marcarDiaDoTime(registry, cadeira, dia) {
    const progresso = lerProgresso(registry);
    progresso.sprints[cadeira].diaDoTime = dia;

    return salvarProgresso(registry, progresso);
}

// Conta só a troca de coluna; reordenar dentro dela não é movimento
export function registrarMovimentoNoQuadro(registry, cadeira) {
    const progresso = lerProgresso(registry);
    const sprint = progresso.sprints[cadeira];
    sprint.movimentosNoQuadro = (sprint.movimentosNoQuadro || 0) + 1;

    return salvarProgresso(registry, progresso);
}

// O Sprint Backlog como estava quando a Review começou
export function registrarEntrega(registry, cadeira, entrega) {
    const progresso = lerProgresso(registry);
    progresso.sprints[cadeira].entrega = entrega;

    return salvarProgresso(registry, progresso);
}

export function entregaRegistrada(registry, cadeira) {
    return sprintDaCadeira(registry, cadeira).entrega || null;
}

// O mentor recebe o jogador uma vez por sprint, no dia 1
export function registrarBoasVindas(registry, cadeira) {
    const progresso = lerProgresso(registry);
    progresso.sprints[cadeira].recebido = true;

    return salvarProgresso(registry, progresso);
}

export function foiRecebido(registry, cadeira) {
    return Boolean(sprintDaCadeira(registry, cadeira).recebido);
}

// Quem já passou por outra cadeira conhece o time
export function conheceOTime(registry, cadeira) {
    const progresso = lerProgresso(registry);

    return cadeirasConcluidas(registry).length > 0 || Object.keys(progresso.sprints).some(function (outra) {
        return outra !== cadeira && progresso.sprints[outra].recebido;
    });
}

export function registrarVisitaAoQuadro(registry, cadeira) {
    const progresso = lerProgresso(registry);
    progresso.sprints[cadeira].diaDaVisitaAoQuadro = diaDaSprint(registry, cadeira);

    return salvarProgresso(registry, progresso);
}

export function viuOQuadroHoje(registry, cadeira) {
    return sprintDaCadeira(registry, cadeira).diaDaVisitaAoQuadro === diaDaSprint(registry, cadeira);
}

// ---------------------------------------------------------
// registro das decisões

function limitar(valor) {
    return Math.min(Math.max(valor, MEDIDOR_MINIMO), MEDIDOR_MAXIMO);
}

// Cada decisão soma pontos e move os medidores que ela toca, na sprint da
// cadeira em que foi tomada. Uma decisão sem avaliação declarada não pontua:
// o placar mede escolha, não clique
export function registrarDecisao(registry, decisao) {
    const progresso = lerProgresso(registry);
    const sprint = progresso.sprints[decisao.cadeira];
    const peso = PESO_DA_AVALIACAO[decisao.avaliacao];

    if (!sprint || !peso) {
        return progresso;
    }

    const multiplicador = decisao.semMentor ? 2 : 1;
    sprint.pontos += peso.pontos * multiplicador;
    sprint.decisoes[decisao.avaliacao] += 1;

    if (decisao.semMentor && decisao.avaliacao === "boa") {
        sprint.decisoesSozinho += 1;
    }

    const alvos = decisao.medidores || Object.keys(MEDIDORES);
    alvos.forEach(function (chave) {
        sprint.medidores[chave] = limitar(sprint.medidores[chave] + peso.medidores);
    });

    if (decisao.marca) {
        sprint.marcas[decisao.marca] = (sprint.marcas[decisao.marca] || 0) + 1;
    }

    // Conceito de decisão com custo ou contra o princípio, contado por termo
    if (decisao.conceito && decisao.avaliacao !== "boa") {
        sprint.paraRevisar = sprint.paraRevisar || {};
        sprint.paraRevisar[decisao.conceito] = (sprint.paraRevisar[decisao.conceito] || 0) + 1;
    }

    atualizarConquistas(progresso, decisao.cadeira, false);

    return salvarProgresso(registry, progresso);
}

export function medidoresDaCadeira(registry, cadeira) {
    return sprintDaCadeira(registry, cadeira).medidores;
}

// ---------------------------------------------------------
// progressão

export function registrarEventoConcluido(registry, cadeira, chaveDoEvento) {
    const progresso = lerProgresso(registry);
    const lista = progresso.sprints[cadeira].eventosConcluidos;

    if (lista.indexOf(chaveDoEvento) < 0) {
        lista.push(chaveDoEvento);
    }

    atualizarConquistas(progresso, cadeira, false);

    return salvarProgresso(registry, progresso);
}

export function eventosConcluidos(registry, cadeira) {
    return sprintDaCadeira(registry, cadeira).eventosConcluidos;
}

// Eventos contextuais já vividos naquela cadeira
export function contextuaisResolvidos(registry, cadeira) {
    return sprintDaCadeira(registry, cadeira).contextuaisResolvidos;
}

// Ações do escritório já tratadas; sprint salva antes delas não tem a lista
export function acoesResolvidas(registry, cadeira) {
    return sprintDaCadeira(registry, cadeira).acoesResolvidas || [];
}

export function registrarAcaoResolvida(registry, cadeira, id) {
    const progresso = lerProgresso(registry);
    const sprint = progresso.sprints[cadeira];
    sprint.acoesResolvidas = sprint.acoesResolvidas || [];

    if (sprint.acoesResolvidas.indexOf(id) < 0) {
        sprint.acoesResolvidas.push(id);
    }

    atualizarConquistas(progresso, cadeira, false);

    return salvarProgresso(registry, progresso);
}

export function registrarContextualResolvido(registry, cadeira, id) {
    const progresso = lerProgresso(registry);
    const lista = progresso.sprints[cadeira].contextuaisResolvidos;

    if (lista.indexOf(id) < 0) {
        lista.push(id);
    }

    atualizarConquistas(progresso, cadeira, false);

    return salvarProgresso(registry, progresso);
}

// Fecha a sprint da cadeira em uma única gravação: conta a sprint, avalia as
// conquistas de fim de sprint e devolve a cadeira ao começo. Gravar tudo de
// uma vez impede que recarregar a página na síntese conte a sprint de novo.
// Devolve o retrato da sprint que acabou, que é o que a síntese mostra
export function fecharSprint(registry, cadeira) {
    const progresso = lerProgresso(registry);
    const encerrada = progresso.sprints[cadeira];

    progresso.sprintsConcluidas[cadeira] += 1;
    atualizarConquistas(progresso, cadeira, true);
    guardarUltimaSprint(progresso, cadeira, encerrada);
    progresso.sprints[cadeira] = sprintVazia();
    salvarProgresso(registry, progresso);

    return encerrada;
}

// O resumo da última sprint fechada em cada cadeira, para a tela de fim
function guardarUltimaSprint(progresso, cadeira, encerrada) {
    progresso.ultimasSprints = progresso.ultimasSprints || {};
    progresso.ultimasSprints[cadeira] = {
        pontos: encerrada.pontos,
        decisoes: encerrada.decisoes,
        medidores: encerrada.medidores,
        entrega: encerrada.entrega || null
    };
}

export function ultimaSprint(registry, cadeira) {
    const ultimas = lerProgresso(registry).ultimasSprints || {};

    return ultimas[cadeira] || null;
}

// Há o que continuar quando alguma cadeira já fechou ou começou uma sprint
export function temProgresso(registry) {
    const progresso = lerProgresso(registry);

    return ORDEM_DAS_CADEIRAS.some(function (cadeira) {
        const sprint = progresso.sprints[cadeira];

        return progresso.sprintsConcluidas[cadeira] > 0
            || sprint.eventosConcluidos.length > 0
            || sprint.contextuaisResolvidos.length > 0;
    });
}

export function conquistasDoJogo(registry) {
    return lerProgresso(registry).conquistas;
}

export function cadeirasConcluidas(registry) {
    const progresso = lerProgresso(registry);

    return Object.keys(progresso.sprintsConcluidas).filter(function (cadeira) {
        return progresso.sprintsConcluidas[cadeira] > 0;
    });
}

export function sprintsConcluidas(registry, cadeira) {
    return lerProgresso(registry).sprintsConcluidas[cadeira];
}

// ---------------------------------------------------------
// conquistas

// A condição olha o estado da sprint inteira, então nenhuma conquista depende
// da ordem em que as coisas aconteceram. As marcadas como de fechamento só
// são avaliadas quando a sprint acaba. Cada sprint guarda as que mereceu,
// mesmo que já tenham sido obtidas antes; o jogo guarda a união de todas
function atualizarConquistas(progresso, cadeira, fechando) {
    const sprint = progresso.sprints[cadeira];

    CONQUISTAS.forEach(function (conquista) {
        if (conquista.noFechamento && !fechando) {
            return;
        }

        if (sprint.conquistas.indexOf(conquista.id) >= 0) {
            return;
        }

        if (!conquista.condicao(sprint, progresso, cadeira)) {
            return;
        }

        sprint.conquistas.push(conquista.id);

        if (progresso.conquistas.indexOf(conquista.id) < 0) {
            progresso.conquistas.push(conquista.id);
        }
    });

    return progresso;
}

export function conquistasPorId(ids) {
    return CONQUISTAS.filter(function (conquista) {
        return ids.indexOf(conquista.id) >= 0;
    });
}
