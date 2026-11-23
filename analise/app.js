(function () {
  "use strict";
  var D = window.DADOS;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var fmt = function (n) { return n.toLocaleString("pt-BR"); };

  var CEN = {
    A: { nome: "Baseline", sub: "Prompt original, com as 22 especificações", esp: 22 },
    B: { nome: "Intermediário", sub: "Sem as 6 complementares", esp: 16 },
    C: { nome: "Mínimo", sub: "Só os 7 essenciais", esp: 7 }
  };
  var EST = { ok: ["", "viável", "mk-ok"], parcial: ["", "com restrição", "mk-parcial"], ruim: ["", "comprometida", "mk-ruim"], aus: ["", "ausente", "mk-aus"], na: ["", "não avaliável", "mk-na"] };
  var mk = function (k) { return '<span class="mk ' + EST[k][2] + '" title="' + EST[k][1] + '" aria-label="' + EST[k][1] + '"></span>'; };
  var TAREFAS = [
    ["Priorizar", "ok", "ok", "ok"], ["Compreender", "ok", "ok", "ruim"], ["Decidir", "parcial", "ok", "ok"],
    ["Tratar erro", "ok", "ok", "ruim"], ["Acompanhar", "parcial", "parcial", "ruim"], ["Ajuda", "na", "na", "na"]
  ];
  var MUDOU = [
    ["Resolvido em B e C", ["E1-01", "E1-04", "E1-08"], "Rejeitar no Dashboard, referente da confiança, cor da prioridade"],
    ["Persiste nos três", ["E1-02", "PB-01", "PC-01", "E1-06", "PB-02", "PC-03"], "lista de alunos e autoria dos históricos"],
    ["Novo em B e C", ["PB-05", "PC-04"], "telefone exibido, contra R3"],
    ["Novo em C", ["PC-02"], "sem confiança da IA"]
  ];
  var GRUPOS = [["E1-02", "PB-01", "PC-01"], ["E1-06", "PB-02", "PC-03"], ["E1-07", "PB-03", "PC-05"], ["E1-05", "PB-04"], ["PB-05", "PC-04"]];
  var TELAS = [["moldura", "Frame Master"], ["dashboard", "Dashboard"], ["alunos", "Alunos"], ["relatorios", "Relatórios"]];
  var NOME_TELA = { moldura: "Frame Master", dashboard: "Dashboard", alunos: "Alunos", relatorios: "Relatórios" };
  var ORIG_CURTA = { ausente: "ausente nos três", inconsistente: "inconsistente", incompleta: "incompleta", retirada: "retirada", nao_seguida: "não seguida" };
  var SEM_EM_C = ["M04", "M06", "M08", "M10", "M11", "M12", "M13", "M15", "M17", "M18", "M19", "M20", "M21", "M22"];

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
  var pt = function (s) { return '<span class="pt pt' + s + '" title="Severidade ' + s + '"></span>'; };
  var idl = function (id) { return '<a class="id" href="#problemas/' + id + '">' + id + "</a>"; };
  var specs = function (txt) {
    var ids = String(txt).match(/\b(M\d\d|R[123])\b/g) || [];
    return ids.filter(function (v, i) { return ids.indexOf(v) === i; }).map(function (id) { return '<a class="id" href="#' + (/^M(2[3-9]|3\d|4[0-2])$/.test(id) ? "melhorias" : "especificacoes/" + id) + '">' + id + "</a>"; }).join(" ");
  };
  var seg = function (nome, atual, ops) {
    return '<div class="seg" role="group">' + ops.map(function (o) { return '<button type="button" data-' + nome + '="' + o[0] + '" class="' + (atual === o[0] ? "ativo" : "") + '">' + o[1] + "</button>"; }).join("") + "</div>";
  };
  var sel = function (id, val, ops) { return '<select id="' + id + '" aria-label="' + ops[0][1] + '">' + ops.map(function (o) { return '<option value="' + o[0] + '"' + (val === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select>"; };
  function tabela(rows, primeiraNegrito) {
    return '<div class="tab"><table><thead><tr>' + rows[0].map(function (c) { return "<th>" + esc(c) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      rows.slice(1).map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td" + (i === 0 && primeiraNegrito ? ' style="font-weight:500"' : "") + ">" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  function resSim(txt) {
    var k = /^Sim/.test(txt) ? "ok" : /^Parcial/.test(txt) ? "parcial" : /^Não/.test(txt) ? "ruim" : "na";
    if (k === "ruim") k = "aus";
    return '<span class="mk ' + EST[k][2] + '" title="' + esc(txt) + '" aria-label="' + EST[k][1] + '"></span>';
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-zoom]");
    if (t) { var z = $("#zoom"); $("img", z).src = t.getAttribute("data-zoom"); z.hidden = false; $(".zoom-fechar", z).focus(); return; }
    if (e.target.closest("#zoom")) $("#zoom").hidden = true;
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") $("#zoom").hidden = true; });

  // ---------- Visão geral ----------
  function tamTotal(c) { return ["P0", "P1", "P2", "P3"].reduce(function (s, p) { return s + D.prompts[p].tam[c][1]; }, 0); }
  function rVisao() {
    var h = '<div class="cab"><h2>Três prompts, três protótipos</h2><span class="rot">Frame Master · Dashboard · Alunos · Relatórios</span></div><div class="grade g3">';
    ["A", "B", "C"].forEach(function (c) {
      var ps = D.problemas.filter(function (p) { return p.cenario === c; });
      var sv = [3, 2, 1].map(function (s) { var n = ps.filter(function (p) { return p.sev === s; }).length; return n ? "<span>" + pt(s) + n + "</span>" : ""; }).join("");
      h += '<div class="cel"><span class="rot">' + c + '</span><div class="cen-nome">' + CEN[c].nome + '</div><p class="cen-sub">' + CEN[c].sub + "</p>" +
        '<div class="metricas"><div><b>' + CEN[c].esp + "</b><span>especificações</span></div><div><b>" + fmt(tamTotal(c)) + "</b><span>palavras no prompt</span></div><div><b>" + ps.length + '</b><span>problemas</span></div></div><div class="sevs">' + sv + "</div></div>";
    });
    h += "</div>";
    h += '<div class="bloco"><span class="rot">Tarefas</span><div class="tab"><table><thead><tr><th>Tarefa</th><th class="c">A</th><th class="c">B</th><th class="c">C</th></tr></thead><tbody>' +
      TAREFAS.map(function (t) { return "<tr><td>" + t[0] + "</td>" + [1, 2, 3].map(function (i) { var e = EST[t[i]]; return '<td class="c">' + mk(t[i]) + "</td>"; }).join("") + "</tr>"; }).join("") +
      '</tbody></table></div><div class="legenda">' + ["ok", "parcial", "ruim", "na"].map(function (k) { return mk(k) + " " + EST[k][1]; }).join(" &nbsp; ") + "</div></div>";
    h += '<div class="bloco"><span class="rot">O que mudou em relação a A</span><div class="lista">' +
      MUDOU.map(function (m) { return '<div class="mud"><div>' + m[0] + "</div><div>" + esc(m[2]) + " &nbsp; " + m[1].map(idl).join(" ") + "</div></div>"; }).join("") + "</div></div>";
    h += '<div class="bloco"><span class="rot">Tabelas do relatório</span>' +
      [["Tabela 19 · Matriz de resultados", D.t19], ["Tabela 18 · Síntese da UX", D.t18], ["Tabela 20 · Explicitação por plano de Garrett", D.t20], ["Tabela 21 · Conjunto mínimo", D.t21]]
        .map(function (t) { return '<details class="tab-d"><summary>' + t[0] + "</summary>" + tabela(t[1], true) + "</details>"; }).join("") + "</div>";
    $("#sec-visao").innerHTML = h;
  }

  // ---------- Telas ----------
  var eT = { tela: "dashboard", anot: "1" };
  function rTelas() {
    var h = '<div class="cab"><h2>Telas</h2></div><div class="barra">' + seg("tela", eT.tela, TELAS) + seg("anot", eT.anot, [["1", "Anotada"], ["0", "Original"]]) + '</div><div class="grade g3">';
    ["A", "B", "C"].forEach(function (c) {
      var src = img(c, eT.tela, eT.anot === "1");
      var ps = D.problemas.filter(function (p) { return p.cenario === c && p.telas.indexOf(eT.tela) >= 0; }).sort(function (a, b) { return b.sev - a.sev; });
      h += '<div><div class="tela-cab"><span><span class="rot">' + c + "</span> &nbsp;<b>" + CEN[c].nome + '</b></span><a href="' + vivo(c, eT.tela) + '" target="_blank" rel="noopener">Abrir ↗</a></div>' +
        '<img class="tela-img" loading="lazy" src="' + src + '" data-zoom="' + src + '" alt="' + NOME_TELA[eT.tela] + ", " + CEN[c].nome + '">' +
        (ps.length ? '<ul class="lp">' + ps.map(function (p) { return '<li><a href="#problemas/' + p.id + '">' + pt(p.sev) + '<span class="mono">' + p.id + "</span>" + esc(p.curto) + "</a></li>"; }).join("") + "</ul>"
          : '<p class="vazio">' + (eT.tela === "moldura" ? "Moldura reutilizada nas demais telas" : "Sem problemas registrados") + "</p>") + "</div>";
    });
    $("#sec-telas").innerHTML = h + "</div>";
  }
  $("#sec-telas").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    if (b.dataset.tela) eT.tela = b.dataset.tela;
    if (b.dataset.anot) eT.anot = b.dataset.anot;
    rTelas();
  });

  // ---------- Prompts (diff) ----------
  var NOME_P = { P0: "Frame Master", P1: "Dashboard", P2: "Alunos", P3: "Relatórios" };
  var eP = { p: "P1", modo: "AB", abertos: {} }, eM = { p: "P1", abertos: {} };
  function ln(n, m, t, cls, tg) { return '<div class="ln ' + (cls || "") + '"><span class="n">' + n + '</span><span class="m">' + m + '</span><span class="t">' + (t === "" ? " " : t) + '</span><span class="tg">' + (tg || "") + "</span></div>"; }
  function dobrar(L, igual, chave, abertos, render) {
    // agrupa linhas iguais longas em um botão; render(i) devolve o HTML da linha i
    var h = "", i = 0;
    while (i < L.length) {
      if (igual(L[i])) {
        var j = i; while (j < L.length && igual(L[j])) j++;
        var k = chave + ":" + i;
        if (j - i > 4 && !abertos[k]) {
          var a = i === 0 ? 0 : 1, b = j === L.length ? 0 : 1;
          for (var x = i; x < i + a; x++) h += render(x);
          h += '<button type="button" class="dobra" data-abrir="' + k + '">··· ' + (j - i - a - b) + " linhas iguais</button>";
          for (x = j - b; x < j; x++) h += render(x);
        } else for (x = i; x < j; x++) h += render(x);
        i = j;
      } else { h += render(i); i++; }
    }
    return h;
  }
  function rAB(P) {
    var L = P.A;
    return '<div class="cod">' + dobrar(L, function (l) { return !l.s; }, eP.p, eP.abertos, function (i) {
      var l = L[i];
      if (!l.s) return ln(i + 1, "", esc(l.t));
      if (l.s === "cut") return ln(i + 1, "−", esc(l.t), "rem", l.ini ? specs(l.tag) + ' <span class="rot">' + esc(l.tag.replace(/M\d\d\s*/g, "").replace(/^;\s*/, "")) + "</span>" : "");
      return ln(i + 1, "~", esc(l.t) + "  →  " + esc(l.novo), "tro", specs(l.tag));
    }) + "</div>";
  }
  function rAC(P) {
    return '<div class="lado"><div><div class="sub-cab"><span class="rot">A · Baseline</span><span class="conta">' + P.tam.A[1] + ' palavras</span></div><div class="cod">' +
      P.A.map(function (l, i) { return ln(i + 1, "", esc(l.t)); }).join("") + '</div></div><div><div class="sub-cab"><span class="rot">C · Mínimo</span><span class="conta">' + P.tam.C[1] + ' palavras</span></div><div class="cod">' +
      P.C.map(function (l, i) { return ln(i + 1, "", esc(l.t), "", specs(l.tags.join(" "))); }).join("") +
      '</div><div class="nota"><span class="rot">Sem correspondência em C</span><br>' + specs(SEM_EM_C.join(" ")) + "</div></div></div>";
  }
  function trilhoP(estado, conta) {
    return '<div class="pr-lista">' + ["P0", "P1", "P2", "P3"].map(function (p) {
      return '<button type="button" data-p="' + p + '" class="' + (estado.p === p ? "ativo" : "") + '"><span><span class="mono">' + p + "</span> " + NOME_P[p] + '</span><span class="mono">' + conta(p) + "</span></button>";
    }).join("") + "</div>";
  }
  function rPrompts() {
    var P = D.prompts[eP.p];
    var conta = function (p) {
      if (eP.modo === "AB") return "−" + D.prompts[p].A.filter(function (l) { return l.s === "cut" && l.t.trim(); }).length;
      return D.prompts[p].tam.C[1] + "p";
    };
    var h = '<div class="cab"><h2>Prompts</h2></div><div class="barra">' + seg("modo", eP.modo, [["AB", "A → B"], ["AC", "A × C"]]) +
      '<span class="conta fim">' + (eP.modo === "AB" ? "− retirada em B &nbsp; ~ alterada" : "etiquetas: o que cada linha de C realiza") + "</span></div>" +
      '<div class="pr">' + trilhoP(eP, conta) + "<div>" + (eP.modo === "AB" ? rAB(P) : rAC(P)) + "</div></div>";
    $("#sec-prompts").innerHTML = h;
  }
  $("#sec-prompts").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    if (b.dataset.p) eP.p = b.dataset.p; else if (b.dataset.modo) eP.modo = b.dataset.modo; else if (b.dataset.abrir) eP.abertos[b.dataset.abrir] = 1; else return;
    rPrompts();
  });

  // ---------- Especificações ----------
  var eE = { plano: "", imp: "", aberto: null };
  var linhasEsp = D.modelos.concat(["R1", "R2", "R3"].map(function (id) {
    return { id: id, nome: D.rastro[id].rotulo.replace(id + " ", ""), plano: "Requisito mínimo", importancia: "Requisito mínimo" };
  }));
  function cortesDe(id) {
    var out = [];
    ["P0", "P1", "P2", "P3"].forEach(function (p) { D.prompts[p].A.forEach(function (l, i) { if ((l.ini || l.s === "chg") && new RegExp("\\b" + id + "\\b").test(l.tag)) out.push('<a class="id" href="#prompts/' + p + '">' + p + ":" + (i + 1) + "</a>"); }); });
    return out;
  }
  function rEsp() {
    var planos = ["Estratégia", "Escopo", "Estrutura", "Esqueleto", "Superfície", "Requisito mínimo"], imps = ["Essencial", "Importante", "Complementar", "Requisito mínimo"];
    var vis = linhasEsp.filter(function (m) { return (!eE.plano || m.plano === eE.plano) && (!eE.imp || m.importancia === eE.imp); });
    var h = '<div class="cab"><h2>Especificações</h2></div><div class="barra">' +
      sel("fPlano", eE.plano, [["", "Plano de Garrett"]].concat(planos.map(function (p) { return [p, p]; }))) +
      sel("fImp", eE.imp, [["", "Importância"]].concat(imps.map(function (p) { return [p, p]; }))) +
      '<span class="conta fim">' + vis.length + ' itens</span></div><div class="tab"><table><thead><tr><th>ID</th><th>Modelo</th><th>Plano</th><th>Importância</th><th class="c">A</th><th class="c">B</th><th class="c">C</th><th>Problemas</th></tr></thead><tbody>';
    vis.forEach(function (m) {
      var r = D.rastro[m.id], ps = D.problemas.filter(function (p) { return p.specs.indexOf(m.id) >= 0; }), ab = eE.aberto === m.id;
      h += '<tr class="lin' + (ab ? " aberta" : "") + '" data-id="' + m.id + '" id="esp-' + m.id + '"><td class="mono">' + m.id + "</td><td>" + esc(m.nome) + "</td><td>" + m.plano + '</td><td style="color:var(--apoio)">' + m.importancia +
        '</td><td class="c">' + resSim(r.A) + '</td><td class="c">' + resSim(r.B) + '</td><td class="c">' + resSim(r.C) + "</td><td>" + ps.map(function (p) { return idl(p.id); }).join(" ") + "</td></tr>";
      if (ab) {
        var cs = cortesDe(m.id), g = [];
        if (m.finalidade) g.push(["Finalidade", esc(m.finalidade)]);
        if (m.como) g.push(["No Prompt Baseline", esc(m.como)]);
        if (m.depende && m.depende !== "-") g.push(["Depende de", specs(m.depende)]);
        g.push(["Resultado A", esc(r.A)], ["Resultado B", esc(r.B)], ["Resultado C", esc(r.C)]);
        if (cs.length) g.push(["Retirado em B", cs.join(" ")]);
        if (ps.length) g.push(["Problemas", ps.map(function (p) { return pt(p.sev) + idl(p.id) + " " + esc(p.curto); }).join("<br>")]);
        h += '<tr><td colspan="8" class="det"><div class="det-g">' + g.map(function (x) { return "<div>" + x[0] + "</div><div>" + x[1] + "</div>"; }).join("") + "</div></td></tr>";
      }
    });
    h += '</tbody></table></div><div class="legenda">' + mk("ok") + " realizado &nbsp; " + mk("parcial") + " em parte &nbsp; " + mk("aus") + " ausente &nbsp; " + mk("na") + " não verificável</div>";
    $("#sec-especificacoes").innerHTML = h;
  }
  $("#sec-especificacoes").addEventListener("change", function (ev) { if (ev.target.id === "fPlano") eE.plano = ev.target.value; if (ev.target.id === "fImp") eE.imp = ev.target.value; rEsp(); });
  $("#sec-especificacoes").addEventListener("click", function (ev) {
    if (ev.target.closest("a")) return;
    var tr = ev.target.closest("tr.lin"); if (!tr) return;
    eE.aberto = eE.aberto === tr.dataset.id ? null : tr.dataset.id; rEsp();
  });

  // ---------- Problemas ----------
  var ePr = { c: "", s: "", t: "", o: "", abertos: {} };
  function rProb(foco) {
    if (foco) ePr.abertos[foco] = 1;
    var ps = D.problemas.filter(function (p) {
      return (!ePr.c || p.cenario === ePr.c) && (!ePr.s || p.sev === +ePr.s) && (!ePr.t || p.tarefas.indexOf(ePr.t) >= 0) && (!ePr.o || p.origem === ePr.o);
    }).sort(function (a, b) { return a.cenario < b.cenario ? -1 : a.cenario > b.cenario ? 1 : b.sev - a.sev || (a.id < b.id ? -1 : 1); });
    var h = '<div class="cab"><h2>Problemas</h2></div><div class="barra">' + seg("cen", ePr.c, [["", "Todos"], ["A", "A"], ["B", "B"], ["C", "C"]]) +
      sel("fS", ePr.s, [["", "Severidade"], ["3", "3 · maior"], ["2", "2 · menor"], ["1", "1 · cosmético"]]) +
      sel("fT", ePr.t, [["", "Tarefa"]].concat(["Priorizar", "Compreender", "Decidir", "Tratar erro", "Acompanhar"].map(function (t) { return [t, t]; }))) +
      sel("fO", ePr.o, [["", "Origem no prompt"]].concat(Object.keys(ORIG_CURTA).map(function (k) { return [k, "Especificação " + ORIG_CURTA[k]]; }))) +
      '<span class="conta fim">' + ps.length + '</span></div><div class="lista">';
    ps.forEach(function (p) {
      var ab = !!ePr.abertos[p.id], g = GRUPOS.filter(function (x) { return x.indexOf(p.id) >= 0; })[0];
      var outros = g ? g.filter(function (x) { return x !== p.id; }) : [];
      var src = img(p.cenario, p.telas[0], true);
      h += '<div class="it' + (ab ? " aberto" : "") + '" id="prob-' + p.id + '"><button type="button" data-it="' + p.id + '" aria-expanded="' + ab + '">' +
        '<span class="sv">' + pt(p.sev) + "</span><span class=\"mono\">" + p.id + "</span><span>" + esc(p.curto) + '</span><span class="meta">' + p.cenario + " · " + esc(p.telas.map(function (t) { return NOME_TELA[t]; }).join(", ")) + " · " + ORIG_CURTA[p.origem] + '</span><span class="chev">›</span></button>';
      if (ab) {
        h += '<div class="it-det"><div><p>' + esc(p.problema) + '</p><div class="det-g">' +
          "<div>Critério</div><div>" + esc(p.heuristica) + "</div>" +
          "<div>Consequência</div><div>" + esc(p.consequencia) + "</div>" +
          "<div>Origem</div><div>" + esc(p.nota) + (p.specs.length ? " " + specs(p.specs.join(" ")) : "") + "</div>" +
          "<div>Severidade</div><div>" + p.sev + "</div>" +
          (outros.length ? "<div>Também em</div><div>" + outros.map(idl).join(" ") + "</div>" : "") +
          '</div></div><div><img loading="lazy" src="' + src + '" data-zoom="' + src + '" alt="' + NOME_TELA[p.telas[0]] + " anotado, " + p.cenario + '"><div class="legenda">' + esc(p.evidencia) + "</div></div></div>";
      }
      h += "</div>";
    });
    $("#sec-problemas").innerHTML = h + "</div>";
    if (foco) { var el = document.getElementById("prob-" + foco); if (el) { el.scrollIntoView({ block: "start" }); el.classList.add("destaque"); } }
  }
  $("#sec-problemas").addEventListener("change", function (ev) { var m = { fS: "s", fT: "t", fO: "o" }[ev.target.id]; if (m) { ePr[m] = ev.target.value; rProb(); } });
  $("#sec-problemas").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    if (b.dataset.cen !== undefined) ePr.c = b.dataset.cen;
    else if (b.dataset.it) { var id = b.dataset.it; if (ePr.abertos[id]) delete ePr.abertos[id]; else ePr.abertos[id] = 1; }
    else return;
    rProb();
  });

  // ---------- Melhorias (Máximo) ----------
  function rMelh() {
    var P = D.prompts[eM.p], L = P.MAX;
    var h = '<div class="cab"><h2>Melhorias propostas</h2><span class="rot">Máximo · fora da comparação</span></div><div class="grade g3">' +
      ["dashboard", "alunos", "relatorios"].map(function (t) {
        var src = "../maximo/" + t + ".png";
        return '<div><div class="tela-cab"><b>' + NOME_TELA[t] + '</b><a href="../maximo/' + t + '.html" target="_blank" rel="noopener">Abrir ↗</a></div><img class="tela-img" style="border-bottom:0" loading="lazy" src="' + src + '" data-zoom="' + src + '" alt="' + NOME_TELA[t] + ', Máximo"></div>';
      }).join("") + "</div>";
    h += '<div class="bloco"><span class="rot">Especificações acrescentadas · resultado</span><div class="tab"><table><thead><tr><th>ID</th><th>Especificação</th><th>Origem</th><th>Resultado</th></tr></thead><tbody>' +
      D.melhorias.map(function (m) { return '<tr id="melh-' + m.id + '"><td class="mono">' + m.id + "</td><td>" + esc(m.espec) + '</td><td style="color:var(--apoio)">' + esc(m.origem) + '</td><td>' + resSim(m.resultado) + ' <span style="color:var(--apoio)">' + esc(m.resultado.replace(/^(Sim|Parcial|N\/V)(:\s*|,\s*)?/, "")) + "</span></td></tr>"; }).join("") +
      '</tbody></table></div></div>';
    var conta = function (p) { return "+" + D.prompts[p].MAX.filter(function (l) { return l.s === "add"; }).length; };
    h += '<div class="bloco"><div class="barra" style="margin-bottom:8px"><span class="rot">Prompt · A → Máximo</span><span class="conta fim">+ acrescentada &nbsp; ~ símbolo trocado por descrição</span></div><div class="pr">' + trilhoP(eM, conta) + '<div class="cod">' +
      dobrar(L, function (l) { return l.s === "eq"; }, "M" + eM.p, eM.abertos, function (i) {
        var l = L[i];
        if (l.s === "eq") return ln("", "", esc(l.t));
        if (l.s === "del") return ln("", "−", esc(l.t), "rem");
        if (l.s === "chg") return ln("", "~", esc(l.t), "tro");
        return ln("", "+", esc(l.t), "add", specs((l.ms || []).join(" ")));
      }) + "</div></div></div>";
    $("#sec-melhorias").innerHTML = h;
  }
  $("#sec-melhorias").addEventListener("click", function (ev) {
    var b = ev.target.closest("button"); if (!b) return;
    if (b.dataset.p) eM.p = b.dataset.p; else if (b.dataset.abrir) eM.abertos[b.dataset.abrir] = 1; else return;
    rMelh();
  });

  // ---------- Navegação ----------
  var feito = {};
  function ir() {
    var partes = (location.hash || "#visao").slice(1).split("/"), aba = partes[0], arg = partes[1];
    if (!$("#sec-" + aba)) aba = "visao";
    document.querySelectorAll(".secao").forEach(function (s) { s.classList.toggle("ativa", s.id === "sec-" + aba); });
    document.querySelectorAll(".abas a").forEach(function (a) { a.classList.toggle("ativa", a.dataset.aba === aba); });
    if (aba === "visao" && !feito.visao) { rVisao(); feito.visao = 1; }
    if (aba === "telas") rTelas();
    if (aba === "prompts") { if (arg && D.prompts[arg]) { eP.p = arg; eP.modo = "AB"; } rPrompts(); }
    if (aba === "especificacoes") { if (arg) { eE = { plano: "", imp: "", aberto: arg }; } rEsp(); if (arg) { var tr = document.getElementById("esp-" + arg); if (tr) tr.scrollIntoView({ block: "start" }); } }
    if (aba === "problemas") { if (arg) { ePr = { c: "", s: "", t: "", o: "", abertos: {} }; } rProb(arg); }
    if (aba === "melhorias") rMelh();
    if (!arg) window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", ir);
  ir();
})();
