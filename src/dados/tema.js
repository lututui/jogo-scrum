// Tema visual do jogo
//
// Toda cor usada em tela tem nome e mora aqui.
// Nenhum valor hexadecimal deve aparecer solto nas cenas.

export const COR = {
    fundo: "#e7ebf4",
    painel: "#fbfcfe",
    painelSuave: "#f2f5fa",
    contorno: "#2b3348",
    contornoSuave: "#9fb0cf",
    texto: "#1b2430",
    textoSecundario: "#6d7b95",
    textoInvertido: "#fbfcfe",
    alerta: "#c0392b",
    alertaSuave: "#faeceb",
    destaque: "#1f6f8b"
};

export const COR_HEX = {
    fundo: 0xe7ebf4,
    painel: 0xfbfcfe,
    painelSuave: 0xf2f5fa,
    contorno: 0x2b3348,
    contornoSuave: 0x9fb0cf,
    rodape: 0x9fb0cf,
    alerta: 0xc0392b,
    alertaSuave: 0xfaeceb,
    destaque: 0x1f6f8b,
    selecao: 0xe8f1f5,
    sombra: 0xd7dfec
};

// Tipos de item do quadro, com a cor que identifica cada um
export const TIPO_DE_ITEM = {
    feature: {rotulo: "FEATURE", cor: "#1f6f8b", corHex: 0x1f6f8b, corFundoHex: 0xe8f1f5},
    bug: {rotulo: "BUG", cor: "#c0392b", corHex: 0xc0392b, corFundoHex: 0xfaeceb},
    chore: {rotulo: "CHORE", cor: "#3f7a52", corHex: 0x3f7a52, corFundoHex: 0xeaf3ed},
    spike: {rotulo: "SPIKE", cor: "#7a4bb5", corHex: 0x7a4bb5, corFundoHex: 0xf1ebf9}
};

export const FONTE = "monospace";