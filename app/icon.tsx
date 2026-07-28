import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Matches the header/footer `.brand .mark` — navy square with CS. */
export default function Icon() {
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
          borderRadius: 8,
          color: "#ffffff",
          fontSize: 14,
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
