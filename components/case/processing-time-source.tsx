import { USCIS_HISTORIC_PT_URL } from "@/lib/processing-times";

type ProcessingTimeSourceProps = {
  label: string;
  className?: string;
};

/** Attribution link shown wherever historic USCIS processing times appear. */
export function ProcessingTimeSource({
  label,
  className,
}: ProcessingTimeSourceProps) {
  return (
    <p className={className ?? "content-note"}>
      {label}{" "}
      <a
        href={USCIS_HISTORIC_PT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        egov.uscis.gov/processing-times/historic-pt
      </a>
    </p>
  );
}
