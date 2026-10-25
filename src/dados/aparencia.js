// Aparência do jogador
//
// Espelha tools/sprites: as peças, a ordem das camadas e as regras de cor
// precisam ser as mesmas do gerador, senão o jogador montado no jogo deixa
// de bater com o desenho de referência.

// cor que o jogo troca em cada folha: a primeira para a primeira categoria
// da peça, a segunda para a segunda
export const MARCADORES = ["#ff00ff", "#00ffff"];

// peça -> categorias de cor, na ordem dos marcadores; sem categoria, a peça
// tem cor fixa. As depois da jaqueta são desbloqueáveis (dados/desbloqueios.js)
export const PECAS_DE_CIMA = {
    camiseta: ["superior"],
    moletom: ["superior"],
    jaqueta: ["superior", "interna"],
    meio_a_meio: ["superior", "interna"],
    colete: ["superior"],
    camiseta_alvo: ["superior"],
    camiseta_visto: ["superior"],
    camiseta_post_it: ["superior"],
    camiseta_catavento: []
};

// o que cada cor pinta, quando não é "primária" e "secundária"
export const ROTULOS_DAS_CORES = {
    meio_a_meio: ["Cor da esquerda", "Cor da direita"],
    colete: ["Cor da camiseta"],
    camiseta_alvo: ["Cor da camiseta"],
    camiseta_visto: ["Cor da camiseta"],
    camiseta_post_it: ["Cor da camiseta"]
};

export const PECAS_DE_BAIXO = {
    calca: ["inferior"],
    shorts: ["inferior"],
    saia_curta: ["inferior"],
    saia_longa: ["inferior"]
};

// as saias vão por cima da peça de cima, que entra por dentro delas
export const POR_CIMA_DO_TORSO = ["saia_curta", "saia_longa"];
export const POR_DENTRO_DA_SAIA = Object.keys(PECAS_DE_CIMA).filter(function (nome) {
    return nome !== "jaqueta";
});

// óculos de cor fixa, no lugar da cor da armação
export const OCULOS_CRISTAL = "cristal";

export const ACESSORIOS = ["fone"];

export const ESTILOS_DE_CABELO = [
    "curto_liso", "franja_reta", "raspado", "coque_alto",
    "coque_baixo", "topete", "rabo_cavalo"
];

// ------------------------------------------------------------------
// catálogo do editor

// do mais claro ao mais escuro: dois claros, um médio e três escuros. A pele
// fica só nestes tons, sem seletor livre; mais escuro que o último, os olhos
// deixam de aparecer
export const TONS_DE_PELE = [
    "#f1d3bb",
    "#e8c09a",
    "#dcab85",
    "#b07a50",
    "#96633f",
    "#7d4f31"
];

const CORES_DE_ROUPA = [
    {nome: "Branco", cor: "#f4f6fa"},
    {nome: "Cinza-claro", cor: "#aab4c4"},
    {nome: "Cinza-azulado", cor: "#6b7a90"},
    {nome: "Azul-petróleo", cor: "#1f6f8b"},
    {nome: "Verde-escuro", cor: "#3f7a52"},
    {nome: "Vermelho", cor: "#c0392b"},
    {nome: "Laranja", cor: "#e08a3c"},
    {nome: "Bege", cor: "#c9a96a"},
    {nome: "Roxo", cor: "#7a4bb5"},
    {nome: "Lilás", cor: "#a87fc4"}
];

// as cores sugeridas de cada categoria; todas também têm o seletor livre
export const CORES_PADRAO = {
    cabelo: [
        {nome: "Loiro", cor: "#d9bb6e"},
        {nome: "Castanho", cor: "#5d3a20"},
        {nome: "Grisalho", cor: "#b6b3ac"},
        {nome: "Preto", cor: "#171320"},
        {nome: "Ruivo", cor: "#a8452a"}
    ],
    superior: CORES_DE_ROUPA,
    interna: CORES_DE_ROUPA,
    inferior: [{nome: "Azul-marinho", cor: "#39465c"}].concat(CORES_DE_ROUPA),
    oculos: [
        {nome: "Cinza", cor: "#7b88a5"},
        {nome: "Preto", cor: "#2b3348"},
        {nome: "Marrom", cor: "#8a5f3c"},
        {nome: "Vermelho", cor: "#c0392b"}
    ]
};

// o avatar de antes do editor, para onde o RESET volta; oculos é a cor da
// armação, "cristal" ou null, sem óculos; acessorio é "fone" ou null
export const APARENCIA_PADRAO = {
    pele: "#dcab85",
    estiloDeCabelo: "curto_liso",
    cabelo: "#5d3a20",
    pecaDeCima: "camiseta",
    superior: "#f4f6fa",
    interna: "#aab4c4",
    pecaDeBaixo: "calca",
    inferior: "#39465c",
    oculos: null,
    acessorio: null
};

// regra de contraste da sobrancelha, a mesma de tools/sprites/rosto.py
export const SOBRANCELHA = {
    contorno: "#2b3348",
    clara: "#e8edf5",
    limiarDeContraste: 45,
    amostraX: 13,
    amostraY: 8
};

export const MEDIDAS = {
    largura: 32,
    altura: 32,
    quadros: 3,
    recorteDoRetrato: {x: 7, y: 0, largura: 18, altura: 24},
    escalaDoRetrato: 4
};

// nomes das folhas em assets/camadas, como tools/sprites/camadas.py gera
export function folhasDeCamada(expressoes) {
    const folhas = ["corpo", "oculos", "oculos_cristal", "fone", "cracha"];

    Object.keys(PECAS_DE_BAIXO).forEach(function (nome) {
        folhas.push("inferior_" + nome);
    });
    Object.keys(PECAS_DE_CIMA).forEach(function (nome) {
        folhas.push("superior_" + nome);
    });
    POR_DENTRO_DA_SAIA.forEach(function (nome) {
        folhas.push("superior_" + nome + "_por_dentro");
    });
    ESTILOS_DE_CABELO.forEach(function (estilo) {
        folhas.push("cabelo_" + estilo);
    });
    expressoes.forEach(function (expressao) {
        folhas.push("olhos_" + expressao);
    });

    return folhas;
}

// folhas das duas peças, de baixo para cima, com as categorias de cor
export function ordemDasPecas(aparencia) {
    const cima = {
        folha: "superior_" + aparencia.pecaDeCima,
        categorias: PECAS_DE_CIMA[aparencia.pecaDeCima]
    };
    const baixo = {
        folha: "inferior_" + aparencia.pecaDeBaixo,
        categorias: PECAS_DE_BAIXO[aparencia.pecaDeBaixo]
    };

    if (POR_CIMA_DO_TORSO.indexOf(aparencia.pecaDeBaixo) < 0) {
        return [baixo, cima];
    }
    if (POR_DENTRO_DA_SAIA.indexOf(aparencia.pecaDeCima) >= 0) {
        cima.folha += "_por_dentro";
    }
    return [cima, baixo];
}
