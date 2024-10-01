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

type MarkdownProps =   {
  text: string,

  // Some output types won't be rendered until the loading phase is complete.
  isLoading?: boolean,
  
  onRenderComplete?: (() => void),
};;

export default function Markdown(props: MarkdownProps = {
  text: '',
  isLoading: false,
  onRenderComplete: undefined,
}) {
  return (
    <ReactMarkdown
      children={props.text}
      // skipHtml={true}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        title(props) {
          return <div className='text-5x pb-4 font-extrabold'>{props.children}</div>
        },
        h1(props) {
          return <>
            <div className='text-5x pb-4'>{props.children}</div>
            <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          </>
        },
        h2(props) {
          return <div className='text-4xl pb-4'>{props.children}</div>;
        },
        h3(props) {
          return <div className='text-3xl pb-4'>{props.children}</div>;
        },
        h4(props) {
          return <div className='text-2xl pb-4'>{props.children}</div>;
        },
        h5(props) {
          return <div className='text-xl pb-4'>{props.children}</div>;
        },
        ul(props) {
          return <ul {...props} className="list-group list-disc">{props.children}</ul>;
        },
        ol(props) {
          return <ol {...props} className="list-group list-decimal">{props.children}</ol>;
        },
        li(props) {
          return <li {...props} className="list-group-item ml-8">{props.children}</li>;
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
