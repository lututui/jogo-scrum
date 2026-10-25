// Visualizador de conquistas
//
// Abre por cima do menu, como o glossário. Lista as conquistas do jogo, as
// obtidas com ✓. Das que faltam, só o nome: a descrição diz a conduta, e
// mostrá-la antes entregaria a resposta. Todas dizem em que cadeiras podem
// ser obtidas e o item que liberam no editor, com o cadeado fechado ou
// aberto, e mostram o personagem do jogador usando esse item.

import {CONQUISTAS} from "../dados/conquistas.js";
import {desbloqueiosDaConquista} from "../dados/desbloqueios.js";
import {aparenciaDoJogador} from "../dados/perfil.js";
import {cadeirasDaConquista, conquistasDoJogo} from "../dados/progresso.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {nomeDaCadeira} from "../dados/texto.js";
import {ListaDeOpcoes} from "../ui/ListaDeOpcoes.js";
import {ESCALA_DO_CADEADO, chaveDoCadeado, criarCadeados} from "../ui/icones.js";
import {montarPrevia} from "../ui/montarJogador.js";
import {abrirPorCima, fecharPorCima} from "./sobreposicao.js";
import {agora, anotar} from "../dados/diario.js";

const MARGEM = 24;
const TOPO = 60;
const LARGURA_DA_LISTA = 340;
const ALTURA_DA_LINHA = 34;
const ESPACO_ENTRE_LINHAS = 4;

const PAINEL = {x: 384, y: TOPO, largura: 552, altura: 418};
const RECUO = 16;

// o personagem com o item, num quadro abaixo da linha do item
const CHAVE_DA_PREVIA = "previa_da_conquista";
const ESCALA_DA_PREVIA = 4;
const LADO_DO_QUADRO = 144;
const TOPO_DO_QUADRO = 232;

export function abrirConquistas(cena) {
    abrirPorCima(cena, "CenaConquistas", {});
}

export class CenaConquistas extends Phaser.Scene {

    constructor() {
        super({key: "CenaConquistas"});
    }

    init(dados) {
        this.retorno = dados.retorno;
    }

    create() {
        this.abertoEm = agora();
        this.obtidas = conquistasDoJogo(this.registry);
        this.vistas = [];
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
        this.add.text(MARGEM, 13, "CONQUISTAS", estilo);
        this.add.text(480, 13, this.obtidas.length + " DE " + CONQUISTAS.length, estilo).setOrigin(0.5, 0);
        this.add.text(936, 13, "ESC PARA VOLTAR", estilo).setOrigin(1, 0);

        this.add.text(MARGEM, 516, "setas escolhem a conquista, ou clique nela", {
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

        this.textoDaSituacao = this.add.text(x, PAINEL.y + RECUO, "", {
            fontFamily: FONTE,
            fontSize: "11px",
            color: COR.destaque
        });

        this.textoDoNome = this.add.text(x, PAINEL.y + 36, "", {
            fontFamily: FONTE,
            fontSize: "16px",
            color: COR.texto
        });

        this.add.rectangle(x, PAINEL.y + 64, largura, 1, COR_HEX.contornoSuave).setOrigin(0, 0);

        this.textoDaDescricao = this.add.text(x, PAINEL.y + 80, "", {
            fontFamily: FONTE,
            fontSize: "13px",
            lineSpacing: 6,
            wordWrap: {width: largura}
        });

        this.textoDasCadeiras = this.add.text(x, PAINEL.y + 150, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.texto,
            lineSpacing: 8,
            wordWrap: {width: largura}
        });

        criarCadeados(this);
        this.cadeadoDoItem = this.add.image(x + 8, PAINEL.y + 212, "cadeado_fechado").setScale(ESCALA_DO_CADEADO);
        this.textoDoItem = this.add.text(x + 24, PAINEL.y + 212, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.texto
        }).setOrigin(0, 0.5);

        this.quadroDaPrevia = this.add.rectangle(x, PAINEL.y + TOPO_DO_QUADRO, LADO_DO_QUADRO, LADO_DO_QUADRO,
            COR_HEX.painelSuave).setOrigin(0, 0).setStrokeStyle(1, COR_HEX.contornoSuave);
        montarPrevia(this, aparenciaDoJogador(this.registry), CHAVE_DA_PREVIA);
        this.previa = this.add.image(x + LADO_DO_QUADRO / 2, PAINEL.y + TOPO_DO_QUADRO + LADO_DO_QUADRO / 2,
            CHAVE_DA_PREVIA, 0).setScale(ESCALA_DA_PREVIA);

        this.add.text(x, PAINEL.y + PAINEL.altura - RECUO,
            "As conquistas marcam condutas, não quantidade.", {
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
            visiveis: CONQUISTAS.length,
            opcoes: CONQUISTAS.map(function (conquista) {
                const obtida = cena.obtidas.indexOf(conquista.id) >= 0;
                return {
                    titulo: (obtida ? "✓ " : "○ ") + conquista.nome,
                    detalhe: obtida ? "obtida" : "ainda não obtida",
                    conquista: conquista,
                    obtida: obtida
                };
            }),
            aoConfirmar: function (opcao) {
                cena.mostrar(opcao);
            }
        });
    }

