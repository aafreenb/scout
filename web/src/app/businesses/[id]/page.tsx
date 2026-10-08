"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  Edit3,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Target,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type Business = {
  id: number;
  name: string;
  industry: string;
  city: string;
  created_at: string;
  websites: Website[];
};

type Website = {
  id: number;
  url: string;
  created_at: string;
};

type Contact = {
  id: number;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
};

type Observation = {
  id: number;
  type: string;
  content: string;
};

type Opportunity = {
  id: number;
  title: string;
  description: string | null;
  status: string;
};

type Outreach = {
  id: number;
  contact_id: number | null;
  channel: string;
  status: string;
  notes: string | null;
  contacted_at: string | null;
};

type RecordType =
  | "business"
  | "website"
  | "contact"
  | "observation"
  | "opportunity"
  | "outreach";

type ModalState =
  | {
      mode: "create" | "edit";
      type: Exclude<RecordType, "business">;
      record?: Record<string, unknown>;
    }
  | {
      mode: "edit";
      type: "business";
      record: Business;
    }
  | null;

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [outreach, setOutreach] = useState<Outreach[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>(null);

  async function request<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const headers = new Headers(options?.headers);

    // Only send JSON content-type when the request
    // actually contains a body.
    if (options?.body) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(data?.message || "Something went wrong");
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        businessData,
        contactsData,
        observationsData,
        opportunitiesData,
        outreachData,
      ] = await Promise.all([
        request<Business>(`/businesses/${id}`),
        request<Contact[]>(`/businesses/${id}/contacts`),
        request<Observation[]>(`/businesses/${id}/observations`),
        request<Opportunity[]>(`/businesses/${id}/opportunities`),
        request<Outreach[]>(`/businesses/${id}/outreach`),
      ]);

      setBusiness(businessData);
      setContacts(contactsData);
      setObservations(observationsData);
      setOpportunities(opportunitiesData);
      setOutreach(outreachData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load business");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  async function deleteBusiness() {
    if (!business) return;

    const confirmed = window.confirm(
      `Delete ${business.name}? This will also delete its related records.`,
    );

    if (!confirmed) return;

    try {
      await request(`/businesses/${business.id}`, {
        method: "DELETE",
      });

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete business",
      );
    }
  }

  async function deleteRecord(endpoint: string, recordId: number) {
    const confirmed = window.confirm("Delete this record?");

    if (!confirmed) return;

    try {
      await request(`${endpoint}/${recordId}`, {
        method: "DELETE",
      });

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
    }
  }

  function openCreate(type: Exclude<RecordType, "business">) {
    setModal({
      mode: "create",
      type,
    });
  }

  function openEdit(
    type: RecordType,
    record: Record<string, unknown> | Business,
  ) {
    setModal({
      mode: "edit",
      type: type as any,
      record: record as any,
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0c0c0b] text-[#e8e6df]">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/30">
          Loading intelligence...
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-[#0c0c0b] p-10 text-white">
        <p className="text-red-300">{error || "Business not found"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0c0c0b] text-[#e8e6df]">
      {/* Header */}

      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6 lg:px-10">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/35 transition hover:text-white"
          >
            <ArrowLeft size={14} />
            Prospects
          </button>

          <div className="flex items-center gap-5">
            <button
              onClick={() => openEdit("business", business)}
              className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-white/25 transition hover:text-white"
            >
              <Edit3 size={12} />
              Edit
            </button>

            <button
              onClick={deleteBusiness}
              className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-white/20 transition hover:text-red-300"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-10 lg:px-10">
        {/* Business hero */}

        <section className="border border-white/[0.08] bg-[#111110]">
          <div className="grid lg:grid-cols-[1fr_300px]">
            <div className="p-7 lg:p-10">
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-[#b99a63]">
                <Building2 size={12} />
                Prospect #{business.id.toString().padStart(3, "0")}
              </div>

              <h1 className="mt-5 font-serif text-5xl tracking-[-0.03em] text-white md:text-6xl">
                {business.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-[0.16em] text-white/35">
                <span>{business.industry}</span>

                <span className="h-1 w-1 rounded-full bg-white/20" />

                <span className="flex items-center gap-1.5">
                  <MapPin size={11} />
                  {business.city}
                </span>
              </div>
            </div>

            <div className="border-t border-white/[0.08] lg:border-l lg:border-t-0">
              <div className="grid grid-cols-2 lg:grid-cols-1">
                <Stat label="Observations" value={observations.length} />

                <Stat label="Contacts" value={contacts.length} />

                <Stat label="Opportunities" value={opportunities.length} />

                <Stat label="Outreach" value={outreach.length} />
              </div>
            </div>
          </div>
        </section>

        {/* Error */}

        {error && (
          <div className="mt-5 flex items-center justify-between border border-red-400/20 bg-red-400/[0.04] px-4 py-3 text-xs text-red-300">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="text-white/30 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Intelligence grid */}

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* Websites */}

          <RecordSection
            label="01 / Websites"
            title="Web presence"
            icon={<Globe size={15} />}
            onAdd={() => openCreate("website")}
          >
            {business.websites.length === 0 ? (
              <EmptyState text="No websites recorded." />
            ) : (
              business.websites.map((website) => (
                <Record key={website.id}>
                  <div className="flex items-center justify-between gap-4">
                    <a
                      href={website.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-w-0 items-center text-sm text-white/70 transition hover:text-white"
                    >
                      <span className="truncate">{website.url}</span>

                      <ArrowUpRight
                        size={13}
                        className="ml-3 shrink-0 text-white/25"
                      />
                    </a>

                    <div className="flex items-center gap-3">
                      <EditButton
                        onClick={() => openEdit("website", website)}
                      />

                      <RecordActions
                        onDelete={() => deleteRecord("/websites", website.id)}
                      />
                    </div>
                  </div>
                </Record>
              ))
            )}
          </RecordSection>

          {/* Contacts */}

          <RecordSection
            label="02 / Contacts"
            title="Decision makers"
            icon={<UserRound size={15} />}
            onAdd={() => openCreate("contact")}
          >
            {contacts.length === 0 ? (
              <EmptyState text="No contacts recorded." />
            ) : (
              contacts.map((contact) => (
                <Record key={contact.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/75">{contact.name}</p>

                      {contact.role && (
                        <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-white/25">
                          {contact.role}
                        </p>
                      )}

                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="mt-2 block text-xs text-white/30 transition hover:text-[#b99a63]"
                        >
                          {contact.email}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-white/25 transition hover:text-[#b99a63]"
                        >
                          <Mail size={14} />
                        </a>
                      )}

                      <EditButton
                        onClick={() => openEdit("contact", contact)}
                      />

                      <RecordActions
                        onDelete={() => deleteRecord("/contacts", contact.id)}
                      />
                    </div>
                  </div>
                </Record>
              ))
            )}
          </RecordSection>

          {/* Observations */}

          <RecordSection
            label="03 / Observations"
            title="Research notes"
            icon={<MessageSquare size={15} />}
            onAdd={() => openCreate("observation")}
          >
            {observations.length === 0 ? (
              <EmptyState text="No observations recorded." />
            ) : (
              observations.map((observation) => (
                <Record key={observation.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.16em] text-[#b99a63]/70">
                        {observation.type}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-white/55">
                        {observation.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <EditButton
                        onClick={() => openEdit("observation", observation)}
                      />

                      <RecordActions
                        onDelete={() =>
                          deleteRecord("/observations", observation.id)
                        }
                      />
                    </div>
                  </div>
                </Record>
              ))
            )}
          </RecordSection>

          {/* Opportunities */}

          <RecordSection
            label="04 / Opportunities"
            title="Potential work"
            icon={<Target size={15} />}
            onAdd={() => openCreate("opportunity")}
          >
            {opportunities.length === 0 ? (
              <EmptyState text="No opportunities identified." />
            ) : (
              opportunities.map((opportunity) => (
                <Record key={opportunity.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/75">
                        {opportunity.title}
                      </p>

                      {opportunity.description && (
                        <p className="mt-2 text-xs leading-5 text-white/35">
                          {opportunity.description}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="border border-white/10 px-2 py-1 text-[8px] uppercase tracking-[0.14em] text-white/30">
                        {opportunity.status}
                      </span>

                      <EditButton
                        onClick={() => openEdit("opportunity", opportunity)}
                      />

                      <RecordActions
                        onDelete={() =>
                          deleteRecord("/opportunities", opportunity.id)
                        }
                      />
                    </div>
                  </div>
                </Record>
              ))
            )}
          </RecordSection>

          {/* Outreach */}

          <div className="lg:col-span-2">
            <RecordSection
              label="05 / Outreach"
              title="Relationship history"
              icon={<ArrowUpRight size={15} />}
              onAdd={() => openCreate("outreach")}
            >
              {outreach.length === 0 ? (
                <EmptyState text="No outreach recorded." />
              ) : (
                <div className="grid gap-px bg-white/[0.06] md:grid-cols-2">
                  {outreach.map((item) => (
                    <Record key={item.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] uppercase tracking-[0.16em] text-[#b99a63]">
                              {item.channel}
                            </span>

                            <span className="text-[8px] uppercase tracking-[0.14em] text-white/25">
                              {item.status}
                            </span>
                          </div>

                          {item.notes && (
                            <p className="mt-3 text-xs leading-5 text-white/40">
                              {item.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <EditButton
                            onClick={() => openEdit("outreach", item)}
                          />

                          <RecordActions
                            onDelete={() => deleteRecord("/outreach", item.id)}
                          />
                        </div>
                      </div>
                    </Record>
                  ))}
                </div>
              )}
            </RecordSection>
          </div>
        </div>
      </div>

      {/* Modal */}

      <AnimatePresence>
        {modal && (
          <RecordModal
            modal={modal}
            businessId={Number(id)}
            contacts={contacts}
            onClose={() => setModal(null)}
            onSaved={async () => {
              await loadData();
              setModal(null);
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

/* ------------------------------------------------ */
/* Stats                                            */
/* ------------------------------------------------ */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-b border-white/[0.07] p-5 last:border-b-0">
      <p className="text-[8px] uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-2 font-serif text-2xl text-white">
        {value.toString().padStart(2, "0")}
      </p>
    </div>
  );
}

/* ------------------------------------------------ */
/* Record Section                                   */
/* ------------------------------------------------ */

function RecordSection({
  label,
  title,
  icon,
  onAdd,
  children,
}: {
  label: string;
  title: string;
  icon: React.ReactNode;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-white/[0.08] bg-[#0f0f0e]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
        <div>
          <div className="flex items-center gap-2 text-[#b99a63]">
            {icon}

            <span className="text-[8px] uppercase tracking-[0.18em]">
              {label}
            </span>
          </div>

          <h2 className="mt-2 font-serif text-xl text-white">{title}</h2>
        </div>

        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.16em] text-white/25 transition hover:text-white"
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      <div>{children}</div>
    </section>
  );
}

/* ------------------------------------------------ */
/* Record                                           */
/* ------------------------------------------------ */

function Record({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-white/[0.06] p-5 last:border-b-0">
      {children}
    </div>
  );
}

/* ------------------------------------------------ */
/* Empty State                                      */
/* ------------------------------------------------ */

function EmptyState({ text }: { text: string }) {
  return <div className="p-5 text-xs text-white/20">{text}</div>;
}

/* ------------------------------------------------ */
/* Edit Button                                      */
/* ------------------------------------------------ */

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-white/15 transition hover:text-[#b99a63]"
      title="Edit"
    >
      <Edit3 size={13} />
    </button>
  );
}

/* ------------------------------------------------ */
/* Delete Button                                    */
/* ------------------------------------------------ */

function RecordActions({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      onClick={onDelete}
      className="text-white/15 transition hover:text-red-300"
      title="Delete"
    >
      <Trash2 size={13} />
    </button>
  );
}

/* ------------------------------------------------ */
/* Record Modal                                     */
/* ------------------------------------------------ */

function RecordModal({
  modal,
  businessId,
  contacts,
  onClose,
  onSaved,
}: {
  modal: NonNullable<ModalState>;
  businessId: number;
  contacts: Contact[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const isBusiness = modal.type === "business";
  const isEditing = modal.mode === "edit";

  const record = modal.record as Record<string, unknown> | undefined;

  const [form, setForm] = useState<Record<string, string>>(
    getInitialForm(modal),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const config = getModalConfig(modal, businessId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload: Record<string, unknown> = {
        ...form,
      };

      if (form.contact_id) {
        payload.contact_id = Number(form.contact_id);
      }

      const response = await fetch(`${API_URL}${config.endpoint}`, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.message ||
            `Failed to ${isEditing ? "update" : "create"} record`,
        );
      }

      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !saving && onClose()}
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
        className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto border border-white/[0.1] bg-[#111110]"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[#b99a63]">
              {isEditing ? "Edit record" : "New record"}
            </p>

            <h3 className="mt-1 font-serif text-2xl text-white">
              {config.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="text-white/25 transition hover:text-white"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-6">
          {config.fields.map(([key, label, placeholder]) => {
            if (modal.type === "outreach" && key === "channel") {
              return (
                <SelectField
                  key={key}
                  label={label}
                  value={form[key] || ""}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      [key]: value,
                    })
                  }
                  options={["email", "linkedin", "instagram", "phone", "other"]}
                />
              );
            }

            if (modal.type === "outreach" && key === "status") {
              return (
                <SelectField
                  key={key}
                  label={label}
                  value={form[key] || ""}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      [key]: value,
                    })
                  }
                  options={[
                    "not_contacted",
                    "contacted",
                    "replied",
                    "meeting",
                    "won",
                    "lost",
                  ]}
                />
              );
            }

            if (modal.type === "opportunity" && key === "status") {
              return (
                <SelectField
                  key={key}
                  label={label}
                  value={form[key] || "identified"}
                  onChange={(value) =>
                    setForm({
                      ...form,
                      [key]: value,
                    })
                  }
                  options={["identified", "pitched", "won", "lost"]}
                />
              );
            }

            return (
              <label key={key} className="block">
                <span className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-white/30">
                  {label}
                </span>

                {key === "content" ||
                key === "description" ||
                key === "notes" ? (
                  <textarea
                    value={form[key] || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]: e.target.value,
                      })
                    }
                    placeholder={placeholder}
                    rows={4}
                    className="w-full resize-none border border-white/[0.1] bg-white/[0.025] px-3 py-3 text-sm text-white outline-none placeholder:text-white/15 focus:border-[#b99a63]/50"
                  />
                ) : (
                  <input
                    value={form[key] || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]: e.target.value,
                      })
                    }
                    placeholder={placeholder}
                    required={config.required.includes(key)}
                    type={key === "email" ? "email" : "text"}
                    className="h-11 w-full border border-white/[0.1] bg-white/[0.025] px-3 text-sm text-white outline-none placeholder:text-white/15 focus:border-[#b99a63]/50"
                  />
                )}
              </label>
            );
          })}

          {modal.type === "outreach" && contacts.length > 0 && (
            <SelectField
              label="Contact"
              value={form.contact_id || ""}
              onChange={(value) =>
                setForm({
                  ...form,
                  contact_id: value,
                })
              }
              options={contacts.map(
                (contact) => `${contact.id} — ${contact.name}`,
              )}
            />
          )}

          {error && <p className="text-xs text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex h-11 w-full items-center justify-center gap-2 bg-[#e8e6df] text-[10px] font-medium uppercase tracking-[0.18em] text-[#0c0c0b] transition hover:bg-white disabled:opacity-50"
          >
            {saving
              ? isEditing
                ? "Saving changes..."
                : "Creating..."
              : isEditing
                ? "Save changes"
                : "Create record"}
          </button>
        </form>
      </motion.div>
    </>
  );
}

/* ------------------------------------------------ */
/* Modal Configuration                              */
/* ------------------------------------------------ */

function getModalConfig(modal: NonNullable<ModalState>, businessId: number) {
  if (modal.type === "business") {
    return {
      title: "Edit prospect",
      endpoint: `/businesses/${businessId}`,
      fields: [
        ["name", "Business name", "e.g. Rambagh Palace"],
        ["industry", "Industry", "e.g. Hospitality"],
        ["city", "City", "e.g. Jaipur"],
      ] as [string, string, string][],
      required: ["name", "industry", "city"],
    };
  }

  const configs = {
    website: {
      title: "Website",
      endpoint: `/websites/${(modal.record as Website | undefined)?.id ?? ""}`,
      createEndpoint: `/businesses/${businessId}/websites`,
      fields: [["url", "Website URL", "https://example.com"]] as [
        string,
        string,
        string,
      ][],
      required: ["url"],
    },

    contact: {
      title: "Contact",
      endpoint: `/contacts/${(modal.record as Contact | undefined)?.id ?? ""}`,
      createEndpoint: `/businesses/${businessId}/contacts`,
      fields: [
        ["name", "Name", "Jane Smith"],
        ["role", "Role", "Marketing Director"],
        ["email", "Email", "jane@example.com"],
        ["phone", "Phone", "+91..."],
        ["linkedin_url", "LinkedIn URL", "https://linkedin.com/in/..."],
      ] as [string, string, string][],
      required: ["name"],
    },

    observation: {
      title: "Observation",
      endpoint: `/observations/${
        (modal.record as Observation | undefined)?.id ?? ""
      }`,
      createEndpoint: `/businesses/${businessId}/observations`,
      fields: [
        ["type", "Type", "Website"],
        ["content", "Observation", "No clear conversion path..."],
      ] as [string, string, string][],
      required: ["type", "content"],
    },

    opportunity: {
      title: "Opportunity",
      endpoint: `/opportunities/${
        (modal.record as Opportunity | undefined)?.id ?? ""
      }`,
      createEndpoint: `/businesses/${businessId}/opportunities`,
      fields: [
        ["title", "Title", "Website redesign"],
        ["description", "Description", "What could be improved..."],
        ["status", "Status", "identified"],
      ] as [string, string, string][],
      required: ["title"],
    },

    outreach: {
      title: "Outreach",
      endpoint: `/outreach/${(modal.record as Outreach | undefined)?.id ?? ""}`,
      createEndpoint: `/businesses/${businessId}/outreach`,
      fields: [
        ["channel", "Channel", "email"],
        ["status", "Status", "contacted"],
        ["notes", "Notes", "Sent introductory email..."],
      ] as [string, string, string][],
      required: ["channel"],
    },
  };

  const config = configs[modal.type];

  return {
    ...config,
    endpoint: modal.mode === "create" ? config.createEndpoint : config.endpoint,
  };
}

/* ------------------------------------------------ */
/* Initial Form Values                              */
/* ------------------------------------------------ */

function getInitialForm(
  modal: NonNullable<ModalState>,
): Record<string, string> {
  if (!modal.record) {
    if (modal.type === "opportunity") {
      return {
        status: "identified",
      };
    }

    if (modal.type === "outreach") {
      return {
        status: "not_contacted",
      };
    }

    return {};
  }

  const record = modal.record as Record<string, unknown>;

  const values: Record<string, string> = {};

  Object.entries(record).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      values[key] = String(value);
    }
  });

  return values;
}

/* ------------------------------------------------ */
/* Select Field                                     */
/* ------------------------------------------------ */

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-white/30">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="h-11 w-full border border-white/[0.1] bg-[#151514] px-3 text-sm text-white outline-none focus:border-[#b99a63]/50"
      >
        <option value="">Select...</option>

        {options.map((option) => (
          <option
            key={option}
            value={option.includes(" — ") ? option.split(" — ")[0] : option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
