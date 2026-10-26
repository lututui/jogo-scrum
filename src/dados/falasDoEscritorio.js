// O que as pessoas do escritório dizem conforme a sprint anda
//
// Do dia 2 em diante, cada pessoa tem situações em ordem de prioridade, e
// vale a primeira cuja condição bate. No dia 1 só valem as situações que
// declaram "dias" com o dia 1; sem nenhuma, vale a apresentação de elenco.js.
// A condição olha o dia, a cadeira do jogador e o quadro; não olha a opção
// escolhida em cada decisão, porque o quadro já guarda o que importa.
//
// Condições: "dias" [de, até]; "cadeiras"; "mentor" (a pessoa é a titular
// da cadeira do jogador); "conhece" (o jogador já passou por outra cadeira e
// conhece o time); e, sobre o quadro: "existe", "planejado",
// "bloqueado", "parado" (bloqueado, sem etiqueta), "marcado" (com a etiqueta
// BLOQUEADO),
// "andando" (fora de bloqueio e ainda não concluído), "emProgresso",
// "concluido", "foraDaSprint", "dentroDaSprint", "progressoCheio",
// "progressoAcimaDoLimite" e "entregaCompleta" (como estava na Review).
// Marcadores além de {nome}: {prontos}, {total} e {coluna}.

import {COLUNAS, ETIQUETA_DE_BLOQUEIO} from "./quadro.js";

const N = "neutro";
const T = "tenso";
const A = "aprovacao";

const DADOS_LIBERADOS = [
    "Vim com a diretora para a Review.",
    "Quero ver onde foram parar os dados que eu liberei."
];

