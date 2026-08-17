# 追加能力ジェネレーター（GitHub直下配置版）

GitHub の **Upload files** でそのままアップロードしやすいように、フォルダ分けをしない構成です。

## アップロードするファイル

以下をすべて Repository の一番上（root）へアップロードしてください。

```text
index.html
style.css
main.js
generator.js
conditions.js
normalSkills.js
rareSkills.js
epicSkills.js
README.md
```

## ファイルの役割

- `index.html`：画面
- `style.css`：デザイン
- `main.js`：ボタン操作・結果表示
- `generator.js`：抽選処理
- `conditions.js`：条件一覧
- `normalSkills.js`：NORMAL能力一覧
- `rareSkills.js`：RARE能力一覧
- `epicSkills.js`：EPIC能力一覧

## GitHub Pages

`Settings` → `Pages` から次のように設定してください。

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

## 初期レアリティ確率

- NORMAL：75%
- RARE：20%
- EPIC：5%

確率は `generator.js` の `randomRarity()` で変更できます。

## 注意

非公式ファンメイドツールです。公式の商品・サービスとは関係ありません。
