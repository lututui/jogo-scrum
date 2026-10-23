// Conteúdo dos eventos do Scrum
//
// Cada opção carrega o princípio que o feedback deve nomear (RF10), e cada
// evento abre declarando seu objetivo de aprendizagem (RF08). O "dia" de cada
// reunião é o lugar dela no calendário da sprint.

export const CAPACIDADE_DA_SPRINT = 8;

// Itens candidatos, com esforço estimado pelo time. "alinhado" marca os que
// servem à meta proposta; é o que o feedback usa para avaliar a escolha.
// Dois deles travam no caminho, e são as decisões que destravam: o login
// precisa da base de matrículas da escola, que a Bia ainda não acessa
// ("bloqueadoEm", nas cadeiras que podem resolver isso), e o acento depende
// de código de outra pessoa, que a Lu espera quando termina a parte dela
// ("travaNoFim")
export const PRODUTO_BACKLOG = [
    {
        id: "pb01",
        tipo: "feature",
        titulo: "Professor lança a presença de uma turma",
        esforco: 5,
        alinhado: true
    },
    {
        id: "pb02",
        tipo: "feature",
        titulo: "Login do professor",
        esforco: 2,
        alinhado: true,
        bloqueadoEm: ["po", "sm"]
    },
    {
        id: "pb03",
        tipo: "bug",
        titulo: "Acento quebrado no nome do aluno",
        esforco: 1,
        alinhado: true,
        travaNoFim: true
    },
    {
        id: "pb04",
        tipo: "feature",
        titulo: "Boletim do bimestre",
        esforco: 8,
        alinhado: false
    },
    {
        id: "pb05",
        tipo: "feature",
        titulo: "Mensagem para responsáveis",
        esforco: 3,
        alinhado: false
    },
    {
        id: "pb06",
        tipo: "chore",
        titulo: "Atualizar as dependências do projeto",
        esforco: 2,
        alinhado: false
    }
];

// O Sprint Backlog que o time fecha quando o jogador não conduz o Planning:
// os itens que servem à meta, que somam a capacidade
export const PLANO_DO_TIME = PRODUTO_BACKLOG.filter(function (item) {
    return item.alinhado;
});

// Na cadeira de Dev, o item que o jogador leva com as próprias mãos
export const ITEM_DO_JOGADOR = {dev: "pb01"};

export const SPRINT_PLANNING = {
    chave: "CenaSprintPlanning",
    dia: 1,
    nome: "SPRINT PLANNING",
    resumo: "Definir a meta e montar o Sprint Backlog",
    objetivo: "Definir com o time uma meta que restrinja o escopo e um Sprint "
        + "Backlog que caiba na capacidade dos desenvolvedores.",
    participantes: ["marcia", "renan", "bia", "caio", "lu"],
    perguntaDaMeta: "Que meta você propõe ao time?",
    metas: [
        {
            id: "meta-foco",
            titulo: "Um professor lança a presença de uma turma do começo ao fim",
            detalhe: "Uma frase, um resultado verificável",
            avaliacao: "boa",
            feedback: "A meta diz o que o usuário conseguirá fazer, e não quais "
                + "telas serão construídas. Quando a sprint apertar, o time sabe "
                + "o que cortar sem perder o sentido do que entrega.",
            principio: "A meta da sprint dá coerência ao trabalho e orienta o corte de escopo."
        },
        {
            id: "meta-lista",
            titulo: "Entregar os itens do topo da lista, na ordem em que estão",
            detalhe: "Sem meta comum, só uma relação de tarefas",
            avaliacao: "ruim",
            conceito: "Meta da sprint",
            feedback: "Uma lista de itens não é uma meta. Sem um resultado comum, "
                + "cada item avança um pouco e nada funciona ponta a ponta na Review.",
            principio: "Sprint sem meta vira fila de tarefas, e o incremento não fecha."
        },
        {
            id: "meta-agradar",
            titulo: "Impressionar a diretora com o máximo de telas possível",
            detalhe: "Meta voltada à plateia, não ao uso",
            avaliacao: "ruim",
            conceito: "Incremento",
            feedback: "Tela pronta não é incremento utilizável. A meta passa a "
                + "servir à apresentação, e o time perde o critério para decidir "
                + "o que fica de fora.",
            principio: "O incremento precisa ser usável, não apenas demonstrável."
        }
    ],
    // Quem anuncia a capacidade e confirma o que cabe: no Scrum Guide 2020, os
    // itens do Sprint Backlog são selecionados pelos desenvolvedores, em
    // conversa com o Product Owner
    vozDosDesenvolvedores: "bia",
    instrucaoDoBacklog: "Proponha os itens. Quem confirma o que cabe somos nós, "
        + "os desenvolvedores: estimamos " + CAPACIDADE_DA_SPRINT
        + " pontos de capacidade para esta sprint.",
    capacidadeExcedida: {
        feedback: "Os desenvolvedores estimaram a capacidade da sprint e esse "
            + "item não cabe nela. Forçar a entrada não cria tempo; só transfere a decisão de "
            + "corte para o meio da sprint, quando ela custa mais.",
        principio: "Quem estima é quem faz, e a capacidade é o limite do plano."
    },
    fechamento: {
        alinhado: {
            feedback: "O Sprint Backlog ficou coerente com a meta: o que entrou "
                + "serve ao mesmo resultado.",
            principio: "O Sprint Backlog é o plano dos desenvolvedores para alcançar a meta."
        },
        // Itens coerentes entre si, mas a meta dita não é a que os une
        semMeta: {
            conceito: "Meta da sprint",
            feedback: "Os itens escolhidos servem a um resultado só, mas a meta "
                + "dita na sala não é esse resultado. O time vai seguir a lista, "
                + "e não a meta.",
            principio: "A meta é o que dá sentido ao Sprint Backlog; sem ela, o plano é só uma lista."
        },
        disperso: {
            conceito: "Sprint Backlog",
            feedback: "Entraram itens que não servem à meta. Eles competem por "
                + "tempo com o que a sprint prometeu entregar.",
            principio: "Item sem relação com a meta é escopo emprestado da próxima sprint."
        },
        vazio: {
            conceito: "Sprint Planning",
            feedback: "Sem itens selecionados não há plano. O time sai da reunião "
                + "sem saber por onde começar.",
            principio: "O Sprint Planning termina com um plano, não com uma intenção."
        }
    }
};

