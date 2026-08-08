import { CATS, CHARGES, MONTHS, PATHNAMES } from "./constants";
import type {
  BroadCat,
  CaseInputs,
  ChargeKey,
  NvcRow,
  PillKind,
  Signal,
  VisaBulletin,
  VisaPath,
} from "./types";

export function parseMon(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = s.match(/^([A-Z][a-z]{2})-(\d{4})$/);
  if (!m) return null;
  const month = MONTHS.indexOf(m[1] as (typeof MONTHS)[number]);
  if (month < 0) return null;
  return new Date(Number(m[2]), month, 1);
}

export function monthIdx(d: Date | null): number | null {
  return d ? d.getFullYear() * 12 + d.getMonth() : null;
}

export function mdiff(a: Date | null, b: Date | null): number | null {
  const ai = monthIdx(a);
  const bi = monthIdx(b);
  if (ai === null || bi === null) return null;
  return ai - bi;
}

export function prettyMon(s: string | null | undefined): string {
  const d = parseMon(s);
  return d
    ? d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";
}

export function prettyDateInput(s: string | null | undefined): string {
  if (!s) return "—";
  const d = new Date(`${s}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function parseVB(s: string | null | undefined): string | Date | null {
  if (!s) return null;
  if (s === "C" || s === "U") return s;
  const m = s.match(/^(\d{2})([A-Z]{3})(\d{2})$/);
  if (!m) return null;
  const map: Record<string, number> = {
    JAN: 0,
    FEB: 1,
    MAR: 2,
    APR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
  };
  const month = map[m[2]];
  if (month === undefined) return null;
  return new Date(2000 + Number(m[3]), month, Number(m[1]));
}

export function prettyVB(s: string | null | undefined): string {
  if (s === "C") return "Current";
  if (s === "U") return "Unavailable";
  const d = parseVB(s);
  return d instanceof Date
    ? d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
}

export function exactDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export function monthsApprox(days: number): number {
  return Math.max(0, Math.round(days / 30.44));
}

export function formatMove(v: number | null): string {
  if (v === null) return "—";
  if (v === 0) return "0 mo";
  return `${v > 0 ? "+" : ""}${v} mo`;
}

export function broadCat(path: VisaPath): BroadCat {
  if (path === "employment") return "EmploymentVisa";
  if (path === "family") return "PreferenceVisa";
  return "RelativeVisa";
}

export function editionLabel(edition: string): string {
  const d = parseMon(edition);
  return d
    ? d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : edition;
}

export function latestEdition(nvc: NvcRow[]): string {
  const editions = [...new Set(nvc.map((r) => r.Edition))].sort(
    (a, b) => (parseMon(a)?.getTime() ?? 0) - (parseMon(b)?.getTime() ?? 0),
  );
  return editions[editions.length - 1] ?? "";
}

export function listPosts(nvc: NvcRow[]): string[] {
  return [...new Set(nvc.map((r) => r.Post).filter(Boolean))].sort();
}

export function createNvcIndex(nvc: NvcRow[]) {
  const latest = latestEdition(nvc);
  const posts = listPosts(nvc);

  function rowsFor(post: string): NvcRow[] {
    return nvc
      .filter((r) => r.Post === post)
      .sort(
        (a, b) =>
          (parseMon(a.Edition)?.getTime() ?? 0) -
          (parseMon(b.Edition)?.getTime() ?? 0),
      );
  }

  function rowAt(post: string, ed: string): NvcRow | undefined {
    return nvc.find((r) => r.Post === post && r.Edition === ed);
  }

  function latestRow(post: string): NvcRow | undefined {
    return rowAt(post, latest);
  }

  function previousAvailableRow(
    post: string,
    cat: BroadCat,
  ): NvcRow | null {
    const rs = rowsFor(post).filter((r) => r[cat]);
    return rs.length > 1 ? rs[rs.length - 2]! : null;
  }

  function postBacklog(post: string, cat: BroadCat): number | null {
    const r = latestRow(post);
    if (!r || !r[cat]) return null;
    return mdiff(parseMon(r.Edition), parseMon(r[cat]));
  }

  function lastPostMove(post: string, cat: BroadCat): number | null {
    const r = latestRow(post);
    const p = previousAvailableRow(post, cat);
    if (!r || !p || !r[cat] || !p[cat]) return null;
    return mdiff(parseMon(r[cat]), parseMon(p[cat]));
  }

  function recentPostPace(post: string, cat: BroadCat): number | null {
    const rs = rowsFor(post)
      .filter((r) => r[cat])
      .slice(-6);
    if (rs.length < 2) return null;
    const first = rs[0]!;
    const last = rs[rs.length - 1]!;
    const elapsed = mdiff(parseMon(last.Edition), parseMon(first.Edition));
    const moved = mdiff(parseMon(last[cat]), parseMon(first[cat]));
    if (elapsed === null || moved === null || !elapsed) return null;
    return moved / elapsed;
  }

  function postSignal(post: string, cat: BroadCat): Signal {
    const mv = lastPostMove(post, cat);
    const pace = recentPostPace(post, cat);
    const rs = rowsFor(post)
      .filter((r) => r[cat])
      .slice(-3);
    const stalled3 =
      rs.length >= 3 && rs.every((x) => x[cat] === rs[0]![cat]);
    if (mv !== null && mv < 0) {
      return {
        label: "Retrogressed",
        kind: "red",
        text: "The latest published cutoff moved backward.",
      };
    }
    if (stalled3 || mv === 0) {
      return {
        label: "Stalled",
        kind: "amber",
        text: "The cutoff has not advanced in the latest updates.",
      };
    }
    if (pace !== null && pace > 1.15) {
      return {
        label: "Catching up",
        kind: "green",
        text: "The cutoff has recently advanced faster than calendar time.",
      };
    }
    if (mv !== null && mv > 0) {
      return {
        label: "Advancing",
        kind: "blue",
        text: "The cutoff moved forward in the latest update.",
      };
    }
    return {
      label: "Limited signal",
      kind: "blue",
      text: "There is not enough recent movement to classify the trend confidently.",
    };
  }

  return {
    latest,
    posts,
    rowsFor,
    latestRow,
    previousAvailableRow,
    postBacklog,
    lastPostMove,
    recentPostPace,
    postSignal,
  };
}

export type NvcIndex = ReturnType<typeof createNvcIndex>;

export function getVB(
  bulletin: VisaBulletin,
  path: VisaPath,
  sub: string,
  charge: ChargeKey,
): { fad: string; dff: string } | null {
  if (path === "relative") return null;
  const cat = bulletin.current[path][sub];
  if (!cat) return null;
  return { fad: cat.fad[charge], dff: cat.dff[charge] };
}

export function visaEvaluation(
  bulletin: VisaBulletin,
  path: VisaPath,
  sub: string,
  charge: ChargeKey,
  pdString: string,
) {
  if (path === "relative") {
    return {
      applicable: false as const,
      available: true,
      filing: true,
      v: null,
      pd: null,
    };
  }
  const v = getVB(bulletin, path, sub, charge);
  const pd = pdString ? new Date(`${pdString}T00:00:00`) : null;
  if (!v || !pd) {
    return {
      applicable: true as const,
      available: false,
      filing: false,
      v,
      pd,
    };
  }
  let available = false;
  let filing = false;
  if (v.fad === "C") available = true;
  else if (v.fad === "U") available = false;
  else {
    const fad = parseVB(v.fad);
    available = fad instanceof Date ? pd < fad : false;
  }
  if (v.dff === "C") filing = true;
  else if (v.dff === "U") filing = false;
  else {
    const dff = parseVB(v.dff);
    filing = dff instanceof Date ? pd < dff : false;
  }
  return { applicable: true as const, available, filing, v, pd };
}

export function bulletinHistory(
  bulletin: VisaBulletin,
  path: VisaPath,
  sub: string,
  charge: ChargeKey,
) {
  if (path === "relative") return [];
  return Object.entries(bulletin.history)
    .map(([edition, data]) => ({
      edition,
      value: data[path]?.[sub]?.[charge] ?? null,
    }))
    .filter((x): x is { edition: string; value: string } => Boolean(x.value))
    .sort(
      (a, b) =>
        (parseMon(a.edition)?.getTime() ?? 0) -
        (parseMon(b.edition)?.getTime() ?? 0),
    );
}

export function describeVBMove(prev: string, cur: string) {
  if (!prev || !cur) {
    return {
      title: "No comparison",
      text: "Not enough historical data.",
      kind: "neutral" as const,
    };
  }
  if (prev === cur) {
    return {
      title: "No movement",
      text: "The Final Action Date did not change from the prior Bulletin.",
      kind: "flat" as const,
    };
  }
  if (cur === "C" && prev !== "C") {
    return {
      title: "Became current",
      text: "The category moved to Current this month.",
      kind: "up" as const,
    };
  }
  if (cur === "U" && prev !== "U") {
    return {
      title: "Became unavailable",
      text: "The category became Unavailable this month.",
      kind: "down" as const,
    };
  }
  if (prev === "U" && cur !== "U") {
    return {
      title: "Availability restored",
      text: `The category moved from Unavailable to ${prettyVB(cur)}.`,
      kind: "up" as const,
    };
  }
  if (prev === "C" && cur !== "C") {
    return {
      title: "Retrogressed from Current",
      text: `The category is no longer Current; the new cutoff is ${prettyVB(cur)}.`,
      kind: "down" as const,
    };
  }
  const a = parseVB(prev);
  const b = parseVB(cur);
  if (a instanceof Date && b instanceof Date) {
    const days = exactDays(b, a);
    const months = monthsApprox(Math.abs(days));
    if (days > 0) {
      return {
        title: "Advanced",
        text: `Final Action Date advanced about ${months} month${months === 1 ? "" : "s"} from ${prettyVB(prev)} to ${prettyVB(cur)}.`,
        kind: "up" as const,
      };
    }
    return {
      title: "Retrogressed",
      text: `Final Action Date moved backward about ${months} month${months === 1 ? "" : "s"} from ${prettyVB(prev)} to ${prettyVB(cur)}.`,
      kind: "down" as const,
    };
  }
  return {
    title: "Changed",
    text: `${prettyVB(prev)} → ${prettyVB(cur)}`,
    kind: "neutral" as const,
  };
}

export function dosWatchText(
  path: VisaPath,
  sub: string,
  charge: ChargeKey,
  editionLabelText: string,
): string | null {
  if (path === "employment" && sub === "EB1" && charge === "india") {
    return `The ${editionLabelText} Department of State bulletin warns that high demand may require EB-1 India to become unavailable before the end of FY2026.`;
  }
  if (path === "employment" && sub === "EB2") {
    return `The ${editionLabelText} Department of State bulletin warns that EB-2 demand may require retrogression or the category becoming unavailable in the coming months.`;
  }
  return null;
}

export type StatusPill = { kind: PillKind; text: string };

export type AnalysisResult = {
  editionPretty: string;
  editionLong: string;
  bottleneck: { title: string; text: string; pill: StatusPill };
  visaGate: {
    visible: boolean;
    sub: string;
    status: StatusPill;
    pdValue: string;
    fadValue: string;
    dffValue: string;
    explain: string;
    watch: string | null;
  };
  postGate: {
    sub: string;
    status: StatusPill;
    dqValue: string;
    cutoff: string;
    catLabel: string;
    gap: string;
    gapSub: string;
    explain: string;
    momentum: { value: string; sub: string };
    lastMove: { value: string; sub: string };
    trendEstimate: { value: string; sub: string };
  };
  trend: { title: string; text: string; caption: string; movement: string };
  steps: {
    dqText: string;
    visaClass: "done" | "active" | "pending";
    visaTitle: string;
    visaText: string;
    postClass: "done" | "active" | "pending";
    postTitle: string;
    postText: string;
  };
  embassySnapshot: Array<{
    name: string;
    date: string;
    meta: string;
    signal: Signal;
  }>;
  global: {
    employment: string;
    preference: string;
    relative: string;
    caption: string;
  };
  bulletinHistory: Array<{ edition: string; value: string }>;
  bulletinCaption: string;
  bulletinMovement: string;
  changes: {
    visa: { title: string; text: string };
    post: { title: string; text: string };
    overall: { title: string; text: string };
  };
  chart: {
    post: string;
    cat: BroadCat;
    dq: Date | null;
  };
  ranksCat: BroadCat;
};

export function analyzeCase(
  nvc: NvcRow[],
  bulletin: VisaBulletin,
  index: NvcIndex,
  inputs: CaseInputs,
): AnalysisResult {
  const { path, charge, priorityDate: pd, post, dqMonth: dqv } = inputs;
  const sub = path === "relative" ? "IR" : inputs.subcategory;
  const cat = broadCat(path);
  const r = index.latestRow(post);
  const cut = r?.[cat] ? parseMon(r[cat]) : null;
  const dq = dqv
    ? new Date(Number(dqv.slice(0, 4)), Number(dqv.slice(5, 7)) - 1, 1)
    : null;
  const ve = visaEvaluation(bulletin, path, sub, charge, pd);
  let postReached = false;
  let gap: number | null = null;
  if (cut && dq) {
    gap = mdiff(dq, cut);
    postReached = gap !== null && gap <= 0;
  }

  const mvNow = index.lastPostMove(post, cat);
  const paceNow = index.recentPostPace(post, cat);
  const sigNow = index.postSignal(post, cat);
  const paceRounded =
    paceNow === null ? null : Math.round(paceNow * 10) / 10;
  const etaExact =
    !postReached && gap !== null && paceNow !== null && paceNow > 0
      ? gap / paceNow
      : null;
  const etaDisplay =
    etaExact === null
      ? null
      : Number.isInteger(etaExact)
        ? String(etaExact)
        : (Math.round(etaExact * 10) / 10).toFixed(1);

  const editionLong = editionLabel(bulletin.currentEdition);
  const editionPretty = prettyMon(index.latest);

  let bottleneckTitle: string;
  let bottleneckText: string;
  let bottleneckPill: StatusPill;

  const visaGateVisible = path !== "relative";
  let visaStatus: StatusPill = { kind: "blue", text: "—" };
  let visaExplain = "—";
  let changeVisa = {
    title: "Not applicable",
    text: "Immediate Relative cases are not controlled by preference-category Final Action Dates.",
  };
  let stepVisaClass: "done" | "active" | "pending" = "done";
  let stepVisaTitle = "Visa number available";
  let stepVisaText =
    "Not numerically limited — Visa Bulletin gate not applicable";
  let bh: Array<{ edition: string; value: string }> = [];
  let bulletinCaption = "Final Action Date history";
  let bulletinMovement = "Not enough history to compare.";
  const watch = dosWatchText(path, sub, charge, editionLong);

  if (path === "relative") {
    bottleneckTitle = postReached
      ? "Published queue gates reached"
      : "Interview post queue";
    bottleneckText = postReached
      ? "The supplied NVC cutoff has reached your DQ month. Your next timing depends on actual post scheduling and case-specific processing."
      : `Immediate Relative visas do not use the preference Visa Bulletin queue. Your visible bottleneck is the ${post} scheduling cutoff.`;
    bottleneckPill = {
      kind: postReached ? "green" : "amber",
      text: postReached ? "Queue reached" : "Post queue",
    };
    stepVisaClass = "done";
    stepVisaTitle = "Visa number available";
    stepVisaText =
      "Not numerically limited — Visa Bulletin gate not applicable";
  } else {
    const v = ve.v!;
    if (v.fad === "U") {
      visaStatus = { kind: "red", text: "Unavailable" };
      visaExplain = `The selected category is marked Unavailable in the ${editionLong} Final Action Date chart, so visa numbers are not currently authorized for issuance in this category.`;
    } else if (ve.available) {
      visaStatus = { kind: "green", text: "Visa available" };
      visaExplain =
        v.fad === "C"
          ? "This category is Current for your chargeability area. Visa availability is not currently blocking your case."
          : "Your Priority Date is earlier than the applicable Final Action Date, so the Visa Bulletin gate is currently satisfied.";
    } else {
      visaStatus = { kind: "amber", text: "Priority Date not current" };
      const fd = parseVB(v.fad);
      const mo =
        fd instanceof Date && ve.pd
          ? monthsApprox(exactDays(ve.pd, fd))
          : null;
      visaExplain =
        "Your Priority Date is not yet earlier than the applicable Final Action Date." +
        (mo !== null
          ? ` It is roughly ${mo} month${mo === 1 ? "" : "s"} behind the current Final Action Date.`
          : "");
    }

    if (ve.available) {
      stepVisaClass = "done";
      stepVisaTitle = "Visa number available";
      stepVisaText = "Priority Date is current for final action";
    } else {
      stepVisaClass = "active";
      stepVisaTitle = "Waiting on visa number";
      stepVisaText = "Priority Date is not yet current for final action";
    }

    if (!ve.available) {
      bottleneckTitle = "Visa availability";
      bottleneckText = `Your Priority Date is not currently eligible for final action under the ${editionLong} Visa Bulletin. Even if ${post} reaches your DQ month, the visa-number gate still controls final issuance.`;
      bottleneckPill = {
        kind: v.fad === "U" ? "red" : "amber",
        text: v.fad === "U" ? "Unavailable" : "Visa Bulletin",
      };
    } else if (!postReached) {
      bottleneckTitle = `${post} interview queue`;
      bottleneckText = `Your Visa Bulletin gate is satisfied, but ${post} has not yet reached your DQ month. The visible bottleneck is currently the interview-post queue.`;
      bottleneckPill = { kind: "amber", text: "Post queue" };
    } else {
      bottleneckTitle = "Both published gates reached";
      bottleneckText =
        "Your Priority Date is eligible for final action and the published post cutoff has reached your DQ month. Actual scheduling still depends on case-specific and post-level processing.";
      bottleneckPill = { kind: "green", text: "Both gates reached" };
    }

    bh = bulletinHistory(bulletin, path, sub, charge);
    bulletinCaption = `${CATS[path][sub] || sub} · ${CHARGES[charge]} · Final Action Date`;
    const bm =
      bh.length > 1
        ? describeVBMove(bh[bh.length - 2]!.value, bh[bh.length - 1]!.value)
        : null;
    bulletinMovement = bm ? bm.text : "Not enough history to compare.";
    changeVisa = {
      title: bm ? bm.title : "No comparison",
      text: bm ? bm.text : "Not enough historical data.",
    };
  }

  let stepPostClass: "done" | "active" | "pending";
  let stepPostTitle: string;
  let stepPostText: string;
  if (postReached) {
    stepPostClass = "done";
    stepPostTitle = "Post has reached your DQ";
    stepPostText = "Published cutoff has reached your DQ month";
  } else if (path === "relative" || ve.available) {
    stepPostClass = "active";
    stepPostTitle = "Waiting on post queue";
    stepPostText = "Post cutoff has not yet reached your DQ month";
  } else {
    stepPostClass = "pending";
    stepPostTitle = "Post queue comes next";
    stepPostText = "Checked after visa availability clears";
  }

  let postStatus: StatusPill;
  let postExplain: string;
  if (!cut || !dq) {
    postStatus = { kind: "amber", text: "Insufficient data" };
    postExplain =
      "The supplied history does not contain a usable cutoff for this selection.";
  } else if (postReached) {
    postStatus = { kind: "green", text: "DQ month reached" };
    postExplain =
      "The published NVC scheduling month has reached or passed your DQ month. This does not by itself guarantee that an interview has been scheduled.";
  } else {
    postStatus = { kind: "amber", text: "Waiting on post" };
    postExplain =
      `Your DQ month is ${gap} month${gap === 1 ? "" : "s"} newer than the post's published scheduling cutoff — about ${gap} month${gap === 1 ? "" : "s"} still to go.` +
      (etaDisplay && paceRounded !== null
        ? ` At the trailing 6-month pace (${paceRounded} cutoff months per calendar month), that gap would take roughly ${etaDisplay} month${etaDisplay === "1" ? "" : "s"} if the pace continued.`
        : "");
  }

  let trendText = `${sigNow.text} `;
  if (postReached) {
    trendText +=
      "The published scheduling cutoff has already reached or passed your DQ month.";
  } else if (gap !== null) {
    trendText +=
      `Your DQ month is ${gap} month${gap === 1 ? "" : "s"} newer than the latest published cutoff — about ${gap} month${gap === 1 ? "" : "s"} still to go.` +
      (etaDisplay && paceRounded !== null
        ? ` Dividing that gap by the trailing 6-month pace (${paceRounded}) gives roughly ${etaDisplay} month${etaDisplay === "1" ? "" : "s"} if the same pace continued.`
        : "");
  }

  const defs: Array<[BroadCat, string]> = [
    ["EmploymentVisa", "Employment"],
    ["PreferenceVisa", "Family Preference"],
    ["RelativeVisa", "Immediate Relative"],
  ];
  const embassySnapshot = defs.map(([c, name]) => {
    const row = index.latestRow(post);
    const cutoff = row?.[c];
    const back = index.postBacklog(post, c);
    const mv = index.lastPostMove(post, c);
    const sig = index.postSignal(post, c);
    const backText =
      back === null
        ? "No backlog data"
        : back === 0
          ? "Current in latest edition"
          : `${back} month${back === 1 ? "" : "s"} behind latest edition`;
    return {
      name,
      date: cutoff ? prettyMon(cutoff) : "No data",
      meta: `${backText} · Latest move ${formatMove(mv)}`,
      signal: sig,
    };
  });

  const globalPct = (c: BroadCat) => {
    const vals = index.posts
      .map((p) => index.postBacklog(p, c))
      .filter((v): v is number => v !== null);
    const pct = vals.length
      ? (100 * vals.filter((v) => v === 0).length) / vals.length
      : 0;
    return `${pct.toFixed(1)}%`;
  };

  const mv = index.lastPostMove(post, cat);
  const curCut = r?.[cat];
  const changePost = {
    title:
      mv === null
        ? "No comparison"
        : mv > 0
          ? "Advanced"
          : mv < 0
            ? "Retrogressed"
            : "No movement",
    text:
      mv === null
        ? "Not enough post history to compare."
        : mv === 0
          ? `${post}'s published cutoff did not move from the prior available snapshot.`
          : `${post}'s published cutoff moved ${Math.abs(mv)} month${Math.abs(mv) === 1 ? "" : "s"} ${mv > 0 ? "forward" : "backward"} to ${prettyMon(curCut)}.`,
  };

  const changeOverall = {
    title:
      path === "relative"
        ? postReached
          ? "Queue cutoff reached"
          : "Waiting on post"
        : ve.available
          ? postReached
            ? "Both gates reached"
            : "Post is the bottleneck"
          : "Visa Bulletin is the bottleneck",
    text:
      path === "relative"
        ? `Your status is driven by the published Immediate Relative scheduling cutoff at ${post}.`
        : !ve.available
          ? "Visa availability must become eligible before final issuance."
          : !postReached
            ? "Visa availability is currently satisfied; the interview queue is the visible constraint."
            : "Both published eligibility gates are currently satisfied.",
  };

  return {
    editionPretty,
    editionLong,
    bottleneck: {
      title: bottleneckTitle,
      text: bottleneckText,
      pill: bottleneckPill,
    },
    visaGate: {
      visible: visaGateVisible,
      sub: `${editionLong} Visa Bulletin`,
      status: visaStatus,
      pdValue: prettyDateInput(pd),
      fadValue: ve.v ? prettyVB(ve.v.fad) : "—",
      dffValue: ve.v ? prettyVB(ve.v.dff) : "—",
      explain: visaExplain,
      watch,
    },
    postGate: {
      sub: `${post} · ${PATHNAMES[path]}`,
      status: postStatus,
      dqValue: dq
        ? dq.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "—",
      cutoff: r?.[cat] ? prettyMon(r[cat]) : "No data",
      catLabel:
        path === "relative"
          ? "Immediate Relative cutoff"
          : path === "family"
            ? "Family Preference cutoff"
            : "Employment Preference cutoff",
      gap: gap === null ? "—" : `${Math.max(0, gap)} mo`,
      gapSub:
        gap === null
          ? "no usable cutoff"
          : gap <= 0
            ? "published cutoff has reached your DQ month"
            : `${gap} month${gap === 1 ? "" : "s"} still to go`,
      explain: postExplain,
      momentum: {
        value: sigNow.label,
        sub:
          mvNow === null
            ? "Based on latest published update — not enough history"
            : mvNow === 0
              ? "Based on latest published update: no movement"
              : mvNow > 0
                ? `Based on latest published update: ${formatMove(mvNow)}`
                : `Based on latest published update: ${formatMove(mvNow)}`,
      },
      lastMove: {
        value: formatMove(mvNow),
        sub:
          mvNow === null
            ? "No prior comparison"
            : mvNow > 0
              ? "Moved forward in latest update"
              : mvNow < 0
                ? "Moved backward in latest update"
                : "No movement in latest update",
      },
      trendEstimate: {
        value: postReached
          ? "0 mo"
          : etaDisplay
            ? `~${etaDisplay} mo`
            : "—",
        sub: postReached
          ? "Cutoff already at or past your DQ"
          : etaDisplay && paceRounded !== null
            ? `Gap ÷ trailing 6-mo pace (${paceRounded} cutoff mo / calendar mo)`
            : "Trailing 6-month pace is zero or unavailable",
      },
    },
    trend: {
      title: `${sigNow.label}: latest-update signal`,
      text: trendText,
      caption: `${post} · ${PATHNAMES[path]} scheduling cutoff`,
      movement:
        paceRounded === null
          ? "Not enough history for a trailing 6-month pace. The momentum label above reflects only the latest published update."
          : `How to read this chart: when the blue line rises, NVC is scheduling newer DQ cases; a flat line means the latest updates stalled; a falling line means retrogression. Trailing 6-month pace: about ${paceRounded} cutoff months of movement per calendar month (separate from the latest-update momentum label).`,
    },
    steps: {
      dqText: `DQ: ${
        dq
          ? dq.toLocaleDateString("en-US", { month: "short", year: "numeric" })
          : "—"
      }`,
      visaClass: stepVisaClass,
      visaTitle: stepVisaTitle,
      visaText: stepVisaText,
      postClass: stepPostClass,
      postTitle: stepPostTitle,
      postText: stepPostText,
    },
    embassySnapshot,
    global: {
      employment: globalPct("EmploymentVisa"),
      preference: globalPct("PreferenceVisa"),
      relative: globalPct("RelativeVisa"),
      caption: `Latest supplied edition: ${editionPretty}. “Current” means the published scheduling cutoff matches that edition month.`,
    },
    bulletinHistory: bh.map((x) => ({
      edition: x.edition,
      value: prettyVB(x.value),
    })),
    bulletinCaption,
    bulletinMovement,
    changes: {
      visa: changeVisa,
      post: changePost,
      overall: changeOverall,
    },
    chart: { post, cat, dq },
    ranksCat: cat,
  };
}

