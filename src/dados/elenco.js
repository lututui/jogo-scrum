// Dados do elenco presente na cena do escritório
//
// "expressoes" acompanha "falas" na mesma ordem: uma expressão de retrato
// por fala (neutro, tenso ou aprovacao).

export const ELENCO = [
    {
        chave: "marcia",
        nome: "Márcia",
        papel: "Product Owner",
        cor: "#c0392b",
        x: 180,
        y: 252,
        expressoes: ["aprovacao", "tenso", "neutro"],
        falas: [
            "Chegou cedo, {nome}. Boa.",
            "Anotei quatorze pedidos na reunião com a diretora. Estão todos na mesma folha, fora de ordem, e dois são a mesma coisa escrita diferente.",
            "A partir de hoje quem ordena essa lista é você. Eu fico junto, mas não decido no seu lugar."
        ]
    },
    {
        chave: "renan",
        nome: "Renan",
        papel: "Scrum Master",
        cor: "#1f6f8b",
        x: 380,
        y: 252,
        expressoes: ["aprovacao", "neutro", "neutro"],
        falas: [
            "Bom te ver por aqui, {nome}.",
            "A sprint começa amanhã e dura duas semanas. Dez dias úteis, uma meta só.",
            "Se em algum momento você não souber o que uma palavra significa, pergunta. Ninguém aqui nasceu sabendo o que é Product Backlog."
        ]
    },
    {
        chave: "bia",
        nome: "Bia",
        papel: "Desenvolvedora sênior",
        cor: "#7a4bb5",
        x: 580,
        y: 252,
        expressoes: ["neutro", "neutro", "tenso"],
        falas: [
            "Você é {o|a} aprendiz, né?",
            "Vou te dizer uma coisa agora para economizar discussão depois: aqui, item entregue é item que funciona do começo ao fim.",
            "Meia tela bonita não conta."
        ]
    },
    {
        chave: "caio",
        nome: "Caio",
        papel: "Desenvolvedor",
        cor: "#e08a3c",
        x: 780,
        y: 252,
        expressoes: ["aprovacao", "aprovacao", "aprovacao"],
        falas: [
            "Opa! Bem-{vindo|vinda}.",
            "Tô montando o lançamento de presença. Já tá quase pronto, só falta juntar as partes.",
            "Quase pronto mesmo. Uns dois dias."
        ]
    },
    {
        chave: "lu",
        nome: "Lu",
        papel: "Design e desenvolvimento",
        cor: "#8795a8",
        x: 180,
        y: 432,
        expressoes: ["aprovacao", "neutro", "tenso"],
        falas: [
            "Oi! Desculpa a bagunça da mesa.",
            "Eu fico só meio período neste contrato. O resto do tempo estou no outro cliente.",
            "Se eu sumir de repente no meio da semana, não é falta de educação."
        ]
    },
    {
        chave: "gustavo",
        nome: "Gustavo",
        papel: "Dono da Catavento",
        cor: "#6b7a90",
        x: 380,
        y: 432,
        expressoes: ["aprovacao", "neutro", "aprovacao"],
        falas: [
            "Ah, o pessoal do programa de aprendizagem. Que bom.",
            "Olha, esse contrato da escola é importante para a casa. Se a diretora ficar satisfeita, tem renovação.",
            "Qualquer coisa que ela pedir, a gente dá um jeito. Sempre deu."
        ]
    },
    {
        chave: "estela",
        nome: "Estela",
        papel: "Diretora da escola",
        cor: "#c9a96a",
        teste: true,
        x: 900,
        y: 180,
        expressoes: ["neutro", "tenso"],
        falas: [
            "Então é aqui que o sistema está sendo feito.",
            "Vim conhecer o lugar e repetir uma data: em fevereiro as aulas começam, com ou sem sistema pronto."
        ]
    },
    {
        chave: "helio",
        nome: "Hélio",
        papel: "Professor",
        cor: "#3f7a52",
        teste: true,
        x: 900,
        y: 300,
        expressoes: ["neutro", "tenso"],
        falas: [
            "Vim junto com a diretora, mas quero falar de outra coisa.",
            "Para marcar uma falta hoje eu preciso de seis cliques. Seis. Multiplica por trinta e duas turmas na semana."
        ]
    },
    {
        chave: "sandra",
        nome: "Sandra",
        papel: "Secretaria da escola",
        cor: "#a87fc4",
        teste: true,
        x: 900,
        y: 420,
        expressoes: ["neutro", "tenso"],
        falas: [
            "Sei que estão esperando a base de matrículas.",
            "Não é má vontade minha. São dados de criança, e quem assina embaixo se algo vazar sou eu."
        ]
    }
];

// Mesas do escritório: pontos onde o sprite de mesa é posicionado
export const MESAS = [
    {x: 180, y: 200},
    {x: 380, y: 200},
    {x: 580, y: 200},
    {x: 780, y: 200},
    {x: 180, y: 380},
    {x: 380, y: 380},
    {x: 580, y: 380},
    {x: 780, y: 380}
];

// Objetos de cenário com interação própria
export const OBJETOS = [
    {
        chave: "quadro_parede",
        nome: "Quadro da parede",
        papel: "Cenário",
        cor: "#5f7ba8",
        x: 480,
        y: 84,
        cena: "CenaKanban"
    },
    {
        chave: "agenda_parede",
        nome: "Agenda da sprint",
        papel: "Cenário",
        cor: "#5f7ba8",
        x: 620,
        y: 82,
        cena: "CenaAgenda"
    }
];
