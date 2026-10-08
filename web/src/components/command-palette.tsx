"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Command,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Business = {
  id: number;
  name: string;
  industry: string;
  city: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function CommandPalette() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    fetch(`${API_URL}/businesses`)
      .then((response) => response.json())
      .then((data) => setBusinesses(data))
      .catch(() => setBusinesses([]));
  }, [open]);

  const filtered = businesses.filter((business) =>
    `${business.name} ${business.industry} ${business.city}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  function navigate(path: string) {
    setOpen(false);
    setQuery("");
    router.push(path);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 border border-white/10 bg-[#151514]/90 px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-white/30 shadow-xl backdrop-blur transition hover:border-white/20 hover:text-white/60"
      >
        <Command size={11} />
        Search
        <span className="ml-1 border border-white/10 px-1.5 py-0.5 text-[8px]">
          K
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: -15,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -15,
                scale: 0.98,
              }}
              className="fixed left-1/2 top-[15%] z-50 w-[calc(100%-32px)] max-w-2xl -translate-x-1/2 overflow-hidden border border-white/[0.1] bg-[#111110] shadow-2xl"
            >
              <div className="flex items-center border-b border-white/[0.08] px-5">
                <Search
                  size={16}
                  strokeWidth={1.5}
                  className="text-white/25"
                />

                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search businesses..."
                  className="h-14 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/20"
                />

                <button
                  onClick={() => setOpen(false)}
                  className="text-white/20 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-2">
                {/* Actions */}
                {!query && (
                  <div className="mb-2">
                    <p className="px-3 py-2 text-[8px] uppercase tracking-[0.2em] text-white/20">
                      Actions
                    </p>

                    <button
                      onClick={() => navigate("/?create=true")}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-white/[0.04]"
                    >
                      <Plus
                        size={14}
                        className="text-[#b99a63]"
                      />

                      <div>
                        <p className="text-xs text-white/70">
                          Add prospect
                        </p>

                        <p className="mt-0.5 text-[9px] text-white/25">
                          Create a new business record
                        </p>
                      </div>

                      <ArrowRight
                        size={12}
                        className="ml-auto text-white/15"
                      />
                    </button>
                  </div>
                )}

                <p className="px-3 py-2 text-[8px] uppercase tracking-[0.2em] text-white/20">
                  {query ? "Results" : "Businesses"}
                </p>

                {filtered.length === 0 ? (
                  <div className="px-3 py-8 text-center text-xs text-white/20">
                    No businesses found.
                  </div>
                ) : (
                  filtered.map((business) => (
                    <button
                      key={business.id}
                      onClick={() =>
                        navigate(`/businesses/${business.id}`)
                      }
                      className="flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-white/[0.04]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/[0.08]">
                        <Building2
                          size={14}
                          strokeWidth={1.2}
                          className="text-white/35"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs text-white/75">
                          {business.name}
                        </p>

                        <p className="mt-1 text-[8px] uppercase tracking-[0.15em] text-white/25">
                          {business.industry} ·{" "}
                          {business.city}
                        </p>
                      </div>

                      <ArrowRight
                        size={12}
                        className="ml-auto shrink-0 text-white/15"
                      />
                    </button>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.07] px-5 py-3">
                <span className="text-[8px] uppercase tracking-[0.16em] text-white/20">
                  SCOUT Command
                </span>

                <span className="text-[8px] uppercase tracking-[0.14em] text-white/20">
                  ESC to close
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}