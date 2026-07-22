import { useCallback, useEffect, useRef, useState } from "react";
import { useClient } from "sanity";

import { scrubJpeg } from "./scrub";

/**
 * The GUI path for getting a shoot into the archive: drop the JPEGs, pick a
 * sheet, done. Each file is scrubbed in the browser (same surgery as
 * scripts/scrub-location.mjs) before a single byte is uploaded, so an
 * unscrubbed export cannot leak GPS or serials by mistake.
 *
 * Frames are created published, in filename order, and appended to the
 * chosen series. Re-dropping the same files is safe — existing ids are
 * recognised, not duplicated. Alt text still has to be written by hand.
 */

type SeriesOption = { _id: string; title: string; sheetNumber: string | null };

type ItemStatus = "대기" | "스크럽" | "업로드" | "완료" | "이미 있음" | "실패";
type Item = { name: string; status: ItemStatus; detail?: string };

const API_VERSION = "2026-07-01";

const STATUS_COLOR: Record<ItemStatus, string> = {
  대기: "#8a8a85",
  스크럽: "#b98700",
  업로드: "#b98700",
  완료: "#1a7f37",
  "이미 있음": "#8a8a85",
  실패: "#c8102e",
};

export function BatchUploadTool() {
  const client = useClient({ apiVersion: API_VERSION });
  const [seriesList, setSeriesList] = useState<SeriesOption[]>([]);
  const [seriesId, setSeriesId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    client
      .fetch<SeriesOption[]>(
        `*[_type == "series"] | order(sheetNumber desc) { _id, title, sheetNumber }`,
      )
      .then(setSeriesList)
      .catch(() => setSeriesList([]));
  }, [client]);

  const patchItem = (index: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  const processFiles = useCallback(
    async (incoming: File[]) => {
      const files = incoming
        .filter((f) => /\.jpe?g$/i.test(f.name))
        .sort((a, b) => a.name.localeCompare(b.name));
      if (files.length === 0 || busy) return;

      setBusy(true);
      setSummary(null);
      setItems(files.map((f) => ({ name: f.name, status: "대기" as const })));

      const ids: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          patchItem(i, { status: "스크럽" });
          const bytes = new Uint8Array(await file.arrayBuffer());
          const { out, removed } = scrubJpeg(bytes);
          const detail = removed.length > 0 ? `지움: ${removed.join(", ")}` : "지울 것 없음";

          const frameRef = file.name.replace(/\.[^.]+$/, "");
          const id = `photo-${frameRef.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

          const exists = await client.fetch<string | null>("*[_id == $id][0]._id", { id });
          if (exists) {
            patchItem(i, { status: "이미 있음" });
            ids.push(id);
            continue;
          }

          patchItem(i, { status: "업로드", detail });
          const asset = await client.assets.upload(
            "image",
            new File([out as BlobPart], file.name, { type: "image/jpeg" }),
          );
          await client.createIfNotExists({
            _id: id,
            _type: "photo",
            frameRef,
            image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
            slug: { _type: "slug", current: id },
            select: false,
          });
          ids.push(id);
          patchItem(i, { status: "완료", detail });
        } catch (err) {
          patchItem(i, {
            status: "실패",
            detail: err instanceof Error ? err.message : String(err),
          });
        }
      }

      let text = `${ids.length}컷 등록.`;
      if (seriesId && ids.length > 0) {
        try {
          const current =
            (await client.fetch<string[] | null>("*[_id == $id][0].frames[]._ref", {
              id: seriesId,
            })) ?? [];
          const fresh = ids.filter((id) => !current.includes(id));
          if (fresh.length > 0) {
            await client
              .patch(seriesId)
              .setIfMissing({ frames: [] })
              .append(
                "frames",
                fresh.map((id) => ({
                  _key: `frame-${id}`,
                  _type: "reference",
                  _ref: id,
                })),
              )
              .commit();
          }
          const s = seriesList.find((x) => x._id === seriesId);
          text += ` 「${s?.title ?? "시리즈"}」에 ${fresh.length}컷 연결.`;
        } catch {
          text += " 시리즈 연결에 실패했습니다 — 시리즈 문서에서 직접 추가해주세요.";
        }
      }
      text += " 각 프레임의 대체 텍스트를 채워주세요.";
      setSummary(text);
      setBusy(false);
    },
    [busy, client, seriesId, seriesList],
  );

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px", fontSize: 14, lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>일괄 업로드</h1>
      <p style={{ opacity: 0.7, marginTop: 4 }}>
        JPEG을 끌어다 놓으면 GPS·시리얼 같은 위험한 메타데이터를 지운 뒤 업로드하고,
        선택한 시트에 촬영 순서대로 연결합니다. 노출값·촬영일은 남겨서 시트에 자동
        표시됩니다.
      </p>

      <label style={{ display: "block", margin: "20px 0 4px", fontWeight: 600 }}>
        연결할 시트
      </label>
      <select
        value={seriesId}
        onChange={(e) => setSeriesId(e.target.value)}
        disabled={busy}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 4 }}
      >
        <option value="">연결 안 함 — 프레임만 등록</option>
        {seriesList.map((s) => (
          <option key={s._id} value={s._id}>
            Sheet {s.sheetNumber ?? "—"} · {s.title}
          </option>
        ))}
      </select>

      <div
        role="button"
        tabIndex={0}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void processFiles(Array.from(e.dataTransfer.files));
        }}
        style={{
          marginTop: 16,
          padding: "48px 20px",
          textAlign: "center",
          border: `2px dashed ${dragOver ? "#1a7f37" : "#999"}`,
          borderRadius: 8,
          cursor: busy ? "wait" : "pointer",
          opacity: busy ? 0.6 : 1,
          background: dragOver ? "rgba(26,127,55,0.06)" : "transparent",
        }}
      >
        {busy
          ? "처리 중… 창을 닫지 마세요"
          : "여기에 JPEG을 끌어다 놓거나, 눌러서 파일을 고르세요"}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,image/jpeg"
          style={{ display: "none" }}
          onChange={(e) => {
            void processFiles(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {summary && (
        <p
          style={{
            marginTop: 16,
            padding: "10px 12px",
            borderRadius: 4,
            background: "rgba(26,127,55,0.1)",
            border: "1px solid rgba(26,127,55,0.4)",
          }}
        >
          {summary}
        </p>
      )}

      {items.length > 0 && (
        <ul style={{ marginTop: 16, listStyle: "none", padding: 0 }}>
          {items.map((it) => (
            <li
              key={it.name}
              style={{
                display: "flex",
                gap: 12,
                padding: "6px 0",
                borderBottom: "1px solid rgba(128,128,128,0.2)",
              }}
            >
              <span style={{ fontFamily: "monospace", flexShrink: 0 }}>{it.name}</span>
              <span style={{ color: STATUS_COLOR[it.status], flexShrink: 0 }}>
                {it.status}
              </span>
              {it.detail && (
                <span style={{ opacity: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {it.detail}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: 24, opacity: 0.55, fontSize: 12 }}>
        RAW·HEIC는 받지 않습니다 — 라이트룸에서 JPEG으로 내보낸 뒤 올리세요. 같은
        파일을 다시 올려도 중복되지 않습니다.
      </p>
    </div>
  );
}
