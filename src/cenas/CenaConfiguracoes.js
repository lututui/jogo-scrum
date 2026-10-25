// Configurações
//
// Abre por cima de qualquer tela: pelo menu principal ou pela tecla O (ver
// CenaGlobal). Volumes ficam em réguas, como as da voz no criador de
// personagem: andam com ← →, pelas setas ‹ › ou clicando e arrastando, sem
// dar a volta. As opções de ligar e desligar mudam com ENTER. No fim, as
// ações da avaliação: exportar os dados e limpar tudo, que pede um segundo
// ENTER.

import {VOLUME_MAXIMO, lerConfiguracoes, salvarConfiguracao} from "../dados/configuracoes.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {ListaDeOpcoes} from "../ui/ListaDeOpcoes.js";
import {Regua} from "../ui/Regua.js";
import {anotar} from "../dados/diario.js";
import {baixarExportacao, limparTudo} from "../dados/exportacao.js";
import {vozDoJogador} from "../dados/perfil.js";
import {aplicarVolumeDaMusica, falarAmostra, tocarEfeito} from "../ui/som.js";
import {aplicarFps} from "./CenaFPS.js";
import {abrirPorCima, fecharPorCima} from "./sobreposicao.js";

const LARGURA_DA_LISTA = 640;
const TOPO_DA_LISTA = 120;
const ALTURA_DA_LINHA = 40;
const ESPACO_ENTRE_LINHAS = 6;

// régua de volume, entre as setas, à esquerda da porcentagem
const LARGURA_DA_REGUA = 130;
const ESQUERDA_DA_REGUA = (960 + LARGURA_DA_LISTA) / 2 - 80 - LARGURA_DA_REGUA;
const AFASTAMENTO_DA_SETA = 16;
const PROFUNDIDADE_DA_REGUA = 806;