export const DAILY_SCRUM = {
    chave: "CenaDailyScrum",
    dia: 2,
    nome: "DAILY SCRUM",
    resumo: "Quinze minutos para sincronizar o time",
    objetivo: "Fazer a Daily servir aos desenvolvedores em quinze minutos e "
        + "transformar impedimento declarado em impedimento tratado.",
    participantes: ["renan", "bia", "caio", "lu"],
    duracaoEmMinutos: 15,
    rodadas: [
        {
            quem: "caio",
            fala: "Ontem mexi no lançamento de presença. Tive um problema com o "
                + "formato da data, que vem do banco como texto, aí eu tentei "
                + "converter no cliente, mas o fuso...",
            opcoes: [
                {
                    titulo: "Cortar e marcar a conversa técnica para depois",
                    custo: 2,
                    avaliacao: "boa",
                    feedback: "O assunto não sumiu: ganhou hora e lugar. A Daily "
                        + "continua servindo ao time inteiro.",
                    principio: "A Daily sincroniza o time em torno da meta; detalhe técnico tem outro espaço."
                },
                {
                    titulo: "Deixar ele terminar o raciocínio",
                    custo: 6,
                    avaliacao: "media",
                    conceito: "Daily Scrum",
                    feedback: "Seis minutos foram para um assunto de duas pessoas. "
                        + "Sobrou pouco tempo para o resto do time.",
                    principio: "Tempo fixo é o que mantém a Daily viável todos os dias."
                },
                {
                    titulo: "Resolver o problema dele ali mesmo",
                    custo: 7,
                    avaliacao: "ruim",
                    conceito: "Autogestão",
                    feedback: "Você assumiu a tarefa em vez de facilitar. O time "
                        + "aprende a trazer problemas para você resolver.",
                    principio: "Facilitar não é decidir pelo time; autogestão se sustenta com espaço."
                }
            ]
        },
        {
            quem: "bia",
            expressao: "tenso",
            fala: "Continuo bloqueada desde ontem. É isso.",
            opcoes: [
                {
                    titulo: "Perguntar o que exatamente trava",
                    custo: 3,
                    avaliacao: "boa",
                    registraImpedimento: true,
                    quadro: [{cartao: "pb02", mostraBloqueio: true}],
                    feedback: "O bloqueio virou impedimento com nome: falta acesso "
                        + "à base de matrículas. Agora dá para agir sobre ele.",
                    principio: "Impedimento não declarado é impedimento que ninguém remove."
                },
                {
                    titulo: "Anotar e seguir para o próximo",
                    custo: 1,
                    avaliacao: "ruim",
                    conceito: "Impedimento",
                    feedback: "A anotação não diz o que travou. Amanhã a frase se "
                        + "repete e o segundo dia também se perde.",
                    principio: "Transparência exige informação acionável, não registro genérico."
                },
                {
                    titulo: "Sugerir que ela tente por outro caminho",
                    custo: 4,
                    avaliacao: "media",
                    conceito: "Impedimento",
                    feedback: "Você propôs solução sem conhecer a causa. Pode ser "
                        + "que o caminho alternativo esbarre no mesmo bloqueio.",
                    principio: "Remover impedimento começa por entender do que ele é feito."
                }
            ]
        },
        {
            quem: "lu",
            expressao: "tenso",
            fala: "Bom... acho que é com você que eu falo, né? Ontem eu fiz as "
                + "telas e hoje pretendo continuar. Pode ser?",
            opcoes: [
                {
                    titulo: "Devolver a conversa ao time",
                    custo: 2,
                    avaliacao: "boa",
                    feedback: "A Daily volta a ser do time. Quem precisa da "
                        + "informação dela são os outros desenvolvedores.",
                    principio: "A Daily não é relatório de status para o facilitador."
                },
                {
                    titulo: "Aceitar o relato e anotar",
                    custo: 2,
                    avaliacao: "media",
                    conceito: "Daily Scrum",
                    feedback: "Funciona hoje e ensina o padrão errado: o time passa "
                        + "a se reportar a você todos os dias.",
                    principio: "O formato que você aceita é o formato que o time repete."
                },
                {
                    titulo: "Cobrar prazo para as telas",
                    custo: 5,
                    avaliacao: "ruim",
                    conceito: "Transparência",
                    feedback: "A cobrança transforma a reunião em prestação de "
                        + "contas. O time passa a relatar o que soa bem.",
                    principio: "Cobrança individual corrói a transparência que a Daily depende."
                }
            ]
        }
    ],
    fechamento: {
        dentroDoTempo: "Quinze minutos bastaram.",
        acimaDoTempo: "A reunião passou do tempo combinado.",
        conceitoAcimaDoTempo: "Daily Scrum",
        comImpedimento: "Um impedimento saiu da reunião com nome e dono.",
        semImpedimento: "Nenhum impedimento saiu da reunião em condição de ser tratado.",
        principio: "A Daily serve para inspecionar o progresso rumo à meta e adaptar o plano do dia."
    }
};

