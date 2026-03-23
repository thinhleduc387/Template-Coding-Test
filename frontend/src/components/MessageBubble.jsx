import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ImageGrid({ images }) {
  const count = images.length;
  if (count === 0) return null;

  const imgClass = "w-full h-full object-cover";

  if (count === 1) {
    return (
      <img
        src={images[0].localUrl || images[0].fileUrl}
        alt={images[0].fileName}
        className="w-full max-h-72 object-cover rounded-xl"
      />
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden">
        {images.map((img, i) => (
          <img key={i} src={img.localUrl || img.fileUrl} alt={img.fileName} className={`${imgClass} h-40`} />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden">
        <img src={images[0].localUrl || images[0].fileUrl} alt={images[0].fileName} className={`${imgClass} h-40 col-span-2`} />
        {images.slice(1).map((img, i) => (
          <img key={i} src={img.localUrl || img.fileUrl} alt={img.fileName} className={`${imgClass} h-32`} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-0.5 rounded-xl overflow-hidden">
      {images.slice(0, 4).map((img, i) => (
        <div key={i} className="relative h-32">
          <img src={img.localUrl || img.fileUrl} alt={img.fileName} className={`${imgClass} h-32`} />
          {i === 3 && count > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold text-xl">+{count - 4}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FileChip({ file, isUser }) {
  return (
    <a
      href={file.fileUrl}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors ${
        isUser
          ? "bg-white/15 hover:bg-white/25 text-white"
          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
      }`}
    >
      <span className="text-base leading-none shrink-0">📎</span>
      <span className="truncate max-w-48">{file.fileName}</span>
    </a>
  );
}

export default function MessageBubble({ message, showCursor = false }) {
  const isUser = message.senderType === "user";
  const attachments = message.attachments || [];
  const images = attachments.filter((a) => a.fileType?.startsWith("image/"));
  const files = attachments.filter((a) => !a.fileType?.startsWith("image/"));

  const displayContent =
    message.content === "(sent a file)" && attachments.length > 0 ? "" : message.content;

  const hasImages = images.length > 0;
  const hasFiles = files.length > 0;
  const hasText = !!displayContent;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col gap-1.5 max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>

        {hasImages && (
          <div className="w-full max-w-72">
            <ImageGrid images={images} />
          </div>
        )}

        {hasFiles && (
          <div className="flex flex-col gap-1 w-full">
            {files.map((f, i) => <FileChip key={i} file={f} isUser={isUser} />)}
          </div>
        )}

        {(hasText || showCursor) && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              isUser
                ? "bg-indigo-500 text-white rounded-br-sm"
                : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap wrap-break-word">{displayContent}</p>
            ) : (
              <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-pre:my-2 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-indigo-600 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:rounded-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
              </div>
            )}
            {showCursor && (
              <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 align-text-bottom animate-pulse" />
            )}
            {message.createdAt && (
              <span className={`block text-[10px] mt-1.5 text-right ${isUser ? "opacity-55" : "text-gray-400"}`}>
                {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        )}

        {!hasText && !showCursor && message.createdAt && (
          <span className="text-[10px] text-gray-400 px-1">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
