// Expressões dos retratos
//
// O quadro de cada expressão segue a ordem em que tools/gerar_sprites.py
// monta as folhas de retrato.
//
// O mentor reage à decisão que comenta: aprova o que segue o princípio, fica
// neutro diante do que tem custo e tenso diante do que vai contra.

const QUADRO_DA_EXPRESSAO = {
    neutro: 0,
    tenso: 1,
    aprovacao: 2
};

const EXPRESSAO_DA_AVALIACAO = {
    boa: "aprovacao",
    media: "neutro",
    ruim: "tenso"
};

export function quadroDaExpressao(expressao) {
    return QUADRO_DA_EXPRESSAO[expressao] || 0;
}

export function expressaoDaAvaliacao(avaliacao) {
    return EXPRESSAO_DA_AVALIACAO[avaliacao] || "neutro";
}

export const TOTAL_DE_EXPRESSOES = Object.keys(QUADRO_DA_EXPRESSAO).length;
