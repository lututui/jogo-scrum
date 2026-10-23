// Calendário da sprint
//
// Cada reunião e cada evento contextual tem o seu dia. Hoje é o dia do
// próximo compromisso da cadeira; entre um compromisso e outro, o time
// trabalha.

import {EVENTOS} from "./eventos.js";
import {contextuaisDaCadeira} from "./eventosContextuais.js";

// Reuniões e eventos contextuais da cadeira, em ordem de dia. No mesmo dia, a
// reunião vem antes
export function agendaDaCadeira(cadeira) {
    const reunioes = EVENTOS.map(function (evento) {
        return {reuniao: true, chave: evento.chave, dia: evento.dia, evento: evento};
    });
    const contextuais = contextuaisDaCadeira(cadeira).map(function (evento) {
        return {reuniao: false, chave: evento.id, dia: evento.dia, evento: evento};
    });

    return reunioes.concat(contextuais).sort(function (um, outro) {
        return um.dia - outro.dia || Number(outro.reuniao) - Number(um.reuniao);
    });
}

// O primeiro compromisso ainda não vivido, ou null com a sprint encerrada
export function proximoCompromisso(cadeira, concluidos, resolvidos) {
    return agendaDaCadeira(cadeira).find(function (compromisso) {
        const vividos = compromisso.reuniao ? concluidos : resolvidos;
        return vividos.indexOf(compromisso.chave) < 0;
    }) || null;
}
