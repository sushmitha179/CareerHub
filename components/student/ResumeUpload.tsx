"use client";

import { useRef, useState } from "react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const ACCEPT = ".pdf,.doc,.docx";

type ResumeMeta = {
  hasResume: boolean;
  resumeFileName?: string | null;
  resumeUploadedAt?: string | null;
};

type Props = {
  initial: ResumeMeta;
  onChange?: (meta: ResumeMeta) => void;
};

type UploadStatus =
  | "idle"
  | "uploading"
  | "success"
  | "error"
  | "deleting";

export default function ResumeUpload({
  initial,
  onChange,
}: Props) {

  const inputRef = useRef<HTMLInputElement>(null);

  const [meta, setMeta] = useState<ResumeMeta>(initial);

  const [status, setStatus] =
    useState<UploadStatus>("idle");

  const [message, setMessage] = useState("");

  function updateMeta(next: ResumeMeta) {
    setMeta(next);
    onChange?.(next);
  }

  async function uploadFile(file: File) {

    setStatus("uploading");
    setMessage("");

    try {

      const uploadFormData = new FormData();
      uploadFormData.append("files", file);

      const uploadRes = await fetch("/api/uploadthing", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("UploadThing upload failed");
      }

      const uploadData = await uploadRes.json();

      const uploadedUrl =
        uploadData?.[0]?.url ||
        uploadData?.data?.[0]?.url;

      if (!uploadedUrl) {
        throw new Error("No uploaded URL returned");
      }

      const formData = new FormData();

      formData.append("file", file);

      formData.append("uploadedUrl", uploadedUrl);

      const res = await fetch("/api/student/resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Upload failed");
        return;
      }

      const next: ResumeMeta = {
        hasResume: true,
        resumeFileName: data.resumeFileName,
        resumeUploadedAt: data.resumeUploadedAt,
      };

      updateMeta(next);

      setStatus("success");

      setMessage("Resume uploaded successfully");

    } catch (error) {

      console.error(error);

      setStatus("error");

      setMessage("Upload failed. Please try again.");

    } finally {

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function onFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (file) uploadFile(file);
  }

  async function removeResume() {

    if (!confirm("Remove your uploaded resume?")) {
      return;
    }

    setStatus("deleting");

    setMessage("");

    try {

      const res = await fetch(
        "/api/student/resume",
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(
          data.error || "Failed to remove resume"
        );
        return;
      }

      updateMeta({ hasResume: false });

      setStatus("success");

      setMessage("Resume removed");

    } catch {

      setStatus("error");

      setMessage("Failed to remove resume");
    }
  }

  const busy =
    status === "uploading" ||
    status === "deleting";

  return (
    <div className="border rounded-xl p-5 bg-gray-50 space-y-4">

      <div>
        <h2 className="text-lg font-semibold">
          Resume
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          PDF, DOC, or DOCX · max 5 MB · visible to
          companies you apply to
        </p>
      </div>

      {meta.hasResume ? (

        <div className="bg-white border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <p className="font-medium text-gray-800">
              {meta.resumeFileName || "resume.pdf"}
            </p>

            {meta.resumeUploadedAt && (
              <p className="text-xs text-gray-500 mt-1">
                Uploaded{" "}
                {new Date(
                  meta.resumeUploadedAt
                ).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">

            <a
              href="/api/student/resume"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              View / Download
            </a>

            <button
              type="button"
              disabled={busy}
              onClick={() =>
                inputRef.current?.click()
              }
              className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Replace
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={removeResume}
              className="px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>

      ) : (

        <div
          className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition"
          onClick={() =>
            !busy && inputRef.current?.click()
          }
        >

          <p className="text-gray-600 mb-2">
            Drop or click to upload resume
          </p>

          <p className="text-xs text-gray-400">
            PDF, DOC, DOCX up to 5 MB
          </p>

          <button
            type="button"
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Uploading..." : "Choose file"}
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={onFileChange}
      />

      {status === "uploading" && (
        <p className="text-sm text-blue-600">
          Uploading resume...
        </p>
      )}

      {status === "deleting" && (
        <p className="text-sm text-gray-500">
          Removing resume...
        </p>
      )}

      {message && (
        <p
          className={`text-sm ${
            status === "error"
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}