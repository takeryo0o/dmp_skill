# 追加能力ジェネレーター

GitHub Pages用・フォルダ分けなし版です。

## 今回の仕様

- NORMAL：通常能力から抽選
- RARE：強力な能力から抽選
- EPIC：以前作成した100種類の特殊能力から抽選
- NORMAL / RARE：条件と能力を別々にランダム抽選し、使用回数は1～6回
- EPIC：以前のコードに設定されていた「能力と専用条件」の組み合わせを維持
- EPICの使用回数・制限も旧条件をもとに表示

## GitHubへアップロードするファイル

ZIPを解凍し、以下をすべてRepository直下へ Upload files してください。

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

## 編集する場所

- 通常条件：`conditions.js`
- NORMAL能力：`normalSkills.js`
- RARE能力：`rareSkills.js`
- EPIC能力：`epicSkills.js`
- 抽選確率・処理：`generator.js`
- 表示処理：`main.js`

## 補足

以前のBBBB配列では、コメント上「65番」の条件が31番目の位置に入っていました。
今回の移植では、コメント番号に基づいて本来の能力番号へ戻してあります。

非公式ファンメイドツールです。公式の商品・サービスとは関係ありません。


## 能力ストック

生成結果の「ストック」ボタンを押すと、ページ下部の能力ストックへ追加されます。

ストック内容はブラウザの `localStorage` に保存されるため、

- ページ再読み込み
- ブラウザを閉じて再度開く
- GitHub Pages上のファイルを更新する

といった場合でも、同じブラウザ・同じサイトデータが残っていれば保持されます。

ブラウザのサイトデータを削除した場合、シークレットモード、別ブラウザ・別端末では引き継がれません。

## NORMAL / RARE 発動回数の確率

`generator.js` の `randomActivationCount()` で設定しています。

初期値：

- 1回：5%
- 2回：10%
- 3回：25%
- 4回：30%
- 5回：25%
- 6回：5%

合計100%です。
