import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserAuth } from '@/context/authContext';
import { supabase } from '@/supabaseClient';
import {
  Calendar,
  Camera,
  Check,
  Edit2,
  Loader2,
  Mail,
  MapPin,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    id?: string;
    name: string; // This maps to full_name or name
    username: string;
    email: string;
    avatar: string; // This maps to avatar_url
    bio?: string;
    location?: string;
    created_at?: string;
  };
}

export function ProfileDialog({
  open,
  onOpenChange,
  user,
}: ProfileDialogProps) {
  const { fetchUserProfile, userProfile } = UserAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback if user is undefined (prevents crashes)
  const userData = user || {
    name: 'Guest',
    username: 'guest',
    email: 'guest@example.com',
    avatar: '',
    bio: '',
    location: '',
  };

  const [formData, setFormData] = useState({
    name: userData.name,
    username: userData.username,
    bio: userData.bio || '',
    location: userData.location || '',
    avatar: userData.avatar,
  });

  // Reset form data when user prop changes or dialog opens
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username,
        bio: user.bio || '',
        location: user.location || '',
        avatar: user.avatar,
      });
    }
  }, [user, open]);

  // Also sync with userProfile context when it updates (e.g., after save)
  useEffect(() => {
    if (userProfile && open) {
      setFormData((prev) => ({
        ...prev,
        avatar: userProfile.avatar_url || prev.avatar,
        bio: userProfile.bio || prev.bio,
        location: userProfile.location || prev.location,
      }));
    }
  }, [userProfile, open]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log('Starting image upload...', {
      fileName,
      filePath,
      fileSize: file.size,
    });

    try {
      setIsUploading(true);
      const { error: uploadError } = await supabase.storage
        .from('bracuForum_profile')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful! Getting public URL...');

      const {
        data: { publicUrl },
      } = supabase.storage.from('bracuForum_profile').getPublicUrl(filePath);

      // Add cache-busting parameter to force browser to reload
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      console.log('Avatar URL generated:', avatarUrl);
      console.log('Current formData.avatar:', formData.avatar);

      setFormData((prev) => {
        console.log('Updating formData with new avatar:', avatarUrl);
        return { ...prev, avatar: avatarUrl };
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('Saving profile changes...', formData);

      const updates: Record<string, string> = {
        full_name: formData.name,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        avatar_url: formData.avatar,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userProfile?.id);

      if (error) throw error;

      await fetchUserProfile(); // Refresh context
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);

      const pgError = error as { code?: string; message?: string };

      // Check for missing column error (PostgREST code PGRST204 or specific message)
      if (
        pgError.code === 'PGRST204' ||
        pgError.message?.includes('Could not find the')
      ) {
        try {
          console.warn(
            'Extended columns missing, attempting partial update...'
          );
          // Fallback: update only guaranteed columns
          const { error: fallbackError } = await supabase
            .from('profiles')
            .update({
              full_name: formData.name,
              username: formData.username,
            })
            .eq('id', userProfile?.id);

          if (fallbackError) throw fallbackError;

          alert(
            'Profile name updated. Bio, Location, and Avatar could not be saved because the database is missing these columns. Please run the migration script.'
          );
          await fetchUserProfile();
          setIsEditing(false);
          return;
        } catch (retryError) {
          console.error('Fallback update failed:', retryError);
          alert('Failed to save profile changes.');
        }
      } else {
        alert(`Failed to save profile changes: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: userData.name,
      username: userData.username,
      bio: userData.bio || '',
      location: userData.location || '',
      avatar: userData.avatar,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        {/* Header / Banner Background */}
        <DialogTitle className="sr-only">Profile Details</DialogTitle>
        <DialogDescription className="sr-only">
          View and edit your profile information
        </DialogDescription>
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
                  src={formData.avatar}
                  alt={formData.name}
                  className="object-cover"
                  onError={(e) => {
                    console.error(
                      'Avatar image failed to load:',
                      formData.avatar
                    );
                    console.error('Image error event:', e);
                  }}
                  onLoad={() => {
                    console.log(
                      'Avatar image loaded successfully:',
                      formData.avatar
                    );
                  }}
                />
                <AvatarFallback className="text-2xl font-bold bg-muted">
                  {formData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md border-2 border-background"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Camera className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className=""
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="gap-2"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className=""
                >
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
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="h-9"
                      type="text"
                    />
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
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="h-9"
                      type="text"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label
                      htmlFor="location"
                      className="text-xs text-muted-foreground"
                    >
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="h-9"
                      placeholder="e.g. Dhaka, Bangladesh"
                      type="text"
                    />
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

              {formData.location && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{formData.location}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined{' '}
                  {userData.created_at
                    ? new Date(userData.created_at).toLocaleDateString(
                        'en-US',
                        {
                          month: 'long',
                          year: 'numeric',
                        }
                      )
                    : 'Recently'}
                </span>
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
                  placeholder="Tell us about yourself"
                />
              ) : (
                <p className="text-sm leading-relaxed text-foreground/90">
                  {formData.bio || 'No bio provided.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
