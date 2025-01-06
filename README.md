# Markdown Viewer 実装ドキュメント

## プロジェクト概要
シンプルなMarkdownビューアーアプリケーション。認証機能付きで、PC側で編集、スマートフォンで閲覧が可能。

## 技術スタック
- Next.js 14
- React Bootstrap
- TypeScript
- react-markdown
- @hello-pangea/dnd（ドラッグ&ドロップ機能）

## セットアップ手順

### 1. プロジェクト初期化
```bash
npx create-next-app@latest markdown-viewer --typescript --tailwind --eslint
cd markdown-viewer
```

### 2. 必要なパッケージのインストール
```bash
npm install react-bootstrap bootstrap react-markdown @hello-pangea/dnd crypto-js --legacy-peer-deps
```

## プロジェクト構造
```
app/
  ├── layout.tsx           // メインレイアウト（サーバーコンポーネント）
  ├── AuthLayoutWrapper.tsx // Bootstrap用ラッパー（クライアント）
  ├── AuthLayout.tsx       // 認証レイアウト（クライアント）
  ├── page.tsx            // メインページ
  ├── MarkdownPreview.tsx  // Markdownプレビューコンポーネント
  └── globals.css         // グローバルスタイル
```

## 主要機能

### 1. 認証システム
- パスワードベースの認証
- 試行回数制限（5回）
- ロックアウト機能（30分）
- パスワードのハッシュ化（SHA-256）
- セッション管理

### 2. Markdown編集機能
- マークダウンのリアルタイムプレビュー
- ドラッグ&ドロップによる記事の並び替え
- 記事の編集・削除機能

### 3. レスポンシブデザイン
- PC: 2カラムレイアウト（管理パネル + プレビュー）
- タブレット/モバイル: シンプルな1カラムビュー

## セキュリティ設定

### 環境変数の設定
1. プロジェクトルートに `.env.local` を作成:
```env
NEXT_PUBLIC_HASHED_PASSWORD=your-hashed-password
```

2. パスワードハッシュの生成スクリプト (`scripts/generate-password-hash.js`):
```javascript
const crypto = require('crypto');

const password = process.argv[2];
if (!password) {
  console.error('使用方法: node generate-password-hash.js YOUR_PASSWORD');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('Generated hash:', hash);
console.log('Add this to your .env.local:');
console.log(`NEXT_PUBLIC_HASHED_PASSWORD=${hash}`);
```

## 残りの実装タスク

### Vercelデータベース統合
- データの永続化
- Vercel KVまたはPostgresの設定
- データスキーマの設計
- CRUD操作の実装

## デプロイ前の確認事項
1. 環境変数の設定
   - パスワードハッシュ
   - データベース接続情報

2. セキュリティチェック
   - 認証の動作確認
   - データの永続化確認
   - エラーハンドリング

3. パフォーマンス最適化
   - ビルドサイズの確認
   - レンダリングパフォーマンス