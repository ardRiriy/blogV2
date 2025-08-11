// 型定義
export interface Article {
    id: string;
    title: string;
    content: string;
    date: string;
}

export async function getArticle(id: string): Promise<Article> {
    const res = await fetch(`${process.env.BACKEND_URL}/articles/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    if (!res.ok) {
        throw new Error('Failed to fetch article');
    }
    console.log(res);
    const data = await res.json();
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: id,
                title: data.title,
                content: data.content.replace(/\\n/g, '\n'),
                date: data.updated_at
            });
        }, 1000);
    });

}

export interface ArticleList {
    id: number;
    title: string;
    url: string;
    date: string;
}

export interface Infomations {
    articles: ArticleList[];
    total_pages: number;
}

export async function getArticleList(page: number): Promise<Infomations> {
    const res = await fetch(`${process.env.BACKEND_URL}/articles?page=${page}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
    if (!res.ok) {
        throw new Error('Failed to fetch article list');
    }
    const data = await res.json();

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                articles: data.articles.map((elm: any) => {
                    return {
                        id: elm.id,
                    title: elm.title,
                    url: elm.url_suffix,
                    date: elm.updated_at
                }
            }),
            total_pages: data.total_pages
        });
    }, 1000);
});
}