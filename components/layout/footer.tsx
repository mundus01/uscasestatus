import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand">
            <Link className="brand" href="/">
              <span className="mark">CS</span>
              <span className="name">uscasestatus</span>
            </Link>
            <p>
              Plain-language USCIS case tracking. We turn a one-line status into
              something you can actually act on — and we show our math.
            </p>
            <LocaleSwitcher variant="footer" />
          </div>

          <div className="fcol">
            <h4>Check a case</h4>
            <ul>
              <li>
                <Link href="/">Look up a receipt number</Link>
              </li>
              <li>
                <Link href="/dashboard">Track my cases</Link>
              </li>
              <li>
                <Link href="/">Email alerts</Link>
              </li>
              <li>
                <Link href="/methodology">Receipt number decoder</Link>
              </li>
            </ul>
          </div>

          <div className="fcol">
            <h4>Understand</h4>
            <ul>
              <li>
                <Link href="/status">What each status means</Link>
              </li>
              <li>
                <Link href="/methodology">How we estimate timelines</Link>
              </li>
              <li>
                <Link href="/processing-times">Processing times</Link>
              </li>
              <li>
                <Link href="/insights">Visa bulletin</Link>
              </li>
              <li>
                <Link href="/status">Responding to an RFE</Link>
              </li>
            </ul>
          </div>

          <div className="fcol">
            <h4>Form guides</h4>
            <ul>
              <li>
                <Link href="/forms/i130-tracker">I-130 · Family petition</Link>
              </li>
              <li>
                <Link href="/forms/i140-tracker">I-140 · Worker petition</Link>
              </li>
              <li>
                <Link href="/forms/i485-tracker">I-485 · Adjust status</Link>
              </li>
              <li>
                <Link href="/forms/i765-tracker">I-765 · Work permit</Link>
              </li>
              <li>
                <Link href="/forms/n400-tracker">N-400 · Naturalization</Link>
              </li>
            </ul>
          </div>

          <div className="fcol">
            <h4>Company</h4>
            <ul>
              <li>
                <Link href="/methodology">About us</Link>
              </li>
              <li>
                <Link href="/methodology">Methodology</Link>
              </li>
              <li>
                <Link href="/insights">Insights</Link>
              </li>
              <li>
                <Link href="/">Contact support</Link>
              </li>
              <li>
                <Link href="/">Report a problem</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-disclaimer">
          <span className="flag" aria-hidden="true">
            !
          </span>
          <div className="cols">
            <p>
              <b>uscasestatus is an independent service.</b> We are not
              affiliated with, endorsed by, or connected to U.S. Citizenship and
              Immigration Services, the Department of Homeland Security, or any
              government agency. Official case information is always available
              free at uscis.gov.
            </p>
            <p>
              Nothing on this site is legal advice, and we are not a law firm.
              Estimates are statistical ranges based on observed case data, not
              predictions about your case. For advice about your situation, talk
              to a licensed immigration attorney or a DOJ-accredited
              representative.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <small>© {year} uscasestatus</small>
          <small className="sync">
            <span className="led" />
            USCIS data synced 12 minutes ago
          </small>
          <nav>
            <Link href="/methodology">Privacy</Link>
            <Link href="/methodology">Terms</Link>
            <Link href="/methodology">Cookie preferences</Link>
            <Link href="/methodology">Accessibility</Link>
            <Link href="/methodology">Do not sell my info</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