export const SPRINT_REVIEW = {
    chave: "CenaSprintReview",
    dia: 9,
    nome: "SPRINT REVIEW",
    resumo: "Mostrar o incremento e ouvir a escola",
    objetivo: "Apresentar o incremento como inspeção, e não como venda, e sair "
        + "da reunião com feedback aproveitável.",
    participantes: ["marcia", "estela", "helio", "bia", "renan"],
    perguntaDoFormato: "Como você propõe mostrar o incremento à escola?",
    formatos: [
        {
            id: "demonstrar",
            titulo: "Pedir que o professor Hélio use o sistema na frente de todos",
            detalhe: "Inspeção com o usuário real",
            avaliacao: "boa",
            gerarFeedbackDoUsuario: true,
            feedback: "Hélio errou o fluxo duas vezes e ninguém precisou discutir "
                + "se o incremento está pronto: a tela respondeu por si.",
            principio: "A Review é inspeção do incremento com quem vai usá-lo."
        },
        {
            id: "slides",
            titulo: "Apresentar slides com o que foi feito",
            detalhe: "Relato sem uso",
            avaliacao: "ruim",
            conceito: "Sprint Review",
            feedback: "Elogio fácil, nenhum problema descoberto. O que não apareceu "
                + "hoje aparece na próxima sprint, mais caro.",
            principio: "Incremento que não é usado na Review não foi inspecionado."
        },
        {
            id: "relatorio",
            titulo: "Enviar um relatório e discutir prazos",
            detalhe: "Reunião de status",
            avaliacao: "ruim",
            conceito: "Sprint Review",
            feedback: "A conversa virou cronograma. O Product Backlog sai da "
                + "reunião igual ao que entrou.",
            principio: "A Review adapta o Product Backlog; sem isso ela perde a função."
        }
    ],
    perguntaDosItens: "O que você mostra?",
    aviso: "Só o que está em CONCLUÍDO pode ser demonstrado.",
    itemNaoConcluido: {
        feedback: "Esse item não está concluído. Mostrar trabalho pela metade "
            + "como se estivesse pronto compra um problema para a próxima sprint.",
        principio: "Só entra na Review o que atende à Definition of Done."
    },
    feedbackDoUsuario: {
        tipo: "feature",
        titulo: "Reduzir cliques para marcar falta",
        etiquetas: ["UI"],
        esforco: 2
    },
    fechamento: {
        comItens: {
            feedback: "A escola viu funcionando o que a sprint prometeu, e o que "
                + "ela pediu agora entra no Product Backlog para ser ordenado.",
            principio: "A Review termina com o Product Backlog adaptado ao que se aprendeu."
        },
        // Itens prontos mostrados por slides ou relatório, sem uso pela escola
        comItensSemUso: {
            feedback: "Os itens prontos foram mostrados, mas ninguém da escola usou "
                + "o sistema. O que não apareceu hoje vai aparecer depois, já em uso.",
            principio: "A Review é inspeção do incremento com quem vai usá-lo."
        },
        semItens: {
            conceito: "Incremento",
            feedback: "Sem nada para mostrar, a reunião vira promessa. A escola "
                + "fica sem base para confiar no próximo prazo.",
            principio: "Confiança se constrói com incremento em uso, não com relato."
        }
    }
};

