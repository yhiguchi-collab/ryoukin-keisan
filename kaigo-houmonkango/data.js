// 介護保険 訪問看護 料金シミュレーション用データ
// 出典: 厚生労働省 令和6年度介護報酬改定（令和6年6月施行分）

// 地域区分単価（人件費割合70%、令和6〜8年度適用）
const CHIIKI_TANKA = [
  { value: '1', label: '1級地', tanka: 11.40 },
  { value: '2', label: '2級地', tanka: 11.12 },
  { value: '3', label: '3級地', tanka: 11.05 },
  { value: '4', label: '4級地', tanka: 10.84 },
  { value: '5', label: '5級地', tanka: 10.70 },
  { value: '6', label: '6級地', tanka: 10.42 },
  { value: '7', label: '7級地', tanka: 10.21 },
  { value: 'sonota', label: 'その他', tanka: 10.00 },
];

// 訪問看護費 基本報酬単位数（指定訪問看護ステーション、令和6年6月〜）
const KIHON_HOUSHU = {
  // 要介護1〜5（訪問看護費）
  yokaigo: {
    kango: {
      under20: 314, // 20分未満
      under30: 471, // 30分未満
      under60: 823, // 30分以上1時間未満
      under90: 1128, // 1時間以上1時間30分未満
    },
    riha: 294, // 理学療法士等 1回につき
  },
  // 要支援1・2（介護予防訪問看護費）
  yoshien: {
    kango: {
      under20: 303,
      under30: 451,
      under60: 794,
      under90: 1090,
    },
    riha: 284,
  },
};
