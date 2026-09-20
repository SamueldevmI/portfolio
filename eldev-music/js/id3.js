// Lê título, artista e capa que vêm dentro de um MP3 (etiqueta ID3v2).
// Se algo der errado devolve {} e o app usa o nome do arquivo.

const sync = (b, i) => ((b[i] & 0x7f) << 21) | ((b[i + 1] & 0x7f) << 14) | ((b[i + 2] & 0x7f) << 7) | (b[i + 3] & 0x7f);
const be32 = (b, i) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;

function texto(bytes, cod) {
  let b = bytes;
  let enc = ['iso-8859-1', 'utf-16le', 'utf-16be', 'utf-8'][cod] || 'iso-8859-1';
  if (cod === 1 && b.length >= 2) {
    if (b[0] === 0xfe && b[1] === 0xff) { enc = 'utf-16be'; b = b.subarray(2); }
    else if (b[0] === 0xff && b[1] === 0xfe) b = b.subarray(2);
  }
  return new TextDecoder(enc).decode(b).replace(/\0/g, '').trim();
}

function imagem(q, v2) {
  const cod = q[0];
  let p = 1;
  let mime;
  if (v2) {
    mime = `image/${String.fromCharCode(q[1], q[2], q[3]).toLowerCase().replace('jpg', 'jpeg')}`;
    p = 4;
  } else {
    let f = p;
    while (f < q.length && q[f] !== 0) f++;
    mime = String.fromCharCode(...q.subarray(p, f)) || 'image/jpeg';
    p = f + 1;
  }
  p += 1; // tipo da imagem (capa frontal, contracapa...)
  // a descrição termina com um byte zero (ou dois, em utf-16)
  if (cod === 1 || cod === 2) {
    while (p + 1 < q.length && !(q[p] === 0 && q[p + 1] === 0)) p += 2;
    p += 2;
  } else {
    while (p < q.length && q[p] !== 0) p++;
    p += 1;
  }
  if (p >= q.length) return null;
  if (!/^image\/(jpeg|png|webp|gif)$/.test(mime)) mime = 'image/jpeg';
  return new Blob([q.subarray(p)], { type: mime });
}

export async function lerTags(arquivo) {
  try {
    const cab = new Uint8Array(await arquivo.slice(0, 10).arrayBuffer());
    if (String.fromCharCode(cab[0], cab[1], cab[2]) !== 'ID3') return {};
    const v = cab[3];
    if (v < 2 || v > 4) return {};
    const tam = sync(cab, 6);
    const dados = new Uint8Array(await arquivo.slice(10, 10 + Math.min(tam, 8_000_000)).arrayBuffer());

    let p = 0;
    if (v >= 3 && cab[5] & 0x40) p = v === 4 ? sync(dados, 0) : be32(dados, 0) + 4; // cabeçalho extra
    const idLen = v === 2 ? 3 : 4;
    const cabLen = v === 2 ? 6 : 10;
    const r = {};
    while (p + cabLen <= dados.length) {
      const id = String.fromCharCode(...dados.subarray(p, p + idLen));
      if (!/^[A-Z0-9]+$/.test(id)) break; // chegou no enchimento
      const t = v === 2 ? (dados[p + 3] << 16) | (dados[p + 4] << 8) | dados[p + 5] : v === 4 ? sync(dados, p + 4) : be32(dados, p + 4);
      const ini = p + cabLen;
      if (t <= 0 || ini + t > dados.length) break;
      const q = dados.subarray(ini, ini + t);
      if (id === 'TIT2' || id === 'TT2') r.titulo = texto(q.subarray(1), q[0]);
      else if (id === 'TPE1' || id === 'TP1') r.artista = texto(q.subarray(1), q[0]);
      else if ((id === 'APIC' || id === 'PIC') && !r.capa) r.capa = imagem(q, v === 2);
      p = ini + t;
    }
    return r;
  } catch {
    return {};
  }
}
