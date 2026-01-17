import { useState } from "react";
import { ThumbsUp, MessageSquare, Share2, Code2, MoreHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tag, getTagVariant } from "@/components/ui/tag";
import UserAvatar from "@/components/Avatar";
import CodeBlock from "@/components/CodeBlock";
import { motion } from "framer-motion";

interface PostCardProps {
  author: {
    name: string;
    avatar?: string;
    field: string;
  };
  timeAgo: string;
  title: string;
  content: string;
  tags: string[];
  image?: string;
  code?: {
    content: string;
    language: string;
    filename?: string;
  };
  likes: number;
  comments: number;
  isCodePost?: boolean;
}

const PostCard = ({
  author,
  timeAgo,
  title,
  content,
  tags,
  image,
  code,
  likes,
  comments,
  isCodePost = false,
}: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    if (liked) {
      setLikeCount((prev) => prev - 1);
    } else {
      setLikeCount((prev) => prev + 1);
    }
    setLiked(!liked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-5 card-hover"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={author.name} src={author.avatar} size="md" />
          <div>
            <h4 className="font-semibold text-foreground">{author.name}</h4>
            <p className="text-sm text-muted-foreground">
              {author.field} • {timeAgo}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

      {/* Content */}
      <p className="text-muted-foreground mb-4 leading-relaxed">{content}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <Tag key={tag} variant={getTagVariant(tag)}>
            #{tag}
          </Tag>
        ))}
      </div>

      {/* Image */}
      {image && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={image} alt="Post content" className="w-full h-auto" />
        </div>
      )}

      {/* Code Block */}
      {code && (
        <div className="mb-4">
          <CodeBlock
            code={code.content}
            language={code.language}
            filename={code.filename}
            showRunButton={isCodePost}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`gap-2 ${liked ? "text-primary" : "text-muted-foreground"}`}
          >
            <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            <span>{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span>{comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-primary hover:text-primary hover:bg-primary-soft"
        >
          {isCodePost ? (
            <>
              <Code2 className="h-4 w-4" />
              <span>Review Code</span>
            </>
          ) : (
            <>
              <Users className="h-4 w-4" />
              <span>Collaborate</span>
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default PostCard;
