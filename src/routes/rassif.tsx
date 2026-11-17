import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

const RASSIF_APP_URL = "https://rassif-ordering.suzy-309.chatgpt.site";

export const Route = createFileRoute("/rassif")({
  head: () => ({
    meta: [
      {
        title: "Rassif Ordering Application — Jahjah WebDigital",
      },
      {
        name: "description",
        content: "Open the Rassif restaurant ordering application.",
      },
    ],
  }),
  component: RassifRedirect,
});

function RassifRedirect() {
  useEffect(() => {
    window.location.replace(RASSIF_APP_URL);
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <p className="eyebrow text-primary">Rassif</p>
        <h1 className="display mt-4 text-4xl">
          Opening the ordering application…
        </h1>
        <p className="mt-4 text-muted-foreground">
          If it does not open automatically,{" "}
          <a className="text-primary underline" href={RASSIF_APP_URL}>
            continue to Rassif
          </a>
          .
        </p>
      </div>
    </main>
  );
}
