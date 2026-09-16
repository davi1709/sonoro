// i18n - sistema de tradução PT-BR / EN
let idiomaAtual = localStorage.getItem('sonoro_idioma') || (
    (navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'pt'
);

const traducoes = {
    pt: {
        // Splash / Como Jogar
        jogar: "JOGAR",
        como_jogar_btn: "COMO JOGAR",
        como_jogar_titulo: "COMO JOGAR",
        como_jogar_item1_forte: "Escolha um Artista ou Playlist:",
        como_jogar_item1_texto: "Selecione o item entre a lista ou adicione um novo diretamente na barra superior.",
        como_jogar_item2_forte: "Ouça o Trecho:",
        como_jogar_item2_texto: "Aperte o play para ouvir uma amostra rápida da música (de 1 a 10 segundos).",
        como_jogar_item3_forte: "Adivinhe Rápido:",
        como_jogar_item3_texto: "Digite o nome da música ou marque uma das opções antes que o tempo acabe!",
        como_jogar_item4_forte: "Acumule Pontos:",
        como_jogar_item4_texto: "Quanto mais rápido você acertar, menor for o trecho e menos você ouvi-lo, maior será sua pontuação. Teste seus conhecimentos musicais!",
        jogar_agora: "JOGAR AGORA",

        // Navegação genérica
        voltar_arrow: "&larr; VOLTAR",
        menu_arrow: "&larr; MENU",
        voltar: "VOLTAR",

        // Tela início
        badge_novo: "NOVO!",
        btn_artistas: "ARTISTAS",
        btn_playlists: "PLAYLISTS",
        lbl_add_artista: "Adicionar Novo Artista (Nome ou ID Deezer):",
        placeholder_add_artista: "Ex: ABBA, Kali Uchis...",
        btn_adicionar: "Adicionar",
        lbl_catalogo_artistas: "Catálogo de Artistas:",
        placeholder_busca_catalogo: "Buscar no catálogo...",
        lbl_add_playlist: "Adicionar Nova Playlist (Nome ou ID Deezer):",
        placeholder_add_playlist: "Ex: Top Pop, ID da playlist...",
        btn_adicionar_playlist: "Adicionar",
        lbl_catalogo_playlists: "Catálogo de Playlists:",
        placeholder_busca_playlist: "Buscar playlist...",
        carregando_faixas: "Carregando faixas...",
        faixas_prontas: "Faixas prontas!",

        // Modal modo
        modal_titulo_padrao: "Artista / Playlist",
        modal_escolha_modo: "Escolha o modo de jogo para começar:",
        modo_classico_titulo: "MODO CLÁSSICO",
        modo_classico_desc: "Acerte a música antes que o tempo acabe! Quanto menor o trecho e menos você ouvi-lo, mais pontos!",
        modo_custom_titulo: "MODO PERSONALIZADO",
        modo_custom_desc: "Personalize sua experiência selecionando tempo, inclusão de álbuns e até mesmo a duração de trechos.",
        modo_zen_titulo: "MODO ZEN",
        modo_zen_desc: "Jogue com calma! Com trechos de grande duração e sem timers, agora você pode demorar o quanto quiser para responder.",

        // Modal estilo de resposta
        estilo_resposta_titulo: "Estilo de Resposta",
        estilo_resposta_pergunta: "Como deseja responder durante a partida?",
        btn_digitar_resposta: "DIGITAR RESPOSTA",
        btn_marcar_opcoes: "MARCAR (5 OPÇÕES)",

        // Tela config (modo personalizado)
        lbl_estilo_resposta: "Estilo de Resposta:",
        btn_digitar: "DIGITAR",
        btn_marcar: "MARCAR",
        lbl_filtro_albuns: "Filtrar por Álbuns, EPs e Singles:",
        lbl_tempo_trecho: "Tempo do trecho de áudio (segundos)",
        opt_1s: "1 Segundo",
        opt_2s: "2 Segundos",
        opt_3s: "3 Segundos",
        opt_4s: "4 Segundos",
        opt_5s: "5 Segundos",
        opt_6s: "6 Segundos",
        opt_7s: "7 Segundos",
        opt_8s: "8 Segundos",
        opt_9s: "9 Segundos",
        opt_10s: "10 Segundos",
        opt_ajustavel: "Ajustável (como no Modo Clássico)",
        lbl_duracao_resposta: "Duração para responder (segundos)",
        opt_10s_dur: "10 Segundos",
        opt_15s_dur: "15 Segundos",
        opt_20s_dur: "20 Segundos",
        opt_30s_dur: "30 Segundos",
        lbl_qtd_musicas: "Quantidade de Músicas",
        opt_5_musicas: "5 Músicas",
        opt_10_musicas: "10 Músicas",
        opt_15_musicas: "15 Músicas",
        btn_iniciar_partida: "INICIAR PARTIDA",

        // Tela jogo
        lbl_rodada: "Rodada:",
        lbl_pontos: "Pontos:",
        lbl_play: "PLAY",
        placeholder_resposta: "Qual é a música?",
        btn_enviar_enter: "ENVIAR (ENTER)",
        btn_ouvir_trecho: "OUVIR TRECHO",
        btn_ouvir_musica: "OUVIR MÚSICA (30s)",
        btn_proxima_musica: "PRÓXIMA MÚSICA ➔",
        btn_ver_estatisticas: "VER ESTATÍSTICAS",

        // Tela fim
        resumo_desempenho: "Resumo do seu desempenho:",
        stat_pontuacao_final: "Pontuação Final",
        stat_musicas_acertadas: "Músicas Acertadas",
        stat_tempo_medio: "Tempo Médio (Acertos)",
        stat_mais_rapida: "Mais Rápida",
        historico_partida: "Histórico da Partida:",
        btn_enviar_ranking: "ENVIAR PONTUAÇÃO AO RANKING",
        btn_jogar_novamente: "JOGAR NOVAMENTE",

        // Tela ranking
        titulo_ranking_global: "RANKING GLOBAL - MODO CLÁSSICO",
        tab_modo_digitar: "Modo Digitar",
        tab_modo_marcar: "Modo Marcar",
        carregando_ranking: "Carregando ranking...",
        btn_voltar_menu: "VOLTAR AO MENU",
        ranking_vazio: "Nenhuma pontuação registrada neste modo ainda.",
        anonimo: "Anônimo",
        desconhecido: "Desconhecido",
        feito_em: "Feito em:",
        erro_carregar_ranking: "Erro ao carregar o ranking. Veja o console (F12).",

        // Modal submissão ranking
        titulo_salvar_pontuacao: "Salvar Pontuação",
        txt_insira_apelido: "Insira seu apelido para aparecer no ranking global:",
        placeholder_apelido: "Seu apelido...",
        btn_enviar: "ENVIAR",

        // Mensagens dinâmicas do jogo
        msg_selecione_opcao: "Selecione pelo menos uma opção para jogar!",
        msg_tempo_esgotado: "Tempo esgotado!",
        msg_resposta_incorreta: "Resposta incorreta!",
        lbl_musica_revelada: "Música:",
        msg_sair_partida: "Sair da partida atual? O progresso desta partida será perdido.",
        msg_erro_enviar_pontuacao: "Erro ao enviar pontuação. Verifique sua conexão.",

        // Deezer
        album_desconhecido: "Álbum Desconhecido",
        musicas_playlist: "músicas"
    },
    en: {
        jogar: "PLAY",
        como_jogar_btn: "HOW TO PLAY",
        como_jogar_titulo: "HOW TO PLAY",
        como_jogar_item1_forte: "Choose an Artist or Playlist:",
        como_jogar_item1_texto: "Select an item from the list or add a new one directly in the top bar.",
        como_jogar_item2_forte: "Listen to the Snippet:",
        como_jogar_item2_texto: "Press play to hear a quick sample of the song (1 to 10 seconds).",
        como_jogar_item3_forte: "Guess Fast:",
        como_jogar_item3_texto: "Type the song name or pick one of the options before time runs out!",
        como_jogar_item4_forte: "Rack Up Points:",
        como_jogar_item4_texto: "The faster you guess, the shorter the snippet, and the less you listen to it, the higher your score. Test your music knowledge!",
        jogar_agora: "PLAY NOW",

        voltar_arrow: "&larr; BACK",
        menu_arrow: "&larr; MENU",
        voltar: "BACK",

        badge_novo: "NEW!",
        btn_artistas: "ARTISTS",
        btn_playlists: "PLAYLISTS",
        lbl_add_artista: "Add New Artist (Name or Deezer ID):",
        placeholder_add_artista: "E.g.: ABBA, Kali Uchis...",
        btn_adicionar: "Add",
        lbl_catalogo_artistas: "Artist Catalog:",
        placeholder_busca_catalogo: "Search catalog...",
        lbl_add_playlist: "Add New Playlist (Name or Deezer ID):",
        placeholder_add_playlist: "E.g.: Top Pop, playlist ID...",
        btn_adicionar_playlist: "Add",
        lbl_catalogo_playlists: "Playlist Catalog:",
        placeholder_busca_playlist: "Search playlists...",
        carregando_faixas: "Loading tracks...",
        faixas_prontas: "Tracks ready!",

        modal_titulo_padrao: "Artist / Playlist",
        modal_escolha_modo: "Choose the game mode to start:",
        modo_classico_titulo: "CLASSIC MODE",
        modo_classico_desc: "Guess the song before time runs out! The shorter the snippet and the less you listen to it, the more points you get!",
        modo_custom_titulo: "CUSTOM MODE",
        modo_custom_desc: "Customize your experience by choosing the time limit, which albums to include, and even the snippet length.",
        modo_zen_titulo: "ZEN MODE",
        modo_zen_desc: "Play at your own pace! With longer snippets and no timers, you can take as long as you want to answer.",

        estilo_resposta_titulo: "Answer Style",
        estilo_resposta_pergunta: "How would you like to answer during the game?",
        btn_digitar_resposta: "TYPE ANSWER",
        btn_marcar_opcoes: "MULTIPLE CHOICE (5 OPTIONS)",

        lbl_estilo_resposta: "Answer Style:",
        btn_digitar: "TYPE",
        btn_marcar: "CHOOSE",
        lbl_filtro_albuns: "Filter by Albums, EPs and Singles:",
        lbl_tempo_trecho: "Audio snippet length (seconds)",
        opt_1s: "1 Second",
        opt_2s: "2 Seconds",
        opt_3s: "3 Seconds",
        opt_4s: "4 Seconds",
        opt_5s: "5 Seconds",
        opt_6s: "6 Seconds",
        opt_7s: "7 Seconds",
        opt_8s: "8 Seconds",
        opt_9s: "9 Seconds",
        opt_10s: "10 Seconds",
        opt_ajustavel: "Adjustable (like Classic Mode)",
        lbl_duracao_resposta: "Time to answer (seconds)",
        opt_10s_dur: "10 Seconds",
        opt_15s_dur: "15 Seconds",
        opt_20s_dur: "20 Seconds",
        opt_30s_dur: "30 Seconds",
        lbl_qtd_musicas: "Number of Songs",
        opt_5_musicas: "5 Songs",
        opt_10_musicas: "10 Songs",
        opt_15_musicas: "15 Songs",
        btn_iniciar_partida: "START GAME",

        lbl_rodada: "Round:",
        lbl_pontos: "Points:",
        lbl_play: "PLAY",
        placeholder_resposta: "What's the song?",
        btn_enviar_enter: "SUBMIT (ENTER)",
        btn_ouvir_trecho: "LISTEN TO SNIPPET",
        btn_ouvir_musica: "LISTEN TO SONG (30s)",
        btn_proxima_musica: "NEXT SONG ➔",
        btn_ver_estatisticas: "VIEW STATS",

        resumo_desempenho: "Summary of your performance:",
        stat_pontuacao_final: "Final Score",
        stat_musicas_acertadas: "Songs Correct",
        stat_tempo_medio: "Average Time (Correct)",
        stat_mais_rapida: "Fastest",
        historico_partida: "Match History:",
        btn_enviar_ranking: "SUBMIT SCORE TO RANKING",
        btn_jogar_novamente: "PLAY AGAIN",

        titulo_ranking_global: "GLOBAL RANKING - CLASSIC MODE",
        tab_modo_digitar: "Type Mode",
        tab_modo_marcar: "Choice Mode",
        carregando_ranking: "Loading ranking...",
        btn_voltar_menu: "BACK TO MENU",
        ranking_vazio: "No scores recorded in this mode yet.",
        anonimo: "Anonymous",
        desconhecido: "Unknown",
        feito_em: "Done on:",
        erro_carregar_ranking: "Error loading ranking. Check the console (F12).",

        titulo_salvar_pontuacao: "Save Score",
        txt_insira_apelido: "Enter your nickname to appear on the global ranking:",
        placeholder_apelido: "Your nickname...",
        btn_enviar: "SUBMIT",

        msg_selecione_opcao: "Select at least one option to play!",
        msg_tempo_esgotado: "Time's up!",
        msg_resposta_incorreta: "Incorrect answer!",
        lbl_musica_revelada: "Song:",
        msg_sair_partida: "Leave the current match? Your progress will be lost.",
        msg_erro_enviar_pontuacao: "Error submitting score. Check your connection.",

        album_desconhecido: "Unknown Album",
        musicas_playlist: "tracks"
    }
};

function t(chave) {
    const dict = traducoes[idiomaAtual] || traducoes.pt;
    if (dict[chave] !== undefined) return dict[chave];
    if (traducoes.pt[chave] !== undefined) return traducoes.pt[chave];
    return chave;
}

function aplicarIdioma() {
    document.documentElement.lang = idiomaAtual === 'en' ? 'en' : 'pt-BR';

    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    atualizarBotaoIdioma();
}

function alternarIdioma(novoIdioma) {
    if (novoIdioma === idiomaAtual) return;
    idiomaAtual = novoIdioma;
    localStorage.setItem('sonoro_idioma', idiomaAtual);
    aplicarIdioma();
}

function atualizarBotaoIdioma() {
    const btnPt = document.getElementById('btn-idioma-pt');
    const btnEn = document.getElementById('btn-idioma-en');
    if (!btnPt || !btnEn) return;
    btnPt.classList.toggle('idioma-ativo', idiomaAtual === 'pt');
    btnEn.classList.toggle('idioma-ativo', idiomaAtual === 'en');
}

document.addEventListener('DOMContentLoaded', aplicarIdioma);
