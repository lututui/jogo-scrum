// Eventos contextuais da sprint
//
// Acontecem no escritório, entre as reuniões. Cada evento tem dia e cadeira.
//
// O campo "semMentor" marca as decisões tomadas sem ninguém por perto,
// que pesam o dobro no placar. O campo "quadro" de cada opção é o que ela
// muda no quadro Kanban (ver aplicarNoQuadro).

const BUG_EM_PRODUCAO = {
    id: "bug01",
    tipo: "bug",
    titulo: "Presença some em produção",
    etiquetas: ["URGENTE"]
};

const DEBITO_DO_ATALHO = {
    id: "deb01",
    tipo: "chore",
    titulo: "Refazer o atalho do boletim",
    etiquetas: ["DÉBITO"],
    foraDaSprint: true
};

export const EVENTOS_CONTEXTUAIS = [
    {
        id: "pedido-da-diretora",
        dia: 3,
        cadeiras: ["po"],
        quem: "estela",
        expressao: "tenso",
        fala: "Alô? É a Estela. Preciso de um relatório de boletim para a "
            + "reunião de pais da semana que vem. Dá para fazer nesta sprint?",
        pergunta: "O que você responde?",
        semMentor: true,
        opcoes: [
            {
                titulo: "Registrar no Product Backlog e explicar a meta desta sprint",
                detalhe: "Não agora, e o motivo junto",
                avaliacao: "boa",
                marca: "meta-protegida",
                medidores: ["valor", "saude"],
                feedback: "A diretora entendeu o que está em jogo nesta sprint e "
                    + "saiu com o pedido registrado, não com uma promessa.",
                principio: "Mudança de escopo se negocia; a meta da sprint não se atropela."
            },
            {
                titulo: "Mandar o time parar e fazer o relatório",
                detalhe: "O cliente pediu",
                avaliacao: "ruim",
                conceito: "Sprint Backlog",
                medidores: ["valor", "saude"],
                feedback: "O time trocou de assunto no meio da semana e a meta "
                    + "ficou sem dono. O relatório saiu; a chamada, não.",
                principio: "O Sprint Backlog é do time, e trocá-lo por fora quebra o compromisso."
            },
            {
                titulo: "Dizer que não dá e encerrar a ligação",
                detalhe: "Recusa seca",
                avaliacao: "media",
                conceito: "Transparência",
                medidores: ["confianca"],
                feedback: "A meta ficou protegida e a diretora ficou sem "
                    + "entender por quê. A conversa volta na Review, mais difícil.",
                principio: "Transparência com o cliente sustenta a confiança que o processo exige."
            }
        ]
    },
    {
        id: "pressao-do-dono",
        dia: 5,
        cadeiras: ["po", "sm"],
        quem: "gustavo",
        expressao: "aprovacao",
        fala: "Passei aqui rapidinho. Promete as duas telas extras para a "
            + "diretora na Review, que a renovação fica garantida.",
        pergunta: "O que você faz?",
        semMentor: true,
        opcoes: [
            {
                titulo: "Recusar e explicar o custo da promessa",
                detalhe: "Conversa difícil agora, em vez de atraso depois",
                avaliacao: "boa",
                marca: "recusa-transparente",
                medidores: ["saude", "confianca"],
                feedback: "O dono saiu contrariado e informado. Na Review não vai "
                    + "haver promessa para desmentir.",
                principio: "Transparência com o stakeholder sustenta mais confiança que promessa."
            },
            {
                titulo: "Prometer e avisar o time depois",
                detalhe: "Compromisso assumido por fora",
                avaliacao: "ruim",
                conceito: "Autogestão",
                medidores: ["saude"],
                feedback: "O time descobriu o próprio compromisso pronto. Duas "
                    + "pessoas já falaram em virar a noite.",
                principio: "Compromisso assumido por quem não executa corrói a autogestão."
            },
            {
                titulo: "Prometer e não contar a ninguém",
                detalhe: "Problema guardado para a Review",
                avaliacao: "ruim",
                conceito: "Transparência",
                medidores: ["saude", "confianca", "valor"],
                feedback: "Na Review a diretora vai cobrar algo que ninguém "
                    + "começou. O silêncio custou as duas coisas.",
                principio: "Compromisso invisível é risco que ninguém pode inspecionar."
            }
        ]
    },
    {
        id: "bloqueio-da-bia",
        dia: 4,
        cadeiras: ["sm"],
        quem: "bia",
        expressao: "tenso",
        fala: "Segue sem acesso à base de matrículas. Mandei e-mail para a "
            + "secretaria ontem e hoje. Nada.",
        pergunta: "O que você faz?",
        semMentor: true,
        opcoes: [
            {
                titulo: "Ir à escola no fim da tarde e entender o receio da Sandra",
                detalhe: "O bloqueio tem um motivo humano",
                avaliacao: "boa",
                marca: "impedimento",
                medidores: ["valor", "confianca"],
                quadro: [{cartao: "it02", desbloqueia: true}],
                feedback: "O medo era de responsabilidade sobre dados de menores. "
                    + "Um recorte anonimizado destravou tudo em meia hora.",
                principio: "Remover impedimento começa por entender do que ele é feito."
            },
            {
                titulo: "Escalar para a diretora por cima da secretaria",
                detalhe: "Resolve hoje, custa depois",
                avaliacao: "media",
                conceito: "Impedimento",
                medidores: ["valor", "confianca"],
                quadro: [{cartao: "it02", desbloqueia: true}],
                feedback: "O acesso saiu em um dia e a secretaria passou a "
                    + "responder por obrigação. Vocês ainda dependem dela.",
                principio: "Impedimento removido por autoridade volta como atrito."
            },
            {
                titulo: "Pedir que ela trabalhe com dados inventados",
                detalhe: "Contornar em vez de remover",
                avaliacao: "ruim",
                conceito: "Impedimento",
                medidores: ["valor"],
                feedback: "O contorno virou retrabalho: o caso do aluno "
                    + "transferido só aparece com dado real.",
                principio: "Contornar impedimento adia o custo e o aumenta."
            }
        ]
    },
    {
        id: "bug-em-producao",
        dia: 6,
        cadeiras: ["dev"],
        quem: "helio",
        expressao: "tenso",
        fala: "A presença que eu lancei na segunda sumiu. Lancei de novo e "
            + "sumiu outra vez quando troquei de turma.",
        pergunta: "O que você faz?",
        semMentor: true,
        opcoes: [
            {
                titulo: "Corrigir agora e avisar o time e a PO",
                detalhe: "Entra no plano à vista de todos",
                avaliacao: "boa",
                marca: "definicao-de-pronto",
                medidores: ["valor", "confianca"],
                quadro: [{entra: BUG_EM_PRODUCAO, coluna: "progresso"}],
                feedback: "A correção entrou no quadro, o time replanejou o dia e "
                    + "o professor soube quando voltaria a funcionar.",
                principio: "Software em uso tem prioridade, e a correção entra no plano visível."
            },
            {
                titulo: "Corrigir em silêncio no fim do dia",
                detalhe: "Ninguém precisa saber",
                avaliacao: "media",
                conceito: "Transparência",
                medidores: ["saude"],
                feedback: "O bug sumiu e o tempo gasto também. O plano da sprint "
                    + "não bate com o que aconteceu de verdade.",
                principio: "Trabalho invisível impede o time de inspecionar o próprio plano."
            },
            {
                titulo: "Deixar para a próxima sprint",
                detalhe: "Está no backlog, um dia sai",
                avaliacao: "ruim",
                conceito: "Incremento",
                medidores: ["confianca", "valor"],
                quadro: [{entra: Object.assign({foraDaSprint: true}, BUG_EM_PRODUCAO), coluna: "afazer"}],
                feedback: "Três turmas seguem perdendo chamada. A escola deixou "
                    + "de usar o piloto na quarta-feira.",
                principio: "Incremento em uso que falha deixa de ser incremento."
            }
        ]
    },
    {
        id: "atalho-tecnico",
        dia: 7,
        cadeiras: ["dev"],
        quem: "caio",
        expressao: "aprovacao",
        fala: "Achei um jeito de economizar dois dias no boletim. É meio "
            + "gambiarra, mas ninguém vai mexer ali tão cedo.",
        pergunta: "O que você responde?",
        semMentor: true,
        opcoes: [
            {
                titulo: "Fazer e registrar o débito como item do backlog",
                detalhe: "Decisão explícita, com conta a pagar marcada",
                avaliacao: "boa",
                marca: "debito-visivel",
                medidores: ["valor", "saude"],
                quadro: [{entra: DEBITO_DO_ATALHO, coluna: "afazer"}],
                feedback: "Os dois dias entraram na sprint e o custo ficou "
                    + "escrito onde o time decide o que fazer depois.",
                principio: "Débito técnico é decisão legítima quando é explícita e registrada."
            },
            {
                titulo: "Fazer e não contar",
                detalhe: "Dois dias agora, surpresa depois",
                avaliacao: "ruim",
                conceito: "Débito técnico",
                medidores: ["saude", "valor"],
                feedback: "Na sprint seguinte alguém vai mexer ali sem saber o "
                    + "que encontrou, e vai achar que é azar.",
                principio: "Dívida oculta transfere o custo para quem não participou da decisão."
            },
            {
                titulo: "Recusar e fazer do jeito certo, furando a meta",
                detalhe: "Qualidade sem negociação",
                avaliacao: "media",
                conceito: "Meta da sprint",
                medidores: ["valor"],
                feedback: "O código ficou melhor e a meta não fechou. A escolha "
                    + "entre os dois era do time, e foi sua.",
                principio: "Qualidade interna é responsabilidade dos desenvolvedores, e o escopo é do time."
            }
        ]
    },
    {
        id: "colega-travado",
        dia: 8,
        cadeiras: ["po", "sm", "dev"],
        quem: "lu",
        expressao: "tenso",
        fala: "Estou parada esperando uma parte do código de vocês. Pego "
            + "outra coisa ou espero?",
        pergunta: "O que você faz?",
        semMentor: true,
        opcoes: [
            {
                titulo: "Destravar ela antes de seguir com o seu item",
                detalhe: "A meta é do time",
                avaliacao: "boa",
                medidores: ["valor", "saude"],
                quadro: [{cartao: "it05", desbloqueia: true, avanca: true}],
                feedback: "Meia hora sua economizou um dia dela, e o item saiu da "
                    + "coluna do meio antes de sexta.",
                principio: "Item parado não entrega valor; concluir vale mais que começar."
            },
            {
                titulo: "Pedir que ela comece outra coisa",
                detalhe: "Mais itens em progresso",
                avaliacao: "media",
                conceito: "Limite de WIP",
                medidores: ["valor"],
                feedback: "Ninguém ficou parado e nada foi concluído. O quadro "
                    + "cresceu para os lados.",
                principio: "Limitar trabalho em progresso existe para o fluxo terminar, não para ninguém parar."
            },
            {
                titulo: "Dizer que ela espera, seu item é mais importante",
                detalhe: "Prioridade pessoal",
                avaliacao: "ruim",
                conceito: "Meta da sprint",
                medidores: ["saude", "valor"],
                feedback: "Dois dias de trabalho dela ficaram parados por uma "
                    + "hora do seu.",
                principio: "A meta é compromisso coletivo, não soma de tarefas individuais."
            }
        ]
    }
];

// O próximo evento contextual ainda não vivido naquela cadeira
export function proximoContextual(cadeira, resolvidos) {
    return contextuaisDaCadeira(cadeira).find(function (evento) {
        return resolvidos.indexOf(evento.id) < 0;
    }) || null;
}

// Os eventos que cabem numa cadeira, em ordem de dia
export function contextuaisDaCadeira(cadeira) {
    return EVENTOS_CONTEXTUAIS.filter(function (evento) {
        return evento.cadeiras.indexOf(cadeira) >= 0;
    }).sort(function (um, outro) {
        return um.dia - outro.dia;
    });
}
