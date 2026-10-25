// Aviso de conquista
//
// Uma faixa no alto da tela, por cima do que a cena mostra: o nome da
// conquista e, quando ela é nova no jogo e libera um item, o item, com o
// cadeado aberto. Aparece, fica e some sozinha; não pega teclado nem clique.
// Duas conquistas de uma vez viram duas faixas, uma embaixo da outra.

import {CONQUISTAS} from "../dados/conquistas.js";
import {desbloqueiosDaConquista} from "../dados/desbloqueios.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {ESCALA_DO_CADEADO, criarCadeados} from "./icones.js";

export const DURACAO_DO_AVISO = 4000;

const LARGURA = 440;
const TOPO = 48;
const ALTURA = 32;
const ALTURA_COM_ITEM = 52;
const ESPACO = 6;
const PROFUNDIDADE = 20000;
const ENTRADA = 200;
const SAIDA = 400;

function nomeDaConquista(id) {
    const conquista = CONQUISTAS.find(function (item) {
        return item.id === id;
    });
    return conquista ? conquista.nome : id;
}

// obtidas: [{id, novaNoJogo}]; restante: quanto falta mostrar, em ms; entrar:
// se a faixa aparece aos poucos (na primeira vez) ou de uma vez (quando passa
// para outra cena). Devolve os objetos desenhados
export function desenharAviso(cena, obtidas, restante, entrar) {
    const objetos = [];
    const x = 480 - LARGURA / 2;
    let y = TOPO;

    criarCadeados(cena);

    obtidas.forEach(function (obtida) {
        const itens = obtida.novaNoJogo ? desbloqueiosDaConquista(obtida.id) : [];
        const altura = itens.length > 0 ? ALTURA_COM_ITEM : ALTURA;

        objetos.push(
            cena.add.rectangle(x, y, LARGURA, altura, COR_HEX.painel).setOrigin(0, 0)
                .setStrokeStyle(2, COR_HEX.destaque),
            cena.add.text(x + 14, y + 10, "CONQUISTA", {
                fontFamily: FONTE,
                fontSize: "11px",
                color: COR.destaque
            }),
            cena.add.text(x + 96, y + 8, nomeDaConquista(obtida.id), {
                fontFamily: FONTE,
                fontSize: "13px",
                color: COR.texto
            })
        );

        if (itens.length > 0) {
            objetos.push(
                cena.add.image(x + 22, y + 37, "cadeado_aberto").setScale(ESCALA_DO_CADEADO),
                cena.add.text(x + 38, y + 30, "Libera no editor: " + itens.map(function (item) {
                    return item.nome;
                }).join(", "), {
                    fontFamily: FONTE,
                    fontSize: "11px",
                    color: COR.textoSecundario
                })
            );
        }
        y += altura + ESPACO;
    });

    objetos.forEach(function (objeto) {
        objeto.setScrollFactor(0).setDepth(PROFUNDIDADE).setAlpha(entrar ? 0 : 1);
    });
    if (entrar) {
        cena.tweens.add({targets: objetos, alpha: 1, duration: ENTRADA});
    }
    cena.tweens.add({
        targets: objetos,
        alpha: 0,
        delay: Math.max(0, restante - SAIDA),
        duration: SAIDA,
        onComplete: function () {
            objetos.forEach(function (objeto) {
                objeto.destroy();
            });
        }
    });
    return objetos;
}
