// share.js - Geração da imagem de resultado (estilo "recap") pra compartilhar

function _tShare(chave, fallback) {
    if (typeof t === 'function') {
        try {
            const valor = t(chave);
            if (valor && valor !== chave) return valor;
        } catch (e) { /* ignora e usa fallback */ }
    }
    return fallback;
}

function _desenharRetanguloArredondado(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(x, y, w, h, r);
    } else {
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
    }
    ctx.closePath();
}

function _carregarImagem(src, comCors) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        if (comCors) img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Busca dados da Deezer via JSONP (a API da Deezer não libera fetch() direto)
function _buscarDeezerJsonp(url) {
    return new Promise((resolve) => {
        const separador = url.includes('?') ? '&' : '?';
        const script = document.createElement('script');
        const callbackName = 'cbShare_' + Math.random().toString(36).substr(2, 9);
        window[callbackName] = function (data) {
            resolve(data);
            delete window[callbackName];
            if (script.parentNode) document.body.removeChild(script);
        };
        script.onerror = function () {
            resolve(null);
            delete window[callbackName];
            if (script.parentNode) document.body.removeChild(script);
        };
        script.src = `${url}${separador}output=jsonp&callback=${callbackName}`;
        document.body.appendChild(script);
    });
}

async function _buscarFotoItemAtual() {
    try {
        if (typeof tipoMenuAtual !== 'undefined' && tipoMenuAtual === 'playlists') {
            const dados = await _buscarDeezerJsonp(`https://api.deezer.com/playlist/${playlistIdAtual}`);
            return dados ? (dados.picture_medium || dados.picture) : null;
        } else {
            const dados = await _buscarDeezerJsonp(`https://api.deezer.com/artist/${artistaIdAtual}`);
            return dados ? (dados.picture_medium || dados.picture) : null;
        }
    } catch (e) {
        return null;
    }
}

function _classificarRodada(item) {
    if (!item.acertou) return "#ff4d4d";
    if (item.tempo >= 0 && item.tempo <= 5) return "#1db954";
    return "#ffcc00";
}

function _truncarTexto(ctx, texto, larguraMax) {
    if (ctx.measureText(texto).width <= larguraMax) return texto;
    let truncado = texto;
    while (truncado.length > 1 && ctx.measureText(truncado + "…").width > larguraMax) {
        truncado = truncado.slice(0, -1);
    }
    return truncado + "…";
}

function _desenharTiledeMusica(ctx, imgCapa, x, y, tamanho, corAnel) {
    ctx.fillStyle = corAnel;
    _desenharRetanguloArredondado(ctx, x, y, tamanho, tamanho, 10);
    ctx.fill();

    const borda = 3;
    const tamanhoInterno = tamanho - borda * 2;

    ctx.save();
    _desenharRetanguloArredondado(ctx, x + borda, y + borda, tamanhoInterno, tamanhoInterno, 7);
    ctx.clip();

    if (imgCapa) {
        ctx.drawImage(imgCapa, x + borda, y + borda, tamanhoInterno, tamanhoInterno);
    } else {
        ctx.fillStyle = "#1c1c1c";
        ctx.fillRect(x + borda, y + borda, tamanhoInterno, tamanhoInterno);
        ctx.fillStyle = "#555555";
        ctx.font = `${Math.floor(tamanhoInterno * 0.4)}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("♪", x + borda + tamanhoInterno / 2, y + borda + tamanhoInterno / 2 + 2);
        ctx.textBaseline = "alphabetic";
    }
    ctx.restore();
}

function _desenharFotoCircular(ctx, img, cx, cy, raio) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (img) {
        ctx.drawImage(img, cx - raio, cy - raio, raio * 2, raio * 2);
    } else {
        ctx.fillStyle = "#1c1c1c";
        ctx.fillRect(cx - raio, cy - raio, raio * 2, raio * 2);
        ctx.fillStyle = "#555555";
        ctx.font = `${Math.floor(raio * 0.9)}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("♪", cx, cy + 2);
        ctx.textBaseline = "alphabetic";
    }
    ctx.restore();

    ctx.strokeStyle = "#ff0055";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, raio, 0, Math.PI * 2);
    ctx.stroke();
}

