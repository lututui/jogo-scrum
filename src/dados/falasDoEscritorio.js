// O que as pessoas do escritório dizem conforme a sprint anda
//
// No dia 1 vale a apresentação de elenco.js. Do dia 2 em diante, cada pessoa
// tem situações em ordem de prioridade, e vale a primeira cuja condição bate.
// A condição olha o dia, a cadeira do jogador e o quadro; não olha a opção
// escolhida em cada decisão, porque o quadro já guarda o que importa.
//
// Condições: "dias" [de, até]; "cadeiras"; "mentor" (a pessoa é a titular
// da cadeira do jogador); e, sobre o quadro: "existe", "planejado",
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

export const FALAS_DO_ESCRITORIO = {
    marcia: [
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
        {dias: [2, 2], falas: ["Tô com quatro coisas abertas, mas tá tudo andando. Até sexta fecha."], expressoes: [A]},
        {dias: [9, 9], falas: ["Review hoje. Torcendo para o professor não clicar no botão errado."], expressoes: [A]},
        {progressoCheio: true, falas: [
            "O EM PROGRESSO tá cheio. Eu pegava mais uma, mas não cabe. Melhor terminar alguma, né?"], expressoes: [N]},
        {falas: ["Café? Não? Tá bom, volto pro código."], expressoes: [A]}
    ],

    lu: [
        {parado: "pb03", falas: [
            "Terminei a minha parte do acento. Agora depende do código de vocês, e eu fico parada."], expressoes: [T]},
        {emProgresso: "pb03", falas: ["Estou no acento quebrado. Meio período rende pouco, mas rende."], expressoes: [N]},
        {concluido: "pb03", falas: [
            "O acento foi! Agora \"João\" e \"Conceição\" aparecem certinho na lista."], expressoes: [A]},
        {falas: ["Hoje é dia de outro cliente de manhã. À tarde volto para cá."], expressoes: [N]}
    ],

    gustavo: [
        {existe: "rel01", falas: [
            "Viu? Quando o cliente pede, a gente entrega. É assim que se segura contrato."], expressoes: [A]},
        {planejado: "pb04", falas: ["Vi o boletim no quadro. Ótimo, a diretora vai adorar."], expressoes: [A]},
        {cadeiras: ["po", "sm"], dias: [2, 4], falas: [
            "A diretora anda ansiosa. Vou passar aqui mais tarde para a gente conversar sobre a Review."], expressoes: [N]},
        {cadeiras: ["po", "sm"], dias: [5, 8], falas: [
            "Pensei no que conversamos. Espero que a Review deixe a diretora feliz."], expressoes: [N]},
        {falas: ["Esse contrato da escola é importante para a casa. Não esqueçam disso."], expressoes: [N]}
    ]
};

// contexto: {dia, cadeira, mentor, itens, entrega, prontos, total, colunaDoJogador}
// Devolve {falas, expressoes}, ou null no dia 1 e para quem não tem situações
export function falasDoEscritorio(chave, contexto) {
    const situacoes = FALAS_DO_ESCRITORIO[chave];
    if (!situacoes || contexto.dia < 2) {
        return null;
    }

    const escolhida = situacoes.find(function (situacao) {
        return bate(situacao, chave, contexto);
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
