'use client';

// import styles from '@/styles/chat.module.scss';
// import 'bootstrap/dist/css/bootstrap.css';

import { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Loader from './Loader';
import { Mermaid } from './Mermaid';

type MarkdownRequiredProps = {
  text: string,
}

type MarkdownOptionalProps = {
  // Some output types won't be rendered until the loading phase is complete.
  isLoading: boolean,
  onRenderComplete: (() => void) | undefined,
};

type MarkdownProps = MarkdownRequiredProps & MarkdownOptionalProps;

const defaultProps: MarkdownOptionalProps = {
  isLoading: false,
  onRenderComplete: undefined
}

export default function Markdown(props: MarkdownProps) {
  props.isLoading 
  return (
    <ReactMarkdown
      children={props.text}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        ul(props) {
          return <ul {...props} className="list-group" />;
        },
        li(props) {
          return <li {...props} className="list-group-item" />;
        },
        pre(preProps) {
          const { children, ...rest } = preProps;

          if (preProps.children) {
            const children = preProps.children as ReactElement;
            if (children.props) {
              if (children.props.className === 'language-mermaid') {
                if (props.isLoading) {
                  return <Loader message="Generating diagram..." />
                } else {
                  return <Mermaid chart={children.props.children.toString()} onRenderComplete={props.onRenderComplete} />;
                }
              }
            }
          }
          return (
              //className={styles.codeMarkdown}>
            <pre {...rest}>
              {children}
            </pre>
          );
        },
        code({ className, children, ref: _ref, ...props }) {
          const match = /language-(\w+)/.exec(className || '');

          return match ? (
            <SyntaxHighlighter
              {...props}
              style={dracula}
              PreTag="div"
              language={match[1]}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    />
  );
};

Markdown.defaultProps = defaultProps;
