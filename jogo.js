/* ===========================================================================
   FROTA COMPLETA | segundo jogo de totem da Sem Parar Empresas
   ---------------------------------------------------------------------------
   Alvo: TV touch de 55 polegadas EM PE, 1080x1920, a mesma dos totens do
   INESFA. Roda no navegador, offline, sem instalar nada.

   DE ONDE ELE VEIO. A cliente mandou duas ideias em audio. A segunda, a cidade
   em 3D onde a pessoa dirige e para nos servicos, virou o `rota-da-frota-totem`
   e ja esta no ar. Esta aqui e a PRIMEIRA: "aquele jogo que vai caindo as
   coisas e tem uma cesta embaixo, so que com os icones dos produtos e uma
   Fiorino embaixo pegando, porque e frota leve". Ela disse que gosta, mas nao
   ama.

   E EU ACHO QUE SEI POR QUE ELA NAO AMA: pegar icone caindo nao conta historia
   nenhuma. Qualquer marca faz esse jogo trocando os icones. Entao aqui existe
   UMA regra que so faz sentido para a Sem Parar:

       A TAG E DOURADA, E QUEM PEGA A TAG RECOLHE TUDO
       QUE ESTIVER CAINDO NA TELA NAQUELE MOMENTO.

   A pessoa descobre jogando que uma tag resolve todas as frentes da frota, que
   e a mesma mensagem do pedagio no outro jogo, onde ela nao faz nada porque a
   tag ja resolveu. Sem essa regra, este e um joguinho de pegar coisa.

   A ARTE E DA PROPRIA CLIENTE. As seis pecas, a Fiorino e o logo foram
   recortados do PNG que ela mandou (`assets/img/arte-cliente.png`), por
   preenchimento a partir das bordas. Nada aqui foi redesenhado: e a tela dela,
   em movimento. Foi assim que o outro jogo resolveu a cabine, e funcionou.
   =========================================================================== */

// ------------------------------------------------------- medidas do palco
const LARGURA = 1080;
const ALTURA  = 1920;

// ------------------------------------------------------------- os produtos
/* A ordem e a cor saem do desenho dela. `chave` e o nome do arquivo recortado.
   A TAG carrega `resolveTudo`, que e a regra da ativacao. */
const PRODUTOS = [
  { chave:'manutencao',    nome:'Manutenção',         cor:'#C4123F' },
  { chave:'abastecimento', nome:'Abastecimento',      cor:'#2B323C' },
  { chave:'seguro',        nome:'Seguro',             cor:'#F2740E' },
  { chave:'vale-pedagio',  nome:'Vale-pedágio',       cor:'#C4123F' },
  { chave:'debitos',       nome:'Débitos veiculares', cor:'#F2740E' },
  { chave:'tag',           nome:'Tag',                cor:'#2B323C', resolveTudo:true }
];

// ------------------------------------------------------------- regras
const TEMPO_TOTAL   = 40;     // segundos
const PONTOS_ITEM   = 100;
const PONTOS_TAG    = 150;    // a tag vale mais por si, alem de recolher o resto
const CUSTO_PERDIDO = 0;      /* Perder item NAO tira ponto, e isso e escolha.
                                 Num totem de evento a pessoa joga uma vez so e
                                 em pe; punir erro deixa a experiencia amarga e
                                 nao ajuda a vender nada. O placar premia quem
                                 pega, e ponto. */

/* MAIS RAPIDO, pedido dele em 04/09. Estava 380->820 e 0,62->0,26; agora a
   queda mais que dobra ao longo dos 40s e as pecas vem em quase o dobro do
   ritmo: de 92 pecas por partida para ~130.

   MAS O PILOTO DE SCRIPT CONTINUA COM ZERO PERDIDOS, antes e depois. Nao adianta
   apertar mais esperando o numero mudar: o piloto teleporta o alvo da van todo
   quadro e a folga lateral e de 310px, entao ele nunca erra por reflexo. O que
   o script mede aqui e VAZAO, nao dificuldade -- a dificuldade e o tempo de
   reacao e o percurso da mao, que so aparece com gente jogando. */
const QUEDA_INICIAL = 500;    // px por segundo
const QUEDA_FINAL   = 1180;   // no ultimo segundo da partida
const INTERVALO_INI = 0.46;   // segundos entre um item e o proximo
const INTERVALO_FIM = 0.17;

