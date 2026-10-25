// Menu principal
//
// Primeira tela depois do carregamento. Sem progresso salvo, a partida começa
// direto; com progresso, dá para continuar ou começar outra, e começar outra
// pede confirmação, porque apaga o que foi salvo.
//
// Começar e Nova partida seguem guia, editor de personagem e escolha de
// cadeira. Continuar volta à cadeira em andamento, direto no escritório, com
// o mentor recebendo; sem cadeira em andamento (a última sprint fechou), vai
// à escolha. Sem perfil no save, passa antes pelo editor. PERSONAGEM edita o
// perfil e volta ao menu; a sprint em andamento continua onde estava.

import {temPerfil} from "../dados/perfil.js";
import {CADEIRA_RECEM_ESCOLHIDA} from "../dados/boasVindas.js";
import {apagarProgresso, cadeiraEmAndamento, temProgresso} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {ListaDeOpcoes} from "../ui/ListaDeOpcoes.js";
import {aplicarPerfil} from "../ui/montarJogador.js";
import {abrirConfiguracoes} from "./CenaConfiguracoes.js";
import {abrirGlossario} from "./CenaGlossario.js";
import {abrirGuia, comecarPeloGuia} from "./CenaGuia.js";
import {anotar} from "../dados/diario.js";

const LARGURA_DA_LISTA = 420;
const TOPO_DA_LISTA = 196;

const ALTURA_DA_LINHA = 34;

const OPCOES = {
    comecar: {id: "comecar", titulo: "COMEÇAR"},
    continuar: {id: "continuar", titulo: "CONTINUAR"},
    novaPartida: {id: "novaPartida", titulo: "NOVA PARTIDA"},
    personagem: {id: "personagem", titulo: "PERSONAGEM"},
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

        this.add.text(480, 516, "setas escolhem, ENTER confirma; O abre as configurações em qualquer tela", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        }).setOrigin(0.5, 0);
    }

    opcoes() {
        const inicio = temProgresso(this.registry)
            ? [OPCOES.continuar, OPCOES.novaPartida]
            : [OPCOES.comecar];

        return inicio.concat([OPCOES.personagem, OPCOES.guia, OPCOES.glossario, OPCOES.configuracoes]);
    }

    montarLista() {
        const cena = this;

        this.lista = new ListaDeOpcoes(this, {
            x: 480 - LARGURA_DA_LISTA / 2,
            y: TOPO_DA_LISTA,
            largura: LARGURA_DA_LISTA,
            centralizar: true,
            alturaDaLinha: ALTURA_DA_LINHA,
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

        if (opcao.id === "comecar") {
            anotar("partida", {apagouAnterior: false});
            this.comecarPartida();
        } else if (opcao.id === "continuar") {
            this.continuarPartida();
        } else if (opcao.id === "personagem") {
            this.scene.start("CenaEditor", {depois: "CenaMenu", voltar: "CenaMenu"});
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
            anotar("partida", {apagouAnterior: true});
            apagarProgresso(this.registry);
            aplicarPerfil(this);
            this.registry.set("cadeira", null);
            this.comecarPartida();
            return;
        }

        this.confirmandoNovaPartida = true;
        this.aviso.setText("Isso apaga todo o progresso salvo. ENTER de novo confirma, ESC cancela.");
    }

    // guia, editor e escolha de cadeira; ESC no editor volta ao menu sem
    // criar nada
    comecarPartida() {
        comecarPeloGuia(this, "CenaEditor", {depois: "CenaSelecaoDePapel", voltar: "CenaMenu"});
    }

    continuarPartida() {
        const cadeira = cadeiraEmAndamento(this.registry);
        anotar("continuar", {cadeira: cadeira});
        const destino = cadeira ? "CenaEscritorio" : "CenaSelecaoDePapel";

        if (cadeira) {
            this.registry.set("cadeira", cadeira);
            this.registry.set(CADEIRA_RECEM_ESCOLHIDA, true);
        }
        if (temPerfil(this.registry)) {
            this.scene.start(destino);
            return;
        }
        this.scene.start("CenaEditor", {depois: destino, voltar: "CenaMenu"});
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