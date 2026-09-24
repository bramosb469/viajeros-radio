"use client";

import { useState } from "react";

export function getYouTubeId(url: string): string | null {
  const m = url.match(
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([^#&?]*).*/
  );
  return m && m[2].length === 11 ? m[2] : null;
}

export default function VideoEmbed({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);
  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        Ver video
      </a>
    );
  }

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "640px",
          padding: 0,
          border: "none",
          cursor: "pointer",
          background: "#000",
          borderRadius: "8px",
          overflow: "hidden",
        }}
        aria-label={`Reproducir ${title}`}
      >
        <img
          src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
          alt={title}
          loading="lazy"
          style={{ width: "100%", display: "block" }}
        />
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "68px",
            height: "48px",
            background: "rgba(255,0,0,0.9)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              width: 0,
              height: 0,
              borderTop: "10px solid transparent",
              borderBottom: "10px solid transparent",
              borderLeft: "16px solid #fff",
              marginLeft: "4px",
            }}
          />
        </span>
      </button>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "640px",
        paddingBottom: "56.25%",
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          border: "none",
        }}
      />
    </div>
  );
}
