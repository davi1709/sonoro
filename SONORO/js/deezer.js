function normalizarNome(str) {
    if (!str) return "";
    return str.toLowerCase()
        .replace(/\(.*\)/g, '')
        .replace(/\[.*\]/g, '')
        .replace(/-\s*(slowed|sped up|remix|version|smashup|mashup|live|demo|edit).*/gi, '')
        .replace(/\s+(pt\.?\s*\d+|\d+)$/gi, '')
        .replace(/[^\w\s]/gi, '')
        .trim();
}

function ehVersaoAlternativa(titulo) {
    return /-\s*(slowed|sped up|remix|version|smashup|mashup|live|demo|edit)/i.test(titulo);
}

function buscarDeezer(url) {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        const callbackName = 'cb_' + Math.random().toString(36).substr(2, 9);
        window[callbackName] = function(data) {
            resolve(data);
            delete window[callbackName];
            if (script.parentNode) document.body.removeChild(script);
        };
        script.onerror = function() {
            resolve(null);
            delete window[callbackName];
            if (script.parentNode) document.body.removeChild(script);
        };
        script.src = `${url}&output=jsonp&callback=${callbackName}`;
        document.body.appendChild(script);
    });
}

async function carregarCatalogo() {
    const idArtista = artistaIdAtual;
    
    if (!catalogosCache[idArtista]) {
        catalogosCache[idArtista] = {
            status: 'carregando',
            progresso: 10,
            bancoDeMusicas: [],
            albunsDisponiveis: []
        };
        iniciarDownloadArtista(idArtista);
    }

    const cacheObj = catalogosCache[idArtista];

    if (cacheObj.status === 'concluido') {
        bancoDeMusicas = cacheObj.bancoDeMusicas;
        albunsDisponiveis = cacheObj.albunsDisponiveis;
        atualizarDatalistEAlbuns();
    }

    atualizarModalUI(idArtista);
    atualizarProgressoGlobalUI();
}

async function iniciarDownloadArtista(idArtista) {
    let cacheObj = catalogosCache[idArtista];
    let listaProcessada = new Map();
    let gruposAlbuns = new Map();

    const cardEl = document.getElementById(`card-art-${idArtista}`);
    if (cardEl) {
        cardEl.classList.add("carregando");
        cardEl.classList.remove("baixado");
    }

    let albuns = [];
    let index = 0;
    let totalMax = 300;

    while (index < totalMax) {
        let resAlbuns = await buscarDeezer(`https://api.deezer.com/artist/${idArtista}/albums?limit=100&index=${index}`);
        if (resAlbuns && resAlbuns.data && resAlbuns.data.length > 0) {
            albuns = albuns.concat(resAlbuns.data);
            if (resAlbuns.next && resAlbuns.data.length === 100) {
                index += 100;
            } else {
                break;
            }
        } else {
            break;
        }
    }

    let totalAlbuns = albuns.length;

    if (totalAlbuns > 0) {
        for (let i = 0; i < totalAlbuns; i++) {
            let album = albuns[i];
            let tipoGrupo = "album";
            
            if (album.record_type === "ep") tipoGrupo = "ep";
            else if (album.record_type === "single") tipoGrupo = "single";

            let chaveGrupo = album.title ? album.title.trim().toLowerCase() : String(album.id);

            if (!gruposAlbuns.has(chaveGrupo)) {
                gruposAlbuns.set(chaveGrupo, { 
                    titulo: album.title || "Álbum Desconhecido", 
                    capa: album.cover_medium || album.cover || '', 
                    ids: [],
                    tipo: tipoGrupo
                });
            }
            gruposAlbuns.get(chaveGrupo).ids.push(album.id);

            let resFaixas = await buscarDeezer(`https://api.deezer.com/album/${album.id}/tracks?limit=100`);

            if (resFaixas && resFaixas.data) {
                resFaixas.data.forEach(track => {
                    if (track.preview) {
                        let nomeBase = normalizarNome(track.title);
                        if (nomeBase.length > 0) {
                            const existente = listaProcessada.get(nomeBase);
                            if (!existente || (ehVersaoAlternativa(existente.nomeExibicao) && !ehVersaoAlternativa(track.title))) {
                                listaProcessada.set(nomeBase, {
                                    nomeNormalizado: nomeBase,
                                    nomeExibicao: track.title,
                                    preview: track.preview,
                                    albumId: album.id,
                                    capa: album.cover_medium || (album.cover ? album.cover : ''),
                                    tipoGrupo: tipoGrupo
                                });
                            }
                        }
                    }
                });
            }

            let pct = Math.floor(((i + 1) / totalAlbuns) * 100);
            cacheObj.progresso = pct;

            const miniFill = document.getElementById(`mini-fill-${idArtista}`);
            if (miniFill) miniFill.style.width = `${pct}%`;

            if (artistaIdAtual === idArtista) {
                atualizarModalUI(idArtista);
            }

            atualizarProgressoGlobalUI();
        }
    }

    if (listaProcessada.size < 5) {
        let resTop = await buscarDeezer(`https://api.deezer.com/artist/${idArtista}/top?limit=100`);
        if (resTop && resTop.data) {
            resTop.data.forEach(track => {
                if (track.preview) {
                    let nomeBase = normalizarNome(track.title);
                    if (nomeBase.length > 0) {
                        const albId = track.album ? track.album.id : 0;
                        const albTitulo = track.album ? track.album.title : "Outros";
                        const albCapa = track.album ? track.album.cover_medium : "";

                        if (albId && !gruposAlbuns.has(albTitulo.toLowerCase())) {
                            gruposAlbuns.set(albTitulo.toLowerCase(), {
                                titulo: albTitulo,
                                capa: albCapa,
                                ids: [albId],
                                tipo: "album"
                            });
                        }

                        listaProcessada.set(nomeBase, {
                            nomeNormalizado: nomeBase,
                            nomeExibicao: track.title,
                            preview: track.preview,
                            albumId: albId,
                            capa: albCapa,
                            tipoGrupo: 'album'
                        });
                    }
                }
            });
        }
    }

    cacheObj.bancoDeMusicas = Array.from(listaProcessada.values());
    
    cacheObj.albunsDisponiveis = Array.from(gruposAlbuns.values())
        .filter(g => g.tipo === "album")
        .map(grupo => ({
            id: grupo.ids[0],
            idsGrupo: grupo.ids,
            titulo: grupo.titulo,
            capa: grupo.capa,
            tipo: "album"
        }));
    
    cacheObj.status = 'concluido';
    cacheObj.progresso = 100;

    const miniFillFinal = document.getElementById(`mini-fill-${idArtista}`);
    if (miniFillFinal) miniFillFinal.style.width = `100%`;

    const cardElFinal = document.getElementById(`card-art-${idArtista}`);
    if (cardElFinal) {
        cardElFinal.classList.remove("carregando");
        cardElFinal.classList.add("baixado");
    }

    if (artistaIdAtual === idArtista) {
        bancoDeMusicas = cacheObj.bancoDeMusicas;
        albunsDisponiveis = cacheObj.albunsDisponiveis;
        atualizarDatalistEAlbuns();
        atualizarModalUI(idArtista);
    }

    atualizarProgressoGlobalUI();
}

