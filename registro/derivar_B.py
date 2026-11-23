"""Deriva os prompts do cenário B - Intermediário a partir do Prompt Baseline (cenário A).

Regra do enunciado (Etapa 2.2): manter as especificações essenciais e importantes e retirar as
complementares da Tabela 11 (M12, M13, M18, M19, M20, M21). Nada é acrescentado: só há remoção de
linhas e, em quatro linhas, a remoção de um adjetivo visual. Cada corte confere o texto esperado
antes de remover, para que a derivação falhe se o prompt de origem mudar.

Origem: prompts/baseline_P0..P3.txt, transcrição do texto do Prompt Baseline
(materiais-drive/V2_Prompts_e_anexos.txt). Conferido em 2026-11-23: todas as linhas desses arquivos
existem na fonte, sem alteração. O cenário A da comparação é o Prompt Baseline com as imagens do
protótipo original (revisao/fontes/baseline-e72ce2b), por orientação da professora.
Saída: prompts/B_P0..P3.txt e prompts/B_cortes.md (registro de cada corte).
Uso: python derivar_B.py
"""
import pathlib

BASE = pathlib.Path(__file__).resolve().parent / "prompts"

# (primeira linha, última linha, início esperado da primeira linha, modelo retirado)
CORTES = {
    "P0": [
        (20, 46, "IDENTIDADE VISUAL FIXA DA MARCA", "M20 marca; M21 estilo"),
        (55, 60, "Cor:", "M19 cor do menu; M21 estilo"),
        (76, 81, "Cada item deve possuir:", "M19 ícones e texto do menu"),
        (82, 85, "O item selecionado deve usar:", "M19 cor do item selecionado"),
        (86, 88, "Adicionar detalhe tecnológico", "M21 ornamento do rodapé"),
        (130, 133, "- fundo branco predominante;", "M19 aparência do container"),
        (143, 148, "Adicionar apenas detalhes visuais", "M21 ornamentos da área central"),
        (150, 179, "DESIGN SYSTEM", "M19 design system; M21 referências de estilo"),
    ],
    "P1": [
        (100, 107, "Características dos cards:", "M19 aparência dos cards"),
        (180, 185, "Botão principal:", "M18 hierarquia de botões"),
        (191, 198, "FEEDBACK HUMANO PARA IA:", "M13 feedback e aprendizado"),
        (204, 207, "G3:", "M12 momento e relevância (G3, G4)"),
        (216, 226, "ESTILO VISUAL DO CONTEÚDO:", "M19 design system; M21 estilo"),
    ],
    "P2": [
        (62, 65, "Usar cards brancos arredondados,", "M19 aparência dos cards"),
        (110, 111, "Usar: Prioridade ALTA com destaque laranja.", "M19 cor da prioridade"),
        (186, 192, "Botão principal:", "M18 hierarquia de botões"),
        (223, 236, "ESTILO VISUAL:", "M19 design system; M21 estilo"),
    ],
    "P3": [
        (80, 81, "Usar destaque em laranja #FF7A00.", "M19 cor da aba ativa"),
        (102, 109, "Características:", "M19 aparência dos cards; M21 estilo"),
        (179, 189, "FEEDBACK GRANULAR DO MONITOR:", "M13 feedback granular (G15); M18 botões"),
        (190, 195, "NOTIFICAÇÃO DE MUDANÇA:", "M13 notificar mudanças (G18)"),
        (202, 208, "G13 – Learn from user behavior", "M13 aprender e adaptar (G13, G14, G15)"),
        (212, 213, "G18 – Notify users about changes", "M13 notificar mudanças (G18)"),
        (215, 230, "ESTILO VISUAL:", "M19 design system; M21 estilo"),
    ],
}

# (linha, texto esperado, texto novo, modelo retirado): remoção de um adjetivo visual
TROCAS = {
    "P0": [
        (93, "Criar barra superior branca.", "Criar barra superior.", "M19 cor do cabeçalho"),
        (102, "ícones lineares:", "ícones:", "M19 estilo dos ícones"),
        (125, "Criar um grande container branco.", "Criar um grande container.", "M19 cor do container"),
    ],
    "P2": [],
}


def main():
    registro = ["# Cortes do cenário B - Intermediário", "",
                "Gerado por `derivar_B.py` a partir do texto do Prompt Baseline (`baseline_P0..P3.txt`).",
                "Números de linha referentes ao arquivo de origem.", ""]
    for p, cortes in CORTES.items():
        linhas = (BASE / f"baseline_{p}.txt").read_text(encoding="utf-8").split("\n")
        remover = set()
        registro.append(f"## {p}")
        registro.append("")
        for ini, fim, esperado, modelo in cortes:
            assert linhas[ini - 1].strip().startswith(esperado), (p, ini, linhas[ini - 1])
            trecho = " / ".join(l.strip() for l in linhas[ini - 1:fim] if l.strip())
            registro.append(f"- Linhas {ini}-{fim} ({modelo}): {trecho}")
            remover.update(range(ini - 1, fim))
        for n, esperado, novo, modelo in TROCAS.get(p, []):
            assert linhas[n - 1].strip() == esperado, (p, n, linhas[n - 1])
            registro.append(f"- Linha {n} ({modelo}): \"{esperado}\" passa a \"{novo}\"")
            linhas[n - 1] = novo
        registro.append("")
        saida = [l for i, l in enumerate(linhas) if i not in remover]
        texto = "\n".join(saida)
        while "\n\n\n\n" in texto:
            texto = texto.replace("\n\n\n\n", "\n\n\n")
        (BASE / f"B_{p}.txt").write_text(texto, encoding="utf-8")
    (BASE / "B_cortes.md").write_text("\n".join(registro), encoding="utf-8")
    print("ok")


if __name__ == "__main__":
    main()
