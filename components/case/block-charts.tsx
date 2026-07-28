/** Static chart markup from uscasestatus-final.html — visual design locked. */

export function WeeklyBlockChart() {
  return (
    <section className="card">
      <div className="card-h">
        <h3>Your block, week by week</h3>
        <span className="meta">Receipt block</span>
      </div>
      <div className="card-b">
        <svg
          viewBox="0 0 360 152"
          width="100%"
          aria-label="Weekly decisions in your block over eight weeks, between 33 and 58 per week, split into approved, RFE and denied."
        >
          <line x1="34" y1="120" x2="352" y2="120" stroke="#e5e5e5" />
          <line x1="34" y1="80" x2="352" y2="80" stroke="#f1f1f1" />
          <line x1="34" y1="40" x2="352" y2="40" stroke="#f1f1f1" />
          <text x="28" y="124" fontSize="9" fill="#747474" textAnchor="end">
            0
          </text>
          <text x="28" y="84" fontSize="9" fill="#747474" textAnchor="end">
            30
          </text>
          <text x="28" y="44" fontSize="9" fill="#747474" textAnchor="end">
            60
          </text>
          <rect x="42" y="86.7" width="24" height="33.3" fill="#25d0a4" rx="2" />
          <rect x="42" y="78.7" width="24" height="8" fill="#f9da47" />
          <rect x="42" y="73.4" width="24" height="5.3" fill="#fa105d" rx="2" />
          <rect x="82" y="80" width="24" height="40" fill="#25d0a4" rx="2" />
          <rect x="82" y="69.3" width="24" height="10.7" fill="#f9da47" />
          <rect x="82" y="62.7" width="24" height="6.6" fill="#fa105d" rx="2" />
          <rect x="122" y="88" width="24" height="32" fill="#25d0a4" rx="2" />
          <rect x="122" y="81.3" width="24" height="6.7" fill="#f9da47" />
          <rect x="122" y="76" width="24" height="5.3" fill="#fa105d" rx="2" />
          <rect x="162" y="69.3" width="24" height="50.7" fill="#25d0a4" rx="2" />
          <rect x="162" y="57.3" width="24" height="12" fill="#f9da47" />
          <rect x="162" y="49.3" width="24" height="8" fill="#fa105d" rx="2" />
          <rect x="202" y="76" width="24" height="44" fill="#25d0a4" rx="2" />
          <rect x="202" y="66.7" width="24" height="9.3" fill="#f9da47" />
          <rect x="202" y="60" width="24" height="6.7" fill="#fa105d" rx="2" />
          <rect x="242" y="65.3" width="24" height="54.7" fill="#25d0a4" rx="2" />
          <rect x="242" y="52" width="24" height="13.3" fill="#f9da47" />
          <rect x="242" y="42.7" width="24" height="9.3" fill="#fa105d" rx="2" />
          <rect x="282" y="72" width="24" height="48" fill="#25d0a4" rx="2" />
          <rect x="282" y="61.3" width="24" height="10.7" fill="#f9da47" />
          <rect x="282" y="54.7" width="24" height="6.6" fill="#fa105d" rx="2" />
          <rect x="322" y="68" width="24" height="52" fill="#25d0a4" rx="2" />
          <rect x="322" y="56" width="24" height="12" fill="#f9da47" />
          <rect x="322" y="48" width="24" height="8" fill="#fa105d" rx="2" />
          <text x="54" y="134" fontSize="9" fill="#747474" textAnchor="middle">
            Jun 8
          </text>
          <text x="174" y="134" fontSize="9" fill="#747474" textAnchor="middle">
            Jun 29
          </text>
          <text x="334" y="134" fontSize="9" fill="#747474" textAnchor="middle">
            Jul 20
          </text>
          <rect x="42" y="144" width="8" height="8" fill="#25d0a4" rx="2" />
          <text x="54" y="151" fontSize="9" fill="#565656">
            Approved
          </text>
          <rect x="112" y="144" width="8" height="8" fill="#f9da47" rx="2" />
          <text x="124" y="151" fontSize="9" fill="#565656">
            RFE
          </text>
          <rect x="156" y="144" width="8" height="8" fill="#fa105d" rx="2" />
          <text x="168" y="151" fontSize="9" fill="#565656">
            Denied
          </text>
        </svg>
        <p className="chart-note">
          Your block averaged <b>~46 decisions per week</b> across the last eight
          weeks, steady to slightly rising. This is the number driving the
          estimate above.
        </p>
      </div>
    </section>
  );
}

export function NationwidePaceChart({ formType }: { formType: string | null }) {
  return (
    <section className="card">
      <div className="card-h">
        <h3>Is USCIS speeding up?</h3>
        <span className="meta">All {formType ?? "forms"}, nationwide</span>
      </div>
      <div className="card-b">
        <svg
          viewBox="0 0 360 152"
          width="100%"
          aria-label="Monthly approvals nationwide February through July."
        >
          <line x1="34" y1="120" x2="352" y2="120" stroke="#e5e5e5" />
          <line x1="34" y1="75" x2="352" y2="75" stroke="#f1f1f1" />
          <line x1="34" y1="30" x2="352" y2="30" stroke="#f1f1f1" />
          <text x="28" y="124" fontSize="9" fill="#747474" textAnchor="end">
            0
          </text>
          <text x="28" y="79" fontSize="9" fill="#747474" textAnchor="end">
            8k
          </text>
          <text x="28" y="34" fontSize="9" fill="#747474" textAnchor="end">
            16k
          </text>
          <polyline
            points="60,53 116,50 172,46 228,48 284,42.5"
            fill="none"
            stroke="#1474e1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="284,42.5 340,49"
            fill="none"
            stroke="#1474e1"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
          <circle cx="60" cy="53" r="3.5" fill="#1474e1" />
          <circle cx="116" cy="50" r="3.5" fill="#1474e1" />
          <circle cx="172" cy="46" r="3.5" fill="#1474e1" />
          <circle cx="228" cy="48" r="3.5" fill="#1474e1" />
          <circle cx="284" cy="42.5" r="4" fill="#131349" />
          <circle
            cx="340"
            cy="49"
            r="4"
            fill="#fff"
            stroke="#1474e1"
            strokeWidth="2"
          />
          <text x="60" y="134" fontSize="9" fill="#747474" textAnchor="middle">
            Feb
          </text>
          <text x="116" y="134" fontSize="9" fill="#747474" textAnchor="middle">
            Mar
          </text>
          <text x="172" y="134" fontSize="9" fill="#747474" textAnchor="middle">
            Apr
          </text>
          <text x="228" y="134" fontSize="9" fill="#747474" textAnchor="middle">
            May
          </text>
          <text x="284" y="134" fontSize="9" fill="#747474" textAnchor="middle">
            Jun
          </text>
          <text x="340" y="134" fontSize="9" fill="#747474" textAnchor="middle">
            Jul*
          </text>
          <text
            x="284"
            y="34"
            fontSize="9.5"
            fontWeight="700"
            fill="#131349"
            textAnchor="middle"
          >
            13,776
          </text>
          <text x="338" y="64" fontSize="9" fill="#747474" textAnchor="middle">
            ~12.6k proj.
          </text>
          <text x="42" y="151" fontSize="8.5" fill="#747474">
            * projected from 11,376 approved through day 27
          </text>
        </svg>
        <p className="chart-note">
          July is tracking <b className="down">▾ 1,155 behind</b> June on the
          same day — a mild slowdown, not a stall. The pipeline has held steady
          since spring.
        </p>
      </div>
    </section>
  );
}
