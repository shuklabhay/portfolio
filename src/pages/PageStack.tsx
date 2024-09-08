import { Container } from "@mantine/core";
import { useEffect, useRef } from "react";
import { scrollOffet, useScrollContext } from "../utils/scrollContext.tsx";
import Acomplishments from "./Acomplishments.tsx";
import Contact from "./Contact.tsx";
import Landing from "./Landing.tsx";
import Skills from "./Skills.tsx";

export default function PageStack() {
  // Hooks
  const { setScrollInformation } = useScrollContext();
  const landingRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const acomplishmentsRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Scroll control
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
    };

    scrollToTop();
    window.addEventListener("beforeunload", scrollToTop);

    return () => {
      window.removeEventListener("beforeunload", scrollToTop);
    };
  }, []);

  useEffect(() => {
    const updateScrollInformation = () => {
      if (
        landingRef.current &&
        skillsRef.current &&
        acomplishmentsRef.current &&
        contactRef.current
      ) {
        const newLandingPosition = landingRef.current.offsetTop - scrollOffet;
        const newSkillsPosition = skillsRef.current.offsetTop - scrollOffet;
        const newAcomplishmentsPosition =
          acomplishmentsRef.current.offsetTop - scrollOffet;
        const newContactPosition = contactRef.current.offsetTop - scrollOffet;
        const scrollTop = window.scrollY;
        const scrollBottom = scrollTop + window.innerHeight;

        setScrollInformation({
          landingPosition: newLandingPosition,
          skillsPosition: newSkillsPosition,
          acomplishmentsPosition: newAcomplishmentsPosition,
          contactPosition: newContactPosition,
          isLandingFocused: scrollTop < newSkillsPosition,
          isSkillsFocused:
            scrollTop >= newSkillsPosition &&
            scrollBottom < newAcomplishmentsPosition + window.innerHeight,
          isAcomplishmentsFocused:
            scrollTop >= newAcomplishmentsPosition &&
            scrollBottom < newContactPosition,
          isContactFocused: scrollBottom >= newContactPosition + scrollOffet,
        });
      }
    };

    updateScrollInformation();
    window.addEventListener("resize", updateScrollInformation);
    window.addEventListener("scroll", updateScrollInformation);

    return () => {
      window.removeEventListener("resize", updateScrollInformation);
      window.removeEventListener("scroll", updateScrollInformation);
    };
  }, [landingRef, acomplishmentsRef, contactRef]);

  return (
    <div>
      <div ref={landingRef}>
        <Landing />
      </div>

      <Container size="sx" ref={skillsRef}>
        <Skills />
      </Container>

      <Container size="sx" ref={acomplishmentsRef}>
        <Acomplishments />
      </Container>

      <Container size="sx" ref={contactRef}>
        <Contact />
      </Container>
    </div>
  );
}
