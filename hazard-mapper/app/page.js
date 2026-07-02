import Link from "next/link";

const highlights = [
  "Ground-based rover patrols",
  "360° visual inspection",
  "Smoke and chemical sensing",
  "Detection of dry brush and litter hazards",
];

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-amber-900 px-6 py-8 md:px-8 md:py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-3xl border border-white/10 bg-white/10 p-7 shadow-xl backdrop-blur md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-200">
                Hazard Mapper Prototype
              </p>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                A rover-based prototype for finding potential fire hazards before they spread.
              </h1>
              <p className="text-base text-slate-200">
                Our prototype is a ground-based rover equipped with a 360° camera and sensors for smoke and chemical presence, designed to scan areas for risks such as dry brush, cigarette butts, and other fire-prone hazards.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-950/35 p-3">
              <Link
                href="/map"
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Open map
              </Link>
              <Link
                href="/hazards"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View hazards
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard
            title="Who we are"
            body="We are building a practical hazard-monitoring platform that combines robotics, environmental sensing, and visual inspection to help identify risks early."
          />
          <InfoCard
            title="What our goal is"
            body="Our goal is to give teams a faster way to detect potential fire hazards in outdoor spaces, especially where dry materials, smoke, or chemical indicators may signal danger."
          />
          <InfoCard
            title="Our solution / prototype"
            body="The prototype combines a rover platform with a 360° camera, smoke and chemical sensors, and a live interface so users can review detected risks at a glance."
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-7 shadow-lg backdrop-blur">
            <h2 className="text-xl font-semibold">Why this matters</h2>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              Fire risk is easier to manage when information is clearly presented. This prototype focuses on visibility, urgency, and actionable awareness by pairing autonomous inspection with hazard detection.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              The goal is to keep the experience calm, readable, and useful so that early warning signals do not get buried in clutter.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/35 shadow-lg">
            <div className="w-full max-h-[420px] md:max-h-[560px] flex items-center justify-center bg-transparent rounded-t-3xl overflow-hidden">
              <img
                src="/images/prototype-features.png"
                alt="Rover prototype in field with labels"
                className="w-full h-auto object-contain rounded-t-3xl"
              />
            </div>
            <div className="p-4">
              <h3 className="text-base font-semibold">Prototype features</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <InfoCard
            title="Live situational awareness"
            body="The interface is meant to support quick scanning, clear prioritization, and a more confident response when the rover identifies a potential hazard."
          />
          <InfoCard
            title="Built for early visibility"
            body="By combining rover sensor data, visual context, and a compact hazard list, the prototype helps users understand what matters first."
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/10 p-7 shadow-lg backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-200">
                How it works
              </p>
              <h2 className="text-2xl font-semibold">The rover moves through an area and builds a clearer picture of risk.</h2>
              <p className="text-sm leading-7 text-slate-200">
                It can scan spaces with its 360° camera while its onboard sensors monitor for smoke or chemical indicators. That makes it useful for identifying hazards that may not be obvious at first glance.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold">Visual inspection</h3>
                  <p className="mt-2 text-sm text-slate-300">Wide-angle monitoring of terrain and surroundings.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold">Smoke sensing</h3>
                  <p className="mt-2 text-sm text-slate-300">Detection of early signs that could signal danger.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold">Chemical sensing</h3>
                  <p className="mt-2 text-sm text-slate-300">Monitoring for suspicious environmental indicators.</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-semibold">Hazard mapping</h3>
                  <p className="mt-2 text-sm text-slate-300">Turning findings into a clean, trackable overview.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/10 p-7 shadow-lg backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/35">
              <div className="h-56 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.25),_transparent_35%),linear-gradient(135deg,_rgba(15,23,42,0.95),_rgba(51,65,85,0.8))]" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-200">
                Why it matters
              </p>
              <h2 className="text-2xl font-semibold">We want to make hazard spotting faster, safer, and more consistent.</h2>
              <p className="text-sm leading-7 text-slate-200">
                By combining robotics with environmental sensing, the prototype creates a practical way to inspect risky landscapes and identify issues before they become serious.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <PhotoCard
            title="Dry brush"
            description="One of the most common fire-prone materials the rover may help identify during inspection."
            imageUrl="/images/dry-brush.jpg"
          />
          <PhotoCard
            title="Cigarette litter"
            description="Small but dangerous sources of ignition that can be hard to notice from a distance."
            imageUrl="/images/cigarette-litter.jpg"
          />
          <PhotoCard
            title="Chemical traces"
            description="Environmental indicators that can support a more complete understanding of area risk."
            imageUrl="/images/chemical-traces.jpg"
          />
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/10 p-7 shadow-lg backdrop-blur">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-200">
              A final note
            </p>
            <h2 className="text-2xl font-semibold">This prototype is meant to be practical, visual, and useful for early awareness.</h2>
            <p className="text-sm leading-8 text-slate-200">
              The goal is not only to detect hazards, but to present them in a way that feels understandable and approachable. By pairing a rover with sensing tools and a simple interface, the project aims to turn a complex problem into something easier to monitor and respond to.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ title, body }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5 shadow-md">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-200">{body}</p>
    </div>
  );
}

function PhotoCard({ title, description, imageUrl }) {
  const fallbackImage = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80";
  const resolvedImage = imageUrl || fallbackImage;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/35 shadow-lg">
      <img src={resolvedImage} alt={title} className="h-40 w-full object-cover" />
      <div className="p-5">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
      </div>
    </div>
  );
}
