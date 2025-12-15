import { Suspense } from "react";
import ArticleList from "@/components/articleList";
import { Separator } from "@/components/ui/separator"
import StylishLoading from "@/components/loading";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const currentPageNumber = params.page ? parseInt(params.page, 10) : 1;
    return (
        <Suspense fallback={<StylishLoading />}>
            <Separator className="my-15" />
            <ArticleList page={currentPageNumber} />
            <Separator className="my-15" />
        </Suspense>
    );
}
