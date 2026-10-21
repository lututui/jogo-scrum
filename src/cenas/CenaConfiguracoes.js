// Configurações
//
// Abre por cima do menu principal. Cada linha liga ou desliga uma opção.

import {lerConfiguracoes, salvarConfiguracao} from "../dados/configuracoes.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {ListaDeOpcoes} from "../ui/ListaDeOpcoes.js";
import {aplicarFps} from "./CenaFPS.js";
import {abrirPorCima, fecharPorCima} from "./sobreposicao.js";

const LARGURA_DA_LISTA = 560;
const TOPO_DA_LISTA = 120;

const OPCOES = [
    {
        id: "mostrarFps",
        titulo: "Mostrar FPS",
        detalhe: "Quadros por segundo no canto da tela, para medir o desempenho"
    }
];

export function abrirConfiguracoes(cena) {
    abrirPorCima(cena, "CenaConfiguracoes");
}

export class CenaConfiguracoes extends Phaser.Scene {

    constructor() {
        super({key: "CenaConfiguracoes"});
    }

    init(dados) {
        this.retorno = dados.retorno;
    }

    create() {
        this.montarMoldura();
        this.montarLista();
        this.criarControles();
    }

    montarMoldura() {
        this.add.rectangle(0, 0, 960, 540, COR_HEX.fundo).setOrigin(0, 0);

        const barra = this.add.graphics();
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, 960, 40);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, 40, 960, 40);

        const estilo = {fontFamily: FONTE, fontSize: "14px", color: COR.texto};
        this.add.text(24, 13, "CONFIGURAÇÕES", estilo);
        this.add.text(936, 13, "ESC PARA VOLTAR", estilo).setOrigin(1, 0);

        this.add.text(480, 516, "setas escolhem, ENTER liga e desliga", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        }).setOrigin(0.5, 0);
    }

    opcoes() {
        const atuais = lerConfiguracoes();

        return OPCOES.map(function (opcao) {
            return Object.assign({}, opcao, {sufixo: atuais[opcao.id] ? "LIGADO" : "DESLIGADO"});
        });
    }

    montarLista() {
        const cena = this;

        this.lista = new ListaDeOpcoes(this, {
            x: (960 - LARGURA_DA_LISTA) / 2,
            y: TOPO_DA_LISTA,
            largura: LARGURA_DA_LISTA,
            opcoes: this.opcoes(),
            aoConfirmar: function (opcao) {
                cena.alternar(opcao);
            }
        });
    }

    alternar(opcao) {
        salvarConfiguracao(opcao.id, !lerConfiguracoes()[opcao.id]);
        aplicarFps(this);
        this.lista.definirOpcoes(this.opcoes());
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
            fecharPorCima(this);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.cima)) {
            this.lista.mover(-1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.baixo)) {
            this.lista.mover(1);
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.acao)
            || Phaser.Input.Keyboard.JustDown(this.teclas.espaco)) {
            this.lista.confirmar();
        }
    }
}
