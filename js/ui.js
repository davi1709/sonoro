// uiui 😘
function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}

function toggleHelpTooltip(el, e) {
    e.stopPropagation();
    const estaAtivo = el.classList.contains('ativo');
    document.querySelectorAll('.btn-help-info').forEach(b => b.classList.remove('ativo'));
    if (!estaAtivo) {
        el.classList.add('ativo');
    }
}

document.addEventListener('click', () => {
    document.querySelectorAll('.btn-help-info').forEach(b => b.classList.remove('ativo'));
});

document.addEventListener('click', (e) => {
    const container = document.getElementById("autocomplete-artistas");
    if (container && !e.target.closest('.add-deezer-box')) {
        container.style.display = "none";
    }
    const containerPl = document.getElementById("autocomplete-playlists");
    if (containerPl && !e.target.closest('.add-deezer-box')) {
        containerPl.style.display = "none";
    }
});

function alternarMenuPrincipal(menu) {
    tipoMenuAtual = menu;
    const btnArtistas = document.getElementById("btn-menu-artistas");
    const btnPlaylists = document.getElementById("btn-menu-playlists");
    const secaoArtistas = document.getElementById("secao-artistas");
    const secaoPlaylists = document.getElementById("secao-playlists");

    if (menu === 'artistas') {
        btnArtistas.className = "btn-modo-classico";
        btnPlaylists.className = "btn-modo-vazado";
        secaoArtistas.style.display = "block";
        secaoPlaylists.style.display = "none";
        renderizarGridArtistas();
    } else {
        btnPlaylists.className = "btn-modo-classico";
        btnArtistas.className = "btn-modo-vazado";
        secaoPlaylists.style.display = "block";
        secaoArtistas.style.display = "none";
        renderizarGridPlaylists();
    }
}

function iniciarFluxoJogo() {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    mostrarTela('tela-inicio');
}

function abrirTelaComoJogar() {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
    mostrarTela('tela-como-jogar');
}

function voltarParaSplash() {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'flex';
}

function mostrarTela(idTela) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    document.getElementById(idTela).classList.add('ativa');
}

function voltarAoMenuArtistas() {
    if (loopTempo) cancelAnimationFrame(loopTempo);
    if (timeoutAudio) clearTimeout(timeoutAudio);
    if (loopProgressoTrecho) cancelAnimationFrame(loopProgressoTrecho);
    player.pause();
    pararAnimacaoOndas();
    rodadaAtiva = false;
    mostrarTela('tela-inicio');
}

function sairDaPartida() {
    if (!confirm("Sair da partida atual? O progresso desta partida será perdido.")) return;
    voltarAoMenuArtistas();
}

function jogarNovamente() {
    iniciarPartida();
}

function atualizarProgressoGlobalUI() {
    const barraMain = document.getElementById("barra-progresso-carga");
    const txtMain = document.getElementById("loading-txt");
    const painelMain = document.getElementById("painel-carregamento");

    let cacheAtivoDict = tipoMenuAtual === 'artistas' ? catalogosCache : catalogosPlaylistsCache;
    let itensEmAndamento = Object.values(cacheAtivoDict).filter(c => c.status === 'carregando');

    if (itensEmAndamento.length === 0) {
        if (barraMain) barraMain.style.width = `100%`;
        if (txtMain) txtMain.innerText = "Faixas prontas!";
        setTimeout(() => {
            let aindaTem = Object.values(cacheAtivoDict).filter(c => c.status === 'carregando').length;
            if (aindaTem === 0 && painelMain) painelMain.style.display = "none";
        }, 800);
        return;
    }

    painelMain.style.display = "block";
    let soma = itensEmAndamento.reduce((acc, curr) => acc + curr.progresso, 0);
    let mediaGlobal = Math.floor(soma / itensEmAndamento.length);

    if (barraMain) barraMain.style.width = `${mediaGlobal}%`;
    if (txtMain) txtMain.innerText = `Carregando faixas...`;
}

