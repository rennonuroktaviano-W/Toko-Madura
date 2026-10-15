import { strukKeEscpos, bytesToBase64 } from "./escpos";
import { susunStruk } from "./struk-teks";

export function deteksiKemampuan() {
  if (typeof navigator === "undefined") {
    return { usb: false, bluetooth: false, share: false, android: false };
  }
  const ua = navigator.userAgent || "";
  return {
    usb: "usb" in navigator,
    bluetooth: "bluetooth" in navigator,
    share: typeof navigator.share === "function" && typeof navigator.canShare === "function",
    android: /android/i.test(ua),
  };
}

export function cetakNative(lebarMm = 58) {
  const id = "struk-page-style";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = `@page { size: ${lebarMm}mm auto; margin: 0; }`;
  window.print();
}

export function strukKeBytes(transaksi, pengaturan, lebar) {
  return strukKeEscpos(susunStruk(transaksi, pengaturan, { lebar }));
}

export async function cetakUsb(bytes) {
  if (typeof navigator === "undefined" || !("usb" in navigator)) {
    throw new Error("Browser/perangkat ini tidak mendukung cetak USB langsung.");
  }

  const device = await navigator.usb.requestDevice({
    filters: [{ classCode: 7 }, { classCode: 0xff }],
  });

  await device.open();
  if (device.configuration === null) {
    await device.selectConfiguration(1);
  }

  const iface =
    device.configuration.interfaces.find((i) => i.alternate.interfaceClass === 7) ||
    device.configuration.interfaces[0];
  await device.claimInterface(iface.interfaceNumber);

  const endpoint = iface.alternate.endpoints.find((e) => e.direction === "out");
  if (!endpoint) {
    throw new Error("Printer tidak punya jalur output yang bisa dipakai.");
  }

  const ukuran = 8192;
  for (let i = 0; i < bytes.length; i += ukuran) {
    await device.transferOut(endpoint.endpointNumber, bytes.slice(i, i + ukuran));
  }

  try {
    await device.releaseInterface(iface.interfaceNumber);
  } catch {}
  try {
    await device.close();
  } catch {}
}

const SERVICE_UMUM = [
  "000018f0-0000-1000-8000-00805f9b34fb",
  "0000ff00-0000-1000-8000-00805f9b34fb",
  "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455",
];

export async function cetakBluetooth(bytes) {
  if (typeof navigator === "undefined" || !navigator.bluetooth) {
    throw new Error("Browser/perangkat ini tidak mendukung cetak Bluetooth langsung.");
  }

  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: SERVICE_UMUM,
  });

  const server = await device.gatt.connect();
  const services = await server.getPrimaryServices();

  let karakter = null;
  for (const s of services) {
    const daftar = await s.getCharacteristics();
    karakter = daftar.find(
      (c) => c.properties.writeWithoutResponse || c.properties.write
    );
    if (karakter) break;
  }

  if (!karakter) {
    throw new Error("Karakteristik tulis printer tidak ditemukan. Coba pakai RawBT atau Cetak biasa.");
  }

  const ukuran = 20;
  for (let i = 0; i < bytes.length; i += ukuran) {
    const potongan = bytes.slice(i, i + ukuran);
    if (karakter.properties.writeWithoutResponse) {
      await karakter.writeValueWithoutResponse(potongan);
    } else {
      await karakter.writeValue(potongan);
    }
  }

  try {
    server.disconnect();
  } catch {}
}

export function cetakRawBt(bytes) {
  const url = "rawbt:base64," + bytesToBase64(bytes);
  return new Promise((resolve) => {
    let terbuka = false;
    const onHide = () => {
      terbuka = true;
      document.removeEventListener("visibilitychange", onHide);
    };
    document.addEventListener("visibilitychange", onHide);
    try {
      window.location.href = url;
    } catch {
      document.removeEventListener("visibilitychange", onHide);
      resolve(false);
      return;
    }
    setTimeout(() => {
      document.removeEventListener("visibilitychange", onHide);
      resolve(terbuka);
    }, 1500);
  });
}

export function unduhPng(dataUrl, nama) {
  const a = document.createElement("a");
  a.download = `${nama}.png`;
  a.href = dataUrl;
  a.click();
}

export async function bagikanPng(dataUrl, nama) {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    throw new Error("Perangkat ini tidak mendukung fitur bagikan.");
  }
  const blob = await (await fetch(dataUrl)).blob();
  const file = new File([blob], `${nama}.png`, { type: "image/png" });
  if (navigator.canShare && !navigator.canShare({ files: [file] })) {
    throw new Error("Perangkat ini tidak mendukung bagikan gambar.");
  }
  await navigator.share({ files: [file], title: `Struk ${nama}` });
}
