'use client';

import { UserAuth } from '@/context/authContext';
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Hash, Loader2, Plus, X } from 'lucide-react';

const categories = [
  'CSE Department',
  'EEE Department',
  'BBA Department',
  'Architecture',
  'ROBU',
  'BUCC',
  'General',
];

const suggestedTags = [
  '#help',
  '#discussion',
  '#events',
  '#career',
  '#study',
  '#memes',
];

export function CreateThreadDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPoll, setIsPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);

  const { userProfile } = UserAuth();

  // Helper to reset form
  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('');
    setTags([]);
    setTagInput('');
    setIsPoll(false);
    setPollOptions(['', '']);
  };

  const addTag = (tag: string) => {
    const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!tags.includes(formattedTag) && tags.length < 5) {
      setTags([...tags, formattedTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!userProfile) {
      alert('Please log in to create a thread');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('threads').insert({
        title: title.trim(),
        content: content.trim(),
        category: category,
        tags: tags,
        is_poll: isPoll, // FIXED: Snake case
        // poll_options: isPoll
        //   ? pollOptions.filter((opt) => opt.trim() !== '')
        //   : null,
        created_by: userProfile.id, // FIXED: Matches your table REFERENCES auth.users(id)
      });

      if (error) throw error;

      // Reset and Close
      resetForm();
      setOpen(false);
      window.dispatchEvent(new Event('thread-created'));
      console.log('Thread created successfully!');
    } catch (error) {
      console.error('Error creating thread:', error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Thread</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader className={undefined}>
          <DialogTitle className={undefined}>Create New Thread</DialogTitle>
          <DialogDescription className={undefined}>
            Start a discussion with the BRACU community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className={undefined}>
              Title
            </Label>
            <Input
              id="title"
              placeholder="What's on your mind?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={undefined}
              type={undefined}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className={undefined}>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={undefined}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className={undefined}>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className={undefined}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className={undefined}>
              Content
            </Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className={undefined}>Tags (max 5)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="pl-9"
                  type={undefined}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => tagInput.trim() && addTag(tagInput.trim())}
                className={undefined}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Poll Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className={undefined}>Add a Poll</Label>
              <p className="text-sm text-muted-foreground">
                Let the community vote
              </p>
            </div>
            <Switch
              checked={isPoll}
              onCheckedChange={setIsPoll}
              className={undefined}
            />
          </div>

          {/* Poll Options */}
          {isPoll && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label className={undefined}>Poll Options</Label>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    className={undefined}
                    type={undefined}
                  />
                  {pollOptions.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePollOption(index)}
                      className={undefined}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {pollOptions.length < 6 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPollOption}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className={undefined}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !category || loading}
            className={undefined}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Thread
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
