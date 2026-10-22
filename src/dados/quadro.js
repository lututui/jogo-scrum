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

// Itens com sprintAnterior já estavam prontos antes desta sprint: ficam no
// quadro como histórico, mas não podem ser mostrados na Review
export const ITENS_INICIAIS = [
    {
        id: "it02",
        tipo: "feature",
        titulo: "Listar turmas do professor",
        etiquetas: ["API"],
        coluna: "afazer"
    },
    {
        id: "it04",
        tipo: "spike",
        titulo: "Formato do arquivo do censo",
        etiquetas: [],
        coluna: "afazer"
    },
    {
        id: "it05",
        tipo: "feature",
        titulo: "Marcar presença da turma",
        etiquetas: ["UI"],
        coluna: "progresso"
    },
    {
        id: "it06",
        tipo: "feature",
        titulo: "Salvar chamada no servidor",
        etiquetas: ["API"],
        coluna: "progresso"
    },
    {
        id: "it07",
        tipo: "chore",
        titulo: "Máscara de data no diário",
        etiquetas: [],
        coluna: "progresso"
    },
    {
        id: "it08",
        tipo: "feature",
        titulo: "Relatório de frequência do mês",
        etiquetas: ["API"],
        coluna: "progresso"
    },
    {
        id: "it09",
        tipo: "bug",
        titulo: "Presença some ao trocar de turma",
        etiquetas: ["URGENTE"],
        coluna: "revisao"
    },
    {
        id: "it10",
        tipo: "feature",
        titulo: "Cadastro de turmas",
        etiquetas: ["SPRINT ANTERIOR"],
        coluna: "concluido",
        sprintAnterior: true
    },
    {
        id: "it11",
        tipo: "chore",
        titulo: "Padronizar mensagens de erro",
        etiquetas: ["SPRINT ANTERIOR"],
        coluna: "concluido",
        sprintAnterior: true
    }
];
