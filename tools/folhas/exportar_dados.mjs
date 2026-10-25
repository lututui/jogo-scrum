// Dados do jogo para as folhas
//
// Imprime em JSON o que as folhas em Python precisam de src/dados: as
// cadeiras, a agenda da sprint e as conquistas com o que liberam.
//
// node tools/folhas/exportar_dados.mjs

import {ACOES_DO_ESCRITORIO} from "../../src/dados/acoesDoEscritorio.js";
import {CADEIRAS, ORDEM_DAS_CADEIRAS} from "../../src/dados/cadeiras.js";
import {CONQUISTAS} from "../../src/dados/conquistas.js";
import {desbloqueiosDaConquista} from "../../src/dados/desbloqueios.js";
import {EVENTOS} from "../../src/dados/eventos.js";
import {EVENTOS_CONTEXTUAIS} from "../../src/dados/eventosContextuais.js";
import {PAPEIS_DOS_EVENTOS} from "../../src/dados/eventosPorPapel.js";

const dados = {
    cadeiras: ORDEM_DAS_CADEIRAS.map(function (chave) {
        return {chave: chave, nome: CADEIRAS[chave].nome, cor: CADEIRAS[chave].cor};
    }),
    reunioes: EVENTOS.map(function (evento) {
        const papeis = {};
        Object.keys(PAPEIS_DOS_EVENTOS[evento.chave]).forEach(function (cadeira) {
            const papel = PAPEIS_DOS_EVENTOS[evento.chave][cadeira];
            papeis[cadeira] = {conduz: Boolean(papel.conduz), rotulo: papel.rotulo || null};
        });
        return {chave: evento.chave, nome: evento.nome, dia: evento.dia, papeis: papeis};
    }),
    contextuais: EVENTOS_CONTEXTUAIS.map(function (evento) {
        return {id: evento.id, dia: evento.dia, cadeiras: evento.cadeiras, quem: evento.quem};
    }),
    acoes: ACOES_DO_ESCRITORIO.map(function (acao) {
        return {id: acao.id, dias: acao.dias, cadeiras: acao.cadeiras, quem: acao.quem};
    }),
    conquistas: CONQUISTAS.map(function (conquista) {
        return {
            id: conquista.id,
            nome: conquista.nome,
            descricao: conquista.descricao,
            itens: desbloqueiosDaConquista(conquista.id)
        };
    })
};

process.stdout.write(JSON.stringify(dados));
