export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <section className="max-w-4xl">
        <div className="section-kicker">Privacy</div>
        <h1 className="section-title">Privacy policy placeholder.</h1>
        <p className="section-copy">
          This route exists so the footer link resolves correctly. Replace this
          placeholder with the final Avengineers privacy policy before public
          launch.
        </p>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <PolicyCard
          title="Data sources"
          body="Hazard data may come from public fire APIs, sample fallback data, and future rover telemetry."
        />
        <PolicyCard
          title="Location"
          body="The map asks for browser location only to center the view. It does not persist location in this app."
        />
        <PolicyCard
          title="Contact"
          body="Any future contact form should clearly state what information is collected and where it is sent."
        />
      </section>
    </div>
  );
}

function PolicyCard({ title, body }) {
  return (
    <div className="theme-card p-6">
      <h2 className="text-xl font-black text-[#0b1623]">{title}</h2>
      <p className="mt-3 leading-7 text-slate-600">{body}</p>
    </div>
  );
}
