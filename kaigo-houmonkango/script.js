document.addEventListener('DOMContentLoaded', () => {
  const chiikiSelect = document.getElementById('chiiki');
  const totalUnitsEl = document.getElementById('total-units');
  const totalYenEl = document.getElementById('total-yen');
  const shoguUnitsEl = document.getElementById('shogu-units');
  const resetBtn = document.getElementById('reset-btn');
  const terminalCareEl = document.getElementById('terminal-care');
  const renkeiKyokaEl = document.getElementById('renkei-kyoka');

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
  document.querySelectorAll('input[name="kinkyuji"]').forEach((el) => el.addEventListener('change', calculate));
  document.querySelectorAll('input[name="tokubetsu_kanri"]').forEach((el) => el.addEventListener('change', calculate));
  document.querySelectorAll('input[name="shokai"]').forEach((el) => el.addEventListener('change', calculate));
  terminalCareEl.addEventListener('change', calculate);
  renkeiKyokaEl.addEventListener('change', calculate);

  resetBtn.addEventListener('click', () => {
    chiikiSelect.value = '';
    document.querySelectorAll('input[name="futan"]').forEach((el) => { el.checked = false; });
    document.querySelectorAll('input[name="kaigodo"]').forEach((el) => { el.checked = false; });
    document.querySelector('input[name="kinkyuji"][value="nashi"]').checked = true;
    document.querySelector('input[name="tokubetsu_kanri"][value="nashi"]').checked = true;
    document.querySelector('input[name="shokai"][value="nashi"]').checked = true;
    terminalCareEl.checked = false;
    renkeiKyokaEl.checked = false;
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

    let kihonUnits = 0;

    if (kaigodoEl) {
      const table = KIHON_HOUSHU[kaigodoEl.value];
      kihonUnits += counts.kango_under20 * table.kango.under20;
      kihonUnits += counts.kango_under30 * table.kango.under30;
      kihonUnits += counts.kango_under60 * table.kango.under60;
      kihonUnits += counts.kango_under90 * table.kango.under90;
      // リハ行は「1回/2回/3回」の日数 × 訪問回数 × 1回あたりの単位数
      kihonUnits += counts.riha_1 * 1 * table.riha;
      kihonUnits += counts.riha_2 * 2 * table.riha;
      kihonUnits += counts.riha_3 * 3 * table.riha;
    }

    // 各種加算
    let kasanUnits = 0;

    const kinkyujiEl = document.querySelector('input[name="kinkyuji"]:checked');
    if (kinkyujiEl && kinkyujiEl.value !== 'nashi') kasanUnits += KASAN.kinkyuji[kinkyujiEl.value];

    const tokubetsuEl = document.querySelector('input[name="tokubetsu_kanri"]:checked');
    if (tokubetsuEl && tokubetsuEl.value !== 'nashi') kasanUnits += KASAN.tokubetsu_kanri[tokubetsuEl.value];

    if (terminalCareEl.checked) kasanUnits += KASAN.terminal_care;

    kasanUnits += counts.chojikan * KASAN.chojikan;
    kasanUnits += counts.taiin_kyodo * KASAN.taiin_kyodo;

    const shokaiEl = document.querySelector('input[name="shokai"]:checked');
    if (shokaiEl && shokaiEl.value !== 'nashi') kasanUnits += KASAN.shokai[shokaiEl.value];

    if (renkeiKyokaEl.checked) kasanUnits += KASAN.renkei_kyoka;

    // 介護職員等処遇改善加算（基本料金＋加算の合計に対して加算率を乗じ、四捨五入）
    const shoguUnits = Math.round((kihonUnits + kasanUnits) * SHOGU_KAIZEN_RATE);
    shoguUnitsEl.textContent = shoguUnits.toLocaleString();

    const totalUnits = kihonUnits + kasanUnits + shoguUnits;
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
