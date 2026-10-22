// Editor de personagem
//
// Nome, tratamento e aparência do jogador. A prévia mostra o personagem
// parado, com expressão neutra e sem crachá, sobre listras, numa textura
// própria: nada muda no jogo até o CONFIRMAR, e ESC volta sem gravar.
// CONFIRMAR só vale com nome válido e tratamento escolhido.
//
// ↑ ↓ escolhem a linha e ← → trocam o valor. As cores ficam lado a lado em
// quadrados, com um último conta-gotas para a cor livre; nos óculos, o
// primeiro é um X, sem óculos. ENTER na linha do nome abre o campo de texto;
// numa linha de cor, o conta-gotas. O nome e o seletor de cor são campos do
// HTML por cima do jogo.

import {
    APARENCIA_PADRAO,
    CORES_PADRAO,
    ESTILOS_DE_CABELO,
    PECAS_DE_BAIXO,
    PECAS_DE_CIMA,
    TONS_DE_PELE
} from "../dados/aparencia.js";
import {
    NOMES_SUGERIDOS,
    PRONOMES,
    TAMANHO_DO_NOME,
    aparenciaValida,
    erroDoNome,
    normalizarNome,
    perfilDoJogador,
    perfilValido,
    salvarPerfil
} from "../dados/perfil.js";
import {COR, COR_HEX, FONTE} from "../dados/tema.js";
import {aplicarPerfil, montarPrevia} from "../ui/montarJogador.js";

const NOMES = {
    masculino: "Masculino",
    feminino: "Feminino",
    curto_liso: "Curto liso",
    franja_reta: "Franja reta",
    raspado: "Raspado",
    coque_alto: "Coque alto",
    coque_baixo: "Coque baixo",
    topete: "Topete",
    rabo_cavalo: "Rabo de cavalo",
    camiseta: "Camiseta",
    moletom: "Moletom",
    jaqueta: "Jaqueta",
    calca: "Calça",
    shorts: "Shorts",
    saia_curta: "Saia curta",
    saia_longa: "Saia longa"
};

const BOTOES = [
    {id: "sortear", titulo: "SORTEAR"},
    {id: "reset", titulo: "RESET"},
    {id: "confirmar", titulo: "CONFIRMAR"}
];

// chance de o sorteio pôr óculos
const CHANCE_DE_OCULOS = 1 / 3;

// colunas e linhas da lista, à direita
const ESQUERDA_DA_LISTA = 380;
const LARGURA_DA_LISTA = 556;
const COLUNA_DO_ROTULO = 394;
const RECUO_DO_ROTULO = 16;
const COLUNA_DA_SETA = 596;
const COLUNA_DO_VALOR = 616;
const COLUNA_DA_OUTRA_SETA = 846;

// quadrados das paletas
const COLUNA_DOS_QUADRADOS = 600;
const LADO_DO_QUADRADO = 20;
const PASSO_DO_QUADRADO = 25;
const TOPO_DA_LISTA = 56;
const ALTURA_DA_LINHA = 28;
const ESPACO_ENTRE_LINHAS = 2;
const TOPO_DOS_BOTOES = 452;
const LARGURA_DO_BOTAO = 172;
const ALTURA_DO_BOTAO = 34;

// prévia, à esquerda: listras em cima, faixa do nome embaixo
const ESQUERDA_DA_PREVIA = 24;
const LARGURA_DA_PREVIA = 332;
const ALTURA_DA_FAIXA_DO_NOME = 48;
const ESCALA_DO_CORPO = 8;

// listras diagonais, alternando duas cores, num ladrilho que se repete: as
// da prévia com 8 px, as do conta-gotas sem cor com 4
const LISTRAS = {
    listras_da_previa: {ladrilho: 16, largura: 8},
    listras_do_quadrado: {ladrilho: 8, largura: 4}
};

// conta-gotas, em pixels: # é o desenho; o contorno claro é calculado
const DESENHO_DO_CONTA_GOTAS = [
    ".........##.",
    "........####",
    ".......#####",
    ".....#.####.",
    "......###...",
    ".....###....",
    "....##.#....",
    "...##.......",
    "..##........",
    ".##.........",
    ".#..........",
    "............"
];

