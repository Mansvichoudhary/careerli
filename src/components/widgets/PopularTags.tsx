import { Button } from "@/components/ui/button";

interface PopularTagsProps {
  tags: string[];
  onSelectTag: (tag: string) => void;
}

const PopularTags = ({ tags, onSelectTag }: PopularTagsProps) => {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-foreground">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Button
            key={tag}
            variant="outline"
            size="sm"
            className="text-xs transition-all duration-200 hover:border-primary/40 hover:bg-primary/10"
            onClick={() => onSelectTag(tag)}
          >
            #{tag}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PopularTags;
