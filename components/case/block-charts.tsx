import { MIN_CELL_SIZE, isSufficientSample } from "@/lib/privacy";

type ChartEmptyProps = {
  title: string;
  meta: string;
  body: string;
};

function ChartEmptyState({ title, meta, body }: ChartEmptyProps) {
  return (
    <section className="card">
      <div className="card-h">
        <h3>{title}</h3>
        <span className="meta">{meta}</span>
      </div>
      <div className="card-b">
        <p className="chart-note">{body}</p>
      </div>
    </section>
  );
}

type WeeklyBlockChartProps = {
  sampleSize: number;
  title: string;
  insufficientBody: string;
};

/**
 * Weekly block pace chart. Static demo SVG is intentionally not rendered —
 * real series arrive in a later phase. Until then (or when N < MIN_CELL_SIZE),
 * show an honest empty state.
 */
export function WeeklyBlockChart({
  sampleSize,
  title,
  insufficientBody,
}: WeeklyBlockChartProps) {
  // No live weekly series yet — never show fabricated SVG numbers.
  const body = isSufficientSample(sampleSize)
    ? "We're collecting weekly decision history for this block. Charts unlock once we have enough recent outcomes."
    : insufficientBody;

  return (
    <ChartEmptyState
      title={title}
      meta={`Receipt block · ${sampleSize.toLocaleString("en-US")} / ${MIN_CELL_SIZE}`}
      body={body}
    />
  );
}

type NationwidePaceChartProps = {
  formType: string | null;
  sampleSize: number;
  title: string;
  insufficientBody: string;
};

export function NationwidePaceChart({
  formType,
  sampleSize,
  title,
  insufficientBody,
}: NationwidePaceChartProps) {
  const body = isSufficientSample(sampleSize)
    ? "Nationwide pace charts unlock once we have enough decided cases for this form in our corpus."
    : insufficientBody;

  return (
    <ChartEmptyState
      title={title}
      meta={`All ${formType ?? "forms"}, nationwide · ${sampleSize.toLocaleString("en-US")} / ${MIN_CELL_SIZE}`}
      body={body}
    />
  );
}
