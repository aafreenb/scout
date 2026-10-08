"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  ChevronRight,
  Command,
  Loader2,
  MapPin,
  Plus,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";

import {
  Business,
  createBusiness,
  getBusinesses,
} from "@/lib/api";

export default function BusinessDashboard() {
  const searchParams = useSearchParams();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    industry: "",
    city: "",
  });

  const [creating, setCreating] = useState(false);

  async function loadBusinesses() {
    try {
      setLoading(true);
      setError("");

      const data = await getBusinesses();
      setBusinesses(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load businesses"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowCreate(true);
    }
  }, [searchParams]);

  const filteredBusinesses = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return businesses;
    }

    return businesses.filter((business) =>
      [
        business.name,
        business.industry,
        business.city,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [businesses, search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name || !form.industry || !form.city) {
      return;
    }

    try {
      setCreating(true);
      setError("");

      const business = await createBusiness(form);

      setBusinesses((current) => [
        business,
        ...current,
      ]);

      setForm({
        name: "",
        industry: "",
        city: "",
      });

      setShowCreate(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create business"
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0c0c0b] text-[#e8e6df]">
      {/* Top navigation */}
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center border border-white/20 text-[10px] font-medium">
                S
              </div>

              <span className="text-sm font-medium tracking-[0.18em]">
                SCOUT
              </span>
            </div>

            <span className="hidden text-[10px] uppercase tracking-[0.2em] text-white/30 sm:block">
              Client Intelligence
            </span>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="group flex items-center gap-2 border border-white/15 px-3 py-2 text-[10px] uppercase tracking-[0.16em] transition hover:border-white/30 hover:bg-white/[0.04]"
          >
            <Plus size={13} strokeWidth={1.5} />
            Add prospect
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-10 lg:px-10">
        {/* Hero */}
        <section className="relative overflow-hidden border border-white/[0.08] bg-[#111110]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(196,155,85,0.12),transparent_35%)]" />

          <div className="relative grid min-h-[300px] grid-cols-1 lg:grid-cols-[1fr_280px]">
            <div className="flex flex-col justify-between p-7 lg:p-10">
              <div>
                <p className="mb-5 text-[10px] uppercase tracking-[0.24em] text-[#b99a63]">
                  Workspace / 001
                </p>

                <h1 className="max-w-3xl font-serif text-5xl leading-[0.95] tracking-[-0.03em] text-white md:text-6xl">
                  Find the right
                  <br />
                  clients.
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-6 text-white/45">
                  Research businesses, identify opportunities,
                  track decision makers and turn observations into
                  outreach.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-white/30">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b99a63]" />
                Prospect intelligence system
              </div>
            </div>

            <div className="border-t border-white/[0.08] lg:border-l lg:border-t-0">
              <div className="flex h-full flex-col justify-between p-7">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-white/30">
                    Database
                  </p>

                  <p className="mt-3 font-serif text-6xl text-white">
                    {businesses.length
                      .toString()
                      .padStart(2, "0")}
                  </p>

                  <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/35">
                    Businesses tracked
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.08] pt-5">
                  <span className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                    Status
                  </span>

                  <span className="flex items-center gap-2 text-[9px] uppercase tracking-[0.15em] text-emerald-400/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="mt-8 flex flex-col justify-between gap-4 border-b border-white/[0.08] pb-5 md:flex-row md:items-center">
          <div>
            <p className="text-[9px] uppercase tracking-[0.22em] text-white/25">
              Prospect database
            </p>

            <h2 className="mt-2 font-serif text-2xl text-white">
              Businesses
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                size={14}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search businesses..."
                className="h-9 w-64 border border-white/[0.1] bg-white/[0.025] pl-9 pr-10 text-xs text-white outline-none placeholder:text-white/20 focus:border-white/25"
              />

              <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-[8px] uppercase tracking-wider text-white/20 sm:flex">
                <Command size={10} />
                K
              </div>
            </div>
          </div>
        </section>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-5 flex items-center justify-between border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-xs text-red-300/80"
            >
              <span>{error}</span>

              <button
                onClick={() => setError("")}
                className="text-white/30 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Business list */}
        <section className="mt-5">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center border border-white/[0.07]">
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-white/30">
                <Loader2
                  size={14}
                  className="animate-spin"
                />
                Loading intelligence
              </div>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center border border-dashed border-white/[0.1] text-center">
              <Building2
                size={25}
                strokeWidth={1}
                className="text-white/20"
              />

              <p className="mt-4 font-serif text-xl text-white/70">
                {search
                  ? "No prospects found"
                  : "Your database is empty"}
              </p>

              <p className="mt-2 max-w-sm text-xs leading-5 text-white/30">
                {search
                  ? "Try a different search term."
                  : "Add your first business to start building your client intelligence database."}
              </p>

              {!search && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-5 flex items-center gap-2 border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[0.16em] hover:bg-white/[0.04]"
                >
                  <Plus size={13} />
                  Add first prospect
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-px overflow-hidden border border-white/[0.07] bg-white/[0.07] md:grid-cols-2 xl:grid-cols-3">
              {filteredBusinesses.map((business, index) => (
                <motion.div
                  key={business.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.035,
                    duration: 0.3,
                  }}
                >
                  <Link
                    href={`/businesses/${business.id}`}
                    className="group block h-full bg-[#0c0c0b] p-6 transition hover:bg-[#111110]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-9 w-9 items-center justify-center border border-white/[0.1] text-white/40 transition group-hover:border-[#b99a63]/40 group-hover:text-[#b99a63]">
                        <Building2
                          size={16}
                          strokeWidth={1.2}
                        />
                      </div>

                      <ArrowUpRight
                        size={15}
                        strokeWidth={1.2}
                        className="text-white/15 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/50"
                      />
                    </div>

                    <div className="mt-8">
                      <p className="font-serif text-2xl tracking-[-0.02em] text-white">
                        {business.name}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[9px] uppercase tracking-[0.16em] text-white/30">
                        <span>{business.industry}</span>

                        <span className="h-1 w-1 rounded-full bg-white/15" />

                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {business.city}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-white/[0.07] pt-4">
                      <span className="text-[9px] uppercase tracking-[0.15em] text-white/20">
                        Prospect #
                        {business.id
                          .toString()
                          .padStart(3, "0")}
                      </span>

                      <span className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-white/25 transition group-hover:text-[#b99a63]">
                        Open
                        <ChevronRight size={11} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !creating && setShowCreate(false)}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.98,
              }}
              className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-white/[0.1] bg-[#111110] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-[#b99a63]">
                    New record
                  </p>

                  <h3 className="mt-1 font-serif text-2xl text-white">
                    Add prospect
                  </h3>
                </div>

                <button
                  disabled={creating}
                  onClick={() => setShowCreate(false)}
                  className="text-white/25 transition hover:text-white"
                >
                  <X size={17} strokeWidth={1.5} />
                </button>
              </div>

              <form
                onSubmit={handleCreate}
                className="space-y-5 p-6"
              >
                <Field
                  label="Business name"
                  placeholder="e.g. Rambagh Palace"
                  value={form.name}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      name: value,
                    }))
                  }
                />

                <Field
                  label="Industry"
                  placeholder="e.g. Hospitality"
                  value={form.industry}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      industry: value,
                    }))
                  }
                />

                <Field
                  label="City"
                  placeholder="e.g. Jaipur"
                  value={form.city}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      city: value,
                    }))
                  }
                />

                <button
                  type="submit"
                  disabled={creating}
                  className="flex h-11 w-full items-center justify-center gap-2 bg-[#e8e6df] text-[10px] font-medium uppercase tracking-[0.18em] text-[#0c0c0b] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2
                        size={13}
                        className="animate-spin"
                      />
                      Creating
                    </>
                  ) : (
                    <>
                      Create prospect
                      <ArrowUpRight size={13} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-white/30">
        {label}
      </span>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="h-11 w-full border border-white/[0.1] bg-white/[0.025] px-3 text-sm text-white outline-none placeholder:text-white/15 focus:border-[#b99a63]/50"
      />
    </label>
  );
}