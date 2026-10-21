// Dados do quadro Kanban

export const COLUNAS = [
    {id: "afazer", titulo: "A FAZER"},
    {id: "progresso", titulo: "EM PROGRESSO", limite: 3},
    {id: "revisao", titulo: "REVISÃO", limite: 2},
    {id: "concluido", titulo: "CONCLUÍDO"}
];

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