export const FALAS_DO_ESCRITORIO = {
    marcia: [
        {dias: [1, 1], mentor: true, falas: [
            "Quando quiser, a agenda na parede abre o Planning. Leva na cabeça uma meta, não uma lista."], expressoes: [N]},
        {dias: [1, 1], conhece: true, mentor: false, falas: [
            "De volta, {nome}. Mesma sprint, outra cadeira: repara no que muda daqui."], expressoes: [A]},
        {dias: [1, 1], mentor: false, falas: [
            "Chegou cedo, {nome}. Boa.",
            "Anotei quatorze pedidos na reunião com a diretora. Estão todos na mesma folha, fora de ordem, e dois são a mesma coisa escrita diferente.",
            "Ordenar essa lista é trabalho meu, de Product Owner. No Planning você vê o que entrou e por quê."],
            expressoes: [A, T, N]},
        {dias: [10, 10], entregaCompleta: true, falas: [
            "A Review foi tranquila: o que estava no plano estava pronto. A escola saiu com o que pediu e com o que aprendeu."], expressoes: [A]},
        {dias: [10, 10], entregaCompleta: false, falas: [
            "Faltou coisa na Review. A conversa agora é sobre o porquê, não sobre quem."], expressoes: [T]},
        {dias: [9, 9], falas: [
            "Hoje a escola vem ver o que fizemos. Prefiro mostrar pouco funcionando do que muito pela metade."], expressoes: [N]},
        {existe: "rel01", falas: [
            "O relatório da diretora entrou na frente de tudo. O time largou o que estava fazendo para atender."], expressoes: [T]},
        {planejado: "pb04", falas: [
            "Vi o boletim no quadro. Quem combinou isso com a diretora? Eu não fui."], expressoes: [T]},
        {mentor: true, dias: [3, 8], falas: [
            "Do plano, {prontos} de {total} itens já estão em CONCLUÍDO. Olha o quadro de vez em quando: ele responde melhor que qualquer pergunta."], expressoes: [N]},
        {falas: ["A diretora ligou de novo. Por enquanto, só para saber como vai."], expressoes: [N]}
    ],

    renan: [
        {dias: [1, 1], mentor: true, falas: [
            "A agenda na parede abre o Planning quando você quiser. Lá, o meu trabalho e o seu é a conversa andar."], expressoes: [N]},
        {dias: [1, 1], conhece: true, mentor: false, falas: [
            "Outra cadeira, mesma sprint. Presta atenção em quem decide o quê."], expressoes: [N]},
        {dias: [10, 10], falas: [
            "Hoje é Retrospective. Pensa no que você mudaria no jeito de trabalhar, não em quem errou."], expressoes: [N]},
        {cadeiras: ["po", "sm"], parado: "pb02", falas: [
            "A Bia está travada desde ontem. Impedimento que ninguém nomeia vira atraso que ninguém explica."], expressoes: [T]},
        {cadeiras: ["po", "sm"], marcado: "pb02", falas: [
            "Pelo menos agora está escrito no quadro: BLOQUEADO. Dá para cobrar de quem pode resolver."], expressoes: [N]},
        {progressoAcimaDoLimite: true, falas: [
            "Repara no quadro: tem mais coisa começada do que cabe. Limite existe para o fluxo terminar."], expressoes: [T]},
        {mentor: true, dias: [3, 8], falas: [
            "{prontos} de {total} itens do plano prontos. O nosso trabalho não é empurrar o quadro, é tirar o que trava."], expressoes: [N]},
        {falas: [
            "Se a Daily está servindo ao time, ninguém precisa me procurar para saber das coisas. É um bom sinal."], expressoes: [N]}
    ],

    bia: [
        {dias: [1, 1], mentor: true, falas: [
            "A agenda abre o Planning. Estima com calma: número chutado vira hora extra no fim da sprint."], expressoes: [N]},
        {dias: [1, 1], conhece: true, mentor: false, falas: [
            "Mudou de cadeira? O critério continua o mesmo: pronto é o que funciona do começo ao fim."], expressoes: [N]},
        {cadeiras: ["po", "sm"], bloqueado: "pb02", falas: [
            "Ainda sem acesso à base de matrículas. Mandei outro e-mail para a secretaria."], expressoes: [T]},
        {cadeiras: ["po", "sm"], andando: "pb02", falas: [
            "Acesso liberado, finalmente. O login voltou a andar."], expressoes: [A]},
        {cadeiras: ["dev"], dentroDaSprint: "bug01", andando: "bug01", falas: [
            "A correção da presença está no quadro. Melhor assim do que escondida no fim do dia."], expressoes: [A]},
        {cadeiras: ["dev"], foraDaSprint: "bug01", falas: [
            "Três turmas continuam perdendo chamada. Eu não ficaria tranquila com isso."], expressoes: [T]},
        {cadeiras: ["dev"], existe: "deb01", falas: [
            "O débito do boletim está registrado no quadro. Alguém vai agradecer na próxima sprint."], expressoes: [A]},
        {mentor: true, dias: [3, 8], falas: [
            "O seu cartão está em {coluna}. Lembra: ele só sai de EM PROGRESSO com o trabalho feito."], expressoes: [N]},
        {falas: ["Item pronto é item que funciona do começo ao fim. Vou continuar repetindo isso."], expressoes: [N]}
    ],

    caio: [
        {dias: [1, 1], conhece: true, falas: [
            "Opa, de volta! O lançamento de presença tá quase pronto. Uns dois dias."], expressoes: [A]},
        {dias: [2, 2], falas: ["Tô com quatro coisas abertas, mas tá tudo andando. Até sexta fecha."], expressoes: [A]},
        {dias: [9, 9], falas: ["Review hoje. Torcendo para o professor não clicar no botão errado."], expressoes: [A]},
        {progressoCheio: true, falas: [
            "O EM PROGRESSO tá cheio. Eu pegava mais uma, mas não cabe. Melhor terminar alguma, né?"], expressoes: [N]},
        {falas: ["Café? Não? Tá bom, volto pro código."], expressoes: [A]}
    ],

    lu: [
        {dias: [1, 1], conhece: true, falas: [
            "Oi de novo! Hoje de manhã eu tô aqui; à tarde, no outro cliente."], expressoes: [A]},
        {parado: "pb03", falas: [
            "Terminei a minha parte do acento. Agora depende do código de vocês, e eu fico parada."], expressoes: [T]},
        {emProgresso: "pb03", falas: ["Estou no acento quebrado. Meio período rende pouco, mas rende."], expressoes: [N]},
        {concluido: "pb03", falas: [
            "O acento foi! Agora \"João\" e \"Conceição\" aparecem certinho na lista."], expressoes: [A]},
        {falas: ["Hoje é dia de outro cliente de manhã. À tarde volto para cá."], expressoes: [N]}
    ],

    gustavo: [
        {dias: [1, 1], conhece: true, falas: [
            "De volta? Ótimo. A diretora continua ansiosa, então capricha."], expressoes: [N]},
        {existe: "rel01", falas: [
            "Viu? Quando o cliente pede, a gente entrega. É assim que se segura contrato."], expressoes: [A]},
        {planejado: "pb04", falas: ["Vi o boletim no quadro. Ótimo, a diretora vai adorar."], expressoes: [A]},
        {cadeiras: ["po", "sm"], dias: [2, 4], falas: [
            "A diretora anda ansiosa. Vou passar aqui mais tarde para a gente conversar sobre a Review."], expressoes: [N]},
        {cadeiras: ["po", "sm"], dias: [5, 8], falas: [
            "Pensei no que conversamos. Espero que a Review deixe a diretora feliz."], expressoes: [N]},
        {falas: ["Esse contrato da escola é importante para a casa. Não esqueçam disso."], expressoes: [N]}
    ],

    // visitantes: só no dia da Review; sem situação que bata, vale a apresentação
    helio: [
        {cadeiras: ["po"], existe: "rev-feedback", falas: [
            "Vi que os seis cliques entraram no quadro de vocês.",
            "Hoje eu vim só ver o resto funcionando."], expressoes: [A, N]},
        {cadeiras: ["po"], falas: [
            "Os seis cliques para marcar falta continuam lá.",
            "Alguém anotou isso, ou vou ter que pedir de novo?"], expressoes: [N, T]}
    ],

    sandra: [
        {cadeiras: ["sm"], bloqueado: "pb02", falas: [
            "A base de matrículas segue comigo.",
            "Se quiserem conversar direito sobre ela, a secretaria fica aberta até as cinco."], expressoes: [N, T]},
        {andando: "pb02", falas: DADOS_LIBERADOS, expressoes: [N, N]},
        {concluido: "pb02", falas: DADOS_LIBERADOS, expressoes: [N, N]}
    ]
};