const LARGURA_DO_CAMPO = 150;
const COLUNA_DO_ERRO = COLUNA_DO_VALOR + LARGURA_DO_CAMPO + 10;

function corNumerica(cor) {
    return parseInt(cor.slice(1), 16);
}

function copiar(aparencia) {
    return Object.assign({}, aparencia);
}

// marcas dos quadrados especiais de uma paleta
const NENHUMA = "nenhuma";
const CONTA_GOTAS = "conta-gotas";

// as cores da aparência que não estão entre as sugeridas, por categoria
function coresLivres(aparencia) {
    const livres = {};
    Object.keys(CORES_PADRAO).forEach(function (categoria) {
        const cor = aparencia[categoria];
        const sugerida = CORES_PADRAO[categoria].some(function (item) {
            return item.cor === cor;
        });
        livres[categoria] = cor && !sugerida ? cor : null;
    });
    return livres;
}

// "a", "a e b", "a, b e c"
function juntar(partes) {
    if (partes.length < 2) {
        return partes.join("");
    }
    return partes.slice(0, -1).join(", ") + " e " + partes[partes.length - 1];
}

function corCss(cor) {
    return "#" + cor.toString(16).padStart(6, "0");
}

// desenha pixel a pixel, para as diagonais saírem nítidas
function criarTexturaDePixels(cena, chave, largura, altura, corDoPixel) {
    if (cena.textures.exists(chave)) {
        return;
    }

    const textura = cena.textures.createCanvas(chave, largura, altura);
    const contexto = textura.getContext();
    for (let y = 0; y < altura; y++) {
        for (let x = 0; x < largura; x++) {
            const cor = corDoPixel(x, y);
            if (cor !== null) {
                contexto.fillStyle = corCss(cor);
                contexto.fillRect(x, y, 1, 1);
            }
        }
    }
    textura.refresh();
}

function criarTexturas(cena) {
    Object.keys(LISTRAS).forEach(function (chave) {
        const listra = LISTRAS[chave];
        criarTexturaDePixels(cena, chave, listra.ladrilho, listra.ladrilho, function (x, y) {
            return (x + y) % listra.ladrilho < listra.largura ? COR_HEX.listraEscura : COR_HEX.listraClara;
        });
    });

    // o contorno claro deixa o ícone visível sobre qualquer cor
    const desenho = DESENHO_DO_CONTA_GOTAS;
    const cheio = function (x, y) {
        return desenho[y] !== undefined && desenho[y][x] === "#";
    };
    criarTexturaDePixels(cena, "conta_gotas", desenho[0].length, desenho.length, function (x, y) {
        if (cheio(x, y)) {
            return COR_HEX.contorno;
        }
        const vizinho = cheio(x - 1, y) || cheio(x + 1, y) || cheio(x, y - 1) || cheio(x, y + 1);
        return vizinho ? COR_HEX.painel : null;
    });
}

export class CenaEditor extends Phaser.Scene {

    constructor() {
        super({key: "CenaEditor"});
    }

    // depois: cena aberta ao confirmar; voltar: cena aberta pelo ESC
    init(dados) {
        this.depois = (dados && dados.depois) || "CenaMenu";
        this.voltar = (dados && dados.voltar) || "CenaMenu";
    }

    create() {
        const perfil = perfilDoJogador(this.registry);

        this.aparencia = copiar(perfil ? perfil.aparencia : APARENCIA_PADRAO);
        this.nome = perfil ? perfil.nome : "";
        this.pronome = perfil ? perfil.pronome : null;
        this.personalizadas = coresLivres(this.aparencia);
        this.indice = 0;
        this.botao = BOTOES.length - 1;
        this.digitando = false;

        this.definirLinhas();
        montarPrevia(this, this.aparencia);

        this.montarMoldura();
        this.montarPrevia();
        this.montarLinhas();
        this.montarBotoes();
        this.montarCampos();
        this.criarControles();
        this.atualizar();
    }

    // ------------------------------------------------------------------
    // linhas

