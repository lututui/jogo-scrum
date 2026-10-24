// Dica de primeira vez
//
// Abre por cima da cena, que fica escurecida e parada atrás, e fecha com
// ENTER, ESPAÇO, ESC ou clique. Cada dica abre uma vez por partida.

import {DICAS} from "../dados/dicas.js";
import {dicaVista, registrarDica} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {personalizar} from "../dados/texto.js";
import {abrirPorCima, fecharPorCima} from "./sobreposicao.js";

// largura fixa; a altura acompanha o texto, e o painel fica no meio da área
// abaixo da barra do alto, que não escurece (é onde ficam os medidores)
const LARGURA = 660;
const TOPO_DA_AREA = 42;
const RECUO = 24;

// abre a dica se ela ainda não foi vista; devolve se abriu
export function abrirDicaUmaVez(cena, id) {
    if (dicaVista(cena.registry, id)) {
        return false;
    }
    registrarDica(cena.registry, id);
    abrirPorCima(cena, "CenaDica", {id: id});
    return true;
}

export class CenaDica extends Phaser.Scene {

    constructor() {
        super({key: "CenaDica"});
    }

    init(dados) {
        this.retorno = dados.retorno;
        this.dica = DICAS[dados.id];
    }

    create() {
        const cadeira = this.registry.get("cadeira") || "po";
        const extra = this.dica.porCadeira ? "\n\n" + this.dica.porCadeira[cadeira] : "";
        const largura = LARGURA - RECUO * 2;
        const x = (960 - LARGURA) / 2;

        this.add.rectangle(0, TOPO_DA_AREA, 960, 540 - TOPO_DA_AREA, COR_HEX.contorno, 0.45).setOrigin(0, 0);
        const painel = this.add.rectangle(x, 0, LARGURA, 0, COR_HEX.painel)
            .setOrigin(0, 0).setStrokeStyle(2, COR_HEX.contorno);
        const titulo = this.add.text(x + RECUO, 0, this.dica.titulo, {
            fontFamily: FONTE,
            fontSize: "18px",
            color: COR.destaque
        });
        const linha = this.add.rectangle(x + RECUO, 0, largura, 1, COR_HEX.contornoSuave).setOrigin(0, 0);
        const corpo = this.add.text(x + RECUO, 0, personalizar(this.registry, this.dica.texto + extra), {
            fontFamily: FONTE,
            fontSize: "14px",
            color: COR.texto,
            lineSpacing: 6,
            wordWrap: {width: largura}
        });
        const ajuda = this.add.text(x + LARGURA - RECUO, 0, "ENTER para continuar", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        }).setOrigin(1, 0);

        const altura = RECUO + 52 + corpo.height + 20 + ajuda.height + RECUO;
        const topo = TOPO_DA_AREA + (540 - TOPO_DA_AREA - altura) / 2;
        painel.setY(topo).setSize(LARGURA, altura);
        titulo.setY(topo + RECUO);
        linha.setY(topo + 60);
        corpo.setY(topo + 76);
        ajuda.setY(topo + altura - RECUO - ajuda.height);

        this.teclas = this.input.keyboard.addKeys({
            acao: Phaser.Input.Keyboard.KeyCodes.ENTER,
            espaco: Phaser.Input.Keyboard.KeyCodes.SPACE,
            sair: Phaser.Input.Keyboard.KeyCodes.ESC
        });
        this.input.on("pointerdown", this.fechar, this);
    }

    fechar() {
        fecharPorCima(this);
    }

    update() {
        const apertou = Phaser.Input.Keyboard.JustDown;
        if (apertou(this.teclas.acao) || apertou(this.teclas.espaco) || apertou(this.teclas.sair)) {
            this.fechar();
        }
    }
}
