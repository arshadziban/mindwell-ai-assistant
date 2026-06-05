import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import html2pdf from "html2pdf.js";

const customStyles = `
  .assess-scroll::-webkit-scrollbar { width: 8px; }
  .assess-scroll::-webkit-scrollbar-track { background: transparent; }
  .assess-scroll::-webkit-scrollbar-thumb { background: #0E748A; border-radius: 999px; }
  .assess-scroll::-webkit-scrollbar-thumb:hover { background: #0A5266; }

  input[type="range"] { -webkit-appearance: none; appearance: none; background: transparent; cursor: pointer; }
  input[type="range"]::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    background: #cdeef2;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #157f95;
    border: none;
    margin-top: -4px;
    box-shadow: 0 2px 8px rgba(21, 127, 149, 0.32);
    transition: box-shadow 0.2s ease;
  }
  input[type="range"]::-webkit-slider-thumb:hover {
    box-shadow: 0 3px 12px rgba(21, 127, 149, 0.45);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.45s ease both; }
  .fade-up-1 { animation-delay: 0.05s; }
  .fade-up-2 { animation-delay: 0.1s; }
  .fade-up-3 { animation-delay: 0.15s; }
  .fade-up-4 { animation-delay: 0.2s; }
  .fade-up-5 { animation-delay: 0.25s; }
  .fade-up-6 { animation-delay: 0.3s; }
  .fade-up-7 { animation-delay: 0.35s; }
  .fade-up-8 { animation-delay: 0.4s; }
  .fade-up-9 { animation-delay: 0.45s; }
  .fade-up-10 { animation-delay: 0.5s; }
  .fade-up-11 { animation-delay: 0.55s; }
  .fade-up-12 { animation-delay: 0.6s; }
  .fade-up-13 { animation-delay: 0.65s; }
  .fade-up-14 { animation-delay: 0.7s; }
  .fade-up-15 { animation-delay: 0.75s; }
  .fade-up-16 { animation-delay: 0.8s; }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  input[type="number"] { -moz-appearance: textfield; }

  .glass-dropdown-menu {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(18px) saturate(1.6);
    -webkit-backdrop-filter: blur(18px) saturate(1.6);
    border: 1px solid rgba(14,116,138,0.18);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(14,116,138,0.13), 0 1.5px 8px rgba(0,0,0,0.07);
    overflow-y: auto;
    max-height: 220px;
    animation: dropdownFadeIn 0.18s ease both;
  }
  .glass-dropdown-menu::-webkit-scrollbar { width: 5px; }
  .glass-dropdown-menu::-webkit-scrollbar-track { background: transparent; }
  .glass-dropdown-menu::-webkit-scrollbar-thumb { background: rgba(14,116,138,0.35); border-radius: 999px; }
  .glass-dropdown-menu::-webkit-scrollbar-thumb:hover { background: rgba(14,116,138,0.6); }
  @keyframes dropdownFadeIn {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .glass-dropdown-option {
    padding: 11px 16px;
    font-size: 14px;
    color: #1e3a42;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .glass-dropdown-option:hover {
    background: rgba(14,116,138,0.09);
    color: #0E748A;
  }
  .glass-dropdown-option.selected {
    background: linear-gradient(90deg, rgba(14,116,138,0.13) 0%, rgba(14,116,138,0.06) 100%);
    color: #0E748A;
    font-weight: 600;
  }
  .glass-dropdown-option + .glass-dropdown-option {
    border-top: 1px solid rgba(14,116,138,0.07);
  }
  .glass-dropdown-trigger {
    width: 100%;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(203,213,225,0.8);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 14px;
    color: #0f172a;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    user-select: none;
  }
  .glass-dropdown-trigger:hover { border-color: #0E748A; }
  .glass-dropdown-trigger.open {
    border-color: #0E748A;
    box-shadow: 0 0 0 3px rgba(14,116,138,0.12);
  }
  .glass-dropdown-trigger.placeholder { color: #94a3b8; }
  .glass-dropdown-chevron {
    transition: transform 0.22s ease;
    color: #0E748A;
    flex-shrink: 0;
  }
  .glass-dropdown-chevron.open { transform: rotate(180deg); }
`;

function Header() {
  return (
    <div className="fade-up fade-up-1 mb-10 sm:mb-12 pb-8 border-b border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-[22px] font-semibold text-slate-900">Mind Well</h1>
      </div>
      <h2 className="text-[26px] font-semibold text-slate-900 mb-3">Personal Wellness Assessment</h2>
      <p className="text-[14px] font-normal text-slate-500" style={{ lineHeight: "1.7" }}>
        Welcome to your digital health review. This data-driven survey helps us understand your screen habits and mental wellness. Please provide accurate reflections of your past 7 days.
      </p>
    </div>
  );
}