function atualizarModalUI(idArtista) {
    const cacheObj = catalogosCache[idArtista];
    if (!cacheObj) return;

    const barraModal = document.getElementById("modal-barra-progresso-carga");
    const txtModal = document.getElementById("modal-loading-txt");
    const btnClassico = document.getElementById("btn-modal-classico");
    const btnCustom = document.getElementById("btn-modal-custom");
    const btnZen = document.getElementById("btn-modal-zen");
    const modalPainelCarga = document.getElementById("modal-painel-carregamento");

    if (cacheObj.status === 'concluido') {
        if (barraModal) barraModal.style.width = `100%`;
        if (txtModal) txtModal.innerText = "Faixas prontas!";
        if (btnClassico) btnClassico.disabled = false;
        if (btnCustom) btnCustom.disabled = false;
        if (btnZen) btnZen.disabled = false;
        setTimeout(() => {
            if (tipoMenuAtual === 'artistas' && artistaIdAtual === idArtista && catalogosCache[idArtista].status === 'concluido') {
                if (modalPainelCarga) modalPainelCarga.style.display = "none";
            }
        }, 300);
    } else {
        if (modalPainelCarga) modalPainelCarga.style.display = "block";
        if (barraModal) barraModal.style.width = `${cacheObj.progresso}%`;
        if (txtModal) txtModal.innerText = "Carregando faixas...";
        if (btnClassico) btnClassico.disabled = true;
        if (btnCustom) btnCustom.disabled = true;
        if (btnZen) btnZen.disabled = true;
    }
}

function atualizarModalUIPlaylist(idPlaylist) {
    const cacheObj = catalogosPlaylistsCache[idPlaylist];
    if (!cacheObj) return;

    const barraModal = document.getElementById("modal-barra-progresso-carga");
    const txtModal = document.getElementById("modal-loading-txt");
    const btnClassico = document.getElementById("btn-modal-classico");
    const btnCustom = document.getElementById("btn-modal-custom");
    const btnZen = document.getElementById("btn-modal-zen");
    const modalPainelCarga = document.getElementById("modal-painel-carregamento");

    if (cacheObj.status === 'concluido') {
        if (barraModal) barraModal.style.width = `100%`;
        if (txtModal) txtModal.innerText = "Faixas prontas!";
        if (btnClassico) btnClassico.disabled = false;
        if (btnCustom) btnCustom.disabled = false;
        if (btnZen) btnZen.disabled = false;
        setTimeout(() => {
            if (tipoMenuAtual === 'playlists' && playlistIdAtual === idPlaylist && catalogosPlaylistsCache[idPlaylist].status === 'concluido') {
                if (modalPainelCarga) modalPainelCarga.style.display = "none";
            }
        }, 300);
    } else {
        if (modalPainelCarga) modalPainelCarga.style.display = "block";
        if (barraModal) barraModal.style.width = `${cacheObj.progresso}%`;
        if (txtModal) txtModal.innerText = "Carregando faixas...";
        if (btnClassico) btnClassico.disabled = true;
        if (btnCustom) btnCustom.disabled = true;
        if (btnZen) btnZen.disabled = true;
    }
}

function atualizarDatalistEAlbuns() {
    let datalist = document.getElementById("lista-musicas");
    datalist.innerHTML = "";
    const nomesUnicos = bancoDeMusicas.map(m => m.nomeExibicao).sort();
    nomesUnicos.forEach(nome => {
        const option = document.createElement("option");
        option.value = nome;
        datalist.appendChild(option);
    });

    const containerFiltro = document.getElementById("lista-albuns-filtro");
    containerFiltro.innerHTML = "";

    if (tipoMenuAtual === 'artistas') {
        const cardEPs = document.createElement("div");
        cardEPs.className = "card-clicavel card-especial";
        cardEPs.id = "grupo-ep";
        cardEPs.innerHTML = `<span class="nome-card-central">EPs</span>`;
        cardEPs.onclick = () => cardEPs.classList.toggle("inativo");
        containerFiltro.appendChild(cardEPs);

        const cardSingles = document.createElement("div");
        cardSingles.className = "card-clicavel card-especial";
        cardSingles.id = "grupo-single";
        cardSingles.innerHTML = `<span class="nome-card-central">Singles</span>`;
        cardSingles.onclick = () => cardSingles.classList.toggle("inativo");
        containerFiltro.appendChild(cardSingles);

        albunsDisponiveis.forEach(alb => {
            const div = document.createElement("div");
            div.className = "card-clicavel card-album";
            div.dataset.ids = alb.idsGrupo.join(',');
            div.innerHTML = `
                <img src="${alb.capa || 'https://e-cdns-images.dzcdn.net/images/cover/100x100-000000-80-0-0.jpg'}" alt="${alb.titulo}">
                <span class="nome-card">${alb.titulo}</span>
            `;
            div.onclick = () => div.classList.toggle("inativo");
            containerFiltro.appendChild(div);
        });
    }
}

function alterarArtista() {
    artistaIdAtual = document.getElementById("seletor-artista").value;
    carregarCatalogo();
}

function alterarPlaylist() {
    playlistIdAtual = document.getElementById("seletor-playlist").value;
    carregarCatalogo();
}

