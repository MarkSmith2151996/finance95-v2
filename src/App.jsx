import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as Papa from "papaparse";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ════════════════════════════════════════
// WIN95 DESIGN SYSTEM — NO EMOJI
// ════════════════════════════════════════
const W = {
  bg: "#008080",        // teal desktop
  surface: "#c0c0c0",   // window bg
  white: "#ffffff",
  black: "#000000",
  titleBar: "#000080",   // navy title bar
  titleText: "#ffffff",
  text: "#000000",
  disabled: "#808080",
  link: "#0000ff",
  highlight: "#000080",
  hlText: "#ffffff",
  btnFace: "#c0c0c0",
  btnHi: "#ffffff",
  btnShad: "#808080",
  btnDk: "#000000",
  inputBg: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  dkGreen: "#006400",
  amber: "#808000",
  navy: "#000080",
};

const CHART_COLORS = ["#000080","#800000","#008000","#808000","#800080","#008080","#000000","#808080","#0000ff","#ff0000"];

const CATEGORIES = [
  "Housing","Utilities","Groceries","Dining","Transportation","Auto",
  "Shopping","Entertainment","Health","Subscriptions","Insurance","Education",
  "Personal Care","Fees & Charges","Investments","Crypto","Income","Transfer","Uncategorized"
];

// ── Win95 border helpers ──
const raised = {
  borderTop: `2px solid ${W.btnHi}`, borderLeft: `2px solid ${W.btnHi}`,
  borderBottom: `2px solid ${W.btnDk}`, borderRight: `2px solid ${W.btnDk}`,
};
const sunken = {
  borderTop: `2px solid ${W.btnShad}`, borderLeft: `2px solid ${W.btnShad}`,
  borderBottom: `2px solid ${W.btnHi}`, borderRight: `2px solid ${W.btnHi}`,
};
const field = {
  borderTop: `1px solid ${W.btnShad}`, borderLeft: `1px solid ${W.btnShad}`,
  borderBottom: `1px solid ${W.btnHi}`, borderRight: `1px solid ${W.btnHi}`,
  background: W.inputBg,
};

// ════════════════════════════════════════
// WIN95 PRIMITIVES
// ════════════════════════════════════════

