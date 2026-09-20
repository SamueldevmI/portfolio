"""Gera os ícones do app (icons/*.png e favicon.svg): um disco de vinil âmbar num fundo escuro.

Uso:  python gerar-icones.py
"""
import os
from PIL import Image, ImageDraw

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, "icons")
os.makedirs(SAIDA, exist_ok=True)

FUNDO1 = (33, 28, 24)
FUNDO2 = (16, 14, 12)
AMBAR = (255, 181, 46)
CORAL = (255, 77, 109)
TINTA = (28, 15, 6)
CREME = (255, 207, 138)
SUPER = 4  # desenha 4x maior e reduz, pra bordas lisas


def degrade(t, c1, c2):
    """Degradê diagonal, calculado pequeno e esticado."""
    n = 256
    pequeno = Image.new("RGB", (n, n))
    px = pequeno.load()
    for y in range(n):
        for x in range(n):
            k = (x + y) / (2 * (n - 1))
            px[x, y] = tuple(round(c1[i] + (c2[i] - c1[i]) * k) for i in range(3))
    return pequeno.resize((t, t), Image.BICUBIC)


def icone(t, raio_rel, arredondado):
    g = t * SUPER
    img = degrade(g, FUNDO1, FUNDO2).convert("RGBA")
    cx = cy = g / 2
    r = g * raio_rel

    # o disco: degradê âmbar -> coral dentro de um círculo
    disco = degrade(g, AMBAR, CORAL).convert("RGBA")
    mascara = Image.new("L", (g, g), 0)
    ImageDraw.Draw(mascara).ellipse([cx - r, cy - r, cx + r, cy + r], fill=255)
    img.paste(disco, (0, 0), mascara)

    d = ImageDraw.Draw(img, "RGBA")
    # sulcos
    for k in range(4):
        rr = r * (0.93 - 0.11 * k)
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=TINTA + (70,), width=max(1, int(g * 0.004)))
    # etiqueta central e furo
    rl = r * 0.36
    d.ellipse([cx - rl, cy - rl, cx + rl, cy + rl], fill=TINTA + (240,))
    rm = r * 0.27
    d.ellipse([cx - rm, cy - rm, cx + rm, cy + rm], outline=CREME + (150,), width=max(1, int(g * 0.006)))
    rf = r * 0.075
    d.ellipse([cx - rf, cy - rf, cx + rf, cy + rf], fill=CREME + (255,))
    # brilho no canto do disco
    ra = r * 0.85
    d.arc([cx - ra, cy - ra, cx + ra, cy + ra], start=205, end=250, fill=(255, 255, 255, 140), width=int(g * 0.016))

    if arredondado:
        cantos = Image.new("L", (g, g), 0)
        ImageDraw.Draw(cantos).rounded_rectangle([0, 0, g - 1, g - 1], radius=int(g * 0.22), fill=255)
        img.putalpha(cantos)
    return img.resize((t, t), Image.LANCZOS)


def salvar(img, nome):
    img.save(os.path.join(SAIDA, nome), optimize=True)
    print("ok", nome)


salvar(icone(192, 0.36, True), "icon-192.png")
salvar(icone(512, 0.36, True), "icon-512.png")
salvar(icone(512, 0.28, False), "icon-maskable-512.png")  # cabe na zona segura do Android
salvar(icone(180, 0.34, False).convert("RGB"), "apple-touch-icon.png")

with open(os.path.join(SAIDA, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#ffb52e"/><stop offset="1" stop-color="#ff4d6d"/></linearGradient></defs>'
        '<rect width="64" height="64" rx="14" fill="#1a1714"/>'
        '<circle cx="32" cy="32" r="23" fill="url(#g)"/>'
        '<circle cx="32" cy="32" r="17" fill="none" stroke="#1c0f06" stroke-opacity=".3"/>'
        '<circle cx="32" cy="32" r="8.5" fill="#1c0f06"/><circle cx="32" cy="32" r="2.4" fill="#ffcf8a"/>'
        '<path d="M14.5 26a19 19 0 0 1 11-10.5" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>'
        "</svg>"
    )
print("ok favicon.svg")
