// Agenda da sprint
//
// Aberta pelo calendário da parede do escritório.
// Lista os eventos do Scrum e abre cada um na sua cena.
//
// Em iterações futuras, a agenda deixa de ser um menu e
// passa a seguir o dia da sprint.

import {CADEIRAS} from "../dados/cadeiras.js";
import {EVENTOS} from "../dados/eventos.js";
import {PAPEIS_DOS_EVENTOS} from "../dados/eventosPorPapel.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {ListaDeOpcoes} from "../ui/ListaDeOpcoes.js";

const MARGEM = 24;
const TOPO_DA_LISTA = 116;

export class CenaAgenda extends Phaser.Scene {

    constructor() {
        super({key: "CenaAgenda"});
    }

    create() {
        this.criarMoldura();
        this.criarLista();
        this.criarControles();
    }

    criarMoldura() {
        this.add.rectangle(0, 0, 960, 540, COR_HEX.fundo).setOrigin(0, 0);

        const barra = this.add.graphics();
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, 960, 40);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, 40, 960, 40);

        const estilo = {fontFamily: FONTE, fontSize: "14px", color: COR.texto};
        this.add.text(MARGEM, 13, "AGENDA DA SPRINT", estilo);
        this.add.text(480, 13, "COMO " + CADEIRAS[this.cadeira()].nome.toUpperCase(), {
            fontFamily: FONTE,
            fontSize: "14px",
            color: CADEIRAS[this.cadeira()].cor
        }).setOrigin(0.5, 0);
        this.add.text(940, 13, "ESC PARA VOLTAR", estilo).setOrigin(1, 0);

        this.add.text(MARGEM, 72, "Os quatro eventos do Scrum, cada um com sua mecânica.", {
            fontFamily: FONTE,
            fontSize: "13px",
            color: COR.texto
        });

        this.add.text(MARGEM, 516, "setas escolhem, ENTER abre o evento", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        });
    }

    criarLista() {
        const cena = this;
        this.lista = new ListaDeOpcoes(this, {
            x: MARGEM,
            y: TOPO_DA_LISTA,
            largura: 960 - MARGEM * 2,
            opcoes: EVENTOS.map(function (evento) {
                return {
                    id: evento.chave,
                    titulo: evento.nome,
                    detalhe: evento.resumo,
                    sufixo: cena.conduz(evento.chave) ? "você conduz" : "você participa",
                    chave: evento.chave
                };
            }),
            aoConfirmar: function (opcao) {
                cena.abrirEvento(opcao.chave);
            }
        });
    }

    cadeira() {
        return this.registry.get("cadeira") || "po";
    }

    // Marca na lista os eventos que a cadeira atual conduz, porque é isso que
    // muda a mecânica de cada reunião
    conduz(chaveDoEvento) {
        const porPapel = PAPEIS_DOS_EVENTOS[chaveDoEvento] || {};

        return Boolean((porPapel[this.cadeira()] || {}).conduz);
    }

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            cima: Phaser.Input.Keyboard.KeyCodes.UP,
            baixo: Phaser.Input.Keyboard.KeyCodes.DOWN,
            acao: Phaser.Input.Keyboard.KeyCodes.ENTER,
            espaco: Phaser.Input.Keyboard.KeyCodes.SPACE,
            sair: Phaser.Input.Keyboard.KeyCodes.ESC
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.teclas.sair)) {
            this.voltarAoEscritorio();
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.cima)) {
            this.lista.mover(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.baixo)) {
            this.lista.mover(1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.acao)
            || Phaser.Input.Keyboard.JustDown(this.teclas.espaco)) {
            this.lista.confirmar();
        }
    }

    // A agenda sai de cena enquanto o evento roda
    // O escritório segue pausado atrás dos dois e é para ele que o evento volta
    abrirEvento(chave) {
        this.scene.stop();
        this.scene.launch(chave);
    }

    voltarAoEscritorio() {
        this.scene.stop();
        this.scene.resume("CenaEscritorio");
    }
}
