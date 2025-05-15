import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';


interface MarkdownRendererProps {
    content: string;
}

const AnchorTag = ({ node, children, ...props }: any) => {
    try {
        new URL(props.href ?? "");
        props.target = "_blank";
        props.rel = "noopener noreferrer";
    } catch (e) { }
    return <a {...props}>{children}</a>;
}

const CodeBlock = ({ inline, className, children, }: any) => {
    if (inline) {
        return <code className={className}>{children}</code>;
    }

    const match = /language-(\w+)/.exec(className || '');
    if (!match) {
        return <code className={className}>{children}</code>;
    }

    const lang = match && match[1] ? match[1] : '';

    return (
        <SyntaxHighlighter
            style={atomDark}
            language={lang}
        >
            {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
    );
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {

    return (
        <div className="markdown-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                    a: AnchorTag,
                    code: CodeBlock,
                }}
            >
                {content}
            </ReactMarkdown>
        </div >
    );
};

export default MarkdownRenderer;