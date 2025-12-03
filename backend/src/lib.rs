use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use worker::*;

mod format;
use format::naive_date_time_format;

#[derive(Debug, Deserialize, serde::Serialize)]
struct Article {
    id: u32,
    title: String,
    content: String,
    url_suffix: String,
    tags: Option<String>, // ,区切りの文字列として表す
    #[serde(with = "naive_date_time_format")]
    created_at: NaiveDateTime,
    #[serde(with = "naive_date_time_format")]
    updated_at: NaiveDateTime,
}

#[derive(Debug, Deserialize, Serialize)]
struct ArticleSummary {
    id: u32,
    title: String,
    url_suffix: String,
    tags: Option<String>,
    #[serde(with = "naive_date_time_format")]
    created_at: NaiveDateTime,
    #[serde(with = "naive_date_time_format")]
    updated_at: NaiveDateTime,
}

#[event(fetch)]
async fn fetch(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    console_error_panic_hook::set_once();

    let router = Router::new();

    router
        .get_async("/articles/:url_suffix", get_article_by_url_suffix)
        .get_async("/articles", get_articles_list)
        .get_async("/articles/all", get_all_content)
        .post_async("/articles", save_article)
        .delete_async("/articles/:url_suffix", delete_article)
        .run(req, env)
        .await
}

pub async fn get_article_by_url_suffix(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    // パスパラメータからurl_suffixを取得
    let url_suffix = match ctx.param("url_suffix") {
        Some(suffix) => suffix,
        None => return Response::error("Missing url_suffix parameter", 400),
    };
    console_log!("url_suffix: {}", url_suffix);

    let d1 = ctx.env.d1("DB")?;

    // url_suffixで記事を検索
    let statement = d1.prepare("SELECT * FROM Articles WHERE url_suffix = ?");
    let result = statement
        .bind(&[url_suffix.into()])?
        .first::<Article>(None)
        .await?;

    match result {
        Some(article) => Response::from_json(&article),
        None => {
            // 記事が見つからない場合、404を返却
            Response::error("Article not found", 404)
        }
    }
}

pub async fn get_all_content(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let d1 = ctx.env.d1("DB")?;

    // 全記事のcontentを取得
    let statement = d1.prepare("SELECT * FROM Articles");
    let results = statement.all().await?;

    let articles: Vec<Article> = results.results::<Article>()?.into_iter().collect();

    Response::from_json(&articles)
}

pub async fn get_articles_list(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let url = req.url()?;
    let page = url
        .query_pairs()
        .find(|(key, _)| key == "page")
        .and_then(|(_, value)| value.parse::<u32>().ok())
        .unwrap_or(1);

    let page = if page < 1 { 1 } else { page };
    let offset = (page - 1) * 20;

    let d1 = ctx.env.d1("DB")?;

    // 総記事数を取得
    let count_statement = d1.prepare("SELECT COUNT(*) as count FROM Articles");
    let count_result = count_statement.first::<serde_json::Value>(None).await?;
    let total_count = count_result
        .and_then(|v| v.get("count").cloned())
        .and_then(|v| v.as_u64())
        .map(|v| v as u32)
        .unwrap_or(0);

    // 記事一覧を取得（contentなし）
    let statement = d1.prepare(
        "SELECT id, title, url_suffix, tags, created_at, updated_at
         FROM Articles
         ORDER BY updated_at DESC
         LIMIT 20 OFFSET ?",
    );
    let results = statement.bind(&[offset.into()])?.all().await?;

    let articles: Vec<ArticleSummary> = results.results::<ArticleSummary>()?.into_iter().collect();

    #[derive(serde::Serialize)]
    struct ArticleListResponse {
        articles: Vec<ArticleSummary>,
        page: u32,
        per_page: u32,
        total_count: u32,
        total_pages: u32,
    }

    let total_pages = (total_count + 19) / 20;

    let response = ArticleListResponse {
        articles,
        page,
        per_page: 20,
        total_count,
        total_pages,
    };

    Response::from_json(&response)
}

#[derive(Debug, serde::Deserialize)]
struct SaveArticleRequest {
    title: String,
    content: String,
    url_suffix: String,
    tags: Vec<String>, // 配列で受け取る
    created_at: Option<String>,
    updated_at: Option<String>,
}