async function renderizarGridArtistas(filtro = "") {
    const grid = document.getElementById("grid-artistas");
    grid.innerHTML = "";

    const termoFiltro = filtro.toLowerCase().trim();

    for (let art of listaArtistasPadrão) {
        if (termoFiltro && !art.nome.toLowerCase().includes(termoFiltro)) {
            continue;
        }

        if (!art.foto) {
            try {
                let res = await buscarDeezer(`https://api.deezer.com/artist/${art.id}`);
                if (res && res.picture_medium) {
                    art.foto = res.picture_medium;
                }
            } catch (e) {
                art.foto = "https://e-cdns-images.dzcdn.net/images/artist/default/100x100-000000-80-0-0.jpg";
            }
        }

        const card = document.createElement("div");
        card.className = "card-artista";
        card.id = `card-art-${art.id}`;
        card.onclick = () => abrirModalArtista(art.id, art.nome);
        card.innerHTML = `
            <div class="thumb-wrapper">
                <img src="${art.foto || 'https://e-cdns-images.dzcdn.net/images/artist/default/100x100-000000-80-0-0.jpg'}" alt="${art.nome}">
                <div class="badge-baixado">&#10003;</div>
                <div class="overlay-carregando">
                    <div class="mini-barra-bg">
                        <div class="mini-barra-fill" id="mini-fill-${art.id}"></div>
                    </div>
                </div>
            </div>
            <span class="nome-artista">${art.nome}</span>
        `;

        if (catalogosCache[art.id]) {
            if (catalogosCache[art.id].status === 'carregando') {
                card.classList.add("carregando");
            } else if (catalogosCache[art.id].status === 'concluido') {
                card.classList.add("baixado");
            }
        }

        grid.appendChild(card);
    }
}

async function renderizarGridPlaylists(filtro = "") {
    const grid = document.getElementById("grid-playlists");
    grid.innerHTML = "";

    const termoFiltro = filtro.toLowerCase().trim();

    listaPlaylistsPadrao.sort((a, b) => b.fas - a.fas);

    for (let pl of listaPlaylistsPadrao) {
        if (termoFiltro && !pl.titulo.toLowerCase().includes(termoFiltro)) {
            continue;
        }

        if (!pl.capa) {
            try {
                let res = await buscarDeezer(`https://api.deezer.com/playlist/${pl.id}`);
                if (res && res.picture_medium) {
                    pl.capa = res.picture_medium;
                    if (res.nb_tracks) pl.fas = res.nb_tracks;
                }
            } catch (e) {
                pl.capa = "https://e-cdns-images.dzcdn.net/images/playlist/000000-80-0-0.jpg";
            }
        }

        const card = document.createElement("div");
        card.className = "card-playlist-horizontal";
        card.id = `card-playlist-${pl.id}`;
        card.onclick = () => abrirModalPlaylist(pl.id, pl.titulo);
        card.innerHTML = `
            <div class="thumb-wrapper-playlist">
                <img src="${pl.capa || 'https://e-cdns-images.dzcdn.net/images/playlist/000000-80-0-0.jpg'}" alt="${pl.titulo}">
                <div class="badge-baixado-playlist">&#10003;</div>
                <div class="overlay-carregando-playlist">
                    <div class="mini-barra-bg">
                        <div class="mini-barra-fill" id="mini-fill-playlist-${pl.id}"></div>
                    </div>
                </div>
            </div>
            <span class="nome-playlist">${pl.titulo}</span>
        `;

        if (catalogosPlaylistsCache[pl.id]) {
            if (catalogosPlaylistsCache[pl.id].status === 'carregando') {
                card.classList.add("carregando");
            } else if (catalogosPlaylistsCache[pl.id].status === 'concluido') {
                card.classList.add("baixado");
            }
        }

        grid.appendChild(card);
    }
}

function filtrarGridArtistas() {
    const termo = document.getElementById("input-busca-catalogo").value;
    renderizarGridArtistas(termo);
}

function filtrarGridPlaylists() {
    const termo = document.getElementById("input-busca-catalogo-playlist").value;
    renderizarGridPlaylists(termo);
}

function abrirModalArtista(id, nome) {
    tipoMenuAtual = 'artistas';
    artistaIdAtual = id;
    artistaSelecionadoNome = nome; 
    document.getElementById("seletor-artista").value = id;
    document.getElementById("modal-nome-artista").innerText = nome;
    document.getElementById("modal-modo").classList.add("ativo");
    carregarCatalogo();
}

function abrirModalPlaylist(id, titulo) {
    tipoMenuAtual = 'playlists';
    playlistIdAtual = id;
    artistaSelecionadoNome = titulo; 
    document.getElementById("seletor-playlist").value = id;
    document.getElementById("modal-nome-artista").innerText = titulo;
    document.getElementById("modal-modo").classList.add("ativo");
    carregarCatalogo();
}

function fecharModalModo() {
    document.getElementById("modal-modo").classList.remove("ativo");
}