    // cada linha lê e grava o seu valor; ativa diz se ela vale agora. As de
    // paleta mostram as cores lado a lado, em quadrados
    definirLinhas() {
        const cena = this;
        const opcao = function (id, rotulo, valores, campo) {
            return {
                id: id,
                rotulo: rotulo,
                tipo: "opcao",
                valores: valores,
                ler: function () {
                    return cena.aparencia[campo];
                },
                gravar: function (valor) {
                    cena.aparencia[campo] = valor;
                }
            };
        };
        // sem cores próprias nas opções, usa as sugeridas da categoria
        const paleta = function (id, rotulo, campo, opcoes) {
            const linha = Object.assign({
                id: id,
                rotulo: rotulo,
                tipo: "paleta",
                campo: campo,
                comSeletor: true,
                comNenhum: false,
                recuo: false
            }, opcoes);
            linha.cores = linha.cores || CORES_PADRAO[campo].map(function (item) {
                return item.cor;
            });
            return linha;
        };

        this.linhas = [
            {id: "nome", rotulo: "Nome", tipo: "nome"},
            {
                id: "pronome",
                rotulo: "Tratamento",
                tipo: "opcao",
                valores: PRONOMES,
                ler: function () {
                    return cena.pronome;
                },
                gravar: function (valor) {
                    cena.pronome = valor;
                }
            },
            paleta("pele", "Pele", "pele", {cores: TONS_DE_PELE, comSeletor: false}),
            opcao("estilo", "Cabelo", ESTILOS_DE_CABELO, "estiloDeCabelo"),
            paleta("cabelo", "Cor do cabelo", "cabelo"),
            opcao("cima", "Parte de cima", Object.keys(PECAS_DE_CIMA), "pecaDeCima"),
            paleta("superior", "Cor primária", "superior", {recuo: true}),
            paleta("interna", "Cor secundária", "interna", {
                recuo: true,
                ativa: function () {
                    return (PECAS_DE_CIMA[cena.aparencia.pecaDeCima] || []).length > 1;
                }
            }),
            opcao("baixo", "Parte de baixo", Object.keys(PECAS_DE_BAIXO), "pecaDeBaixo"),
            paleta("inferior", "Cor primária", "inferior", {recuo: true}),
            paleta("oculos", "Óculos", "oculos", {comNenhum: true}),
            {id: "botoes", tipo: "botoes"}
        ];
    }

    linhaAtiva(linha) {
        return !linha.ativa || linha.ativa();
    }

    textoDoValor(linha) {
        const valor = linha.ler();
        if (linha.id === "pronome" && valor === null) {
            return "escolha com ← →";
        }
        return NOMES[valor] || String(valor);
    }

    // quadrados de uma paleta, da esquerda para a direita: nenhum (o X),
    // as cores sugeridas e o conta-gotas
    quadrados(linha) {
        const lista = linha.comNenhum ? [NENHUMA] : [];
        return lista.concat(linha.cores, linha.comSeletor ? [CONTA_GOTAS] : []);
    }

    // o quadrado da cor atual; uma cor fora das sugeridas é o conta-gotas
    quadradoAtual(linha) {
        const atual = this.aparencia[linha.campo];
        const quadrados = this.quadrados(linha);

        if (atual === null) {
            return quadrados.indexOf(NENHUMA);
        }
        const indice = quadrados.indexOf(atual);
        return indice >= 0 ? indice : quadrados.indexOf(CONTA_GOTAS);
    }

    // aplica um quadrado; o conta-gotas aplica a última cor livre, se houver
    escolher(linha, quadrado) {
        if (quadrado === NENHUMA) {
            this.aparencia[linha.campo] = null;
        } else if (quadrado === CONTA_GOTAS) {
            const livre = this.personalizadas[linha.campo];
            if (!livre) {
                return false;
            }
            this.aparencia[linha.campo] = livre;
        } else {
            this.aparencia[linha.campo] = quadrado;
        }
        return true;
    }

