import { getArticleList } from "@/lib/api";
import Link from 'next/link';
import FadeIn from "./fadein";

// ページャーコンポーネント
function Pager({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
    const pages = [];
    const showPages = 5; // 表示するページ数
    
    // 表示するページ番号の範囲を計算
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    if (endPage - startPage + 1 < showPages) {
        startPage = Math.max(1, endPage - showPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    
    return (
        <div className="flex justify-center items-center space-x-2 mt-8 mb-8">
            {currentPage > 1 && (
                <Link 
                    href={currentPage === 2 ? "/list" : `/list?page=${currentPage - 1}`}
                    className="px-4 py-2 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors duration-200 font-medium shadow-sm"
                >
                    ← 前へ
                </Link>
            )}
            
            {startPage > 1 && (
                <>
                    <Link 
                        href="/"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors duration-200 font-medium"
                    >
                        1
                    </Link>
                    {startPage > 2 && (
                        <span className="text-pink-400">...</span>
                    )}
                </>
            )}
            
            {pages.map((pageNum) => (
                <Link
                    key={pageNum}
                    href={pageNum === 1 ? "/list" : `/list?page=${pageNum}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-colors duration-200 ${
                        pageNum === currentPage
                            ? "bg-pink-400 text-white shadow-md"
                            : "bg-pink-50 text-pink-600 hover:bg-pink-100"
                    }`}
                >
                    {pageNum}
                </Link>
            ))}
            
            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && (
                        <span className="text-pink-400">...</span>
                    )}
                    <Link 
                        href={`/list?page=${totalPages}`}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors duration-200 font-medium"
                    >
                        {totalPages}
                    </Link>
                </>
            )}
            
            {/* 次へボタン */}
            {currentPage < totalPages && (
                <Link 
                    href={`/list?page=${currentPage + 1}`}
                    className="px-4 py-2 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors duration-200 font-medium shadow-sm"
                >
                    次へ →
                </Link>
            )}
        </div>
    );
}

export default async function ArticleList({ page }: { page: number }) {
    const list = await getArticleList(page);
    const delaySize = 100;
    return (
        <div>
            {list.articles.map((elm, i) => {
                return (
                    <FadeIn delay={delaySize * i} key={i}>
                        <Link href={`/article/${elm.url}`}>
                            <div key={elm.id} className="mb-6 flex">
                                <div className="w-1 bg-accent mr-4"> 
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-medium text-gray-800">{elm.title}</h2>
                                    <span className="text-sm text-gray-600 mt-1">{elm.date}</span>
                                </div>
                            </div>
                        </Link>
                    </FadeIn>
                );
            })}
            
            {
                list.total_pages > 1 && (
                    <Pager currentPage={page} totalPages={list.total_pages} />
                )
            }
        </div>
    )
}

