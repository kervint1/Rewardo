# 概要

ペルーの国民的決済アプリ「Yape」と連動し、ユーザーがFintechアプリの登録や指定店舗での決済といったタスクを完了した瞬間に、自身のYapeウォレットへ直接かつ即時で現金（ソレス）がキャッシュバックされる、ペルー市場向けの即時報酬型ポイ活・O2O広告プラットフォーム。

参考: モッピー（日本のポイ活サービス）のビジネスモデルをベースにしている。

## このディレクトリについて

Notionのタスク管理DBにある各要件定義タスク（要件定義MVP／UI・UXの決定／技術スタックとインフラの確定／データ構造のスキーマ設計）の内容をリポジトリ用に整理したものです。RUC納税者番号取得などの手続き関連タスクは対象外としています。

- [01-screens.md](./01-screens.md) — 画面構成・画面遷移・UI/UX方針
- [02-tech-stack.md](./02-tech-stack.md) — 技術スタック・インフラ構成
- [03-data-model.md](./03-data-model.md) — データ構造・DBスキーマ
- [04-decisions.md](./04-decisions.md) — 決定事項ログ（旧ドキュメント間の矛盾解消の記録）
- [05-api-design.md](./05-api-design.md) — API設計（エンドポイント・認証・Postback検証・換金フロー）
- [06-dev-environment.md](./06-dev-environment.md) — 開発環境（Docker Compose構成・開発フロー）
- [07-deployment.md](./07-deployment.md) — デプロイ手順（Heroku・Vercel・本番接続設定）

Notion側の原本: [【MVP要件定義】ペルー版モッピー](https://app.notion.com/p/3a566753a44a814bbbadf3fd8848db5c)
