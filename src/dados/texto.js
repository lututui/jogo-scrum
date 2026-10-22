// Texto conforme o jogador
//
// Os textos podem ter dois marcadores, trocados na hora de mostrar:
//   {nome}                 o nome do perfil
//   {masculino|feminino}   a primeira forma para o tratamento masculino, a
//                          segunda para o feminino, como em "Bem-{vindo|vinda}"
//
// Sem perfil (só acontece antes do editor), {nome} vira "Aprendiz" e vale a
// primeira forma.

import {CADEIRAS} from "./cadeiras.js";
import {perfilDoJogador} from "./perfil.js";

const NOME_SEM_PERFIL = "Aprendiz";
const MARCADOR_DE_NOME = /\{nome\}/g;
const MARCADOR_DE_TRATAMENTO = /\{([^{}|]*)\|([^{}|]*)\}/g;

export function personalizar(registry, texto) {
    if (typeof texto !== "string" || texto.indexOf("{") < 0) {
        return texto;
    }

    const perfil = perfilDoJogador(registry);
    const nome = perfil ? perfil.nome : NOME_SEM_PERFIL;
    const feminino = Boolean(perfil) && perfil.pronome === "feminino";

    return texto
        .replace(MARCADOR_DE_NOME, nome)
        .replace(MARCADOR_DE_TRATAMENTO, function (_, masculino, formaFeminina) {
            return feminino ? formaFeminina : masculino;
        });
}

// nome da cadeira conforme o tratamento: Desenvolvedor ou Desenvolvedora
export function nomeDaCadeira(registry, cadeira) {
    const dados = CADEIRAS[cadeira];
    const perfil = perfilDoJogador(registry);

    if (perfil && perfil.pronome === "feminino" && dados.nomeNoFeminino) {
        return dados.nomeNoFeminino;
    }
    return dados.nome;
}

// como o jogador aparece no rótulo das falas
export function nomeDoJogador(registry) {
    const perfil = perfilDoJogador(registry);
    return perfil ? perfil.nome : "Você";
}
