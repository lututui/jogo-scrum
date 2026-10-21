// O que muda em cada evento conforme a cadeira
//
// A cadeira do jogador decide quem tem a mecânica própria do evento e quem
// participa.
//
// Quem tem a mecânica ("conduz") recebe a implementada na cena; quem
// participa recebe uma sequência de decisões, declarada aqui.
//
// "conduz" é só a chave da mecânica. O que o jogador lê na agenda é o
// "rotulo", escrito conforme o Scrum Guide 2020: a Daily é dos
// desenvolvedores e o Scrum Master a facilita; no Planning o Product Owner
// propõe a meta, que o time define junto; a Review é do time com a escola, e
// o Product Owner é quem recebe a escola.

export const PAPEIS_DOS_EVENTOS = {

    // ------------------------------------------------------------ planning

    CenaSprintPlanning: {

        po: {
            conduz: true,
            rotulo: "você propõe a meta",
            abertura: {
                quem: "marcia",
                texto: "A lista da diretora tem quatorze pedidos. Hoje você "
                    + "senta na minha cadeira: propõe a meta e o que entra. "
                    + "Quem diz o que cabe são os desenvolvedores, e a meta "
                    + "sai da conversa com o time."
            }
        },

        sm: {
            abertura: {
                quem: "renan",
                texto: "Hoje quem facilita é você. Repara numa coisa: o Gustavo "
                    + "veio para a sala, e ele não faz parte do time."
            },
            decisoes: [
                {
                    quem: "gustavo",
                    fala: "Pessoal, a diretora anda ansiosa. Dá para prometer o "
                        + "boletim junto nesta sprint? Fica bem para a renovação.",
                    pergunta: "O que você faz?",
                    opcoes: [
                        {
                            titulo: "Devolver a pergunta ao time e sustentar o silêncio",
                            detalhe: "Quem faz é quem responde",
                            avaliacao: "boa",
                            feedback: "O time respondeu que não cabe, e a conversa "
                                + "passou a ser sobre capacidade, não sobre vontade.",
                            principio: "Quem estima é quem faz; a meta é compromisso, não previsão comercial."
                        },
                        {
                            titulo: "Aceitar pelo time para não criar atrito",
                            detalhe: "Decidir no lugar de quem executa",
                            avaliacao: "ruim",
                            feedback: "O compromisso foi assumido por quem não vai "
                                + "cumpri-lo. O time descobriu o próprio plano depois de pronto.",
                            principio: "Compromisso assumido por terceiros corrói a autogestão."
                        },
                        {
                            titulo: "Pedir que o Gustavo saia da sessão de estimativa",
                            detalhe: "Proteção sem conversa",
                            avaliacao: "media",
                            feedback: "O time ficou livre da pressão, e o dono saiu "
                                + "sem entender por quê. A conversa vai voltar na Review.",
                            principio: "Proteger o time inclui explicar ao negócio o que está sendo protegido."
                        }
                    ]
                },
                {
                    quem: "caio",
                    fala: "Pra mim tanto faz, dá pra tentar. Se virar a noite na "
                        + "última semana, sai.",
                    pergunta: "O que você faz?",
                    opcoes: [
                        {
                            titulo: "Perguntar ao time o que significa 'dá para tentar'",
                            detalhe: "Tornar o risco explícito",
                            avaliacao: "boa",
                            feedback: "A frase virou número: o item tem uma parte "
                                + "desconhecida, e o time preferiu investigá-la antes de prometer.",
                            principio: "Transparência é o que permite inspecionar; estimativa vaga esconde risco."
                        },
                        {
                            titulo: "Registrar como aceito e seguir",
                            detalhe: "Silêncio vale como acordo",
                            avaliacao: "ruim",
                            feedback: "Virar a noite entrou no plano sem ninguém "
                                + "dizer isso em voz alta. É o tipo de combinado que ninguém cumpre duas vezes.",
                            principio: "Ritmo sustentável é condição do processo, não recompensa."
                        },
                        {
                            titulo: "Dizer que hora extra não é plano",
                            detalhe: "Resposta pronta, sem o time",
                            avaliacao: "media",
                            feedback: "Você tem razão e ainda assim decidiu sozinho. "
                                + "O time concordou com a sua frase, não com um plano dele.",
                            principio: "Facilitar é fazer o time chegar à conclusão, não anunciá-la."
                        }
                    ]
                }
            ],
            fechamento: {
                texto: "A meta saiu do time, e não da sala ao lado. Foi isso que "
                    + "você facilitou hoje.",
                principio: "O Sprint Planning é do time; o facilitador cuida das condições, não do conteúdo."
            }
        },

        dev: {
            abertura: {
                quem: "bia",
                texto: "Você senta comigo. A parte que nos cabe aqui é dizer o "
                    + "tamanho das coisas, e dizer direito."
            },
            decisoes: [
                {
                    quem: "marcia",
                    fala: "O lançamento de presença dá para fechar nesta sprint? "
                        + "Eu prometi olhar isso com a diretora na sexta.",
                    pergunta: "O que você responde?",
                    opcoes: [
                        {
                            titulo: "Dar o número em que acredito e explicar a incerteza",
                            detalhe: "Cinco pontos, com a parte do servidor em aberto",
                            avaliacao: "boa",
                            feedback: "A PO soube o tamanho e o risco na mesma frase, "
                                + "e pôde decidir o que fazer com os dois.",
                            principio: "Estimativa é informação para decidir, não promessa de entrega."
                        },
                        {
                            titulo: "Dar o número que ela quer ouvir",
                            detalhe: "Três pontos, para caber na sexta",
                            avaliacao: "ruim",
                            feedback: "O número agradou e o item não coube. Na sexta "
                                + "a conversa vai ser sobre atraso, não sobre escopo.",
                            principio: "Estimativa ajustada à expectativa deixa de medir qualquer coisa."
                        },
                        {
                            titulo: "Dizer que não dá para estimar antes de investigar",
                            detalhe: "Sem número e sem prazo para o número",
                            avaliacao: "media",
                            feedback: "A recusa é honesta e deixou a PO sem nada para "
                                + "ordenar. Faltou propor o passo que produziria o número.",
                            principio: "Incerteza alta pede investigação combinada, não silêncio."
                        }
                    ]
                },
                {
                    quem: "lu",
                    fala: "Ah, uma coisa: a tela de presença depende do login ficar "
                        + "pronto antes. Ninguém falou disso ainda.",
                    pergunta: "O que você faz?",
                    opcoes: [
                        {
                            titulo: "Trazer a dependência para a mesa agora",
                            detalhe: "Antes de o plano fechar",
                            avaliacao: "boa",
                            feedback: "A ordem dos itens mudou na hora, e ninguém "
                                + "vai começar a tela para descobrir que ela não tem como abrir.",
                            principio: "Dependência descoberta no planejamento custa uma conversa; descoberta na sprint custa dias."
                        },
                        {
                            titulo: "Anotar para resolver quando chegar lá",
                            detalhe: "Problema adiado",
                            avaliacao: "ruim",
                            feedback: "O plano fechou com uma ordem impossível. O "
                                + "bloqueio vai aparecer no meio da semana como surpresa.",
                            principio: "O Sprint Backlog é o plano do time, e plano com dependência oculta não se cumpre."
                        },
                        {
                            titulo: "Assumir que dá para fazer os dois em paralelo",
                            detalhe: "Aposta sem combinar",
                            avaliacao: "media",
                            feedback: "Pode dar certo. Se não der, duas pessoas "
                                + "descobrem juntas na quinta-feira.",
                            principio: "Suposição não declarada é risco que ninguém está acompanhando."
                        }
                    ]
                }
            ],
            fechamento: {
                texto: "O plano saiu com o tamanho que a gente acredita e com a "
                    + "ordem que funciona. Dá para começar segunda sem susto.",
                principio: "O time decide quanto cabe na sprint e como o trabalho se organiza."
            }
        }
    },

    // --------------------------------------------------------------- daily

    CenaDailyScrum: {

        sm: {
            conduz: true,
            rotulo: "você facilita",
            abertura: {
                quem: "renan",
                texto: "Quinze minutos, de pé. A Daily é dos desenvolvedores; "
                    + "o nosso trabalho é garantir que ela aconteça, caiba no "
                    + "tempo e sirva à meta. Hoje quem faz isso é você, eu fico "
                    + "só olhando. O relógio no canto mostra quanto sobrou."
            }
        },

        dev: {
            abertura: {
                quem: "bia",
                texto: "Sua vez de falar hoje. Lembra: a Daily é para o time "
                    + "saber onde a meta está, não para você prestar contas."
            },
            decisoes: [
                {
                    quem: "lu",
                    fala: "E o boletim do bimestre? Preciso saber se as telas "
                        + "dele entram esta semana.",
                    pergunta: "O que você diz?",
                    opcoes: [
                        {
                            titulo: "Dizer que está parado há dois dias esperando a regra de arredondamento",
                            detalhe: "Nomeia o que trava",
                            avaliacao: "boa",
                            feedback: "O time ouviu, e a regra chegou no fim da manhã. "
                                + "Dois dias parados viraram duas horas.",
                            principio: "Impedimento dito na Daily é impedimento que o time pode remover."
                        },
                        {
                            titulo: "Dizer que está em noventa por cento",
                            detalhe: "Percentual sem conteúdo",
                            avaliacao: "ruim",
                            feedback: "Ninguém sabe o que falta, então ninguém pode "
                                + "ajudar. Amanhã o número vai ser noventa e cinco.",
                            principio: "Percentual não é informação acionável; o que falta, é."
                        },
                        {
                            titulo: "Dizer que está indo e resolver sozinho",
                            detalhe: "Problema guardado",
                            avaliacao: "media",
                            feedback: "Você pode até resolver. O time descobriu o "
                                + "risco junto com o atraso, e não antes dele.",
                            principio: "Autonomia não é isolamento: a meta é do time inteiro."
                        }
                    ]
                },
                {
                    quem: "caio",
                    fala: "Eu tô com quatro coisas abertas, acho que consigo "
                        + "fechar tudo até sexta.",
                    pergunta: "O que você faz?",
                    opcoes: [
                        {
                            titulo: "Oferecer pegar um dos itens dele",
                            detalhe: "Fluxo antes de volume",
                            avaliacao: "boa",
                            feedback: "Dois itens saíram da coluna do meio antes de "
                                + "sexta. O quadro parou de crescer para os lados.",
                            principio: "Item em progresso não entrega valor; concluir vale mais que começar."
                        },
                        {
                            titulo: "Ficar calado, é problema dele",
                            detalhe: "Cada um com o seu",
                            avaliacao: "ruim",
                            feedback: "Sexta chegou com quatro itens pela metade e a "
                                + "meta sem fechar. O resultado é do time, e ele não fechou.",
                            principio: "A meta é compromisso coletivo, não soma de tarefas individuais."
                        },
                        {
                            titulo: "Avisar o facilitador depois da reunião",
                            detalhe: "Rodeio pelo caminho",
                            avaliacao: "media",
                            feedback: "Funcionou, com um dia de atraso e uma conversa "
                                + "a mais. O assunto cabia na própria Daily.",
                            principio: "A Daily existe para o time se ajustar sem intermediário."
                        }
                    ]
                }
            ],
            fechamento: {
                texto: "Foi uma Daily de time: o que você disse mudou o que as "
                    + "outras pessoas fizeram no mesmo dia.",
                principio: "Inspeção diária só funciona com transparência sobre o que está travado."
            }
        },

        po: {
            abertura: {
                quem: "marcia",
                texto: "A gente pode assistir, mas a reunião não é nossa. "
                    + "Repara em quantas vezes vai dar vontade de falar."
            },
            decisoes: [
                {
                    quem: "caio",
                    fala: "Ó, já que você está aqui: esse campo de data, é dia "
                        + "e mês ou mês e dia? Decide aí pra gente.",
                    pergunta: "O que você faz?",
                    opcoes: [
                        {
                            titulo: "Responder rápido e devolver a reunião ao time",
                            detalhe: "Dúvida de produto, resposta de dez segundos",
                            avaliacao: "boa",
                            feedback: "A dúvida era mesmo sua, e custou dez segundos. "
                                + "A reunião seguiu sendo do time.",
                            principio: "Decisão de produto é do Product Owner, mesmo quando aparece na Daily."
                        },
                        {
                            titulo: "Aproveitar e revisar a lista de tarefas dele",
                            detalhe: "Reunião capturada",
                            avaliacao: "ruim",
                            feedback: "A Daily virou reunião de acompanhamento com a "
                                + "PO. Amanhã o time vai relatar para você de novo.",
                            principio: "A Daily é dos desenvolvedores; capturá-la destrói a autogestão."
                        },
                        {
                            titulo: "Dizer que responde depois, para não interromper",
                            detalhe: "Excesso de zelo",
                            avaliacao: "media",
                            feedback: "O time ficou bloqueado meio dia por uma "
                                + "resposta de dez segundos.",
                            principio: "Proteger o ritual não vale bloquear o trabalho."
                        }
                    ]
                },
                {
                    quem: "bia",
                    fala: "Continuo esperando o acesso à base de matrículas. É o "
                        + "segundo dia.",
                    pergunta: "O que você faz?",
                    opcoes: [
                        {
                            titulo: "Anotar e ir falar com a escola depois da reunião",
                            detalhe: "O impedimento é de fora do time",
                            avaliacao: "boa",
                            feedback: "O acesso é conversa com a secretaria, e essa "
                                + "porta é a sua. O time seguiu com a Daily.",
                            principio: "Impedimento externo se resolve com quem tem a relação, fora da reunião."
                        },
                        {
                            titulo: "Cobrar prazo do time para contornar",
                            detalhe: "Pressão no lugar de remoção",
                            avaliacao: "ruim",
                            feedback: "Ninguém contorna falta de dado com esforço. "
                                + "A cobrança só acrescentou desconforto ao bloqueio.",
                            principio: "Cobrança não remove impedimento; remove transparência."
                        },
                        {
                            titulo: "Deixar com o facilitador, não é seu papel",
                            detalhe: "Papel levado ao pé da letra",
                            avaliacao: "media",
                            feedback: "É o papel dele, sim, e a diretora atende você. "
                                + "A regra ficou acima do resultado.",
                            principio: "Papéis organizam responsabilidade; não impedem ajuda."
                        }
                    ]
                }
            ],
            fechamento: {
                texto: "Você falou duas vezes em quinze minutos, e as duas "
                    + "destravaram alguém. É mais ou menos essa a medida.",
                principio: "O Product Owner serve à Daily sem conduzi-la."
            }
        }
    },

    // -------------------------------------------------------------- review

    CenaSprintReview: {

        po: {
            conduz: true,
            rotulo: "você recebe a escola",
            abertura: {
                quem: "estela",
                texto: "Então, o que vocês conseguiram fazer nessas duas semanas?"
            }
        },

        dev: {
            abertura: {
                quem: "bia",
                texto: "Quem construiu demonstra. Deixa o professor mexer, e "
                    + "segura a vontade de explicar por cima do ombro dele."
            },
            decisoes: [
                {
                    quem: "helio",
                    fala: "Espera... eu clico onde para marcar a falta? Ah, achei. "
                        + "Não, isso apagou a chamada toda.",
                    pergunta: "O que você faz?",
                    opcoes: [
                        {
                            titulo: "Deixar ele continuar e anotar o problema",
                            detalhe: "O erro é informação",
                            avaliacao: "boa",
                            feedback: "Em dois minutos apareceram três problemas de "
                                + "uso que nenhum teste tinha pegado.",
                            principio: "A Review inspeciona o incremento com quem vai usá-lo."
                        },
                        {
                            titulo: "Pegar o teclado e mostrar o caminho certo",
                            detalhe: "Demonstração salva, problema escondido",
                            avaliacao: "ruim",
                            feedback: "A tela funcionou nas suas mãos. Na segunda-feira "
                                + "ela vai estar nas dele de novo.",
                            principio: "Software que só funciona com quem o escreveu não está pronto."
                        },
                        {
                            titulo: "Explicar que aquele botão tem outra função",
                            detalhe: "Defesa do projeto",
                            avaliacao: "media",
                            feedback: "A explicação encerrou o assunto sem resolver "
                                + "nada: o botão continua parecendo o que não é.",
                            principio: "Feedback de uso não se responde com justificativa."
                        }
                    ]
                },
                {
                    quem: "estela",
                    fala: "Já que estamos aqui, dá para deixar em vermelho o aluno "
                        + "que faltou três vezes? É rapidinho, né?",
                    pergunta: "O que você responde?",
                    opcoes: [
                        {
                            titulo: "Anotar com a PO para entrar no Product Backlog",
                            detalhe: "Pedido vira item, não tarefa",
                            avaliacao: "boa",
                            feedback: "O pedido foi registrado onde se decide ordem. "
                                + "Ninguém prometeu prazo no meio da reunião.",
                            principio: "A Review adapta o Product Backlog; o que entra e quando é decisão do PO."
                        },
                        {
                            titulo: "Dizer que faz hoje mesmo",
                            detalhe: "Compromisso por fora do plano",
                            avaliacao: "ruim",
                            feedback: "Uma segunda fila de trabalho começou aqui, "
                                + "sem passar pela sprint nem pela PO.",
                            principio: "Trabalho combinado por fora do Sprint Backlog é trabalho invisível."
                        },
                        {
                            titulo: "Dizer que não é possível",
                            detalhe: "Recusa técnica sem contexto",
                            avaliacao: "media",
                            feedback: "É possível e é barato. A recusa custou "
                                + "confiança por um item que caberia na próxima sprint.",
                            principio: "Viabilidade é conversa técnica; prioridade é decisão de produto."
                        }
                    ]
                }
            ],
            fechamento: {
                texto: "A escola viu funcionando e apontou o que incomoda. É "
                    + "disso que a próxima sprint precisa.",
                principio: "O incremento existe para ser inspecionado em uso."
            }
        },

        sm: {
            abertura: {
                quem: "renan",
                texto: "A Review é do time e da escola. Sua parte é fazer ela "
                    + "acontecer sem virar apresentação de vendas."
            },
            decisoes: [
                {
                    quem: "caio",
                    fala: "Ninguém combinou quem mostra o quê. Alguém abre o "
                        + "sistema aí?",
                    pergunta: "O que você faz?",
                    opcoes: [
                        {
                            titulo: "Combinar com o time, ali mesmo, quem demonstra cada parte",
                            detalhe: "Dois minutos antes de começar",
                            avaliacao: "boa",
                            feedback: "A reunião começou com o time sabendo o próprio "
                                + "papel, e a escola não viu a desorganização.",
                            principio: "Facilitar é criar as condições do evento, não executá-lo."
                        },
                        {
                            titulo: "Demonstrar você mesmo para garantir",
                            detalhe: "Assumir o trabalho do time",
                            avaliacao: "ruim",
                            feedback: "Correu bem e ensinou ao time que, na hora do "
                                + "aperto, alguém faz por ele.",
                            principio: "Assumir a tarefa alheia enfraquece a autogestão que se quer construir."
                        },
                        {
                            titulo: "Deixar como está, o despreparo é do time",
                            detalhe: "Lição pela exposição",
                            avaliacao: "media",
                            feedback: "A lição chegou, e o custo foi pago pela "
                                + "confiança da escola, que não fazia parte do combinado.",
                            principio: "Transparência é com o processo, não constrangimento com o cliente."
                        }
                    ]
                },
                {
                    quem: "gustavo",
                    fala: "Depois eu falo do próximo contrato com a diretora. "
                        + "Aproveita e já mostra o que vem na próxima sprint.",
                    pergunta: "O que você faz?",
                    opcoes: [
                        {
                            titulo: "Separar as duas conversas e manter a Review no que existe",
                            detalhe: "Inspeção agora, comercial depois",
                            avaliacao: "boa",
                            feedback: "A escola avaliou o que está pronto sem "
                                + "misturar com promessa. As duas conversas ficaram mais honestas.",
                            principio: "A Review inspeciona o incremento; planos futuros são adaptação, não vitrine."
                        },
                        {
                            titulo: "Mostrar as telas que ainda não existem",
                            detalhe: "Promessa apresentada como entrega",
                            avaliacao: "ruim",
                            feedback: "A diretora saiu achando que viu o boletim "
                                + "pronto. Na próxima sprint, começa devendo.",
                            principio: "Demonstrar o que não existe transforma inspeção em venda."
                        },
                        {
                            titulo: "Pedir que o dono não fale na reunião",
                            detalhe: "Barreira sem explicação",
                            avaliacao: "media",
                            feedback: "A conversa comercial é legítima e precisa "
                                + "acontecer. Só não no meio da inspeção.",
                            principio: "Cada evento tem um propósito; proteger o propósito não é excluir pessoas."
                        }
                    ]
                }
            ],
            fechamento: {
                texto: "A reunião fez o que devia: mostrou o que existe e trouxe "
                    + "o que a escola precisa. Sem discurso.",
                principio: "O facilitador cuida do propósito do evento, e não do seu conteúdo."
            }
        }
    },

    // ------------------------------------------------------- retrospective

    CenaSprintRetrospective: {

        sm: {
            conduz: true,
            rotulo: "você facilita",
            abertura: {
                quem: "renan",
                texto: "Vinte minutos, e hoje quem facilita é você. Vale mais sair "
                    + "daqui com uma coisa que a gente consiga fazer do que com "
                    + "uma lista bonita."
            }
        },

        po: {
            abertura: {
                quem: "marcia",
                texto: "A retrospectiva é do time todo, e a gente faz parte "
                    + "dele. Inclusive para ouvir o que vier na nossa direção."
            },
            decisoes: [
                {
                    quem: "bia",
                    fala: "Metade da sprint a gente trabalhou com dado inventado "
                        + "porque a base não veio. Isso é decisão de produto.",
                    pergunta: "O que você responde?",
                    opcoes: [
                        {
                            titulo: "Reconhecer e propor combinar quando o dado bloqueia o item",
                            detalhe: "Crítica aceita, acordo proposto",
                            avaliacao: "boa",
                            feedback: "A conversa virou um combinado: item sem dado "
                                + "real não entra na sprint. O time saiu com uma regra, não com um culpado.",
                            principio: "A retrospectiva inspeciona o processo para mudá-lo, não para julgar pessoas."
                        },
                        {
                            titulo: "Explicar que a escola demorou, não foi você",
                            detalhe: "Defesa",
                            avaliacao: "ruim",
                            feedback: "A explicação é verdadeira e encerrou o assunto. "
                                + "Na próxima sprint o problema volta igual.",
                            principio: "Retrospectiva que vira defesa não produz adaptação."
                        },
                        {
                            titulo: "Prometer que isso não acontece de novo",
                            detalhe: "Promessa sem mecanismo",
                            avaliacao: "media",
                            feedback: "Ninguém sabe o que vai ser diferente na "
                                + "segunda-feira. A intenção é boa e não muda nada.",
                            principio: "Melhoria sem mecanismo verificável não sobrevive ao ciclo seguinte."
                        }
                    ]
                },
                {
                    quem: "renan",
                    fala: "O time propôs limitar dois itens em progresso por "
                        + "pessoa. Você topa?",
                    pergunta: "O que você faz?",
                    opcoes: [
                        {
                            titulo: "Apoiar a ação do time e ajustar a expectativa da escola",
                            detalhe: "A mudança tem custo, e ele é seu também",
                            avaliacao: "boa",
                            feedback: "Menos itens em paralelo significa menos coisas "
                                + "prometidas ao mesmo tempo. Você assumiu essa parte.",
                            principio: "Melhoria acordada precisa de sustentação de todos os papéis."
                        },
                        {
                            titulo: "Apoiar, desde que nada atrase",
                            detalhe: "Apoio sem custo",
                            avaliacao: "ruim",
                            feedback: "Com essa condição a regra vai ser quebrada na "
                                + "primeira semana apertada, que é justamente quando ela serviria.",
                            principio: "Melhoria que só vale quando é confortável não é melhoria."
                        },
                        {
                            titulo: "Substituir pela sua própria proposta",
                            detalhe: "Ação trocada por outra",
                            avaliacao: "media",
                            feedback: "Sua proposta pode ser melhor e não é do time. "
                                + "Ninguém defende o que não escolheu.",
                            principio: "A adaptação é do time; imposta de fora, ela não é sustentada."
                        }
                    ]
                }
            ],
            fechamento: {
                texto: "Saiu uma ação com dono, e você é parte do que a sustenta.",
                principio: "Inspeção e adaptação fecham o ciclo com compromisso, não com lista."
            }
        },

        dev: {
            abertura: {
                quem: "bia",
                texto: "Aqui a gente fala do processo, não das pessoas. E fala "
                    + "do que dói, senão a reunião não serve para nada."
            },
            decisoes: [
                {
                    quem: "renan",
                    fala: "O que atrapalhou vocês nesta sprint?",
                    pergunta: "O que você traz?",
                    opcoes: [
                        {
                            titulo: "O atalho do módulo de presença, que já custou dois retrabalhos",
                            detalhe: "Débito técnico com efeito medido",
                            avaliacao: "boa",
                            feedback: "O débito saiu da cabeça de quem o criou e virou "
                                + "assunto do time, com dois exemplos concretos.",
                            principio: "Débito técnico é decisão do time quando é visível; é dívida oculta quando não é."
                        },
                        {
                            titulo: "Nada, foi uma sprint normal",
                            detalhe: "Silêncio confortável",
                            avaliacao: "ruim",
                            feedback: "O atalho continua lá, e o próximo retrabalho "
                                + "vai parecer azar em vez de consequência.",
                            principio: "Sem transparência não há o que inspecionar."
                        },
                        {
                            titulo: "Que o prazo era curto demais desde o começo",
                            detalhe: "Causa fora do alcance do time",
                            avaliacao: "media",
                            feedback: "Pode ser verdade e não dá o que fazer na "
                                + "segunda-feira. A retrospectiva precisa de algo que o time controle.",
                            principio: "A melhoria começa pelo que está ao alcance do próprio time."
                        }
                    ]
                },
                {
                    quem: "caio",
                    fala: "Então bora pagar todo o débito na próxima sprint, "
                        + "reescrever aquilo inteiro.",
                    pergunta: "O que você responde?",
                    opcoes: [
                        {
                            titulo: "Propor uma fatia: só a parte que causou os retrabalhos",
                            detalhe: "Cabe na sprint e dá para verificar",
                            avaliacao: "boa",
                            feedback: "A ação entrou no plano com tamanho conhecido, "
                                + "e dá para saber na próxima retrospectiva se funcionou.",
                            principio: "Poucas melhorias por ciclo, verificáveis, é o que torna a adaptação real."
                        },
                        {
                            titulo: "Concordar com a reescrita inteira",
                            detalhe: "Melhoria maior que a sprint",
                            avaliacao: "ruim",
                            feedback: "A reescrita não cabe, então ela não começa. O "
                                + "débito segue igual com uma decisão a mais nas costas.",
                            principio: "Ação que não cabe no ciclo seguinte não é adaptação, é intenção."
                        },
                        {
                            titulo: "Deixar a decisão para a PO",
                            detalhe: "Decisão técnica delegada para fora",
                            avaliacao: "media",
                            feedback: "Como o débito é interno ao código, a PO não tem "
                                + "como ordenar isso. A decisão volta para vocês na semana que vem.",
                            principio: "Qualidade interna é responsabilidade dos desenvolvedores."
                        }
                    ]
                }
            ],
            fechamento: {
                texto: "O que você trouxe virou uma ação do tamanho de uma "
                    + "sprint. É assim que o processo muda.",
                principio: "Inspeção e adaptação fecham o ciclo: a sprint seguinte começa diferente."
            }
        }
    }
};
