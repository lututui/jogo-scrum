// Cenas que abrem por cima de outra
//
// A cena de baixo fica pausada e volta exatamente onde estava. As teclas são
// soltas antes de pausar: uma seta segurada continuaria apertada na volta.

export function abrirPorCima(cena, chave) {
    cena.input.keyboard.resetKeys();
    cena.scene.pause();
    cena.scene.launch(chave, {retorno: cena.scene.key});
    cena.scene.bringToTop(chave);
}

export function fecharPorCima(cena) {
    cena.scene.stop();
    cena.scene.resume(cena.retorno);
}
