// Guia introdutório (RF09)
//
// O mínimo de Scrum e de controles para começar a jogar. Os termos que
// aparecem aqui sem explicação estão no glossário.
//
// O guia vem antes do editor de personagem, então não usa nome nem marca de
// gênero do jogador: "Boas-vindas", e a cadeira de desenvolvimento é "Dev".
//
// Na primeira partida neste navegador, só aparecem as páginas de "entrada";
// o resto o jogador aprende no caminho (o mentor na chegada, as dicas de
// dados/dicas.js) e encontra completo pelo menu ou pela tecla H.

export const GUIA = [
    {
        titulo: "Boas-vindas à Catavento Software",
        entrada: true,
        texto: "A Catavento é uma software house pequena, contratada pela "
            + "Escola Machado de Assis para construir um diário de classe "
            + "digital: chamada, notas e boletim.\n\n"
            + "Você chega como aprendiz. O time trabalha com Scrum, e o seu "
            + "trabalho é viver uma sprint de dentro, tomando as decisões que "
            + "cada papel toma."
    },
    {
        titulo: "Três cadeiras, um mentor em cada",
        entrada: true,
        texto: "A cada sprint você ocupa uma cadeira do time: Product Owner, "
            + "Scrum Master ou Dev.\n\n"
            + "Quem exerce aquele papel senta ao seu lado como mentor: Márcia "
            + "na de Product Owner, Renan na de Scrum Master e Bia na de "
            + "Dev. O mentor orienta e comenta, mas a decisão é "
            + "sempre sua.\n\n"
            + "O jogo completo pede as três cadeiras: a mesma sprint muda de "
            + "forma conforme o lugar de onde você a vê."
    },
    {
        titulo: "Uma sprint, quatro eventos",
        entrada: true,
        texto: "A sprint dura duas semanas e segue sempre a mesma ordem:\n\n"
            + "1. Sprint Planning: o time define a meta e o que entra na sprint.\n"
            + "2. Daily Scrum: quinze minutos para os desenvolvedores se "
            + "ajustarem.\n"
            + "3. Sprint Review: o time mostra à escola o que ficou pronto.\n"
            + "4. Sprint Retrospective: o time escolhe o que melhorar.\n\n"
            + "Entre um evento e outro, imprevistos acontecem: um pedido da "
            + "diretora, um bug, um colega travado. Nessas horas o mentor não "
            + "está por perto.\n\n"
            + "No escritório, o mentor da sua cadeira vem receber você e "
            + "mostra por onde começar."
    },
    {
        titulo: "O quadro e os três medidores",
        texto: "O quadro Kanban na parede mostra em que etapa cada item está. "
            + "Os cartões andam uma coluna por vez, para a frente, e cada "
            + "coluna tem um limite. Só a revisão volta, quando algo precisa "
            + "ser refeito. O time trabalha um pouco a cada dia, e item grande "
            + "demora mais. Na cadeira de Dev você move o seu cartão, uma coluna "
            + "por dia, e ele só sai de EM PROGRESSO com o trabalho feito; nas "
            + "outras você acompanha o quadro.\n\n"
            + "No alto da tela, três medidores mostram como a sprint vai: "
            + "valor entregue, confiança do cliente e saúde do time. Cada "
            + "decisão mexe em um ou mais deles, para cima quando segue o "
            + "princípio e para baixo quando não segue."
    },
    {
        titulo: "Como jogar",
        texto: "Setas ou WASD andam pelo escritório. ENTER conversa com as "
            + "pessoas e abre o que está na parede.\n\n"
            + "A agenda, à direita do quadro, é o calendário da sprint: ela "
            + "abre o que vem a seguir, reunião ou imprevisto, e assim o dia "
            + "avança. Entre um e outro, dá para ver o quadro e conversar. Nas "
            + "reuniões, as setas escolhem a resposta e ENTER confirma.\n\n"
            + "G abre o glossário em qualquer tela, para consultar um termo "
            + "sem perder o lugar, e O abre as configurações, com o volume "
            + "da música, dos efeitos e das vozes. A cadeira se escolhe no "
            + "começo da partida e de novo a cada sprint terminada."
    },
    {
        titulo: "Pontos e conquistas",
        texto: "Cada decisão é comparada a um princípio do Scrum e recebe "
            + "pontos: mais quando segue o princípio, menos quando tem custo, "
            + "nenhum quando vai contra. As decisões tomadas sem o mentor por "
            + "perto valem o dobro.\n\n"
            + "As conquistas marcam condutas, como proteger a meta ou tornar "
            + "um problema visível, e não quantidade.\n\n"
            + "No fim de cada sprint, uma síntese mostra o que você decidiu. "
            + "Este guia pode ser revisto pela tecla H na escolha de cadeira."
    }
];
