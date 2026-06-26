import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

const FPS = 30;
const DURATION_IN_SECONDS = 5;
const DURATION_IN_FRAMES = FPS * DURATION_IN_SECONDS;

// Phase timings (in frames)
const FADE_IN_END = FPS * 1;       // 0‑1 s
const CURSOR_START = FPS * 1;      // 1 s
const CURSOR_END = FPS * 2.5;      // 2.5 s
const CLICK_START = FPS * 2.5;     // 2.5 s
const CLICK_END = FPS * 3.5;       // 3.5 s
const REVEAL_END = FPS * 5;        // 5 s

const Video: React.FC = () => {
  const currentFrame = useCurrentFrame();
  const { width, height, fps: videoFps } = useVideoConfig();

  // ----- Progress (0‑1) for each phase -----
  const fadeInProgress = interpolate(currentFrame, [0, FADE_IN_END], [0, 1]);
  const cursorProgress = interpolate(currentFrame, [CURSOR_START, CURSOR_END], [0, 1]);
  const clickProgress = interpolate(currentFrame, [CLICK_START, CLICK_END], [0, 1]);
  const revealProgress = interpolate(currentFrame, [CLICK_END, REVEAL_END], [0, 1]);

  // ----- Cursor motion (spring) -----
  const springX = spring({
    frame: currentFrame,
    fps: videoFps,
    from: width - 20,
    to: width / 2,
    config: { damping: 20, stiffness: 200 },
  });

  const springY = spring({
    frame: currentFrame,
    fps: videoFps,
    from: height - 20,
    to: height / 2,
    config: { damping: 20, stiffness: 200 },
  });

  // ----- Cursor scale (pop‑then‑shrink) -----
  const scale = spring({
    frame: currentFrame,
    fps: videoFps,
    from: 1,
    to: 0,
    config: { damping: 20, stiffness: 200 },
  });

  // ----- Wave radius (expanding circle) -----
  const maxRadius = Math.hypot(width, height);
  const waveRadius = interpolate(currentFrame, [CLICK_START, CLICK_END], [0, maxRadius]);

  // ----- Text animation -----
  const textOpacity = fadeInProgress;
  const textYOffset = interpolate(currentFrame, [0, FADE_IN_END], [20, 0]); // slight up‑fade
  const revealTextY = interpolate(currentFrame, [CLICK_END, REVEAL_END], [0, -20]); // final lift‑up
  const developerOpacity = interpolate(currentFrame, [CLICK_END, REVEAL_END], [0, 1]);

  // Clip‑path for the expanding white‑background mask
  const clipPath = `circle(${waveRadius}px at ${springX}px ${springY}px)`;

  return (
    <>
      {/* Bottom layer: black background + white text */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#000",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          opacity: textOpacity,
          transform: `translateY(${textYOffset}px)`,
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 48,
            letterSpacing: 2,
          }}
        >
          kiover.dll
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: "'Helvetica Neue', sans-serif",
            fontSize: 28,
            color: "#777",
            opacity: developerOpacity,
            transform: `translateY(${revealTextY}px)`,
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          Developer
        </div>
      </div>

      {/* Top layer: white background + black text, masked by expanding circle */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
          color: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          clipPath,
        }}
      >
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 48,
            letterSpacing: 2,
          }}
        >
          kiover.dll
        </div>
        <div
          style={{
            marginTop: 20,
            fontFamily: "'Helvetica Neue', sans-serif",
            fontSize: 28,
            color: "#333",
            opacity: developerOpacity,
            transform: `translateY(${revealTextY}px)`,
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          Developer
        </div>
      </div>

      {/* Cursor (white circle with glow) */}
      <div
        style={{
          position: "absolute",
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#fff",
          boxShadow: "0 0 8px rgba(255,255,255,0.7)",
          left: springX - 6, // offset by half size
          top: springY - 6,
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      />
    </>
  );
};

export default Video;