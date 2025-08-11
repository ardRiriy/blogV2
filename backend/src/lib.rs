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
async fn fetch(req: Request, env: Env, ctx: Context) -> Result<Response> {
    console_error_panic_hook::set_once();
    
    let router = Router::new();
    
    router
        .get_async("/", root)
        .get_async("/articles/:url_suffix", get_article_by_url_suffix)
        .get_async("/articles", get_articles_list)
        .run(req, env)
        .await
}

pub async fn root(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    Response::ok("Hello Axum!aaa")
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
    let result = statement.bind(&[url_suffix.into()])?.first::<Article>(None).await?;
    
    match result {
        Some(article) => {
            Response::from_json(&article)
        },
        None => {
            // 記事が見つからない場合、404を返却
            Response::error("Article not found", 404)
        }
    }
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
         ORDER BY created_at DESC 
         LIMIT 20 OFFSET ?"
    );
    let results = statement.bind(&[offset.into()])?.all().await?;
    
    let articles: Vec<ArticleSummary> = results
        .results::<ArticleSummary>()?
        .into_iter()
        .collect();
    
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
