// Ações do escritório
//
// Uma decisão por cadeira que não está no calendário: a pessoa fica marcada
// com "!" no escritório durante alguns dias, e conversar com ela abre a
// decisão, no formato dos eventos contextuais (sem mentor por perto, conta no
// placar, pode mudar o quadro). É opcional: quem não conversa não perde nada
// do resultado normal da sprint. "condicao", quando existe, também precisa
// valer no quadro para a pessoa ter o "!".

import {lerItensDoQuadro} from "./estadoDoQuadro.js";
import {acoesResolvidas, diaDaSprint} from "./progresso.js";

const POUCOS_CLIQUES = {
    id: "rev-feedback",
    tipo: "feature",
    titulo: "Reduzir cliques para marcar falta",
    etiquetas: ["UI"],
    esforco: 3
};

export const ACOES_DO_ESCRITORIO = [
    {
        id: "cliques-do-helio",
        cadeiras: ["po"],
        dias: [3, 8],
        quem: "helio",
        expressao: "tenso",
        fala: "Desculpa aparecer sem avisar. Para marcar uma falta hoje eu preciso "
            + "de seis cliques. Seis. Multiplica por trinta e duas turmas na "
            + "semana. Dá para resolver isso agora?",
        pergunta: "O que você faz?",
        semMentor: true,
        opcoes: [
            {
                titulo: "Registrar no Product Backlog e combinar quando olhar",
                detalhe: "Pedido ouvido, sprint protegida",
                avaliacao: "boa",
                medidores: ["confianca", "valor"],
                quadro: [{entra: Object.assign({foraDaSprint: true}, POUCOS_CLIQUES), coluna: "afazer"}],
                feedback: "O Hélio saiu sabendo que o pedido está registrado e quando "
                    + "vai ser olhado. A sprint seguiu no que foi combinado.",
                principio: "Pedido novo vai para o Product Backlog, onde o Product Owner ordena; a sprint em andamento se protege."
            },
            {
                titulo: "Pedir ao time que faça agora, nesta sprint",
                detalhe: "Atende já, custa o plano",
                avaliacao: "ruim",
                conceito: "Sprint Backlog",
                medidores: ["valor", "saude"],
                quadro: [{entra: Object.assign({passaNaFrente: true}, POUCOS_CLIQUES), coluna: "progresso"}],
                feedback: "O professor ficou feliz, e o time largou o item da meta "
                    + "para mexer em tela. O plano da sprint perdeu tempo.",
                principio: "Mudar o Sprint Backlog por fora troca a meta pelo pedido mais recente."
            },
            {
                titulo: "Prometer para a próxima sprint, sem registrar",
                detalhe: "Boa intenção, sem rastro",
                avaliacao: "media",
                conceito: "Product Backlog",
                medidores: ["confianca"],
                quadro: [],
                feedback: "O Hélio saiu contente, e o pedido saiu com ele. Na próxima "
                    + "sprint ninguém vai lembrar dos seis cliques.",
                principio: "O que não está no Product Backlog não existe para o time."
            }
        ]
    },
    {
        id: "quatro-coisas-do-caio",
        cadeiras: ["sm"],
        dias: [4, 8],
        quem: "caio",
        expressao: "aprovacao",
        fala: "Ó, eu tô com quatro coisas abertas e nenhuma fechou ainda. Mas tá "
            + "tudo andando, juro.",
        pergunta: "O que você faz?",
        semMentor: true,
        opcoes: [
            {
                titulo: "Chamar o time para terminar antes de começar",
                detalhe: "Facilitar o fluxo, sem decidir por eles",
                avaliacao: "boa",
                medidores: ["valor", "saude"],
                quadro: [{coluna: "progresso", avancam: 1}],
                feedback: "O time olhou o quadro junto e decidiu fechar o que estava "
                    + "mais perto do fim. Um item saiu da coluna do meio no mesmo dia.",
                principio: "Limitar o trabalho em progresso faz o fluxo terminar; quem decide como é o time."
            },
            {
                titulo: "Dizer ao Caio qual fechar primeiro",
                detalhe: "Resolve, mas decide por ele",
                avaliacao: "media",
                conceito: "Autogestão",
                medidores: ["saude"],
                quadro: [],
                feedback: "Ele fechou o que você mandou. Da próxima vez, vai esperar "
                    + "você mandar de novo.",
                principio: "Facilitar não é distribuir tarefa; autogestão se sustenta com espaço."
            },
            {
                titulo: "Deixar quieto, ele disse que está andando",
                detalhe: "Quatro coisas abertas, nenhuma pronta",
                avaliacao: "ruim",
                conceito: "Limite de WIP",
                medidores: ["valor"],
                quadro: [{noSprintBacklog: true, aumenta: 1}],
                feedback: "Na sexta, as quatro coisas continuavam abertas, e o item "
                    + "da meta pegou o atraso junto.",
                principio: "Trabalho começado não é trabalho entregue."
            }
        ]
    },
    {
        id: "revisao-do-caio",
        cadeiras: ["dev"],
        dias: [6, 8],
        quem: "caio",
        condicao: "itemDoTimeNaRevisao",
        expressao: "aprovacao",
        fala: "Pode dar uma olhada no meu item? Tá na REVISÃO desde ontem. É "
            + "coisa pequena, deve estar certo.",
        pergunta: "O que você faz?",
        semMentor: true,
        opcoes: [
            {
                titulo: "Revisar com cuidado, linha por linha",
                detalhe: "Pronto quer dizer que alguém olhou",
                avaliacao: "boa",
                medidores: ["valor", "confianca"],
                quadro: [{naRevisao: true, avanca: true}],
                feedback: "Você achou um caso esquecido, e o Caio corrigiu na hora. O "
                    + "item foi para CONCLUÍDO funcionando de verdade.",
                principio: "Revisar é parte da Definition of Done, não um favor ao colega."
            },
            {
                titulo: "Aprovar sem olhar, ele é bom",
                detalhe: "Rápido hoje, caro amanhã",
                avaliacao: "ruim",
                conceito: "Definition of Done",
                medidores: ["valor", "confianca"],
                quadro: [{naRevisao: true, volta: true, aumenta: 1}],
                feedback: "O item passou, e no dia seguinte a Bia achou o defeito que "
                    + "você teria visto. Voltou para EM PROGRESSO.",
                principio: "Aprovar sem olhar transforma revisão em carimbo, e o defeito volta mais caro."
            },
            {
                titulo: "Pedir que outra pessoa revise",
                detalhe: "Passa a vez",
                avaliacao: "media",
                conceito: "Definition of Done",
                medidores: ["saude"],
                quadro: [],
                feedback: "A Bia revisou no fim do dia, entre uma coisa e outra. O "
                    + "item esperou mais um dia na REVISÃO.",
                principio: "Revisão é responsabilidade do time; passar adiante só adia o pronto."
            }
        ]
    }
];

// Condições de quadro que uma ação pode exigir
const CONDICOES = {
    itemDoTimeNaRevisao: function (itens) {
        return itens.some(function (item) {
            return !item.doJogador && !item.sprintAnterior && item.coluna === "revisao";
        });
    }
};

// A ação que espera o jogador na pessoa, hoje, ou null
export function acaoPendente(registry, cadeira, quem) {
    const dia = diaDaSprint(registry, cadeira);
    const feitas = acoesResolvidas(registry, cadeira);

    return ACOES_DO_ESCRITORIO.find(function (acao) {
        return acao.quem === quem
            && acao.cadeiras.indexOf(cadeira) >= 0
            && dia >= acao.dias[0] && dia <= acao.dias[1]
            && feitas.indexOf(acao.id) < 0
            && (!acao.condicao || CONDICOES[acao.condicao](lerItensDoQuadro(registry, cadeira)));
    }) || null;
}
