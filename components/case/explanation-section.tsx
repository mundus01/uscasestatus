import { Card, CardBody, CardHeader } from "@/components/ui/card";

type ExplanationSectionProps = {
  plainEnglishTitle: string;
  plainEnglish: string;
};

export function ExplanationSection({
  plainEnglishTitle,
  plainEnglish,
}: ExplanationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-ink">{plainEnglishTitle}</h2>
      </CardHeader>
      <CardBody>
        <p className="leading-relaxed text-ink-muted">{plainEnglish}</p>
      </CardBody>
    </Card>
  );
}

type OfficialTextProps = {
  title: string;
  description: string;
};

export function OfficialUscisText({ title, description }: OfficialTextProps) {
  if (!description) {
    return null;
  }
  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-ink">{title}</h2>
      </CardHeader>
      <CardBody>
        <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
      </CardBody>
    </Card>
  );
}
