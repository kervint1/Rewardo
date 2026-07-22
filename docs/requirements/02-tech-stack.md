# 技術スタック・インフラ

週12時間の開発リソースで最速リリースするため、MVPではコストと実装工数を極限まで抑える方針。GitHub Educationの無料枠と、過去プロジェクト（[FarmMatch](https://github.com/kervint1/FarmMatch)）での実装経験を最大限活用する。

## フェーズ1: MVP構成（現在）

| 領域 | 採用技術 | 無料の根拠 | 役割 |
| --- | --- | --- | --- |
| フロントエンド | Next.js App Router + TypeScript + Tailwind CSS | Vercel無料枠 | LP、ログイン画面、Monlix iframe表示、Wallet画面 |
| バックエンド | FastAPI（Python）+ SQLModel | Heroku（GitHub Educationクレジット） | Monlix Postbackの検証・受信、残高更新、換金申請処理、全データの読み書きAPI |
| データベース | Heroku Postgres | GitHub Educationクレジット内 | `users`、`postbacks`、`withdrawals` を管理 |
| 認証 | NextAuth.js（Google Provider）+ FastAPI自前JWT | 無料（外部認証サービス不要） | GoogleログインはNextAuth、APIアクセス用JWTはFastAPIが発行。**FarmMatchの実装を流用** |
| 画像ストレージ（将来用） | Appwrite Storage | GitHub Student PackでPro相当無料 | **MVPでは未使用**。将来画像を扱う機能が必要になったら使う想定。FarmMatchの `appwrite_storage.py` を流用可能 |
| 管理画面 | TablePlus / pgAdmin 等のDBクライアント | 無料 | Heroku Postgresに直接接続し `withdrawals` を確認・更新。Adminを自作しない |
| オファーウォール | Monlix（iframe埋め込み） | — | 案件一覧・案件詳細・外部誘導・成果判定 |
| 決済・送金 | Yape（管理者が手動送金） | — | ユーザーへのキャッシュバック |
| 開発・テスト用 | VPN | — | ペルーIPに偽装し、Monlixの現地向け案件を表示確認 |

> ✅ **決定（2026-07-22 改訂2）**: 認証はFirebase AuthではなくFarmMatchと同じ**NextAuth.js + 自前JWT**方式に確定。外部認証サービスが不要になり、FarmMatchの `auth_service.py`・NextAuth設定をほぼそのまま流用できる（経緯は [04-decisions.md](./04-decisions.md)）。

## アーキテクチャの要点

- FastAPIとPostgresが同じHeroku内にあり、接続文字列一本でSQL・SQLModel・トランザクション・行ロックがそのまま使える。お金の処理（残高加算・差し引き）はすべてDBトランザクションで守る
- フロントエンドはDBに直接アクセスしない。**読み取りも書き込みもすべてFastAPI経由**（自前JWTで認証）
- 認証フロー: NextAuthがGoogleログインを処理 → GoogleのIDトークンをFastAPIに送る → FastAPIが検証してユーザーをUPSERTし、自前JWTを発行 → 以降のAPI呼び出しはそのJWT
- バックエンドの構成（routers / models / schemas / services）はFarmMatchと同じ分け方にする
- Heroku Postgresの最小プラン（Essential-0）は**1万行の上限**がある。`postbacks` が積み上がって近づいたらEssential-1（1000万行）へアップグレード（Educationクレジット内で収まる）

```
[ユーザー (ブラウザ)]
        ↓
   [Vercel (Next.js)] ──Googleログイン──→ [Google OAuth (NextAuth.js)]
        ↓ 自前JWT付きAPI呼び出し
   [Heroku (FastAPI)] ←──Postback── [Monlix]
        ↓ SQL
   [Heroku Postgres]
        ↑ DBクライアント(TablePlus等)で直接接続
   [管理者] ──手動送金──→ [Yape]
```

## フェーズ2: スケール・AWS移行（将来）

ユーザー数が増加し安定稼働・スケーリングが必要になった段階で、AWSへ段階的に移行する構想（FarmMatchのフェーズ2構想と同じ流れ）。

| コンポーネント | MVP（現在） | 移行先（AWS） | 移行のポイント |
| --- | --- | --- | --- |
| フロントエンド | Vercel | AWS Amplify | GitHubリポジトリ連携でデプロイ移行しやすい |
| 認証 | NextAuth.js + 自前JWT | Amazon Cognito + Google OAuth | JWT検証ロジックをCognito用に差し替え |
| バックエンド | Heroku FastAPI | API Gateway + Lambda | `Mangum` でFastAPIコードをLambda関数化 |
| データベース | Heroku Postgres | Aurora PostgreSQL | エクスポート・インポートで移行。SQLModelのコードはそのまま使える |
| ストレージ | Appwrite Storage | Amazon S3 | 保存ファイルをS3バケットへ一括転送 |

移行は「DB → API → 認証 → フロントエンド → ストレージ」の順に段階的に行う想定。
