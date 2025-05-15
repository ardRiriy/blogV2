import { Suspense } from "react";
import ArticleList from "@/components/articleList";
import { Separator } from "@/components/ui/separator"
import { randomInt } from "crypto";

function welcomeMessage(): String {
    const hour = new Date().getHours();
    let timeGreet = "";
    if (hour >= 5 && hour < 12) {
        timeGreet = "おはようございます☕️";
    } else if (hour >= 12 && hour < 18) {
        timeGreet = "こんにちは☀️";
    } else {
        timeGreet = "こんばんは🌙";
    }
    const welecomeMessageSets = [
        "うぇるかむ✨",
        timeGreet,
        "はろ～🙌",
        "👋",
    ];

    return welecomeMessageSets[randomInt(welecomeMessageSets.length)];
}

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const currentPageNumber = params.page ? parseInt(params.page, 10) : 1;
    return (
        <Suspense fallback={<div>wait a minute..</div>}>
            <h2 className="text-center text-xl my-3">{welcomeMessage()}</h2>
            <h4 className="text-center text-md"> ardririyの足跡 </h4>
            <Separator className="my-15" />
            <ArticleList page={currentPageNumber} />
            <Separator className="my-15" />
        </Suspense>
    );
}
