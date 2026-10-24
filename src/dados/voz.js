// Voz dos personagens
//
// Uma voz é um timbre (uma sílaba gravada em assets/sons/voz_<timbre>.wav)
// mais três números: altura, melodia e ritmo. Ao falar, cada letra pode
// virar uma sílaba; a altura sai da própria letra, então a mesma palavra soa
// sempre igual, e sobe no fim de pergunta e desce no fim de frase.

export const TIMBRES = ["suave", "clara", "nasal", "redonda", "soprada"];

export const ALTURAS = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

// melodia: quantos semitons a altura varia de letra para letra
export const MELODIAS = [0, 1, 2, 3];
const AMPLITUDE_DA_MELODIA = [0, 2, 4, 6];

// ritmo: a cada quantas letras sai uma sílaba
export const RITMOS = [0, 1, 2];
const LETRAS_POR_SILABA = [3, 2, 1];

export const NOMES_DA_VOZ = {
    timbre: {suave: "Suave", clara: "Clara", nasal: "Nasal", redonda: "Redonda", soprada: "Soprada"},
    melodia: ["Monótona", "Pouca", "Média", "Muita"],
    ritmo: ["Espaçado", "Normal", "Corrido"]
};

export const VOZ_PADRAO = {timbre: "suave", altura: 0, melodia: 1, ritmo: 1};

// cada passo de altura vale dois semitons
const SEMITONS_POR_ALTURA = 2;

// quantas letras antes da pontuação a entonação começa
const ALCANCE_DA_ENTONACAO = 3;

const LETRA = /\p{L}/u;
const FIM = /[.?!]/;

export function vozValida(voz) {
    return Boolean(voz)
        && TIMBRES.indexOf(voz.timbre) >= 0
        && ALTURAS.indexOf(voz.altura) >= 0
        && MELODIAS.indexOf(voz.melodia) >= 0
        && RITMOS.indexOf(voz.ritmo) >= 0;
}

export function sortearVoz() {
    const sortear = function (lista) {
        return lista[Math.floor(Math.random() * lista.length)];
    };
    return {timbre: sortear(TIMBRES), altura: sortear(ALTURAS), melodia: sortear(MELODIAS), ritmo: sortear(RITMOS)};
}

// letra sem acento e em minúscula, para "É" e "e" soarem iguais
function base(letra) {
    return letra.normalize("NFD").charAt(0).toLowerCase();
}

// semitons da pontuação que fecha a frase, perto do fim dela
function entonacao(texto, indice) {
    let letras = 0;
    for (let i = indice + 1; i < texto.length; i++) {
        if (FIM.test(texto[i])) {
            const forca = ALCANCE_DA_ENTONACAO + 1 - letras;
            if (letras > ALCANCE_DA_ENTONACAO) {
                return 0;
            }
            if (texto[i] === "?") {
                return forca * 1.5;
            }
            return texto[i] === "." ? -forca : forca * 0.5;
        }
        if (LETRA.test(texto[i])) {
            letras += 1;
        }
    }
    return 0;
}

// por índice do texto, a velocidade de reprodução da sílaba (1 = lá 440);
// índices sem sílaba ficam de fora
export function silabasDoTexto(texto, voz) {
    const silabas = {};
    if (!vozValida(voz)) {
        return silabas;
    }

    const amplitude = AMPLITUDE_DA_MELODIA[voz.melodia];
    const passo = LETRAS_POR_SILABA[voz.ritmo];
    let letras = 0;

    for (let i = 0; i < texto.length; i++) {
        if (!LETRA.test(texto[i])) {
            continue;
        }
        letras += 1;
        if ((letras - 1) % passo !== 0) {
            continue;
        }

        const codigo = base(texto[i]).charCodeAt(0);
        const melodia = amplitude ? (codigo * 37) % (2 * amplitude + 1) - amplitude : 0;
        const semitons = voz.altura * SEMITONS_POR_ALTURA + melodia + entonacao(texto, i);
        silabas[i] = Math.pow(2, semitons / 12);
    }
    return silabas;
}
