// Glossário
//
// Abre por cima de qualquer cena, que fica pausada atrás e volta exatamente
// onde estava.

import {GLOSSARIO, GRUPOS} from "../dados/glossario.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {ListaDeOpcoes} from "../ui/ListaDeOpcoes.js";
import {abrirPorCima, fecharPorCima} from "./sobreposicao.js";

const MARGEM = 24;
const TOPO = 60;
const LARGURA_DA_LISTA = 340;
const ALTURA_DA_LINHA = 34;
const ESPACO_ENTRE_LINHAS = 4;
const LINHAS_VISIVEIS = 11;

const PAINEL = {x: 384, y: TOPO, largura: 552, altura: 418};
const RECUO = 16;

export const TECLA_DO_GLOSSARIO = Phaser.Input.Keyboard.KeyCodes.G;

// Com termos, o glossário mostra só eles, como a síntese faz com o que
// vale revisar
export function abrirGlossario(cena, termos) {
    abrirPorCima(cena, "CenaGlossario", {termos: termos || null});
}

export class CenaGlossario extends Phaser.Scene {

    constructor() {
        super({key: "CenaGlossario"});
    }

    init(dados) {
        this.retorno = dados.retorno;
        this.termos = dados.termos || null;
    }

    entradas() {
        const termos = this.termos;

        if (!termos) {
            return GLOSSARIO;
        }

        return GLOSSARIO.filter(function (entrada) {
            return termos.indexOf(entrada.termo) >= 0;
        });
    }

    create() {
        this.montarMoldura();
        this.montarPainel();
        this.montarLista();
        this.criarControles();
        this.mostrar(this.lista.selecionada());
    }

    montarMoldura() {
        this.add.rectangle(0, 0, 960, 540, COR_HEX.fundo).setOrigin(0, 0);

        const barra = this.add.graphics();
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, 960, 40);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, 40, 960, 40);

        const estilo = {fontFamily: FONTE, fontSize: "14px", color: COR.texto};
        this.add.text(MARGEM, 13, this.termos ? "GLOSSÁRIO — PARA REVISAR" : "GLOSSÁRIO", estilo);
        this.add.text(936, 13, "ESC OU G PARA VOLTAR", estilo).setOrigin(1, 0);

        this.add.text(MARGEM, 516, "setas escolhem o termo, ou clique nele", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        });
    }

    montarPainel() {
        const fundo = this.add.rectangle(
            PAINEL.x, PAINEL.y, PAINEL.largura, PAINEL.altura, COR_HEX.painel
        ).setOrigin(0, 0);
        fundo.setStrokeStyle(1, COR_HEX.contornoSuave);

        const x = PAINEL.x + RECUO;
        const largura = PAINEL.largura - RECUO * 2;

        this.textoDoGrupo = this.add.text(x, PAINEL.y + RECUO, "", {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.destaque
        });

        this.textoDoTermo = this.add.text(x, PAINEL.y + 36, "", {
            fontFamily: FONTE,
            fontSize: "16px",
            color: COR.texto
        });

        this.add.rectangle(x, PAINEL.y + 64, largura, 1, COR_HEX.contornoSuave).setOrigin(0, 0);

        this.textoDaDefinicao = this.add.text(x, PAINEL.y + 80, "", {
            fontFamily: FONTE,
            fontSize: "13px",
            color: COR.texto,
            lineSpacing: 6,
            wordWrap: {width: largura}
        });

        this.textoDaFonte = this.add.text(x, PAINEL.y + PAINEL.altura - RECUO, "", {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.textoSecundario,
            wordWrap: {width: largura}
        }).setOrigin(0, 1);
    }

    montarLista() {
        const cena = this;

        this.lista = new ListaDeOpcoes(this, {
            x: MARGEM,
            y: TOPO,
            largura: LARGURA_DA_LISTA,
            alturaDaLinha: ALTURA_DA_LINHA,
            espaco: ESPACO_ENTRE_LINHAS,
            visiveis: LINHAS_VISIVEIS,
            opcoes: this.entradas().map(function (entrada) {
                return {
                    titulo: entrada.termo,
                    detalhe: GRUPOS[entrada.grupo],
                    entrada: entrada
                };
            }),
            aoConfirmar: function (opcao) {
                cena.mostrar(opcao);
            }
        });
    }

    mostrar(opcao) {
        if (!opcao) {
            return;
        }

        const entrada = opcao.entrada;
        this.textoDoGrupo.setText(GRUPOS[entrada.grupo]);
        this.textoDoTermo.setText(entrada.termo);
        this.textoDaDefinicao.setText(entrada.definicao);
        this.textoDaFonte.setText("Fonte: " + entrada.fonte);
    }

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            cima: Phaser.Input.Keyboard.KeyCodes.UP,
            baixo: Phaser.Input.Keyboard.KeyCodes.DOWN,
            sair: Phaser.Input.Keyboard.KeyCodes.ESC,
            glossario: TECLA_DO_GLOSSARIO
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.teclas.sair)
            || Phaser.Input.Keyboard.JustDown(this.teclas.glossario)) {
            this.fechar();
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.teclas.cima)) {
            this.lista.mover(-1);
            this.mostrar(this.lista.selecionada());
        } else if (Phaser.Input.Keyboard.JustDown(this.teclas.baixo)) {
            this.lista.mover(1);
            this.mostrar(this.lista.selecionada());
        }
    }

    fechar() {
        fecharPorCima(this);
    }
}
