// Dados do quadro Kanban

export const COLUNAS = [
    {id: "afazer", titulo: "A FAZER"},
    {id: "progresso", titulo: "EM PROGRESSO", limite: 3},
    {id: "revisao", titulo: "REVISÃO", limite: 2},
    {id: "concluido", titulo: "CONCLUÍDO"}
];

function posicaoDaColuna(id) {
    return COLUNAS.findIndex(function (coluna) {
        return coluna.id === id;
    });
}

// O cartão anda uma coluna por vez, para a frente. Só a revisão volta para
// em progresso, como retrabalho; o que está concluído não sai.
// Devolve o motivo da recusa, ou null se o movimento vale
export function motivoParaRecusar(item, destino) {
    const de = posicaoDaColuna(item.coluna);
    const para = posicaoDaColuna(destino);

    if (de === para || para === de + 1 && !item.sprintAnterior) {
        return null;
    }
    if (item.sprintAnterior || item.coluna === "concluido") {
        return "o que está em CONCLUÍDO não sai de lá";
    }
    if (item.coluna === "revisao" && destino === "progresso") {
        return null;
    }
    if (para > de) {
        return "um passo por vez: de " + COLUNAS[de].titulo + " o cartão vai para " + COLUNAS[de + 1].titulo;
    }
    if (item.coluna === "revisao") {
        return "da REVISÃO, o cartão só volta para EM PROGRESSO";
    }
    return "o cartão não volta: só a REVISÃO volta, para EM PROGRESSO";
}

export const ETIQUETA_DE_BLOQUEIO = "BLOQUEADO";

// Quanto o time trabalha por dia em EM PROGRESSO, e quanto cabe num cartão só
export const RITMO_DO_TIME = {pontosPorDia: 2, pontosPorCartao: 1};

// Pontos de um cartão; o que veio sem esforço conta como 1
export function esforcoDe(item) {
    return item.esforco || 1;
}

// Itens com sprintAnterior já estavam prontos antes desta sprint e ficam no
// quadro como histórico. Nenhum item daqui entra na Review: não são trabalho
// desta sprint.
export const ITENS_INICIAIS = [
    {
        id: "it02",
        tipo: "feature",
        titulo: "Listar turmas do professor",
        etiquetas: ["API"],
        coluna: "afazer",
        esforco: 2
    },
    {
        id: "it04",
        tipo: "spike",
        titulo: "Formato do arquivo do censo",
        etiquetas: [],
        coluna: "afazer",
        esforco: 1
    },
    {
        id: "it05",
        tipo: "feature",
        titulo: "Marcar presença da turma",
        etiquetas: ["UI"],
        coluna: "progresso",
        esforco: 2,
        feito: 1
    },
    {
        id: "it06",
        tipo: "feature",
        titulo: "Salvar chamada no servidor",
        etiquetas: ["API"],
        coluna: "progresso",
        esforco: 2,
        feito: 1
    },
    {
        id: "it07",
        tipo: "chore",
        titulo: "Máscara de data no diário",
        etiquetas: [],
        coluna: "progresso",
        esforco: 1,
        feito: 0
    },
    {
        id: "it08",
        tipo: "feature",
        titulo: "Relatório de frequência do mês",
        etiquetas: ["API"],
        coluna: "progresso",
        esforco: 3,
        feito: 1
    },
    {
        id: "it09",
        tipo: "bug",
        titulo: "Presença some ao trocar de turma",
        etiquetas: ["URGENTE"],
        coluna: "revisao",
        esforco: 1,
        feito: 1
    },
    {
        id: "it10",
        tipo: "feature",
        titulo: "Cadastro de turmas",
        etiquetas: ["SPRINT ANTERIOR"],
        coluna: "concluido",
        esforco: 3,
        sprintAnterior: true
    },
    {
        id: "it11",
        tipo: "chore",
        titulo: "Padronizar mensagens de erro",
        etiquetas: ["SPRINT ANTERIOR"],
        coluna: "concluido",
        esforco: 1,
        sprintAnterior: true
    }
];
