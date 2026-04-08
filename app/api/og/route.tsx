import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Dynamic props from URL
    const title = searchParams.has("title")
      ? searchParams.get("title")
      : "Marathi Weekly Newspaper";
      
    // Default to "Latest Edition" if no date
    const rawDate = searchParams.get("date");
    let displayDate = "Latest Edition";
    
    if (rawDate) {
      try {
        displayDate = new Date(rawDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch (e) {
        // Fallback to raw string if parsing fails
        displayDate = rawDate;
      }
    }

    const type = searchParams.get("type") === "special" ? "SPECIAL EDITION" : "WEEKLY EDITION";
    const bgColor = searchParams.get("type") === "special" ? "#ffb600" : "#93000b"; // Secondary Amber vs Primary Red
    const textColor = searchParams.get("type") === "special" ? "#4a2c00" : "#ffffff";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: bgColor,
            padding: "80px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Subtle Background Pattern / Box */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "40px",
              right: "40px",
              bottom: "40px",
              border: `4px solid ${textColor}`,
              opacity: 0.2,
              borderRadius: "24px",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: textColor,
              zIndex: 10,
            }}
          >
            {/* Top Label */}
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                marginBottom: 24,
                padding: "8px 24px",
                border: `3px solid ${textColor}`,
                borderRadius: "50px",
              }}
            >
              {type}
            </div>

            {/* Main Brand Title */}
            <h1
              style={{
                fontSize: 100,
                fontWeight: 900,
                margin: "0 0 24px 0",
                lineHeight: 1.1,
                textShadow: "0 10px 20px rgba(0,0,0,0.2)",
              }}
            >
              Vikrand Times
            </h1>

            {/* Edition Date / Title */}
            <p
              style={{
                fontSize: 48,
                fontWeight: 600,
                margin: 0,
                opacity: 0.9,
              }}
            >
              {title === "Marathi Weekly Newspaper" ? displayDate : title}
            </p>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 80,
              fontSize: 32,
              fontWeight: 700,
              color: bgColor,
              backgroundColor: textColor,
              padding: "16px 48px",
              borderRadius: "100px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            Read Free Now
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("OG Error:", e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
