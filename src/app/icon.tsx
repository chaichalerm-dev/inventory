import { ImageResponse } from "next/og";
import { getSystemSettings } from "@/features/settings/queries";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
// A custom logo can be uploaded at any time (see settings), so this can't be
// baked in at build time — must re-read SystemSetting on every request.
export const dynamic = "force-dynamic";

// Browser-tab icon — mirrors the app shell's navy, white, and coral brand
// language, unless a custom organization logo has been uploaded in settings.
export default async function Icon() {
  // The favicon must never 500 — a database hiccup here would make every
  // open tab flash a broken icon even though the page itself may be fine.
  let logoUrl: string | null = null;
  try {
    ({ logoUrl } = await getSystemSettings());
  } catch {
    // Fall back to the default mark.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: "#101827",
          borderRadius: 4,
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            width={size.width}
            height={size.height}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
            <path fill="#49B6A4" d="M5 9 16 3.5 27 9 16 14.5 5 9Z" />
            <path fill="#F8FAFC" d="m5 11.5 10 5V28L5 22.7V11.5Z" />
            <path fill="#CBD5E1" d="m17 16.5 10-5v11.2L17 28V16.5Z" />
            <path fill="#F17755" d="M21.5 21.5H27V27h-5.5z" />
          </svg>
        )}
      </div>
    ),
    { ...size },
  );
}
