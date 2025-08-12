import { M_PLUS_Rounded_1c  } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import AdryFooter from "@/components/footer";
import { Metadata } from "next";
const mPlusRounded1c = M_PLUS_Rounded_1c ({
  subsets: ["latin"],
  display: 'swap',
  weight: "500"
});

export const metadata: Metadata = {
  title: {
    template: '%s | ardririyの足跡',
    default: 'ardririyの足跡',
  },
  description: 'ardririyのブログ',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${mPlusRounded1c.className} bg-background`}>
      <body>
          <div className="mx-auto w-full px-6 xs:px-7 sm:px-10 max-w-screen-md mt-9">
            {children}

          </div>
          <AdryFooter />
      </body>
    </html>
  );
}