export function explorerRows(
  bulletin: VisaBulletin,
  path: "employment" | "family",
) {
  return Object.entries(bulletin.current[path]).map(([cat, v]) => ({
    key: cat,
    label: CATS[path][cat] || cat,
    cells: (["row", "china", "india", "mexico", "philippines"] as const).map(
      (ch) => ({
        fad: v.fad[ch],
        dff: v.dff[ch],
      }),
    ),
  }));
}

export type RankRow = {
  post: string;
  b: number;
  cut: string;
  mv: number | null;
  rank: number;
  selected: boolean;
};

export function rankRows(
  index: NvcIndex,
  cat: BroadCat,
  options?: { selectedPost?: string; limit?: number | null },
): RankRow[] {
  const all = index.posts
    .map((post) => ({
      post,
      b: index.postBacklog(post, cat),
      cut: index.latestRow(post)?.[cat] || "",
      mv: index.lastPostMove(post, cat),
    }))
    .filter((x): x is typeof x & { b: number } => x.b !== null)
    .sort((a, b) => b.b - a.b)
    .map((x, i) => ({
      ...x,
      rank: i + 1,
      selected: x.post === options?.selectedPost,
    }));

  const limit = options?.limit;
  if (limit == null || limit >= all.length) return all;

  const top = all.slice(0, limit);
  const selected = all.find((x) => x.selected);
  if (selected && !top.some((x) => x.post === selected.post)) {
    return [...top, selected];
  }
  return top;
}

