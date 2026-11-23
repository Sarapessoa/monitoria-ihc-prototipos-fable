(function () {
  "use strict";
  var D = window.DADOS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var CEN = {
    A: { nome: "A - Baseline", cond: "Prompt Baseline original, sem alterações. As telas são as do protótipo original, avaliado na Parte 1.", espec: "22 (7 essenciais, 9 importantes, 6 complementares)" },
    B: { nome: "B - Intermediário", cond: "Prompt Baseline sem as 6 especificações complementares, derivado só por remoção. Nada foi acrescentado.", espec: "16 (7 essenciais e 9 importantes)" },
    C: { nome: "C - Mínimo", cond: "Prompt reescrito de forma condensada, com os 7 essenciais e informações básicas sobre problema, público e finalidade.", espec: "7 essenciais e parte de M16" }
  };
  var EST = { ok: ["viável", "est-ok"], parcial: ["com restrição", "est-parcial"], ruim: ["comprometida", "est-ruim"], na: ["não avaliável", "est-na"] };
  var TAREFAS = {
    A: [["Priorizar", "ok", "priorizados e motivo visíveis; sem lista de alunos"], ["Compreender", "ok", "confiança sem referente"], ["Decidir", "parcial", "sem \"Rejeitar\" no Dashboard"], ["Tratar erro", "ok", "42% e recomendação segura em Alunos"], ["Acompanhar", "parcial", "indicadores sem definição; históricos sem autoria"], ["Ajuda", "na", "busca e cards sem conteúdo"]],
    B: [["Priorizar", "ok", "sem lista de alunos"], ["Compreender", "ok", "confiança com referente"], ["Decidir", "ok", "aceitar, ajustar e rejeitar"], ["Tratar erro", "ok", "42% e recomendação segura"], ["Acompanhar", "parcial", "históricos sem autoria"], ["Ajuda", "na", "fora do protótipo"]],
    C: [["Priorizar", "ok", "sem lista de alunos"], ["Compreender", "ruim", "sem confiança da IA"], ["Decidir", "ok", "aceitar, ajustar e rejeitar"], ["Tratar erro", "ruim", "sem sinal de incerteza da IA"], ["Acompanhar", "ruim", "sem histórico de recomendações"], ["Ajuda", "na", "fora do protótipo"]]
  };
  var MUDOU = [
    "Deixaram de ocorrer em B e C a ausência de \"Rejeitar\" no Dashboard (E1-01), a confiança sem referente (E1-04) e a cor de prioridade inconsistente (E1-08).",
    "Os indicadores sem definição (E1-05) deixaram de ocorrer em C e reapareceram em B de forma mais branda (PB-04).",
    "Persistem nos três a falta de lista de alunos (E1-02, PB-01, PC-01) e os históricos sem autoria (E1-06, PB-02, PC-03).",
    "Surgiram dois problemas novos: em B e C, o telefone exibido (PB-05, PC-04); só em C, a ausência de confiança da IA (PC-02)."
  ];
  var GRUPOS = [["E1-02", "PB-01", "PC-01"], ["E1-06", "PB-02", "PC-03"], ["E1-07", "PB-03", "PC-05"], ["E1-05", "PB-04"], ["PB-05", "PC-04"]];
  var TELAS = [["moldura", "Frame Master (P0)"], ["dashboard", "Dashboard (P1)"], ["alunos", "Alunos (P2)"], ["relatorios", "Relatórios (P3)"]];
  var NOME_TELA = { moldura: "Frame Master", dashboard: "Dashboard", alunos: "Alunos", relatorios: "Relatórios" };
  var SEM_EM_C = { imp: ["M04", "M06", "M08", "M10", "M11", "M15", "M17", "M22"], comp: ["M12", "M13", "M18", "M19", "M20", "M21"] };

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
  var sev = function (n) { return '<span class="sev sev' + n + '" title="Severidade ' + n + '">' + n + "</span>"; };
  var chipsMod = function (txt) {
    var ids = String(txt).match(/\b(M\d\d|R[123])\b/g) || [];
    return ids.filter(function (v, i) { return ids.indexOf(v) === i; }).map(function (id) {
      return '<a class="chip' + (id[0] === "R" ? " r" : "") + '" href="#especificacoes/' + id + '">' + id + "</a>";
    }).join("");
  };
  var linkProb = function (id) { return '<a href="#problemas/' + id + '">' + id + "</a>"; };
  function tabela(rows, opts) {
    opts = opts || {};
    var h = '<div class="tabela-rolagem"><table><thead><tr>' + rows[0].map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>";
    rows.slice(1).forEach(function (r) { h += "<tr>" + r.map(function (c, i) { return "<td" + (i === 0 ? ' style="font-weight:600"' : "") + ">" + esc(c) + "</td>"; }).join("") + "</tr>"; });
    return h + "</tbody></table></div>";
  }
  function zoom(src) {
    var z = $("#zoom"); $("img", z).src = src; z.hidden = false; $(".zoom-fechar", z).focus();
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-zoom]");
    if (t) { zoom(t.getAttribute("data-zoom")); return; }
    if (e.target.closest("#zoom")) { $("#zoom").hidden = true; }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") $("#zoom").hidden = true; });

  // ---------------- Visão geral ----------------
  function totTam(c) { var s = [0, 0]; ["P0", "P1", "P2", "P3"].forEach(function (p) { s[0] += D.prompts[p].tam[c][0]; s[1] += D.prompts[p].tam[c][1]; }); return s; }
  function rVisao() {
    var h = '<h2>Visão geral</h2><p class="lead">Três protótipos do MonitorIA gerados a partir de prompts com diferentes níveis de explicitação de IHC. A comparação cobre as telas com prompt registrado (Frame Master, Dashboard, Alunos e Relatórios), com as seis tarefas da Tabela 1, as heurísticas de Nielsen e a mesma escala de severidade. Problema, público, objetivos, funcionalidades e valores de exemplo são os mesmos nos três.</p><div class="grade3">';
    ["A", "B", "C"].forEach(function (c) {
      var ps = D.problemas.filter(function (p) { return p.cenario === c; });
      var cont = [3, 2, 1].map(function (s) { var n = ps.filter(function (p) { return p.sev === s; }).length; return n ? sev(s) + " " + n : ""; }).filter(Boolean).join(" &nbsp; ");
      var t = totTam(c);
      h += '<div class="cartao"><h3>' + CEN[c].nome + '</h3><p class="mini">' + CEN[c].cond + "</p>" +
        '<div class="rot">Especificações de IHC</div><div>' + CEN[c].espec + "</div>" +
        '<div class="rot">Tamanho dos prompts (P0 a P3)</div><div>' + t[0].toLocaleString("pt-BR") + " caracteres; " + t[1].toLocaleString("pt-BR") + " palavras</div>" +
        '<div class="rot">Problemas no escopo comparado</div><div><span class="num">' + ps.length + "</span> &nbsp; " + cont + "</div>" +
        '<div class="rot">Tarefas</div><ul class="tarefas">' + TAREFAS[c].map(function (t) {
          return "<li><span>" + t[0] + ' <span class="mini">' + esc(t[2]) + '</span></span><span class="est ' + EST[t[1]][1] + '">' + EST[t[1]][0] + "</span></li>";
        }).join("") + "</ul>" +
        '<p class="mini" style="margin-top:12px"><a href="#telas">Ver telas</a> &middot; <a href="#problemas/' + c + '">Ver problemas</a></p></div>';
    });
    h += "</div>";
    h += '<h3>O que mudou em relação a A</h3><ul class="lista">' + MUDOU.map(function (m) { return "<li>" + esc(m).replace(/\b(E1-0\d|P[BC]-0\d)\b/g, linkProb) + "</li>"; }).join("") + "</ul>";
    h += "<h3>Matriz de resultados (Tabela 19)</h3>" + tabela(D.t19);
    h += "<h3>Síntese da UX por cenário (Tabela 18)</h3>" + tabela(D.t18);
    h += "<h3>Necessidade de explicitação por plano de Garrett (Tabela 20)</h3>" + tabela(D.t20);
    h += '<h3>Conjunto mínimo de especificações (Tabela 21)</h3><p class="lead">Entre os conjuntos testados, o menor que chegou a uma qualidade aceitável foi o de B: os 7 essenciais e os 9 importantes, sem os complementares. Os dois problemas de severidade 3 de B vêm de especificações que faltam nos três prompts.</p>' + tabela(D.t21);
    $("#sec-visao").innerHTML = h;
  }

  // ---------------- Telas ----------------
  var estTelas = { tela: "dashboard", anot: true };
  function rTelas() {
    var e = estTelas;
    var h = '<h2>Telas</h2><p class="lead">As três versões de cada tela lado a lado. A versão anotada marca os problemas da inspeção; clique na imagem para ampliar.</p><div class="controles"><div class="seg" role="group" aria-label="Tela">' +
      TELAS.map(function (t) { return '<button type="button" data-tela="' + t[0] + '" class="' + (e.tela === t[0] ? "ativo" : "") + '">' + t[1] + "</button>"; }).join("") +
      '</div><div class="seg" role="group" aria-label="Versão"><button type="button" data-anot="1" class="' + (e.anot ? "ativo" : "") + '">Anotada</button><button type="button" data-anot="0" class="' + (!e.anot ? "ativo" : "") + '">Original</button></div></div><div class="grade3">';
    ["A", "B", "C"].forEach(function (c) {
      var src = img(c, e.tela, e.anot);
      var ps = D.problemas.filter(function (p) { return p.cenario === c && p.telas.indexOf(e.tela) >= 0; }).sort(function (a, b) { return b.sev - a.sev; });
      h += '<div class="cartao"><div class="tela-cab"><h3>' + CEN[c].nome + '</h3><a class="mini" href="' + vivo(c, e.tela) + '" target="_blank" rel="noopener">Abrir protótipo</a></div>' +
        '<img class="tela-img" loading="lazy" src="' + src + '" data-zoom="' + src + '" alt="' + NOME_TELA[e.tela] + " - " + CEN[c].nome + '">';
      if (c === "A" && e.anot && e.tela !== "moldura") h += '<p class="aviso">Figura da Parte 1. A marcação E1-03 (dados divergentes) envolve telas sem prompt e fica fora da comparação.</p>';
      if (e.tela === "moldura") h += '<p class="aviso">' + (c === "A" ? "Imagem-base do protótipo original." : "Moldura gerada pelo P0 e reutilizada nas demais telas.") + "</p>";
      if (ps.length) h += '<ul class="prob-mini">' + ps.map(function (p) { return "<li>" + sev(p.sev) + " <b>" + linkProb(p.id) + "</b> " + esc(p.problema) + "</li>"; }).join("") + "</ul>";
      else if (e.tela !== "moldura") h += '<p class="aviso">Nenhum problema registrado nesta tela.</p>';
      h += "</div>";
    });
    $("#sec-telas").innerHTML = h + "</div>";
  }
  $("#sec-telas").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    if (b.dataset.tela) estTelas.tela = b.dataset.tela;
    if (b.dataset.anot) estTelas.anot = b.dataset.anot === "1";
    rTelas();
  });

  // ---------------- Prompts ----------------
  var estP = { p: "P1", modo: "AB", soDif: true, abertos: {} };
  var NOME_P = { P0: "P0 - Frame Master", P1: "P1 - Dashboard", P2: "P2 - Alunos", P3: "P3 - Relatórios" };
  function linha(n, t, cls, extra) { return '<div class="ln ' + (cls || "") + '"><span class="n">' + n + '</span><span class="t">' + (t === "" ? " " : t) + "</span>" + (extra || "") + "</div>"; }
  function rAB(P) {
    var L = P.A, h = "", i = 0, run = 0;
    while (i < L.length) {
      if (!L[i].s) {
        var j = i; while (j < L.length && !L[j].s) j++;
        var key = estP.p + ":" + i, n = j - i;
        if (estP.soDif && n > 4 && !estP.abertos[key]) {
          var ctxA = i === 0 ? 0 : 1, ctxB = j === L.length ? 0 : 1;
          for (var k = i; k < i + ctxA; k++) h += linha(k + 1, esc(L[k].t));
          h += '<button type="button" class="dobra" data-abrir="' + key + '">' + (n - ctxA - ctxB) + " linhas iguais em A e B (mostrar)</button>";
          for (k = j - ctxB; k < j; k++) h += linha(k + 1, esc(L[k].t));
        } else for (k = i; k < j; k++) h += linha(k + 1, esc(L[k].t));
        i = j; run++;
      } else if (L[i].s === "cut") {
        if (L[i].ini) h += '<div class="marca-corte">Retirado em B: ' + esc(L[i].tag) + " " + chipsMod(L[i].tag) + "</div>";
        h += linha(i + 1, esc(L[i].t), "cut"); i++;
      } else {
        h += '<div class="marca-corte" style="background:#f8e6c6;color:#7a4a00">Alterado em B: ' + esc(L[i].tag) + " " + chipsMod(L[i].tag) + "</div>";
        h += linha(i + 1, "<del>" + esc(L[i].t) + "</del>  →  <ins>" + esc(L[i].novo) + "</ins>", "chg"); i++;
      }
    }
    return '<div class="legenda"><span><i style="background:var(--corte-f)"></i>linha retirada em B</span><span><i style="background:var(--troca-f)"></i>linha alterada em B (só o adjetivo visual)</span><span>sem marcação: igual em A e B</span></div><div class="prompt">' + h + "</div>";
  }
  function rAC(P) {
    var a = P.A.map(function (l, i) { return linha(i + 1, esc(l.t)); }).join("");
    var c = P.C.map(function (l, i) { return linha(i + 1, esc(l.t), "", l.tags.length ? '<span class="tags">' + chipsMod(l.tags.join(" ")) + "</span>" : ""); }).join("");
    var falt = '<div class="cartao" style="margin-top:12px"><div class="rot" style="margin-top:0">Especificações de A sem correspondência em C</div><p class="mini">Importantes: ' + chipsMod(SEM_EM_C.imp.join(" ")) + " (M16 mantido em parte: a instrução de reutilizar a tela base)</p><p class=\"mini\">Complementares: " + chipsMod(SEM_EM_C.comp.join(" ")) + '</p><p class="mini">C foi reescrito, por isso a comparação é por especificação, e não linha a linha. As etiquetas ao lado das linhas de C indicam o que cada linha realiza.</p></div>';
    return '<div class="lado"><div><div class="rot">A - Baseline (' + P.A.length + ' linhas)</div><div class="prompt">' + a + '</div></div><div><div class="rot">C - Mínimo (' + P.C.length + ' linhas)</div><div class="prompt">' + c + "</div>" + falt + "</div></div>";
  }
  function rPrompts() {
    var P = D.prompts[estP.p], t = P.tam;
    var h = '<h2>Prompts</h2><p class="lead">Cada cenário tem os mesmos quatro prompts. B foi derivado do Prompt Baseline só por remoção; as linhas retiradas aparecem marcadas com a especificação que realizavam. C foi reescrito, por isso aparece lado a lado com A.</p>' +
      '<div class="controles"><div class="seg" role="group" aria-label="Prompt">' + ["P0", "P1", "P2", "P3"].map(function (p) { return '<button type="button" data-p="' + p + '" class="' + (estP.p === p ? "ativo" : "") + '">' + NOME_P[p] + "</button>"; }).join("") +
      '</div><div class="seg" role="group" aria-label="Comparação"><button type="button" data-modo="AB" class="' + (estP.modo === "AB" ? "ativo" : "") + '">A → B</button><button type="button" data-modo="AC" class="' + (estP.modo === "AC" ? "ativo" : "") + '">A × C</button></div>' +
      (estP.modo === "AB" ? '<label class="ctl"><input type="checkbox" id="soDif"' + (estP.soDif ? " checked" : "") + "> recolher trechos iguais</label>" : "") + "</div>" +
      '<p class="mini">Tamanho de ' + estP.p + ": A " + t.A[0].toLocaleString("pt-BR") + " caracteres (" + t.A[1] + " palavras); B " + t.B[0].toLocaleString("pt-BR") + " (" + t.B[1] + "); C " + t.C[0].toLocaleString("pt-BR") + " (" + t.C[1] + ").</p>";
    h += estP.modo === "AB" ? rAB(P) : rAC(P);
    $("#sec-prompts").innerHTML = h;
  }
  $("#sec-prompts").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    if (b.dataset.p) { estP.p = b.dataset.p; }
    else if (b.dataset.modo) { estP.modo = b.dataset.modo; }
    else if (b.dataset.abrir) { estP.abertos[b.dataset.abrir] = true; }
    else return;
    rPrompts();
  });
  $("#sec-prompts").addEventListener("change", function (ev) { if (ev.target.id === "soDif") { estP.soDif = ev.target.checked; rPrompts(); } });

  // ---------------- Especificações ----------------
  var estE = { plano: "", imp: "", aberto: null };
  var linhasEsp = D.modelos.map(function (m) { return m; }).concat(["R1", "R2", "R3"].map(function (id) {
    var r = D.rastro[id]; return { id: id, nome: r.rotulo.replace(id + " ", ""), plano: "Requisito mínimo", importancia: "Requisito mínimo", finalidade: "Requisito mínimo de segurança e privacidade, mantido nos três cenários (2.2)." };
  }));
  function res(txt) {
    var k = /^Sim/.test(txt) ? "Sim" : /^Parcial/.test(txt) ? "Parcial" : /^Não/.test(txt) ? "Não" : "NV";
    var curto = txt.split(/[:,(]/)[0].trim();
    return '<span class="res-' + k + '" title="' + esc(txt) + '">' + esc(curto) + (curto.length < txt.length ? "*" : "") + "</span>";
  }
  function cortesDe(id) {
    var out = [];
    ["P0", "P1", "P2", "P3"].forEach(function (p) { D.prompts[p].A.forEach(function (l, i) { if ((l.ini || l.s === "chg") && new RegExp("\\b" + id + "\\b").test(l.tag)) out.push([p, i + 1, l.tag, l.s]); }); });
    return out;
  }
  function rEsp() {
    var planos = ["Estratégia", "Escopo", "Estrutura", "Esqueleto", "Superfície", "Requisito mínimo"], imps = ["Essencial", "Importante", "Complementar", "Requisito mínimo"];
    var h = '<h2>Especificações e rastreabilidade</h2><p class="lead">Os 22 modelos e princípios do Prompt Baseline (Tabela 11) e os requisitos mínimos R1 a R3, com o resultado observado em cada cenário (Tabela 15) e os problemas ligados. Clique em uma linha para ver o detalhe.</p>' +
      '<div class="controles"><label class="ctl">Plano de Garrett <select id="fPlano"><option value="">Todos</option>' + planos.map(function (p) { return "<option" + (estE.plano === p ? " selected" : "") + ">" + p + "</option>"; }).join("") + '</select></label>' +
      '<label class="ctl">Importância <select id="fImp"><option value="">Todas</option>' + imps.map(function (p) { return "<option" + (estE.imp === p ? " selected" : "") + ">" + p + "</option>"; }).join("") + "</select></label>" +
      '<span class="mini">* resumo; o texto completo aparece ao passar o mouse e no detalhe. N/V = não verificável.</span></div>' +
      '<div class="tabela-rolagem"><table><thead><tr><th>ID</th><th>Modelo, princípio ou requisito</th><th>Plano</th><th>Importância</th><th>Especificado em</th><th>A</th><th>B</th><th>C</th><th>Problemas</th></tr></thead><tbody>';
    linhasEsp.forEach(function (m) {
      if (estE.plano && m.plano !== estE.plano) return;
      if (estE.imp && m.importancia !== estE.imp) return;
      var r = D.rastro[m.id], ps = D.problemas.filter(function (p) { return p.specs.indexOf(m.id) >= 0; });
      var aberto = estE.aberto === m.id;
      h += '<tr class="clicavel' + (aberto ? " aberta" : "") + '" data-id="' + m.id + '" id="esp-' + m.id + '"><td><b>' + m.id + "</b></td><td>" + esc(m.nome) + "</td><td>" + m.plano + "</td><td>" + m.importancia + "</td><td>" + esc(r.especificado) + "</td><td>" + res(r.A) + "</td><td>" + res(r.B) + "</td><td>" + res(r.C) + "</td><td>" + ps.map(function (p) { return linkProb(p.id); }).join(", ") + "</td></tr>";
      if (aberto) {
        var cs = cortesDe(m.id);
        h += '<tr><td colspan="9" class="det">' +
          (m.finalidade ? "<p><b>Finalidade:</b> " + esc(m.finalidade) + "</p>" : "") +
          (m.depende ? "<p><b>Depende de:</b> " + (m.depende === "-" ? "-" : chipsMod(m.depende)) + " &nbsp; <b>Contribuição esperada:</b> " + esc(m.contribuicao) + "</p>" : "") +
          (m.como ? "<p><b>Como aparece no Prompt Baseline:</b> " + esc(m.como) + "</p><p><b>Justificativa da importância:</b> " + esc(m.justificativa) + "</p>" : "") +
          "<p><b>Resultado em A:</b> " + esc(r.A) + "<br><b>Resultado em B:</b> " + esc(r.B) + "<br><b>Resultado em C:</b> " + esc(r.C) + "</p>" +
          (cs.length ? "<p><b>Trechos retirados ou alterados em B:</b> " + cs.map(function (c) { return '<a href="#prompts/' + c[0] + '">' + c[0] + ", linha " + c[1] + "</a> (" + esc(c[2]) + ")"; }).join("; ") + "</p>" : "") +
          (ps.length ? "<p><b>Problemas ligados:</b></p><ul class=\"lista\">" + ps.map(function (p) { return "<li>" + sev(p.sev) + " " + linkProb(p.id) + " (" + p.cenario + ") " + esc(p.problema) + "</li>"; }).join("") + "</ul>" : "") +
          "</td></tr>";
      }
    });
    h += '</tbody></table></div><p class="mini">Legenda da Tabela 15: Sim = realizado; Parcial = realizado em parte; Não = ausente; N/V = não verificável por inspeção.</p>';
    $("#sec-especificacoes").innerHTML = h;
  }
  $("#sec-especificacoes").addEventListener("change", function (ev) {
    if (ev.target.id === "fPlano") estE.plano = ev.target.value;
    if (ev.target.id === "fImp") estE.imp = ev.target.value;
    rEsp();
  });
  $("#sec-especificacoes").addEventListener("click", function (ev) {
    if (ev.target.closest("a")) return;
    var tr = ev.target.closest("tr.clicavel"); if (!tr) return;
    estE.aberto = estE.aberto === tr.dataset.id ? null : tr.dataset.id; rEsp();
  });

  // ---------------- Problemas ----------------
  var estPr = { c: "", s: "", t: "", o: "" };
  function rProb(foco) {
    var tarefas = ["Priorizar", "Compreender", "Decidir", "Tratar erro", "Acompanhar"];
    var sel = function (id, val, ops) { return '<select id="' + id + '">' + ops.map(function (o) { return '<option value="' + o[0] + '"' + (val === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>"; };
    var h = '<h2>Problemas</h2><p class="lead">Problemas de A no escopo comparado (Tabela 2, sem E1-03) e de B e C (Tabela 17), com a origem no prompt. "Também em" liga o mesmo problema entre cenários.</p><div class="controles">' +
      '<label class="ctl">Cenário ' + sel("fC", estPr.c, [["", "Todos"], ["A", "A - Baseline"], ["B", "B - Intermediário"], ["C", "C - Mínimo"]]) + "</label>" +
      '<label class="ctl">Severidade ' + sel("fS", estPr.s, [["", "Todas"], ["3", "3 - maior"], ["2", "2 - menor"], ["1", "1 - cosmético"]]) + "</label>" +
      '<label class="ctl">Tarefa ' + sel("fT", estPr.t, [["", "Todas"]].concat(tarefas.map(function (t) { return [t, t]; }))) + "</label>" +
      '<label class="ctl">Origem ' + sel("fO", estPr.o, [["", "Todas"]].concat(Object.keys(D.origens).map(function (k) { return [k, D.origens[k]]; }))) + "</label></div>";
    var ps = D.problemas.filter(function (p) {
      return (!estPr.c || p.cenario === estPr.c) && (!estPr.s || p.sev === +estPr.s) && (!estPr.t || p.tarefas.indexOf(estPr.t) >= 0) && (!estPr.o || p.origem === estPr.o);
    }).sort(function (a, b) { return a.cenario < b.cenario ? -1 : a.cenario > b.cenario ? 1 : b.sev - a.sev || (a.id < b.id ? -1 : 1); });
    h += '<p class="mini">' + ps.length + " problema(s).</p><div class=\"probs\">";
    ps.forEach(function (p) {
      var g = GRUPOS.filter(function (g) { return g.indexOf(p.id) >= 0; })[0];
      var outros = g ? g.filter(function (x) { return x !== p.id; }) : [];
      var tela = p.telas[0], src = img(p.cenario, tela, true);
      h += '<article class="prob s' + p.sev + '" id="prob-' + p.id + '"><div><h4>' + sev(p.sev) + " " + p.id + " &middot; " + CEN[p.cenario].nome + " &middot; " + esc(p.tela) + "</h4><p>" + esc(p.problema) + "</p>" +
        '<p class="meta"><b>Heurística ou critério:</b> ' + esc(p.heuristica) + "</p>" +
        '<p class="meta"><b>Consequência:</b> ' + esc(p.consequencia) + "</p>" +
        '<p class="meta"><b>Origem:</b> ' + D.origens[p.origem] + ". " + esc(p.nota) + " " + chipsMod(p.specs.join(" ")) + "</p>" +
        (outros.length ? '<p class="meta"><b>Também em:</b> ' + outros.map(linkProb).join(", ") + "</p>" : '<p class="meta"><b>Só em ' + p.cenario + ".</b></p>") +
        '</div><div><img loading="lazy" src="' + src + '" data-zoom="' + src + '" alt="' + NOME_TELA[tela] + " anotado, " + CEN[p.cenario].nome + '"><p class="aviso">' + esc(p.evidencia) + " &middot; clique para ampliar</p></div></article>";
    });
    $("#sec-problemas").innerHTML = h + "</div>";
    if (foco) { var el = document.getElementById("prob-" + foco); if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("destaque"); } }
  }
  $("#sec-problemas").addEventListener("change", function (ev) {
    var m = { fC: "c", fS: "s", fT: "t", fO: "o" }[ev.target.id]; if (!m) return;
    estPr[m] = ev.target.value; rProb();
  });

  // ---------------- Navegação ----------------
  var feitas = {};
  function ir() {
    var partes = (location.hash || "#visao").slice(1).split("/"), aba = partes[0], arg = partes[1];
    if (!$("#sec-" + aba)) aba = "visao";
    document.querySelectorAll(".secao").forEach(function (s) { s.classList.toggle("ativa", s.id === "sec-" + aba); });
    document.querySelectorAll(".abas a").forEach(function (a) { a.classList.toggle("ativa", a.dataset.aba === aba); });
    if (aba === "visao" && !feitas.visao) { rVisao(); feitas.visao = 1; }
    if (aba === "telas") rTelas();
    if (aba === "prompts") { if (arg && D.prompts[arg]) { estP.p = arg; estP.modo = "AB"; } rPrompts(); }
    if (aba === "especificacoes") {
      if (arg) { estE.aberto = arg; estE.plano = ""; estE.imp = ""; }
      rEsp();
      if (arg) { var tr = document.getElementById("esp-" + arg); if (tr) tr.scrollIntoView({ block: "center" }); }
    }
    if (aba === "problemas") {
      if (arg && /^[ABC]$/.test(arg)) { estPr = { c: arg, s: "", t: "", o: "" }; arg = null; }
      else if (arg) { estPr = { c: "", s: "", t: "", o: "" }; }
      rProb(arg);
    }
    if (!arg) window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", ir);
  ir();
})();
