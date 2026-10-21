// Perfil do jogador
//
// Nome, pronome de tratamento e aparência, criados no editor de personagem.
// Fica dentro do progresso, então é gravado junto e Nova partida o apaga.
//
// Um progresso salvo antes do editor não tem perfil; um perfil incompleto ou
// com valor fora do catálogo também conta como ausente, e o jogador passa
// pelo editor de novo. O RESET do editor volta à aparência padrão e limpa
// nome e pronome.

import {
    APARENCIA_PADRAO,
    ESTILOS_DE_CABELO,
    PECAS_DE_BAIXO,
    PECAS_DE_CIMA,
    TONS_DE_PELE
} from "./aparencia.js";
import {lerProgresso, salvarProgresso} from "./progresso.js";

export const PRONOMES = ["masculino", "feminino"];

export const TAMANHO_DO_NOME = {minimo: 2, maximo: 16};

// nomes do SORTEAR do editor, por tratamento; nenhum repete o elenco
export const NOMES_SUGERIDOS = {
    masculino: ["Pedro", "Rafael", "Thiago", "Joaquim", "Otávio", "Davi", "Murilo", "Igor"],
    feminino: ["Ana", "Júlia", "Larissa", "Camila", "Helena", "Yara", "Lívia", "Tainá"]
};

// só letras, com ou sem acento; sem espaço, hífen, apóstrofo ou número
const SO_LETRAS = /^\p{L}+$/u;
const COR = /^#[0-9a-f]{6}$/;

// o nome como fica gravado: sem espaço nas pontas e com os acentos compostos,
// para "é" contar como uma letra só
export function normalizarNome(nome) {
    return String(nome || "").trim().normalize("NFC");
}

// o que há de errado com o nome, em poucas palavras, ou null se ele vale
export function erroDoNome(nome) {
    const limpo = normalizarNome(nome);
    const letras = Array.from(limpo).length;

    if (letras === 0) {
        return "falta o nome";
    }
    if (!SO_LETRAS.test(limpo)) {
        return "use só letras, sem espaço";
    }
    if (letras < TAMANHO_DO_NOME.minimo) {
        return "mínimo de " + TAMANHO_DO_NOME.minimo + " letras";
    }
    if (letras > TAMANHO_DO_NOME.maximo) {
        return "máximo de " + TAMANHO_DO_NOME.maximo + " letras";
    }
    return null;
}

export function nomeValido(nome) {
    return erroDoNome(nome) === null;
}

export function aparenciaValida(aparencia) {
    if (!aparencia) {
        return false;
    }

    return TONS_DE_PELE.indexOf(aparencia.pele) >= 0
        && ESTILOS_DE_CABELO.indexOf(aparencia.estiloDeCabelo) >= 0
        && aparencia.pecaDeCima in PECAS_DE_CIMA
        && aparencia.pecaDeBaixo in PECAS_DE_BAIXO
        && ["cabelo", "superior", "interna", "inferior"].every(function (categoria) {
            return COR.test(aparencia[categoria]);
        })
        && (aparencia.oculos === null || COR.test(aparencia.oculos));
}

export function perfilValido(perfil) {
    return Boolean(perfil)
        && nomeValido(perfil.nome)
        && PRONOMES.indexOf(perfil.pronome) >= 0
        && aparenciaValida(perfil.aparencia);
}

// o perfil salvo, ou null se não houver um completo
export function perfilDoJogador(registry) {
    const perfil = lerProgresso(registry).perfil;

    return perfilValido(perfil) ? perfil : null;
}

export function temPerfil(registry) {
    return perfilDoJogador(registry) !== null;
}

// grava só um perfil completo; devolve se gravou
export function salvarPerfil(registry, perfil) {
    const limpo = {
        nome: normalizarNome(perfil.nome),
        pronome: perfil.pronome,
        aparencia: Object.assign({}, perfil.aparencia)
    };

    if (!perfilValido(limpo)) {
        return false;
    }

    const progresso = lerProgresso(registry);
    progresso.perfil = limpo;
    salvarProgresso(registry, progresso);

    return true;
}

// a aparência do perfil, ou a padrão enquanto não houver perfil
export function aparenciaDoJogador(registry) {
    const perfil = perfilDoJogador(registry);

    return perfil ? perfil.aparencia : APARENCIA_PADRAO;
}
