# 仕訳ナビ（ShiwakeNavi）

クレジットカード明細から会計ソフト用CSVを一発生成するツール

## 機能

- ✅ Excel/CSV/GoogleスプレッドシートURL対応
- ✅ 同じ会社名を自動検出して一括設定
- ✅ 手入力が80%削減
- ✅ 完全無料・登録不要

## 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite 7
- **UIコンポーネント**: shadcn/ui + Tailwind CSS 4
- **バックエンド**: Express + tRPC 11
- **データベース**: MySQL（Drizzle ORM）

## 開発

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# 本番起動
pnpm start
```

## プロジェクト構成

```
shiwake-navi/
├── client/          # フロントエンド（React）
├── server/          # バックエンド（Express + tRPC）
├── drizzle/         # DBスキーマ
└── shared/          # 共有型定義
```

## ライセンス

MIT

## 作者

Claude Code + React で2日で作成
