import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { FaGithub, FaTwitter } from "react-icons/fa6";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">

      <div> ardririyの足跡へようこそ </div>
      <div> 日記や競プロのことなどをゆるゆると更新します </div>
      
      <Separator className="my-10" />
        
      <div className="flex flex-col gap-4 w-full max-w-xs text-center">
        <Link 
          href="/list" 
          className="p-4 border rounded hover:bg-gray-100 transition-colors"
        >
          記事一覧
        </Link>

        <a 
          href="https://x.com/ardririy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-4 border rounded hover:bg-blue-50 text-blue-500 transition-colors inline-flex justify-center"
        >
          <FaTwitter />
          <div> 
           Twitter (@ardririy)
          </div>
        </a>

        <a 
          href="https://github.com/ardRiriy" 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-4 border rounded hover:bg-gray-800 hover:text-white transition-colors inline-flex justify-center"
        >
            <FaGithub />
            <div> GitHub (ardRiriy) </div>
        </a>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    return {
        title: "ardririyの足跡",
        description: '日記や競プロのことなどをゆるゆると更新します',
        openGraph: {
            title: "ardririyの足跡",
            description: '日記や競プロのことなどをゆるゆると更新します',
            url: `${process.env.PUBLISH_URL}/`,
            siteName: 'ardririyの足跡',
            locale: 'ja-JP',
            type: 'article',
        },
    };
}