function Win95Window({ title, children, style: s, statusBar }) {
  return (
    <div style={{ background: W.surface, ...raised, padding: 3, display: "flex", flexDirection: "column", minHeight: "100vh", ...s }}>
      {/* Title bar */}
      <div style={{
        background: `linear-gradient(90deg, ${W.titleBar}, #1084d0)`,
        padding: "2px 3px", display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 2, userSelect: "none", flexShrink: 0,
      }}>
        <span style={{ color: W.titleText, fontSize: 11, fontWeight: 700, letterSpacing: 0 }}>{title}</span>
        <div style={{ display: "flex", gap: 2 }}>
          {["_", "o", "x"].map((ch, i) => (
            <div key={i} style={{
              ...raised, background: W.surface, width: 16, height: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: i === 2 ? 10 : 9, fontWeight: 700, cursor: "default", lineHeight: 1,
            }}>{ch}</div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>{children}</div>
      {statusBar && (
        <div style={{
          display: "flex", gap: 4, marginTop: 2,
        }}>
          {(Array.isArray(statusBar) ? statusBar : [statusBar]).map((s, i) => (
            <div key={i} style={{ ...sunken, padding: "2px 6px", fontSize: 11, color: W.text, flex: i === 0 ? 2 : 1 }}>{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function Btn95({ children, onClick, disabled, active, style: s, primary }) {
  const [pressed, setPressed] = useState(false);
  const brd = pressed || active ? sunken : raised;
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
      style={{
        ...brd, background: W.btnFace, padding: "3px 10px", fontSize: 11,
        cursor: disabled ? "default" : "pointer", color: disabled ? W.disabled : W.text,
        minWidth: 72, fontFamily: "inherit",
        ...(primary ? { outline: `1px dotted ${W.black}`, outlineOffset: -4 } : {}),
        ...s,
      }}>
      {children}
    </button>
  );
}

function Input95({ style: s, ...rest }) {
  return <input {...rest} style={{ ...field, padding: "2px 4px", fontSize: 11, color: W.text, fontFamily: "inherit", outline: "none", ...s }} />;
}

function Select95({ value, onChange, options, style: s }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...field, padding: "2px 3px", fontSize: 11, color: W.text, fontFamily: "inherit", outline: "none", cursor: "pointer", ...s }}>
      {options.map(o => <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
        {typeof o === "string" ? o : o.label}
      </option>)}
    </select>
  );
}

function Check95({ checked, onChange, label }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 11 }}>
      <span style={{ ...field, width: 13, height: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 9, fontWeight: 900, lineHeight: 1 }}>
        {checked ? "x" : "\u00A0"}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
      {label}
    </label>
  );
}

function GroupBox({ label, children, style: s }) {
  return (
    <fieldset style={{ border: `2px groove ${W.surface}`, padding: "8px 8px 6px", margin: 0, ...s }}>
      <legend style={{ fontSize: 11, padding: "0 4px", color: W.text }}>{label}</legend>
      {children}
    </fieldset>
  );
}

function ProgressBar95({ value, max, color = W.navy, height = 16 }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const blocks = Math.floor(pct / 5);
  return (
    <div style={{ ...sunken, height, padding: 2, background: W.white }}>
      <div style={{ display: "flex", gap: 1, height: "100%", overflow: "hidden" }}>
        {Array.from({ length: blocks }, (_, i) => (
          <div key={i} style={{ width: "5%", background: color, flexShrink: 0 }} />
        ))}
      </div>
    </div>
  );
}

const fmt = (v, compact) => {
  if (v === null || v === undefined) return "--";
  const abs = Math.abs(v);
  if (compact && abs >= 1000) return `${v < 0 ? "-" : ""}$${(abs / 1000).toFixed(1)}k`;
  return `${v < 0 ? "-" : ""}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ════════════════════════════════════════
// STORAGE
// ════════════════════════════════════════
const SK = "finance95";
function load() { try { const r = localStorage.getItem(SK); return r ? JSON.parse(r) : null; } catch { return null; } }
function save(d) { try { localStorage.setItem(SK, JSON.stringify(d)); } catch (e) { console.error(e); } }

// ════════════════════════════════════════
// CLASSIFICATION ENGINE
// ════════════════════════════════════════
const CAT_KW = {
  Housing: ["rent","mortgage","hoa","property tax","lease"],
  Utilities: ["electric","gas bill","water bill","internet","comcast","xfinity","verizon","at&t","t-mobile","sprint","pg&e","power"],
  Groceries: ["trader joe","whole foods","safeway","kroger","costco","aldi","publix","sprouts","grocery","wegmans"],
  Dining: ["restaurant","mcdonald","starbucks","chipotle","doordash","uber eats","grubhub","pizza","burger","cafe","coffee","sushi","taco","panda express","chick-fil-a","panera","sweetgreen"],
  Transportation: ["gas station","shell","chevron","bp ","exxon","uber trip","lyft","parking","toll","metro","transit","fuel"],
  Auto: ["car wash","jiffy lube","autozone","geico","progressive","state farm","car payment","dmv","auto insurance"],
  Shopping: ["amazon","target","walmart","best buy","apple.com","ebay","etsy","nordstrom","macys","nike","home depot","lowes","ikea"],
  Entertainment: ["netflix","spotify","hulu","disney","hbo","movie","theater","concert","ticketmaster","steam","playstation","xbox","youtube premium"],
  Health: ["pharmacy","cvs","walgreens","doctor","hospital","dentist","medical","copay","urgent care"],
  Subscriptions: ["subscription","membership","adobe","microsoft 365","dropbox","icloud","openai","github","notion"],
  Insurance: ["insurance","allstate","liberty mutual","usaa","aflac"],
  Education: ["tuition","school","university","coursera","udemy"],
  "Personal Care": ["salon","barber","spa","gym","fitness","planet fitness","equinox"],
  "Fees & Charges": ["overdraft","atm fee","service charge","late fee","interest charge","annual fee"],
};
const XFER_KW = ["transfer","xfer","trnsfr","zelle","venmo","paypal","wire","ach transfer","between accounts","internal","savings","checking","brokerage","mobile deposit","online banking transfer"];
const INC_KW = ["payroll","direct dep","salary","wage","employer","ach credit","tax refund","irs treas","interest earned"];

function classify(desc, amount) {
  const d = (desc || "").toLowerCase();
  for (const kw of XFER_KW) if (d.includes(kw)) return { category: "Transfer", confidence: 0.85, isTransfer: true };
  for (const kw of INC_KW) if (d.includes(kw)) return { category: "Income", confidence: 0.9, isTransfer: false };
  for (const [cat, kws] of Object.entries(CAT_KW)) for (const kw of kws) if (d.includes(kw)) return { category: cat, confidence: 0.8, isTransfer: false };
  if (amount > 0 && amount >= 100 && amount === Math.round(amount)) return { category: "Transfer", confidence: 0.5, isTransfer: true };
  if (amount > 0) return { category: "Income", confidence: 0.3, isTransfer: false };
  return { category: "Uncategorized", confidence: 0.1, isTransfer: false };
}

// ════════════════════════════════════════
// CSV PARSERS
// ════════════════════════════════════════
function findCol(row, ...cs) { for (const k of Object.keys(row)) { const kl = k.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim(); for (const c of cs) if (kl.includes(c)) return row[k]; } return null; }
function parseAmt(v) { if (!v || String(v).trim() === "" || v === "--" || v === "N/A") return null; const c = String(v).replace(/[$,]/g, "").replace("(", "-").replace(")", "").trim(); const n = parseFloat(c); return isNaN(n) ? null : n; }
function parseDt(v) { if (!v) return null; const s = String(v).replace(/\s*as of .*/, "").trim(); let m; if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/))) return `${m[3]}-${m[1].padStart(2,"0")}-${m[2].padStart(2,"0")}`; if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/))) return `20${m[3]}-${m[1].padStart(2,"0")}-${m[2].padStart(2,"0")}`; if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) return `${m[1]}-${m[2]}-${m[3]}`; return null; }

const KA = { XXBT:"BTC",XBT:"BTC",XETH:"ETH",XLTC:"LTC",XXRP:"XRP",XADA:"ADA",XDOT:"DOT",XXLM:"XLM",ZUSD:"USD",ZEUR:"EUR",ZGBP:"GBP",ZCAD:"CAD",ZJPY:"JPY" };

function parseBofA(rows, acc) {
  return rows.map((r, i) => { const date = parseDt(findCol(r,"date","posted date")); const desc = (findCol(r,"description","payee","original description")||"").trim(); let amt = parseAmt(findCol(r,"amount")); if(amt===null){const d=parseAmt(findCol(r,"debit","withdrawal")),c=parseAmt(findCol(r,"credit","deposit")); if(d!==null)amt=-Math.abs(d);else if(c!==null)amt=Math.abs(c);} if(!date||amt===null)return null; const cl=classify(desc,amt); return{id:`b${Date.now()}-${i}`,date,description:desc,amount:amt,category:cl.category,confidence:cl.confidence,isTransfer:cl.isTransfer,source:"boa",account:acc,type:cl.isTransfer?"transfer":amt>0?"income":"expense",balance:parseAmt(findCol(r,"balance","running bal")),reviewed:cl.confidence>=0.8,status:cl.confidence>=0.8?"approved":"pending"}; }).filter(Boolean);
}
function parseSchwab(rows, acc) {
  return rows.map((r, i) => { const date=parseDt(findCol(r,"date")); const desc=(findCol(r,"description")||"").trim(); const action=(findCol(r,"action","type")||"").trim(); let amt=parseAmt(findCol(r,"amount","net amount")); if(amt===null){const p=parseAmt(findCol(r,"price")),q=parseAmt(findCol(r,"quantity")); if(p!==null&&q!==null)amt=p*q;} if(!date||amt===null)return null; const sym=(findCol(r,"symbol")||"").trim(); const qty=parseAmt(findCol(r,"quantity")); const fees=parseAmt(findCol(r,"fees","comm"))||0; const a=action.toLowerCase(); let cat="Investments",tp="other"; if(a.includes("buy"))tp="buy";else if(a.includes("sell"))tp="sell";else if(a.includes("div")){tp="dividend";cat="Income";}else if(a.includes("interest")){tp="interest";cat="Income";}else if(a.includes("transfer")||a.includes("journal")){tp="transfer";cat="Transfer";} return{id:`s${Date.now()}-${i}`,date,description:action?`${action} - ${desc}`:desc,amount:amt,category:cat,confidence:0.85,isTransfer:tp==="transfer",source:"schwab",account:acc,type:tp,symbol:sym,quantity:qty,fees,reviewed:true,status:"approved"}; }).filter(Boolean);
}
function parseKraken(rows, acc) {
  return rows.map((r, i) => { const date=parseDt(findCol(r,"time")); const tp=(findCol(r,"type")||"").toLowerCase(); const ar=(findCol(r,"asset")||"").trim(); const amt=parseAmt(findCol(r,"amount")); const fee=parseAmt(findCol(r,"fee"))||0; if(!date||amt===null)return null; const asset=KA[ar]||ar; const isFiat=["USD","EUR","GBP","CAD","JPY","AUD"].includes(asset); let cat="Crypto",t=tp; if(tp==="staking")cat="Income";else if(tp==="deposit"||tp==="withdrawal"){cat="Transfer";t="transfer";} return{id:`k${Date.now()}-${i}`,date,description:`Kraken ${tp}: ${asset}`,amount:amt,category:cat,confidence:0.85,isTransfer:t==="transfer",source:"kraken",account:acc,type:t,symbol:isFiat?null:asset,quantity:isFiat?null:Math.abs(amt),fees:fee,balance:parseAmt(findCol(r,"balance")),reviewed:true,status:"approved"}; }).filter(Boolean);
}

function detectPairs(txns) {
  const pairs=[],sorted=[...txns].sort((a,b)=>a.date.localeCompare(b.date)),used=new Set();
  for(let i=0;i<sorted.length;i++){if(used.has(i))continue;const a=sorted[i];if(a.amount===0)continue;for(let j=i+1;j<sorted.length;j++){if(used.has(j))continue;const b=sorted[j];if(Math.abs((new Date(a.date)-new Date(b.date))/864e5)>5)continue;if(Math.abs(a.amount+b.amount)<0.01&&a.account!==b.account){pairs.push([a.id,b.id]);used.add(i);used.add(j);break;}}}
  return pairs;
}

// ════════════════════════════════════════
// TAB: IMPORT
// ════════════════════════════════════════
function ImportTab({ transactions, setTransactions, onSave, setTab }) {
  const [dragOver, setDragOver] = useState(false);
  const [log, setLog] = useState([]);
  const [src, setSrc] = useState("auto");
  const [accName, setAccName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const ref = useRef(null);

  const SRC_LABELS = { boa: "Bank of America", schwab: "Charles Schwab", kraken: "Kraken" };

  const processCSV = useCallback((text, fileName) => {
    // BofA CSVs have a summary section before the real headers.
    // Look for the actual header row and strip everything before it.
    const lines = text.split(/\r?\n/);
    let csvText = text;
    for (let i = 0; i < Math.min(lines.length, 15); i++) {
      const ll = lines[i].toLowerCase().replace(/"/g, "");
      if (ll.startsWith("date,") && (ll.includes("description") || ll.includes("action"))) {
        csvText = lines.slice(i).join("\n");
        break;
      }
    }
    const res = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    const rows = res.data; if (!rows.length) return;
    const h = Object.keys(rows[0]).join(" ").toLowerCase();
    let s = src, a = accName;
    if (s === "auto") { if (h.includes("running bal") || (h.includes("date") && h.includes("description") && h.includes("amount") && !h.includes("action") && !h.includes("symbol"))) s = "boa"; else if (h.includes("action") || h.includes("symbol") || h.includes("fees")) s = "schwab"; else if (h.includes("txid") || h.includes("refid") || h.includes("asset")) s = "kraken"; else s = "boa"; }
    if (!a) a = s === "boa" ? "BofA Account" : s === "schwab" ? "Schwab Brokerage" : "Kraken";
    let parsed = s === "boa" ? parseBofA(rows, a) : s === "schwab" ? parseSchwab(rows, a) : parseKraken(rows, a);
    const existing = new Set(transactions.map(t => `${t.date}|${t.description}|${t.amount}`));
    const nw = parsed.filter(t => !existing.has(`${t.date}|${t.description}|${t.amount}`));
    const all = [...transactions, ...nw]; const pairs = detectPairs(all); const pids = new Set(pairs.flat());
    nw.forEach(t => { if (pids.has(t.id) && !t.isTransfer) { t.isTransfer = true; t.category = "Transfer"; t.status = "flagged"; t.confidence = 0.9; } });
    setTransactions(prev => [...prev, ...nw]);
    const flagged = nw.filter(t => t.status !== "approved").length;
    setLog(prev => [...prev, { file: fileName, source: s, sourceLabel: SRC_LABELS[s] || s, account: a, imported: nw.length, skipped: rows.length - nw.length, flagged, time: new Date().toLocaleTimeString() }]);
    onSave();
    return flagged;
  }, [transactions, setTransactions, src, accName, onSave]);

  const handle = useCallback((files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const flagged = processCSV(e.target.result, file.name);
        if (flagged > 0 && setTab) setTimeout(() => setTab("review"), 1500);
      };
      reader.readAsText(file);
    });
  }, [processCSV, setTab]);

  return (
    <div>
      {/* Hero drop zone */}
      <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handle(e.dataTransfer.files); }}
        onClick={() => ref.current?.click()}
        style={{
          ...sunken, background: dragOver ? "#ffffcc" : W.white, padding: "40px 24px",
          textAlign: "center", cursor: "pointer", marginBottom: 8,
          border: dragOver ? `2px dashed ${W.navy}` : undefined,
        }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>[ Drop all your CSV files here ]</div>
        <div style={{ fontSize: 11, color: W.disabled, marginBottom: 8 }}>or click to browse</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, fontSize: 10, color: W.navy }}>
          <span style={{ ...raised, padding: "2px 8px", background: W.surface }}>Bank of America</span>
          <span style={{ ...raised, padding: "2px 8px", background: W.surface }}>Charles Schwab</span>
          <span style={{ ...raised, padding: "2px 8px", background: W.surface }}>Kraken</span>
        </div>
        <div style={{ fontSize: 10, color: W.disabled, marginTop: 8 }}>Drop multiple files at once -- source is auto-detected, duplicates are skipped</div>
        <input ref={ref} type="file" accept=".csv" multiple style={{ display: "none" }} onChange={e => { handle(e.target.files); e.target.value = ""; }} />
      </div>

      {/* Import results */}
      {log.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 6, marginBottom: 8 }}>
          {log.map((l, i) => (
            <div key={i} style={{ ...raised, padding: 6, background: W.surface }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{l.file}</span>
                <span style={{ fontSize: 9, color: W.disabled }}>{l.time}</span>
              </div>
              <div style={{ fontSize: 10, color: W.navy, marginBottom: 2 }}>{l.sourceLabel}</div>
              <div style={{ fontSize: 10 }}>
                <span style={{ color: W.green, fontWeight: 700 }}>{l.imported} imported</span>
                {l.skipped > 0 && <span style={{ color: W.disabled }}> | {l.skipped} skipped</span>}
                {l.flagged > 0 && <span style={{ color: W.red, fontWeight: 700 }}> | {l.flagged} to review</span>}
              </div>
              {l.flagged > 0 && <div style={{ fontSize: 9, color: W.amber, marginTop: 2 }}>Switching to Review tab...</div>}
            </div>
          ))}
        </div>
      )}

      {/* Advanced settings toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Btn95 onClick={() => setShowAdvanced(!showAdvanced)} style={{ minWidth: 0, fontSize: 10, padding: "2px 8px" }}>
          {showAdvanced ? "- Advanced" : "+ Advanced"}
        </Btn95>
        <Btn95 onClick={() => setShowHelp(!showHelp)} style={{ minWidth: 0, fontSize: 10, padding: "2px 8px" }}>
          {showHelp ? "- How do I get my CSV files?" : "+ How do I get my CSV files?"}
        </Btn95>
      </div>

      {showAdvanced && (
        <GroupBox label="Source Override" style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 10, marginBottom: 2 }}>Source:</div>
              <Select95 value={src} onChange={setSrc} options={[{ value: "auto", label: "Auto-Detect" }, { value: "boa", label: "Bank of America" }, { value: "schwab", label: "Charles Schwab" }, { value: "kraken", label: "Kraken" }]} /></div>
            <div><div style={{ fontSize: 10, marginBottom: 2 }}>Account Name:</div>
              <Input95 value={accName} onChange={e => setAccName(e.target.value)} placeholder="e.g. BofA Checking" style={{ width: 180 }} /></div>
          </div>
          <div style={{ fontSize: 9, color: W.disabled, marginTop: 4 }}>Only needed if auto-detection picks the wrong source.</div>
        </GroupBox>
      )}

      {showHelp && (
        <GroupBox label="How to Export CSVs" style={{ marginBottom: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {[
              { n: "Bank of America", s: ["Log in (desktop web only)", "Select checking/savings account", "Click 'Download' above transactions", "Set date range (max 3,000 txns)", "File type: 'Microsoft Excel Format'", "Click 'Download Transactions'"] },
              { n: "Charles Schwab", s: ["Log in (desktop web only)", "Accounts > History", "Select account + date range", "Click 'Export' (top-right of table)", "CSV downloads automatically", "Each account exported separately"] },
              { n: "Kraken", s: ["Log in > Profile > Settings > Documents", "Create Export > select 'Ledger'", "Set date range + CSV format", "Click Generate (may take minutes-days)", "Check back manually (no email alert)", "Download ZIP > extract ledgers.csv"] },
            ].map(x => (
              <div key={x.n} style={{ ...sunken, background: W.white, padding: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 10, marginBottom: 4, textDecoration: "underline" }}>{x.n}</div>
                <ol style={{ margin: 0, paddingLeft: 14, fontSize: 10, lineHeight: 1.6 }}>
                  {x.s.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            ))}
          </div>
        </GroupBox>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// TAB: REVIEW
// ════════════════════════════════════════
function ReviewTab({ transactions, setTransactions, onSave }) {
  const [filter, setFilter] = useState("pending");
  const [srcF, setSrcF] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filter === "pending" && t.status === "approved") return false;
      if (filter === "approved" && t.status !== "approved") return false;
      if (filter === "transfers" && !t.isTransfer) return false;
      if (srcF !== "all" && t.source !== srcF) return false;
      if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => { if (a.status === "flagged" && b.status !== "flagged") return -1; if (b.status === "flagged" && a.status !== "flagged") return 1; return b.date.localeCompare(a.date); });
  }, [transactions, filter, srcF, search]);

  const upd = (id, u) => { setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...u, reviewed: true } : t)); onSave(); };
  const bulkApprove = () => { const ids = new Set(filtered.map(f => f.id)); setTransactions(prev => prev.map(t => ids.has(t.id) ? { ...t, status: "approved", reviewed: true } : t)); onSave(); };
  const pending = transactions.filter(t => t.status !== "approved").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 11 }}>{pending > 0 ? <span style={{ color: W.red }}>! {pending} transactions need review</span> : <span style={{ color: W.green }}>All transactions reviewed.</span>}</div>
        <Btn95 onClick={bulkApprove}>Approve All ({filtered.length})</Btn95>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        {["pending","transfers","approved","all"].map(f => (
          <Btn95 key={f} active={filter === f} onClick={() => setFilter(f)} style={{ minWidth: 50, fontSize: 10 }}>
            {f === "pending" ? `Pending (${pending})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </Btn95>
        ))}
        <Select95 value={srcF} onChange={setSrcF} options={[{ value: "all", label: "All Sources" }, { value: "boa", label: "BofA" }, { value: "schwab", label: "Schwab" }, { value: "kraken", label: "Kraken" }]} />
        <Input95 value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ width: 140 }} />
      </div>
      <div style={{ ...sunken, background: W.white, maxHeight: 420, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
          <thead>
            <tr style={{ background: W.surface }}>
              {["Date","Description","Amount","Category","Xfer?",""].map((h,i) => (
                <th key={i} style={{ textAlign: i === 2 ? "right" : "left", padding: "3px 5px", borderBottom: `1px solid ${W.btnShad}`, fontSize: 10, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((t, i) => (
              <tr key={t.id} style={{ background: t.status === "flagged" ? "#ffffcc" : t.isTransfer ? "#e8e8ff" : i % 2 === 0 ? W.white : "#f4f4f4" }}>
                <td style={{ padding: "2px 5px", fontFamily: "monospace", whiteSpace: "nowrap" }}>{t.date}</td>
                <td style={{ padding: "2px 5px", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.status === "flagged" && <span style={{ color: W.red, fontWeight: 700 }}>! </span>}
                  <span style={{ color: W.disabled }}>[{t.source.toUpperCase()}]</span> {t.description}
                </td>
                <td style={{ padding: "2px 5px", textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: t.amount > 0 ? W.green : W.red }}>{fmt(t.amount)}</td>
                <td style={{ padding: "2px 5px" }}>
                  <Select95 value={t.category} onChange={v => upd(t.id, { category: v, isTransfer: v === "Transfer" })} options={CATEGORIES} style={{ width: 100, fontSize: 10 }} />
                </td>
                <td style={{ padding: "2px 5px", textAlign: "center" }}>
                  <Check95 checked={t.isTransfer} onChange={e => upd(t.id, { isTransfer: e.target.checked, category: e.target.checked ? "Transfer" : t.category })} />
                </td>
                <td style={{ padding: "2px 5px", textAlign: "center" }}>
                  {t.status === "approved"
                    ? <span style={{ color: W.green, fontWeight: 700, fontFamily: "monospace" }}>OK</span>
                    : <Btn95 onClick={() => upd(t.id, { status: "approved" })} style={{ minWidth: 28, padding: "1px 4px", fontSize: 9 }}>OK</Btn95>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 20, color: W.disabled, fontSize: 11 }}>No transactions match current filters.</div>}
        {filtered.length > 100 && <div style={{ textAlign: "center", padding: 4, fontSize: 10, color: W.disabled }}>Showing first 100 of {filtered.length}</div>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// TAB: DASHBOARD
// ════════════════════════════════════════
function DashboardTab({ transactions }) {
  const real = useMemo(() => transactions.filter(t => !t.isTransfer && t.status === "approved"), [transactions]);
  const inc = useMemo(() => real.filter(t => t.category === "Income" || (t.amount > 0 && t.category !== "Transfer")), [real]);
  const exp = useMemo(() => real.filter(t => t.amount < 0 && t.category !== "Income"), [real]);
  const tInc = inc.reduce((s, t) => s + t.amount, 0);
  const tExp = Math.abs(exp.reduce((s, t) => s + t.amount, 0));
  const net = tInc - tExp;
  const rate = tInc > 0 ? (net / tInc * 100) : 0;

  const monthly = useMemo(() => {
    const m = {}; real.forEach(t => { const mo = t.date.slice(0, 7); if (!m[mo]) m[mo] = { month: mo, income: 0, expenses: 0 }; if (t.amount > 0 && (t.category === "Income" || t.type === "income")) m[mo].income += t.amount; else if (t.amount < 0) m[mo].expenses += Math.abs(t.amount); });
    return Object.values(m).sort((a, b) => a.month.localeCompare(b.month)).map(x => ({ ...x, net: x.income - x.expenses, rate: x.income > 0 ? (x.income - x.expenses) / x.income * 100 : 0 }));
  }, [real]);

  const catData = useMemo(() => {
    const m = {}; exp.forEach(t => { const c = t.category || "?"; if (!m[c]) m[c] = { name: c, value: 0, count: 0 }; m[c].value += Math.abs(t.amount); m[c].count++; });
    return Object.values(m).sort((a, b) => b.value - a.value);
  }, [exp]);

  const topSpend = useMemo(() => {
    const m = {}; exp.forEach(t => { const d = t.description || "?"; if (!m[d]) m[d] = { name: d, total: 0, count: 0 }; m[d].total += Math.abs(t.amount); m[d].count++; });
    return Object.values(m).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [exp]);

  if (!transactions.length) return <div style={{ textAlign: "center", padding: 40, color: W.disabled, fontSize: 11 }}>No data loaded. Go to Import to load CSV files.</div>;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        {[
          { l: "Total Income", v: fmt(tInc, true), c: W.green },
          { l: "Total Expenses", v: fmt(tExp, true), c: W.red },
          { l: "Net Savings", v: fmt(net, true), c: net >= 0 ? W.green : W.red },
          { l: "Savings Rate", v: `${rate.toFixed(1)}%`, c: rate >= 20 ? W.green : rate >= 10 ? W.amber : W.red },
        ].map((x, i) => (
          <div key={i} style={{ ...raised, padding: 6, background: W.surface }}>
            <div style={{ fontSize: 10, color: W.disabled }}>{x.l}</div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: x.c }}>{x.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
        <GroupBox label="Income vs Expenses">
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={monthly} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#aaa" />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: W.text }} />
              <YAxis tick={{ fontSize: 9, fill: W.text }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: W.surface, ...raised, fontSize: 10, fontFamily: "inherit" }} formatter={v => fmt(v)} />
              <Bar dataKey="income" fill={W.green} name="Income" />
              <Bar dataKey="expenses" fill="#800000" name="Expenses" />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </GroupBox>

        <GroupBox label="Spending by Category">
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={catData.slice(0, 8)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ""} labelLine={false}
                style={{ fontSize: 8 }}>
                {catData.slice(0, 8).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: W.surface, ...raised, fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </GroupBox>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <GroupBox label="Top Spending">
          <div style={{ ...sunken, background: W.white, maxHeight: 170, overflowY: "auto" }}>
            {topSpend.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2px 5px", fontSize: 10, background: i % 2 === 0 ? W.white : "#f0f0f0" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 190 }}>{m.name}</span>
                <span style={{ fontFamily: "monospace", color: "#800000", fontWeight: 700 }}>{fmt(m.total)}</span>
              </div>
            ))}
          </div>
        </GroupBox>

        <GroupBox label="Monthly Savings Rate">
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#aaa" />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: W.text }} />
              <YAxis tick={{ fontSize: 9, fill: W.text }} tickFormatter={v => `${v.toFixed(0)}%`} />
              <Tooltip formatter={v => `${v.toFixed(1)}%`} contentStyle={{ background: W.surface, ...raised, fontSize: 10 }} />
              <Bar dataKey="rate" name="Savings %" radius={[2, 2, 0, 0]}>
                {monthly.map((d, i) => <Cell key={i} fill={d.rate >= 20 ? W.green : d.rate >= 0 ? W.amber : "#800000"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GroupBox>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// TAB: NET WORTH
// ════════════════════════════════════════
function NetWorthTab({ netWorth, setNetWorth, onSave }) {
  const [form, setForm] = useState({ name: "", type: "asset", category: "Cash", value: "" });
  const [show, setShow] = useState(false);
  const add = () => { if (!form.name || !form.value) return; setNetWorth(p => [...p, { ...form, value: parseFloat(form.value), id: `n${Date.now()}`, date: new Date().toISOString().slice(0, 10) }]); setForm({ name: "", type: "asset", category: "Cash", value: "" }); setShow(false); onSave(); };
  const rm = id => { setNetWorth(p => p.filter(e => e.id !== id)); onSave(); };
  const upVal = (id, v) => { setNetWorth(p => p.map(e => e.id === id ? { ...e, value: parseFloat(v) || 0 } : e)); onSave(); };

  const assets = netWorth.filter(e => e.type === "asset");
  const liabs = netWorth.filter(e => e.type === "liability");
  const tA = assets.reduce((s, e) => s + e.value, 0);
  const tL = liabs.reduce((s, e) => s + e.value, 0);
  const aCats = ["Cash","Checking","Savings","Investments","Brokerage","Crypto","Real Estate","Vehicle","Other"];
  const lCats = ["Credit Card","Student Loan","Mortgage","Auto Loan","Personal Loan","Medical Debt","Other"];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>Total Assets</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: W.green }}>{fmt(tA, true)}</div></div>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>Total Liabilities</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: W.red }}>{fmt(tL, true)}</div></div>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>Net Worth</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: tA-tL >= 0 ? W.navy : W.red }}>{fmt(tA-tL, true)}</div></div>
      </div>

      <div style={{ marginBottom: 6 }}><Btn95 onClick={() => setShow(!show)}>{show ? "Cancel" : "Add Entry..."}</Btn95></div>

      {show && (
        <GroupBox label="New Entry" style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "end", flexWrap: "wrap" }}>
            <div><div style={{ fontSize: 10, marginBottom: 2 }}>Type:</div><Select95 value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} options={[{ value: "asset", label: "Asset" }, { value: "liability", label: "Liability" }]} /></div>
            <div><div style={{ fontSize: 10, marginBottom: 2 }}>Category:</div><Select95 value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} options={form.type === "asset" ? aCats : lCats} /></div>
            <div><div style={{ fontSize: 10, marginBottom: 2 }}>Name:</div><Input95 value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="BofA Checking" style={{ width: 150 }} /></div>
            <div><div style={{ fontSize: 10, marginBottom: 2 }}>Value ($):</div><Input95 value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} type="number" style={{ width: 90 }} /></div>
            <Btn95 primary onClick={add}>Add</Btn95>
          </div>
        </GroupBox>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[{ label: "Assets", items: assets, total: tA, color: W.green }, { label: "Liabilities", items: liabs, total: tL, color: W.red }].map(sec => (
          <GroupBox key={sec.label} label={sec.label}>
            <div style={{ ...sunken, background: W.white }}>
              {sec.items.length === 0 ? <div style={{ padding: 14, textAlign: "center", fontSize: 10, color: W.disabled }}>None</div> :
                sec.items.map((a, i) => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 5px", background: i % 2 === 0 ? W.white : "#f0f0f0" }}>
                    <div><div style={{ fontSize: 10, fontWeight: 700 }}>{a.name}</div><div style={{ fontSize: 9, color: W.disabled }}>{a.category}</div></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Input95 value={a.value} onChange={e => upVal(a.id, e.target.value)} type="number" style={{ width: 85, textAlign: "right", fontSize: 10, fontFamily: "monospace", color: sec.color }} />
                      <Btn95 onClick={() => rm(a.id)} style={{ minWidth: 20, padding: "0 4px", fontSize: 10, color: W.red }}>x</Btn95>
                    </div>
                  </div>
                ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0 0", fontSize: 11, fontWeight: 700 }}><span>Total:</span><span style={{ fontFamily: "monospace", color: sec.color }}>{fmt(sec.total)}</span></div>
          </GroupBox>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// TAB: PROTECTED MONEY
// ════════════════════════════════════════
function ProtectedTab({ protectedFunds, setProtectedFunds, transactions, onSave }) {
  const [form, setForm] = useState({ name: "", target: "", current: "", type: "emergency", deadline: "" });
  const [show, setShow] = useState(false);
  const add = () => { if (!form.name || !form.target) return; setProtectedFunds(p => [...p, { ...form, target: parseFloat(form.target), current: parseFloat(form.current) || 0, id: `p${Date.now()}` }]); setForm({ name: "", target: "", current: "", type: "emergency", deadline: "" }); setShow(false); onSave(); };
  const rm = id => { setProtectedFunds(p => p.filter(f => f.id !== id)); onSave(); };

  const moExp = useMemo(() => {
    const a = transactions.filter(t => !t.isTransfer && t.status === "approved" && t.amount < 0);
    if (!a.length) return 0;
    const ms = new Set(a.map(t => t.date.slice(0, 7)));
    return Math.abs(a.reduce((s, t) => s + t.amount, 0)) / (ms.size || 1);
  }, [transactions]);

  const emTotal = protectedFunds.filter(f => f.type === "emergency").reduce((s, f) => s + f.current, 0);
  const emMonths = moExp > 0 ? emTotal / moExp : 0;
  const tProt = protectedFunds.reduce((s, f) => s + f.current, 0);
  const types = [{ value: "emergency", label: "Emergency" }, { value: "sinking", label: "Sinking Fund" }, { value: "goal", label: "Savings Goal" }, { value: "investment", label: "Investment Target" }];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>Protected Total</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: W.navy }}>{fmt(tProt, true)}</div></div>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>Emergency Reserve</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: emMonths >= 6 ? W.green : emMonths >= 3 ? W.amber : W.red }}>{emMonths.toFixed(1)} months</div></div>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>Target (6 months)</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: W.navy }}>{fmt(moExp * 6, true)}</div></div>
      </div>

      {moExp > 0 && (
        <GroupBox label="Emergency Fund Health" style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
            {[1,2,3,4,5,6].map(m => (
              <div key={m} style={{
                flex: 1, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                ...(emMonths >= m ? { background: m <= 3 ? W.amber : W.green, color: W.white } : { ...sunken, background: W.white, color: W.disabled }),
                fontSize: 10, fontWeight: 700,
              }}>{m}mo</div>
            ))}
          </div>
          <div style={{ fontSize: 10 }}>
            {emMonths >= 6 ? "[OK] Fully funded." : emMonths >= 3 ? `[!!] ${fmt((6*moExp)-emTotal)} more needed for 6 months.` : `[!!] ${fmt((3*moExp)-emTotal)} needed for 3-month minimum.`}
          </div>
        </GroupBox>
      )}

      <div style={{ marginBottom: 6 }}><Btn95 onClick={() => setShow(!show)}>{show ? "Cancel" : "New Fund..."}</Btn95></div>

      {show && (
        <GroupBox label="Create Fund" style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "end" }}>
            <div><div style={{ fontSize: 10, marginBottom: 2 }}>Type:</div><Select95 value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} options={types} /></div>
            <div><div style={{ fontSize: 10, marginBottom: 2 }}>Name:</div><Input95 value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ width: 150 }} /></div>
            <div><div style={{ fontSize: 10, marginBottom: 2 }}>Target ($):</div><Input95 value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} type="number" style={{ width: 80 }} /></div>
            <div><div style={{ fontSize: 10, marginBottom: 2 }}>Current ($):</div><Input95 value={form.current} onChange={e => setForm(p => ({ ...p, current: e.target.value }))} type="number" style={{ width: 80 }} /></div>
            <div><div style={{ fontSize: 10, marginBottom: 2 }}>Deadline:</div><Input95 value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} type="date" /></div>
            <Btn95 primary onClick={add}>Create</Btn95>
          </div>
        </GroupBox>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 6 }}>
        {protectedFunds.map(f => {
          const pct = f.target > 0 ? (f.current / f.target * 100) : 0;
          const tp = types.find(t => t.value === f.type) || types[0];
          return (
            <div key={f.id} style={{ ...raised, padding: 6, background: W.surface }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div><div style={{ fontSize: 11, fontWeight: 700 }}>{f.name}</div><div style={{ fontSize: 9, color: W.disabled }}>{tp.label}</div></div>
                <Btn95 onClick={() => rm(f.id)} style={{ minWidth: 20, padding: "0 4px", fontSize: 10 }}>x</Btn95>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 3 }}>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: W.navy }}>{fmt(f.current)}</span>
                <span style={{ color: W.disabled }}>of {fmt(f.target)}</span>
              </div>
              <ProgressBar95 value={f.current} max={f.target} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: 9, color: W.disabled }}>
                <span>{pct.toFixed(0)}%</span><span>{fmt(f.target - f.current)} remaining</span>
              </div>
              {f.deadline && <div style={{ fontSize: 9, color: W.disabled, marginTop: 2 }}>Due: {f.deadline}</div>}
              <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                <Input95 id={`af-${f.id}`} type="number" placeholder="$" style={{ width: 65, fontSize: 10 }} />
                <Btn95 style={{ minWidth: 36, fontSize: 9, padding: "1px 6px" }} onClick={() => {
                  const el = document.getElementById(`af-${f.id}`); const v = parseFloat(el.value);
                  if (v) { setProtectedFunds(p => p.map(x => x.id === f.id ? { ...x, current: x.current + v } : x)); el.value = ""; onSave(); }
                }}>+Add</Btn95>
              </div>
            </div>
          );
        })}
        {!protectedFunds.length && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 20, color: W.disabled, fontSize: 11 }}>No funds created. Click "New Fund..." above.</div>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// TAB: OPTIMIZE
