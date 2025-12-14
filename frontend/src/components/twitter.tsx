import Link from 'next/link';
import { FaTwitter } from 'react-icons/fa6'; // FaTwitterでも可

type Props = {
  text: string;
  url_suffix: string;
};

export const TwitterShareButton = ({ text, url_suffix }: Props) => {
  
  const articleUrl = `${process.env.PUBLISH_URL}/article/${url_suffix}`
  const tweetText = `${text.trim()}\n${articleUrl}`;

  const shareUrl = new URL('https://twitter.com/intent/tweet');
  shareUrl.searchParams.set('text', tweetText);
  
  return (
    <Link
      href={shareUrl.toString()}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-gray-800 transition-colors"
      aria-label="X (Twitter)で共有する"
    >
      <FaTwitter />
      <span className="text-sm font-bold">Post</span>
    </Link>
  );
};

