// Conquistas
//
// Nomeadas por comportamento. Cada uma marca uma conduta que o
// jogo quer ensinar.
//
// A condição lê a sprint da cadeira e, quando precisa, o progresso do jogo
// inteiro e a cadeira. A ordem dos acontecimentos não importa.
//
// As marcadas com noFechamento só são avaliadas quando a sprint acaba.

const MEDIDOR_DE_EQUILIBRIO = 60;

export const CONQUISTAS = [
    {
        id: "recusa-transparente",
        nome: "Recusa transparente",
        descricao: "Disse não a um pedido de fora sem esconder o motivo.",
        condicao: function (sprint) {
            return (sprint.marcas["recusa-transparente"] || 0) > 0;
        }
    },
    {
        id: "impedimento-removido",
        nome: "Impedimento removido",
        descricao: "Fez um bloqueio sair da reunião com nome e dono.",
        condicao: function (sprint) {
            return (sprint.marcas["impedimento"] || 0) > 0;
        }
    },
    {
        id: "meta-acima-do-escopo",
        nome: "A meta acima do escopo",
        descricao: "Manteve a meta da sprint quando era mais fácil ceder.",
        condicao: function (sprint) {
            return (sprint.marcas["meta-protegida"] || 0) > 0;
        }
    },
    {
        id: "pronto-quer-dizer-pronto",
        nome: "Pronto quer dizer pronto",
        descricao: "Respeitou a Definition of Done sob pressão de prazo.",
        condicao: function (sprint) {
            return (sprint.marcas["definicao-de-pronto"] || 0) > 0;
        }
    },
    {
        id: "debito-na-luz-do-dia",
        nome: "Débito na luz do dia",
        descricao: "Tornou visível um atalho técnico em vez de escondê-lo.",
        condicao: function (sprint) {
            return (sprint.marcas["debito-visivel"] || 0) > 0;
        }
    },
    {
        id: "sozinho-na-sala",
        nome: "Sozinho na sala",
        descricao: "Decidiu bem sem o mentor por perto.",
        condicao: function (sprint) {
            return sprint.decisoesSozinho > 0;
        }
    },
    {
        id: "equilibrio",
        nome: "Equilíbrio",
        descricao: "Terminou uma sprint com os três medidores acima de "
            + MEDIDOR_DE_EQUILIBRIO + ".",
        noFechamento: true,
        condicao: function (sprint) {
            return Object.keys(sprint.medidores).every(function (chave) {
                return sprint.medidores[chave] >= MEDIDOR_DE_EQUILIBRIO;
            });
        }
    },
    {
        id: "tres-cadeiras",
        nome: "Três cadeiras",
        descricao: "Viveu a mesma sprint do ponto de vista dos três papéis.",
        noFechamento: true,
        condicao: function (sprint, progresso, cadeira) {
            const todas = Object.keys(progresso.sprintsConcluidas).every(function (chave) {
                return progresso.sprintsConcluidas[chave] > 0;
            });

            // Só a primeira sprint da última cadeira completa o trio; rejogar
            // uma cadeira não conquista de novo
            return todas && progresso.sprintsConcluidas[cadeira] === 1;
        }
    }
];