pub async fn save_article(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let token = match ctx.env.secret("TOKEN") {
        Ok(token) => token.to_string(),
        Err(_) => return Response::error("Internal Server Error", 500),
    };

    let auth = match req.headers().get("Authorization") {
        Ok(Some(value)) => value,
        _ => return Response::error("Unauthorized", 401),
    };

    let auth_token = auth.trim_start_matches("Bearer ");
    if auth_token != token {
        return Response::error("Unauthorized", 401);
    }

    let article_request: SaveArticleRequest = req.json().await?;

    console_log!("Saving article: {:?}", article_request);

    // tagsを配列から,区切り文字列に変換
    let tags_string = article_request.tags.join(",");

    let d1 = ctx.env.d1("DB")?;

    // url_suffixで既存記事を検索
    let existing_check = d1.prepare("SELECT id FROM Articles WHERE url_suffix = ?");
    let existing_result = existing_check
        .bind(&[article_request.url_suffix.clone().into()])?
        .first::<serde_json::Value>(None)
        .await?;

    let result = match existing_result {
        // 既存記事がある場合は更新
        Some(_) => {
            let mut set_clauses = vec!["title = ?", "content = ?", "tags = ?"];
            let mut bind_values = vec![
                article_request.title.into(),
                article_request.content.into(),
                tags_string.into(),
            ];

            if let Some(created_at) = article_request.created_at {
                console_log!("Setting created_at to: {}", created_at);
                set_clauses.push("created_at = ?");
                bind_values.push(created_at.into());
            }

            if let Some(updated_at) = article_request.updated_at {
                console_log!("Setting updated_at to: {}", updated_at);
                set_clauses.push("updated_at = ?");
                bind_values.push(updated_at.into());
            }

            let query = format!(
                "UPDATE Articles SET {} WHERE url_suffix = ? RETURNING *",
                set_clauses.join(", ")
            );

            bind_values.push(article_request.url_suffix.into());

            let statement = d1.prepare(&query);
            statement.bind(&bind_values)?.first::<Article>(None).await?
        }
        // 新規作成
        None => {
            let (query, bind_values) = if article_request.created_at.is_some()
                || article_request.updated_at.is_some()
            {
                let mut columns = vec!["title", "content", "url_suffix", "tags"];
                let mut placeholders = vec!["?", "?", "?", "?"];
                let mut values = vec![
                    article_request.title.into(),
                    article_request.content.into(),
                    article_request.url_suffix.into(),
                    tags_string.into(),
                ];

                if let Some(created_at) = article_request.created_at {
                    console_log!("Setting created_at to: {}", created_at);
                    columns.push("created_at");
                    placeholders.push("?");
                    values.push(created_at.into());
                }

                if let Some(updated_at) = article_request.updated_at {
                    console_log!("Setting updated_at to: {}", updated_at);
                    columns.push("updated_at");
                    placeholders.push("?");
                    values.push(updated_at.into());
                }

                let query = format!(
                    "INSERT INTO Articles ({}) VALUES ({}) RETURNING *",
                    columns.join(", "),
                    placeholders.join(", ")
                );

                (query, values)
            } else {
                let query = "INSERT INTO Articles (title, content, url_suffix, tags) VALUES (?, ?, ?, ?) RETURNING *".to_string();
                let values = vec![
                    article_request.title.into(),
                    article_request.content.into(),
                    article_request.url_suffix.into(),
                    tags_string.into(),
                ];
                (query, values)
            };

            let statement = d1.prepare(&query);
            statement.bind(&bind_values)?.first::<Article>(None).await?
        }
    };

    match result {
        Some(article) => Response::from_json(&article),
        None => Response::error("Failed to save article", 500),
    }
}

pub async fn delete_article(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let token = match ctx.env.secret("TOKEN") {
        Ok(token) => token.to_string(),
        Err(_) => return Response::error("Internal Server Error", 500),
    };

    let auth = match req.headers().get("Authorization") {
        Ok(Some(value)) => value,
        _ => return Response::error("Unauthorized", 401),
    };

    let auth_token = auth.trim_start_matches("Bearer ");
    if auth_token != token {
        return Response::error("Unauthorized", 401);
    }

    let url_suffix = match ctx.param("url_suffix") {
        Some(suffix) => suffix,
        None => return Response::error("Missing url_suffix parameter", 400),
    };

    console_log!("Deleting article with suffix: {}", url_suffix);

    let d1 = ctx.env.d1("DB")?;

    let statement = d1.prepare("DELETE FROM Articles WHERE url_suffix = ?");
    let _result = statement.bind(&[url_suffix.into()])?.run().await?;

    Response::ok("Article deleted successfully")
}
