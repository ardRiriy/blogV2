import { Suspense } from "react";
import ArticleList from "@/components/articleList";

// サーバーコンポーネントでは、searchParamsを直接プロパティとして受け取れます
export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    // サーバーサイドでページ番号を計算
    const params = await searchParams;
    const currentPageNumber = params.page ? parseInt(params.page, 10) : 1;
    return (
        <Suspense fallback={<div>wait a minute..</div>}>
            <ArticleList page={currentPageNumber} />
        </Suspense>
    );
}