const OPCOES = [
    {
        id: "volumeMusica",
        tipo: "volume",
        titulo: "Música",
        detalhe: "Toca no escritório, nas reuniões e nas decisões"
    },
    {
        id: "volumeEfeitos",
        tipo: "volume",
        titulo: "Efeitos",
        detalhe: "Cursor, confirmação, quadro, agenda e avisos"
    },
    {
        id: "volumeVozes",
        tipo: "volume",
        titulo: "Vozes",
        detalhe: "As sílabas que acompanham as falas"
    },
    {
        id: "mostrarFps",
        tipo: "alternar",
        titulo: "Mostrar FPS",
        detalhe: "Quadros por segundo no canto da tela, para medir o desempenho"
    },
    {
        id: "exportar",
        tipo: "acao",
        titulo: "Exportar dados",
        detalhe: "Baixa um arquivo com o personagem, o resumo das cadeiras e o diário",
        sufixo: "ENTER"
    },
    {
        id: "limpar",
        tipo: "acao",
        titulo: "Limpar tudo",
        detalhe: "Apaga progresso, personagem, diário e configurações deste navegador",
        sufixo: "ENTER"
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
        this.confirmandoLimpeza = false;
        this.montarMoldura();
        this.montarLista();
        this.montarReguas();
        this.montarSetas();
        this.atualizarReguas();
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

        this.aviso = this.add.text(480, 480, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario,
            align: "center",
            wordWrap: {width: 760}
        }).setOrigin(0.5, 0);

        this.add.text(480, 516, "↑ ↓ escolhem, ← → mudam o volume (ou clique e arraste a régua), ENTER confirma", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        }).setOrigin(0.5, 0);
    }

    opcoes() {
        const atuais = lerConfiguracoes();

        return OPCOES.map(function (opcao) {
            if (opcao.tipo === "acao") {
                return Object.assign({}, opcao);
            }
            const sufixo = opcao.tipo === "volume"
                ? atuais[opcao.id] * 10 + "%"
                : (atuais[opcao.id] ? "LIGADO" : "DESLIGADO");
            return Object.assign({}, opcao, {sufixo: sufixo});
        });
    }

    montarLista() {
        const cena = this;

        this.lista = new ListaDeOpcoes(this, {
            x: (960 - LARGURA_DA_LISTA) / 2,
            y: TOPO_DA_LISTA,
            largura: LARGURA_DA_LISTA,
            alturaDaLinha: ALTURA_DA_LINHA,
            espaco: ESPACO_ENTRE_LINHAS,
            opcoes: this.opcoes(),
            aoConfirmar: function (opcao) {
                cena.acionar(opcao);
            }
        });
    }

    // ENTER ou clique: liga e desliga, ou executa a ação; nos volumes, quem
    // muda são as setas
    acionar(opcao) {
        if (opcao.tipo === "volume") {
            return;
        }
        if (opcao.id === "exportar") {
            this.cancelarLimpeza();
            anotar("exportacao", {});
            this.avisar("dados exportados: " + baixarExportacao(this.registry), false);
            return;
        }
        if (opcao.id === "limpar") {
            this.pedirLimpeza();
            return;
        }
        this.cancelarLimpeza();

        salvarConfiguracao(opcao.id, !lerConfiguracoes()[opcao.id]);
        aplicarFps(this);
        this.atualizar();
    }

    // o segundo ENTER na mesma linha apaga; mudar de linha ou sair cancela
    pedirLimpeza() {
        if (this.confirmandoLimpeza) {
            limparTudo();
            return;
        }
        this.confirmandoLimpeza = true;
        this.avisar("Apaga progresso, personagem, diário e configurações. "
            + "ENTER de novo confirma; mudar de linha cancela.", true);
    }

    cancelarLimpeza() {
        if (this.confirmandoLimpeza) {
            this.confirmandoLimpeza = false;
            this.avisar("", false);
        }
    }

    avisar(texto, alerta) {
        this.aviso.setText(texto).setColor(alerta ? COR.alerta : COR.textoSecundario);
    }

    // ← → só mexem nos volumes, sem dar a volta
    ajustar(passo) {
        const opcao = this.lista.selecionada();
        if (!opcao || opcao.tipo !== "volume") {
            return;
        }
        this.passarVolume(opcao.id, passo);
    }

    passarVolume(id, passo) {
        const atual = lerConfiguracoes()[id];
        const proximo = Phaser.Math.Clamp(atual + passo, 0, VOLUME_MAXIMO);
        if (proximo !== atual) {
            this.mudarVolume(id, proximo);
            this.tocarAmostra(id);
        }
    }

    // arrastando, a música e os efeitos respondem a cada marca; a voz fala
    // só quando o ponteiro solta
    montarReguas() {
        const cena = this;
        this.reguas = {};
        OPCOES.forEach(function (opcao, indice) {
            if (opcao.tipo !== "volume") {
                return;
            }
            this.reguas[opcao.id] = new Regua(this, {
                x: ESQUERDA_DA_REGUA,
                meio: this.meioDaLinha(indice),
                largura: LARGURA_DA_REGUA,
                quantidade: VOLUME_MAXIMO + 1,
                indice: lerConfiguracoes()[opcao.id],
                profundidade: PROFUNDIDADE_DA_REGUA,
                aoPegar: function () {
                    cena.lista.selecionar(indice);
                },
                aoMudar: function (valor) {
                    cena.mudarVolume(opcao.id, valor);
                    if (opcao.id !== "volumeVozes") {
                        cena.tocarAmostra(opcao.id);
                    }
                },
                aoSoltar: function (mudou) {
                    if (mudou && opcao.id === "volumeVozes") {
                        cena.tocarAmostra(opcao.id);
                    }
                }
            });
        }, this);
    }

    meioDaLinha(indice) {
        return TOPO_DA_LISTA + indice * (ALTURA_DA_LINHA + ESPACO_ENTRE_LINHAS) + ALTURA_DA_LINHA / 2;
    }

    // ‹ diminui e › aumenta; clicar também seleciona a linha
    montarSetas() {
        this.setas = [];
        OPCOES.forEach(function (opcao, indice) {
            if (opcao.tipo !== "volume") {
                return;
            }
            [
                {passo: -1, simbolo: "‹", x: ESQUERDA_DA_REGUA - AFASTAMENTO_DA_SETA},
                {passo: 1, simbolo: "›", x: ESQUERDA_DA_REGUA + LARGURA_DA_REGUA + AFASTAMENTO_DA_SETA}
            ].forEach(function (seta) {
                const texto = this.add.text(seta.x, this.meioDaLinha(indice), seta.simbolo, {
                    fontFamily: FONTE,
                    fontSize: "18px",
                    color: COR.destaque,
                    padding: {x: 6, y: 2}
                }).setOrigin(0.5, 0.5).setDepth(PROFUNDIDADE_DA_REGUA).setInteractive({useHandCursor: true});

                texto.on("pointerdown", function () {
                    this.lista.selecionar(indice);
                    this.passarVolume(opcao.id, seta.passo);
                }, this);
                this.setas.push({id: opcao.id, passo: seta.passo, texto: texto});
            }, this);
        }, this);
    }

    mudarVolume(id, valor) {
        salvarConfiguracao(id, valor);
        aplicarVolumeDaMusica();
        this.atualizar();
    }

    // efeitos e vozes tocam no volume novo, para se ouvir a diferença
    tocarAmostra(id) {
        if (id === "volumeEfeitos") {
            tocarEfeito(this, "cursor");
        } else if (id === "volumeVozes") {
            falarAmostra(this, vozDoJogador(this.registry), "Assim fica a voz.");
        }
    }

    atualizar() {
        this.lista.definirOpcoes(this.opcoes());
        this.atualizarReguas();
    }

    // cada régua no volume gravado; a seta que não tem para onde ir fica
    // apagada
    atualizarReguas() {
        const atuais = lerConfiguracoes();

        Object.keys(this.reguas).forEach(function (id) {
            this.reguas[id].definir(atuais[id]);
        }, this);
        this.setas.forEach(function (seta) {
            const noLimite = seta.passo < 0 ? atuais[seta.id] === 0 : atuais[seta.id] === VOLUME_MAXIMO;
            seta.texto.setAlpha(noLimite ? 0.3 : 1);
        });
    }

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            cima: Phaser.Input.Keyboard.KeyCodes.UP,
            baixo: Phaser.Input.Keyboard.KeyCodes.DOWN,
            esquerda: Phaser.Input.Keyboard.KeyCodes.LEFT,
            direita: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            acao: Phaser.Input.Keyboard.KeyCodes.ENTER,
            espaco: Phaser.Input.Keyboard.KeyCodes.SPACE,
            sair: Phaser.Input.Keyboard.KeyCodes.ESC
        });
    }

    fechar() {
        fecharPorCima(this);
    }

    update() {
        const apertou = Phaser.Input.Keyboard.JustDown;

        if (apertou(this.teclas.sair)) {
            this.fechar();
        } else if (apertou(this.teclas.cima)) {
            this.cancelarLimpeza();
            this.lista.mover(-1);
        } else if (apertou(this.teclas.baixo)) {
            this.cancelarLimpeza();
            this.lista.mover(1);
        } else if (apertou(this.teclas.esquerda)) {
            this.ajustar(-1);
        } else if (apertou(this.teclas.direita)) {
            this.ajustar(1);
        } else if (apertou(this.teclas.acao) || apertou(this.teclas.espaco)) {
            this.lista.confirmar();
        }
    }
}
