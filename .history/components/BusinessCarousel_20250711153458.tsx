import { MediaItem } from "@/types/supabase";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type BusinessCarouselProps = {
  media: MediaItem[];
  department: string;
};

export default function BusinessCarousel({ media, department }: BusinessCarouselProps) {
  if (!media || media.length === 0) {
    return (
      <div style={{ color: "#bbb", padding: "1rem" }}>
        No media available for {department}
      </div>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      slidesPerView={1}
      loop
      autoplay={{ delay: 3000 }}
      pagination={{ clickable: true }}
      navigation
      style={{ width: "100%", borderRadius: "12px" }}
    >
      {media.map((m) => (
        <SwiperSlide key={m.id}>
          <div
            style={{
              background: "#191c24",
              padding: 16,
              borderRadius: 12,
            }}
          >
            {m.img_url && (
              <img
                src={m.img_url}
                alt={m.title ?? ""}
                style={{
                  width: "100%",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            )}
            {m.video_url && (
              <video
                src={m.video_url}
                controls
                style={{
                  width: "100%",
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              />
            )}
            <div style={{ fontWeight: 600, color: "#fff" }}>
              {m.title}
            </div>
            <div style={{ fontSize: 13, color: "#9ae6b4" }}>
              {m.description}
            </div>
            {m.link_url && (
              <a
                href={m.link_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0af", fontSize: 14 }}
              >
                Visit
              </a>
            )}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
