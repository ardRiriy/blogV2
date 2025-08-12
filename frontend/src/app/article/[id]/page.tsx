import FadeIn from "@/components/fadein";
import StylishLoading from "@/components/loading";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getArticle } from "@/lib/api";
import Link from "next/link";
import { Suspense } from "react";

interface ArticlePageProps {
    params: Promise<{
        id: string;
    }>;
}

async function Article({ id }: { id: string }) {
    const article = await getArticle(id);

    return (
        <div className="mx-auto w-full px-6 xs:px-7 sm:px-10 max-w-screen-md mt-9">
            <div className="pt-24 md:pt-28 prose prose-slate dark:prose-invert">
                <FadeIn>
                    <h1 className="text-center">{article.title}</h1>
                </FadeIn>
                <FadeIn delay={150}>
                    <p className="text-center">{new Date(article.date).toLocaleDateString()}</p>
                </FadeIn>
                <FadeIn delay={300}>
                    <MarkdownRenderer content={article.content} />
                </FadeIn>
            </div>
        </div>
    );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { id } = await params;

    return (
        <Suspense fallback={<StylishLoading />}>
            <Article id={id} />
            <Link href={'/list'}>
                <div className="text-center text-5 mt-20 text-gray-400">
                    記事一覧へ
                </div>
            </Link>
        </Suspense>
    )
}

export async function generateMetadata({ params }: ArticlePageProps) {
    const { id } = await params;
    const article = await getArticle(id);
    return {
        title: article.title,
        description: article.content.slice(0, 100),
    };
}