// 型定義
export interface Article {
    id: string;
    title: string;
    content: string;
    date: string;
}

export async function getArticle(id: string): Promise<Article> {
    const res = await fetch(`${process.env.BACKEND_URL}/article/${id}`, {
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
                content: data.content,
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

export function getArticleList(page: number): Promise<ArticleList[]> {
    // mockする
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1, title: 'TsukuCTF2025 Writeup', date: '2025-05-04',
                    url: "aaa"
                },
                {
                    id: 2, title: 'ICPC Japan Domestic 2023 D', date: '2025-04-25',
                    url: "ddd"
                },
                {
                    id: 3, title: 'Starters183 P4 - Complete MST', date: '2025-04-25',
                    url: "fff"
                },
                {
                    id: 4, title: 'ABC402E - Payment Required', date: '2025-04-20',
                    url: "eee"
                },
                {
                    id: 5, title: 'Codechef Starters181 Div.2', date: '2025-04-10',
                    url: "bb"
                },
                {
                    id: 6, title: 'ABC400', date: '2025-04-06',
                    url: "cc"
                },
                {
                    id: 7, title: 'Educational Codeforces Round177', date: '2025-04-04',
                    url: "Addwg"
                }
            ]);
        }, 1000);
    });
}