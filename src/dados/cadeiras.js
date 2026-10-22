// As três cadeiras jogáveis
//
// A chave monta o nome das texturas do avatar (corpo_jogador_po,
// corpo_jogador_sm, corpo_jogador_dev), montadas em ui/montarJogador.js com
// a cor da cadeira no crachá.
//
// A cadeira de Dev tem nome no feminino, usado com o tratamento feminino
// (dados/texto.js, nomeDaCadeira).
//
// O titular é quem ocupa aquela cadeira no time e acompanha o aprendiz como
// mentor.

export const CADEIRAS = {
    po: {
        nome: "Product Owner",
        cor: "#c0392b",
        titular: "marcia",
        resumo: "Ordena o Product Backlog e propõe o que entra na sprint",
        nosEventos: "propõe a meta no Planning e recebe a escola na Review"
    },
    sm: {
        nome: "Scrum Master",
        cor: "#1f6f8b",
        titular: "renan",
        resumo: "Facilita os eventos e remove o que trava o time",
        nosEventos: "facilita a Daily e a Retrospective"
    },
    dev: {
        nome: "Desenvolvedor",
        nomeNoFeminino: "Desenvolvedora",
        cor: "#7a4bb5",
        titular: "bia",
        resumo: "Estima, constrói e responde pela qualidade do incremento",
        nosEventos: "estima o trabalho e participa de todos"
    }
};

export const ORDEM_DAS_CADEIRAS = ["po", "sm", "dev"];
