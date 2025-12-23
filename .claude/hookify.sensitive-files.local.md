---
name: block-sensitive-files
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env$|\.env\.local$|\.env\.\w+$|credentials|\.pem$|\.key$|secrets
action: block
---

**機密ファイルへの変更がブロックされました**

以下のファイルパターンが検出されました:
- `.env` / `.env.local` / `.env.*` - 環境変数ファイル
- `credentials` - 認証情報ファイル
- `.pem` / `.key` - 秘密鍵ファイル
- `secrets` - シークレットファイル

**理由**:
- 機密情報の漏洩リスク
- 誤ったコミットによるセキュリティ事故
- API キーや認証情報の露出

**対応**:
- これらのファイルを編集する必要がある場合は、ユーザーに直接確認してください
- `.gitignore` にこれらのファイルが含まれていることを確認してください
