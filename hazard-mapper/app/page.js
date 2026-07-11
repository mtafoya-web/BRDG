import Image from "next/image";
import Link from "next/link";
import UserWorkflow from "@/components/UserWorkFlow";

export default function Page() {
  return (
    <>
      <section className="home-hero min-h-[calc(100vh-6rem)] overflow-hidden px-5 py-10 sm:px-8 lg:px-12 lg:py-0">
        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-[1500px] items-center">
          <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="order-1 max-w-4xl text-center lg:text-left">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-orange-600 sm:text-sm md:text-base">
                Fire Link
              </p>

              <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                A Mobile Ground-Level{" "}
                <span className="block text-[#2f5f32]">
                  Wildfire Hazard Detection
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg md:text-xl lg:mx-0 lg:text-2xl">
                Leveraging Edge-AI and geospatial intelligence to patrol
                high-risk corridors, validate threats, and deliver actionable
                data — stopping wildfires at their source.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/dashboard"
                  className="w-full rounded-xl bg-[#3f7a3e] px-7 py-4 text-center text-base font-bold text-white shadow-lg transition hover:scale-[1.02] sm:w-auto"
                >
                  View Dashboard
                </Link>

                <Link
                  href="/product"
                  className="w-full rounded-xl border-2 border-[#3f7a3e] bg-white/70 px-7 py-4 text-center text-base font-bold text-[#3f7a3e] backdrop-blur transition hover:scale-[1.02] sm:w-auto"
                >
                  Explore Rover →
                </Link>
              </div>
            </div>

            <div className="order-2 flex justify-center lg:justify-end">
              <Image
                src="/images/rover.png"
                alt="Wildfire detection rover"
                width={800}
                height={600}
                priority
                className="w-full max-w-[360px] object-contain drop-shadow-2xl sm:max-w-[500px] md:max-w-[620px] lg:max-w-[760px]"
              />
            </div>
          </div>
        </div>
        <UserWorkflow />
      </section>

    </>
  );
}