    nomesDasCadeiras(cadeiras) {
        const registry = this.registry;

        return cadeiras.map(function (cadeira) {
            return nomeDaCadeira(registry, cadeira);
        }).join(", ");
    }

    mostrar(opcao) {
        if (!opcao) {
            return;
        }

        const conquista = opcao.conquista;
        if (this.vistas.indexOf(conquista.id) < 0) {
            this.vistas.push(conquista.id);
        }

        this.textoDaSituacao.setText(opcao.obtida ? "OBTIDA" : "AINDA NÃO OBTIDA");
        this.textoDaSituacao.setColor(opcao.obtida ? COR.destaque : COR.textoSecundario);
        this.textoDoNome.setText(conquista.nome);
        this.textoDaDescricao.setText(opcao.obtida
            ? conquista.descricao
            : "A descrição aparece quando você conseguir esta conquista.");
        this.textoDaDescricao.setColor(opcao.obtida ? COR.texto : COR.textoSecundario);

        // salvamento anterior a esta tela não sabe a cadeira
        const onde = cadeirasDaConquista(this.registry, conquista.id);
        const linhas = [];
        if (opcao.obtida && onde.length > 0) {
            linhas.push("Obtida como: " + this.nomesDasCadeiras(onde));
        }
        linhas.push("Pode ser obtida como: " + this.nomesDasCadeiras(conquista.cadeiras));
        this.textoDasCadeiras.setText(linhas.join("\n"));

        const itens = desbloqueiosDaConquista(conquista.id);
        this.cadeadoDoItem.setVisible(itens.length > 0).setTexture(chaveDoCadeado(opcao.obtida));
        this.textoDoItem.setText(itens.length > 0 ? "Libera no editor: " + itens.map(function (item) {
            return item.nome;
        }).join(", ") : "");
        this.mostrarPrevia(itens);
    }

    // a aparência do jogador com os itens da conquista vestidos
    mostrarPrevia(itens) {
        const aparencia = Object.assign({}, aparenciaDoJogador(this.registry));

        itens.forEach(function (item) {
            aparencia[item.campo] = item.valor;
        });
        montarPrevia(this, aparencia, CHAVE_DA_PREVIA);
        this.quadroDaPrevia.setVisible(itens.length > 0);
        this.previa.setVisible(itens.length > 0);
    }

    criarControles() {
        this.teclas = this.input.keyboard.addKeys({
            cima: Phaser.Input.Keyboard.KeyCodes.UP,
            baixo: Phaser.Input.Keyboard.KeyCodes.DOWN,
            sair: Phaser.Input.Keyboard.KeyCodes.ESC
        });
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.teclas.sair)) {
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
        anotar("conquistas", {obtidas: this.obtidas.length, vistas: this.vistas, ms: agora() - this.abertoEm});
        fecharPorCima(this);
    }
}