    // ← → numa linha; nas paletas, de quadrado em quadrado, pulando o
    // conta-gotas enquanto não houver cor livre
    trocar(linha, passo) {
        if (!this.linhaAtiva(linha)) {
            return;
        }

        if (linha.tipo === "paleta") {
            const quadrados = this.quadrados(linha).filter(function (quadrado) {
                return quadrado !== CONTA_GOTAS || this.personalizadas[linha.campo];
            }, this);
            const atual = quadrados.indexOf(this.quadrados(linha)[this.quadradoAtual(linha)]);
            this.escolher(linha, quadrados[(atual + passo + quadrados.length) % quadrados.length]);
        } else if (linha.tipo === "opcao") {
            const atual = linha.valores.indexOf(linha.ler());
            const proximo = atual < 0
                ? (passo > 0 ? 0 : linha.valores.length - 1)
                : (atual + passo + linha.valores.length) % linha.valores.length;
            linha.gravar(linha.valores[proximo]);
        } else if (linha.tipo === "botoes") {
            this.botao = Phaser.Math.Clamp(this.botao + passo, 0, BOTOES.length - 1);
        }

        this.atualizar();
    }

    // ENTER numa linha
    acionar(linha) {
        if (linha.tipo === "nome") {
            this.campoDoNome.focus();
        } else if (linha.tipo === "paleta" && linha.comSeletor) {
            this.abrirSeletor(linha);
        } else if (linha.tipo === "opcao") {
            this.trocar(linha, 1);
        } else if (linha.tipo === "botoes") {
            this.apertar(BOTOES[this.botao].id);
        }
    }

    // ↑ ↓, pulando as linhas que não valem agora
    mover(passo) {
        let proximo = this.indice;

        do {
            proximo += passo;
        } while (proximo >= 0 && proximo < this.linhas.length && !this.linhaAtiva(this.linhas[proximo]));

        if (proximo >= 0 && proximo < this.linhas.length) {
            this.indice = proximo;
            this.atualizar();
        }
    }

    // ------------------------------------------------------------------
    // botões

    apertar(id) {
        if (id === "sortear") {
            this.sortear();
        } else if (id === "reset") {
            this.restaurar();
        } else if (id === "confirmar") {
            this.confirmar();
        }
    }

    // aparência ao acaso, entre as opções e as cores sugeridas, e um nome
    // sugerido; o nome segue o tratamento escolhido, que o sorteio não muda
    sortear() {
        const sortear = Phaser.Utils.Array.GetRandom;
        const nomes = (this.pronome ? NOMES_SUGERIDOS[this.pronome]
            : NOMES_SUGERIDOS.masculino.concat(NOMES_SUGERIDOS.feminino)).filter(function (nome) {
            return nome !== this.nome;
        }, this);

        this.nome = sortear(nomes);
        this.campoDoNome.value = this.nome;
        const cor = function (categoria) {
            return sortear(CORES_PADRAO[categoria]).cor;
        };

        this.aparencia = {
            pele: sortear(TONS_DE_PELE),
            estiloDeCabelo: sortear(ESTILOS_DE_CABELO),
            cabelo: cor("cabelo"),
            pecaDeCima: sortear(Object.keys(PECAS_DE_CIMA)),
            superior: cor("superior"),
            interna: cor("interna"),
            pecaDeBaixo: sortear(Object.keys(PECAS_DE_BAIXO)),
            inferior: cor("inferior"),
            oculos: Math.random() < CHANCE_DE_OCULOS ? cor("oculos") : null
        };
        this.atualizar();
    }

    // o personagem padrão, sem nome e sem tratamento
    restaurar() {
        this.aparencia = copiar(APARENCIA_PADRAO);
        this.personalizadas = coresLivres(this.aparencia);
        this.nome = "";
        this.pronome = null;
        this.campoDoNome.value = "";
        this.atualizar();
    }

    pendencias() {
        const faltam = [];
        const erro = erroDoNome(this.nome);

        if (erro) {
            faltam.push(erro === "falta o nome" ? "o nome" : "um nome válido");
        }
        if (!this.pronome) {
            faltam.push("o tratamento");
        }
        if (!aparenciaValida(this.aparencia)) {
            faltam.push("corrigir a aparência");
        }
        return faltam;
    }

    perfilEditado() {
        return {nome: normalizarNome(this.nome), pronome: this.pronome, aparencia: copiar(this.aparencia)};
    }

    // só sai para o jogo com perfil completo: nome válido, tratamento escolhido
    // e aparência dentro do catálogo
    confirmar() {
        const perfil = this.perfilEditado();

        if (this.pendencias().length > 0 || !perfilValido(perfil)) {
            this.atualizar();
            return;
        }

        const gravou = salvarPerfil(this.registry, perfil);

        if (gravou) {
            aplicarPerfil(this);
            this.scene.start(this.depois);
        }
    }

