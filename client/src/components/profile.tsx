'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Mail, MapPin, Calendar, Edit2, Check, X } from 'lucide-react';
import React from 'react';

// 1. Update Props: accept open state from parent
interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    name: string;
    username: string;
    email: string;
    avatar: string;
    bio?: string;
    role?: string;
    joinedAt?: string;
  };
}

export function ProfileDialog({
  open,
  onOpenChange,
  user,
}: ProfileDialogProps) {
  const [isEditing, setIsEditing] = useState(false);

  // Fallback if user is undefined (prevents crashes)
  const userData = user || {
    name: 'Guest',
    username: 'guest',
    email: 'guest@example.com',
    avatar: '',
    bio: '',
  };

  const [formData, setFormData] = useState({
    name: userData.name,
    username: userData.username,
    bio: userData.bio || "I'm a student at BRAC University.",
    location: 'Dhaka, Bangladesh',
  });

  const handleSave = () => {
    console.log('Saving profile changes...', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userData.name,
      username: userData.username,
      bio: userData.bio || "I'm a student at BRAC University.",
      location: 'Dhaka, Bangladesh',
    });
  };

  return (
    // 2. Remove Trigger, use props for control
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 p-0 overflow-hidden gap-0">
        {/* Header / Banner Background */}
        <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-600 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 text-white/80 hover:text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 relative">
          {/* Avatar */}
          <div className="relative -mt-12 mb-4 flex justify-between items-end">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage
                  src={userData.avatar}
                  alt={userData.name}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-bold bg-muted">
                  {userData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md border-2 border-background"
                >
                  <Camera className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={handleCancel} className={undefined}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} className="gap-2">
                    <Check className="h-4 w-4" /> Save
                  </Button>
                </>
              ) : (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)} className={undefined}                >
                  <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Identity Section */}
            <div>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid gap-1">
                    <Label
                      htmlFor="name"
                      className="text-xs text-muted-foreground"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-9" type={undefined}                    />
                  </div>
                  <div className="grid gap-1">
                    <Label
                      htmlFor="username"
                      className="text-xs text-muted-foreground"
                    >
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="h-9" type={undefined}                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                      {formData.name}
                    </h2>
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                    >
                      Student
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">@{formData.username}</p>
                </>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid gap-4 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{userData.email}</span>
              </div>



              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined November 2025</span>
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                About
              </Label>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="min-h-20 text-sm resize-none"
                />
              ) : (
                <p className="text-sm leading-relaxed text-foreground/90">
                  {formData.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
