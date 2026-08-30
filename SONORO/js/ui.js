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
});

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

    let artistasEmAndamento = Object.values(catalogosCache).filter(c => c.status === 'carregando');

    if (artistasEmAndamento.length === 0) {
        if (barraMain) barraMain.style.width = `100%`;
        if (txtMain) txtMain.innerText = "Faixas prontas!";
        setTimeout(() => {
            let aindaTem = Object.values(catalogosCache).filter(c => c.status === 'carregando').length;
            if (aindaTem === 0 && painelMain) painelMain.style.display = "none";
        }, 800);
        return;
    }

    painelMain.style.display = "block";
    let soma = artistasEmAndamento.reduce((acc, curr) => acc + curr.progresso, 0);
    let mediaGlobal = Math.floor(soma / artistasEmAndamento.length);

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
            if (artistaIdAtual === idArtista && catalogosCache[idArtista].status === 'concluido') {
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

function alterarArtista() {
    artistaIdAtual = document.getElementById("seletor-artista").value;
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
                <div class="badge-baixado">✓</div>
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

function filtrarGridArtistas() {
    const termo = document.getElementById("input-busca-catalogo").value;
    renderizarGridArtistas(termo);
}

function abrirModalArtista(id, nome) {
    artistaIdAtual = id;
    document.getElementById("seletor-artista").value = id;
    document.getElementById("modal-nome-artista").innerText = nome;
    document.getElementById("modal-modo").classList.add("ativo");
    carregarCatalogo();
}

function fecharModalModo() {
    document.getElementById("modal-modo").classList.remove("ativo");
}

function fecharModalEstiloResposta() {
    document.getElementById("modal-estilo-resposta").classList.remove("ativo");
}