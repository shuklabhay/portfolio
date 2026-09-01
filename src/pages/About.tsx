import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import { contactData, getContactLink } from "../utils/contactData";
import { shouldSkipEntryAnimation, useEntryFade } from "../utils/useEntryFade";
import { getLastPathname, isBlogPostPath } from "../utils/routeTransitions";
import type { RouteTransitionState } from "../utils/types";

export default function About(): JSX.Element {
  const location = useLocation();
  const transitionState = location.state as RouteTransitionState | null;
  const entryFadeDecisionByLocationKeyRef = useRef<{
    key: string;
    shouldAnimate: boolean;
  } | null>(null);

  if (entryFadeDecisionByLocationKeyRef.current?.key !== location.key) {
    const lastPathname = getLastPathname();
    entryFadeDecisionByLocationKeyRef.current = {
      key: location.key,
      shouldAnimate:
        transitionState?.fromTopNav === true ||
        transitionState?.fromPost === true ||
        (lastPathname ? isBlogPostPath(lastPathname) : false),
    };
  }

  const shouldAnimateEntry =
    (entryFadeDecisionByLocationKeyRef.current?.shouldAnimate ?? false) &&
    !shouldSkipEntryAnimation() &&
    !(
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
    );
  const entryFadeStyle = useEntryFade(shouldAnimateEntry, 450);

  const rawEmail = getContactLink(contactData, "Email");
  const email = rawEmail ? `mailto:${rawEmail}` : undefined;
  const twitter = getContactLink(contactData, "Twitter");
  const youtube = getContactLink(contactData, "YouTube");
  const github = getContactLink(contactData, "GitHub");

  return (
    <main
      style={{
        ...entryFadeStyle,
        paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
      }}
    >
      <PageTitle
        title="Hi, I'm Abhay"
        subtitle={
          <div
            className="about-subtitle"
            style={{
              color: "#f7f8fb",
              lineHeight: 1.6,
              marginTop: "0.5rem",
              fontSize: "1.1rem",
            }}
          >
            <p style={{ marginTop: 0, marginBottom: "1rem" }}>
              I've been <strong>manipulating computers since I was 9:</strong>{" "}
              making video games,{" "}
              <strong>producing many musical genres,</strong> programming audio
              effects, building circuts, training neural networks, designing
              webapps, and much more,{" "}
              <strong>almost entirely self-taught!</strong>
            </p>

            <p style={{ marginTop: 0, marginBottom: "1rem" }}>
              I hope to spend my life doing{" "}
              <strong>interesting, imaginative things</strong> that have never
              been done before but are{" "}
              <strong>overwhelmingly worth doing,</strong>{" "}
              <Link
                to="/blog/rcbi"
                viewTransition
                state={{ fromBlog: true, fromPath: "/about" }}
                className="about-contact-link"
              >
                regardless of form or function.
              </Link>{" "}
            </p>

            <p style={{ marginTop: 0, marginBottom: "0.5rem" }}>
              Previously I've:
            </p>
            <ul
              style={{ marginTop: 0, paddingLeft: "1.25rem", lineHeight: 1.5 }}
            >
              <li>
                Simulated{" "}
                <strong>breast/lung tissue and vascular hemodynamics </strong>{" "}
                using PDEs & neural networks
              </li>

              <li>
                Built{" "}
                <a
                  href="https://raw.githubusercontent.com/shuklabhay/shuklabhay.github.io/refs/heads/main/public/static/sitedata/vt_poster.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-contact-link"
                >
                  multimodal agents
                </a>{" "}
                to translate songs, and marketing agents to reach a million
                listeners
              </li>

              <li>
                (Rapid fire:) <strong>Simulated rodent neurons,</strong>{" "}
                post-trained language models, built/sold RL envs
              </li>

              <li>
                (In my youth:) Wrote code/apps for a <strong>FRC team;</strong>{" "}
                taught elementary schoolers{" "}
                <a
                  href="https://bayareastemacademy.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-contact-link"
                >
                  to vibecode
                </a>
              </li>
            </ul>
            <p style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              I'm primarily <strong>motivated by/curious about:</strong>
            </p>
            <ul
              style={{ marginTop: 0, paddingLeft: "1.25rem", lineHeight: 1.5 }}
            >
              <li>
                Analyzing systems,{" "}
                <strong>understanding the incomplete/unknown</strong>, and doing
                so <strong>regardless of field or form.</strong> I value finding{" "}
                <strong>common threads</strong> across far-flung ideas and
                building <strong>lasting, transferrable intuition.</strong>
              </li>
              <li>
                Rowing, <strong>caring about each and every element</strong> of
                each and every thing I work on, but also steering, zooming out
                and adjusting when{" "}
                <strong>pieces don't serve the whole.</strong>
              </li>
              <li>
                The <strong>fundamentally new possibilities</strong> associated
                with neural networks &amp; agents; the chance to{" "}
                <strong>
                  better understand ourselves, our world, and the nature of
                  intelligence
                </strong>{" "}
                as we teach machines to perceive and interact with the world.
              </li>
              <li>
                <strong>Being human:</strong> living life, making
                mistake/memories, <strong>facing fears,</strong> learning to{" "}
                <strong>understand and appreciate oneself.</strong> I believe
                it's incredibly important to{" "}
                <strong>understand one's self</strong> &amp; goals, then{" "}
                <strong>push past every superficial barrier.</strong>
              </li>
              <li style={{ marginTop: "0.45rem" }}>
                <strong>Thinking</strong>, dreaming, listening, imagining;{" "}
                <strong>understanding and telling stories.</strong>
              </li>
            </ul>
            <p
              style={{
                marginTop: "1.5rem",
                marginBottom: 0,
                paddingBottom: "0.3rem",
              }}
            >
              <a href={email} className="about-contact-link">
                <strong>Email</strong>
              </a>{" "}
              |{" "}
              <a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="about-contact-link"
              >
                <strong>Twitter</strong>
              </a>{" "}
              |{" "}
              <a
                href={youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="about-contact-link"
              >
                <strong>YouTube</strong>
              </a>{" "}
              |{" "}
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="about-contact-link"
              >
                <strong>GitHub</strong>
              </a>
            </p>
          </div>
        }
      />
    </main>
  );
}
