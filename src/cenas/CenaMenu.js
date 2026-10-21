// Menu principal
//
// Primeira tela depois do carregamento. Sem progresso salvo, a partida começa
// direto; com progresso, dá para continuar ou começar outra, e começar outra
// pede confirmação, porque apaga o que foi salvo.

import {apagarProgresso, temProgresso} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {ListaDeOpcoes} from "../ui/ListaDeOpcoes.js";
import {abrirConfiguracoes} from "./CenaConfiguracoes.js";
import {abrirGlossario} from "./CenaGlossario.js";
import {abrirGuia} from "./CenaGuia.js";

const LARGURA_DA_LISTA = 420;
const TOPO_DA_LISTA = 196;

const OPCOES = {
    comecar: {id: "comecar", titulo: "COMEÇAR"},
    continuar: {id: "continuar", titulo: "CONTINUAR"},
    novaPartida: {id: "novaPartida", titulo: "NOVA PARTIDA"},
    guia: {id: "guia", titulo: "GUIA"},
    glossario: {id: "glossario", titulo: "GLOSSÁRIO"},
    configuracoes: {id: "configuracoes", titulo: "CONFIGURAÇÕES"}
};

export class CenaMenu extends Phaser.Scene {

    constructor() {
        super({key: "CenaMenu"});
    }

    create() {
        this.confirmandoNovaPartida = false;

        this.montarMoldura();
        this.montarLista();
        this.criarControles();
    }

    montarMoldura() {
        this.add.rectangle(0, 0, 960, 540, COR_HEX.fundo).setOrigin(0, 0);

        this.add.text(480, 92, "Protótipo de jogo sério para o ensino de Scrum", {
            fontFamily: FONTE,
            fontSize: "22px",
            color: COR.texto
        }).setOrigin(0.5, 0);

        this.add.text(480, 132, "Catavento Software", {
            fontFamily: FONTE,
            fontSize: "13px",
            color: COR.textoSecundario
        }).setOrigin(0.5, 0);

        this.add.rectangle(480 - LARGURA_DA_LISTA / 2, 166, LARGURA_DA_LISTA, 1, COR_HEX.contornoSuave)
            .setOrigin(0, 0);

        this.aviso = this.add.text(480, 484, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.alerta
        }).setOrigin(0.5, 0);

        this.add.text(480, 516, "setas escolhem, ENTER confirma", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        }).setOrigin(0.5, 0);
    }

    opcoes() {
        const inicio = temProgresso(this.registry)
            ? [OPCOES.continuar, OPCOES.novaPartida]
            : [OPCOES.comecar];

        return inicio.concat([OPCOES.guia, OPCOES.glossario, OPCOES.configuracoes]);
    }

    montarLista() {
        const cena = this;

        this.lista = new ListaDeOpcoes(this, {
            x: 480 - LARGURA_DA_LISTA / 2,
            y: TOPO_DA_LISTA,
            largura: LARGURA_DA_LISTA,
            centralizar: true,
            opcoes: this.opcoes(),
            aoConfirmar: function (opcao) {
                cena.escolher(opcao);
            }
        });
    }

    escolher(opcao) {
        if (opcao.id !== "novaPartida") {
            this.cancelarConfirmacao();
        }

        if (opcao.id === "comecar" || opcao.id === "continuar") {
            this.scene.start("CenaSelecaoDePapel");
        } else if (opcao.id === "novaPartida") {
            this.pedirNovaPartida();
        } else if (opcao.id === "guia") {
            abrirGuia(this);
        } else if (opcao.id === "glossario") {
            abrirGlossario(this);
        } else if (opcao.id === "configuracoes") {
            abrirConfiguracoes(this);
        }
    }

    // O segundo ENTER na mesma linha confirma; mudar de linha ou ESC cancela
    pedirNovaPartida() {
        if (this.confirmandoNovaPartida) {
            apagarProgresso(this.registry);
            this.registry.set("cadeira", null);
            this.scene.start("CenaSelecaoDePapel");
            return;
        }

        this.confirmandoNovaPartida = true;
        this.aviso.setText("Isso apaga todo o progresso salvo. ENTER de novo confirma, ESC cancela.");
    }

    cancelarConfirmacao() {
        this.confirmandoNovaPartida = false;
        this.aviso.setText("");
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
            this.cancelarConfirmacao();
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.cima)) {
            this.cancelarConfirmacao();
            this.lista.mover(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.baixo)) {
            this.cancelarConfirmacao();
            this.lista.mover(1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.acao)
            || Phaser.Input.Keyboard.JustDown(this.teclas.espaco)) {
            this.lista.confirmar();
        }
    }
}