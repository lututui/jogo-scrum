// Boas-vindas do mentor
//
// No dia 1 de cada cadeira, antes do Sprint Planning, o mentor sai do lugar,
// vai até o jogador, diz o que acontece hoje e onde ir, e volta. Na primeira
// cadeira ele se apresenta; nas seguintes, o jogador já conhece o time e a
// conversa é curta. Marcadores como em dados/texto.js.

const N = "neutro";
const A = "aprovacao";

export const BOAS_VINDAS = {
    po: {
        primeira: {
            falas: [
                "Bem-{vindo|vinda}, {nome}! Hoje você senta comigo, na cadeira de Product Owner.",
                "Daqui a pouco tem Sprint Planning. É lá que a gente escolhe a meta da sprint e o que entra nela, e quem propõe é você.",
                "A agenda fica na parede, à direita do quadro: ela abre a reunião quando você quiser. Antes, se quiser, conversa com o time e dá uma olhada no quadro."
            ],
            expressoes: [A, N, N]
        },
        seguinte: {
            falas: [
                "Agora é comigo, {nome}: nesta sprint você é {o|a} Product Owner.",
                "Hoje tem Sprint Planning, e quem propõe a meta é você. A agenda, na parede, abre a reunião quando você quiser."
            ],
            expressoes: [A, N]
        }
    },
    sm: {
        primeira: {
            falas: [
                "Oi, {nome}! Hoje você fica comigo, na cadeira de Scrum Master.",
                "A sprint começa hoje, com o Sprint Planning. A gente não decide o que entra: cuida para a conversa andar e para ninguém sair de lá sem meta.",
                "A agenda fica na parede, à direita do quadro: ela abre a reunião quando você quiser. Antes, se quiser, conversa com o pessoal e dá uma olhada no quadro."
            ],
            expressoes: [A, N, N]
        },
        seguinte: {
            falas: [
                "Agora você senta comigo, {nome}, na cadeira de Scrum Master.",
                "Hoje tem Sprint Planning. A gente facilita; quem decide é o time. A agenda, na parede, abre a reunião quando você quiser."
            ],
            expressoes: [A, N]
        }
    },
    dev: {
        primeira: {
            falas: [
                "Então você é {o|a} aprendiz. Hoje você senta comigo, na cadeira de {Desenvolvedor|Desenvolvedora}.",
                "No Sprint Planning de hoje você estima o trabalho com o time. E um dos cartões do quadro vai ser seu: quem move ele é você.",
                "A agenda fica na parede, à direita do quadro: ela abre a reunião quando você quiser. Antes, se quiser, conversa com o pessoal e olha o quadro."
            ],
            expressoes: [N, N, N]
        },
        seguinte: {
            falas: [
                "Agora você senta comigo, {nome}, na cadeira de {Desenvolvedor|Desenvolvedora}.",
                "No Planning você estima com a gente, e um cartão do quadro vai ser seu. A agenda, na parede, abre a reunião quando você quiser."
            ],
            expressoes: [N, N]
        }
    }
};
