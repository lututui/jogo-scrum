// Aparência do jogador
//
// Espelha tools/sprites: as peças, a ordem das camadas e as regras de cor
// precisam ser as mesmas do gerador, senão o jogador montado no jogo deixa
// de bater com o desenho de referência.

// cor que o jogo troca em cada folha: a primeira para a primeira categoria
// da peça, a segunda para a segunda
export const MARCADORES = ["#ff00ff", "#00ffff"];

// peça -> categorias de cor, na ordem dos marcadores
export const PECAS_DE_CIMA = {
    camiseta: ["superior"],
    moletom: ["superior"],
    jaqueta: ["superior", "interna"]
};

export const PECAS_DE_BAIXO = {
    calca: ["inferior"],
    shorts: ["inferior"],
    saia_curta: ["inferior"],
    saia_longa: ["inferior"]
};

// as saias vão por cima da peça de cima, que entra por dentro delas
export const POR_CIMA_DO_TORSO = ["saia_curta", "saia_longa"];
export const POR_DENTRO_DA_SAIA = ["camiseta", "moletom"];

export const ESTILOS_DE_CABELO = [
    "curto_liso", "franja_reta", "raspado", "coque_alto",
    "coque_baixo", "topete", "rabo_cavalo"
];

// o avatar de antes do editor; oculos é a cor da armação ou null
export const APARENCIA_PADRAO = {
    pele: "#dcab85",
    estiloDeCabelo: "curto_liso",
    cabelo: "#5d3a20",
    pecaDeCima: "camiseta",
    superior: "#f4f6fa",
    interna: "#aab4c4",
    pecaDeBaixo: "calca",
    inferior: "#39465c",
    oculos: null
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
    const folhas = ["corpo", "oculos", "cracha"];

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
