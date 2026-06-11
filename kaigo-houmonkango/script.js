document.addEventListener('DOMContentLoaded', () => {
  const chiikiSelect = document.getElementById('chiiki');
  const totalUnitsEl = document.getElementById('total-units');
  const totalYenEl = document.getElementById('total-yen');
  const resetBtn = document.getElementById('reset-btn');

  // 地域単価セレクトボックスの選択肢を生成
  CHIIKI_TANKA.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.value;
    option.textContent = `${item.label}（1単位 = ${item.tanka.toFixed(2)}円）`;
    chiikiSelect.appendChild(option);
  });

  // 利用回数カウンターの初期化
  const counts = {};
  document.querySelectorAll('.counter').forEach((counter) => {
    const key = counter.dataset.key;
    counts[key] = 0;
    const countEl = counter.querySelector('.count');

    counter.querySelector('.minus').addEventListener('click', () => {
      if (counts[key] > 0) {
        counts[key] -= 1;
        countEl.textContent = counts[key];
        calculate();
      }
    });

    counter.querySelector('.plus').addEventListener('click', () => {
      counts[key] += 1;
      countEl.textContent = counts[key];
      calculate();
    });
  });

  chiikiSelect.addEventListener('change', calculate);
  document.querySelectorAll('input[name="futan"]').forEach((el) => el.addEventListener('change', calculate));
  document.querySelectorAll('input[name="kaigodo"]').forEach((el) => el.addEventListener('change', calculate));

  resetBtn.addEventListener('click', () => {
    chiikiSelect.value = '';
    document.querySelectorAll('input[name="futan"]').forEach((el) => { el.checked = false; });
    document.querySelectorAll('input[name="kaigodo"]').forEach((el) => { el.checked = false; });
    document.querySelectorAll('.counter').forEach((counter) => {
      const key = counter.dataset.key;
      counts[key] = 0;
      counter.querySelector('.count').textContent = '0';
    });
    calculate();
  });

  function calculate() {
    const chiikiItem = CHIIKI_TANKA.find((item) => item.value === chiikiSelect.value);
    const futanEl = document.querySelector('input[name="futan"]:checked');
    const kaigodoEl = document.querySelector('input[name="kaigodo"]:checked');

    let totalUnits = 0;

    if (kaigodoEl) {
      const table = KIHON_HOUSHU[kaigodoEl.value];
      totalUnits += counts.kango_under20 * table.kango.under20;
      totalUnits += counts.kango_under30 * table.kango.under30;
      totalUnits += counts.kango_under60 * table.kango.under60;
      totalUnits += counts.kango_under90 * table.kango.under90;
      // リハ行は「1回/2回/3回」の日数 × 訪問回数 × 1回あたりの単位数
      totalUnits += counts.riha_1 * 1 * table.riha;
      totalUnits += counts.riha_2 * 2 * table.riha;
      totalUnits += counts.riha_3 * 3 * table.riha;
    }

    totalUnitsEl.textContent = totalUnits.toLocaleString();

    let totalYen = 0;
    if (chiikiItem && futanEl) {
      const wariai = Number(futanEl.value) / 10;
      totalYen = Math.floor(totalUnits * chiikiItem.tanka * wariai);
    }
    totalYenEl.textContent = totalYen.toLocaleString();
  }

  calculate();
});
