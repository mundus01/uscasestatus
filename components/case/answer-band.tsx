type AnswerBandProps = {
  sentence: string;
};

/** One-line answer under the status header (§9.1). */
export function AnswerBand({ sentence }: AnswerBandProps) {
  return (
    <p className="text-xl font-semibold leading-snug tracking-tight text-ink md:text-2xl">
      {sentence}
    </p>
  );
}
