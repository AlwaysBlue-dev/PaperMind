import { BarChart3, BookMarked, Target } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: BookMarked,
    title: "Choose your exam",
    description:
      "Select Matric, FSc, CSS, or MDCAT and pick your board and subject.",
  },
  {
    number: 2,
    icon: BarChart3,
    title: "AI analyses patterns",
    description:
      "Our engine scans 10+ years of BISE, FBISE, and FPSC past papers for trends.",
  },
  {
    number: 3,
    icon: Target,
    title: "Study what matters",
    description:
      "Get ranked chapter predictions with probability scores so you focus on what counts.",
  },
];

export function HowItWorks() {
  return (
    <section className="landing-section">
      <div className="landing-container">
        <div className="mb-8 md:mb-12">
          <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            How it works
          </h2>
          <p className="mt-2 max-w-lg text-foreground-muted">
            Three steps from past papers to a focused study plan
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map(({ number, icon: Icon, title, description }) => (
            <article
              key={number}
              className="pm-card flex flex-col gap-4 p-5 md:p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {number}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
              </div>
              <div>
                <h3 className="font-heading text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
