export type VisaPath = "employment" | "family" | "relative";
export type ChargeKey = "row" | "china" | "india" | "mexico" | "philippines";
export type BroadCat = "EmploymentVisa" | "PreferenceVisa" | "RelativeVisa";
export type PillKind = "green" | "amber" | "red" | "blue";

export type NvcRow = {
  Post: string;
  Edition: string;
  EmploymentVisa?: string | null;
  PreferenceVisa?: string | null;
  RelativeVisa?: string | null;
  LastUpdated?: string;
  Source?: string;
};

export type ChargeDates = Record<ChargeKey, string>;

export type BulletinCategory = {
  fad: ChargeDates;
  dff: ChargeDates;
};

export type BulletinCurrent = {
  employment: Record<string, BulletinCategory>;
  family: Record<string, BulletinCategory>;
};

export type BulletinHistoryEdition = {
  employment?: Record<string, ChargeDates>;
  family?: Record<string, ChargeDates>;
};

export type VisaBulletin = {
  currentEdition: string;
  current: BulletinCurrent;
  history: Record<string, BulletinHistoryEdition>;
  sourceUrl: string;
};

export type IvSchedulingData = {
  nvc: NvcRow[];
  bulletin: VisaBulletin;
};

export type Signal = {
  label: string;
  kind: PillKind;
  text: string;
};

export type CaseInputs = {
  path: VisaPath;
  subcategory: string;
  charge: ChargeKey;
  priorityDate: string;
  post: string;
  dqMonth: string;
};
