---
name: block-npm-publish
enabled: true
event: bash
pattern: npm\s+publish|pnpm\s+publish|yarn\s+publish
action: block
---

**パッケージ公開がブロックされました**

以下のコマンドが検出されました:
- `npm publish`
- `pnpm publish`
- `yarn publish`

**リスク**:
- 意図しないバージョンの公開
- 機密情報を含むコードの公開
- 破壊的変更の公開

**確認事項**:
- バージョン番号は正しいですか？
- CHANGELOG は更新されましたか？
- テストは全てパスしていますか？
- `.npmignore` または `files` フィールドは適切ですか？

本当に公開する場合は、ユーザーに確認してください。
