---
name: block-git-force-push
enabled: true
event: bash
pattern: git\s+push\s+.*--force|git\s+push\s+-f\s+|git\s+push\s+.*-f$
action: block
---

**git push --force がブロックされました**

強制プッシュ (`--force` または `-f`) が検出されました。

**リスク**:
- リモートブランチの履歴が上書きされます
- 他の開発者の変更が失われる可能性があります
- 復元が困難になります

**代替案**:
- `git push --force-with-lease` を検討してください（より安全）
- 本当に必要な場合は、ユーザーに確認してください
- チームメンバーに事前に通知してください
