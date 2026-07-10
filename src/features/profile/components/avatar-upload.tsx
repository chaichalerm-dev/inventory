"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Upload, User } from "lucide-react";
import { updateAvatarAction } from "@/features/profile/actions";
import { useLanguage } from "@/lib/i18n/language-provider";
import { resizeImageToDataUrl } from "@/lib/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const MAX_DIMENSION = 256;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

export function AvatarUpload({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const { dict } = useLanguage();
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file next time
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(dict.profile.invalidImage);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast.error(dict.profile.imageTooLarge);
      return;
    }

    let dataUrl: string;
    try {
      dataUrl = await resizeImageToDataUrl(file, MAX_DIMENSION);
    } catch {
      toast.error(dict.profile.processError);
      return;
    }

    const previous = preview;
    setPreview(dataUrl);
    startTransition(async () => {
      const result = await updateAvatarAction({ avatarUrl: dataUrl });
      if (!result.ok) {
        toast.error(result.error);
        setPreview(previous);
        return;
      }
      toast.success(dict.profile.photoUpdated);
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await updateAvatarAction({ avatarUrl: null });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setPreview(null);
      toast.success(dict.profile.photoRemoved);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-20">
        {preview ? <AvatarImage src={preview} alt={name} /> : null}
        <AvatarFallback>
          <User className="size-8 text-muted-foreground" aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          {preview ? dict.profile.changePhoto : dict.profile.uploadPhoto}
        </Button>
        {preview ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={handleRemove}
          >
            <Trash2 className="size-4" />
            {dict.profile.removePhoto}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
