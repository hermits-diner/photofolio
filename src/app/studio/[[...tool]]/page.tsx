import { NextStudio } from "next-sanity/studio";

import { isSanityConfigured } from "@/sanity/env";
import config from "../../../../sanity.config";

/**
 * The whole Studio, served from this app at /studio — one deploy, one login,
 * no separate hosting. It sits outside the (site) route group so the smooth
 * scroll wrapper and the page's own typography never reach it.
 */
export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

/** Sanity throws on an empty projectId, so say what to do instead. */
function NotConnected() {
  return (
    <main
      style={{
        maxWidth: "42rem",
        margin: "0 auto",
        padding: "4rem 1.5rem",
        fontFamily: "ui-monospace, monospace",
        lineHeight: 1.7,
      }}
    >
      <h1 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
        Sanity 프로젝트가 아직 연결되지 않았습니다
      </h1>
      <p style={{ marginBottom: "1rem" }}>
        터미널에서 아래를 실행한 뒤 <code>.env.local</code> 에 값을 채우고 개발
        서버를 다시 시작하세요.
      </p>
      <pre
        style={{
          background: "#141310",
          color: "#e9eae6",
          padding: "1rem",
          overflowX: "auto",
        }}
      >
        {`npx sanity login
npx sanity init --env .env.local`}
      </pre>
      <p style={{ marginTop: "1rem" }}>
        자세한 절차는 저장소의 <code>README.md</code> 에 있습니다. 그때까지 사이트는
        <code> src/data/roll.ts </code> 의 임시 데이터로 동작합니다.
      </p>
    </main>
  );
}

export default function StudioPage() {
  if (!isSanityConfigured) return <NotConnected />;
  return <NextStudio config={config} />;
}
