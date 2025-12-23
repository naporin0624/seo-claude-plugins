---
name: block-dangerous-commands
enabled: true
event: bash
pattern: rm\s+-rf|chmod\s+777|sudo\s+
action: block
---

**危険なコマンドがブロックされました**

以下のコマンドパターンが検出されました:
- `rm -rf` - 再帰的な強制削除
- `chmod 777` - 全権限を付与
- `sudo` - 特権昇格

これらのコマンドはシステムに重大な影響を与える可能性があります。
本当に実行が必要な場合は、ユーザーに確認してください。
