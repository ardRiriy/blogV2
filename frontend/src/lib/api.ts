// 型定義
export interface Article {
    id: string;
    title: string;
    content: string;
    date: string;
}

export function getArticle(id: string): Promise<Article> {
    // mockする
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                id,
                title: `Article ${id}`,
                content: `
## This is a markdown content.

### This is a subheading

- This is a list item
- This is a list item
- This is a list item

> This is a blockquote

[https://example.com](https://example.com)

<!-- This is a comment -->
\`\`\`js
console.log('Hello, world!');
\`\`\`
\`\`\`python
print('Hello, world!')
\`\`\`

$e=mc^2$

$$
\\sum_{i=1}^n i = \\frac{n(n+1)}{2} 
$$

---


footnotes are supported![^1]

[^1]: This is a footnote

This is a footnote[^2]
[^2]: This is a footnote too

This is a horizontal rule
This is a paragraph with **bold** and *italic* text.

`,
                date: new Date().toISOString(),
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