// ════════════════════════════════════════
function OptimizeTab({ transactions }) {
  const exp = useMemo(() => transactions.filter(t => !t.isTransfer && t.status === "approved" && t.amount < 0), [transactions]);

  const subs = useMemo(() => {
    const m = {}; exp.forEach(t => { const k = t.description.replace(/[#0-9]/g, "").trim().slice(0, 30); if (!m[k]) m[k] = []; m[k].push(t); });
    return Object.entries(m).filter(([_, ts]) => { if (ts.length < 2) return false; const amts = ts.map(t => Math.abs(t.amount)); const avg = amts.reduce((s, a) => s + a, 0) / amts.length; const v = amts.reduce((s, a) => s + Math.pow(a - avg, 2), 0) / amts.length; return v < avg * 2; })
      .map(([d, ts]) => { const avg = Math.abs(ts.reduce((s, t) => s + t.amount, 0)) / ts.length; return { desc: d, avg, freq: ts.length, annual: avg * 12 }; }).sort((a, b) => b.annual - a.annual);
  }, [exp]);

  const catAn = useMemo(() => {
    const bm = {}; exp.forEach(t => { const k = `${t.date.slice(0, 7)}|${t.category}`; if (!bm[k]) bm[k] = { month: t.date.slice(0, 7), cat: t.category, total: 0 }; bm[k].total += Math.abs(t.amount); });
    const bc = {}; Object.values(bm).forEach(m => { if (!bc[m.cat]) bc[m.cat] = []; bc[m.cat].push(m.total); });
    return Object.entries(bc).map(([cat, vals]) => {
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      const sorted = [...vals].sort((a, b) => a - b);
      const med = sorted[Math.floor(sorted.length / 2)] || 0;
      return { cat, avg, med, max: Math.max(...vals), pot: avg - med };
    }).sort((a, b) => b.pot - a.pot);
  }, [exp]);

  if (!exp.length) return <div style={{ textAlign: "center", padding: 40, color: W.disabled, fontSize: 11 }}>Import and approve transactions first.</div>;
  const subTotal = subs.reduce((s, x) => s + x.annual, 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>Recurring Charges</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>{subs.length}</div><div style={{ fontSize: 9, color: W.disabled }}>{fmt(subTotal)}/yr</div></div>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>Monthly Savings Potential</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: W.green }}>{fmt(catAn.reduce((s, c) => s + Math.max(c.pot, 0), 0))}</div><div style={{ fontSize: 9 }}>if you hit median spending</div></div>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>Categories Analyzed</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>{catAn.length}</div></div>
      </div>

      <GroupBox label="Detected Recurring Charges" style={{ marginBottom: 8 }}>
        <div style={{ ...sunken, background: W.white, maxHeight: 180, overflowY: "auto" }}>
          {subs.length === 0 ? <div style={{ padding: 14, textAlign: "center", fontSize: 10, color: W.disabled }}>No recurring charges detected.</div> :
            subs.slice(0, 15).map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 5px", fontSize: 10, background: i % 2 === 0 ? W.white : "#f0f0f0" }}>
                <div><div style={{ fontWeight: 700 }}>{s.desc}</div><div style={{ fontSize: 9, color: W.disabled }}>{s.freq} charges</div></div>
                <div style={{ textAlign: "right" }}><div style={{ fontFamily: "monospace", color: "#800000", fontWeight: 700 }}>{fmt(s.avg)}/mo</div><div style={{ fontSize: 9, color: W.disabled }}>{fmt(s.annual)}/yr</div></div>
              </div>
            ))}
        </div>
      </GroupBox>

      <GroupBox label="Category Savings Analysis">
        {catAn.filter(c => c.avg > 10 && c.cat !== "Transfer" && c.cat !== "Income").map((c, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2, fontSize: 10 }}>
              <span style={{ fontWeight: 700 }}>{c.cat}</span>
              <span style={{ color: W.disabled }}>avg {fmt(c.avg)}/mo | med {fmt(c.med)}/mo{c.pot > 5 && <span style={{ color: W.green, fontWeight: 700 }}> | save ~{fmt(c.pot)}</span>}</span>
            </div>
            <ProgressBar95 value={c.avg} max={c.max} color={CHART_COLORS[i % CHART_COLORS.length]} height={10} />
          </div>
        ))}
      </GroupBox>
    </div>
  );
}

