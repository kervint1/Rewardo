# データ構造・DBスキーマ

Monlix iframeにタスク一覧・タスク詳細・外部サイト誘導・成果判定を任せるため、自アプリ側でタスク（案件）テーブルは持たない。管理するのは以下の3テーブルのみ。DBは**Heroku Postgres**。

現金額は保持せず、**整数ポイント**で管理する（1,000 pts = S/ 1。規約対応、[04-decisions.md](./04-decisions.md)参照）。

| テーブル | 役割 | 主な利用画面・処理 |
| --- | --- | --- |
| `users` | ユーザー情報と所持ポイントを管理する | Home / Wallet |
| `postbacks` | Monlixから届いた成果発生履歴（獲得ポイント数）を保存する（`transaction_id` で二重付与を防止） | Webhook / Wallet履歴 |
| `withdrawals` | Yape換金申請（消費ポイント＋支払ソル額）と送金ステータス（pending/completed/rejected）を管理する | Wallet / DBクライアント（管理者） |

## ER図

FarmMatchと同じく、`users.id` は連番の整数、Googleアカウントとの紐付けは `google_id` カラム（GoogleのIDトークンの `sub` クレーム）で行う。

```mermaid
erDiagram
    GOOGLE_OAUTH ||--|| USERS : "google_id (sub)"
    USERS ||--o{ POSTBACKS : "earns rewards"
    USERS ||--o{ WITHDRAWALS : "requests payout"

    USERS {
        serial id PK
        text google_id UK "Googleのsubクレーム"
        text email UK
        text name
        text avatar_url
        int points "所持ポイント"
        timestamptz created_at
    }

    POSTBACKS {
        uuid id PK
        text transaction_id UK
        int user_id FK
        int reward_points "獲得ポイント"
        timestamptz created_at
    }

    WITHDRAWALS {
        uuid id PK
        int user_id FK
        varchar yape_phone
        int points "消費ポイント"
        decimal amount_soles "Yape送金額"
        text status
        timestamptz created_at
        timestamptz updated_at
    }
```

## DDL（Heroku Postgres）

ポイントは整数（INT）で持つため計算ズレは発生しない。Yape送金額のみ `DECIMAL(10, 2)` を使う。フロントエンドはDBに直接アクセスしないため、RLSは不要（アクセス制御はFastAPI側で行う）。

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id TEXT UNIQUE NOT NULL,                -- GoogleのIDトークンのsubクレーム
  email TEXT UNIQUE NOT NULL,
  name TEXT,                                     -- Googleの表示名
  avatar_url TEXT,                               -- Googleのアイコン画像URL
  points INTEGER NOT NULL DEFAULT 0,             -- 所持ポイント
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE postbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL,           -- Monlixの一意の取引ID（二重付与を防止）
  user_id INTEGER NOT NULL REFERENCES users(id),
  reward_points INTEGER NOT NULL,                -- 獲得ポイント数
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id),
  yape_phone VARCHAR(9) NOT NULL,                -- ペルーの電話番号（9桁）
  points INTEGER NOT NULL,                       -- 消費ポイント数
  amount_soles DECIMAL(10, 2) NOT NULL,          -- Yapeで送金する額(S/)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'completed', 'rejected')
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

マイグレーションはFarmMatchと同じく**Alembic**で管理する（導入済み: `server/alembic/`）。スキーマの正はSQLModelモデル＋マイグレーションであり、上記DDLは参考情報。

## usersの行作成（プロビジョニング）

NextAuthでのGoogleログイン後、フロントエンドがGoogleのIDトークンを `POST /api/v1/auth/login` に送る。FastAPIがトークンを検証し、`sub` / `email` / `name` / `picture` を使って `users` 行をUPSERTしてから自前JWTを返す。詳細は [05-api-design.md](./05-api-design.md) を参照。

## Webhook / Postback処理フロー

```
Monlix
  ↓ Postback / Webhook
FastAPI (Heroku)
  ↓ transaction_id 重複チェック
postbacks に保存
  ↓
users.points を加算
  ↓
Home / Wallet にポイント反映（フロントはAPIから取得）
```

## 換金申請の運用フロー

1. ユーザーがWalletからYape番号・金額を入力して申請
2. FastAPIが**ポイントチェックと差し引きを1トランザクションで行い**、`withdrawals` に `pending` として保存（ポイントは申請時に差し引く。二重申請防止のため `pending` は同時に1件まで）
3. 管理者が **DBクライアント（TablePlus / pgAdmin等）** でHeroku Postgresに接続し `pending` を確認
4. Yapeで手動送金
5. `status` を `completed` に更新 → Wallet側の履歴表示が「送金完了」に変わる
6. 却下する場合は `rejected` に更新し、差し引いたポイントを `users.points` に手動SQLで戻す（詳細は [05-api-design.md](./05-api-design.md)）

## MVPで不要と判断されたもの

- `tasks` / `campaigns` / `task_details` テーブル
- タスク詳細画面 `/tasks/:taskId`
- 案件一覧API・案件詳細API
- 自作Admin画面（DBクライアントで代替）
- RLS（フロントエンドがDBに直接アクセスしないため）
