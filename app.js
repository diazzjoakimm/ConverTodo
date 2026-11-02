const ADSENSE_CLIENT = "";
const ADSENSE_SLOT = "";

const CATEGORIAS = {
  Longitud: { Metro: 1, Kilómetro: 1000, Centímetro: 0.01, Milímetro: 0.001, Milla: 1609.344, Yarda: 0.9144, Pie: 0.3048, Pulgada: 0.0254 },
  Peso: { Kilogramo: 1, Gramo: 0.001, Miligramo: 0.000001, Tonelada: 1000, Libra: 0.45359237, Onza: 0.028349523125 },
  Temperatura: { Celsius: null, Fahrenheit: null, Kelvin: null },
  Volumen: { Litro: 1, Mililitro: 0.001, "Metro cúbico": 1000, "Galón (EE.UU.)": 3.785411784, Taza: 0.2365882365, "Onza líquida": 0.0295735295625 },
  Área: { "Metro cuadrado": 1, "Kilómetro cuadrado": 1000000, Hectárea: 10000, "Centímetro cuadrado": 0.0001, Acre: 4046.8564224, "Pie cuadrado": 0.09290304 },
  Velocidad: { "Metro/segundo": 1, "Kilómetro/hora": 1 / 3.6, "Milla/hora": 0.44704, Nudo: 0.514444444 },
  Tiempo: { Segundo: 1, Minuto: 60, Hora: 3600, Día: 86400, Semana: 604800 },
  Datos: { Byte: 1, Kilobyte: 1024, Megabyte: 1048576, Gigabyte: 1073741824, Terabyte: 1099511627776 }
};

const DEFAULTS = {
  Longitud: ["Kilómetro", "Milla"],
  Peso: ["Kilogramo", "Libra"],
  Temperatura: ["Celsius", "Fahrenheit"],
  Volumen: ["Litro", "Galón (EE.UU.)"],
  Área: ["Metro cuadrado", "Pie cuadrado"],
  Velocidad: ["Kilómetro/hora", "Milla/hora"],
  Tiempo: ["Hora", "Minuto"],
  Datos: ["Gigabyte", "Megabyte"]
};

const $ = (id) => document.getElementById(id);
let categoria = "Longitud";

function aCelsius(v, u) {
  if (u === "Fahrenheit") return (v - 32) * 5 / 9;
  if (u === "Kelvin") return v - 273.15;
  return v;
}

function desdeCelsius(c, u) {
  if (u === "Fahrenheit") return c * 9 / 5 + 32;
  if (u === "Kelvin") return c + 273.15;
  return c;
}

function convertir(v, de, a) {
  if (categoria === "Temperatura") return desdeCelsius(aCelsius(v, de), a);
  const t = CATEGORIAS[categoria];
  return v * t[de] / t[a];
}

function fmt(n) {
  if (!isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e12 || abs < 1e-6) return n.toExponential(6).replace(".", ",");
  return n.toLocaleString("es-AR", { maximumFractionDigits: 8 });
}

function llenarSelects() {
  const unidades = Object.keys(CATEGORIAS[categoria]);
  const opts = unidades.map((u) => `<option value="${u}">${u}</option>`).join("");
  $("desde").innerHTML = opts;
  $("hasta").innerHTML = opts;
  $("desde").value = DEFAULTS[categoria][0];
  $("hasta").value = DEFAULTS[categoria][1];
}

function calcular() {
  const v = parseFloat($("valor").value);
  const de = $("desde").value;
  const a = $("hasta").value;
  if (isNaN(v)) {
    $("resultado").textContent = "Ingresá un número";
    $("tabla").innerHTML = "";
    return;
  }
  $("resultado").textContent = `${fmt(v)} ${de} = ${fmt(convertir(v, de, a))} ${a}`;
  const filas = Object.keys(CATEGORIAS[categoria])
    .filter((u) => u !== de)
    .map((u) => `<tr><td>${u}</td><td>${fmt(convertir(v, de, u))}</td></tr>`)
    .join("");
  $("tabla").innerHTML = `<tr><th>Unidad</th><th style="text-align:right">${fmt(v)} ${de} equivale a</th></tr>${filas}`;
}

function pintarCategorias() {
  $("categorias").innerHTML = Object.keys(CATEGORIAS)
    .map((c) => `<button type="button" class="chip${c === categoria ? " on" : ""}" data-c="${c}">${c}</button>`)
    .join("");
}

$("categorias").addEventListener("click", (e) => {
  const b = e.target.closest("[data-c]");
  if (!b) return;
  categoria = b.dataset.c;
  pintarCategorias();
  llenarSelects();
  calcular();
});

$("invertir").addEventListener("click", () => {
  const d = $("desde").value;
  $("desde").value = $("hasta").value;
  $("hasta").value = d;
  calcular();
});

["valor", "desde", "hasta"].forEach((id) => {
  $(id).addEventListener("input", calcular);
});

function pct() {
  const n = (id) => parseFloat($(id).value);
  const ok = (...v) => v.every((x) => !isNaN(x));
  const r = (x) => fmt(Math.round(x * 1e6) / 1e6);

  let a = n("p1a"), b = n("p1b");
  $("p1r").textContent = ok(a, b) ? r(a * b / 100) : "—";

  a = n("p2a"); b = n("p2b");
  $("p2r").textContent = ok(a, b) && b !== 0 ? r(a / b * 100) + "%" : "—";

  a = n("p3a"); b = n("p3b");
  $("p3r").textContent = ok(a, b) ? r(a * (1 + b / 100)) : "—";

  a = n("p4a"); b = n("p4b");
  $("p4r").textContent = ok(a, b) ? r(a * (1 - b / 100)) : "—";
}

["p1a", "p1b", "p2a", "p2b", "p3a", "p3b", "p4a", "p4b"].forEach((id) => {
  $(id).addEventListener("input", pct);
});

function fechas() {
  const a = $("f1").value;
  const b = $("f2").value;
  if (!a || !b) {
    $("fres").textContent = "Elegí las dos fechas";
    return;
  }
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  const dias = Math.round((d2 - d1) / 86400000);
  const abs = Math.abs(dias);
  const sem = Math.floor(abs / 7);
  const resto = abs % 7;
  $("fres").textContent = `${abs.toLocaleString("es-AR")} días (${sem} semanas y ${resto} días)`;
}

$("f1").addEventListener("input", fechas);
$("f2").addEventListener("input", fechas);

function iniciarFechas() {
  const hoy = new Date();
  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const fin = new Date(hoy.getTime() + 30 * 86400000);
  $("f1").value = iso(hoy);
  $("f2").value = iso(fin);
  fechas();
}

function iniciarAnuncios() {
  if (!ADSENSE_CLIENT) return;
  const s = document.createElement("script");
  s.async = true;
  s.crossOrigin = "anonymous";
  s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + ADSENSE_CLIENT;
  document.head.appendChild(s);
  document.querySelectorAll(".ad-slot").forEach((slot) => {
    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.dataset.adClient = ADSENSE_CLIENT;
    ins.dataset.adSlot = slot.dataset.slot || ADSENSE_SLOT;
    ins.dataset.adFormat = "auto";
    ins.dataset.fullWidthResponsive = "true";
    slot.appendChild(ins);
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  });
}

$("anio").textContent = new Date().getFullYear();
pintarCategorias();
llenarSelects();
calcular();
pct();
iniciarFechas();
iniciarAnuncios();
