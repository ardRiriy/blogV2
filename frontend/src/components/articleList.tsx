import { getArticleList } from "@/lib/api";
import FadeIn from "./fadein";

export default async function ArticleList({ page }: { page: number }) {
    const list = await getArticleList(page);
    const delaySize = 100;

    return (
        <div>
            {list.map((elm, i) => {
                return (
                    <FadeIn delay={delaySize * i} key={i}>
                        <div key={elm.id} className="mb-6 flex">
                            {/* Vertical line on the left */}
                            <div className="w-1 bg-gray-700 mr-4">
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-medium text-gray-800">{elm.title}</h2>
                                <span className="text-sm text-gray-600 mt-1">{elm.date}</span>
                            </div>
                        </div>
                    </FadeIn>
                );
            })}
        </div>
    )
}