/* A tag e rara de proposito: se caisse como qualquer outro item, a regra que
   ela carrega viraria rotina e pararia de surpreender.

   4% e nao 12%: a chance e por PECA, entao acelerar o jogo multiplicou as tags
   junto. A 12% com o ritmo novo davam 13 por partida, uma a cada 3 segundos --
   com tremor de tela e acorde a cada 3 segundos o estouro vira papel de parede,
   que e exatamente o que esta regra existe para evitar. O alvo e uma mao cheia
   por partida: o bastante para a pessoa aprender a regra, longe do bastante
   para ela cansar. */
const CHANCE_DA_TAG = 0.04;

/* ------------------------------------------------------ o estouro da tag
   A regra da tag era so um texto: ela recolhia tudo e escrevia o aviso, e as
   pecas sumiam sem mais. Num totem a pessoa joga UMA vez; se ela nao vir o que
   aconteceu na primeira tag, nao descobre a regra nunca. Entao o recolhimento
   virou coisa de ver: as pecas SAO SUGADAS para a Fiorino, uma onda dourada
   abre no ponto da tag e a tela treme.

   O tremor so acontece na tag. Peca comum entra calada de proposito: se tudo
   sacode, o estouro da tag deixa de ser um acontecimento. */
const VOO_S      = 0.32;   // quanto a peca leva da posicao dela ate a van
const TREMOR_S   = 0.45;
const TREMOR_FOR = 15;     // amplitude no espaco do palco, 1080x1920
const ONDA_S     = 0.55;
const ONDA_RAIO  = 900;

// ------------------------------------------------------------- a Fiorino
/* 560 e nao 300. Na arte da cliente a van ocupa 575 de 941, ou seja 61% da
   largura; a 300 ela virava um brinquedo no rodape e a tela ficava vazia.
   Aqui ela ocupa 52%, que deixa espaco para o dedo mover sem sair da tela. */
const VAN_LARGURA = 560;
const VAN_FOLGA   = 30;       // quanto a boca da cacamba perdoa, para os lados
const VAN_SUAVE   = 0.22;     // o quanto ela persegue o dedo por quadro
const VAN_RODAPE  = 30;       // quanto sobra abaixo dela

/* ONDE A QUEDA COMECA. Os itens nasciam acima da tela e atravessavam o HUD:
   passavam por cima do cronometro e da chamada, e a tela virava bagunca.
   Agora eles surgem logo ABAIXO da barra, que e onde a area de jogo comeca.

   500 e nao 470: medido no navegador, a pilula de TEMPO/PONTOS termina em 480,
   nao em 470, entao com 470 as pecas ainda nasciam dentro dela e apareciam
   saindo de tras do HUD. */
const TETO_DA_QUEDA = 500;

// =====================================================================
// Estado
// =====================================================================
let ctx, telaCanvas;
let imagens = {};
let estado = 'inicio';        // inicio | jogando | fim
let tempo = TEMPO_TOTAL, pontos = 0;
let caindo = [];
let pegos = 0, perdidos = 0, tagsPegas = 0;
let proximoEm = 0;
let vanX = LARGURA / 2, vanAlvo = LARGURA / 2;
let ultimoQuadro = 0;
let voando = [];          // pecas sugadas pela tag, a caminho da van
let ondas = [];           // a onda dourada que abre no ponto da tag
let tremor = 0;           // 1 no estouro, cai ate 0
let escalaDoPalco = 1;    // guardada: o tremor entra no mesmo transform do palco
const el = {};

// =====================================================================
// Carregar a arte da cliente
// =====================================================================
function carregarImagem(nome, caminho) {
  return new Promise(ok => {
    const im = new Image();
    im.onload = () => { imagens[nome] = im; ok(true); };
    im.onerror = () => { console.warn('faltou a peca:', caminho); ok(false); };
    im.src = caminho;
  });
}

function carregarArte() {
  const tarefas = PRODUTOS.map(p =>
    carregarImagem(p.chave, `assets/img/pecas/${p.chave}.png`));
  tarefas.push(carregarImagem('fiorino', 'assets/img/pecas/fiorino.png'));
  return Promise.all(tarefas);
}

// =====================================================================
// Fundo: o desenho dela, refeito em codigo para poder ter movimento
// =====================================================================
/* As cores saem medidas da arte: vinho (95,1,33) no topo indo para carmim
   (168,1,52) embaixo, com brilho no centro de baixo, atras da Fiorino. */
