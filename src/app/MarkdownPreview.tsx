import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Define the props type
interface MarkdownPreviewProps {
  content: string; // Specify the type for content
}

// マークダウンプレビューコンポーネント
const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  return (
    <div className="markdown-preview">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // スタイリングのためのカスタムコンポーネント
          h1: (props) => <h1 className="h3 mb-3" {...props} />,
          h2: (props) => <h2 className="h4 mb-3" {...props} />,
          h3: (props) => <h3 className="h5 mb-3" {...props} />,
          p: (props) => <p className="mb-3" {...props} />,
          ul: (props) => <ul className="mb-3" {...props} />,
          ol: (props) => <ol className="mb-3" {...props} />,
          li: (props) => <li className="mb-1" {...props} />,
          code: ({ inline, ...props }) => 
            inline ? 
              <code className="px-1 py-0.5 bg-light rounded" {...props} /> : 
              <pre className="p-3 bg-light rounded"><code {...props} /></pre>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;