function fecharModalEstiloResposta() {
    document.getElementById("modal-estilo-resposta").classList.remove("ativo");
}

let modoRankingAtual = 'digitar';

function abrirModalSubmeterRanking() {
    const modal = document.getElementById("modal-submeter-ranking");
    if (modal) {
        modal.classList.add("ativo");
        const input = document.getElementById("input-nome-ranking");
        if (input) {
            input.value = "";
            input.focus();
        }
    }
}

function fecharModalSubmeterRanking() {
    const modal = document.getElementById("modal-submeter-ranking");
    if (modal) {
        modal.classList.remove("ativo");
    }
}

async function enviarScoreFirebase() {
    const inputNome = document.getElementById("input-nome-ranking");
    const apelido = inputNome ? inputNome.value.trim() : "";

    if (!apelido) {
        alert("Por favor, insira um apelido antes de enviar!");
        return;
    }

    if (scoreFinalPartida === undefined || scoreFinalPartida === null || typeof modoRankingAtual === 'undefined') { 
        alert("Erro ao identificar os dados da partida. Jogue novamente.");
        return;
    }

    const nomeColecao = modoRankingAtual === 'marcar' ? 'ranking_classico_marcar' : 'ranking_classico_digitar';

    try {
        const btnEnviar = document.querySelector("#modal-submeter-ranking .btn-modo-classico");
        if (btnEnviar) btnEnviar.disabled = true;

        let labelSubmissao = tipoMenuAtual === 'playlists' ? `Playlist: ${artistaSelecionadoNome}` : `Artista: ${artistaSelecionadoNome}`;

        await db.collection(nomeColecao).add({
            nome: apelido,
            score: Number(scoreFinalPartida),
            artista: labelSubmissao,
            data: new Date().toLocaleDateString('pt-BR')
        });

        if (btnEnviar) btnEnviar.disabled = false;
        
        fecharModalSubmeterRanking();
        abrirTelaRanking(modoRankingAtual);

    } catch (e) {
        console.error("Erro ao enviar score:", e);
        alert("Erro ao enviar pontuação. Verifique sua conexão.");
        const btnEnviar = document.querySelector("#modal-submeter-ranking .btn-modo-classico");
        if (btnEnviar) btnEnviar.disabled = false;
    }
}

async function abrirTelaRanking(modo = 'digitar') {
    modoRankingAtual = modo;
    mostrarTela('tela-ranking');
    
    const btnDigitar = document.getElementById("tab-ranking-digitar");
    const btnMarcar = document.getElementById("tab-ranking-marcar");
    if (btnDigitar && btnMarcar) {
        btnDigitar.style.opacity = modo === 'digitar' ? '1' : '0.5';
        btnMarcar.style.opacity = modo === 'marcar' ? '1' : '0.5';
    }

    const containerRanking = document.getElementById("lista-ranking-global");
    containerRanking.innerHTML = `<p style="text-align: center; color: #888; padding: 20px;">Carregando ranking...</p>`;

    try {
        const nomeColecao = modo === 'marcar' ? 'ranking_classico_marcar' : 'ranking_classico_digitar';
        
        const snapshot = await db.collection(nomeColecao).orderBy("score", "desc").limit(50).get();
        
        containerRanking.innerHTML = "";

        if (snapshot.empty) {
            containerRanking.innerHTML = `<p style="text-align: center; color: #888; padding: 20px;">Nenhuma pontuação registrada neste modo ainda.</p>`;
            return;
        }

        let contador = 1;
        snapshot.forEach((doc) => {
            let item = doc.data();
            let posicaoReal = contador++;
            
            let pontuacaoValida = Number(item.score);
            if (isNaN(pontuacaoValida)) pontuacaoValida = 0;
            
            const div = document.createElement("div");
            div.className = "item-historico";
            div.style.cursor = "default";
            div.innerHTML = `
                <div style="font-weight: bold; font-size: 15px; color: #ff0055; width: 30px; text-align: center;">#${posicaoReal}</div>
                <div class="info-track" style="margin-left: 8px;">
                    <div class="title" style="font-size: 14px;">${escapeHtml(item.nome || "Anônimo")} - <span style="color: #1db954;">${pontuacaoValida}pts</span></div>
                    <div class="status" style="color: #aaa;">${escapeHtml(item.artista || "Desconhecido")} | Feito em: ${item.data || "N/A"}</div>
                </div>
            `;
            containerRanking.appendChild(div);
        });

    } catch (e) {
        console.error("Erro detalhado ao buscar ranking:", e);
        containerRanking.innerHTML = `<p style="text-align: center; color: #ff4d4d; padding: 20px;">Erro ao carregar o ranking. Veja o console (F12).</p>`;
    }
}
