// Configurações
//
// São da máquina, não da partida: ficam guardadas à parte e não somem com
// "Nova partida", só com o "Limpar tudo". Se o navegador bloquear o
// armazenamento, valem até a página ser recarregada. Também guardam se o guia
// de entrada já foi visto neste navegador.

const CHAVE_NO_NAVEGADOR = "jogo-scrum:configuracoes";

// volumes de 0 a 10
export const VOLUME_MAXIMO = 10;

const PADRAO = {
    volumeMusica: 5,
    volumeEfeitos: 8,
    volumeVozes: 8,
    mostrarFps: false,
    guiaVisto: false
};

let atuais = null;

export function lerConfiguracoes() {
    if (atuais) {
        return atuais;
    }

    atuais = Object.assign({}, PADRAO);

    try {
        const texto = window.localStorage.getItem(CHAVE_NO_NAVEGADOR);
        Object.assign(atuais, texto ? JSON.parse(texto) : {});
    } catch (erro) {
        return atuais;
    }

    return atuais;
}

export function salvarConfiguracao(chave, valor) {
    const configuracoes = lerConfiguracoes();
    configuracoes[chave] = valor;

    try {
        window.localStorage.setItem(CHAVE_NO_NAVEGADOR, JSON.stringify(configuracoes));
    } catch (erro) {
        return configuracoes;
    }

    return configuracoes;
}

// O guia de entrada abre sozinho uma vez por navegador
export function guiaJaVisto() {
    return Boolean(lerConfiguracoes().guiaVisto);
}

export function marcarGuiaVisto() {
    return salvarConfiguracao("guiaVisto", true);
}
