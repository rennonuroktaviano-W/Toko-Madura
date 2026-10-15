const ESC = 0x1b;
const GS = 0x1d;

export function encodeAscii(str) {
  const out = [];
  for (const ch of String(str ?? "")) {
    const code = ch.codePointAt(0);
    out.push(code < 128 ? code : 63);
  }
  return out;
}

export class EscPos {
  constructor() {
    this.bytes = [];
  }

  raw(arr) {
    for (const b of arr) this.bytes.push(b & 0xff);
    return this;
  }

  init() {
    return this.raw([ESC, 0x40]);
  }

  align(n) {
    return this.raw([ESC, 0x61, n]);
  }

  left() {
    return this.align(0);
  }

  center() {
    return this.align(1);
  }

  right() {
    return this.align(2);
  }

  bold(on) {
    return this.raw([ESC, 0x45, on ? 1 : 0]);
  }

  size(width2, height2) {
    const n = (width2 ? 0x10 : 0) | (height2 ? 0x01 : 0);
    return this.raw([GS, 0x21, n]);
  }

  text(str) {
    return this.raw(encodeAscii(str));
  }

  line(str = "") {
    return this.text(str).raw([0x0a]);
  }

  feed(n = 1) {
    return this.raw([ESC, 0x64, n]);
  }

  cut() {
    return this.raw([GS, 0x56, 66, 0]);
  }

  encode() {
    return new Uint8Array(this.bytes);
  }
}

export function bytesToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function strukKeEscpos(baris, { autoCut = true } = {}) {
  const p = new EscPos();
  p.init();
  p.left();
  for (const b of baris) {
    p.line(b);
  }
  p.feed(3);
  if (autoCut) p.cut();
  return p.encode();
}
