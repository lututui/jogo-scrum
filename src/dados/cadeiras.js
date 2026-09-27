// As três cadeiras jogáveis
//
// A chave monta o nome das texturas do avatar (corpo_jogador_po,
// corpo_jogador_sm, corpo_jogador_dev).
//
// O titular é quem ocupa aquela cadeira no time e acompanha o aprendiz como
// mentor.

export const CADEIRAS = {
    po: {
        nome: "Product Owner",
        cor: "#c0392b",
        titular: "marcia",
        resumo: "Ordena o Product Backlog e decide o que entra na sprint",
        conduz: "Sprint Planning e Sprint Review"
    },
    sm: {
        nome: "Scrum Master",
        cor: "#1f6f8b",
        titular: "renan",
        resumo: "Facilita os eventos e remove o que trava o time",
        conduz: "Daily Scrum e Sprint Retrospective"
    },
    dev: {
        nome: "Desenvolvedor",
        cor: "#7a4bb5",
        titular: "bia",
        resumo: "Estima, constrói e responde pela qualidade do incremento",
        conduz: "nenhum evento; participa de todos"
    }
};

export const ORDEM_DAS_CADEIRAS = ["po", "sm", "dev"];