let debounceTimer;
async function buscarSugestoesArtista(query) {
    clearTimeout(debounceTimer);
    const container = document.getElementById("autocomplete-artistas");
    if (!query || query.trim().length < 2 || /^\d+$/.test(query.trim())) {
        container.style.display = "none";
        return;
    }

    debounceTimer = setTimeout(async () => {
        let res = await buscarDeezer(`https://api.deezer.com/search/artist?q=${encodeURIComponent(query)}&limit=6`);
        if (res && res.data && res.data.length > 0) {
            container.innerHTML = "";
            res.data.forEach(art => {
                const item = document.createElement("div");
                item.className = "autocomplete-item";
                item.innerHTML = `
                    <img src="${art.picture_small || art.picture_medium}" alt="${art.name}">
                    <span>${art.name}</span>
                `;
                item.onclick = (e) => {
                    e.stopPropagation();
                    container.style.display = "none";
                    document.getElementById("input-deezer-id").value = "";
                    adicionarArtistaDiretoPeloObjeto(art);
                };
                container.appendChild(item);
            });
            container.style.display = "block";
        } else {
            container.style.display = "none";
        }
    }, 300);
}

async function adicionarArtistaDiretoPeloObjeto(artObj) {
    const idStr = String(artObj.id);
    const nomeStr = artObj.name;

    const jaExiste = listaArtistasPadrão.find(a => String(a.id) === idStr);
    if (jaExiste) {
        abrirModalArtista(jaExiste.id, jaExiste.nome);
        return;
    }

    const novo = {
        id: idStr,
        nome: nomeStr,
        foto: artObj.picture_medium || artObj.picture || artObj.picture_small
    };

    listaArtistasPadrão.unshift(novo);

    const seletor = document.getElementById("seletor-artista");
    const opt = document.createElement("option");
    opt.value = idStr;
    opt.innerText = nomeStr;
    seletor.appendChild(opt);

    document.getElementById("input-busca-catalogo").value = "";
    await renderizarGridArtistas();

    abrirModalArtista(idStr, nomeStr);
}

async function adicionarArtistaDeezer() {
    const input = document.getElementById("input-deezer-id");
    const btn = document.getElementById("btn-add-artista");
    const entrada = input.value.trim();

    if (!entrada) {
        alert("Digite o nome ou ID do artista!");
        return;
    }

    btn.disabled = true;
    btn.innerText = "...";

    try {
        let artistaEncontrado = null;

        if (/^\d+$/.test(entrada)) {
            let res = await buscarDeezer(`https://api.deezer.com/artist/${entrada}`);
            if (res && res.id) artistaEncontrado = res;
        } else {
            let res = await buscarDeezer(`https://api.deezer.com/search/artist?q=${encodeURIComponent(entrada)}`);
            if (res && res.data && res.data.length > 0) {
                artistaEncontrado = res.data[0];
            }
        }

        if (artistaEncontrado && artistaEncontrado.id) {
            input.value = "";
            await adicionarArtistaDiretoPeloObjeto(artistaEncontrado);
        } else {
            alert("Nenhum artista encontrado com essa busca.");
        }
    } catch (e) {
        alert("Erro ao buscar o artista.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Adicionar";
    }
}