document.addEventListener('DOMContentLoaded', () => {
  const totalYenEl = document.getElementById('total-yen');
  const resetBtn = document.getElementById('reset-btn');

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

  resetBtn.addEventListener('click', () => {
    document.querySelectorAll('.counter').forEach((counter) => {
      const key = counter.dataset.key;
      counts[key] = 0;
      counter.querySelector('.count').textContent = '0';
    });
    calculate();
  });

  function calculate() {
    const totalYen = counts.base_30min * JIHI_RYOUKIN.base_30min
      + counts.extension_30min * JIHI_RYOUKIN.extension_30min;
    totalYenEl.textContent = totalYen.toLocaleString();
  }

  calculate();
});
