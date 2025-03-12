import { Check, ChevronDown, X } from 'lucide-react';
import {
  type ComponentProps,
  type KeyboardEvent,
  forwardRef,
  useEffect,
  useId,
  useState,
} from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/cn';

export type Tag = {
  label: string;
  value: string;
};

interface TagInputProps extends Omit<ComponentProps<'input'>, 'type'> {
  tags: Tag[];
  selectedValues?: string[];
  onTagsChange?: (tags: Tag[]) => void;
}

const TagInput = forwardRef<HTMLInputElement, TagInputProps>(
  ({ className, id, tags = [], selectedValues = [], onTagsChange, ...props }, ref) => {
    const [selectedTags, setSelectedTags] = useState<Tag[]>(
      tags.filter((tag) => selectedValues.includes(tag.value)),
    );
    const [inputValue, setInputValue] = useState('');
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const tagInputId = useId();

    const handleFocus = () => {
      document.getElementById(id ? `${tagInputId}-${id}` : tagInputId)?.focus();
    };

    const handleBlur = () => {
      document.getElementById(id ? `${tagInputId}-${id}` : tagInputId)?.blur();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !inputValue) {
        setSelectedTags((prev) => prev.slice(0, -1));
      }
    };

    const handleToggleTag = (tag: Tag) => {
      if (selectedTags.some((selectedTag) => selectedTag.value === tag.value)) {
        setSelectedTags((prev) => prev.filter((t) => t.value !== tag.value));
      } else {
        setSelectedTags((prev) => [...prev, tag]);
      }
      setInputValue('');
    };

    const onPopoverOpenChange = (open: boolean) => {
      if (document.querySelector(':focus')?.localName === 'input' && !open) {
        setIsPopoverOpen(true);
        return;
      }

      setIsPopoverOpen(open);
    };

    useEffect(() => {
      onTagsChange?.(selectedTags);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTags]);

    return (
      <Popover open={isPopoverOpen} onOpenChange={onPopoverOpenChange}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'flex cursor-text flex-wrap items-center gap-2 rounded-md border border-input px-3 has-[input:focus-visible]:ring-1 has-[input:focus-visible]:ring-ring',
              { 'py-2': selectedTags.length !== 0 },
              className,
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleFocus}
          >
            {selectedTags.map((tag) => (
              <Badge key={`${tagInputId}-badge-${tag.value}`} className="flex items-center gap-1">
                {tag.label}
                <X
                  className="size-4 cursor-pointer text-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTags((prev) => prev.filter((t) => t.value !== tag.value));
                  }}
                />
              </Badge>
            ))}
            <input
              id={id ? `${tagInputId}-${id}` : tagInputId}
              ref={ref}
              type="text"
              value={inputValue}
              className={cn(
                'flex flex-1 bg-transparent text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground invalid:border-danger focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                { 'h-9': selectedTags.length === 0 },
                className,
              )}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              {...props}
            />
            {selectedTags.length === 0 && (
              <div className="size-4">
                <ChevronDown className="size-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-[--radix-popover-trigger-width] flex-col p-1"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {tags
            .filter(
              (tag) => !inputValue || tag.label.toLowerCase().includes(inputValue.toLowerCase()),
            )
            .map((tag) => (
              <Button
                key={`${tagInputId}-option-${tag.value}`}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleToggleTag(tag)}
              >
                <div className="size-4">
                  {selectedTags.some((selectedTags) => selectedTags.value === tag.value) && (
                    <Check className="size-4" />
                  )}
                </div>
                {tag.label}
              </Button>
            ))}
        </PopoverContent>
      </Popover>
    );
  },
);

TagInput.displayName = 'TagInput';

export { TagInput };