async function gerarImagemResultado() {
    const btn = document.getElementById("btn-compartilhar-resultado");
    const textoOriginalBtn = btn ? btn.innerText : "";
    if (btn) {
        btn.disabled = true;
        btn.innerText = _tShare('gerando_imagem', 'Gerando imagem...');
    }

    try {
        const historico = (typeof historicoGeral !== 'undefined') ? historicoGeral : [];
        const totalRod = historico.length;
        const porLinha = totalRod > 5 ? 5 : Math.max(totalRod, 1);
        const linhasGrid = Math.max(Math.ceil(totalRod / porLinha), 1);

        const largura = 640;
        const tamanhoTile = 104;
        const espacoTile = 14;
        const alturaGrid = linhasGrid * (tamanhoTile + 36 + espacoTile);
        const alturaLogoRodape = (largura / 1000) * 260; // estimativa, ajustada depois de carregar a imagem real
        const altura = 470 + alturaGrid + alturaLogoRodape + 70 + 40; // +40 reserva espaço pro link do site

        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;
        const ctx = canvas.getContext("2d");

        // Busca a foto do artista/playlist e a logo em paralelo
        const [fotoItem, logoImg] = await Promise.all([
            _buscarFotoItemAtual().then(url => url ? _carregarImagem(url, true).catch(() => null) : null),
            _carregarImagem("assets/1.png", false).catch(() => null)
        ]);

        // Fundo
        const gradFundo = ctx.createLinearGradient(0, 0, 0, altura);
        gradFundo.addColorStop(0, "#1a1a1a");
        gradFundo.addColorStop(1, "#0a0a0a");
        ctx.fillStyle = gradFundo;
        ctx.fillRect(0, 0, largura, altura);

        const gradTopo = ctx.createRadialGradient(largura / 2, 0, 0, largura / 2, 0, 380);
        gradTopo.addColorStop(0, "rgba(255, 0, 85, 0.22)");
        gradTopo.addColorStop(1, "rgba(255, 0, 85, 0)");
        ctx.fillStyle = gradTopo;
        ctx.fillRect(0, 0, largura, altura);

        let yAtual = 55;

        // Cabeçalho: foto circular + nome grande ao lado
        const raioFoto = 46;
        const xFoto = 70;
        const cyHeader = yAtual + raioFoto;
        _desenharFotoCircular(ctx, fotoItem, xFoto, cyHeader, raioFoto);

        const ehPlaylist = (typeof tipoMenuAtual !== 'undefined' && tipoMenuAtual === 'playlists');
        const rotulo = ehPlaylist ? _tShare('lbl_playlist_resultado', 'PLAYLIST') : _tShare('lbl_artista_resultado', 'ARTISTA');
        const nomeItem = (typeof artistaSelecionadoNome !== 'undefined' && artistaSelecionadoNome) ? artistaSelecionadoNome : "";

        const xTextoHeader = xFoto + raioFoto + 24;
        const larguraTextoHeader = largura - xTextoHeader - 50;

        ctx.textAlign = "left";
        ctx.fillStyle = "#ff0055";
        ctx.font = "800 13px Arial, sans-serif";
        ctx.fillText(rotulo.toUpperCase(), xTextoHeader, cyHeader - 10);

        ctx.fillStyle = "#ffffff";
        ctx.font = "800 30px Arial, sans-serif";
        const nomeCurtoHeader = _truncarTexto(ctx, nomeItem, larguraTextoHeader);
        ctx.fillText(nomeCurtoHeader, xTextoHeader, cyHeader + 24);

        ctx.textAlign = "center";
        yAtual = cyHeader + raioFoto + 44;

        // Pontuação
        const scoreFinal = (typeof score !== 'undefined') ? score : 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "800 68px Arial, sans-serif";
        ctx.fillText(String(scoreFinal), largura / 2, yAtual + 58);
        ctx.fillStyle = "#999999";
        ctx.font = "700 15px Arial, sans-serif";
        ctx.fillText(_tShare('stat_pontuacao_final', 'PONTOS').toUpperCase(), largura / 2, yAtual + 84);
        yAtual += 104;

        // Modo + estilo de resposta
        const modoAtualTxt = (typeof modoJogo !== 'undefined') ? _tShare(`modo_${modoJogo}_titulo`, modoJogo.toUpperCase()) : "";
        const estiloAtualTxt = (typeof tipoResposta !== 'undefined') ? _tShare(`btn_${tipoResposta}`, tipoResposta.toUpperCase()) : "";
        ctx.fillStyle = "#ff8fb3";
        ctx.font = "700 15px Arial, sans-serif";
        ctx.fillText(`${modoAtualTxt}  ·  ${estiloAtualTxt}`, largura / 2, yAtual);
        yAtual += 40;

        // Chips de estatísticas
        const acertosArr = historico.filter(h => h.acertou);
        const txtAcertos = `${acertosArr.length}/${totalRod}`;
        let txtTempoMedio = "-";
        let txtMaisRapida = "-";
        let nomeMaisRapida = "";
        if (acertosArr.length > 0) {
            const somaTempos = acertosArr.reduce((acc, cur) => acc + cur.tempo, 0);
            txtTempoMedio = `${(somaTempos / acertosArr.length).toFixed(1)}s`;
            const maisRapida = acertosArr.reduce((min, cur) => cur.tempo < min.tempo ? cur : min, acertosArr[0]);
            txtMaisRapida = `${maisRapida.tempo.toFixed(1)}s`;
            nomeMaisRapida = maisRapida.musica ? maisRapida.musica.nomeExibicao : "";
        }

        const chips = [
            { label: _tShare('stat_musicas_acertadas', 'Acertos'), valor: txtAcertos, extra: "" },
            { label: _tShare('stat_tempo_medio', 'Tempo Médio'), valor: txtTempoMedio, extra: "" },
            { label: _tShare('stat_mais_rapida', 'Mais Rápida'), valor: txtMaisRapida, extra: nomeMaisRapida }
        ];

        const larguraChip = 176;
        const espacoChip = 16;
        const larguraTotalChips = (larguraChip * 3) + (espacoChip * 2);
        let xChip = (largura - larguraTotalChips) / 2;
        const alturaChip = 86;

        chips.forEach(stat => {
            ctx.fillStyle = "rgba(255,255,255,0.06)";
            _desenharRetanguloArredondado(ctx, xChip, yAtual, larguraChip, alturaChip, 12);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.08)";
            ctx.lineWidth = 1;
            _desenharRetanguloArredondado(ctx, xChip, yAtual, larguraChip, alturaChip, 12);
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = "800 23px Arial, sans-serif";
            ctx.fillText(stat.valor, xChip + larguraChip / 2, yAtual + 32);

            ctx.fillStyle = "#999999";
            ctx.font = "600 12px Arial, sans-serif";
            ctx.fillText(stat.label.toUpperCase(), xChip + larguraChip / 2, yAtual + 54);

            if (stat.extra) {
                ctx.fillStyle = "#ff8fb3";
                ctx.font = "600 11px Arial, sans-serif";
                const extraCurto = _truncarTexto(ctx, stat.extra, larguraChip - 20);
                ctx.fillText(extraCurto, xChip + larguraChip / 2, yAtual + 72);
            }

            xChip += larguraChip + espacoChip;
        });

        yAtual += alturaChip + 44;

        // Grid de rodadas (capa + nome da música)
        if (totalRod > 0) {
            const larguraLinha = (tamanhoTile * porLinha) + (espacoTile * (porLinha - 1));
            let xTile = (largura - larguraLinha) / 2;
            let yTile = yAtual;

            const capas = await Promise.all(historico.map(item => {
                const urlCapa = item.musica && item.musica.capa ? item.musica.capa : null;
                if (!urlCapa) return Promise.resolve(null);
                return _carregarImagem(urlCapa, true).catch(() => null);
            }));

            historico.forEach((item, i) => {
                if (i > 0 && i % porLinha === 0) {
                    xTile = (largura - larguraLinha) / 2;
                    yTile += tamanhoTile + 36 + espacoTile;
                }

                const corAnel = _classificarRodada(item);
                _desenharTiledeMusica(ctx, capas[i], xTile, yTile, tamanhoTile, corAnel);

                const nomeMusica = item.musica ? item.musica.nomeExibicao : "";
                ctx.fillStyle = "#bbbbbb";
                ctx.font = "600 11px Arial, sans-serif";
                const nomeCurto = _truncarTexto(ctx, nomeMusica, tamanhoTile);
                ctx.fillText(nomeCurto, xTile + tamanhoTile / 2, yTile + tamanhoTile + 18);

                xTile += tamanhoTile + espacoTile;
            });

            yAtual = yTile + tamanhoTile + 36 + 40;
        }

        // Logo gigante, de borda a borda (igual na animação de entrada)
        if (logoImg) {
            const larguraLogo = largura + 40;
            const alturaLogo = (logoImg.height / logoImg.width) * larguraLogo;
            ctx.drawImage(logoImg, -20, yAtual, larguraLogo, alturaLogo);
            yAtual += alturaLogo + 20;
        } else {
            ctx.fillStyle = "#ff0055";
            ctx.font = "800 54px Arial, sans-serif";
            ctx.fillText("SONORO", largura / 2, yAtual + 60);
            yAtual += 90;
        }

        // Link do site, abaixo da logo, pra quem receber a imagem saber onde jogar
        const urlExibida = (window.location.hostname + window.location.pathname).replace(/\/$/, "");
        ctx.fillStyle = "#888888";
        ctx.font = "600 15px Arial, sans-serif";
        ctx.fillText(urlExibida, largura / 2, yAtual + 10);
        yAtual += 40;

        // Ajusta a altura real do canvas ao que foi desenhado (evita sobra em branco ou corte)
        const alturaFinal = Math.ceil(yAtual + 10);
        if (alturaFinal !== altura) {
            const canvasFinal = document.createElement("canvas");
            canvasFinal.width = largura;
            canvasFinal.height = alturaFinal;
            canvasFinal.getContext("2d").drawImage(canvas, 0, 0);
            await _exportarImagem(canvasFinal, btn, textoOriginalBtn);
        } else {
            await _exportarImagem(canvas, btn, textoOriginalBtn);
        }

    } catch (erro) {
        console.error("Erro ao gerar imagem de resultado:", erro);
        if (btn) {
            btn.disabled = false;
            btn.innerText = textoOriginalBtn;
        }
        alert(_tShare('erro_gerar_imagem', 'Não foi possível gerar a imagem. Tente novamente.'));
    }
}

function _exportarImagem(canvas, btn, textoOriginalBtn) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Canvas bloqueado (CORS) ao exportar."));
                return;
            }
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "sonoro-resultado.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

            if (btn) {
                btn.disabled = false;
                btn.innerText = textoOriginalBtn;
            }
            resolve();
        }, "image/png");
    });
}
