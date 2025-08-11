import { Geist, Geist_Mono, M_PLUS_Rounded_1c  } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import AdryFooter from "@/components/footer";

const mPlusRounded1c = M_PLUS_Rounded_1c ({
  subsets: ["latin"],
  display: 'swap',
  weight: "500"
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={mPlusRounded1c.className}>
      <body>
        <div className="mx-auto w-full px-6 xs:px-7 sm:px-10 max-w-screen-md mt-9">
          {children}

        </div>
        <AdryFooter />

      </body>
    </html>
  );
}