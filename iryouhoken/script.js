document.addEventListener('DOMContentLoaded', () => {
  const totalYenEl = document.getElementById('total-yen');
  const kanriShonichiKaisuuEl = document.getElementById('kanri-shonichi-kaisuu');
  const kanriNikaimeKaisuuEl = document.getElementById('kanri-2kaime-kaisuu');
  const bukkaYenEl = document.getElementById('bukka-yen');
  const iryouDxYenEl = document.getElementById('iryou-dx-yen');
  const resetBtn = document.getElementById('reset-btn');
  const jouhouTeikyouEl = document.getElementById('jouhou-teikyou');
  const taiinKyodoEl = document.getElementById('taiin-kyodo');
  const taiinShienEl = document.getElementById('taiin-shien');
  const iryouJouhouRenkeiEl = document.getElementById('iryou-jouhou-renkei');
  const renkeiShinryoHojoEl = document.getElementById('renkei-shinryo-hojo');
  const baseUp1El = document.getElementById('base-up-1');
  const baseUp2El = document.getElementById('base-up-2');

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

  const checkboxEls = [jouhouTeikyouEl, taiinKyodoEl, taiinShienEl, iryouJouhouRenkeiEl, renkeiShinryoHojoEl, baseUp1El, baseUp2El];

  document.querySelectorAll('input[name="futan"]').forEach((el) => el.addEventListener('change', calculate));
  document.querySelectorAll('input[name="nyuuyouji"]').forEach((el) => el.addEventListener('change', calculate));
  document.querySelectorAll('input[name="taiou24"]').forEach((el) => el.addEventListener('change', calculate));
  document.querySelectorAll('input[name="tokubetsu_kanri"]').forEach((el) => el.addEventListener('change', calculate));
  document.querySelectorAll('input[name="terminal_care"]').forEach((el) => el.addEventListener('change', calculate));
  checkboxEls.forEach((el) => el.addEventListener('change', calculate));

  resetBtn.addEventListener('click', () => {
    document.querySelectorAll('input[name="futan"]').forEach((el) => { el.checked = false; });
    document.querySelector('input[name="nyuuyouji"][value="nashi"]').checked = true;
    document.querySelector('input[name="taiou24"][value="nashi"]').checked = true;
    document.querySelector('input[name="tokubetsu_kanri"][value="nashi"]').checked = true;
    document.querySelector('input[name="terminal_care"][value="nashi"]').checked = true;
    checkboxEls.forEach((el) => { el.checked = false; });
    document.querySelectorAll('.counter').forEach((counter) => {
      const key = counter.dataset.key;
      counts[key] = 0;
      counter.querySelector('.count').textContent = '0';
    });
    calculate();
  });

  function calculate() {
    const futanEl = document.querySelector('input[name="futan"]:checked');

    let totalCostFull = 0;

    totalCostFull += counts.shukan3 * IRYOU_KIHON.shukan3;
    totalCostFull += counts.shukan4 * IRYOU_KIHON.shukan4;

    // 訪問看護管理療養費: 基本療養費の訪問日数に応じて自動付与（月の初日7,710円、2日目以降3,010円/日）
    const houmonNissuu = counts.shukan3 + counts.shukan4;
    const kanriShonichiKaisuu = houmonNissuu > 0 ? 1 : 0;
    const kanriNikaimeKaisuu = houmonNissuu > 0 ? houmonNissuu - 1 : 0;
    kanriShonichiKaisuuEl.textContent = kanriShonichiKaisuu.toLocaleString();
    kanriNikaimeKaisuuEl.textContent = kanriNikaimeKaisuu.toLocaleString();
    totalCostFull += kanriShonichiKaisuu * IRYOU_KIHON.kanri_shonichi + kanriNikaimeKaisuu * IRYOU_KIHON.kanri_2kaime;

    if (jouhouTeikyouEl.checked) totalCostFull += IRYOU_KASAN.jouhou_teikyou;

    // 緊急訪問看護加算: 月14回までと15回目以降で単価が変わる
    const kinkyuuCount = counts.kinkyuu;
    totalCostFull += Math.min(kinkyuuCount, 14) * IRYOU_KASAN.kinkyuu_under14;
    totalCostFull += Math.max(kinkyuuCount - 14, 0) * IRYOU_KASAN.kinkyuu_over14;

    const nyuuyoujiEl = document.querySelector('input[name="nyuuyouji"]:checked');
    if (nyuuyoujiEl && nyuuyoujiEl.value !== 'nashi') totalCostFull += IRYOU_KASAN.nyuuyouji[nyuuyoujiEl.value];

    const taiou24El = document.querySelector('input[name="taiou24"]:checked');
    if (taiou24El && taiou24El.value !== 'nashi') totalCostFull += IRYOU_KASAN.taiou24;

    if (taiinKyodoEl.checked) totalCostFull += IRYOU_KASAN.taiin_kyodo;
    if (taiinShienEl.checked) totalCostFull += IRYOU_KASAN.taiin_shien;

    const tokubetsuKanriEl = document.querySelector('input[name="tokubetsu_kanri"]:checked');
    if (tokubetsuKanriEl && tokubetsuKanriEl.value !== 'nashi') totalCostFull += IRYOU_KASAN.tokubetsu_kanri[tokubetsuKanriEl.value];

    const terminalCareEl = document.querySelector('input[name="terminal_care"]:checked');
    if (terminalCareEl && terminalCareEl.value !== 'nashi') totalCostFull += IRYOU_KASAN.terminal_care[terminalCareEl.value];

    // 訪問看護物価対応料Ⅰ: 基本療養費の訪問日数に応じて自動付与（月の初日60円、2日目以降20円/日）
    const bukkaYen = houmonNissuu > 0
      ? IRYOU_KASAN.bukka_shonichi + (houmonNissuu - 1) * IRYOU_KASAN.bukka_2kaime
      : 0;
    bukkaYenEl.textContent = bukkaYen.toLocaleString();
    totalCostFull += bukkaYen;

    if (iryouJouhouRenkeiEl.checked) totalCostFull += IRYOU_KASAN.iryou_jouhou_renkei;

    // 訪問看護医療DX情報活用加算: 全員に自動付与
    iryouDxYenEl.textContent = IRYOU_KASAN.iryou_dx.toLocaleString();
    totalCostFull += IRYOU_KASAN.iryou_dx;

    if (renkeiShinryoHojoEl.checked) totalCostFull += IRYOU_KASAN.renkei_shinryo_hojo;
    if (baseUp1El.checked) totalCostFull += IRYOU_KASAN.base_up_1;
    if (baseUp2El.checked) totalCostFull += IRYOU_KASAN.base_up_2;

    let totalYen = 0;
    if (futanEl) {
      const wariai = Number(futanEl.value) / 10;
      totalYen = Math.ceil(totalCostFull * wariai);
    }
    totalYenEl.textContent = totalYen.toLocaleString();
  }

  calculate();
});
