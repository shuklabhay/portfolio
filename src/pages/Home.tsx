import { Stack, Text, useMantineTheme } from "@mantine/core";
import { HomeBackground } from "../components/HomeBackground";
import { useScrollContext } from "../utils/scrollContext";
import { useEffect, useState } from "react";
import { calculateScrollProgressOpacity } from "../utils/scroll";

export default function Home({
  isMobile,
  isSafari,
}: {
  isMobile: boolean;
  isSafari: boolean;
}) {
  // Hooks and constants
  const theme = useMantineTheme();
  const { scrollInformation, setScrollProgress } = useScrollContext();
  const [darkWrapperOpacity, setDarkWrapperOpacity] = useState(1);
  const isClientAnimationSupported = isMobile || isSafari;

  // Scrolling control
  useEffect(() => {
    const handleScroll = () => {
      setDarkWrapperOpacity(
        scrollInformation.projectsPosition !== 0
          ? calculateScrollProgressOpacity(scrollInformation.projectsPosition)
          : 1,
      );

      // Update scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableDistance = documentHeight - windowHeight;
      const newProgress = (window.scrollY / scrollableDistance) * 100;
      setScrollProgress(Math.min(newProgress, 100));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollInformation.projectsPosition, setScrollProgress]);

  if (theme.colors.main) {
    return (
      <div>
        <Stack
          align="center"
          gap={2}
          h={"100svh"}
          style={{
            zIndex: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <HomeBackground lowResourceMode={isClientAnimationSupported} />

          <Stack
            align="center"
            gap={2}
            h={{ base: "95vh", sm: "90vh" }}
            w={"100%"}
            justify="center"
            p={{ base: "0 1rem", sm: 0 }}
          >
            <Text
              fz={{ base: 32, sm: 54 }}
              fw={700}
              ta="center"
              style={{
                mixBlendMode: "overlay",
                userSelect: "none",
              }}
            >
              Abhay Shukla
            </Text>
            <Text
              fz={{ base: 14, sm: 18 }}
              ta="center"
              w={{ base: "60%", sm: "65%" }}
              style={{
                mixBlendMode: "plus-lighter",
                userSelect: "none",
              }}
            >
              High School Student, AI Researcher, Roboticist, Digital Audio
              Producer, Full Stack Developer, Nonprofit Founder, Speaker, and
              Innovator.
            </Text>
          </Stack>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: `rgba(0, 0, 0, ${darkWrapperOpacity * 0.15})`,
              zIndex: 1,
              transform: "translateZ(0)",
              willChange: "opacity",
            }}
          />
        </Stack>
      </div>
    );
  }
  return null;
}
