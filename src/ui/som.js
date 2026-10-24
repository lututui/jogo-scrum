// Som do jogo
//
// Efeitos, vozes e música vêm de assets/sons, gerados por
// tools/gerar_sons.py. Cada grupo tem o seu volume nas configurações, de 0 a
// 10. O som só confirma o que a tela já mostra: com tudo no zero, o jogo é o
// mesmo.

import {lerConfiguracoes} from "../dados/configuracoes.js";
import {TIMBRES, silabasDoTexto} from "../dados/voz.js";

export const EFEITOS = [
    "cursor", "confirmar", "voltar", "cartao", "parado",
    "imprevisto", "dia", "aviso", "vinheta", "conquista"
];

const MUSICA = "musica";

// letras por segundo da frase de amostra, a mesma do painel de fala
const VELOCIDADE_DA_AMOSTRA = 34;

let musica = null;
let amostra = [];

export function carregarSons(cena) {
    const vozes = TIMBRES.map(function (timbre) {
        return "voz_" + timbre;
    });
    EFEITOS.concat(vozes, [MUSICA]).forEach(function (nome) {
        cena.load.audio(nome, "assets/sons/" + nome + ".wav");
    });
}

function volume(grupo) {
    return lerConfiguracoes()[grupo] / 10;
}

// "atraso" em milissegundos; o som é do jogo, então toca mesmo que a cena
// tenha fechado nesse meio-tempo
export function tocarEfeito(cena, nome, atraso) {
    const sons = cena.sound;
    if (!cena.cache.audio.exists(nome) || volume("volumeEfeitos") === 0) {
        return;
    }

    window.setTimeout(function () {
        sons.play(nome, {volume: volume("volumeEfeitos")});
    }, atraso || 0);
}

// uma sílaba da voz; "taxa" muda a altura (1 = lá 440)
export function tocarSilaba(cena, timbre, taxa) {
    const nome = "voz_" + timbre;
    if (!cena.cache.audio.exists(nome) || volume("volumeVozes") === 0) {
        return;
    }
    cena.sound.play(nome, {volume: volume("volumeVozes"), rate: taxa});
}

// uma frase inteira, no ritmo do painel de fala; a amostra anterior para
export function falarAmostra(cena, voz, frase) {
    pararAmostra();
    const silabas = silabasDoTexto(frase, voz);

    amostra = Object.keys(silabas).map(function (indice) {
        return window.setTimeout(function () {
            tocarSilaba(cena, voz.timbre, silabas[indice]);
        }, indice * 1000 / VELOCIDADE_DA_AMOSTRA);
    });
}

export function pararAmostra() {
    amostra.forEach(function (espera) {
        window.clearTimeout(espera);
    });
    amostra = [];
}

// A música é do jogo, não da cena: começa uma vez e segue em loop. O
// navegador só libera o som depois do primeiro toque ou tecla
export function iniciarMusica(cena) {
    if (musica || !cena.cache.audio.exists(MUSICA)) {
        return;
    }

    musica = cena.sound.add(MUSICA, {loop: true, volume: volume("volumeMusica")});
    if (cena.sound.locked) {
        cena.sound.once(Phaser.Sound.Events.UNLOCKED, function () {
            musica.play();
        });
        return;
    }
    musica.play();
}

export function aplicarVolumeDaMusica() {
    if (musica) {
        musica.setVolume(volume("volumeMusica"));
    }
}
