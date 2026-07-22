# 決定事項ログ

## 2026-07-22 改訂2: 認証をNextAuth.js + 自前JWTに変更（最終）

| 項目 | 決定内容 |
| --- | --- |
| データベース | Heroku Postgres（GitHub Educationクレジットで実質無料） |
| 認証 | **NextAuth.js（Google Provider）+ FastAPI自前JWT**（[FarmMatch](https://github.com/kervint1/FarmMatch)の実装を流用） |
| 画像ストレージ | Appwrite Storage（GitHub Student PackでPro相当無料）。**MVPでは未使用**、将来の画像機能用の想定 |
| 管理画面 | 自作しない。TablePlus / pgAdmin等のDBクライアントでHeroku Postgresに直接接続して `withdrawals` を運用 |
| バックエンド | FastAPI + SQLModel をHeroku（Educationクレジット）でホスティング |
| フロントエンド | Next.js on Vercel（無料枠） |
| データアクセス | フロントエンドはDBに直接アクセスせず、読み書きすべてFastAPI経由 |

### 認証をFirebase AuthからNextAuth.jsに変えた理由

- **FarmMatchでの実装経験がそのまま使える**: NextAuth設定・`auth_service.py`（jose/HS256でのJWT発行・検証）・`routers/auth.py` をほぼコピーできる。FarmMatchは構成（Next.js + FastAPI + SQLModel + Postgres + Heroku + Appwrite）が今回とほぼ同一
- **外部サービスがひとつ減る**: Firebaseプロジェクトの作成・管理・サービスアカウントキーの取り回しが不要になる
- **改善点**: FarmMatchではフロントから送られたGoogleプロフィール情報を信頼していたが、今回はお金を扱うため、**GoogleのIDトークンをバックエンドで検証**してからユーザー作成・JWT発行を行う（[05-api-design.md](./05-api-design.md)）

### 副作用

- `users.id` はFirebase UID（TEXT）ではなく、FarmMatchと同じ連番整数 + `google_id` カラム方式に変更
- ログイン方法はMVPでは**Googleログインのみ**（メールログインはNextAuthのEmail Provider追加で将来対応可能）

## 2026-07-22 改訂1: Heroku Postgres + Firebase Auth 構成（認証のみ破棄）

DB・ホスティングの決定（Heroku Postgres / DBクライアント管理 / FastAPI on Heroku / Vercel）はこの時点のものが現在も有効。認証だけFirebase Auth案だったが、FarmMatchパターンの方が実装コストが低いため改訂2で差し替えた。

## 2026-07-22 第1版: Supabase統一案（破棄）

当初、Notion上の旧ドキュメント間でDB・認証・管理画面の記載が食い違っていた（技術スタック案: Appwrite Auth + Heroku Postgres + 自作Admin ／ データ構造案: Supabase Auth + Supabase Postgres + Table Editor）。

一度「管理画面をSupabase Table Editorで代替する」方針を軸にDB・認証・ストレージをSupabaseへ統一する決定をしたが、以下の理由で破棄した:

- SQL（DB）はもともとHeroku（Education無料）を使う予定だった
- Supabaseは学生パック対象外で、Education枠を活かせない
- 「管理画面を自作しない」目的はDBクライアント（TablePlus等）でHeroku Postgresに直接つなぐ運用でも達成できる
