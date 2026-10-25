// Conquistas
//
// Nomeadas por comportamento. Cada uma marca uma conduta que o
// jogo quer ensinar.
//
// A condição lê a sprint da cadeira e, quando precisa, o progresso do jogo
// inteiro e a cadeira. A ordem dos acontecimentos não importa.
//
// As marcadas com noFechamento só são avaliadas quando a sprint acaba.
// As que têm "marca" valem quando a sprint tem aquela marca. "cadeiras" diz
// em quais cadeiras dá para obter cada uma; o visualizador mostra.

const MEDIDOR_DE_EQUILIBRIO = 60;
const TODAS = ["po", "sm", "dev"];

export const CONQUISTAS = [
    {
        id: "recusa-transparente",
        nome: "Recusa transparente",
        descricao: "Disse não a um pedido de fora sem esconder o motivo.",
        marca: "recusa-transparente",
        cadeiras: ["po", "sm"]
    },
    {
        id: "impedimento-removido",
        nome: "Impedimento removido",
        descricao: "Fez um bloqueio sair da reunião com nome e dono.",
        marca: "impedimento",
        cadeiras: ["sm"]
    },
    {
        id: "meta-acima-do-escopo",
        nome: "A meta acima do escopo",
        descricao: "Manteve a meta da sprint quando era mais fácil ceder.",
        marca: "meta-protegida",
        cadeiras: ["po"]
    },
    {
        id: "pronto-quer-dizer-pronto",
        nome: "Pronto quer dizer pronto",
        descricao: "Levou um item do Sprint Backlog até CONCLUÍDO e o mostrou na Review.",
        marca: "definicao-de-pronto",
        cadeiras: ["po", "dev"]
    },
    {
        id: "debito-na-luz-do-dia",
        nome: "Débito na luz do dia",
        descricao: "Tornou visível um atalho técnico em vez de escondê-lo.",
        marca: "debito-visivel",
        cadeiras: ["dev"]
    },
    {
        id: "sozinho-na-sala",
        nome: "Sozinho na sala",
        descricao: "Decidiu bem sem o mentor por perto.",
        cadeiras: TODAS,
        condicao: function (sprint) {
            return sprint.decisoesSozinho > 0;
        }
    },
    {
        id: "equilibrio",
        nome: "Equilíbrio",
        descricao: "Terminou uma sprint com os três medidores acima de "
            + MEDIDOR_DE_EQUILIBRIO + ".",
        cadeiras: TODAS,
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
        cadeiras: TODAS,
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

// quem vale por marca ganha a condição aqui
CONQUISTAS.forEach(function (conquista) {
    if (conquista.marca) {
        conquista.condicao = function (sprint) {
            return (sprint.marcas[conquista.marca] || 0) > 0;
        };
    }
});
