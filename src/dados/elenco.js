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
        x: 440,
        y: 466,
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
        x: 600,
        y: 466,
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
        x: 80,
        y: 316,
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
        x: 230,
        y: 316,
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
        x: 155,
        y: 466,
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
        x: 754,
        y: 466,
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
        x: 765,
        y: 312,
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
        x: 818,
        y: 312,
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
        x: 871,
        y: 312,
        expressoes: ["neutro", "tenso"],
        falas: [
            "Sei que estão esperando a base de matrículas.",
            "Não é má vontade minha. São dados de criança, e quem assina embaixo se algo vazar sou eu."
        ]
    }
];

// Layout do escritório
//
// Tudo em pixels da tela, com os sprites na escala 2. O ponto (x, y) de
// pessoas, mesas e decoração é o meio da base: é por ele que a profundidade
// e as colisões são calculadas. Produto e processo ficam à esquerda, o time
// de desenvolvimento no centro, a recepção e a mesa do dono à direita, sem
// divisória entre as áreas.

export const ESCALA_DO_ESCRITORIO = 2;

// Altura da parede: abaixo dela começa o piso, onde se anda
export const FIM_DA_PAREDE = 150;

// Mesas e o que fica em cima de cada uma ("dx" a partir do meio da mesa)
export const MESAS = [
    {x: 440, y: 402, objetos: [{imagem: "mesa_papeis", dx: -42}]},
    {x: 600, y: 402, objetos: [{imagem: "mesa_ampulheta", dx: 40}, {imagem: "planta_pequena", dx: -40}]},
    {x: 80, y: 252, objetos: [{imagem: "mesa_monitor_e_livro", dx: 42}]},
    {x: 230, y: 252, objetos: [{imagem: "mesa_cafe_e_post_its", dx: 36}]},
    {x: 155, y: 402, objetos: [{imagem: "mesa_mochila_e_tablet", dx: -42}, {imagem: "planta_pequena", dx: 42}]},
    {x: 860, y: 446, imagem: "mesa_do_dono", largura: 120, objetos: [{imagem: "planta_pequena", dx: 44}]}
];

// Decoração: na parede, só imagem; no piso, "solido" vira obstáculo
export const DECORACOES = [
    {imagem: "janela", x: 130, y: 128, naParede: true},
    {imagem: "relogio", x: 268, y: 96, naParede: true},
    {imagem: "porta", x: 830, y: 150, naParede: true},
    {imagem: "planta_grande", x: 330, y: 236, solido: true},
    {imagem: "bebedouro", x: 940, y: 236, solido: true},
    {imagem: "poltrona", x: 765, y: 244, solido: true},
    {imagem: "mesinha", x: 818, y: 236, solido: true},
    {imagem: "poltrona", x: 871, y: 244, solido: true},
    {imagem: "planta_grande", x: 30, y: 506, solido: true},
    {imagem: "planta_grande", x: 690, y: 506, solido: true}
];

// Todas as imagens que o escritório usa, para a cena de carregamento
export function imagensDoEscritorio() {
    const nomes = ["mesa"];
    DECORACOES.forEach(function (deco) {
        nomes.push(deco.imagem);
    });
    MESAS.forEach(function (mesa) {
        nomes.push(mesa.imagem || "mesa");
        mesa.objetos.forEach(function (objeto) {
            nomes.push(objeto.imagem);
        });
    });
    OBJETOS.forEach(function (objeto) {
        nomes.push(objeto.imagem);
    });
    return nomes.filter(function (nome, indice) {
        return nomes.indexOf(nome) === indice;
    });
}

// Objetos de cenário com interação própria: ficam na parede, e o jogador
// interage com eles do piso logo abaixo
export const OBJETOS = [
    {
        chave: "quadro_parede",
        imagem: "quadro_grande",
        nome: "Quadro da parede",
        papel: "Cenário",
        cor: "#5f7ba8",
        x: 470,
        y: 140,
        cena: "CenaKanban"
    },
    {
        chave: "agenda_parede",
        imagem: "agenda_parede",
        nome: "Agenda da sprint",
        papel: "Cenário",
        cor: "#5f7ba8",
        x: 680,
        y: 140,
        cena: "CenaAgenda"
    }
];