// contexto: {dia, cadeira, mentor, conhece, itens, entrega, prontos, total,
// colunaDoJogador}. Devolve {falas, expressoes}, ou null quando nada bate
export function falasDoEscritorio(chave, contexto) {
    const situacoes = FALAS_DO_ESCRITORIO[chave];
    if (!situacoes) {
        return null;
    }

    const escolhida = situacoes.find(function (situacao) {
        return (contexto.dia >= 2 || situacao.dias) && bate(situacao, chave, contexto);
    });
    if (!escolhida) {
        return null;
    }

    return {
        falas: escolhida.falas.map(function (fala) {
            return fala.replace("{prontos}", String(contexto.prontos))
                .replace("{total}", String(contexto.total))
                .replace("{coluna}", contexto.colunaDoJogador || "A FAZER");
        }),
        expressoes: escolhida.expressoes
    };
}

function bate(situacao, chave, contexto) {
    const cartao = function (id) {
        return contexto.itens.find(function (item) {
            return item.id === id;
        });
    };
    const marcado = function (item) {
        return item.etiquetas.indexOf(ETIQUETA_DE_BLOQUEIO) >= 0;
    };
    const naColuna = function (id) {
        return contexto.itens.filter(function (item) {
            return item.coluna === id;
        }).length;
    };
    const limite = COLUNAS.find(function (coluna) {
        return coluna.id === "progresso";
    }).limite;

    const testes = {
        dias: function (d) {
            return contexto.dia >= d[0] && contexto.dia <= d[1];
        },
        cadeiras: function (lista) {
            return lista.indexOf(contexto.cadeira) >= 0;
        },
        mentor: function (sim) {
            return (contexto.mentor === chave) === sim;
        },
        conhece: function (sim) {
            return Boolean(contexto.conhece) === sim;
        },
        existe: function (id) {
            return Boolean(cartao(id));
        },
        planejado: function (id) {
            return Boolean(cartao(id) && cartao(id).planejado);
        },
        bloqueado: function (id) {
            return Boolean(cartao(id) && cartao(id).bloqueado);
        },
        parado: function (id) {
            return Boolean(cartao(id) && cartao(id).bloqueado && !marcado(cartao(id)));
        },
        marcado: function (id) {
            return Boolean(cartao(id) && cartao(id).bloqueado && marcado(cartao(id)));
        },
        andando: function (id) {
            return Boolean(cartao(id) && !cartao(id).bloqueado && cartao(id).coluna !== "concluido");
        },
        emProgresso: function (id) {
            return Boolean(cartao(id) && !cartao(id).bloqueado && cartao(id).coluna === "progresso");
        },
        concluido: function (id) {
            return Boolean(cartao(id) && cartao(id).coluna === "concluido");
        },
        foraDaSprint: function (id) {
            return Boolean(cartao(id) && cartao(id).foraDaSprint);
        },
        dentroDaSprint: function (id) {
            return Boolean(cartao(id) && !cartao(id).foraDaSprint);
        },
        progressoCheio: function (sim) {
            return (naColuna("progresso") >= limite) === sim;
        },
        progressoAcimaDoLimite: function (sim) {
            return (naColuna("progresso") > limite) === sim;
        },
        entregaCompleta: function (sim) {
            return Boolean(contexto.entrega)
                && (contexto.entrega.prontos === contexto.entrega.total) === sim;
        }
    };

    return Object.keys(situacao).every(function (chaveDoTeste) {
        if (chaveDoTeste === "falas" || chaveDoTeste === "expressoes") {
            return true;
        }
        return testes[chaveDoTeste](situacao[chaveDoTeste]);
    });
}