function desenharFundo(t) {
  const g = ctx.createLinearGradient(0, 0, 0, ALTURA);
  g.addColorStop(0, '#5F0121');
  g.addColorStop(0.42, '#7A0129');
  g.addColorStop(1, '#A80134');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  // Brilho atras da van, como na arte dela.
  const brilho = ctx.createRadialGradient(LARGURA / 2, ALTURA - 240, 40,
                                          LARGURA / 2, ALTURA - 240, 620);
  brilho.addColorStop(0, 'rgba(255,45,111,.30)');
  brilho.addColorStop(1, 'rgba(255,45,111,0)');
  ctx.fillStyle = brilho;
  ctx.fillRect(0, ALTURA - 900, LARGURA, 900);

  // As duas setas grandes da esquerda, que sao a assinatura visual da peca.
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = '#FF2D6F';
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = 0; i < 2; i++) {
    const y = 1210 + i * 92 + Math.sin(t * 1.4 + i) * 6;
    ctx.beginPath();
    ctx.moveTo(58, y + 76);
    ctx.lineTo(160, y);
    ctx.lineTo(262, y + 76);
    ctx.stroke();
  }
  ctx.restore();

  // Rastros de velocidade ao fundo, bem apagados: dao movimento sem competir
  // com as pecas que caem.
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.strokeStyle = '#FF7BA6';
  ctx.lineWidth = 5;
  for (let i = 0; i < 7; i++) {
    const x = (i * 173 + ((t * 60) % 173)) % LARGURA;
    const alto = 300 + (i % 3) * 160;
    ctx.beginPath();
    ctx.moveTo(x, ALTURA);
    ctx.quadraticCurveTo(x + 120, ALTURA - alto / 2, x + 40, ALTURA - alto);
    ctx.stroke();
  }
  ctx.restore();
}

// =====================================================================
// Os itens que caem
// =====================================================================
function novoItem() {
  const sorteioTag = Math.random() < CHANCE_DA_TAG;
  const semTag = PRODUTOS.filter(p => !p.resolveTudo);
  const def = sorteioTag
    ? PRODUTOS.find(p => p.resolveTudo)
    : semTag[(Math.random() * semTag.length) | 0];

  const im = imagens[def.chave];
  const largura = 150;
  const altura = im ? largura * im.height / im.width : 150;

  caindo.push({
    def,
    x: 120 + Math.random() * (LARGURA - 240),
    y: TETO_DA_QUEDA - altura,
    largura, altura,
    giro: (Math.random() - 0.5) * 0.25,
    balanco: Math.random() * Math.PI * 2
  });
}

function velocidadeDaQueda() {
  // Acelera ao longo da partida: comeca generoso e termina apertado.
  const andamento = 1 - tempo / TEMPO_TOTAL;
  return QUEDA_INICIAL + (QUEDA_FINAL - QUEDA_INICIAL) * andamento;
}

function intervaloEntreItens() {
  const andamento = 1 - tempo / TEMPO_TOTAL;
  return INTERVALO_INI + (INTERVALO_FIM - INTERVALO_INI) * andamento;
}

function desenharItem(it, t) {
  const im = imagens[it.def.chave];
  const bal = Math.sin(t * 2 + it.balanco) * 0.06;

  ctx.save();
  ctx.translate(it.x, it.y + it.altura / 2);
  ctx.rotate(it.giro + bal);

  // O rastro de queda que existe na arte dela.
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = it.def.resolveTudo ? '#FFC531' : '#FF5C8A';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 30, -it.altura / 2 - 26);
    ctx.lineTo(i * 30, -it.altura / 2 - 96 - Math.abs(i) * 26);
    ctx.stroke();
  }
  ctx.restore();

  /* A TAG BRILHA. E o unico aviso visual de que ela e diferente, e precisa ser
     obvio a tres metros de distancia, que e de onde se olha um totem. */
  if (it.def.resolveTudo) {
    const pulso = 0.55 + 0.45 * Math.sin(t * 6);
    ctx.shadowColor = 'rgba(255,197,49,' + (0.55 + 0.35 * pulso) + ')';
    ctx.shadowBlur = 60 + 30 * pulso;
    ctx.beginPath();
    ctx.arc(0, 0, it.largura * 0.72, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,197,49,' + (0.14 + 0.10 * pulso) + ')';
    ctx.fill();
  }

  if (im) {
    ctx.drawImage(im, -it.largura / 2, -it.altura / 2, it.largura, it.altura);
  } else {
    ctx.fillStyle = it.def.cor;
    ctx.fillRect(-it.largura / 2, -it.altura / 2, it.largura, it.altura);
  }
  ctx.restore();
}

