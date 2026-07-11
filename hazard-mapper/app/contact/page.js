import Link from "next/link";

const contactPaths = [
  ["Pilot programs", "Evaluate Fire Link on a patrol corridor or campus edge."],
  ["Partnerships", "Discuss municipal, utility, or research collaboration."],
  ["Deployment", "Plan map, sensor, and alert workflow integration."],
];

export default function ContactPage() {
  return (
    <div className="page-shell">
      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div>
          <div className="section-kicker">Contact</div>
          <h1 className="section-title">Connect with Avengineers.</h1>
          <p className="section-copy">
            Use this page as the contact destination for pilot, partnership, and
            deployment conversations.
          </p>
        </div>

        <div className="theme-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
            Response channel
          </p>
          <p className="mt-3 text-lg font-bold text-[#0b1623]">
            Replace this placeholder with the team email, form, or CRM handoff
            when the production contact workflow is ready.
          </p>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {contactPaths.map(([title, description]) => (
          <div key={title} className="theme-card p-6">
            <h2 className="text-xl font-black text-[#0b1623]">{title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{description}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 theme-card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#0b1623]">
            Need operational context first?
          </h2>
          <p className="mt-2 text-slate-600">
            Review the live map and data feed before starting a conversation.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/map" className="btn-primary">
            Open Map
          </Link>
          <Link href="/hazards" className="btn-secondary">
            Open Data
          </Link>
        </div>
      </section>
    </div>
  );
}
