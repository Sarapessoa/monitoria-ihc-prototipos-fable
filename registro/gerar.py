"""Gera um cenário (INT, MAX ou MIN) com Claude Fable 5.2 pelo claude CLI.

Uso: python gerar.py MAX
Cada cenário é uma conversa nova; P0 a P3 vão em sequência na mesma conversa.
Saída: execucoes/<cenário>/ com moldura.html, dashboard.html, alunos.html,
relatorios.html, as capturas PNG, as respostas completas e o registro.
"""
import datetime
import hashlib
import json
import pathlib
import re
import subprocess
import sys
import uuid

BASE = pathlib.Path(__file__).resolve().parent
PROMPTS = BASE / "prompts"
SISTEMA = (BASE / "sistema_constante.txt").read_text(encoding="utf-8")
MODELO = "claude-fable-5-2"
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
LARGURA, ALTURA = 1672, 941
TELAS = ["moldura", "dashboard", "alunos", "relatorios"]


def chamar(prompt, sessao, primeira, cwd):
    cmd = ["claude", "-p", "--model", MODELO, "--system-prompt", SISTEMA, "--tools", "",
           "--strict-mcp-config", "--setting-sources", "", "--disable-slash-commands",
           "--output-format", "json"]
    cmd += ["--session-id", sessao] if primeira else ["--resume", sessao]
    r = subprocess.run(cmd, input=prompt, capture_output=True, text=True, encoding="utf-8",
                       cwd=cwd, timeout=3600)
    if r.returncode != 0:
        raise RuntimeError(f"claude falhou ({r.returncode}): {r.stderr[:2000]}")
    return json.loads(r.stdout)


def extrair_html(texto):
    m = re.search(r"<!DOCTYPE html>.*</html>", texto, re.S | re.I)
    return m.group(0) if m else None


def capturar(html_path, png_path):
    subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars",
                    f"--window-size={LARGURA},{ALTURA}", f"--screenshot={png_path}",
                    "--force-device-scale-factor=1", "--virtual-time-budget=3000",
                    html_path.as_uri()], capture_output=True, timeout=120)


def main(cenario):
    saida = BASE / "execucoes" / cenario
    saida.mkdir(parents=True, exist_ok=True)
    sessao = str(uuid.uuid4())
    log = {"cenario": cenario, "modelo": MODELO, "sessao": sessao,
           "sistema_sha256": hashlib.sha256(SISTEMA.encode()).hexdigest(), "etapas": []}
    for i, tela in enumerate(TELAS):
        prompt = (PROMPTS / f"{cenario}_P{i}.txt").read_text(encoding="utf-8")
        inicio = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
        resp = chamar(prompt, sessao, i == 0, saida)
        (saida / f"P{i}_resposta.json").write_text(json.dumps(resp, ensure_ascii=False, indent=1), encoding="utf-8")
        html = extrair_html(resp.get("result", ""))
        etapa = {"etapa": f"P{i}", "tela": tela, "inicio": inicio,
                 "prompt_sha256": hashlib.sha256(prompt.encode()).hexdigest(),
                 "modelos_usados": list(resp.get("modelUsage", {}).keys()),
                 "tokens_saida": resp.get("usage", {}).get("output_tokens"),
                 "duracao_ms": resp.get("duration_ms"), "html_encontrado": html is not None,
                 "tentativas": 1}
        if html:
            hp = saida / f"{tela}.html"
            hp.write_text(html, encoding="utf-8")
            capturar(hp, saida / f"{tela}.png")
            etapa["html_sha256"] = hashlib.sha256(html.encode()).hexdigest()
        log["etapas"].append(etapa)
        (saida / "registro.json").write_text(json.dumps(log, ensure_ascii=False, indent=1), encoding="utf-8")
        print(cenario, f"P{i}", "ok" if html else "SEM HTML", flush=True)
    (saida / "index.html").write_text(
        '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">'
        '<meta http-equiv="refresh" content="0; url=dashboard.html"><title>MonitorIA</title></head>'
        '<body><a href="dashboard.html">Abrir o protótipo</a></body></html>', encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1])