function InlineField({ icon, label, unit, children, delay }) {
  return (
    <div className={`fade-up fade-up-${delay}`}>
      <label className="block text-[12px] tracking-[0.02em] text-cyan-700 mb-1.5 sm:mb-2 font-semibold">
        {label}
      </label>
      <div className="relative">
        {children}
        {unit && <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-slate-400 pointer-events-none">{unit}</span>}
      </div>
    </div>
  );
}

function GlassDropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      const inTrigger = triggerRef.current && triggerRef.current.contains(e.target);
      const inMenu = menuRef.current && menuRef.current.contains(e.target);
      if (!inTrigger && !inMenu) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const maxH = 220;
      const spaceBelow = window.innerHeight - rect.bottom - 10;
      const spaceAbove = rect.top - 10;
      const openUpward = spaceBelow < maxH && spaceAbove > spaceBelow;
      setMenuStyle({
        position: "fixed",
        ...(openUpward
          ? { bottom: window.innerHeight - rect.top + 6 }
          : { top: rect.bottom + 6 }),
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(maxH, openUpward ? spaceAbove : spaceBelow),
        zIndex: 99999,
      });
    }
    setOpen((v) => !v);
  };

  const handleSelect = (optValue) => {
    onChange(optValue);
    setOpen(false);
  };

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={triggerRef}>
      <div
        className={`glass-dropdown-trigger${open ? " open" : ""}${!selected ? " placeholder" : ""}`}
        onMouseDown={handleOpen}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <svg className={`glass-dropdown-chevron${open ? " open" : ""}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && createPortal(
        <div ref={menuRef} className="glass-dropdown-menu" style={menuStyle}>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`glass-dropdown-option${value === opt.value ? " selected" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(opt.value); }}
            >
              {opt.icon && <span style={{ fontSize: 16 }}>{opt.icon}</span>}
              {opt.label}
              {value === opt.value && (
                <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0E748A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

const HOURS = Array.from({ length: 12 }, (_, i) => {
  const h = i + 1;
  return { value: String(h).padStart(2, "0"), label: String(h).padStart(2, "0") };
});
const MINUTES = ["00", "15", "30", "45"].map((m) => ({ value: m, label: m }));
const PERIODS = [{ value: "AM", label: "AM" }, { value: "PM", label: "PM" }];

function TimePickerField({ value, onChange }) {
  const to12 = (t) => {
    const [hStr, mStr] = (t || "23:00").split(":");
    let h = parseInt(hStr, 10);
    const period = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    const minute = ["00", "15", "30", "45"].includes(mStr) ? mStr : "00";
    return { hour: String(h).padStart(2, "0"), minute, period };
  };

  const { hour, minute, period } = to12(value);

  const emit = (h, m, p) => {
    let h24 = parseInt(h, 10);
    if (p === "AM" && h24 === 12) h24 = 0;
    else if (p === "PM" && h24 !== 12) h24 += 12;
    onChange(`${String(h24).padStart(2, "0")}:${m}`);
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <div style={{ flex: 1 }}>
        <GlassDropdown value={hour}   onChange={(v) => emit(v, minute, period)} options={HOURS}   placeholder="HH" />
      </div>
      <div style={{ flex: 1 }}>
        <GlassDropdown value={minute} onChange={(v) => emit(hour, v, period)}   options={MINUTES} placeholder="MM" />
      </div>
      <div style={{ flex: 1 }}>
        <GlassDropdown value={period} onChange={(v) => emit(hour, minute, v)}   options={PERIODS} placeholder="AM" />
      </div>
    </div>
  );
}

function AssessmentForm({ onSubmit }) {
  const [sleep, setSleep] = useState("");
  const [screen, setScreen] = useState("");
  const [mood, setMood] = useState("");
  const [weekendScreen, setWeekendScreen] = useState("");
  const [primaryDevice, setPrimaryDevice] = useState("");
  const [bedtime, setBedtime] = useState("23:00");
  const [deviceAnxiety, setDeviceAnxiety] = useState("");
  const [academicSatisfaction, setAcademicSatisfaction] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sleep || !screen || !mood || !weekendScreen || !primaryDevice || !bedtime || !deviceAnxiety || !academicSatisfaction) return;
    onSubmit({
      sleep: parseFloat(sleep),
      screen: parseFloat(screen),
      mood,
      weekendScreen: parseFloat(weekendScreen),
      primaryDevice,
      bedtime,
      deviceAnxiety,
      academicSatisfaction,
    });
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-[14px] font-normal focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all hover:border-slate-300 shadow-sm";
  const selectClass = "w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-[14px] font-normal focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all appearance-none cursor-pointer hover:border-slate-300 shadow-sm";
  const labelClass = "block text-[13px] font-semibold text-slate-700 mb-2.5";
  const sectionTitleClass = "text-[16px] font-semibold text-slate-900 mb-5 mt-7 pt-2 flex items-center";
  const sectionDivider = "h-px bg-gradient-to-r from-slate-100 to-transparent mb-6 mt-8";

  const filled = sleep && screen && mood && weekendScreen && primaryDevice && bedtime && deviceAnxiety && academicSatisfaction;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Screen and Digital Usage */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-100/50">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-6 bg-gradient-to-b from-cyan-600 to-cyan-500 rounded-full"></div>
          <h3 className="text-[16px] font-semibold text-slate-900">Screen and digital usage</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="fade-up fade-up-4">
            <label className={labelClass}>Daily screen time (hours)</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={screen}
              onChange={(e) => setScreen(e.target.value)}
              placeholder="e.g. 6"
              className={inputClass}
              required
            />
          </div>

          <div className="fade-up fade-up-5">
            <label className={labelClass}>Weekend screen time (hours)</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={weekendScreen}
              onChange={(e) => setWeekendScreen(e.target.value)}
              placeholder="e.g. 8"
              className={inputClass}
              required
            />
          </div>
        </div>

        <div className="fade-up fade-up-6 mt-5">
          <label className={labelClass}>Primary device used</label>
          <GlassDropdown
            value={primaryDevice}
            onChange={setPrimaryDevice}
            placeholder="Select a device"
            options={[
              { value: "mobile",  label: "Mobile phone"     },
              { value: "tablet",  label: "Tablet"           },
              { value: "laptop",  label: "Laptop"           },
              { value: "desktop", label: "Desktop computer" },
            ]}
          />
        </div>
      </div>

      {/* Section 2: Sleep and Physical Health */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-100/50">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-blue-500 rounded-full"></div>
          <h3 className="text-[16px] font-semibold text-slate-900">Sleep and physical health</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="fade-up fade-up-8">
            <label className={labelClass}>Average sleep duration (hours)</label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={sleep}
              onChange={(e) => setSleep(e.target.value)}
              placeholder="e.g. 7"
              className={inputClass}
              required
            />
          </div>

          <div className="fade-up fade-up-9">
            <label className={labelClass}>Usual bedtime</label>
            <TimePickerField value={bedtime} onChange={setBedtime} />
          </div>
        </div>


      </div>

      {/* Section 3: Mental and Psychological Indicators */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-slate-100/50">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-purple-500 rounded-full"></div>
          <h3 className="text-[16px] font-semibold text-slate-900">Mental and psychological indicators</h3>
        </div>
        

        {/* Device Anxiety */}
        <div className="fade-up fade-up-13 mt-4">
          <label className={labelClass}>Do you feel anxious when you cannot access a digital device?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: "never", label: "Never" },
              { key: "sometimes", label: "Sometimes" },
              { key: "often", label: "Often" },
              { key: "always", label: "Always" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setDeviceAnxiety(opt.key)}
                className={`text-center py-3 rounded-lg transition-all border font-normal text-[13px] ${
                  deviceAnxiety === opt.key
                    ? "bg-cyan-700 border-cyan-700 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-cyan-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div className="fade-up fade-up-14 mt-4">
          <label className={labelClass}>How often do you feel low or unmotivated?</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: "rarely", label: "Rarely" },
              { key: "sometimes", label: "Sometimes" },
              { key: "often", label: "Often" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setMood(opt.key)}
                className={`text-center py-4 px-3 rounded-lg transition-all border font-normal text-[13px] ${
                  mood === opt.key
                    ? "bg-cyan-700 border-cyan-700 text-white"
                    : "bg-white border-slate-200 text-slate-600 hover:border-cyan-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Academic Satisfaction */}
        <div className="fade-up fade-up-15 mt-4">
          <label className={labelClass}>Academic satisfaction</label>
          <GlassDropdown
            value={academicSatisfaction}
            onChange={setAcademicSatisfaction}
            placeholder="Select your level"
            options={[
              { value: "highly_satisfied",     label: "Highly satisfied"     },
              { value: "satisfied",            label: "Satisfied"            },
              { value: "moderately_satisfied", label: "Moderately satisfied" },
              { value: "unsatisfied",          label: "Unsatisfied"          },
              { value: "highly_unsatisfied",   label: "Highly unsatisfied"   },
            ]}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="fade-up fade-up-16 pt-8 flex justify-center">
        <button
          type="submit"
          disabled={!filled}
          className={`w-auto px-8 py-4 text-[15px] font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
            filled
              ? "bg-gradient-to-r from-cyan-600 to-cyan-700 text-white hover:from-cyan-700 hover:to-cyan-800 active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Submit and get my wellness classification
        </button>
      </div>
    </form>
  );
}

function ResultsView({ result, onReset }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const text = result.recommendations || result.summary;
  const firstName = result.firstName || "User";
  
  const handleCopy = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const date = new Date();
      const dateStr = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const mdToHtml = (md) =>
        md
          .replace(/### (.+)/g, '<h3 style="font-size:14px;font-weight:600;color:#1a1a1a;margin:18px 0 8px;">$1</h3>')
          .replace(/## (.+)/g, '<h2 style="font-size:16px;font-weight:700;color:#1a1a1a;margin:22px 0 10px;">$1</h2>')
          .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#0e7490;">$1</strong>')
          .replace(/\*(.+?)\*/g, "<em>$1</em>")
          .replace(/^- (.+)$/gm, '<li style="margin:4px 0;padding-left:4px;">$1</li>')
          .replace(/^(\d+)\. (.+)$/gm, '<li style="margin:4px 0;padding-left:4px;">$1. $2</li>')
          .replace(/((?:<li[^>]*>.*<\/li>\s*)+)/g, '<ul style="margin:8px 0 8px 18px;padding:0;list-style:disc;">$1</ul>')
          .replace(/\n\n/g, "<br/>")
          .replace(/\n/g, " ");

      const pdfContent = document.createElement("div");
      pdfContent.innerHTML = `
        <div style="font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#1a1a1a;padding:40px;background:#fff;">
          <h1 style="font-size:28px;font-weight:700;color:#0f172a;margin:0 0 24px;">MindWell Mental & Physical Health Report</h1>
          <p style="font-size:14px;color:#6b7280;margin:0 0 32px;">${dateStr}</p>
          
          <div style="margin-bottom:24px;font-size:14px;line-height:1.8;color:#374151;">${mdToHtml(text)}</div>
          
          <div style="margin-top:32px;padding:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;">
            <p style="margin:0;">This report is AI-assisted and intended for educational wellness guidance. If symptoms escalate, contact a licensed professional.</p>
          </div>
        </div>
      `;

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `MindWell-Report-${date.toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      await html2pdf().set(opt).from(pdfContent).save();
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6 fade-up">
      {/* AI Analysis Card */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-700" />
            <span className="text-[13px] font-medium text-slate-700">Mental & Physical Health Report</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-[11px] text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="text-[14px] leading-relaxed text-slate-700 prose prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-medium prose-h2:text-base prose-h2:mt-4 prose-h2:mb-2 prose-strong:text-slate-900 prose-strong:font-semibold">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </div>
        </div>
      </div>


      {/* Disclaimer */}
      <div className="border border-slate-200 rounded-lg bg-slate-50 px-4 py-3 text-[12px] text-slate-600">
        <p className="mb-1.5">This report is AI-assisted and intended for educational wellness guidance.</p>
        <p className="font-medium text-slate-700">If symptoms escalate, contact a licensed professional.</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="py-3 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[13px] font-medium rounded-lg border border-slate-300 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          New Assessment
        </button>
      </div>
    </div>
  );
}

export default function AssessmentPage({ onSubmit, result, error, onReset }) {
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <style>{customStyles}</style>

      <main className="flex-1 overflow-y-auto assess-scroll">
        <div className="w-full max-w-[760px] mx-auto px-4 sm:px-8 pt-9 sm:pt-14 pb-10 sm:pb-16">
          <div className="mb-8 sm:mb-10">
            <img src="/logo_horizontal.png" alt="Mind Well Logo" className="h-[36px] sm:h-[38px] w-auto" />
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-rose-600/10 border border-rose-700/20 rounded-lg sm:rounded-xl text-rose-700 text-xs sm:text-sm flex items-start gap-2 sm:gap-3 fade-up">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              {error}
            </div>
          )}

          {result ? (
            <ResultsView result={result} onReset={onReset} />
          ) : (
            <div className="bg-transparent">
              <div className="mb-7 sm:mb-8 fade-up">
                <h2 className="text-[34px] sm:text-[46px] leading-[1.03] text-slate-900 mb-2" style={{ fontFamily: "Manrope, sans-serif", fontWeight: 600 }}>
                  Personal Wellness Assessment
                </h2>
                <p className="text-slate-700 text-sm sm:text-[18px] leading-relaxed max-w-[780px]">
                  Welcome to your quarterly clinical review. This data-driven survey helps us refine your restorative protocols. Please provide accurate reflections of your past 7 days.
                </p>
              </div>

              <AssessmentForm onSubmit={onSubmit} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
