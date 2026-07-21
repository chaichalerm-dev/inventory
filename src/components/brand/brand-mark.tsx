import { cn } from "@/lib/utils";

type BrandMarkProps = {
  logoUrl?: string | null;
  className?: string;
};

export function BrandMark({ logoUrl, className }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-[#101827]",
        className,
      )}
      aria-hidden="true"
    >
      {logoUrl ? (
        // Custom organization logos are local data URLs managed in settings.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="size-full object-cover" />
      ) : (
        <svg className="size-[82%]" viewBox="0 0 32 32" fill="none">
          <path fill="#49B6A4" d="M5 9 16 3.5 27 9 16 14.5 5 9Z" />
          <path fill="#F8FAFC" d="m5 11.5 10 5V28L5 22.7V11.5Z" />
          <path fill="#CBD5E1" d="m17 16.5 10-5v11.2L17 28V16.5Z" />
          <path fill="#F17755" d="M21.5 21.5H27V27h-5.5z" />
        </svg>
      )}
    </span>
  );
}
