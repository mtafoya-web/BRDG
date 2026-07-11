"use client";

import {
  FaRobot,
  FaBroadcastTower,
  FaFire,
  FaShieldAlt,
  FaBell,
  FaHelicopter,
  FaTools,
  FaDatabase,
  FaSyncAlt,
} from "react-icons/fa";

const colorClasses = {
  green: {
    border: "border-green-700",
    badge: "bg-green-700",
    title: "text-green-800",
    iconBg: "bg-green-100",
    iconText: "text-green-800",
    arrow: "text-green-700",
  },
  orange: {
    border: "border-orange-500",
    badge: "bg-orange-500",
    title: "text-orange-700",
    iconBg: "bg-orange-100",
    iconText: "text-orange-700",
    arrow: "text-orange-500",
  },
  yellow: {
    border: "border-yellow-500",
    badge: "bg-yellow-500",
    title: "text-yellow-700",
    iconBg: "bg-yellow-100",
    iconText: "text-yellow-700",
    arrow: "text-yellow-500",
  },
  red: {
    border: "border-red-500",
    badge: "bg-red-600",
    title: "text-red-700",
    iconBg: "bg-red-100",
    iconText: "text-red-700",
    arrow: "text-red-600",
  },
  purple: {
    border: "border-purple-600",
    badge: "bg-purple-700",
    title: "text-purple-800",
    iconBg: "bg-purple-100",
    iconText: "text-purple-800",
    arrow: "text-purple-700",
  },
  blue: {
    border: "border-blue-600",
    badge: "bg-blue-700",
    title: "text-blue-700",
    iconBg: "bg-blue-100",
    iconText: "text-blue-700",
    arrow: "text-blue-700",
  },
  teal: {
    border: "border-teal-600",
    badge: "bg-teal-700",
    title: "text-teal-700",
    iconBg: "bg-teal-100",
    iconText: "text-teal-700",
    arrow: "text-teal-700",
  },
};

export default function UserWorkflow() {
  const steps = [
    {
      number: "1",
      title: "Deploy",
      color: "green",
      icon: FaRobot,
      bullets: [
        "Place rover in high-risk area",
        "Set mission route",
        "Check sensors",
      ],
    },
    {
      number: "2",
      title: "Monitor",
      color: "green",
      icon: FaBroadcastTower,
      bullets: [
        "Patrol route",
        "Collect live sensor data",
        "Stream telemetry",
      ],
    },
    {
      number: "3",
      title: "Detect",
      color: "orange",
      icon: FaFire,
      bullets: [
        "Run Edge AI detection",
        "Identify fire hazards",
        "Flag possible threat",
      ],
    },
    {
      number: "4",
      title: "Validate",
      color: "yellow",
      icon: FaShieldAlt,
      bullets: [
        "Check sensor evidence",
        "Reduce false positives",
        "Confirm threat level",
      ],
    },
    {
      number: "5",
      title: "Alert",
      color: "red",
      icon: FaBell,
      bullets: [
        "Send GPS alert",
        "Show image and confidence",
        "Notify dashboard user",
      ],
    },
    {
      number: "6",
      title: "Verify",
      color: "purple",
      icon: FaHelicopter,
      bullets: [
        "Review alert",
        "Dispatch UAV or field team",
        "Confirm conditions",
      ],
    },
    {
      number: "7",
      title: "Mitigate",
      color: "blue",
      icon: FaTools,
      bullets: [
        "Remove hazard",
        "Suppress active fire",
        "Secure the area",
      ],
    },
    {
      number: "8",
      title: "Improve",
      color: "teal",
      icon: FaDatabase,
      bullets: [
        "Save event data",
        "Update risk maps",
        "Improve patrol routes",
      ],
    },
  ];

  return (
    <section className="px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px] rounded-3xl border border-black/10 p-5 sm:p-8">
        <div className="mb-12 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-600">
            System Flow
          </p>

          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-[#14244a] sm:text-4xl lg:text-5xl">
            User Workflow
          </h2>
        </div>

        <div className="workflow-scroll overflow-x-auto px-2 pb-5 pt-8">
          <div className="flex min-w-[1450px] items-stretch gap-4">
            {steps.map((step, index) => {
              const colors = colorClasses[step.color];
              const MainIcon = step.icon;

              return (
                <div key={step.number} className="flex flex-1 items-center">
                  <article
                    className={`relative flex min-h-[430px] w-full flex-col rounded-2xl border-2 p-5 pt-8 ${colors.border}`}
                  >
                    <div
                      className={`absolute -top-6 left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full text-xl font-black text-white shadow-md ${colors.badge}`}
                    >
                      {step.number}
                    </div>

                    <h3
                      className={`mt-5 text-center text-lg font-black uppercase leading-tight ${colors.title}`}
                    >
                      {step.title}
                    </h3>

                    <div className="flex flex-1 items-center justify-center py-8">
                      <div
                        className={`flex h-24 w-24 items-center justify-center rounded-full ${colors.iconBg}`}
                      >
                        <MainIcon className={`text-5xl ${colors.iconText}`} />
                      </div>
                    </div>

                    <ul className="space-y-3 text-sm font-medium leading-relaxed text-gray-800">
                      {step.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2">
                          <span className={`mt-1 text-xs ${colors.title}`}>
                            ●
                          </span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </article>

                  {index !== steps.length - 1 && (
                    <div
                      className={`mx-1 hidden text-4xl font-black xl:block ${colors.arrow}`}
                    >
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[#14244a]/20 p-6 shadow-sm">
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#14244a]/10">
              <FaSyncAlt className="text-3xl text-[#14244a]" />
            </div>

            <div>
              <h3 className="text-xl font-black uppercase text-[#14244a]">
                Continuous Cycle
              </h3>

              <p className="mt-1 text-sm font-medium leading-relaxed text-gray-700 sm:text-base">
                Each mission improves future patrols, detection accuracy, and
                wildfire response planning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}