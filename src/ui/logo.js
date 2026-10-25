// Logo da Catavento
//
// A imagem vem de tools/gerar_logo.py, gerada com escala 4; aqui ela aparece
// com um quarto do tamanho, que é o desenho com um pixel por pixel da tela.

export const CHAVE_DA_LOGO = "logo_catavento";
export const LADO_DA_LOGO = 64;

export function carregarLogo(cena) {
    cena.load.image(CHAVE_DA_LOGO, "assets/" + CHAVE_DA_LOGO + ".png");
}

// canto de cima à esquerda em (x, y); posições inteiras, para não borrar
export function desenharLogo(cena, x, y) {
    return cena.add.image(Math.round(x), Math.round(y), CHAVE_DA_LOGO)
        .setOrigin(0, 0)
        .setDisplaySize(LADO_DA_LOGO, LADO_DA_LOGO);
}
