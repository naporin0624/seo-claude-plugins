---
name: block-main-branch-operations
enabled: true
event: bash
pattern: git\s+checkout\s+(main|master)|git\s+merge\s+.*\s+(main|master)|git\s+push\s+origin\s+(main|master)|git\s+commit.*--(main|master)
action: block
---

**main/master ブランチへの直接操作がブロックされました**

以下の操作が検出されました:
- `git checkout main/master` - メインブランチへの切り替え
- `git merge ... main/master` - メインブランチへのマージ
- `git push origin main/master` - メインブランチへの直接プッシュ

**理由**:
- main/master ブランチは保護されるべきです
- プルリクエスト経由での変更が推奨されます
- 直接変更はコードレビューをバイパスします

**推奨ワークフロー**:
1. 機能ブランチを作成: `git checkout -b feature/xxx`
2. 変更をコミット
3. プルリクエストを作成
4. レビュー後にマージ

本当に直接操作が必要な場合は、ユーザーに確認してください。
