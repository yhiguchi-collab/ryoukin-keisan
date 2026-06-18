document.addEventListener('DOMContentLoaded', () => {
  const totalYenEl = document.getElementById('total-yen');
  const resetBtn = document.getElementById('reset-btn');
  const jouhouTeikyouEl = document.getElementById('jouhou-teikyou');
  const taiinKyodoEl = document.getElementById('taiin-kyodo');
  const terminalCareEl = document.getElementById('terminal-care');
  const bukkaTaiouEl = document.getElementById('bukka-taiou');
  const iryouJouhouRenkeiEl = document.getElementById('iryou-jouhou-renkei');
  const iryouDxEl = document.getElementById('iryou-dx');
  const renkeiShinryoHojoEl = document.getElementById('renkei-shinryo-hojo');
  const baseUp1El = document.getElementById('base-up-1');

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

  const checkboxEls = [jouhouTeikyouEl, taiinKyodoEl, terminalCareEl, bukkaTaiouEl, iryouJouhouRenkeiEl, iryouDxEl, renkeiShinryoHojoEl, baseUp1El];

  document.querySelectorAll('input[name="futan"]').forEach((el) => el.addEventListener('change', calculate));
  document.querySelectorAll('input[name="nyuuyouji"]').forEach((el) => el.addEventListener('change', calculate));
  document.querySelectorAll('input[name="taiou24"]').forEach((el) => el.addEventListener('change', calculate));
  document.querySelectorAll('input[name="tokubetsu_kanri"]').forEach((el) => el.addEventListener('change', calculate));
  checkboxEls.forEach((el) => el.addEventListener('change', calculate));

  resetBtn.addEventListener('click', () => {
    document.querySelectorAll('input[name="futan"]').forEach((el) => { el.checked = false; });
    document.querySelector('input[name="nyuuyouji"][value="nashi"]').checked = true;
    document.querySelector('input[name="taiou24"][value="nashi"]').checked = true;
    document.querySelector('input[name="tokubetsu_kanri"][value="nashi"]').checked = true;
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
    totalCostFull += counts.kanri_shonichi * IRYOU_KIHON.kanri_shonichi;
    totalCostFull += counts.kanri_2kaime * IRYOU_KIHON.kanri_2kaime;

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

    const tokubetsuKanriEl = document.querySelector('input[name="tokubetsu_kanri"]:checked');
    if (tokubetsuKanriEl && tokubetsuKanriEl.value !== 'nashi') totalCostFull += IRYOU_KASAN.tokubetsu_kanri[tokubetsuKanriEl.value];

    if (terminalCareEl.checked) totalCostFull += IRYOU_KASAN.terminal_care;
    if (bukkaTaiouEl.checked) totalCostFull += IRYOU_KASAN.bukka_taiou;
    if (iryouJouhouRenkeiEl.checked) totalCostFull += IRYOU_KASAN.iryou_jouhou_renkei;
    if (iryouDxEl.checked) totalCostFull += IRYOU_KASAN.iryou_dx;
    if (renkeiShinryoHojoEl.checked) totalCostFull += IRYOU_KASAN.renkei_shinryo_hojo;
    if (baseUp1El.checked) totalCostFull += IRYOU_KASAN.base_up_1;

    let totalYen = 0;
    if (futanEl) {
      const wariai = Number(futanEl.value) / 10;
      totalYen = Math.ceil(totalCostFull * wariai);
    }
    totalYenEl.textContent = totalYen.toLocaleString();
  }

  calculate();
});
