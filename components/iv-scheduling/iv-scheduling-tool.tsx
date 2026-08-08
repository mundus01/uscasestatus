"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { CATS, DEFAULT_SUBCATEGORY } from "@/lib/iv-scheduling/constants";
import { ivSchedulingData } from "@/lib/iv-scheduling/data";
import {
  analyzeCase,
  broadCat,
  createNvcIndex,
  drawPostChart,
  explorerRows,
  formatMove,
  prettyVB,
  rankRows,
} from "@/lib/iv-scheduling/engine";
import type {
  BroadCat,
  ChargeKey,
  VisaPath,
} from "@/lib/iv-scheduling/types";

const DOS_SOURCE =
  "https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/iv-wait-times.html";

type Props = {
  eyebrow: string;
  title: string;
  lede: string;
};

export function IvSchedulingTool({ eyebrow, title, lede }: Props) {
  const { nvc, bulletin } = ivSchedulingData;
  const index = useMemo(() => createNvcIndex(nvc), [nvc]);

  const [path, setPath] = useState<VisaPath>("employment");
  const [subcategory, setSubcategory] = useState("EB2");
  const [charge, setCharge] = useState<ChargeKey>("row");
  const [priorityDate, setPriorityDate] = useState("2024-03-14");
  const [post, setPost] = useState(() =>
    index.posts.includes("Lagos") ? "Lagos" : (index.posts[0] ?? ""),
  );
  const [dqMonth, setDqMonth] = useState("2025-06");
  const [explorerPath, setExplorerPath] = useState<"employment" | "family">(
    "employment",
  );
  const [rankCat, setRankCat] = useState<BroadCat>("EmploymentVisa");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const analysis = useMemo(
    () =>
      analyzeCase(nvc, bulletin, index, {
        path,
        subcategory,
        charge,
        priorityDate,
        post,
        dqMonth,
      }),
    [nvc, bulletin, index, path, subcategory, charge, priorityDate, post, dqMonth],
  );

  const explorer = useMemo(
    () => explorerRows(bulletin, explorerPath),
    [bulletin, explorerPath],
  );

  const ranks = useMemo(
    () => rankRows(index, rankCat),
    [index, rankCat],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wrap = canvas.parentElement;

    const paint = () => {
      drawPostChart(
        canvas,
        index,
        analysis.chart.post,
        analysis.chart.cat,
        analysis.chart.dq,
      );
    };

    paint();
    window.addEventListener("resize", paint);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && wrap) {
      ro = new ResizeObserver(paint);
      ro.observe(wrap);
    }
    return () => {
      window.removeEventListener("resize", paint);
      ro?.disconnect();
    };
  }, [index, analysis.chart]);

  function onPathChange(next: VisaPath) {
    setPath(next);
    setSubcategory(DEFAULT_SUBCATEGORY[next]);
    setRankCat(broadCat(next));
    if (next === "employment" || next === "family") {
      setExplorerPath(next);
    }
  }

  const pref = path !== "relative";

  return (
    <div className="iv-tool">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>

      <nav className="iv-toc" aria-label="On this page">
        <a href="#analysis">NVC status</a>
        <a href="#nvc-history">Interview trends</a>
        <a href="#explorer">Visa Bulletin</a>
        <a href="#posts">Embassy wait times</a>
      </nav>

      <div className="iv-builder">
        <h2>Check your NVC interview scheduling status</h2>
        <div className="iv-caption">
          Enter your case details to analyze your NVC DQ queue, immigrant visa
          interview wait, and Visa Bulletin eligibility.
        </div>
        <div className="iv-formgrid">
          <div className="iv-field">
            <label htmlFor="iv-path">Visa path</label>
            <select
              id="iv-path"
              value={path}
              onChange={(e) => onPathChange(e.target.value as VisaPath)}
            >
              <option value="employment">Employment-based preference</option>
              <option value="family">Family-sponsored preference</option>
              <option value="relative">Immediate Relative</option>
            </select>
          </div>

          <div className={`iv-field${pref ? "" : " hidden"}`}>
            <label htmlFor="iv-subcategory">Visa category</label>
            <select
              id="iv-subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            >
              {Object.entries(CATS[path]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className={`iv-field${pref ? "" : " hidden"}`}>
            <label htmlFor="iv-charge">Country of chargeability</label>
            <select
              id="iv-charge"
              value={charge}
              onChange={(e) => setCharge(e.target.value as ChargeKey)}
            >
              <option value="row">All other chargeability areas</option>
              <option value="china">China — mainland born</option>
              <option value="india">India</option>
              <option value="mexico">Mexico</option>
              <option value="philippines">Philippines</option>
            </select>
          </div>

          <div className={`iv-field${pref ? "" : " hidden"}`}>
            <label htmlFor="iv-pd">Priority Date</label>
            <input
              id="iv-pd"
              type="date"
              value={priorityDate}
              onChange={(e) => setPriorityDate(e.target.value)}
            />
          </div>

          <div className="iv-field">
            <label htmlFor="iv-post">Interview post</label>
            <select
              id="iv-post"
              value={post}
              onChange={(e) => setPost(e.target.value)}
            >
              {index.posts.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="iv-field">
            <label htmlFor="iv-dq">Documentarily qualified month</label>
            <input
              id="iv-dq"
              type="month"
              value={dqMonth}
              onChange={(e) => setDqMonth(e.target.value)}
            />
          </div>
        </div>
        <div className="iv-actions">
          <a className="button" href="#analysis">
            Analyze my case
          </a>
        </div>
      </div>

      <section className="iv-section iv-seocopy" id="about-nvc-tool">
        <div className="iv-panel">
          <div className="iv-sectionhead">
            <div>
              <h2>How the NVC IV Scheduling Status Tool works</h2>
              <div className="iv-caption">
                Understand your NVC interview queue instead of looking at a
                single scheduling date.
              </div>
            </div>
          </div>
          <p>
            The U.S. Department of State&apos;s{" "}
            <strong>IV Scheduling Status Tool</strong> shows the documentarily
            complete month and year for which the National Visa Center (NVC) is
            scheduling most immigrant visa interviews at a selected U.S. embassy
            or consulate. This tracker builds on that monthly NVC scheduling
            data by adding{" "}
            <strong>
              historical movement, interview-post backlog, DQ queue gap, Visa
              Bulletin eligibility, and case-specific bottleneck analysis
            </strong>
            .
          </p>
          <p>
            Use the tool to check your{" "}
            <strong>NVC interview scheduling status</strong>, compare your DQ
            month with the current embassy or consulate cutoff, and understand
            whether your immigrant visa case is mainly waiting on the{" "}
            <strong>NVC interview queue</strong> or on your{" "}
            <strong>Priority Date becoming current</strong>. The official IV
            Scheduling Status Tool is updated monthly and does not guarantee an
            exact interview date.
          </p>
        </div>
      </section>

      <section className="iv-section" id="analysis">
        <div className="iv-panel iv-bottleneck">
          <div>
            <div className="iv-label">Your primary bottleneck</div>
            <h2>{analysis.bottleneck.title}</h2>
            <p>{analysis.bottleneck.text}</p>
          </div>
          <div className={`iv-pill ${analysis.bottleneck.pill.kind}`}>
            {analysis.bottleneck.pill.text}
          </div>
        </div>

        <div
          className={`iv-gates${analysis.visaGate.visible ? "" : " is-single"}`}
        >
          <div
            className={`iv-panel${analysis.visaGate.visible ? "" : " hidden"}`}
          >
            <div className="iv-gatehead">
              <div>
                <h3>Visa Bulletin &amp; Priority Date eligibility</h3>
                <div className="iv-caption">{analysis.visaGate.sub}</div>
              </div>
              <div className={`iv-pill ${analysis.visaGate.status.kind}`}>
                {analysis.visaGate.status.text}
              </div>
            </div>
            <div className="iv-gatebody">
              <div className="iv-stat">
                <div className="k">Your Priority Date</div>
                <div className="v">{analysis.visaGate.pdValue}</div>
                <div className="s">case priority</div>
              </div>
              <div className="iv-stat">
                <div className="k">Final Action Date</div>
                <div className="v">{analysis.visaGate.fadValue}</div>
                <div className="s">visa-number gate</div>
              </div>
              <div className="iv-stat">
                <div className="k">Date for Filing</div>
                <div className="v">{analysis.visaGate.dffValue}</div>
                <div className="s">NVC document gate</div>
              </div>
            </div>
            <div className="iv-explain">{analysis.visaGate.explain}</div>
            {analysis.visaGate.watch ? (
              <div className="iv-watch">
                <strong>DOS watch</strong>
                <p>{analysis.visaGate.watch}</p>
              </div>
            ) : null}
          </div>

          <div className="iv-panel">
            <div className="iv-gatehead">
              <div>
                <h3>NVC interview scheduling queue</h3>
                <div className="iv-caption">{analysis.postGate.sub}</div>
              </div>
              <div className={`iv-pill ${analysis.postGate.status.kind}`}>
                {analysis.postGate.status.text}
              </div>
            </div>
            <div className="iv-gatebody">
              <div className="iv-stat">
                <div className="k">Your DQ month</div>
                <div className="v">{analysis.postGate.dqValue}</div>
                <div className="s">documentarily qualified</div>
              </div>
              <div className="iv-stat">
                <div className="k">Post scheduling</div>
                <div className="v">{analysis.postGate.cutoff}</div>
                <div className="s">{analysis.postGate.catLabel}</div>
              </div>
              <div className="iv-stat">
                <div className="k">Queue gap</div>
                <div className="v">{analysis.postGate.gap}</div>
                <div className="s">{analysis.postGate.gapSub}</div>
              </div>
            </div>
            <div className="iv-postintel">
              <div className="iv-intel">
                <div className="k">Scheduling momentum</div>
                <div className="v">{analysis.postGate.momentum.value}</div>
                <div className="s">{analysis.postGate.momentum.sub}</div>
              </div>
              <div className="iv-intel">
                <div className="k">Last-month movement</div>
                <div className="v">{analysis.postGate.lastMove.value}</div>
                <div className="s">{analysis.postGate.lastMove.sub}</div>
              </div>
              <div className="iv-intel">
                <div className="k">Trend-based estimate</div>
                <div className="v">{analysis.postGate.trendEstimate.value}</div>
                <div className="s">{analysis.postGate.trendEstimate.sub}</div>
              </div>
            </div>
            <div className="iv-explain">{analysis.postGate.explain}</div>
          </div>
        </div>
      </section>

      <section className="iv-section" id="nvc-history">
        <div className="iv-panel">
          <div className="iv-sectionhead">
            <div>
              <h2>NVC interview scheduling history</h2>
              <div className="iv-caption">{analysis.trend.caption}</div>
            </div>
          </div>
          <div className="iv-chartlegend">
            <div className="iv-legenditem">
              <span className="iv-legendline" />
              <span>NVC scheduling cutoff — newer/higher is progress</span>
            </div>
            <div className="iv-legenditem">
              <span className="iv-legendline dq" />
              <span>Your DQ month</span>
            </div>
          </div>
          <div className="iv-chartwrap">
            <canvas ref={canvasRef} />
          </div>
          <div className="iv-trendcallout">
            <strong>{analysis.trend.title}</strong>
            <p>{analysis.trend.text}</p>
          </div>
          <div className="iv-explain">{analysis.trend.movement}</div>
        </div>
      </section>

      <section className="iv-section">
        <div className="iv-sectionhead">
          <div>
            <h2>Your case journey</h2>
            <div className="iv-caption">
              The two independent gates that can control a preference immigrant
              visa case.
            </div>
          </div>
        </div>
        <div className="iv-steps">
          <div className="iv-step done">
            <div className="iv-stepno">1</div>
            <strong>Petition / case created</strong>
            <div>Your case has entered the immigrant visa process.</div>
          </div>
          <div className="iv-step done">
            <div className="iv-stepno">2</div>
            <strong>Documentarily qualified</strong>
            <div>{analysis.steps.dqText}</div>
          </div>
          <div className={`iv-step ${analysis.steps.visaClass}`}>
            <div className="iv-stepno">3</div>
            <strong>Visa number available</strong>
            <div>{analysis.steps.visaText}</div>
          </div>
          <div className={`iv-step ${analysis.steps.postClass}`}>
            <div className="iv-stepno">4</div>
            <strong>Post has reached your DQ</strong>
            <div>{analysis.steps.postText}</div>
          </div>
        </div>
      </section>

      <section className="iv-section" id="embassy-snapshot">
        <div className="iv-sectionhead">
          <div>
            <h2>{post} NVC scheduling snapshot</h2>
            <div className="iv-caption">
              See all three NVC scheduling categories for the selected U.S.
              embassy or consulate.
            </div>
          </div>
        </div>
        <div className="iv-snapshotgrid">
          {analysis.embassySnapshot.map((card) => (
            <div className="iv-snapshotcard" key={card.name}>
              <div className="name">{card.name}</div>
              <div className="date">{card.date}</div>
              <div className="meta">{card.meta}</div>
              <span className={`iv-signalbadge iv-pill ${card.signal.kind}`}>
                {card.signal.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="iv-section" id="global-status">
        <div className="iv-sectionhead">
          <div>
            <h2>Global NVC IV scheduling status</h2>
            <div className="iv-caption">{analysis.global.caption}</div>
          </div>
        </div>
        <div className="iv-globalgrid">
          <div className="iv-globalcard">
            <div className="name">Employment</div>
            <div className="pct">{analysis.global.employment}</div>
            <div className="iv-caption">posts current</div>
          </div>
          <div className="iv-globalcard">
            <div className="name">Family Preference</div>
            <div className="pct">{analysis.global.preference}</div>
            <div className="iv-caption">posts current</div>
          </div>
          <div className="iv-globalcard">
            <div className="name">Immediate Relative</div>
            <div className="pct">{analysis.global.relative}</div>
            <div className="iv-caption">posts current</div>
          </div>
        </div>
      </section>

      <section
        className={`iv-section${pref ? "" : " hidden"}`}
        id="history"
      >
        <div className="iv-panel">
          <div className="iv-sectionhead">
            <div>
              <h2>Visa Bulletin Priority Date movement</h2>
              <div className="iv-caption">{analysis.bulletinCaption}</div>
            </div>
          </div>
          <div className="iv-historyrow">
            {analysis.bulletinHistory.map((chip) => (
              <div className="iv-historychip" key={chip.edition}>
                <div className="m">{chip.edition}</div>
                <div className="d">{chip.value}</div>
              </div>
            ))}
          </div>
          <div className="iv-explain">{analysis.bulletinMovement}</div>
        </div>
      </section>

      <section className="iv-section">
        <div className="iv-sectionhead">
          <div>
            <h2>What changed this month?</h2>
            <div className="iv-caption">
              The latest signals relevant to your case.
            </div>
          </div>
        </div>
        <div className="iv-changes">
          <div className="iv-change">
            <div className="t">Visa Bulletin</div>
            <strong>{analysis.changes.visa.title}</strong>
            <p>{analysis.changes.visa.text}</p>
          </div>
          <div className="iv-change">
            <div className="t">Interview post</div>
            <strong>{analysis.changes.post.title}</strong>
            <p>{analysis.changes.post.text}</p>
          </div>
          <div className="iv-change">
            <div className="t">Overall position</div>
            <strong>{analysis.changes.overall.title}</strong>
            <p>{analysis.changes.overall.text}</p>
          </div>
        </div>
      </section>

      <section className="iv-section" id="explorer">
        <div className="iv-panel iv-tablebox">
          <div className="iv-toolbar">
            <div>
              <h2>
                {`${analysis.editionLong} Visa Bulletin & Priority Date tracker`}
              </h2>
              <div className="iv-caption">
                Check Final Action Dates and Dates for Filing for
                employment-based and family-sponsored immigrant visas.
              </div>
            </div>
            <div className="iv-explorerControls">
              <select
                value={explorerPath}
                onChange={(e) =>
                  setExplorerPath(e.target.value as "employment" | "family")
                }
                aria-label="Visa Bulletin path"
              >
                <option value="employment">Employment-based</option>
                <option value="family">Family-sponsored</option>
              </select>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>All other areas</th>
                <th>China</th>
                <th>India</th>
                <th>Mexico</th>
                <th>Philippines</th>
              </tr>
            </thead>
            <tbody>
              {explorer.map((row) => (
                <tr key={row.key}>
                  <td>
                    <strong>{row.label}</strong>
                  </td>
                  {row.cells.map((cell, i) => (
                    <td key={i}>
                      <VbCell value={cell.fad} /> ·{" "}
                      <VbCell value={cell.dff} plain />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="iv-caption iv-table-note">
            Each cell shows <strong>Final Action Date</strong> · Filing Date.
            “C” = Current; “U” = Unavailable.
          </div>
        </div>
      </section>

      <section className="iv-section" id="posts">
        <div className="iv-panel iv-tablebox">
          <div className="iv-toolbar">
            <div>
              <h2>NVC IV scheduling status by embassy or consulate</h2>
              <div className="iv-caption">
                Compare immigrant visa interview backlogs using the latest
                supplied NVC scheduling cutoff and recent queue movement.
              </div>
            </div>
            <div className="iv-seg" role="group" aria-label="Visa category">
              {(
                [
                  ["EmploymentVisa", "Employment"],
                  ["PreferenceVisa", "Family pref."],
                  ["RelativeVisa", "Immediate rel."],
                ] as const
              ).map(([cat, label]) => (
                <button
                  key={cat}
                  type="button"
                  className={rankCat === cat ? "active" : undefined}
                  onClick={() => setRankCat(cat)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Scheduling DQ cutoff</th>
                <th style={{ textAlign: "right" }}>Backlog</th>
                <th style={{ textAlign: "right" }}>Latest movement</th>
              </tr>
            </thead>
            <tbody>
              {ranks.map((row, i) => (
                <tr key={row.post}>
                  <td>
                    <strong>
                      {i + 1}. {row.post}
                    </strong>
                  </td>
                  <td>{row.cut}</td>
                  <td className="num">{row.b} mo</td>
                  <td className="num">{formatMove(row.mv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="iv-section iv-seocopy" id="nvc-faq">
        <div className="iv-panel">
          <div className="iv-sectionhead">
            <div>
              <h2>NVC IV Scheduling Tool FAQ</h2>
              <div className="iv-caption">
                Common questions about NVC interview scheduling, DQ dates, and
                Visa Bulletin eligibility.
              </div>
            </div>
          </div>
          <div className="iv-faq">
            <div className="iv-faqitem">
              <h3>What is the NVC IV Scheduling Status Tool?</h3>
              <p>
                The Department of State&apos;s IV Scheduling Status Tool shows
                the documentarily complete month and year for which NVC is
                scheduling most immigrant visa interviews at a selected U.S.
                embassy or consulate. uscasestatus adds historical queue
                movement and case-specific analysis to that scheduling data.
              </p>
            </div>
            <div className="iv-faqitem">
              <h3>How can I estimate my NVC interview wait time?</h3>
              <p>
                Select your interview post and visa category, then enter your
                documentarily qualified (DQ) month. The tracker compares your DQ
                month with the current NVC scheduling cutoff and shows the size
                of your queue gap and recent post movement. It is a trend
                analysis, not a guaranteed interview-date prediction.
              </p>
            </div>
            <div className="iv-faqitem">
              <h3>What does DQ mean at NVC?</h3>
              <p>
                DQ means documentarily qualified or documentarily complete. It
                refers to the point when NVC has received and reviewed the
                required fees and documents for the immigrant visa case. NVC
                interview scheduling is generally organized around when cases
                became documentarily complete.
              </p>
            </div>
            <div className="iv-faqitem">
              <h3>Does the Visa Bulletin affect NVC interview scheduling?</h3>
              <p>
                Yes for family-sponsored and employment-based preference visas.
                A visa must be available under the applicable Visa Bulletin
                category before final issuance. Immediate Relative immigrant
                visas are not subject to the same preference-category numerical
                limits.
              </p>
            </div>
            <div className="iv-faqitem">
              <h3>How often does NVC update IV scheduling status?</h3>
              <p>
                The Department of State says the IV Scheduling Status Tool is
                updated monthly. This tool uses monthly NVC scheduling history
                so you can see whether a post is advancing, stalled, or moving
                backward instead of viewing only the latest cutoff.
              </p>
            </div>
          </div>
        </div>
      </section>

      <p className="iv-disclaimer">
        <strong>Independent NVC scheduling tracker:</strong> uscasestatus is not
        affiliated with the U.S. Department of State or National Visa Center.{" "}
        {`Visa availability is evaluated against the ${analysis.editionLong} U.S. Department of State Visa Bulletin.`}{" "}
        A preference applicant generally needs a Priority Date earlier than the
        applicable Final Action Date for a visa number to be available; “C”
        means Current and “U” means Unavailable. Immediate Relative cases bypass
        this numerically limited Visa Bulletin gate. NVC interview intelligence
        uses the supplied IV scheduling-status history and compares a
        user&apos;s DQ month with the post&apos;s published scheduling month.
        Queue gaps and historical trends are informational only and are not
        guarantees of an immigrant visa interview date. Official source:{" "}
        <a href={DOS_SOURCE} target="_blank" rel="noopener noreferrer">
          Department of State IV Scheduling Status Tool
        </a>
        .
        {bulletin.sourceUrl ? (
          <>
            {" "}
            Current bulletin:{" "}
            <a
              href={bulletin.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {`${analysis.editionLong} Visa Bulletin`}
            </a>
            .
          </>
        ) : null}
      </p>

    </div>
  );
}

function VbCell({
  value,
  plain = false,
}: {
  value: string;
  plain?: boolean;
}) {
  if (value === "C") {
    return plain ? <>C</> : <span className="iv-tag c">C</span>;
  }
  if (value === "U") {
    return plain ? <>U</> : <span className="iv-tag u">U</span>;
  }
  return <>{prettyVB(value)}</>;
}