    sair() {
        this.scene.start(this.voltar);
    }

    // ------------------------------------------------------------------
    // montagem

    montarMoldura() {
        this.add.rectangle(0, 0, 960, 540, COR_HEX.fundo).setOrigin(0, 0);

        const barra = this.add.graphics();
        barra.fillStyle(COR_HEX.painel, 1);
        barra.fillRect(0, 0, 960, 40);
        barra.lineStyle(2, COR_HEX.contorno, 1);
        barra.lineBetween(0, 40, 960, 40);

        const estilo = {fontFamily: FONTE, fontSize: "14px", color: COR.texto};
        this.add.text(24, 13, "PERSONAGEM", estilo);
        this.add.text(936, 13, "ESC VOLTA SEM SALVAR", estilo).setOrigin(1, 0);

        this.add.text(480, 516,
            "↑ ↓ escolhem, ← → trocam, ENTER edita o nome ou abre o conta-gotas", {
                fontFamily: FONTE,
                fontSize: "12px",
                color: COR.textoSecundario
            }).setOrigin(0.5, 0);
    }

    // o personagem grande, parado, sobre as listras
    montarPrevia() {
        const altura = TOPO_DOS_BOTOES + ALTURA_DO_BOTAO - TOPO_DA_LISTA;
        const alturaDasListras = altura - ALTURA_DA_FAIXA_DO_NOME;
        const centro = ESQUERDA_DA_PREVIA + LARGURA_DA_PREVIA / 2;

        criarTexturas(this);
        this.add.tileSprite(ESQUERDA_DA_PREVIA, TOPO_DA_LISTA, LARGURA_DA_PREVIA, alturaDasListras,
            "listras_da_previa").setOrigin(0, 0);
        this.add.rectangle(ESQUERDA_DA_PREVIA, TOPO_DA_LISTA + alturaDasListras, LARGURA_DA_PREVIA,
            ALTURA_DA_FAIXA_DO_NOME, COR_HEX.painel).setOrigin(0, 0);
        this.add.rectangle(ESQUERDA_DA_PREVIA, TOPO_DA_LISTA, LARGURA_DA_PREVIA, altura)
            .setOrigin(0, 0).setStrokeStyle(1, COR_HEX.contornoSuave);

        this.add.image(centro, TOPO_DA_LISTA + alturaDasListras / 2, "previa", 0)
            .setScale(ESCALA_DO_CORPO);

        this.rotuloDoNome = this.add.text(centro, TOPO_DA_LISTA + alturaDasListras + ALTURA_DA_FAIXA_DO_NOME / 2, "", {
            fontFamily: FONTE,
            fontSize: "16px",
            color: COR.texto
        }).setOrigin(0.5, 0.5);
    }

    montarLinhas() {
        this.visuais = this.linhas.map(function (linha, indice) {
            if (linha.tipo === "botoes") {
                return null;
            }

            const y = TOPO_DA_LISTA + indice * (ALTURA_DA_LINHA + ESPACO_ENTRE_LINHAS);
            const meio = y + ALTURA_DA_LINHA / 2;
            const texto = {fontFamily: FONTE, fontSize: "13px", color: COR.texto};

            const fundo = this.add.rectangle(ESQUERDA_DA_LISTA, y, LARGURA_DA_LISTA, ALTURA_DA_LINHA,
                COR_HEX.painel).setOrigin(0, 0).setInteractive({useHandCursor: true});
            fundo.on("pointerdown", function () {
                this.selecionarLinha(indice);
                if (linha.tipo === "nome") {
                    this.campoDoNome.focus();
                }
            }, this);

            const recuo = linha.recuo ? RECUO_DO_ROTULO : 0;
            const visual = {
                fundo: fundo,
                rotulo: this.add.text(COLUNA_DO_ROTULO + recuo, meio, linha.rotulo, texto).setOrigin(0, 0.5)
            };

            if (linha.tipo === "nome") {
                visual.erro = this.add.text(COLUNA_DO_ERRO, meio, "", {
                    fontFamily: FONTE,
                    fontSize: "11px",
                    color: COR.alerta
                }).setOrigin(0, 0.5);
                return visual;
            }

            visual.valor = this.add.text(COLUNA_DO_VALOR, meio, "", texto).setOrigin(0, 0.5);

            if (linha.tipo === "paleta") {
                visual.quadrados = this.montarQuadrados(linha, indice, meio);
                visual.anel = this.add.rectangle(0, meio, LADO_DO_QUADRADO + 6, LADO_DO_QUADRADO + 6)
                    .setStrokeStyle(2, COR_HEX.destaque);
                return visual;
            }

            visual.setas = [
                this.criarSeta(COLUNA_DA_SETA, meio, "‹", linha, indice, -1),
                this.criarSeta(COLUNA_DA_OUTRA_SETA, meio, "›", linha, indice, 1)
            ];
            return visual;
        }, this);
    }