export const SPRINT_RETROSPECTIVE = {
    chave: "CenaSprintRetrospective",
    dia: 10,
    nome: "SPRINT RETROSPECTIVE",
    resumo: "Transformar o que o time viu em uma ação",
    objetivo: "Transformar o que o time observou em uma ação verificável, com "
        + "responsável, em vez de encerrar a reunião no desabafo.",
    participantes: ["renan", "bia", "caio", "lu"],
    perguntaDasObservacoes: "O que o time levanta? Escolha até duas observações.",
    limiteDeObservacoes: 2,
    observacoes: [
        {
            id: "obs-bloqueio",
            quem: "bia",
            expressao: "tenso",
            titulo: "Fiquei dois dias parada esperando acesso à base",
            relevante: true
        },
        {
            id: "obs-wip",
            quem: "caio",
            expressao: "tenso",
            titulo: "Comecei quatro coisas e não terminei nenhuma",
            relevante: true
        },
        {
            id: "obs-clima",
            quem: "lu",
            expressao: "aprovacao",
            titulo: "A sprint foi corrida, mas a equipe é legal",
            relevante: false
        },
        {
            id: "obs-cafe",
            quem: "caio",
            expressao: "tenso",
            titulo: "A cafeteira do andar quebrou de novo",
            relevante: false
        }
    ],
    perguntaDaAcao: "Uma ação para a próxima sprint:",
    acoes: [
        {
            id: "acao-verificavel",
            titulo: "Limitar a dois itens em progresso por pessoa, a partir de segunda",
            detalhe: "Combinada com o time, verificável no quadro",
            avaliacao: "boa",
            feedback: "A ação tem começo, dono e um lugar onde se verifica se foi "
                + "cumprida. Na próxima retrospectiva dá para dizer se funcionou.",
            principio: "Retrospectiva termina com melhoria verificável no ciclo seguinte."
        },
        {
            id: "acao-vaga",
            titulo: "Melhorar a comunicação do time",
            detalhe: "Sem dono e sem como medir",
            avaliacao: "ruim",
            conceito: "Sprint Retrospective",
            feedback: "Ninguém sabe o que fazer amanhã de manhã por causa disso. "
                + "A frase reaparece intacta na próxima retrospectiva.",
            principio: "Ação sem responsável e sem critério não é melhoria, é intenção."
        },
        {
            id: "acao-lista",
            titulo: "Anotar as dez melhorias levantadas e tentar todas",
            detalhe: "Volume em vez de escolha",
            avaliacao: "ruim",
            conceito: "Sprint Retrospective",
            feedback: "Dez ações competem entre si e nenhuma recebe atenção. O time "
                + "termina a sprint seguinte sem ter feito nenhuma.",
            principio: "Poucas melhorias por ciclo é o que torna a adaptação real."
        }
    ],
    semObservacaoRelevante: {
        conceito: "Sprint Retrospective",
        feedback: "As observações escolhidas não tocam no que travou a sprint. A "
            + "conversa foi agradável e o problema continua de pé.",
        principio: "A retrospectiva inspeciona o processo, e não o humor do time."
    },
    fechamento: {
        principio: "Inspeção e adaptação fecham o ciclo: a sprint seguinte começa diferente."
    }
};

export const EVENTOS = [SPRINT_PLANNING, DAILY_SCRUM, SPRINT_REVIEW, SPRINT_RETROSPECTIVE];
