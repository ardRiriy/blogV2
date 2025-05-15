import { Suspense } from "react";
import ArticleList from "@/components/articleList";
import { Separator } from "@/components/ui/separator"

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const currentPageNumber = params.page ? parseInt(params.page, 10) : 1;
    return (
        <Suspense fallback={<div>wait a minute..</div>}>
            <Separator className="my-15" />
            <ArticleList page={currentPageNumber} />
            <Separator className="my-15" />
        </Suspense>
    );
}