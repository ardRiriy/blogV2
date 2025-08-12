import { unstable_cache } from 'next/cache';
// 型定義
export interface Article {
    id: string;
    title: string;
    content: string;
    url_suffix: string,
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
    const data = await res.json();
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id: id,
                url_suffix: data.url_suffix,
                title: data.title,
                content: data.content.replace(/\\n/g, '\n'),
                date: data.updated_at
            });
        }, 1000);
    });

}

// export async function getAllArticle() : Promise<Article[]> {
//     const res = await fetch(`${process.env.BACKEND_URL}/articles/all`, {
//         method: 'GET',
//         headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//         }
//     });
//     if (!res.ok) {
//         throw new Error('Failed to fetch articles');
//     }
//     const data = await res.json();
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve(data.map((elm: any) => ({
//                 id: elm.id,
//                 title: elm.title,
//                 content: elm.content.replace(/\\n/g, '\n'),
//                 date: elm.updated_at,
//                 url_suffix: elm.url_suffix
//             })));
//         }, 1000);
//     });
// }
export const getAllArticle :() => Promise<Article[]> = unstable_cache(
    async () => {
        const res = await fetch(`${process.env.BACKEND_URL}/articles/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if (!res.ok) {
            throw new Error('Failed to fetch articles');
        }
        const data = await res.json();
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(data.map((elm: any) => ({
                    id: elm.id,
                    title: elm.title,
                    content: elm.content.replace(/\\n/g, '\n'),
                    date: elm.updated_at,
                    url_suffix: elm.url_suffix
                })));
            }, 1000);
        });
    },
    ['all-posts'],
    {
        revalidate: 86400,
        tags: ['all-posts'],
    }
)

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