    // um quadrado por cor; o X e o conta-gotas têm desenho próprio
    montarQuadrados(linha, indice, meio) {
        return this.quadrados(linha).map(function (quadrado, posicao) {
            const x = COLUNA_DOS_QUADRADOS + posicao * PASSO_DO_QUADRADO + LADO_DO_QUADRADO / 2;
            const lado = LADO_DO_QUADRADO;
            const partes = [];
            const fundo = this.add.rectangle(x, meio, lado, lado,
                quadrado === NENHUMA || quadrado === CONTA_GOTAS ? COR_HEX.painel : corNumerica(quadrado));
            partes.push(fundo);

            let listras = null;
            if (quadrado === CONTA_GOTAS) {
                listras = this.add.tileSprite(x, meio, lado, lado, "listras_do_quadrado");
                partes.push(listras, this.add.image(x, meio, "conta_gotas"));
            } else if (quadrado === NENHUMA) {
                const xis = this.add.graphics();
                xis.lineStyle(2, COR_HEX.contorno, 1);
                xis.lineBetween(x - 6, meio - 6, x + 6, meio + 6);
                xis.lineBetween(x + 6, meio - 6, x - 6, meio + 6);
                partes.push(xis);
            }

            const borda = this.add.rectangle(x, meio, lado, lado).setStrokeStyle(1, COR_HEX.contorno)
                .setInteractive({useHandCursor: true});
            partes.push(borda);
            borda.on("pointerdown", function () {
                this.selecionarLinha(indice);
                const aplicou = this.escolher(linha, quadrado);
                if (quadrado === CONTA_GOTAS) {
                    this.abrirSeletor(linha);
                }
                if (aplicou) {
                    this.atualizar();
                }
            }, this);

            return {quadrado: quadrado, x: x, fundo: fundo, listras: listras, partes: partes};
        }, this);
    }

    criarSeta(x, y, simbolo, linha, indice, passo) {
        const seta = this.add.text(x, y, simbolo, {
            fontFamily: FONTE,
            fontSize: "18px",
            color: COR.destaque
        }).setOrigin(0.5, 0.5).setInteractive({useHandCursor: true});

        seta.on("pointerdown", function () {
            this.selecionarLinha(indice);
            this.trocar(linha, passo);
        }, this);
        return seta;
    }

    montarBotoes() {
        const largura = BOTOES.length * LARGURA_DO_BOTAO + (BOTOES.length - 1) * 20;
        const esquerda = ESQUERDA_DA_LISTA + (LARGURA_DA_LISTA - largura) / 2;
        const indiceDaLinha = this.linhas.length - 1;

        this.mensagem = this.add.text(ESQUERDA_DA_LISTA + LARGURA_DA_LISTA / 2, TOPO_DOS_BOTOES - 22, "", {
            fontFamily: FONTE,
            fontSize: "12px",
            color: COR.textoSecundario
        }).setOrigin(0.5, 0);

        this.botoes = BOTOES.map(function (botao, posicao) {
            const x = esquerda + posicao * (LARGURA_DO_BOTAO + 20);
            const fundo = this.add.rectangle(x, TOPO_DOS_BOTOES, LARGURA_DO_BOTAO, ALTURA_DO_BOTAO,
                COR_HEX.painel).setOrigin(0, 0).setInteractive({useHandCursor: true});
            const titulo = this.add.text(x + LARGURA_DO_BOTAO / 2, TOPO_DOS_BOTOES + ALTURA_DO_BOTAO / 2,
                botao.titulo, {fontFamily: FONTE, fontSize: "13px", color: COR.texto}).setOrigin(0.5, 0.5);

            fundo.on("pointerdown", function () {
                this.botao = posicao;
                this.selecionarLinha(indiceDaLinha);
                this.apertar(botao.id);
            }, this);

            return {fundo: fundo, titulo: titulo, id: botao.id};
        }, this);
    }

