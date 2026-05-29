/* ========= Simulação de investimento ========= */
(function () {
  const $ = (id) => document.getElementById(id);

  // Converte texto "R$ 5.000" / "5000,50" em número
  function parseMoeda(str) {
    if (typeof str === "number") return str;
    let s = String(str).replace(/[^\d,.-]/g, "").trim();
    // remove separador de milhar (.) e usa vírgula como decimal
    if (s.indexOf(",") > -1) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      // sem vírgula: pontos são milhar
      s = s.replace(/\.(?=\d{3}\b)/g, "");
    }
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  const fmt = (n) =>
    "R$ " + Math.round(n).toLocaleString("pt-BR");

  // Formata o campo de moeda ao sair
  function formatarCampo(el) {
    const n = parseMoeda(el.value);
    el.value = "R$ " + n.toLocaleString("pt-BR");
  }

  function calcular() {
    const inicial = parseMoeda($("valorInicial").value);
    const aporte = parseMoeda($("aporte").value);
    const meses = Math.max(1, parseInt($("prazo").value || "1", 10));
    const taxaAA = parseFloat($("tipo").value); // ao ano
    const taxaMes = Math.pow(1 + taxaAA, 1 / 12) - 1;

    // Evolução mês a mês (juros compostos + aporte mensal)
    const serie = [];
    let saldo = inicial;
    serie.push(saldo);
    for (let m = 1; m <= meses; m++) {
      saldo = saldo * (1 + taxaMes) + aporte;
      serie.push(saldo);
    }

    const investido = inicial + aporte * meses;
    const total = saldo;
    const juros = total - investido;

    $("rInvestido").textContent = fmt(investido);
    $("rJuros").textContent = fmt(juros);
    $("rTotal").textContent = fmt(total);
    $("rFrase").textContent = fmt(total);
    $("rPrazo").textContent = meses;

    desenharGrafico(serie);
  }

  // Desenha a linha do gráfico a partir da série de saldos
  function desenharGrafico(serie) {
    const x0 = 40, x1 = 320, y0 = 150, y1 = 40;
    const min = Math.min(...serie);
    const max = Math.max(...serie);
    const range = max - min || 1;

    // Amostra até ~6 pontos para não poluir
    const n = serie.length;
    const passos = Math.min(6, n);
    const pts = [];
    for (let i = 0; i < passos; i++) {
      const idx = Math.round((i / (passos - 1)) * (n - 1));
      const px = x0 + (i / (passos - 1)) * (x1 - x0);
      const py = y0 - ((serie[idx] - min) / range) * (y0 - y1);
      pts.push([px, py]);
    }

    const linePts = pts.map((p) => p[0] + "," + p[1]).join(" ");
    const areaPts = linePts + " " + x1 + "," + y0 + " " + x0 + "," + y0;

    $("gLine").setAttribute("points", linePts);
    $("gArea").setAttribute("points", areaPts);

    const dots = pts
      .map(
        (p) =>
          `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#fff" stroke="#1f9d55" stroke-width="3"/>`
      )
      .join("");
    $("gDots").innerHTML = dots;
  }

  // Eventos
  document.addEventListener("DOMContentLoaded", function () {
    ["valorInicial", "aporte"].forEach((id) => {
      const el = $(id);
      el.addEventListener("blur", () => { formatarCampo(el); calcular(); });
      el.addEventListener("input", calcular);
    });
    $("prazo").addEventListener("input", calcular);
    $("tipo").addEventListener("change", calcular);
    $("btnSimular").addEventListener("click", calcular);
    calcular(); // estado inicial
  });
})();