export function chartSeries(
  index: NvcIndex,
  post: string,
  cat: BroadCat,
): Array<{ edition: string; cutoff: string }> {
  return index
    .rowsFor(post)
    .filter((r) => parseMon(r[cat] ?? null))
    .map((r) => ({ edition: r.Edition, cutoff: r[cat] || "—" }));
}

export function drawPostChart(
  canvas: HTMLCanvasElement,
  index: NvcIndex,
  post: string,
  cat: BroadCat,
  dq: Date | null,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const W = Math.max(1, rect.width);
  const H = Math.max(1, rect.height);
  canvas.width = Math.round(W * ratio);
  canvas.height = Math.round(H * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const brand = "#1474e1";
  const muted = "#747474";
  const ink = "#131349";
  const line = "#e5e5e5";
  const amber = "#8a6d00";
  const narrow = W < 420;

  const rs = index.rowsFor(post).filter((r) => parseMon(r[cat] ?? null));
  if (rs.length < 2) {
    ctx.fillStyle = muted;
    ctx.font = "13px var(--font-figtree), system-ui, sans-serif";
    ctx.fillText("Not enough history to chart.", 16, 28);
    return;
  }

  const vals = rs.map((r) => monthIdx(parseMon(r[cat]!))!);
  const dqIdx = dq ? monthIdx(dq) : null;
  let min = Math.min(...vals, dqIdx !== null ? dqIdx : Infinity);
  let max = Math.max(...vals, dqIdx !== null ? dqIdx : -Infinity);
  min -= 1;
  max += 1;

  const left = narrow ? 52 : 104;
  const right = narrow ? 14 : 28;
  const top = narrow ? 36 : 28;
  const bottom = 52;
  const x = (i: number) => left + (i * (W - left - right)) / (rs.length - 1);
  const y = (v: number) =>
    top + ((max - v) * (H - top - bottom)) / Math.max(1, max - min);

  ctx.font = "11px var(--font-figtree), system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const range = max - min;
  const step = Math.max(1, Math.ceil(range / 6));
  for (let v = min; v <= max; v += step) {
    const yy = y(v);
    ctx.strokeStyle = line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, yy);
    ctx.lineTo(W - right, yy);
    ctx.stroke();
    const d = new Date(Math.floor(v / 12), v % 12, 1);
    ctx.fillStyle = muted;
    ctx.fillText(
      d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      left - 8,
      yy,
    );
  }

  if (dqIdx !== null) {
    const yy = y(dqIdx);
    ctx.setLineDash([7, 6]);
    ctx.strokeStyle = "#b7791f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, yy);
    ctx.lineTo(W - right, yy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = amber;
    ctx.textAlign = "left";
    ctx.font = "600 11px var(--font-figtree), system-ui, sans-serif";
    const dqLabelX = Math.min(W - right - 54, left + 8);
    ctx.fillText("Your DQ", dqLabelX, Math.max(top + 10, yy - 10));
  }

  ctx.strokeStyle = brand;
  ctx.lineWidth = 3;
  ctx.beginPath();
  vals.forEach((v, i) =>
    i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)),
  );
  ctx.stroke();

  vals.forEach((v, i) => {
    ctx.fillStyle = brand;
    ctx.beginPath();
    ctx.arc(x(i), y(v), narrow ? 3 : 4, 0, Math.PI * 2);
    ctx.fill();
    const labelEveryPoint = narrow ? i === vals.length - 1 : true;
    if (
      labelEveryPoint &&
      (i === vals.length - 1 ||
        (i > 0 &&
          vals[i] !== vals[i - 1] &&
          (i === 1 ||
            i === vals.length - 2 ||
            Math.abs(vals[i]! - vals[i - 1]!) >= 2)))
    ) {
      ctx.font = "600 10px var(--font-figtree), system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = ink;
      ctx.fillText(rs[i]![cat]!, x(i), Math.max(top + 10, y(v) - 11));
    }
  });

  ctx.font = "10.5px var(--font-figtree), system-ui, sans-serif";
  ctx.fillStyle = muted;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const labelEvery = rs.length > (narrow ? 6 : 10) ? 2 : 1;
  rs.forEach((r, i) => {
    if (i % labelEvery === 0 || i === rs.length - 1) {
      ctx.fillText(r.Edition, x(i), H - 22);
    }
  });
  ctx.textAlign = "left";
  ctx.font = "600 11px var(--font-figtree), system-ui, sans-serif";
  ctx.fillStyle = muted;
  ctx.fillText(
    narrow ? "Monthly NVC update" : "Published monthly NVC update",
    left,
    H - 6,
  );

  if (narrow) {
    ctx.textAlign = "left";
    ctx.font = "600 10px var(--font-figtree), system-ui, sans-serif";
    ctx.fillText("Newer DQ months = progress →", left, 16);
  } else {
    ctx.save();
    ctx.translate(18, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("DQ month NVC is scheduling → newer is better", 0, 0);
    ctx.restore();
  }
}
