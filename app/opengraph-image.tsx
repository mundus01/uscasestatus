import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "uscasestatus.com — Check your USCIS case status";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#FAFAFA",
          color: "#14211D",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
          <span>uscase</span>
          <span style={{ color: "#0F6E56" }}>status</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          Check your USCIS case status — and actually understand it
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "#5A6864",
            maxWidth: 800,
          }}
        >
          Live status, plain English, what to do next. Free. No account needed.
        </div>
      </div>
    ),
    { ...size },
  );
}