// ════════════════════════════════════════
// TAB: BUDGET
// ════════════════════════════════════════
function BudgetTab({ transactions, budgets, setBudgets, onSave }) {
  const [editCat, setEditCat] = useState(null);
  const [editVal, setEditVal] = useState("");
  const exp = useMemo(() => transactions.filter(t => !t.isTransfer && t.status === "approved" && t.amount < 0), [transactions]);
  const curMo = new Date().toISOString().slice(0, 7);
  const curSpend = useMemo(() => { const m = {}; exp.filter(t => t.date.startsWith(curMo)).forEach(t => { if (!m[t.category]) m[t.category] = 0; m[t.category] += Math.abs(t.amount); }); return m; }, [exp, curMo]);
  const avgSpend = useMemo(() => { const ms = {}; exp.forEach(t => { const mo = t.date.slice(0, 7); if (!ms[mo]) ms[mo] = {}; if (!ms[mo][t.category]) ms[mo][t.category] = 0; ms[mo][t.category] += Math.abs(t.amount); }); const ct = {}; const mc = Object.keys(ms).length || 1; Object.values(ms).forEach(m => Object.entries(m).forEach(([c, v]) => { ct[c] = (ct[c] || 0) + v; })); return Object.fromEntries(Object.entries(ct).map(([c, t]) => [c, t / mc])); }, [exp]);

  const cats = [...new Set([...Object.keys(budgets), ...Object.keys(curSpend), ...Object.keys(avgSpend)])].filter(c => !["Income","Transfer","Uncategorized"].includes(c)).sort((a, b) => (curSpend[b] || 0) - (curSpend[a] || 0));
  const tBud = Object.values(budgets).reduce((s, v) => s + v, 0);
  const tSpent = Object.values(curSpend).reduce((s, v) => s + v, 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 8 }}>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>Total Budget</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace" }}>{fmt(tBud)}</div></div>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>Spent ({curMo})</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: tSpent > tBud && tBud > 0 ? W.red : W.text }}>{fmt(tSpent)}</div></div>
        <div style={{ ...raised, padding: 6, background: W.surface }}><div style={{ fontSize: 10, color: W.disabled }}>{tBud - tSpent >= 0 ? "Remaining" : "Over Budget!"}</div><div style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: tBud - tSpent >= 0 ? W.green : W.red }}>{fmt(tBud - tSpent)}</div></div>
      </div>

      <GroupBox label={`Budget vs. Spending - ${curMo}`}>
        {cats.map(cat => {
          const b = budgets[cat] || 0, s = curSpend[cat] || 0, a = avgSpend[cat] || 0;
          const pct = b > 0 ? s / b * 100 : 0;
          return (
            <div key={cat} style={{ padding: "4px 0", borderBottom: `1px solid #dfdfdf` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{cat}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10 }}>
                  <span style={{ color: W.disabled }}>avg: {fmt(a)}</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: pct > 100 ? W.red : pct > 80 ? W.amber : W.text }}>{fmt(s)}</span>
                  <span style={{ color: W.disabled }}>/</span>
                  {editCat === cat ? (
                    <div style={{ display: "flex", gap: 2 }}>
                      <Input95 value={editVal} onChange={e => setEditVal(e.target.value)} type="number" autoFocus
                        onKeyDown={e => { if (e.key === "Enter") { setBudgets(p => ({ ...p, [cat]: parseFloat(editVal) || 0 })); setEditCat(null); onSave(); } }}
                        style={{ width: 65, fontSize: 10 }} />
                      <Btn95 onClick={() => { setBudgets(p => ({ ...p, [cat]: parseFloat(editVal) || 0 })); setEditCat(null); onSave(); }} style={{ minWidth: 22, padding: "0 4px", fontSize: 9 }}>OK</Btn95>
                    </div>
                  ) : (
                    <span onClick={() => { setEditCat(cat); setEditVal(b || Math.ceil(a)); }}
                      style={{ fontFamily: "monospace", cursor: "pointer", color: b > 0 ? W.navy : W.link, textDecoration: b > 0 ? "none" : "underline" }}>
                      {b > 0 ? fmt(b) : "[Set]"}
                    </span>
                  )}
                </div>
              </div>
              {b > 0 && <ProgressBar95 value={s} max={b} color={pct > 100 ? "#800000" : pct > 80 ? W.amber : W.navy} height={10} />}
            </div>
          );
        })}
        {cats.length === 0 && <div style={{ textAlign: "center", padding: 20, color: W.disabled, fontSize: 11 }}>Import transactions first.</div>}
      </GroupBox>
    </div>
  );
}

