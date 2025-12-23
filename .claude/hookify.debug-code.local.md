---
name: block-debug-code
enabled: true
event: file
pattern: console\.log\(|console\.debug\(|console\.info\(|debugger
action: block
---

**デバッグコードがブロックされました**

以下のパターンが検出されました:
- `console.log()` / `console.debug()` / `console.info()`
- `debugger` ステートメント

**理由**:
- デバッグコードは本番環境に含めるべきではありません
- `console.log` は機密情報を露出する可能性があります
- パフォーマンスに影響を与えます

**代替案**:
- 適切なログライブラリを使用してください
- 環境変数でログレベルを制御してください
- コミット前にデバッグコードを削除してください
