use chrono::NaiveDateTime;
use worker::*;

#[derive(Debug, serde::Deserialize, serde::Serialize)]
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

mod naive_date_time_format {
    use chrono::NaiveDateTime;
    use serde::{self, Deserialize, Deserializer, Serialize, Serializer};

    const FORMAT: &str = "%Y-%m-%d %H:%M:%S";

    pub fn serialize<S>(date: &NaiveDateTime, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let s = format!("{}", date.format(FORMAT));
        serializer.serialize_str(&s)
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<NaiveDateTime, D::Error>
    where
        D: Deserializer<'de>,
    {
        let s = String::deserialize(deserializer)?;
        NaiveDateTime::parse_from_str(&s, FORMAT).map_err(serde::de::Error::custom)
    }
}

#[event(fetch)]
async fn fetch(req: Request, env: Env, ctx: Context) -> Result<Response> {
    console_error_panic_hook::set_once();
    
    let router = Router::new();
    
    router
        .get_async("/", root)
        .get_async("/articles/:url_suffix", get_article_by_url_suffix)
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
