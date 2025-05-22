import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { visit } from 'unist-util-visit';
import { Node } from 'unist';

interface WikiLinkNode extends Node {
    type: 'wikiLink';
    value: string;
}

function remarkWikiLink() {
  return (tree: Node) => {
    visit(tree, 'text', (node: any, index, parent: any) => {
      const regex = /!\[\[([^\]]+)\]\]/g;
      let match;
      let lastIndex = 0;
      const newNodes = [];

      while ((match = regex.exec(node.value)) !== null) {
        const [fullMatch, imageName] = match;

        // マッチ前のテキスト部分
        if (match.index > lastIndex) {
          newNodes.push({ type: 'text', value: node.value.slice(lastIndex, match.index) });
        }

        // WikiLink を通常の画像ノードに変換 (例)
        // ここで basePath などを考慮してパスを構築する
        const imagePath = `./images/${imageName}`; // 例: images フォルダ配下を想定
        newNodes.push({
          type: 'image',
          url: imagePath,
          alt: imageName, // alt テキストは適宜設定
        });
        // もしくは、カスタムノードとして扱うことも可能
        // newNodes.push({ type: 'wikiLink', value: imageName } as WikiLinkNode);

        lastIndex = regex.lastIndex;
      }

      // マッチ後の残りのテキスト部分
      if (lastIndex < node.value.length) {
        newNodes.push({ type: 'text', value: node.value.slice(lastIndex) });
      }

      // ノードを置き換える
      if (newNodes.length > 0 && parent && typeof index === 'number') {
        parent.children.splice(index, 1, ...newNodes);
        return index + newNodes.length; // 次のインデックスを返す
      }
    });
  };
}

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
                remarkPlugins={[remarkGfm, remarkMath, remarkWikiLink]}
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