// =====================================================================
// A Fiorino
// =====================================================================
/* UMA conta so para a van, usada pelo desenho E pela colisao. O anel aceso e a
   linha que pega tem que ser o mesmo numero; no outro jogo da ativacao, duas
   contas separadas para a mesma medida foi o que fez as setas da missao
   apontarem para o lado oposto, e demorou para achar. */
function medidasDaVan() {
  const im = imagens.fiorino;
  const largura = VAN_LARGURA;
  const altura = im ? largura * im.height / im.width : 210;
  const y = ALTURA - altura - VAN_RODAPE;
  return { largura, altura, y, boca: y + altura * 0.13 };
}

function desenharVan() {
  const im = imagens.fiorino;
  const { largura, altura, y, boca } = medidasDaVan();

  /* A BOCA DA CACAMBA ACESA, que na arte dela e o que diz "e aqui que cai
     dentro". Sem isso a pessoa nao entende onde tem que aparar. */
  ctx.save();
  ctx.strokeStyle = '#FF2D6F';
  ctx.lineWidth = 9;
  ctx.shadowColor = 'rgba(255,45,111,.95)';
  ctx.shadowBlur = 34;
  ctx.beginPath();
  ctx.ellipse(vanX, boca, largura * 0.36, 26, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  if (im) {
    ctx.drawImage(im, vanX - largura / 2, y, largura, altura);
  } else {
    ctx.fillStyle = '#F2F2F2';
    ctx.fillRect(vanX - largura / 2, y, largura, altura);
  }
}

// =====================================================================
// Som
// =====================================================================
/* SINTETIZADO NA HORA, sem arquivo nenhum -- o mesmo caminho do outro jogo da
   ativacao, onde a moeda tambem nao tem .mp3. Um totem que depende de arquivo
   de audio e um totem que fica mudo quando alguem mexe na pasta.

   O contexto so nasce no primeiro TOQUE: navegador nenhum deixa tocar som antes
   de um gesto, e se ele nascesse no carregamento ficaria suspenso para sempre.
   Tudo dentro de try: sem audio, o jogo segue igual. */
let audio = null;
function ligarAudio() {
  try {
    if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  } catch (e) { audio = null; }
  return audio;
}

function nota(hz, atraso, dur, volume, tipo, hzFim) {
  const a = audio; if (!a) return;
  const t0 = a.currentTime + atraso;
  const osc = a.createOscillator(), vol = a.createGain();
  osc.type = tipo || 'triangle';
  osc.frequency.setValueAtTime(hz, t0);
  if (hzFim) osc.frequency.exponentialRampToValueAtTime(hzFim, t0 + dur);
  vol.gain.setValueAtTime(0.0001, t0);
  vol.gain.exponentialRampToValueAtTime(volume, t0 + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(vol); vol.connect(a.destination);
  osc.start(t0); osc.stop(t0 + dur + 0.02);
}

/* UMA nota so, e baixa. Sao mais de duas pegadas por segundo no fim da partida;
   com duas notas por peca, como a moeda do outro jogo, isso vira zumbido. O
   pequeno desafino aleatorio evita o efeito de metronomo. */
function somDePegar() {
  if (!ligarAudio()) return;
  try { nota(880 * (0.97 + Math.random() * 0.06), 0, 0.10, 0.15); } catch (e) {}
}

/* A TAG GANHA UM ACORDE, e nao uma nota: e a unica coisa do jogo que merece uma
   frase inteira. Triade maior subindo, mais um baque grave que casa com o
   tremor da tela -- o ouvido e a vista contam a mesma coisa no mesmo instante. */
function somDaTag() {
  if (!ligarAudio()) return;
  try {
    [523.25, 659.25, 783.99, 1046.50].forEach((hz, i) => nota(hz, i * 0.045, 0.45, 0.20));
    nota(90, 0, 0.35, 0.30, 'sine', 40);
  } catch (e) {}
}

// cada peca sugada caindo dentro da cacamba: tiquinho curto, bem baixo
function somDeEntrar() {
  if (!audio) return;
  try { nota(1400 + Math.random() * 500, 0, 0.06, 0.07, 'sine'); } catch (e) {}
}

// =====================================================================
// Partida
// =====================================================================
function pegar(it) {
  pontos += it.def.resolveTudo ? PONTOS_TAG : PONTOS_ITEM;
  pegos++;

  if (it.def.resolveTudo) {
    /* A REGRA DA ATIVACAO. Pegar a tag recolhe tudo que estiver caindo: e a
       traducao, em mecanica, de "uma tag resolve todas as frentes da frota".
       Sem isto o jogo nao fala da Sem Parar, so tem os icones dela. */
    tagsPegas++;
    let recolhidos = 0;
    for (const outro of caindo) {
      if (outro === it || outro.pego) continue;
      outro.pego = true;               // sai da fisica na hora
      voando.push({ def: outro.def, x0: outro.x, y0: outro.y, largura: outro.largura,
                    altura: outro.altura, giro: outro.giro,
                    atraso: 0.03 * recolhidos, t: 0 });
      pontos += PONTOS_ITEM;
      pegos++;
      recolhidos++;
    }
    /* A onda sai do ponto onde a tag foi pega, e nao do meio da tela: e o gesto
       da pessoa que disparou aquilo, e ela precisa ver a ligacao. */
    ondas.push({ x: it.x, y: it.y + it.altura / 2, t: 0 });
    tremor = 1;
    somDaTag();
    avisar(recolhidos > 0 ? 'A TAG RESOLVEU TUDO' : 'TAG',
           '+' + (PONTOS_TAG + recolhidos * PONTOS_ITEM), '#FFC531');
  } else {
    avisar('', '+' + PONTOS_ITEM, '#FFFFFF');
    somDePegar();
  }
  it.pego = true;
}

function passo(dt, t) {
  if (estado !== 'jogando') return;

  tempo -= dt;
  if (tempo <= 0) { tempo = 0; terminar(); return; }

  proximoEm -= dt;
  if (proximoEm <= 0) { novoItem(); proximoEm = intervaloEntreItens(); }

  // A van persegue o dedo, e nao gruda nele: sem isso o movimento fica seco.
  vanX += (vanAlvo - vanX) * VAN_SUAVE;
  vanX = Math.max(VAN_LARGURA / 2, Math.min(LARGURA - VAN_LARGURA / 2, vanX));

  const queda = velocidadeDaQueda();
  const van = medidasDaVan();

  for (const it of caindo) {
    if (it.pego) continue;
    it.y += queda * dt;

    /* `it.y` e a BORDA DE CIMA da peca: e assim que ela nasce em `novoItem` e
       assim que ela e desenhada. Aqui a conta lia `it.y` como se fosse o CENTRO,
       e o efeito era a peca so contar depois de afundar meia altura dentro do
       teto da van — pegava, mas depois do anel, que e onde a pessoa esta
       olhando. Agora e a borda de baixo que cruza a mesma linha do anel. */
    const base = it.y + it.altura;
    if (base >= van.boca && it.y < van.boca + 130) {
      // A folga lateral e generosa de proposito: num totem a pessoa joga em pe.
      if (Math.abs(it.x - vanX) < VAN_LARGURA / 2 + VAN_FOLGA) { pegar(it); continue; }
    }
    if (it.y > ALTURA) {
      it.perdido = true;
      perdidos++;
      pontos = Math.max(0, pontos - CUSTO_PERDIDO);
    }
  }
  caindo = caindo.filter(it => !it.pego && !it.perdido);

  // as pecas sugadas, a onda e o tremor correm no proprio tempo
  for (const f of voando) {
    const antes = f.t;
    f.t += dt;
    const fim = f.atraso + VOO_S;
    if (antes < fim && f.t >= fim) somDeEntrar();   // chegou na cacamba
  }
  voando = voando.filter(f => f.t < f.atraso + VOO_S);
  for (const o of ondas) o.t += dt;
  ondas = ondas.filter(o => o.t < ONDA_S);
  if (tremor > 0) tremor = Math.max(0, tremor - dt / TREMOR_S);
}

/* ------------------------------------------------------------ o estouro */
function desenharOndas() {
  for (const o of ondas) {
    const u = o.t / ONDA_S;
    const raio = ONDA_RAIO * (1 - Math.pow(1 - u, 2.4));
    ctx.save();
    ctx.globalAlpha = (1 - u) * 0.75;
    ctx.strokeStyle = '#FFC531';
    ctx.lineWidth = 26 * (1 - u) + 3;
    ctx.beginPath();
    ctx.arc(o.x, o.y, raio, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = (1 - u) * 0.28;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(o.x, o.y, raio * 0.66, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function desenharVoando(van) {
  for (const f of voando) {
    if (f.t < f.atraso) { continue; }
    const u = Math.min(1, (f.t - f.atraso) / VOO_S);
    const e = u * u;                       // acelera: a peca e puxada, nao jogada
    const alvoX = vanX, alvoY = van.boca;
    const x = f.x0 + (alvoX - f.x0) * e;
    const y = (f.y0 + f.altura / 2) + (alvoY - (f.y0 + f.altura / 2)) * e;
    const enc = 1 - 0.72 * e;              // encolhe ao entrar na cacamba

    ctx.save();
    ctx.globalAlpha = 1 - 0.85 * Math.pow(u, 3);
    ctx.translate(x, y);
    ctx.rotate(f.giro + e * 5);
    ctx.scale(enc, enc);
    const im = imagens[f.def.chave];
    if (im) ctx.drawImage(im, -f.largura / 2, -f.altura / 2, f.largura, f.altura);
    else { ctx.fillStyle = f.def.cor;
           ctx.fillRect(-f.largura / 2, -f.altura / 2, f.largura, f.altura); }
    ctx.restore();
  }
}

function desenhar(t) {
  /* O TREMOR ENTRA NO TRANSFORM DO PALCO, junto do scale, e nao dentro do
     canvas: assim o HUD sacode com a cena e a tela inteira parece levar o
     impacto. Por isso `escalaDoPalco` fica guardada -- sao a mesma propriedade
     CSS, e escrever so o translate apagaria o scale. */
  if (tremor > 0) {
    const f = tremor * tremor * TREMOR_FOR;
    aplicarPalco((Math.random()*2-1) * f, (Math.random()*2-1) * f);
  } else if (el.palcoTremendo) {
    aplicarPalco(0, 0);            // devolve ao lugar uma vez, nao todo quadro
  }

  desenharFundo(t);
  for (const it of caindo) desenharItem(it, t);
  const van = medidasDaVan();
  desenharOndas();
  desenharVoando(van);
  desenharVan();
}

function laco(agora) {
  requestAnimationFrame(laco);
  const t = agora / 1000;
  const dt = Math.min(0.05, ultimoQuadro ? t - ultimoQuadro : 0);
  ultimoQuadro = t;

  passo(dt, t);
  desenhar(t);
  atualizarHud();
}

// =====================================================================
// HUD e telas
// =====================================================================
function atualizarHud() {
  const s = Math.max(0, Math.ceil(tempo));
  el.tempo.textContent = '00:' + String(s).padStart(2, '0');
  el.pontos.textContent = String(pontos).padStart(3, '0');
}

let avisoAte = 0;
/* DUAS LINHAS, sempre: a frase em cima e o numero embaixo, cada uma com o seu
   tamanho. Era uma linha so em 104px, e a frase da tag estourava o palco pelos
   dois lados e voltava cortada. O porque esta no `#aviso` do index.html.
   Passar frase vazia da o aviso curto de sempre, so o numero. */
function avisar(frase, numero, cor) {
  el.avisoFrase.textContent = frase || '';
  el.avisoNumero.textContent = numero || '';
  el.aviso.style.color = cor;
  el.aviso.classList.add('on');
  clearTimeout(avisoAte);
  avisoAte = setTimeout(() => el.aviso.classList.remove('on'), 780);
}

function comecar() {
  estado = 'jogando';
  tempo = TEMPO_TOTAL; pontos = 0;
  caindo = []; pegos = 0; perdidos = 0; tagsPegas = 0;
  voando = []; ondas = []; tremor = 0; aplicarPalco(0, 0);
  proximoEm = 0.4;
  vanX = vanAlvo = LARGURA / 2;
  document.getElementById('telaInicio').classList.add('escondida');
  document.getElementById('telaFim').classList.add('escondida');
}

function terminar() {
  estado = 'fim';
  el.pontosFim.textContent = String(pontos).padStart(3, '0');
  el.tituloFim.textContent = 'TEMPO!';
  const resumo = [];
  resumo.push(pegos + (pegos === 1 ? ' item pego' : ' itens pegos'));
  if (tagsPegas > 0) {
    resumo.push(tagsPegas + (tagsPegas === 1 ? ' tag' : ' tags') +
                ' — e a tag resolveu o resto');
  }
  el.resumo.textContent = resumo.join(' · ');
  document.getElementById('telaFim').classList.remove('escondida');
}

function tocouParaAvancar() {
  ligarAudio();          // aqui, e so aqui: e o gesto que o navegador exige
  if (estado !== 'jogando') comecar();
}

// =====================================================================
// Comando: o dedo arrasta a van
// =====================================================================
function ligarComando() {
  const palco = document.getElementById('palco');

  const posicao = clientX => {
    const caixa = palco.getBoundingClientRect();
    return (clientX - caixa.left) / caixa.width * LARGURA;
  };

  palco.addEventListener('touchstart', e => {
    e.preventDefault();
    if (estado !== 'jogando') { tocouParaAvancar(); return; }
    vanAlvo = posicao(e.changedTouches[0].clientX);
  }, { passive: false });

  palco.addEventListener('touchmove', e => {
    e.preventDefault();
    vanAlvo = posicao(e.changedTouches[0].clientX);
  }, { passive: false });

  // Mouse conta como dedo, para o jogo ser testavel no computador.
  let apertado = false;
  palco.addEventListener('mousedown', e => {
    if (estado !== 'jogando') { tocouParaAvancar(); return; }
    apertado = true; vanAlvo = posicao(e.clientX);
  });
  window.addEventListener('mousemove', e => { if (apertado) vanAlvo = posicao(e.clientX); });
  window.addEventListener('mouseup', () => { apertado = false; });

  // Teclado, so para testar rapido na mesa.
  window.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') tocouParaAvancar();
    if (e.key === 'ArrowLeft')  vanAlvo -= 90;
    if (e.key === 'ArrowRight') vanAlvo += 90;
  });
}

// =====================================================================
// Palco: encaixar 1080x1920 na janela
// =====================================================================
function aplicarPalco(dx, dy) {
  const palco = document.getElementById('palco');
  palco.style.transform = `translate(${dx}px, ${dy}px) scale(${escalaDoPalco})`;
  el.palcoTremendo = (dx !== 0 || dy !== 0);
}

function encaixarPalco() {
  escalaDoPalco = Math.min(window.innerWidth / LARGURA, window.innerHeight / ALTURA);
  aplicarPalco(0, 0);
}

async function comecarTudo() {
  telaCanvas = document.getElementById('tela');
  telaCanvas.width = LARGURA;
  telaCanvas.height = ALTURA;
  ctx = telaCanvas.getContext('2d');

  el.tempo = document.getElementById('vTempo');
  el.pontos = document.getElementById('vPontos');
  el.aviso = document.getElementById('aviso');
  el.avisoFrase = el.aviso.querySelector('.frase');
  el.avisoNumero = el.aviso.querySelector('.numero');
  el.pontosFim = document.getElementById('vPontosFim');
  el.tituloFim = document.getElementById('vTituloFim');
  el.resumo = document.getElementById('vResumo');

  await carregarArte();

  ligarComando();
  encaixarPalco();
  window.addEventListener('resize', encaixarPalco);
  requestAnimationFrame(laco);

  console.log('Frota Completa pronto. Pecas carregadas:', Object.keys(imagens).length);
}

/* Porta de teste, igual a do outro jogo: e por aqui que um piloto de script
   joga uma partida inteira sem depender de dedo humano. */
window.frota = {
  estado: () => ({ estado, tempo, pontos, pegos, perdidos, tagsPegas,
                   caindo: caindo.length, vanX: Math.round(vanX),
                   voando: voando.length, ondas: ondas.length,
                   tremor: +tremor.toFixed(2) }),
  moverPara(x) { vanAlvo = x; },
  comecar,
  itens: () => caindo.map(i => ({ chave: i.def.chave, x: Math.round(i.x),
                                  y: Math.round(i.y), tag: !!i.def.resolveTudo }))
};

comecarTudo();
