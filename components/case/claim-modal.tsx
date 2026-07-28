"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";

type ClaimModalProps = {
  receipt: string;
};

export function ClaimModal({ receipt }: ClaimModalProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const caseReceipt = pathname.match(/\/case\/([A-Z0-9]{13})/i)?.[1];
  const displayReceipt = caseReceipt?.toUpperCase() ?? receipt;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("uscasestatus:open-claim", onOpen);
    return () => window.removeEventListener("uscasestatus:open-claim", onOpen);
  }, []);

  function claimCase() {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("uscasestatus:case-claimed"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!mounted) {
    return null;
  }

  return (
      <div
        className={`overlay${open ? " open" : ""}`}
        id="claimModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="claimTitle"
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <div className="modal">
          <div className="modal-h">
            <div>
              <h3 id="claimTitle">Claim {displayReceipt}</h3>
              <p>
                Answer what you know. Every detail narrows the cases we compare
                you against — you can skip anything and add it later.
              </p>
            </div>
            <button
              className="x"
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="modal-b">
            <div className="progress">
              <div className="bar">
                <i />
              </div>
              <small>Step 1 of 2 · Your filing</small>
            </div>

            <div className="field">
              <label htmlFor="cob">Country of birth</label>
              <select id="cob" defaultValue="Nigeria">
                <option>Select a country</option>
                <option>Nigeria</option>
                <option>India</option>
                <option>China</option>
                <option>Brazil</option>
                <option>Pakistan</option>
                <option>Other</option>
              </select>
              <div className="hint">
                Determines whether visa retrogression applies to you. For India
                and China this changes the timeline substantially.
              </div>
            </div>

            <div className="field">
              <label>Did you file with premium processing (Form I-907)?</label>
              <div className="radio-row">
                <label>
                  <input type="radio" name="pp" defaultChecked /> Yes
                </label>
                <label>
                  <input type="radio" name="pp" /> No
                </label>
                <label>
                  <input type="radio" name="pp" /> Not sure
                </label>
              </div>
              <div className="hint">
                Premium processing puts USCIS on a 15-business-day clock — a
                completely different estimate from the queue math.
              </div>
            </div>

            <div className="field">
              <label htmlFor="cat">Visa category</label>
              <select id="cat" defaultValue="EB-1 · Extraordinary ability or outstanding researcher">
                <option>Select a category</option>
                <option>
                  EB-1 · Extraordinary ability or outstanding researcher
                </option>
                <option>EB-2 NIW · National interest waiver</option>
                <option>EB-2 · Advanced degree</option>
                <option>EB-3 · Skilled worker</option>
                <option>Not sure</option>
              </select>
              <div className="hint">
                Approval rates in your block range from 71% to 94% depending on
                category.
              </div>
            </div>

            <div className="field">
              <label htmlFor="ctr">Service center handling your case</label>
              <select id="ctr" defaultValue="Texas Service Center (TSC)">
                <option>Select a center</option>
                <option>Texas Service Center (TSC)</option>
                <option>Nebraska Service Center (NSC)</option>
                <option>California Service Center (CSC)</option>
                <option>Vermont Service Center (VSC)</option>
                <option>Not sure — find it from my receipt</option>
              </select>
              <div className="hint">
                Median time from filing to approval differs by roughly four
                months between the fastest and slowest centers.
              </div>
            </div>

            <p className="later">
              Next: priority date, concurrent filings, and any RFE you&apos;ve
              received. You can also add those later from your case page.
            </p>
          </div>
          <div className="modal-f">
            <div className="privacy">
              Stored against your account only. Never sold, never shared, never
              sent to USCIS.
            </div>
            <button className="button" type="button" onClick={claimCase}>
              Save and continue
            </button>
          </div>
        </div>
      </div>
  );
}

export function openClaimModal() {
  window.dispatchEvent(new CustomEvent("uscasestatus:open-claim"));
}
