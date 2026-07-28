import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — same CS mark as the site logo. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#131349",
          borderRadius: 40,
          color: "#ffffff",
          fontSize: 78,
          fontWeight: 600,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          letterSpacing: "-0.04em",
        }}
      >
        CS
      </div>
    ),
    { ...size },
  );
}