// ════════════════════════════════════════
// MAIN APPLICATION SHELL
// ════════════════════════════════════════
const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "import", label: "Import" },
  { id: "review", label: "Review" },
  { id: "budget", label: "Budget" },
  { id: "networth", label: "Net Worth" },
  { id: "protected", label: "Protected $" },
  { id: "optimize", label: "Optimize" },
];

export default function App() {
  const [tab, setTab] = useState("import");
  const [txns, setTxns] = useState([]);
  const [nw, setNw] = useState([]);
  const [pf, setPf] = useState([]);
  const [bud, setBud] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef(null);

  useEffect(() => { const d = load(); if (d) { if (d.txns) setTxns(d.txns); if (d.nw) setNw(d.nw); if (d.pf) setPf(d.pf); if (d.bud) setBud(d.bud); if (d.txns?.length) setTab("dashboard"); } setLoaded(true); }, []);

  const doSave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setSaving(true); save({ txns, nw, pf, bud }); setSaving(false); }, 600);
  }, [txns, nw, pf, bud]);

  useEffect(() => { if (loaded) doSave(); }, [txns, nw, pf, bud, loaded, doSave]);

  const pending = txns.filter(t => t.status !== "approved").length;

  if (!loaded) return (
    <div style={{ background: W.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'MS Sans Serif', Tahoma, Geneva, sans-serif" }}>
      <div style={{ ...raised, background: W.surface, padding: 20, fontSize: 12 }}>Loading finance95.exe...</div>
    </div>
  );

  return (
    <div style={{
      background: W.bg, minHeight: "100vh", padding: "0 0 28px",
      fontFamily: "'MS Sans Serif', Tahoma, Geneva, sans-serif", fontSize: 11, color: W.text,
    }}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 16px; }
        ::-webkit-scrollbar-track { background: ${W.surface}; border: 1px solid ${W.btnShad}; }
        ::-webkit-scrollbar-thumb { background: ${W.surface}; border-top: 2px solid ${W.btnHi}; border-left: 2px solid ${W.btnHi}; border-bottom: 2px solid ${W.btnDk}; border-right: 2px solid ${W.btnDk}; }
        ::-webkit-scrollbar-button { background: ${W.surface}; border-top: 2px solid ${W.btnHi}; border-left: 2px solid ${W.btnHi}; border-bottom: 2px solid ${W.btnDk}; border-right: 2px solid ${W.btnDk}; height: 16px; }
        fieldset { border: 2px groove ${W.surface}; }
      `}</style>

      <Win95Window
        title="Personal Finance Hub - [finance95.exe]"
        statusBar={[
          `${txns.length} transactions${pending > 0 ? ` | ${pending} pending review` : ""}`,
          saving ? "Saving..." : "Ready",
          new Date().toLocaleDateString(),
        ]}
        style={{ margin: "0 auto" }}
      >
        {/* Menu bar */}
        <div style={{ background: W.surface, padding: "1px 2px", marginBottom: 2, display: "flex", gap: 0, borderBottom: `1px solid ${W.btnShad}` }}>
          {["File","Edit","View","Tools","Help"].map(m => (
            <button key={m} style={{ background: "none", border: "none", padding: "2px 8px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}
              onClick={() => { if (m === "File" && confirm("Reset all data? This cannot be undone.")) { setTxns([]); setNw([]); setPf([]); setBud({}); } }}>
              <u>{m[0]}</u>{m.slice(1)}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 2, padding: "2px 2px", marginBottom: 2, borderBottom: `1px solid ${W.btnShad}`, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <Btn95 key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}
              style={{ minWidth: 36, fontSize: 10, padding: "2px 8px" }}>
              {t.label}
              {t.id === "review" && pending > 0 && <span style={{ background: W.red, color: W.white, fontSize: 8, padding: "0 3px", marginLeft: 3, fontWeight: 700 }}>{pending}</span>}
            </Btn95>
          ))}
        </div>

        {/* Content area */}
        <div style={{ ...sunken, background: W.white, padding: 8, flex: 1 }}>
          {tab === "import" && <ImportTab transactions={txns} setTransactions={setTxns} onSave={doSave} setTab={setTab} />}
          {tab === "review" && <ReviewTab transactions={txns} setTransactions={setTxns} onSave={doSave} />}
          {tab === "dashboard" && <DashboardTab transactions={txns} />}
          {tab === "networth" && <NetWorthTab netWorth={nw} setNetWorth={setNw} onSave={doSave} />}
          {tab === "protected" && <ProtectedTab protectedFunds={pf} setProtectedFunds={setPf} transactions={txns} onSave={doSave} />}
          {tab === "optimize" && <OptimizeTab transactions={txns} />}
          {tab === "budget" && <BudgetTab transactions={txns} budgets={bud} setBudgets={setBud} onSave={doSave} />}
        </div>
      </Win95Window>

      {/* Taskbar */}
      <div style={{
        ...raised, position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999,
        background: W.surface, padding: "2px 4px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Btn95 style={{ fontWeight: 700, padding: "2px 8px", fontSize: 11 }}>Start</Btn95>
          <div style={{ width: 1, height: 20, borderLeft: `1px solid ${W.btnShad}`, borderRight: `1px solid ${W.btnHi}`, margin: "0 2px" }} />
          <Btn95 active style={{ fontSize: 10, padding: "2px 6px", minWidth: 0, textAlign: "left" }}>finance95.exe</Btn95>
        </div>
        <div style={{ ...sunken, padding: "2px 8px", fontSize: 10, fontFamily: "monospace" }}>
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}
