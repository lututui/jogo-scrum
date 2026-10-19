// Conquistas
//
// Nomeadas por comportamento. Cada uma marca uma conduta que o
// jogo quer ensinar.
//
// A condição lê o estado do progresso.
// A ordem dos acontecimentos não importa.

export const CONQUISTAS = [
    {
        id: "recusa-transparente",
        nome: "Recusa transparente",
        descricao: "Disse não a um pedido de fora sem esconder o motivo.",
        condicao: function (progresso) {
            return (progresso.marcas["recusa-transparente"] || 0) > 0;
        }
    },
    {
        id: "impedimento-removido",
        nome: "Impedimento removido",
        descricao: "Fez um bloqueio sair da reunião com nome e dono.",
        condicao: function (progresso) {
            return (progresso.marcas["impedimento"] || 0) > 0;
        }
    },
    {
        id: "meta-acima-do-escopo",
        nome: "A meta acima do escopo",
        descricao: "Manteve a meta da sprint quando era mais fácil ceder.",
        condicao: function (progresso) {
            return (progresso.marcas["meta-protegida"] || 0) > 0;
        }
    },
    {
        id: "pronto-quer-dizer-pronto",
        nome: "Pronto quer dizer pronto",
        descricao: "Respeitou a Definition of Done sob pressão de prazo.",
        condicao: function (progresso) {
            return (progresso.marcas["definicao-de-pronto"] || 0) > 0;
        }
    },
    {
        id: "debito-na-luz-do-dia",
        nome: "Débito na luz do dia",
        descricao: "Tornou visível um atalho técnico em vez de escondê-lo.",
        condicao: function (progresso) {
            return (progresso.marcas["debito-visivel"] || 0) > 0;
        }
    },
    {
        id: "sozinho-na-sala",
        nome: "Sozinho na sala",
        descricao: "Decidiu bem sem o mentor por perto.",
        condicao: function (progresso) {
            return progresso.decisoesSozinho > 0;
        }
    },
    {
        id: "equilibrio",
        nome: "Equilíbrio",
        descricao: "Terminou uma sprint com os três medidores acima de 60.",
        condicao: function (progresso) {
            return Object.keys(progresso.medidores).every(function (chave) {
                return progresso.medidores[chave] >= 60;
            });
        }
    },
    {
        id: "tres-cadeiras",
        nome: "Três cadeiras",
        descricao: "Viveu a mesma sprint do ponto de vista dos três papéis.",
        condicao: function (progresso) {
            return Object.keys(progresso.sprintsConcluidas).every(function (cadeira) {
                return progresso.sprintsConcluidas[cadeira] > 0;
            });
        }
    }
];
