import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Eduta - Learn, Grow, Succeed";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: "bold",
              marginBottom: 20,
            }}
          >
            Eduta
          </div>
          <div
            style={{
              fontSize: 40,
              opacity: 0.9,
            }}
          >
            Learn, Grow, Succeed
          </div>
          <div
            style={{
              fontSize: 28,
              marginTop: 40,
              opacity: 0.8,
            }}
          >
            World-class online courses for everyone
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

