(function () {
  "use strict";
  var D = window.DADOS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var fmt = function (n) { return n.toLocaleString("pt-BR"); };

  // ---------------- conteúdo fixo ----------------
  var ABC = ["A", "B", "C"];
  var CEN = {
    A: { nome: "Baseline", sub: "Prompt original, com as 22 especificações.", esp: 22 },
    B: { nome: "Intermediário", sub: "Prompt original sem as 6 complementares.", esp: 16 },
    C: { nome: "Mínimo", sub: "Só os 7 essenciais, reescritos.", esp: 7 }
  };
  var EST = { ok: ["pos", "Viável"], parcial: ["par", "Com restrição"], ruim: ["neg", "Comprometida"], na: ["neu", "Não avaliável"] };
  var TAREFAS = [
    ["Priorizar", "ok", "ok", "ok"], ["Compreender", "ok", "ok", "ruim"], ["Decidir", "parcial", "ok", "ok"],
    ["Tratar erro", "ok", "ok", "ruim"], ["Acompanhar", "parcial", "parcial", "ruim"], ["Ajuda", "na", "na", "na"]
  ];
  var MUDOU = [
    ["pos", "Resolvido em B e C", "Rejeitar no Dashboard, referente da confiança e cor da prioridade.", ["E1-01", "E1-04", "E1-08"]],
    ["par", "Persiste nos três", "Falta a lista de alunos e a autoria dos históricos.", ["E1-02", "PB-01", "PC-01", "E1-06", "PB-02", "PC-03"]],
    ["neg", "Novo em B e C", "O telefone do aluno aparece completo, contra o requisito R3.", ["PB-05", "PC-04"]],
    ["neg", "Novo em C", "Nenhuma tela mostra a confiança da IA.", ["PC-02"]]
  ];
  var GRUPOS = [["E1-02", "PB-01", "PC-01"], ["E1-06", "PB-02", "PC-03"], ["E1-07", "PB-03", "PC-05"], ["E1-05", "PB-04"], ["PB-05", "PC-04"]];
  var TELAS = [["moldura", "Frame Master"], ["dashboard", "Dashboard"], ["alunos", "Alunos"], ["relatorios", "Relatórios"]];
  var NT = { moldura: "Frame Master", dashboard: "Dashboard", alunos: "Alunos", relatorios: "Relatórios" };
  var ORIG = { ausente: "Ausente nos três", inconsistente: "Inconsistente", incompleta: "Incompleta", retirada: "Retirada", nao_seguida: "Não seguida" };
  var SEM_EM_C = ["M04", "M06", "M08", "M10", "M11", "M12", "M13", "M15", "M17", "M18", "M19", "M20", "M21", "M22"];
  var CORSEV = { 3: "var(--neg)", 2: "#d97706", 1: "#94a3ab" };
  var NOMESEV = { 3: "maior", 2: "menor", 1: "cosmético" };

  function img(c, tela, anot) {
    if (tela === "moldura") anot = false;
    if (c === "A") return "img/a_" + tela + (anot ? "_anot" : "") + ".jpg";
    if (anot) return "img/" + c.toLowerCase() + "_" + tela + "_anot.png";
    return (c === "B" ? "../intermediario/" : "../minimo/") + tela + ".png";
  }
  function vivo(c, tela) {
    if (c === "A") return "https://anapsaraujo100.github.io/monitoria-ihc-prototipo/";
    return (c === "B" ? "../intermediario/" : "../minimo/") + tela + ".html";
  }
  var selo = function (k, t, titulo) { return '<span class="selo s-' + k + '"' + (titulo ? ' title="' + esc(titulo) + '"' : "") + ">" + t + "</span>"; };
  var seloEst = function (k) { return selo(EST[k][0], EST[k][1]); };
  var seloSev = function (s) { return selo(s === 3 ? "neg" : s === 2 ? "par" : "neu", "Sev. " + s, "Severidade " + s + " (" + NOMESEV[s] + ")"); };
  var seloRes = function (txt) {
    var k = /^Sim/.test(txt) ? ["pos", "Sim"] : /^Parcial/.test(txt) ? ["par", "Parcial"] : /^Não/.test(txt) ? ["neg", "Não"] : ["neu", "N/V"];
    return selo(k[0], k[1], txt);
  };
  var letra = function (c, pq) { return '<span class="letra' + (pq ? " pq" : "") + '">' + c + "</span>"; };
  var idl = function (id) { return '<a class="id" href="#problemas/' + id + '">' + id + "</a>"; };
  var specs = function (txt) {
    var ids = String(txt).match(/\b(M\d\d|R[123])\b/g) || [];
    return ids.filter(function (v, i) { return ids.indexOf(v) === i; }).map(function (id) {
      return '<a class="id" href="#' + (/^M(2[3-9]|3\d|4[0-2])$/.test(id) ? "melhorias" : "especificacoes/" + id) + '">' + id + "</a>";
    }).join(" ");
  };
  var seg = function (nome, atual, ops) {
    return '<div class="seg" role="group">' + ops.map(function (o) { return '<button type="button" data-' + nome + '="' + o[0] + '" class="' + (atual === o[0] ? "ativo" : "") + '">' + o[1] + "</button>"; }).join("") + "</div>";
  };
  var sel = function (id, val, ops) { return '<select id="' + id + '" aria-label="' + ops[0][1] + '">' + ops.map(function (o) { return '<option value="' + o[0] + '"' + (val === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>"; };
  function tabela(rows) {
    return '<div class="tab"><table><thead><tr>' + rows[0].map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.slice(1).map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td" + (i === 0 ? ' class="n"' : "") + ">" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  var probsDe = function (c) { return D.problemas.filter(function (p) { return p.cenario === c; }); };

  // ---------------- galerias ----------------
  var eT = { tela: "dashboard", anot: "1" };
  function galTelas() {
    var out = [];
    TELAS.forEach(function (t) { ABC.forEach(function (c) { out.push({ tipo: "tela", c: c, tela: t[0], anot: eT.anot === "1" && t[0] !== "moldura", src: img(c, t[0], eT.anot === "1"), prot: vivo(c, t[0]) }); }); });
    return out;
  }
  var GAL = { telas: galTelas, prob: function () { return listaProb(); }, melh: function () {
    return ["dashboard", "alunos", "relatorios"].map(function (t) { return { tipo: "melh", tela: t, src: "../maximo/" + t + ".png", prot: "../maximo/" + t + ".html" }; });
  } };

  // ---------------- modal de visualização ----------------
  var mv = $("#mv"), vista = $(".mv-vista", mv), trilha = $(".mv-trilha", mv), txt = $(".mv-txt", mv);
  var M = { itens: [], i: 0, modo: "img", s: 1, x: 0, y: 0, fit: 1, w: 0, h: 0, pts: {}, volta: null };
  function mvAbrir(itens, i, modo) {
    M.itens = itens; M.i = i; M.modo = modo || "img"; M.volta = document.activeElement;
    mv.hidden = false; document.body.style.overflow = "hidden";
    trilha.innerHTML = itens.map(function (it, k) { return '<button type="button" data-mv-ir="' + k + '" aria-label="Item ' + (k + 1) + '"><img loading="lazy" src="' + it.src + '" alt=""></button>'; }).join("");
    mvMostrar(); $(".mv-fechar", mv).focus();
  }
  function mvFechar() { mv.hidden = true; vista.innerHTML = ""; document.body.style.overflow = ""; if (M.volta && M.volta.focus) M.volta.focus(); }
  function mvIr(k) { M.i = (k + M.itens.length) % M.itens.length; if (!M.itens[M.i].prot) M.modo = "img"; mvMostrar(); }
  var celular = function () { return window.matchMedia("(max-width: 900px)").matches; };
  // no celular, o protótipo também é movido e ampliado como imagem; "Tocar" libera os cliques nele
  var movel = function () { return M.modo === "img" || (celular() && !M.tocar); };
  function mvMostrar() {
    var it = M.itens[M.i], varios = M.itens.length > 1;
    $(".mv-pos", mv).textContent = varios ? (M.i + 1) + " de " + M.itens.length : "";
    $$(".mv-seta", mv).forEach(function (b) { b.hidden = !varios; });
    $$("button", trilha).forEach(function (b, k) { b.classList.toggle("ativo", k === M.i); });
    var at = $("button.ativo", trilha); if (at) at.scrollIntoView({ block: "nearest", inline: "center" });
    $(".mv-zoom", mv).hidden = M.modo !== "img";
    mv.classList.toggle("frame", M.modo === "frame");
    mvTocar(false);
    M.w = 0;
    if (M.modo === "img") {
      vista.innerHTML = '<img alt="">';
      var im = $("img", vista);
      im.onload = function () { M.w = im.naturalWidth; M.h = im.naturalHeight; mvAjustar(); };
      im.src = it.src;
    } else {
      vista.innerHTML = '<div class="mv-fr"><iframe src="' + it.prot + '" title="Protótipo navegável"></iframe><div class="mv-capa"></div></div>';
      M.w = 1672; M.h = 941; mvAjustar();
      $(".mv-fbar-ext", mv).href = it.prot;
    }
    txt.innerHTML = mvTexto(it); txt.scrollTop = 0;
    $(".mv-dica", mv).textContent = M.modo === "img" ? "Role ou use + e − para o zoom, arraste para mover, ← → para passar." : "Use o protótipo como uma página. As setas da tela passam para o próximo.";
  }
  function mvTocar(v) {
    M.tocar = v; mv.classList.toggle("tocar", v);
    var b = $("[data-mv='alternar']", mv); b.textContent = v ? "Mover a tela" : "Tocar no protótipo"; b.setAttribute("aria-pressed", v); b.classList.toggle("ativo", v);
  }
  function mvAjustar() {
    if (!M.w) return;
    var W = vista.clientWidth, H = vista.clientHeight, m = W < 600 ? 10 : 32;
    if (M.modo === "frame" && celular()) {
      // protótipo no celular: altura da tela, legível, começando pela esquerda
      M.fit = Math.min((W - m * 2) / M.w, (H - m * 2) / M.h);
      M.s = Math.min(1, (H - m * 2) / M.h); M.x = m; M.y = (H - M.h * M.s) / 2;
    } else {
      M.fit = Math.min((W - m * 2) / M.w, (H - m * 2) / M.h, M.modo === "frame" ? 1 : 1.5);
      M.s = M.fit; M.x = (W - M.w * M.s) / 2; M.y = (H - M.h * M.s) / 2;
    }
    mvAplicar();
  }
  function mvAplicar() {
    var el = M.modo === "img" ? $("img", vista) : $(".mv-fr", vista); if (!el) return;
    el.style.transform = "translate(" + M.x + "px," + M.y + "px) scale(" + M.s + ")";
    $(".mv-zoom .pct", mv).textContent = Math.round(M.s * 100) + "%";
  }
  function mvZoom(f, cx, cy) {
    if (cx === undefined) { cx = vista.clientWidth / 2; cy = vista.clientHeight / 2; }
    var ns = Math.max(M.fit * 0.5, Math.min(8, M.s * f));
    M.x = cx - (cx - M.x) * (ns / M.s); M.y = cy - (cy - M.y) * (ns / M.s); M.s = ns; mvAplicar();
  }
  function mvDuplo(cx, cy) { if (Math.abs(M.s - M.fit) < 0.01) mvZoom(Math.max(1, M.fit * 2) / M.s, cx, cy); else mvAjustar(); }
  window.addEventListener("resize", function () { if (!mv.hidden) mvAjustar(); });
  vista.addEventListener("wheel", function (e) {
    if (!movel()) return; e.preventDefault();
    var r = vista.getBoundingClientRect(); mvZoom(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  var toque = { t: 0, x: 0, y: 0, mov: 0 };
  vista.addEventListener("pointerdown", function (e) {
    if (!movel()) return;
    vista.setPointerCapture(e.pointerId); M.pts[e.pointerId] = [e.clientX, e.clientY]; vista.classList.add("arrasta"); toque.mov = 0;
  });
  vista.addEventListener("pointermove", function (e) {
    if (!M.pts[e.pointerId]) return;
    var ids = Object.keys(M.pts), r = vista.getBoundingClientRect();
    if (ids.length === 1) { var dx = e.clientX - M.pts[e.pointerId][0], dy = e.clientY - M.pts[e.pointerId][1]; toque.mov += Math.abs(dx) + Math.abs(dy); M.x += dx; M.y += dy; M.pts[e.pointerId] = [e.clientX, e.clientY]; mvAplicar(); return; }
    var a = M.pts[ids[0]], b = M.pts[ids[1]], d0 = Math.hypot(a[0] - b[0], a[1] - b[1]);
    M.pts[e.pointerId] = [e.clientX, e.clientY]; toque.mov += 99;
    a = M.pts[ids[0]]; b = M.pts[ids[1]];
    var d1 = Math.hypot(a[0] - b[0], a[1] - b[1]);
    if (d0 > 0) mvZoom(d1 / d0, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top);
  });
  ["pointerup", "pointercancel"].forEach(function (ev) {
    vista.addEventListener(ev, function (e) {
      if (!M.pts[e.pointerId]) return;
      delete M.pts[e.pointerId]; if (!Object.keys(M.pts).length) vista.classList.remove("arrasta");
      // toque duplo (o dblclick não é confiável no celular)
      if (ev === "pointerup" && e.pointerType !== "mouse" && toque.mov < 10) {
        var agora = Date.now(), r = vista.getBoundingClientRect();
        toque.ultimo = agora;
        if (agora - toque.t < 320 && Math.hypot(e.clientX - toque.x, e.clientY - toque.y) < 30) { mvDuplo(e.clientX - r.left, e.clientY - r.top); toque.t = 0; }
        else { toque.t = agora; toque.x = e.clientX; toque.y = e.clientY; }
      }
    });
  });
  vista.addEventListener("dblclick", function (e) {
    if (!movel() || Date.now() - (toque.ultimo || 0) < 800) return; // o toque já tratou o duplo toque
    var r = vista.getBoundingClientRect(); mvDuplo(e.clientX - r.left, e.clientY - r.top);
  });
  mv.addEventListener("click", function (e) {
    var b = e.target.closest("[data-mv]"), ir = e.target.closest("[data-mv-ir]");
    if (ir) { mvIr(+ir.getAttribute("data-mv-ir")); return; }
    if (!b) return;
    var a = b.getAttribute("data-mv");
    if (a === "fechar") mvFechar(); else if (a === "ant") mvIr(M.i - 1); else if (a === "prox") mvIr(M.i + 1);
    else if (a === "mais") mvZoom(1.25); else if (a === "menos") mvZoom(0.8); else if (a === "ajustar") mvAjustar();
    else if (a === "modo") { M.modo = M.modo === "img" ? "frame" : "img"; mvMostrar(); }
    else if (a === "alternar") mvTocar(!M.tocar);
    else if (a === "ver") { mvFechar(); location.hash = b.getAttribute("data-alvo"); }
  });
  document.addEventListener("keydown", function (e) {
    if (mv.hidden) return;
    if (e.key === "Escape") mvFechar(); else if (e.key === "ArrowLeft") mvIr(M.i - 1); else if (e.key === "ArrowRight") mvIr(M.i + 1);
    else if (M.modo === "img" && (e.key === "+" || e.key === "=")) mvZoom(1.25); else if (M.modo === "img" && e.key === "-") mvZoom(0.8); else if (M.modo === "img" && e.key === "0") mvAjustar();
  });
  function mvProbCard(p) {
    return '<div class="mv-prob"><div class="l1">' + seloSev(p.sev) + " " + '<span class="id">' + p.id + "</span><b>" + esc(p.curto) + "</b></div><p>" + esc(p.problema) + "</p></div>";
  }
  function mvTexto(it) {
    var btnModo = it.prot ? '<button type="button" class="btn prim" data-mv="modo">' + (M.modo === "img" ? "Navegar no protótipo" : "Voltar à imagem") + '</button><a class="btn" href="' + it.prot + '" target="_blank" rel="noopener">Nova aba ↗</a>' : "";
    if (it.tipo === "tela") {
      var ps = probsDe(it.c).filter(function (p) { return p.telas.indexOf(it.tela) >= 0; }).sort(function (a, b) { return b.sev - a.sev; });
      return '<div class="chips"><span class="cen-top">' + letra(it.c, true) + " " + CEN[it.c].nome + "</span>" + (it.tela !== "moldura" ? selo("marca", it.anot ? "Anotada" : "Original") : "") + "</div>" +
        "<h3>" + NT[it.tela] + "</h3><p style=\"margin:0;color:var(--mudo)\">" + CEN[it.c].sub + '</p><div class="acoes">' + btnModo + "</div>" +
        (it.tela === "moldura" ? '<h4>Moldura</h4><p style="margin:0;color:var(--sub)">Gerada pelo P0 e reutilizada nas demais telas.</p>'
          : "<h4>Problemas nesta tela · " + ps.length + "</h4>" + (ps.length ? ps.map(mvProbCard).join("") : '<p style="color:var(--mudo)">Nenhum problema registrado.</p>'));
    }
    if (it.tipo === "prob") {
      var p = it.p, g = GRUPOS.filter(function (x) { return x.indexOf(p.id) >= 0; })[0], outros = g ? g.filter(function (x) { return x !== p.id; }) : [];
      return '<div class="chips"><span class="cen-top">' + letra(p.cenario, true) + " " + CEN[p.cenario].nome + "</span>" + seloSev(p.sev) + "</div>" +
        "<h3>" + esc(p.curto) + '</h3><p style="margin:0 0 14px;color:var(--sub)">' + esc(p.problema) + '</p><dl class="dl">' +
        "<dt>Tela</dt><dd>" + esc(p.tela) + "</dd><dt>Critério</dt><dd>" + esc(p.heuristica) + "</dd><dt>Consequência</dt><dd>" + esc(p.consequencia) + "</dd>" +
        "<dt>Origem no prompt</dt><dd>" + selo("neu", ORIG[p.origem]) + " " + esc(p.nota) + (p.specs.length ? " " + specs(p.specs.join(" ")) : "") + "</dd>" +
        (outros.length ? '<dt>Também em</dt><dd><span class="ids">' + outros.map(idl).join("") + "</span></dd>" : "") +
        '</dl><div class="acoes"><button type="button" class="btn" data-mv="ver" data-alvo="#problemas/' + p.id + '">Ver na lista</button></div>';
    }
    // Máximo: só as especificações citadas nas linhas acrescentadas ao prompt desta tela
    var pr = { dashboard: "P1", alunos: "P2", relatorios: "P3" }[it.tela], ids = [];
    D.prompts[pr].MAX.forEach(function (l) { (l.ms || []).forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); }); });
    var ms = D.melhorias.filter(function (m) { return ids.indexOf(m.id) >= 0; });
    var tipo = function (r) { return /^Sim/.test(r) ? "Sim" : /^Parcial/.test(r) ? "Parcial" : "N/V"; };
    var cont = ["Sim", "Parcial", "N/V"].map(function (k) { return [k, ms.filter(function (m) { return tipo(m.resultado) === k; }).length]; }).filter(function (x) { return x[1]; });
    return '<div class="chips">' + selo("marca", "Máximo") + selo("neu", "Fora da comparação") + "</div><h3>" + NT[it.tela] + '</h3><p style="margin:0;color:var(--mudo)">' + pr + " com especificações de IHC acrescentadas ao Prompt Baseline.</p>" + '<div class="acoes">' + btnModo + "</div>" +
      "<h4>Especificações citadas neste prompt · " + ms.length + '</h4><div class="mv-resumo">' + cont.map(function (x) { return seloRes(x[0]) + '<span class="conta">' + x[1] + "</span>"; }).join("") + '</div><ul class="mv-lista">' +
      ms.map(function (m) {
        var det = m.resultado.replace(/^(Sim|Parcial|N\/V)(:\s*|,\s*)?/, "");
        return '<li><span class="id">' + m.id + '</span><div><b>' + esc(m.espec) + "</b>" + (det ? "<p>" + esc(det) + "</p>" : "") + "</div>" + seloRes(m.resultado) + "</li>";
      }).join("") + "</ul>";
  }
  // abrir a partir da página
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-gal]");
    if (t && !mv.contains(t)) { e.preventDefault(); mvAbrir(GAL[t.getAttribute("data-gal")](), +t.getAttribute("data-i"), t.getAttribute("data-modo") || "img"); }
  });

  // ---------------- Visão geral ----------------
  function tamTotal(c) { return ["P0", "P1", "P2", "P3"].reduce(function (s, p) { return s + D.prompts[p].tam[c][1]; }, 0); }
  function delta(v, ref) {
    if (ref === undefined) return "";
    var d = v - ref; if (!d) return '<span class="delta s-neu">=</span>';
    return '<span class="delta ' + (d < 0 ? "s-pos" : "s-neg") + '" title="Em relação a A">' + (d < 0 ? "−" : "+") + Math.abs(d) + "</span>";
  }
  function rVisao() {
    var pA = probsDe("A"), gA = pA.filter(function (p) { return p.sev === 3; }).length;
    var h = '<div class="titulo"><div><h1>Visão geral</h1><p>Três prompts com níveis diferentes de explicitação de IHC, as mesmas telas e as mesmas tarefas.</p></div></div><div class="g3">';
    ABC.forEach(function (c) {
      var ps = probsDe(c), graves = ps.filter(function (p) { return p.sev === 3; }).length, ref = c !== "A";
      var cont = [3, 2, 1].map(function (s) { return [s, ps.filter(function (p) { return p.sev === s; }).length]; }).filter(function (x) { return x[1]; });
      h += '<div class="painel p-in"><div class="cen-top">' + letra(c) + '<span class="cen-nome">' + CEN[c].nome + '</span></div><p class="cen-sub">' + CEN[c].sub + "</p>" +
        '<div class="metr"><div><b>' + CEN[c].esp + "</b><span>especificações</span></div><div><b>" + fmt(tamTotal(c)) + "</b><span>palavras no prompt</span></div>" +
        "<div><b>" + ps.length + (ref ? delta(ps.length, pA.length) : "") + "</b><span>problemas</span></div><div><b>" + graves + (ref ? delta(graves, gA) : "") + "</b><span>de severidade 3</span></div></div>" +
        '<div class="barra-sev">' + cont.map(function (x) { return '<i style="flex:' + x[1] + ";background:" + CORSEV[x[0]] + '"></i>'; }).join("") + '</div><div class="leg-sev">' +
        cont.map(function (x) { return '<span class="ls" style="--c:' + CORSEV[x[0]] + '">' + x[1] + " " + NOMESEV[x[0]] + (x[1] > 1 ? (x[0] === 1 ? "s" : "es") : "") + "</span>"; }).join("") + "</div></div>";
    });
    h += '</div><div class="bloco"><h2>Tarefas</h2><div class="painel tab"><table><thead><tr><th>Tarefa</th>' + ABC.map(function (c) { return "<th>" + c + " · " + CEN[c].nome + "</th>"; }).join("") + "</tr></thead><tbody>" +
      TAREFAS.map(function (t) { return '<tr><td class="n">' + t[0] + "</td>" + [1, 2, 3].map(function (i) { return "<td>" + seloEst(t[i]) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div></div>";
    h += '<div class="bloco"><h2>O que mudou em relação a A</h2><div class="g2">' + MUDOU.map(function (m) {
      return '<div class="painel mud"><div>' + selo(m[0], m[1]) + "</div><p>" + esc(m[2]) + '</p><span class="ids">' + m[3].map(idl).join("") + "</span></div>";
    }).join("") + "</div></div>";
    h += '<div class="bloco"><h2>Tabelas do relatório</h2>' + [["Matriz de resultados", "Tabela 19", D.t19], ["Síntese da UX", "Tabela 18", D.t18], ["Explicitação por plano de Garrett", "Tabela 20", D.t20], ["Conjunto mínimo de especificações", "Tabela 21", D.t21]]
      .map(function (t) { return '<details class="painel acc"><summary><span>' + t[0] + ' <span class="conta">· ' + t[1] + "</span></span></summary>" + tabela(t[2]) + "</details>"; }).join("") + "</div>";
    $("#sec-visao").innerHTML = h;
  }

  // ---------------- Telas ----------------
  function rTelas() {
    var gal = galTelas();
    var h = '<div class="titulo"><div><h1>Telas</h1><p>A mesma tela nos três cenários.</p></div></div><div class="ferr">' + seg("tela", eT.tela, TELAS) + '<label class="chave"><input type="checkbox" id="chAnot"' + (eT.anot === "1" ? " checked" : "") + '> Mostrar anotações</label></div><div class="g3">';
    ABC.forEach(function (c) {
      var k = gal.findIndex(function (it) { return it.c === c && it.tela === eT.tela; }), it = gal[k];
      var ps = probsDe(c).filter(function (p) { return p.telas.indexOf(eT.tela) >= 0; }).sort(function (a, b) { return b.sev - a.sev; });
      h += '<div class="painel"><div class="tela-cab"><span class="cen-top">' + letra(c, true) + CEN[c].nome + '</span><button type="button" class="btn" data-gal="telas" data-i="' + k + '" data-modo="frame">Protótipo</button></div>' +
        '<button type="button" class="moldura" data-gal="telas" data-i="' + k + '" aria-label="Abrir ' + NT[eT.tela] + " de " + CEN[c].nome + '"><img loading="lazy" src="' + it.src + '" alt=""></button>' +
        (ps.length ? '<ul class="lista-p">' + ps.map(function (p) { return '<li><a href="#problemas/' + p.id + '">' + seloSev(p.sev) + '<span class="id">' + p.id + "</span><span>" + esc(p.curto) + "</span></a></li>"; }).join("") + "</ul>"
          : '<p class="vazio">' + (eT.tela === "moldura" ? "Moldura reutilizada nas demais telas." : "Nenhum problema registrado.") + "</p>") + "</div>";
    });
    $("#sec-telas").innerHTML = h + "</div>";
  }
  $("#sec-telas").addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-tela]"); if (!b) return;
    eT.tela = b.dataset.tela; rTelas();
  });
  $("#sec-telas").addEventListener("change", function (ev) { if (ev.target.id === "chAnot") { eT.anot = ev.target.checked ? "1" : "0"; rTelas(); } });

  // ---------------- Prompts (diff no padrão de revisão de código) ----------------
  var NP = { P0: "Frame Master", P1: "Dashboard", P2: "Alunos", P3: "Relatórios" };
  var eP = { p: "P1", modo: "AB", abertos: {} }, eM = { p: "P1", abertos: {} };
  // linha de diff: g1/g2 = números, k = ctx | del | add | vazio
  function lin(g1, g2, k, html) {
    var mk = k === "del" ? "−" : k === "add" ? "+" : "";
    return '<div class="dl-l dl-' + k + '"><span class="dl-g">' + (g1 || "") + '</span><span class="dl-g">' + (g2 || "") + '</span><span class="dl-mk">' + mk + '</span><span class="dl-tx">' + (html === "" ? " " : html) + "</span></div>";
  }
  function lin1(n, k, html, tags) {
    var mk = k === "del" ? "−" : k === "add" ? "+" : k === "alt" ? "~" : "";
    return '<div class="dl-l dl-' + k + (tags ? " dl-tem" : "") + '"><span class="dl-g">' + (n || "") + '</span><span class="dl-mk">' + mk + '</span><span class="dl-tx">' + (html === "" ? " " : html) + "</span>" + (tags ? '<span class="dl-tags">' + tags + "</span>" : "") + "</div>";
  }
  function nota(tag, verbo) {
    return '<div class="dl-nota"><span class="dl-nota-in"><span class="dl-nota-v' + (/^Alterado/.test(verbo) ? " alt" : "") + '">' + verbo + "</span>" + specs(tag) + '<span class="dl-nota-t">' + esc(tag.replace(/M\d\d\s*/g, "").replace(/;\s*$/, "").replace(/^;\s*/, "")) + "</span></span></div>";
  }
  function realce(antigo, novo) {
    // o novo é o antigo sem um trecho: realça o trecho retirado
    var i = 0; while (i < novo.length && antigo[i] === novo[i]) i++;
    var j = 0; while (j < novo.length - i && antigo[antigo.length - 1 - j] === novo[novo.length - 1 - j]) j++;
    return esc(antigo.slice(0, i)) + '<mark class="dl-del-w">' + esc(antigo.slice(i, antigo.length - j)) + "</mark>" + esc(antigo.slice(antigo.length - j));
  }
  function expandir(n, k) { return '<button type="button" class="dl-exp" data-abrir="' + k + '"><span class="dl-exp-i" aria-hidden="true">⋯</span>Mostrar ' + n + " linhas iguais</button>"; }
  function dobrar(L, igual, chave, abertos, render) {
    var h = "", i = 0;
    while (i < L.length) {
      if (igual(L[i])) {
        var j = i; while (j < L.length && igual(L[j])) j++;
        var k = chave + ":" + i, x;
        if (j - i > 6 && !abertos[k]) {
          var a = i === 0 ? 0 : 2, b = j === L.length ? 0 : 2;
          for (x = i; x < i + a; x++) h += render(x);
          h += expandir(j - i - a - b, k);
          for (x = j - b; x < j; x++) h += render(x);
        } else for (x = i; x < j; x++) h += render(x);
        i = j;
      } else { h += render(i); i++; }
    }
    return h;
  }
  function quadros(n, total, k) {
    var c = Math.max(1, Math.round(5 * n / Math.max(total, 1))), h = "";
    for (var i = 0; i < 5; i++) h += '<i class="' + (i < c ? k : "") + '"></i>';
    return '<span class="qs">' + h + "</span>";
  }
  function arquivos(estado, stat) {
    return '<div class="dl-arqs" role="tablist">' + ["P0", "P1", "P2", "P3"].map(function (p) {
      var s = stat(p);
      return '<button type="button" role="tab" aria-selected="' + (estado.p === p) + '" data-p="' + p + '" class="' + (estado.p === p ? "ativo" : "") + '"><span class="dl-arq-n"><span class="mono">' + p + "</span>" + NP[p] + '</span><span class="dl-arq-s">' + s + "</span></button>";
    }).join("") + "</div>";
  }
  function statB(p) {
    var L = D.prompts[p].A, rem = L.filter(function (l) { return l.s === "cut" && l.t.trim(); }).length, alt = L.filter(function (l) { return l.s === "chg"; }).length;
    return '<span class="n-del">−' + rem + "</span>" + quadros(rem, L.filter(function (l) { return l.t.trim(); }).length, "q-del");
  }
  function rAB(P) {
    var L = P.A;
    return '<div class="dl-cod">' + dobrar(L, function (l) { return !l.s && l.b; }, eP.p, eP.abertos, function (i) {
      var l = L[i];
      if (!l.s && l.b) return lin(i + 1, l.b, "ctx", esc(l.t));
      if (!l.s) return lin(i + 1, "", "del", "");
      if (l.s === "cut") return (l.ini ? nota(l.tag, "Retirado em B") : "") + lin(i + 1, "", "del", esc(l.t));
      return nota(l.tag, "Alterado em B") + lin(i + 1, "", "del", realce(l.t, l.novo)) + lin("", l.b, "add", esc(l.novo));
    }) + "</div>";
  }
  function rAC(P) {
    var a = P.A.map(function (l, i) { return lin1(i + 1, "ctx", esc(l.t)); }).join("");
    var c = P.C.map(function (l, i) { return lin1(i + 1, "ctx", esc(l.t), l.tags.length ? specs(l.tags.join(" ")) : ""); }).join("");
    return '<div class="dl-lado"><div><div class="dl-sub">' + letra("A", true) + "Baseline <span class=\"conta\">" + P.tam.A[1] + ' palavras</span></div><div class="dl-cod dl-c1">' + a + '</div></div><div><div class="dl-sub">' + letra("C", true) + 'Mínimo <span class="conta">' + P.tam.C[1] + ' palavras</span></div><div class="dl-cod dl-c1">' + c +
      '</div><div class="dl-falta"><b>Sem correspondência em C</b><span class="ids">' + specs(SEM_EM_C.join(" ")) + "</span></div></div></div>";
  }
  function rPrompts() {
    var P = D.prompts[eP.p], ab = eP.modo === "AB";
    var statC = function (p) { return '<span class="conta">' + D.prompts[p].tam.C[1] + " pal.</span>"; };
    var rem = P.A.filter(function (l) { return l.s === "cut" && l.t.trim(); }).length, alt = P.A.filter(function (l) { return l.s === "chg"; }).length;
    var cab = '<div class="dl-cab"><div class="dl-cab-t"><span class="mono">' + eP.p + "</span>" + NP[eP.p] + "</div>" +
      (ab ? '<div class="dl-cab-s"><span class="n-del">−' + rem + ' linhas</span>' + (alt ? '<span class="n-alt">~' + alt + (alt > 1 ? " alteradas" : " alterada") + "</span>" : "") + "<span class=\"conta\">A " + P.tam.A[1] + " → B " + P.tam.B[1] + " palavras</span></div>"
        : '<div class="dl-cab-s"><span class="conta">Etiquetas: o que cada linha de C realiza</span></div>') + "</div>";
    var h = '<div class="titulo"><div><h1>Prompts</h1><p>' + (ab ? "O que saiu do Prompt Baseline para formar B." : "O Prompt Baseline ao lado do prompt reescrito de C.") + '</p></div></div><div class="ferr">' + seg("modo", eP.modo, [["AB", "Baseline → B"], ["AC", "Baseline × C"]]) + "</div>" +
      '<div class="dl">' + arquivos(eP, ab ? statB : statC) + '<div class="painel dl-pai">' + cab + (ab ? rAB(P) : rAC(P)) + "</div></div>";
    $("#sec-prompts").innerHTML = h;
  }
  $("#sec-prompts").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    if (b.dataset.p) eP.p = b.dataset.p; else if (b.dataset.modo) eP.modo = b.dataset.modo; else if (b.dataset.abrir) eP.abertos[b.dataset.abrir] = 1; else return;
    rPrompts();
  });

  // ---------------- Especificações ----------------
  var eE = { plano: "", imp: "", aberto: null };
  var linhasEsp = D.modelos.concat(["R1", "R2", "R3"].map(function (id) { return { id: id, nome: D.rastro[id].rotulo.replace(id + " ", ""), plano: "Requisito mínimo", importancia: "Requisito mínimo" }; }));
  function cortesDe(id) {
    var out = [];
    ["P0", "P1", "P2", "P3"].forEach(function (p) { D.prompts[p].A.forEach(function (l, i) { if ((l.ini || l.s === "chg") && new RegExp("\\b" + id + "\\b").test(l.tag)) out.push('<a class="id" href="#prompts/' + p + '">' + p + ", linha " + (i + 1) + "</a>"); }); });
    return out;
  }
  function rEsp() {
    var planos = ["Estratégia", "Escopo", "Estrutura", "Esqueleto", "Superfície", "Requisito mínimo"], imps = ["Essencial", "Importante", "Complementar", "Requisito mínimo"];
    var vis = linhasEsp.filter(function (m) { return (!eE.plano || m.plano === eE.plano) && (!eE.imp || m.importancia === eE.imp); });
    var h = '<div class="titulo"><div><h1>Especificações</h1><p>O que cada prompt pediu e o que apareceu em cada protótipo.</p></div></div><div class="ferr">' +
      sel("fPlano", eE.plano, [["", "Todos os planos"]].concat(planos.map(function (p) { return [p, p]; }))) + sel("fImp", eE.imp, [["", "Toda importância"]].concat(imps.map(function (p) { return [p, p]; }))) +
      '<span class="conta dir">' + vis.length + ' itens</span></div><div class="painel tab"><table><thead><tr><th>ID</th><th>Modelo ou requisito</th><th>Plano</th><th>Importância</th><th>A</th><th>B</th><th>C</th><th>Problemas</th></tr></thead><tbody>';
    vis.forEach(function (m) {
      var r = D.rastro[m.id], ps = D.problemas.filter(function (p) { return p.specs.indexOf(m.id) >= 0; }), ab = eE.aberto === m.id;
      h += '<tr class="lin' + (ab ? " aberta" : "") + '" data-id="' + m.id + '" id="esp-' + m.id + '" tabindex="0"><td><span class="id">' + m.id + '</span></td><td class="n">' + esc(m.nome) + '</td><td style="color:var(--sub)">' + m.plano + '</td><td style="color:var(--sub)">' + m.importancia +
        "</td><td>" + seloRes(r.A) + "</td><td>" + seloRes(r.B) + "</td><td>" + seloRes(r.C) + '</td><td><span class="ids">' + ps.map(function (p) { return idl(p.id); }).join("") + "</span></td></tr>";
      if (ab) {
        var cs = cortesDe(m.id), g = [];
        if (m.finalidade) g.push(["Finalidade", esc(m.finalidade)]);
        if (m.como) g.push(["No Prompt Baseline", esc(m.como)]);
        if (m.depende && m.depende !== "-") g.push(["Depende de", '<span class="ids">' + specs(m.depende) + "</span>"]);
        ABC.forEach(function (c) { g.push(["Resultado em " + c, seloRes(r[c]) + " " + esc(r[c].replace(/^(Sim|Parcial|Não|N\/V)[:,]?\s*/, ""))]); });
        if (cs.length) g.push(["Retirado em B", '<span class="ids">' + cs.join("") + "</span>"]);
        if (ps.length) g.push(["Problemas", ps.map(function (p) { return seloSev(p.sev) + " " + idl(p.id) + " " + esc(p.curto); }).join("<br>")]);
        h += '<tr><td colspan="8" class="det"><dl class="dl">' + g.map(function (x) { return "<dt>" + x[0] + "</dt><dd>" + x[1] + "</dd>"; }).join("") + "</dl></td></tr>";
      }
    });
    $("#sec-especificacoes").innerHTML = h + "</tbody></table></div>";
  }
  $("#sec-especificacoes").addEventListener("change", function (ev) { if (ev.target.id === "fPlano") eE.plano = ev.target.value; if (ev.target.id === "fImp") eE.imp = ev.target.value; rEsp(); });
  function alternaEsp(ev) {
    if (ev.target.closest("a")) return; var tr = ev.target.closest("tr.lin"); if (!tr) return;
    if (ev.type === "keydown" && ev.key !== "Enter" && ev.key !== " ") return; if (ev.type === "keydown") ev.preventDefault();
    eE.aberto = eE.aberto === tr.dataset.id ? null : tr.dataset.id; rEsp(); var n = document.getElementById("esp-" + tr.dataset.id); if (n) n.focus();
  }
  $("#sec-especificacoes").addEventListener("click", alternaEsp);
  $("#sec-especificacoes").addEventListener("keydown", alternaEsp);

  // ---------------- Problemas ----------------
  var ePr = { c: "", s: "", t: "", o: "", abertos: {} };
  function listaProb() {
    return D.problemas.filter(function (p) {
      return (!ePr.c || p.cenario === ePr.c) && (!ePr.s || p.sev === +ePr.s) && (!ePr.t || p.tarefas.indexOf(ePr.t) >= 0) && (!ePr.o || p.origem === ePr.o);
    }).sort(function (a, b) { return a.cenario < b.cenario ? -1 : a.cenario > b.cenario ? 1 : b.sev - a.sev || (a.id < b.id ? -1 : 1); })
      .map(function (p) { return { tipo: "prob", p: p, src: img(p.cenario, p.telas[0], true) }; });
  }
  function rProb(foco) {
    if (foco) ePr.abertos[foco] = 1;
    var L = listaProb();
    var h = '<div class="titulo"><div><h1>Problemas</h1><p>Severidade de 0 a 4 (Nielsen, 1994) e a origem de cada problema no prompt.</p></div></div><div class="ferr">' +
      sel("fC", ePr.c, [["", "Todos os cenários"], ["A", "A · Baseline"], ["B", "B · Intermediário"], ["C", "C · Mínimo"]]) +
      sel("fS", ePr.s, [["", "Toda severidade"], ["3", "3 · maior"], ["2", "2 · menor"], ["1", "1 · cosmético"]]) +
      sel("fT", ePr.t, [["", "Toda tarefa"]].concat(["Priorizar", "Compreender", "Decidir", "Tratar erro", "Acompanhar"].map(function (t) { return [t, t]; }))) +
      sel("fO", ePr.o, [["", "Toda origem"]].concat(Object.keys(ORIG).map(function (k) { return [k, ORIG[k]]; }))) +
      '<span class="conta dir">' + L.length + ' problemas</span></div><div class="painel">';
    L.forEach(function (it, k) {
      var p = it.p, ab = !!ePr.abertos[p.id], g = GRUPOS.filter(function (x) { return x.indexOf(p.id) >= 0; })[0], outros = g ? g.filter(function (x) { return x !== p.id; }) : [];
      h += '<div class="it' + (ab ? " aberto" : "") + '" id="prob-' + p.id + '"><button type="button" data-it="' + p.id + '" aria-expanded="' + ab + '">' + seloSev(p.sev) + '<span class="id">' + p.id + '</span><span class="tt">' + esc(p.curto) + '</span><span class="meta">' + letra(p.cenario, true) + esc(p.telas.map(function (t) { return NT[t]; }).join(", ")) + " " + selo("neu", ORIG[p.origem]) + '</span><span class="chev"></span></button>';
      if (ab) {
        h += '<div class="it-det"><div><p class="desc">' + esc(p.problema) + '</p><dl class="dl"><dt>Critério</dt><dd>' + esc(p.heuristica) + "</dd><dt>Consequência</dt><dd>" + esc(p.consequencia) + "</dd>" +
          "<dt>Origem no prompt</dt><dd>" + esc(p.nota) + (p.specs.length ? ' <span class="ids">' + specs(p.specs.join(" ")) + "</span>" : "") + "</dd>" +
          (outros.length ? '<dt>Também em</dt><dd><span class="ids">' + outros.map(idl).join("") + "</span></dd>" : "") +
          '</dl></div><div><button type="button" class="moldura" data-gal="prob" data-i="' + k + '" aria-label="Abrir figura de ' + p.id + '"><img loading="lazy" src="' + it.src + '" alt=""></button><p class="conta" style="margin:8px 0 0">' + esc(p.evidencia) + "</p></div></div>";
      }
      h += "</div>";
    });
    $("#sec-problemas").innerHTML = h + "</div>";
    if (foco) { var el = document.getElementById("prob-" + foco); if (el) { el.scrollIntoView({ block: "start" }); el.classList.add("destaque"); } }
  }
  $("#sec-problemas").addEventListener("change", function (ev) { var m = { fC: "c", fS: "s", fT: "t", fO: "o" }[ev.target.id]; if (m) { ePr[m] = ev.target.value; rProb(); } });
  $("#sec-problemas").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b || b.hasAttribute("data-gal")) return;
    if (b.dataset.cen !== undefined) ePr.c = b.dataset.cen;
    else if (b.dataset.it) { var id = b.dataset.it; if (ePr.abertos[id]) delete ePr.abertos[id]; else ePr.abertos[id] = 1; }
    else return;
    rProb();
  });

  // ---------------- Melhorias ----------------
  function rMelh() {
    var P = D.prompts[eM.p], L = P.MAX, gal = GAL.melh();
    var h = '<div class="titulo"><div><h1>Melhorias propostas</h1><p>O Máximo acrescenta 20 especificações ao Prompt Baseline. Fica fora da comparação.</p></div>' + selo("neu", "Fora da comparação") + '</div><div class="g3">' +
      gal.map(function (it, k) {
        return '<div class="painel" style="padding-bottom:12px"><div class="tela-cab"><b>' + NT[it.tela] + '</b><button type="button" class="btn" data-gal="melh" data-i="' + k + '" data-modo="frame">Protótipo</button></div><button type="button" class="moldura" data-gal="melh" data-i="' + k + '" aria-label="Abrir ' + NT[it.tela] + ' do Máximo"><img loading="lazy" src="' + it.src + '" alt=""></button></div>';
      }).join("") + "</div>";
    h += '<div class="bloco"><h2>Especificações acrescentadas</h2><div class="painel tab"><table><thead><tr><th>ID</th><th>Especificação</th><th>Origem</th><th>Resultado</th></tr></thead><tbody>' +
      D.melhorias.map(function (m) { return '<tr><td><span class="id">' + m.id + '</span></td><td class="n">' + esc(m.espec) + '</td><td style="color:var(--sub)">' + esc(m.origem) + "</td><td>" + seloRes(m.resultado) + ' <span style="color:var(--sub)">' + esc(m.resultado.replace(/^(Sim|Parcial|N\/V)(:\s*|,\s*)?/, "")) + "</span></td></tr>"; }).join("") + "</tbody></table></div></div>";
    var statM = function (p) { var L2 = D.prompts[p].MAX, n = L2.filter(function (l) { return l.s === "add"; }).length; return '<span class="n-add">+' + n + "</span>" + quadros(n, L2.length, "q-add"); };
    var nAdd = L.filter(function (l) { return l.s === "add"; }).length, nChg = L.filter(function (l) { return l.s === "chg"; }).length;
    var nums = [], c0 = 0; L.forEach(function (l) { nums.push(l.s === "del" ? "" : ++c0); });
    h += '<div class="bloco"><h2>Prompt: Baseline → Máximo</h2><div class="dl">' + arquivos(eM, statM) + '<div class="painel dl-pai"><div class="dl-cab"><div class="dl-cab-t"><span class="mono">' + eM.p + "</span>" + NP[eM.p] + '</div><div class="dl-cab-s"><span class="n-add">+' + nAdd + " linhas</span>" + (nChg ? '<span class="n-alt">~' + nChg + " símbolos trocados por descrição</span>" : "") + '</div></div><div class="dl-cod dl-c1">' +
      dobrar(L, function (l) { return l.s === "eq"; }, "M" + eM.p, eM.abertos, function (i) {
        var l = L[i];
        if (l.s === "eq") return lin1(nums[i], "ctx", esc(l.t));
        if (l.s === "del") return lin1("", "del", esc(l.t));
        if (l.s === "chg") return lin1(nums[i], "alt", esc(l.t));
        return lin1(nums[i], "add", esc(l.t), (l.ms || []).length ? specs(l.ms.join(" ")) : "");
      }) + "</div></div></div></div>";
    $("#sec-melhorias").innerHTML = h;
  }
  $("#sec-melhorias").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b || b.hasAttribute("data-gal")) return;
    if (b.dataset.p) eM.p = b.dataset.p; else if (b.dataset.abrir) eM.abertos[b.dataset.abrir] = 1; else return;
    rMelh();
  });

  // ---------------- navegação ----------------
  var feito = {};
  function ir() {
    var partes = (location.hash || "#visao").slice(1).split("/"), aba = partes[0], arg = partes[1];
    if (!$("#sec-" + aba)) aba = "visao";
    $$(".secao").forEach(function (s) { s.classList.toggle("ativa", s.id === "sec-" + aba); });
    $$(".nav a").forEach(function (a) { a.classList.toggle("ativa", a.dataset.aba === aba); if (a.dataset.aba === aba) { var nv = a.parentNode, ra = a.getBoundingClientRect(), rn = nv.getBoundingClientRect(); if (ra.right > rn.right - 24 || ra.left < rn.left) nv.scrollLeft += ra.left - rn.left - 8; } });
    if (aba === "visao" && !feito.visao) { rVisao(); feito.visao = 1; }
    if (aba === "telas") rTelas();
    if (aba === "prompts") { if (arg && D.prompts[arg]) { eP.p = arg; eP.modo = "AB"; } rPrompts(); }
    if (aba === "especificacoes") { if (arg) eE = { plano: "", imp: "", aberto: arg }; rEsp(); if (arg) { var tr = document.getElementById("esp-" + arg); if (tr) tr.scrollIntoView({ block: "start" }); } }
    if (aba === "problemas") { if (arg) ePr = { c: "", s: "", t: "", o: "", abertos: {} }; rProb(arg); }
    if (aba === "melhorias") rMelh();
    if (!arg) window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", ir);
  ir();
})();