    // o campo do nome e o seletor de cor, em HTML por cima do canvas
    montarCampos() {
        const cena = this;
        const linhaDoNome = this.linhas.findIndex(function (linha) {
            return linha.tipo === "nome";
        });
        const meio = TOPO_DA_LISTA + linhaDoNome * (ALTURA_DA_LINHA + ESPACO_ENTRE_LINHAS) + ALTURA_DA_LINHA / 2;

        const campo = document.createElement("input");
        campo.type = "text";
        campo.value = this.nome;
        campo.maxLength = TAMANHO_DO_NOME.maximo + 4;
        campo.autocomplete = "off";
        campo.spellcheck = false;
        campo.setAttribute("aria-label", "Nome do personagem");
        Object.assign(campo.style, {
            width: LARGURA_DO_CAMPO + "px",
            height: "20px",
            boxSizing: "border-box",
            padding: "0 4px",
            border: "1px solid " + COR.contornoSuave,
            background: COR.painel,
            color: COR.texto,
            font: "13px " + FONTE,
            outline: "none"
        });
        this.add.dom(COLUNA_DO_VALOR, meio, campo).setOrigin(0, 0.5);
        this.campoDoNome = campo;

        campo.addEventListener("input", function () {
            cena.nome = campo.value;
            cena.atualizar();
        });
        campo.addEventListener("focus", function () {
            cena.digitando = true;
            cena.input.keyboard.resetKeys();
            cena.selecionarLinha(linhaDoNome);
            campo.style.borderColor = COR.destaque;
        });
        campo.addEventListener("blur", function () {
            cena.digitando = false;
            cena.nome = normalizarNome(campo.value);
            campo.value = cena.nome;
            campo.style.borderColor = COR.contornoSuave;
            cena.atualizar();
        });

        // o que se digita não chega ao jogo; ENTER, ESC, ↑ ↓ e TAB saem do
        // campo. O keyup passa, para o jogo não achar que a tecla ficou presa
        campo.addEventListener("keydown", function (evento) {
            evento.stopPropagation();
            const saida = {Enter: 1, Tab: 1, ArrowDown: 1, ArrowUp: -1, Escape: 0};
            if (evento.key in saida) {
                evento.preventDefault();
                campo.blur();
                if (saida[evento.key] !== 0) {
                    cena.mover(saida[evento.key]);
                }
            }
        });
        const seletor = document.createElement("input");
        seletor.type = "color";
        Object.assign(seletor.style, {width: "1px", height: "1px", border: "0", padding: "0", opacity: "0"});
        this.seletor = seletor;
        this.ancoraDoSeletor = this.add.dom(COLUNA_DOS_QUADRADOS, meio, seletor);

        // a cor livre fica guardada no conta-gotas, mesmo depois de trocar
        // para uma sugerida
        seletor.addEventListener("input", function () {
            if (cena.campoDoSeletor) {
                const cor = seletor.value.toLowerCase();
                cena.personalizadas[cena.campoDoSeletor] = cor;
                cena.aparencia[cena.campoDoSeletor] = cor;
                cena.atualizar();
            }
        });
    }

    abrirSeletor(linha) {
        if (!this.linhaAtiva(linha) || !linha.comSeletor) {
            return;
        }

        const indice = this.linhas.indexOf(linha);
        const quadrados = this.visuais[indice].quadrados;
        this.campoDoSeletor = linha.campo;
        this.seletor.value = this.personalizadas[linha.campo] || this.aparencia[linha.campo] || linha.cores[0];
        this.ancoraDoSeletor.setPosition(quadrados[quadrados.length - 1].x,
            TOPO_DA_LISTA + indice * (ALTURA_DA_LINHA + ESPACO_ENTRE_LINHAS) + ALTURA_DA_LINHA);

        try {
            this.seletor.showPicker();
        } catch (erro) {
            this.seletor.click();
        }
    }

