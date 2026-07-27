import { Callout } from "@/components/ui/callout";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import type { StatusTone } from "@/lib/status";

type ExplanationSectionProps = {
  plainEnglishTitle: string;
  plainEnglish: string;
  whatToDoTitle: string;
  whatToDo: string;
  officialTitle: string;
  officialDescription: string;
  tone: StatusTone;
};

export function ExplanationSection({
  plainEnglishTitle,
  plainEnglish,
  whatToDoTitle,
  whatToDo,
  officialTitle,
  officialDescription,
  tone,
}: ExplanationSectionProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-ink">{plainEnglishTitle}</h2>
        </CardHeader>
        <CardBody>
          <p className="leading-relaxed text-ink-muted">{plainEnglish}</p>
        </CardBody>
      </Card>

      <Callout tone={tone === "neutral" ? "brand" : tone} title={whatToDoTitle}>
        {whatToDo}
      </Callout>

      {officialDescription ? (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-ink">{officialTitle}</h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm leading-relaxed text-ink-muted">
              {officialDescription}
            </p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
