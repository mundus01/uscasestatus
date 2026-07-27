import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CaseLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 md:px-6 md:py-14">
      <Card>
        <CardBody className="space-y-4">
          <Skeleton className="h-8 w-32" label="Loading case status" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-48" />
        </CardBody>
      </Card>
      <Card>
        <CardBody className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-16 w-full" />
        </CardBody>
      </Card>
      <Card>
        <CardBody className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-24 w-full" />
        </CardBody>
      </Card>
    </div>
  );
}