    selecionarLinha(indice) {
        if (this.linhaAtiva(this.linhas[indice])) {
            this.indice = indice;
            this.atualizar();
        }
    }

    // ------------------------------------------------------------------
    // atualização

    atualizar() {
        if (!this.linhaAtiva(this.linhas[this.indice])) {
            this.mover(-1);
            return;
        }

        // uma aparência fora do catálogo não se desenha; a prévia fica na última
        // válida e o CONFIRMAR, bloqueado
        if (aparenciaValida(this.aparencia)) {
            montarPrevia(this, this.aparencia);
        }
        this.rotuloDoNome.setText(normalizarNome(this.nome) || "sem nome");
        this.atualizarLinhas();
        this.atualizarBotoes();
    }

    atualizarLinhas() {
        this.linhas.forEach(function (linha, indice) {
            const visual = this.visuais[indice];
            if (!visual) {
                return;
            }

            const selecionada = indice === this.indice;
            const ativa = this.linhaAtiva(linha);
            visual.fundo.setFillStyle(selecionada ? COR_HEX.selecao : COR_HEX.painel);
            visual.fundo.setStrokeStyle(selecionada ? 2 : 1, selecionada ? COR_HEX.destaque : COR_HEX.contornoSuave);
            visual.rotulo.setAlpha(ativa ? 1 : 0.4);

            if (linha.tipo === "nome") {
                const erro = erroDoNome(this.nome);
                visual.erro.setText(normalizarNome(this.nome) && erro ? erro : "");
                return;
            }

            if (linha.tipo === "paleta") {
                this.atualizarQuadrados(linha, visual, ativa);
                return;
            }

            visual.valor.setText(this.textoDoValor(linha));
            visual.valor.setColor(linha.id === "pronome" && !this.pronome ? COR.textoSecundario : COR.texto);
        }, this);
    }

    // o anel marca a cor atual; o conta-gotas mostra a cor livre, ou listras
    // enquanto não houver uma
    atualizarQuadrados(linha, visual, ativa) {
        visual.valor.setText(ativa ? "" : "—").setAlpha(0.4);
        visual.anel.setVisible(ativa);

        visual.quadrados.forEach(function (item, posicao) {
            item.partes.forEach(function (parte) {
                parte.setVisible(ativa);
            });
            if (posicao === this.quadradoAtual(linha)) {
                visual.anel.setX(item.x);
            }
            if (item.quadrado === CONTA_GOTAS) {
                const livre = this.personalizadas[linha.campo];
                item.listras.setVisible(ativa && !livre);
                item.fundo.setFillStyle(livre ? corNumerica(livre) : COR_HEX.painel);
            }
        }, this);
    }

    atualizarBotoes() {
        const naLinha = this.linhas[this.indice].tipo === "botoes";
        const faltam = this.pendencias();

        this.botoes.forEach(function (botao, posicao) {
            const selecionado = naLinha && posicao === this.botao;
            const bloqueado = botao.id === "confirmar" && faltam.length > 0;
            botao.fundo.setFillStyle(selecionado ? COR_HEX.selecao : COR_HEX.painel);
            botao.fundo.setStrokeStyle(selecionado ? 3 : 1, selecionado ? COR_HEX.destaque : COR_HEX.contornoSuave);
            botao.titulo.setAlpha(bloqueado ? 0.4 : 1);
        }, this);

        this.mensagem.setText(faltam.length > 0 ? "Para confirmar, falta " + juntar(faltam) : "");
    }

    // ------------------------------------------------------------------
    // teclado

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

    update() {
        if (this.digitando) {
            return;
        }

        const apertou = Phaser.Input.Keyboard.JustDown;
        const linha = this.linhas[this.indice];

        if (apertou(this.teclas.sair)) {
            this.sair();
        } else if (apertou(this.teclas.cima)) {
            this.mover(-1);
        } else if (apertou(this.teclas.baixo)) {
            this.mover(1);
        } else if (apertou(this.teclas.esquerda)) {
            this.trocar(linha, -1);
        } else if (apertou(this.teclas.direita)) {
            this.trocar(linha, 1);
        } else if (apertou(this.teclas.acao) || apertou(this.teclas.espaco)) {
            this.acionar(linha);
        }
    }
}
