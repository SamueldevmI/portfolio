"""Gera arquivos de teste: um .wav simples e um .mp3 'falso' (etiqueta ID3v2.3 com título, artista e capa + áudio wav dentro)."""
import base64
import io
import math
import os
import struct
import wave

AQUI = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saida")
os.makedirs(AQUI, exist_ok=True)


def wav_bytes(seg=3, freq=440, taxa=22050):
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(taxa)
        frames = b"".join(struct.pack("<h", int(9000 * math.sin(2 * math.pi * freq * i / taxa))) for i in range(seg * taxa))
        w.writeframes(frames)
    return buf.getvalue()


def sync(n):
    return bytes([(n >> 21) & 0x7F, (n >> 14) & 0x7F, (n >> 7) & 0x7F, n & 0x7F])


def quadro(id_, corpo):
    return id_.encode() + struct.pack(">I", len(corpo)) + b"\x00\x00" + corpo


PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
)

titulo = "Título Real ção".encode("utf-8")
artista = "Artista Real".encode("utf-8")
apic = b"\x03" + b"image/png\x00" + b"\x03" + b"capa\x00" + PNG
frames = quadro("TIT2", b"\x03" + titulo) + quadro("TPE1", b"\x03" + artista) + quadro("APIC", apic)
id3 = b"ID3\x03\x00\x00" + sync(len(frames)) + frames

audio = wav_bytes(3, 440)
with open(os.path.join(AQUI, "Fulano - Tom de 440.wav"), "wb") as f:
    f.write(wav_bytes(3, 440))
with open(os.path.join(AQUI, "com-etiqueta.mp3"), "wb") as f:
    f.write(id3 + audio)
print("ok")
