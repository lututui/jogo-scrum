// Glossário
//
// Termos que o jogo usa sem explicar. Cada um diz de onde vem a definição,
// para que o texto do jogo seja rastreável às referências do trabalho.
//
// No Scrum Guide 2020, a meta da sprint e a Definition of Done são os
// compromissos do Sprint Backlog e do incremento, e não artefatos.

const GUIA = "Schwaber e Sutherland (2020)";
const KANBAN = "Anderson (2010)";
const MANIFESTO = "Beck et al. (2001)";
const PRATICA = "uso corrente em times de software; não definido no Scrum Guide";

export const GRUPOS = {
    framework: "FRAMEWORK",
    pilar: "PILAR",
    principio: "PRINCÍPIO ÁGIL",
    papel: "PAPEL",
    evento: "EVENTO",
    artefato: "ARTEFATO",
    compromisso: "COMPROMISSO",
    fluxo: "FLUXO",
    pratica: "PRÁTICA"
};

export const GLOSSARIO = [
    {
        termo: "Scrum",
        grupo: "framework",
        definicao: "Framework leve para gerar valor em problemas complexos por "
            + "meio de soluções adaptativas. O trabalho é feito em sprints, "
            + "inspecionado com frequência e ajustado conforme o que se aprende.",
        fonte: GUIA
    },
    {
        termo: "Transparência",
        grupo: "pilar",
        definicao: "Um dos três pilares do Scrum, ao lado da inspeção e da "
            + "adaptação. O trabalho e os problemas precisam estar visíveis para "
            + "quem decide; sem isso, a inspeção engana e a adaptação erra o alvo.",
        fonte: GUIA
    },
    {
        termo: "Autogestão",
        grupo: "framework",
        definicao: "O time decide internamente quem faz o quê, quando e como. "
            + "Ninguém de fora, nem o Scrum Master, decide por ele; compromisso "
            + "assumido no lugar do time enfraquece essa capacidade.",
        fonte: GUIA
    },
    {
        termo: "Ritmo sustentável",
        grupo: "principio",
        definicao: "Princípio do Manifesto Ágil: quem patrocina, desenvolve e "
            + "usa deve conseguir manter um ritmo constante indefinidamente. "
            + "Hora extra como plano esconde que o trabalho não cabe na sprint.",
        fonte: MANIFESTO
    },
    {
        termo: "Sprint",
        grupo: "evento",
        definicao: "Período de duração fixa, de um mês ou menos, em que um "
            + "incremento é criado. Contém todos os outros eventos, e a próxima "
            + "começa assim que a anterior termina. No jogo, dura duas semanas.",
        fonte: GUIA
    },
    {
        termo: "Meta da sprint",
        grupo: "compromisso",
        definicao: "O único objetivo da sprint, definido pelo time no Sprint "
            + "Planning. Dá coerência ao trabalho e deixa claro o que pode ser "
            + "cortado sem perder o sentido do que se entrega.",
        fonte: GUIA
    },
    {
        termo: "Product Owner",
        grupo: "papel",
        definicao: "Responde por maximizar o valor do produto e por gerenciar o "
            + "Product Backlog: ordena os itens, explica o que cada um significa "
            + "e propõe a meta da sprint. É uma pessoa, não um comitê.",
        fonte: GUIA
    },
    {
        termo: "Scrum Master",
        grupo: "papel",
        definicao: "Responde pela aplicação do Scrum. Ajuda o time a se "
            + "autogerenciar, faz os impedimentos serem removidos e garante que "
            + "os eventos aconteçam, sejam produtivos e caibam no tempo.",
        fonte: GUIA
    },
    {
        termo: "Desenvolvedores",
        grupo: "papel",
        definicao: "As pessoas do time que criam o incremento a cada sprint. "
            + "Estimam o trabalho, selecionam os itens do Sprint Backlog com o "
            + "Product Owner, fazem o plano e respondem pela qualidade.",
        fonte: GUIA
    },
    {
        termo: "Sprint Planning",
        grupo: "evento",
        definicao: "Abre a sprint. O time define por que a sprint vale a pena "
            + "(a meta), o que entra nela (os itens) e como o trabalho será "
            + "feito (o plano).",
        fonte: GUIA
    },
    {
        termo: "Daily Scrum",
        grupo: "evento",
        definicao: "Reunião de quinze minutos dos desenvolvedores, todos os "
            + "dias, para inspecionar o progresso rumo à meta e ajustar o plano "
            + "do dia. Não é relatório de status para ninguém.",
        fonte: GUIA
    },
    {
        termo: "Sprint Review",
        grupo: "evento",
        definicao: "O time mostra o resultado da sprint a quem tem interesse "
            + "no produto e, juntos, decidem o que fazer a seguir. É uma sessão "
            + "de trabalho, não uma apresentação de vendas.",
        fonte: GUIA
    },
    {
        termo: "Sprint Retrospective",
        grupo: "evento",
        definicao: "Fecha a sprint. O time olha para pessoas, interações, "
            + "processo e ferramentas, e escolhe as melhorias que farão a "
            + "próxima sprint diferente.",
        fonte: GUIA
    },
    {
        termo: "Product Backlog",
        grupo: "artefato",
        definicao: "Lista ordenada de tudo o que pode melhorar o produto. "
            + "Muda o tempo todo, e quem decide a ordem é o Product Owner.",
        fonte: GUIA
    },
    {
        termo: "Sprint Backlog",
        grupo: "artefato",
        definicao: "A meta da sprint, os itens escolhidos para alcançá-la e o "
            + "plano para entregá-los. É dos desenvolvedores e é atualizado ao "
            + "longo da sprint.",
        fonte: GUIA
    },
    {
        termo: "Incremento",
        grupo: "artefato",
        definicao: "Resultado concreto e utilizável de uma sprint, somado a "
            + "tudo o que já foi entregue. Só conta como incremento o que atende "
            + "à Definition of Done.",
        fonte: GUIA
    },
    {
        termo: "Definition of Done",
        grupo: "compromisso",
        definicao: "Descrição do que é preciso para um item estar pronto de "
            + "verdade. Item que não a atende não é entregue nem mostrado na "
            + "Sprint Review.",
        fonte: GUIA
    },
    {
        termo: "Impedimento",
        grupo: "pratica",
        definicao: "Qualquer coisa que trava o progresso do time rumo à meta, "
            + "como um acesso que não chega ou uma decisão que ninguém toma. "
            + "Fazer impedimentos serem removidos é parte do papel do Scrum Master.",
        fonte: GUIA
    },
    {
        termo: "Capacidade",
        grupo: "pratica",
        definicao: "Quanto trabalho os desenvolvedores acreditam conseguir "
            + "concluir na sprint, levando em conta disponibilidade e "
            + "desempenho passado. No jogo, é medida em pontos.",
        fonte: GUIA
    },
    {
        termo: "Quadro Kanban",
        grupo: "fluxo",
        definicao: "Quadro em colunas que mostra em que etapa cada item está, "
            + "como A FAZER, EM PROGRESSO, REVISÃO e CONCLUÍDO. Torna o fluxo "
            + "visível para o time inteiro.",
        fonte: KANBAN
    },
    {
        termo: "Limite de WIP",
        grupo: "fluxo",
        definicao: "WIP é o trabalho em progresso. O limite é o número máximo "
            + "de itens numa coluna ao mesmo tempo, para que o time termine o "
            + "que começou antes de começar mais.",
        fonte: KANBAN
    },
    {
        termo: "Débito técnico",
        grupo: "pratica",
        definicao: "Atalho no código que acelera agora e cobra depois, em "
            + "retrabalho ou em defeitos. Escondê-lo faz a conta crescer; "
            + "torná-lo visível permite decidir quando pagar.",
        fonte: PRATICA
    },
    {
        termo: "Tipos de item",
        grupo: "pratica",
        definicao: "FEATURE é uma funcionalidade nova. BUG é um defeito. "
            + "CHORE é uma tarefa técnica necessária, sem efeito visível para o "
            + "usuário. SPIKE é uma investigação curta para reduzir incerteza "
            + "antes de estimar.",
        fonte: PRATICA
    }
];
