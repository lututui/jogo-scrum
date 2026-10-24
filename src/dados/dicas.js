// Dicas de primeira vez
//
// O que saiu do guia de entrada aparece na hora em que importa, uma vez por
// partida: o quadro, na primeira vez que o jogador abre o quadro; medidores e
// pontos, na primeira volta ao escritório depois de uma decisão. "porCadeira"
// completa o texto conforme a cadeira; marcadores como em dados/texto.js.

export const DICAS = {
    quadro: {
        titulo: "O quadro",
        texto: "Cada cartão é um item de trabalho, e a coluna diz em que etapa ele "
            + "está: A FAZER, EM PROGRESSO, REVISÃO e CONCLUÍDO. Os cartões andam "
            + "uma coluna por vez, para a frente, e EM PROGRESSO e REVISÃO têm "
            + "limite. Só a revisão volta, quando algo precisa ser refeito.\n\n"
            + "O time trabalha um pouco a cada dia, e item grande demora mais.",
        porCadeira: {
            po: "Na cadeira de Product Owner você acompanha o quadro: quem move os "
                + "cartões é o time de desenvolvimento.",
            sm: "Na cadeira de Scrum Master você acompanha o quadro: quem move os "
                + "cartões é o time de desenvolvimento.",
            dev: "Na cadeira de {Desenvolvedor|Desenvolvedora}, um cartão do Sprint "
                + "Backlog é seu: você o move, uma coluna por dia, e ele só sai de "
                + "EM PROGRESSO com o trabalho feito."
        }
    },
    medidores: {
        titulo: "Medidores e pontos",
        texto: "No alto da tela, três medidores mostram como a sprint vai: valor "
            + "entregue, confiança do cliente e saúde do time. As decisões que você "
            + "tomou já mexeram neles: sobem quando a decisão segue o princípio e "
            + "descem quando não segue.\n\n"
            + "Cada decisão também vale pontos: mais quando segue o princípio, menos "
            + "quando tem custo, nenhum quando vai contra. As tomadas sem o mentor "
            + "por perto valem o dobro. No fim da sprint, a síntese mostra o que "
            + "você decidiu e as conquistas."
    }
};
