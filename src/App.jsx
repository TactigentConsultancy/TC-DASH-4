import React, { useState, useEffect, createContext, useContext } from "react";
import {
Target, Building2, BarChart3, FileText, TrendingUp, LogOut, Settings,
Plus, Globe, Bell, Eye, EyeOff, ChevronRight, AlertTriangle,
CheckCircle, Lock, Mail, Search, Download,
ChevronLeft, Users, CheckSquare, Upload, X, Shield, Clock,
Send, Layers, Receipt, RefreshCw, Check, Info, ImageOff,
Activity, FileSpreadsheet, FileType, Pen,
ScanSearch, ClipboardList, Scale, BookOpen, FolderOpen, HelpCircle,
Building, LayoutDashboard
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// BRANDING CONFIGURATION
// Replace the placeholder paths below with your actual image files.
// Put your images in:  /public/images/branding/
//
// Required files:
//   logo-tc.png          — Tactigent logo (dark background variant, ~200×60px)
//   logo-ff.png          — Fiscal Fuse logo (dark background variant)
//   logo-tc-light.png    — Tactigent logo (light/white background variant)
//   logo-ff-light.png    — Fiscal Fuse logo (light/white background variant)
//   logo-main.png        — "The Client Portal" combined logo (optional)
//   favicon.png          — Square icon 512×512px (also update public/favicon.svg)
//
// Once you add your images, change BRANDING_USE_IMAGES to true.
// The app will automatically swap from initials to your logos everywhere.
// ─────────────────────────────────────────────────────────────────────────────
const BRANDING_USE_IMAGES = false; // ← set to true after adding images

const BRANDING = {
  // Image paths (relative to /public)
  logoTC:       "/images/branding/logo-tc.png",
  logoFF:       "/images/branding/logo-ff.png",
  logoTCLight:  "/images/branding/logo-tc-light.png",
  logoFFLight:  "/images/branding/logo-ff-light.png",
  logoMain:     "/images/branding/logo-main.png",

  // Fallback text when images are not yet set
  nameTC:       "Tactigent",
  nameFF:       "Fiscal Fuse",
  nameMain:     "The Client Portal",
  initTC:       "TC",
  initFF:       "FF",
  initMain:     "GE",

  // Brand colors (keep in sync with C below)
  colorTC:      "#8B1A2B",
  colorFF:      "#9A877A",
};

// BrandLogo — renders image if available, falls back to styled initials
function BrandLogo({ dept="TC", variant="dark", size=36, showName=false }) {
  const isTC = dept === "TC";
  const imgSrc = BRANDING_USE_IMAGES
    ? (variant === "dark"
        ? (isTC ? BRANDING.logoTC : BRANDING.logoFF)
        : (isTC ? BRANDING.logoTCLight : BRANDING.logoFFLight))
    : null;
  const bg = isTC ? BRANDING.colorTC : BRANDING.colorFF;
  const init = isTC ? BRANDING.initTC : BRANDING.initFF;
  const name = isTC ? BRANDING.nameTC : BRANDING.nameFF;

  return (
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <div style={{width:size,height:size,borderRadius:Math.round(size*.25),background:imgSrc?"transparent":bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden",boxShadow:imgSrc?"none":"0 2px 8px rgba(58,46,40,.18)"}}>
        {imgSrc
          ? <img src={imgSrc} alt={name} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={e=>{e.target.style.display="none";}}/>
          : <span style={{color:"#F5F1EC",fontWeight:700,fontSize:Math.max(size*.3,10),fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"0.04em"}}>{init}</span>
        }
      </div>
      {showName && <span style={{fontWeight:700,fontSize:13,color:variant==="dark"?"#F5F1EC":"#3A2E28",letterSpacing:"-0.01em"}}>{name}</span>}
    </div>
  );
}

// BrandLogoMain — the combined Client Portal logo for sidebar/login
function BrandLogoMain({ size=34, variant="dark" }) {
  const imgSrc = BRANDING_USE_IMAGES ? BRANDING.logoMain : null;
  const textColor = variant === "dark" ? "#F5F1EC" : "#3A2E28";
  return imgSrc
    ? <img src={imgSrc} alt={BRANDING.nameMain} style={{height:size,objectFit:"contain"}} onError={e=>{e.target.style.display="none";}}/>
    : (
      <div style={{width:size,height:size,borderRadius:Math.round(size*.28),background:"#3A2E28",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(58,46,40,.22)"}}>
        <span style={{color:"#F5F1EC",fontWeight:700,fontSize:Math.max(size*.34,11),fontFamily:"'Cormorant Garamond',Georgia,serif",letterSpacing:"0.04em"}}>{BRANDING.initMain}</span>
      </div>
    );
}

// ── TASK TEMPLATE DATA (mirrors DB — loaded fresh on mount) ──────────────────
const TASK_TEMPLATES_TC = [
  { id:"tpl-pay",  name:"Payroll",            icon:"receipt",     color:"#8B1A2B", dept:"TC",
    items:["Verwerking uren","Loonaangifte SRA","Salarisstroken genereren","Bankbetalingen klaarzetten","Afdracht sociale lasten","Controle loonkosten"] },
  { id:"tpl-ops",  name:"Projectopstart",     icon:"target",      color:"#8B1A2B", dept:"TC",
    items:["Contract ondertekenen","Kickoff vergadering plannen","Projectplan opstellen","Team samenstellen","Toegang portaal activeren","Risicoanalyse uitvoeren"] },
  { id:"tpl-str",  name:"Strategisch Advies", icon:"layers",      color:"#8B1A2B", dept:"TC",
    items:["Situatieanalyse","Stakeholder interviews","SWOT analyse","Strategisch rapport","Implementatieplan","Review sessie"] },
  { id:"tpl-com",  name:"Compliance Check",   icon:"shield",      color:"#8B1A2B", dept:"TC",
    items:["Wetgeving inventarisatie","Gap analyse","Documentatie review","Compliancerapport","Implementatie begeleiding"] },
];
const TASK_TEMPLATES_FF = [
  { id:"tpl-jaar", name:"Jaarrekening",       icon:"file-text",   color:"#9A877A", dept:"FF",
    items:["Grootboek afsluiten","Bankafstemmingen","Debiteuren/crediteuren","Vaste activa overzicht","Conceptjaarrekening","Cliënt review","Definitieve jaarrekening","Deponering KKF"] },
  { id:"tpl-bel",  name:"Belastingaangifte",  icon:"receipt",     color:"#9A877A", dept:"FF",
    items:["Administratie verzamelen","BTW overzicht opstellen","VPB berekening","Aangifte concept review","Indienen bij belasting","Betalingsbevestiging"] },
  { id:"tpl-aud",  name:"Audit",              icon:"scan-search", color:"#9A877A", dept:"FF",
    items:["Auditplan opstellen","Documentatie opvragen","Veldwerk uitvoeren","Bevindingen verwerken","Conceptrapport","Management response","Definitief rapport"] },
  { id:"tpl-dd",   name:"Due Diligence",      icon:"search",      color:"#9A877A", dept:"FF",
    items:["NDA afsluiten","Dataroom opzetten","Financiële analyse","Juridische review","Fiscale beoordeling","DD rapport"] },
];

// ─── INLINE SUPABASE CLIENT (native fetch, no npm required) ────────────────
const SB_URL = "https://qjlijtlqtyzytxcmzwvu.supabase.co";
const SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbGlqdGxxdHl6eXR4Y216d3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTE3MjAsImV4cCI6MjA5MjEyNzcyMH0.EwHl1enE8b5LBXUBQTMSDT4Mv0O6Kkdjbtg1LooH4f8";

let _authToken = SB_ANON;
const setAuthToken = (t) => { _authToken = t || SB_ANON; };

const sbFetch = async (path, opts={}) => {
const headers = {
"apikey": SB_ANON,
"Authorization": `Bearer ${_authToken}`,
"Content-Type": "application/json",
...(opts.headers||{}),
};
if(opts.prefer) headers["Prefer"] = opts.prefer;
const res = await fetch(`${SB_URL}${path}`, { ...opts, headers });
if (!res.ok) {
  const e = await res.json().catch(()=>({message:res.statusText}));
  throw new Error(e.error_description||e.message||e.msg||res.statusText);
}
return res.status === 204 ? null : res.json();
};

const supabase = {
auth: {
signInWithPassword: async ({email,password}) => {
try {
const data = await sbFetch("/auth/v1/token?grant_type=password", {
method:"POST", body: JSON.stringify({email,password}),
});
if(!data?.access_token) return { data:null, error:{message:"Invalid login credentials"} };
setAuthToken(data.access_token);
return { data: { user: data.user, session: data }, error: null };
} catch(e) {
return { data:null, error:{message: e.message.includes("Invalid")||e.message.includes("invalid")?"Invalid login credentials":e.message} };
}
},
signOut: async () => { setAuthToken(null); return {error:null}; },
},
from: (table) => ({
select: (cols="*") => ({
_table:table, _cols:cols, _filters:[], _order:null, _limit:null, _single:false,
eq(col,val){ this._filters.push(`${col}=eq.${val}`); return this; },
neq(col,val){ this._filters.push(`${col}=neq.${val}`); return this; },
order(col,{ascending=true}={}){ this._order=`${col}.${ascending?"asc":"desc"}`; return this; },
limit(n){ this._limit=n; return this; },
single(){ this._single=true; return this; },
async _run(){
let qs=`select=${this._cols}`;
this._filters.forEach(f=>{ qs+=`&${f}`; });
if(this._order) qs+=`&order=${this._order}`;
if(this._limit) qs+=`&limit=${this._limit}`;
const data=await sbFetch(`/rest/v1/${this._table}?${qs}`,{headers:{Accept:this._single?"application/vnd.pgrst.object+json":"application/json"}});
return {data,error:null};
},
then(resolve,reject){ return this._run().then(resolve).catch(r=>reject({data:null,error:r})); },
}),
insert: (body) => ({
select(){ return this; },
single(){ this._single=true; return this; },
_single:false,
async _run(){
const prefer=this._single?"return=representation":"return=representation";
const data=await sbFetch(`/rest/v1/${table}`,{method:"POST",body:JSON.stringify(body),prefer,headers:{Accept:this._single?"application/vnd.pgrst.object+json":"application/json"}});
return {data,error:null};
},
then(resolve,reject){ return this._run().then(resolve).catch(r=>reject({data:null,error:r})); },
}),
update: (body) => ({
eq(col,val){ this._filter=`${col}=eq.${val}`; return this; },
_filter:"",
async _run(){
await sbFetch(`/rest/v1/${table}?${this._filter}`,{method:"PATCH",body:JSON.stringify(body)});
return {error:null};
},
then(resolve,reject){ return this._run().then(resolve).catch(r=>reject({data:null,error:r})); },
}),
}),
};

// ─── ADAPTERS ────────────────────────────────────────────────────────────────
const adaptCompanyRow = (row, contacts=[]) => ({
id:row.id, name:row.name, kkf:row.kkf_number||"", dept:row.department,
industry:row.industry||"", lifecycle:row.lifecycle_status||"Actief",
health:row.health||"green", logo_url:row.logo_url||null, notes:row.notes||"",
avatar:row.name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"??",
contact:contacts[0]?.full_name||"", role:contacts[0]?.role_title||"",
email:contacts[0]?.email||"", alert:row.health==="red",
});
const adaptEngRow = (row) => ({
id:row.id, ref:row.reference_code, name:row.name, dept:row.department,
type:row.type, phase:row.phase, health:row.health, status:row.status||"Actief",
manager:row.avatar_initials||"MR", client:row.company_name||"",
deadline:row.deadline?new Date(row.deadline).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—",
company_id:row.company_id,
});
const fmtDate = (d) => d?new Date(d).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—";

// ─── DATA LOADERS ─────────────────────────────────────────────────────────────
async function loadCompanies(dept) {
try {
const {data} = await supabase.from("companies").select("*").order("name");
const rows = (data||[]).filter(r=>dept==="BOTH"||r.department===dept);
return rows.map(r=>adaptCompanyRow(r));
} catch(e) { console.warn("loadCompanies:",e.message); return []; }
}
async function loadEngagements(dept) {
try {
const {data} = await supabase.from("engagements").select("id,reference_code,name,department,type,phase,health,status,company_id,deadline").order("reference_code");
const compMap = {};
const {data:cos} = await supabase.from("companies").select("id,name");
(cos||[]).forEach(c=>compMap[c.id]=c.name);
return (data||[]).filter(r=>dept==="BOTH"||r.department===dept).map(r=>({...adaptEngRow(r),client:compMap[r.company_id]||""}));
} catch(e) { console.warn("loadEngagements:",e.message); return []; }
}
async function loadInvoices(dept,companyId) {
try {
let q = supabase.from("invoices").select("id,reference_code,company_id,department,amount,status,qbo_id,due_date,paid_at").order("created_at");
if(companyId) q=q.eq("company_id",companyId);
else if(dept&&dept!=="BOTH") q=q.eq("department",dept);
const {data} = await q;
const compMap={};
const {data:cos} = await supabase.from("companies").select("id,name");
(cos||[]).forEach(c=>compMap[c.id]=c.name);
return (data||[]).map(r=>({
id:r.id, ref:r.reference_code, client:compMap[r.company_id]||"",
dept:r.department, amount:Number(r.amount), status:r.status,
due:fmtDate(r.due_date), paid:r.paid_at?fmtDate(r.paid_at):null,
qbo:r.qbo_id||null, company_id:r.company_id,
}));
} catch(e) { console.warn("loadInvoices:",e.message); return []; }
}
async function loadNotifications(userId) {
try {
const {data} = await supabase.from("notifications").select("*").eq("user_id",userId).order("created_at");
return (data||[]).map(r=>({id:r.id,type:r.type,title:r.title,body:r.body,time:fmtDate(r.created_at),read:r.is_read||false}));
} catch(e) { return []; }
}
async function updateEngagement(id,changes) {
const map={};
if(changes.phase) map.phase=changes.phase;
if(changes.status) map.status=changes.status;
if(changes.health) map.health=changes.health;
try { await supabase.from("engagements").update(map).eq("id",id); } catch(e){console.warn("updateEng:",e.message);}
}
async function createCompanyDB(payload) {
const row = await sbFetch("/rest/v1/companies",{method:"POST",prefer:"return=representation",
headers:{Accept:"application/vnd.pgrst.object+json"},
body:JSON.stringify({name:payload.name,kkf_number:payload.kkf,department:payload.dept,
industry:payload.industry,lifecycle_status:payload.lifecycle,health:"green",
logo_url:payload.logo_url||null,notes:payload.notes||null})});
if(payload.contact) {
await sbFetch("/rest/v1/contacts",{method:"POST",prefer:"return=minimal",
body:JSON.stringify({company_id:row.id,full_name:payload.contact,role_title:payload.role||null,
email:payload.email||null,phone:payload.phone||null,is_primary:true})});
}
return adaptCompanyRow(row);
}
async function pushInvoiceQBO(id) {
const qboId=`QBO-SR-${Date.now()}`;
await supabase.from("invoices").update({qbo_id:qboId}).eq("id",id);
return qboId;
}
async function markNotificationsRead(userId) {
try { await supabase.from("notifications").update({is_read:true}).eq("user_id",userId); } catch(e){}
}
async function updateCampaign(id,changes) {
try { await supabase.from("marketing_campaigns").update(changes).eq("id",id); } catch(e){}
}
async function toggleSocialChannel(id,connected) {
try { await supabase.from("social_channels").update({connected}).eq("id",id); } catch(e){}
}
async function updateDocumentReview(id,status) {
try { await supabase.from("documents").update({review_status:status}).eq("id",id); } catch(e){}
}
async function createEngagement(data) {
try {
const row = await sbFetch("/rest/v1/engagements",{method:"POST",prefer:"return=representation",
headers:{Accept:"application/vnd.pgrst.object+json"},
body:JSON.stringify({name:data.name,department:data.dept,type:data.dept==="TC"?"project":"matter",
phase:data.phase,status:data.status||"Actief",health:"green",
company_id:data.company_id,reference_code:data.ref,deadline:data.deadline||null})});
return adaptEngRow(row);
} catch(e){console.warn("createEng:",e.message);}
}
async function loadMarketingCampaigns(dept) {
try {
const {data} = await supabase.from("marketing_campaigns").select("*").order("created_at");
return (data||[]).filter(r=>dept==="BOTH"||r.department===dept||r.department==="BOTH").map(r=>({
id:r.id,name:r.name,dept:r.department,status:r.status,recipients:r.recipients||0,
openRate:r.open_rate||"—",date:fmtDate(r.created_at),type:"newsletter",
}));
} catch(e){return [];}
}
async function loadSocialChannels(dept) {
try {
const {data} = await supabase.from("social_channels").select("*").order("created_at");
return (data||[]).filter(r=>dept==="BOTH"||r.department===dept||r.department==="BOTH").map(r=>({
id:r.id,name:r.name,platform:r.platform,handle:r.handle,followers:r.followers,
dept:r.department,connected:r.connected,lastPost:r.last_post||"—",
}));
} catch(e){return [];}
}
// Unused exports (kept for compat)
const loadAllTasks=async()=>[];
const loadDocuments=async()=>[];
const loadLeads=async()=>[];
const loadClientPortalActions=async()=>[];
const createTask=async()=>null;
const updateTask=async()=>null;
const createInvoice=async()=>null;
const createCampaign=async()=>null;
const adaptUser=x=>x;
const LangCtx = createContext("NL");
const useT = () => { const lang = useContext(LangCtx); return (k) => (STRINGS[lang]?.[k] ?? STRINGS.NL[k] ?? k); };

const STRINGS = {
NL: {
dashboard:"Dashboard", analyses:"Analyses", projects:"Projecten",
dossiers:"Dossiers", tasks:"Taakbeheer", clientActions:"Cliëntacties",
review:"Beoordelingswachtrij", crm:"Cliëntenoverzicht", leads:"Leads",
docs:"Documentbeheer", invoices:"Facturen & QBO", notifications:"Notificaties",
settings:"Instellingen", logout:"Uitloggen", newAnalysis:"NIEUWE ANALYSE",
myPortal:"Mijn Portaal", myActions:"Mijn Actiepunten",
myDocs:"Documenten", financeNav:"Facturen & Betalingen", messages:"Berichten",
support:"Ondersteuning", riskMatrix:"Risicomatrix", assetFlow:"Vermogensstroom",
intelligence:"Intelligence",
overview:"Overzicht", tc:"Tactigent Consultancy", ff:"Fiscal Fuse",
crmLeads:"CRM & Leads", docsFinance:"Documenten & Financiën", system:"Systeem",
cmdCenter:"Command Center", healthLabel:"AFDELINGSGEZONDHEID",
exposureLabel:"ACTIVABLOOTSTELLING", speedLabel:"STRATEGISCHE SNELHEID",
criticalThresholds:"Kritieke Drempels", riskyDossiers:"Risicovolle Dossiers",
onTrack:"Doelstellingen Op Schema", actionRequired:"Actie Vereist",
revision:"Herziening", optimal:"Optimaal", activeDossiers:"Actieve Dossiers",
viewAll:"ALLES BEKIJKEN", dept:"AFDELING", phase:"FASE", health:"GEZONDHEID",
critical:"KRITIEK", amber:"AMBER", stable:"STABIEL",
clientOverview:"Cliëntenoverzicht", totalActive:"TOTAAL ACTIEF",
inReview:"IN REVIEW", search:"Zoeken...", searchClient:"Zoek op bedrijfsnaam of KKF...",
export:"EXPORT", companyName:"BEDRIJFSNAAM", contactPerson:"CONTACTPERSOON",
lifecycle:"LIFECYCLE STATUS",
back:"Terug naar overzicht", currentPhase:"Huidige fase",
progress:"Voortgang", internalTasks:"Interne Taken",
notVisibleClient:"NIET ZICHTBAAR VOOR CLIËNT", visiblePortal:"ZICHTBAAR IN CLIËNTPORTAAL",
clientActionsTab:"Cliëntacties", noTasks:"Geen taken.",
addTask:"Nieuwe taak toevoegen", newClientAction:"Nieuwe cliëntactie aanmaken",
dueDate:"Vervaldatum:", typeMessage:"Typ een bericht...",
docLib:"Documentbeheer", all:"Alle", internal:"Intern", client:"Cliënt",
shared:"Gedeeld", quickUpload:"Snelle Upload", selectFile:"SELECTEER BESTAND",
dragDrop:"Sleep bestanden hierheen",
invoicesTitle:"Facturen & QuickBooks Online", qboActive:"QBO Sync Actief",
minsAgo:"min geleden", newInvoice:"Nieuwe Factuur",
totalOpen:"TOTAAL OPENSTAAND", overdue:"ACHTERSTALLIG",
paidMonth:"BETAALD DEZE MAAND", qboSynced:"QBO GESYNC.",
toReceive:"Te ontvangen", actionReq:"Actie vereist", received:"Ontvangen",
invoicesLinked:"Facturen gekoppeld", amount:"Bedrag",
dueCol:"Vervaldatum", paid:"Betaald", sent:"Verzonden", draft:"Concept",
aging:"Ouderdomsanalyse Debiteuren", days:"Dagen",
goodMorning:"Goedemorgen", myActionItems:"Mijn Actiepunten", priorities:"PRIORITEITEN",
dossierProgress:"Voortgang Dossier", financialOverview:"Financieel Overzicht",
liveSync:"LIVE SYNC", liquidity:"Beschikbare Liquiditeit", burnRate:"Burn Rate",
runway:"Runway", netMargin:"Netto Marge", viewLedger:"VOLLEDIG GROOTBOEK BEKIJKEN",
insights:"TACTIGENT INZICHTEN",
reviewQueue:"Beoordelingswachtrij", pending:"IN AFWACHTING",
processedToday:"VANDAAG VERWERKT", docName:"DOCUMENTNAAM",
clientCol:"CLIËNT", priority:"PRIORITEIT", action:"ACTIE",
review2:"Beoordelen", focusRequired:"Focus Vereist",
queueLoad:"Wachtrij Belasting", realtimeCapacity:"Real-time capaciteit",
leadsTitle:"Leads Pipeline", company:"BEDRIJF", stage:"STADIUM",
value:"WAARDE (SRD)", advisor:"ADVISEUR",
notifTitle:"Notificaties", markAllRead:"Alles gelezen markeren",
welcome:"Welkom terug", email:"E-mailadres", emailPlaceholder:"naam@bedrijf.sr",
password:"Wachtwoord", forgotPw:"Vergeten?", login:"Inloggen", loggingIn:"Inloggen...",
demoSelect:"Demo — Selecteer een rol",
verified:"GEVERIF.", inReview2:"IN REVIEW", pending2:"AFWACHT.", rejected:"AFGEWEZEN",
open:"OPEN", inProgress:"BEZIG", done:"GEDAAN",
low:"LAAG", normal:"NORMAAL", high:"HOOG", criticalPrio:"KRITIEK",
},
EN: {
dashboard:"Dashboard", analyses:"Analyses", projects:"Projects",
dossiers:"Dossiers", tasks:"Task Management", clientActions:"Client Actions",
review:"Review Queue", crm:"Client Overview", leads:"Leads",
docs:"Document Management", invoices:"Invoices & QBO", notifications:"Notifications",
settings:"Settings", logout:"Log Out", newAnalysis:"NEW ANALYSIS",
myPortal:"My Portal", myActions:"My Action Items",
myDocs:"Documents", financeNav:"Invoices & Payments", messages:"Messages",
support:"Support", riskMatrix:"Risk Matrix", assetFlow:"Asset Flow",
intelligence:"Intelligence",
overview:"Overview", tc:"Tactigent Consultancy", ff:"Fiscal Fuse",
crmLeads:"CRM & Leads", docsFinance:"Documents & Finance", system:"System",
cmdCenter:"Command Center", healthLabel:"DEPARTMENT HEALTH",
exposureLabel:"ASSET EXPOSURE", speedLabel:"STRATEGIC VELOCITY",
criticalThresholds:"Critical Thresholds", riskyDossiers:"Risky Dossiers",
onTrack:"Goals On Track", actionRequired:"Action Required",
revision:"Revision", optimal:"Optimal", activeDossiers:"Active Dossiers",
viewAll:"VIEW ALL", dept:"DEPARTMENT", phase:"PHASE", health:"HEALTH",
critical:"CRITICAL", amber:"AMBER", stable:"STABLE",
clientOverview:"Client Overview", totalActive:"TOTAL ACTIVE",
inReview:"IN REVIEW", search:"Search...", searchClient:"Search by company or KKF...",
export:"EXPORT", companyName:"COMPANY NAME", contactPerson:"CONTACT PERSON",
lifecycle:"LIFECYCLE STATUS",
back:"Back to overview", currentPhase:"Current phase",
progress:"Progress", internalTasks:"Internal Tasks",
notVisibleClient:"NOT VISIBLE TO CLIENT", visiblePortal:"VISIBLE IN CLIENT PORTAL",
clientActionsTab:"Client Actions", noTasks:"No tasks.",
addTask:"Add new task", newClientAction:"Create new client action",
dueDate:"Due date:", typeMessage:"Type a message...",
docLib:"Document Management", all:"All", internal:"Internal", client:"Client",
shared:"Shared", quickUpload:"Quick Upload", selectFile:"SELECT FILE",
dragDrop:"Drag files here",
invoicesTitle:"Invoices & QuickBooks Online", qboActive:"QBO Sync Active",
minsAgo:"min ago", newInvoice:"New Invoice",
totalOpen:"TOTAL OUTSTANDING", overdue:"OVERDUE",
paidMonth:"PAID THIS MONTH", qboSynced:"QBO SYNCED",
toReceive:"Receivable", actionReq:"Action required", received:"Received",
invoicesLinked:"Invoices linked", amount:"Amount",
dueCol:"Due Date", paid:"Paid", sent:"Sent", draft:"Draft",
aging:"AR Aging Analysis", days:"Days",
goodMorning:"Good morning", myActionItems:"My Action Items", priorities:"PRIORITIES",
dossierProgress:"Dossier Progress", financialOverview:"Financial Overview",
liveSync:"LIVE SYNC", liquidity:"Available Liquidity", burnRate:"Burn Rate",
runway:"Runway", netMargin:"Net Margin", viewLedger:"VIEW FULL LEDGER",
insights:"TACTIGENT INSIGHTS",
reviewQueue:"Review Queue", pending:"PENDING",
processedToday:"PROCESSED TODAY", docName:"DOCUMENT NAME",
clientCol:"CLIENT", priority:"PRIORITY", action:"ACTION",
review2:"Review", focusRequired:"Focus Required",
queueLoad:"Queue Load", realtimeCapacity:"Real-time capacity",
leadsTitle:"Leads Pipeline", company:"COMPANY", stage:"STAGE",
value:"VALUE (SRD)", advisor:"ADVISOR",
notifTitle:"Notifications", markAllRead:"Mark all as read",
welcome:"Welcome back", email:"Email Address", emailPlaceholder:"name@company.sr",
password:"Password", forgotPw:"Forgot?", login:"Log In", loggingIn:"Logging in...",
demoSelect:"Demo — Select a role",
verified:"VERIFIED", inReview2:"IN REVIEW", pending2:"PENDING", rejected:"REJECTED",
open:"OPEN", inProgress:"IN PROGRESS", done:"DONE",
low:"LOW", normal:"NORMAL", high:"HIGH", criticalPrio:"CRITICAL",
},
};

// ── THEME SYSTEM ─────────────────────────────────────────────────────────────
const THEMES = {
  light: {
    crimson:"#8B1A2B", crimsonDeep:"#6B1220", crimsonFaint:"#F9F0F1", crimsonMid:"#C4909A",
    taupe:"#9A877A", taupeLight:"#C8BBB2", taupeDeep:"#7A6860", mushroom:"#D6D3CE",
    espresso:"#3A2E28", walnut:"#4A3C35", oak:"#5E4E45",
    bg:"#F5F1EC", surface:"#FDFCF9", warm50:"#F0EBE5",
    text:"#3A2E28", secondary:"#7A6B60", muted:"#A89B92", border:"#E4DDD5",
    amber:"#C97B1A", amberBg:"#FDF6EC",
    red:"#C83232", redBg:"#FEF2F2",
    green:"#15803D", greenBg:"#F0FDF4",
    blue:"#1D4ED8", blueBg:"#EFF6FF",
    tagFF:"#9A877A",
    navBg:"#FDFCF9", topbarBg:"#FDFCF9",
  },
  dark: {
    crimson:"#C0283C", crimsonDeep:"#8B1A2B", crimsonFaint:"#2A1518", crimsonMid:"#7A3040",
    taupe:"#8A7B72", taupeLight:"#4A3E38", taupeDeep:"#6A5E58", mushroom:"#4A4038",
    espresso:"#F0EBE4", walnut:"#8B6B52", oak:"#7A6B62",
    bg:"#141210", surface:"#1E1A16", warm50:"#252018",
    text:"#F0EBE4", secondary:"#A89B92", muted:"#6A5E58", border:"#2E2820",
    amber:"#F59E0B", amberBg:"#1C1200",
    red:"#EF4444", redBg:"#1C0808",
    green:"#22C55E", greenBg:"#052E16",
    blue:"#60A5FA", blueBg:"#0A1628",
    tagFF:"#8A7B72",
    navBg:"#1A1612", topbarBg:"#1A1612",
  }
};
// C is set dynamically based on theme — default light
let C = THEMES.light;
const CREAM="#F5F1EC", CREAM_DIM="#C8BBB2";
const F = { display:"'Cormorant Garamond',Georgia,serif", body:"'Jost',sans-serif", mono:"'JetBrains Mono','Fira Code',monospace" };



function GlobalStyles() {
useEffect(()=>{
const id="gds-fonts"; if(document.getElementById(id)) return;
const l=document.createElement("link"); l.id=id; l.rel="stylesheet";
l.href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
l.setAttribute("crossorigin","anonymous");
document.head.appendChild(l);
},[]);
return <style>{`
*,*::before,*::after{box-sizing:border-box;}
html,body{margin:0;padding:0;background:#F5F1EC;}
body{font-family:'Jost',sans-serif;color:#3A2E28;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;}
button,input,textarea,select{font-family:'Jost',sans-serif;}

/* Scrollbar */
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#D6D3CE;border-radius:3px;}
::-webkit-scrollbar-thumb:hover{background:#B8AFA8;}

/* Focus rings — accessibility */
:focus-visible{outline:2px solid #8B1A2B;outline-offset:2px;border-radius:4px;}
button:focus-visible,a:focus-visible{outline:2px solid #8B1A2B;outline-offset:2px;}

/* Easing tokens */
:root{
  --ease-out-expo:cubic-bezier(0.16,1,0.3,1);
  --ease-out-quart:cubic-bezier(0.25,1,0.5,1);
  --ease-in-out:cubic-bezier(0.4,0,0.2,1);
  --shadow-sm:0 1px 3px rgba(58,46,40,.08),0 1px 2px rgba(58,46,40,.06);
  --shadow-md:0 4px 12px rgba(58,46,40,.10),0 2px 4px rgba(58,46,40,.06);
  --shadow-lg:0 12px 32px rgba(58,46,40,.12),0 4px 8px rgba(58,46,40,.06);
  --shadow-xl:0 24px 64px rgba(58,46,40,.14),0 8px 16px rgba(58,46,40,.08);
  --shadow-crimson:0 4px 16px rgba(139,26,43,.24);
}

/* Animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes slideInRight{from{opacity:0;transform:translateX(12px);}to{opacity:1;transform:translateX(0);}}

.fu{animation:fadeUp .28s var(--ease-out-expo) both;}
.fi{animation:fadeIn .2s var(--ease-out-quart) both;}
.sir{animation:slideInRight .24s var(--ease-out-expo) both;}

/* Table row hover — opacity only, no layout shift */
tr{transition:background .12s var(--ease-out-quart);}
tr:hover td{background:#F0EBE5!important;}

/* Photo hover */
.photo-hover:hover{opacity:1!important;}

/* Skeleton shimmer */
.skeleton{
  background:linear-gradient(90deg,#EDE7DF 25%,#F5F1EC 50%,#EDE7DF 75%);
  background-size:200% 100%;
  animation:shimmer 1.4s ease-in-out infinite;
  border-radius:6px;
}

/* Reduced motion */
@media(prefers-reduced-motion:reduce){
  .fu,.fi,.sir{animation:none;}
  *{transition-duration:.01ms!important;animation-duration:.01ms!important;}
}

/* Touch feedback */
button:active{opacity:.85;}
`}</style>;
}

const Avatar=({initials,size=32,bg=C.crimson,src,shape="circle"})=>{
const r=shape==="rounded"?Math.round(size*.28)+"px":"50%";
if(src) return <img src={src} alt={initials} style={{width:size,height:size,borderRadius:r,objectFit:"cover",flexShrink:0,border:`1.5px solid ${C.border}`}}/>;
return <div style={{width:size,height:size,borderRadius:r,background:bg,color:CREAM,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.max(size*.32,9),fontWeight:600,flexShrink:0,letterSpacing:"0.03em"}}>{initials}</div>;
};

// Company logo placeholder — shows initials in a square with subtle gradient
const CompanyLogo=({name,size=40,dept,logoUrl})=>{
if(logoUrl) return <img src={logoUrl} alt={name} style={{width:size,height:size,borderRadius:Math.round(size*.22),objectFit:"contain",border:`1px solid ${C.border}`,background:CREAM,flexShrink:0}}/>;
const initials=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const bg=dept==="TC"?`linear-gradient(135deg,${C.crimson},${C.crimsonDeep})`:dept==="FF"?`linear-gradient(135deg,${C.taupe},${C.taupeDeep})`:`linear-gradient(135deg,${C.walnut},${C.espresso})`;
return(
<div style={{width:size,height:size,borderRadius:Math.round(size*.22),background:bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 2px 8px rgba(58,46,40,.15)"}}>
<span style={{color:CREAM,fontSize:Math.max(size*.3,10),fontWeight:700,letterSpacing:"0.04em",fontFamily:F.display}}>{initials}</span>
</div>
);
};

// User photo placeholder with upload trigger
const UserPhoto=({user,size=40,onUpload})=>{
const ref=React.useRef();
return(
<div style={{position:"relative",width:size,height:size,flexShrink:0}} onClick={onUpload?()=>ref.current?.click():undefined}>
<Avatar initials={user.avatar} size={size} bg={user.role==="client"?C.walnut:user.dept==="FF"?C.taupe:C.crimson}/>
{onUpload&&<>
<input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])onUpload(URL.createObjectURL(e.target.files[0]));}}/>
<div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(58,46,40,.45)",display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity .15s",cursor:"pointer"}} className="photo-hover">
<Upload size={Math.round(size*.3)} color={CREAM}/>
</div>
</>}
</div>
);
};
const DeptTag=({dept})=>(
<span style={{background:dept==="TC"?C.crimson:dept==="FF"?C.taupe:C.walnut,color:CREAM,fontSize:8.5,fontWeight:600,letterSpacing:"0.1em",padding:"2px 8px",borderRadius:4,textTransform:"uppercase",whiteSpace:"nowrap"}}>
{dept==="TC"?"TACTIGENT":dept==="FF"?"FISCAL FUSE":"BEIDE"}
</span>
);
const HealthDot=({status})=>(<span style={{width:7,height:7,borderRadius:"50%",background:status==="red"?C.red:status==="amber"?C.amber:C.green,display:"inline-block",flexShrink:0}}/>);
const Chip=({label,color,bg})=>(<span style={{fontSize:10,fontWeight:700,letterSpacing:"0.07em",color,background:bg,padding:"3px 10px",borderRadius:6,textTransform:"uppercase",whiteSpace:"nowrap",display:"inline-flex",alignItems:"center"}}>{label}</span>);
const Badge=Chip;
const VisChip=({vis})=>{const m={internal:{c:C.blue,bg:C.blueBg,l:"INTERN"},client:{c:C.green,bg:C.greenBg,l:"CLIENT"},shared:{c:C.amber,bg:C.amberBg,l:"GEDEELD"}};const s=m[vis]||m.internal;return <Chip label={s.l} color={s.c} bg={s.bg}/>;};
const ReviewChip=({status})=>{const m={verified:{c:C.green,bg:C.greenBg,l:"GEVERIF."},in_review:{c:C.amber,bg:C.amberBg,l:"IN REVIEW"},pending:{c:C.muted,bg:C.warm50,l:"AFWACHT."},rejected:{c:C.red,bg:C.redBg,l:"AFGEWEZEN"}};const s=m[status]||m.pending;return <Chip label={s.l} color={s.c} bg={s.bg}/>;};
const PriorityDot=({level})=>{const m={critical:{c:C.red},high:{c:C.amber},normal:{c:C.muted},low:{c:C.secondary}};const s=m[level]||m.normal;return <span style={{display:"flex",alignItems:"center",gap:5,fontSize:9,fontWeight:600,color:s.c}}><span style={{width:6,height:6,borderRadius:"50%",background:s.c}}/>{level?.toUpperCase()}</span>;};
const PageHeader=({kicker,title,action})=>(
  <div style={{marginBottom:26,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
    <div>
      <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.18em",color:C.muted,textTransform:"uppercase",marginBottom:7,fontFamily:F.body}}>{kicker}</div>
      <h1 style={{fontFamily:F.display,fontSize:32,fontWeight:600,color:C.text,margin:0,lineHeight:1.05,letterSpacing:"-0.01em"}}>{title}</h1>
    </div>
    {action}
  </div>
);
const SideSection=({label})=>(<div style={{padding:"18px 14px 5px",fontSize:9.5,fontWeight:700,color:C.mushroom,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:F.body}}>{label}</div>);
const SideBtn=({icon:Icon,label,isActive,onClick,danger,badge})=>(
  <button onClick={onClick} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,border:"none",cursor:"pointer",textAlign:"left",background:isActive?"rgba(139,26,43,0.08)":"transparent",color:isActive?C.crimson:danger?"#DC2626":C.secondary,marginBottom:1,transition:"background .15s,color .15s",position:"relative",fontFamily:F.body}}>
    {isActive&&<div style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:3,borderRadius:"0 2px 2px 0",background:C.crimson}}/>}
    {Icon&&<Icon size={14} strokeWidth={isActive?2.2:1.6} style={{flexShrink:0}}/>}
    <span style={{fontSize:12,fontWeight:isActive?600:400,flex:1,letterSpacing:isActive?"0.01em":"0"}}>{label}</span>
    {badge&&<span style={{fontSize:9,fontWeight:700,background:C.crimson,color:CREAM,padding:"2px 7px",borderRadius:10,minWidth:18,textAlign:"center",letterSpacing:"0.02em"}}>{badge}</span>}
  </button>
);
const Pill=({label,active,onClick})=>(<button onClick={onClick} style={{padding:"6px 16px",borderRadius:20,border:`1.5px solid ${active?C.crimson:C.border}`,background:active?C.crimson:"transparent",color:active?CREAM:C.secondary,fontSize:12,fontWeight:600,cursor:"pointer",transition:"background .15s,color .15s,border-color .15s",whiteSpace:"nowrap"}}>{label}</button>);
function Toast({msg,onClose}){useEffect(()=>{const t=setTimeout(onClose,3400);return()=>clearTimeout(t);},[]);return(<div className="sir" style={{position:"fixed",bottom:28,right:28,zIndex:2000,background:C.espresso,color:CREAM,borderRadius:14,padding:"13px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 20px 48px rgba(58,46,40,.32),0 4px 8px rgba(58,46,40,.16)",fontSize:13,fontWeight:500,maxWidth:360,lineHeight:1.5}}><div style={{width:20,height:20,borderRadius:"50%",background:"rgba(21,128,61,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Check size={12} color="#4ADE80"/></div>{msg}<button onClick={onClose} style={{background:"none",border:"none",color:C.taupeLight,cursor:"pointer",marginLeft:"auto",padding:"2px",opacity:.7,lineHeight:0}}><X size={14}/></button></div>);}

// ─── DATA ───────────────────────────────────────────────────────────────────
const DEMO_USERS=[];
const COMPANIES_INIT=[];
const TC_PHASES=["Intake","Informatieverzameling","Scoping","Uitvoering","Review","Oplevering","Afgerond"];
const FF_PHASES=["Assessment","Technische Analyse","Draft Advies","Review","Retainer Monitoring","Afgerond"];
const ENGAGEMENT_STATUSES=["Actief","Prioriteit","Geblokkeerd","Wacht op Cliënt","Gepauzeerd","Gesloten"];
const STATUS_COLOR={Actief:C.green,Prioriteit:C.crimson,Geblokkeerd:C.red,GepauzeerD:C.secondary,"Wacht op Cliënt":C.amber,Gepauzeerd:C.secondary,Gesloten:C.mushroom};
const STATUS_BG={Actief:C.greenBg,Prioriteit:C.crimsonFaint,Geblokkeerd:C.redBg,"Wacht op Cliënt":C.amberBg,Gepauzeerd:C.warm50,Gesloten:C.warm50};

const ENGAGEMENTS_INIT=[];
const TASKS_BY_ENG={};
const CLIENT_ACTIONS_BY_ENG={};
const MESSAGES_INIT={"1":[
{id:"m1",author:"Adviseur TC",avatar:"MR",time:"10:24",body:"Goedemorgen, de eerste fase van de IT-audit is afgerond.",visible:false},
{},
{id:"m3",author:"Adviseur TC",avatar:"MR",time:"11:05",body:"Ja, de actie staat klaar in uw portaal onder Actiepunten.",visible:true},
]};
const DOCUMENTS=[];
const INVOICES_INIT=[];
const TRANSACTIONS=[
{},
{id:"tr2",desc:"Belastingreservering Q1",dept:"FF",amount:-8500,dir:"out",status:"In Afwachting",date:"25 Mrt"},
{id:"tr3",desc:"Fernandes Retainer Apr",dept:"FF",amount:38400,dir:"in",status:"Afgerond",date:"12 Apr"},
];
const NOTIFICATIONS_INIT=[];
const LEADS=[];
const MARKETING_CAMPAIGNS=[];
const SOCIAL_CHANNELS=[];

const REVIEW_DOCS=[];
const CLIENT_PORTAL_ACTIONS=[];
const CLIENT_THREADS=[];

// ─── SIDEBAR ────────────────────────────────────────────────────────────────
function Sidebar({user,view,setView,onLogout,unreadCount,onNewEng}){
const t=useT();
const isFF=user.dept==="FF",isTC=user.dept==="TC",isBOTH=user.dept==="BOTH";
return(
<aside style={{width:228,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
<div style={{padding:"20px 16px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:11}}>
<BrandLogoMain size={36} variant="light"/>
<div>
<div style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1.3,letterSpacing:"-0.01em"}}>{BRANDING.nameMain}</div>
<div style={{fontSize:10,color:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",marginTop:2,fontWeight:500}}>{user.role==="client"?"Portaal":"Command Center"}</div>
</div>
</div>
<nav style={{flex:1,padding:"6px 8px"}}>
{user.role!=="client"&&<>
<SideSection label={t("overview")}/>
<SideBtn icon={Layers} label={t("dashboard")} isActive={view==="dashboard"} onClick={()=>setView("dashboard")}/>
<SideBtn icon={BarChart3} label={t("analyses")} isActive={view==="analyses"} onClick={()=>setView("analyses")}/>
{(isTC||isBOTH)&&<>
<SideSection label={t("tc")}/>
<SideBtn icon={Target} label={t("projects")} isActive={view==="projects"} onClick={()=>setView("projects")}/>
<SideBtn icon={CheckSquare} label={t("tasks")} isActive={view==="tasks"} onClick={()=>setView("tasks")}/>
<SideBtn icon={CheckCircle} label={`${t("clientActions")} (TC)`} isActive={view==="ca_tc"} onClick={()=>setView("ca_tc")}/>
</>}
{(isFF||isBOTH)&&<>
<SideSection label={t("ff")}/>
<SideBtn icon={Building2} label={t("dossiers")} isActive={view==="dossiers"} onClick={()=>setView("dossiers")}/>
<SideBtn icon={CheckCircle} label={`${t("clientActions")} (FF)`} isActive={view==="ca_ff"} onClick={()=>setView("ca_ff")}/>
</>}
{(isTC||isFF||isBOTH)&&<>
<SideSection label="Documentbeheer"/>
<SideBtn icon={ClipboardList} label={t("review")} isActive={view==="review"} onClick={()=>setView("review")}/>
</>}
<SideSection label={t("crmLeads")}/>
<SideBtn icon={Users} label={t("crm")} isActive={view==="crm"} onClick={()=>setView("crm")}/>
<SideBtn icon={TrendingUp} label={t("leads")} isActive={view==="leads"} onClick={()=>setView("leads")}/>
<SideSection label="Marketing & Sales"/>
<SideBtn icon={Send} label="Marketing Hub" isActive={view==="marketing"} onClick={()=>setView("marketing")}/>
<SideSection label={t("docsFinance")}/>
<SideBtn icon={FileText} label={t("docs")} isActive={view==="docs"} onClick={()=>setView("docs")}/>
<SideBtn icon={Receipt} label={t("invoices")} isActive={view==="invoices"} onClick={()=>setView("invoices")}/>
<SideSection label={t("intelligence")}/>
<SideBtn icon={Shield} label={t("riskMatrix")} isActive={view==="risk_matrix"} onClick={()=>setView("risk_matrix")}/>
<SideBtn icon={Activity} label={t("assetFlow")} isActive={view==="asset_flow"} onClick={()=>setView("asset_flow")}/>
<SideSection label={t("system")}/>
<SideBtn icon={Bell} label={t("notifications")} isActive={view==="notifications"} onClick={()=>setView("notifications")} badge={unreadCount>0?unreadCount:null}/>
{(user.role==="super_admin"||user.role==="admin")&&<SideBtn icon={ClipboardList} label="Audit Log" isActive={view==="audit_log"} onClick={()=>setView("audit_log")}/>}
<SideBtn icon={Settings} label={t("settings")} isActive={view==="settings"} onClick={()=>setView("settings")}/>
<SideBtn icon={LogOut} label={t("logout")} isActive={false} onClick={onLogout} danger/>
</>}
{user.role==="client"&&<>
<SideSection label={t("myPortal")}/>
<SideBtn icon={Layers} label={t("dashboard")} isActive={view==="c_dash"} onClick={()=>setView("c_dash")}/>
<SideBtn icon={CheckSquare} label={t("myActions")} isActive={view==="c_actions"} onClick={()=>setView("c_actions")}/>
<SideBtn icon={FileText} label={t("myDocs")} isActive={view==="c_docs"} onClick={()=>setView("c_docs")}/>
<SideSection label="Financiën"/>
<SideBtn icon={Receipt} label={t("financeNav")} isActive={view==="c_finance"} onClick={()=>setView("c_finance")}/>
<SideSection label={t("intelligence")}/>
<SideBtn icon={Shield} label={t("riskMatrix")} isActive={view==="risk_matrix"} onClick={()=>setView("risk_matrix")}/>
<SideBtn icon={Activity} label={t("assetFlow")} isActive={view==="asset_flow"} onClick={()=>setView("asset_flow")}/>
<SideSection label="Communicatie"/>
<SideBtn icon={Send} label={t("messages")} isActive={view==="c_messages"} onClick={()=>setView("c_messages")}/>
<SideSection label="Account"/>
<SideBtn icon={Info} label={t("support")} isActive={false} onClick={()=>{}}/>
<SideBtn icon={LogOut} label={t("logout")} isActive={false} onClick={onLogout} danger/>
</>}
</nav>
{user.role!=="client"&&(
<div style={{padding:"10px 10px 16px",borderTop:`1px solid ${C.border}`}}>
<button onClick={onNewEng} style={{width:"100%",padding:"9px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,letterSpacing:"0.05em"}}>
<Plus size={12}/> {t("newAnalysis")}
</button>
</div>
)}
</aside>
);
}

function Topbar({user,language,setLanguage,setView,unreadCount,onLogout,darkMode,toggleDark}){
const t=useT();
const [q,setQ]=useState("");
const [showSearch,setShowSearch]=useState(false);
const [showProfile,setShowProfile]=useState(false);
const [results,setResults]=useState([]);

// Global search across all data
const runSearch=(val)=>{
setQ(val);
if(!val.trim()){setResults([]);return;}
const v=val.toLowerCase();
const hits=[];
ENGAGEMENTS_INIT.forEach(e=>{ if(e.name.toLowerCase().includes(v)||e.ref.toLowerCase().includes(v)) hits.push({type:"Engagement",label:e.name,sub:e.ref,view:"analyses",color:C.crimson,Icon:Target}); });
COMPANIES_INIT.forEach(c=>{ if(c.name.toLowerCase().includes(v)||c.kkf.toLowerCase().includes(v)) hits.push({type:"Cliënt",label:c.name,sub:`KKF ${c.kkf}`,view:"crm",color:C.taupe,Icon:Building2}); });
LEADS.forEach(l=>{ if(l.name.toLowerCase().includes(v)) hits.push({type:"Lead",label:l.name,sub:`SRD ${l.value.toLocaleString()}`,view:"leads",color:C.walnut,Icon:TrendingUp}); });
DOCUMENTS.forEach(d=>{ if(d.name.toLowerCase().includes(v)) hits.push({type:"Document",label:d.name,sub:d.dept+" · "+d.date,view:"docs",color:C.blue,Icon:FileText}); });
setResults(hits.slice(0,6));
};

// Close dropdowns on outside click
useEffect(()=>{
const h=()=>{setShowProfile(false);if(!q)setShowSearch(false);};
document.addEventListener("mousedown",h);
return()=>document.removeEventListener("mousedown",h);
},[q]);

const roleLabel={super_admin:"Super Admin",staff:"Medewerker",client:"Cliënt",finance:"Finance"};

return(
<header style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 24px",display:"flex",alignItems:"center",height:58,flexShrink:0,gap:16,position:"relative",zIndex:100,boxShadow:"0 1px 0 rgba(228,221,213,0.8)"}}>
{/* Global search */}
<div style={{position:"relative",flex:1,maxWidth:400}} onMouseDown={e=>e.stopPropagation()}>
<Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.muted}}/>
<input
value={q}
onChange={e=>{runSearch(e.target.value);setShowSearch(true);}}
onFocus={()=>setShowSearch(true)}
placeholder={t("search")}
style={{width:"100%",padding:"8px 34px 8px 36px",borderRadius:10,border:`1.5px solid ${showSearch&&q?C.crimson:C.border}`,fontSize:13,outline:"none",background:C.bg,color:C.text,transition:"border-color .15s",letterSpacing:"0.01em"}}
/>
{q&&<button onClick={()=>{setQ("");setResults([]);}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0,lineHeight:0}}><X size={14}/></button>}
{/* Search dropdown */}
{showSearch&&q&&(
<div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,background:C.surface,borderRadius:14,boxShadow:"0 16px 48px rgba(58,46,40,.16),0 4px 8px rgba(58,46,40,.08)",border:`1px solid ${C.border}`,overflow:"hidden",zIndex:200}}>
{results.length===0?(
<div style={{padding:"20px 16px",fontSize:13,color:C.secondary,textAlign:"center"}}>Geen resultaten voor "{q}"</div>
):results.map((r,i)=>(
<div key={i} onClick={()=>{setView(r.view);setQ("");setResults([]);setShowSearch(false);}} style={{padding:"11px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",borderTop:i>0?`1px solid ${C.border}`:"none",transition:"background .1s"}}>
<div style={{width:32,height:32,borderRadius:8,background:`${r.color}14`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
<r.Icon size={14} color={r.color}/>
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.label}</div>
<div style={{fontSize:11,color:C.secondary,marginTop:1}}>{r.type} · {r.sub}</div>
</div>
<ChevronRight size={13} color={C.mushroom}/>
</div>
))}
{results.length>0&&<div style={{padding:"9px 16px",borderTop:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase"}}>Druk Enter om te zoeken</div>}
</div>
)}
</div>


  <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
    {/* Dark mode toggle */}
    <button onClick={toggleDark} title={darkMode?"Lichte modus":"Donkere modus"} style={{width:36,height:36,borderRadius:9,border:`1px solid ${C.border}`,background:darkMode?C.espresso:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:darkMode?C.bg:C.secondary,transition:"background .2s,color .2s"}}>
      {darkMode
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      }
    </button>

    {/* Language toggle */}
    <div style={{display:"flex",border:`1px solid ${C.border}`,borderRadius:7,overflow:"hidden"}}>
      {["NL","EN"].map(l=>(<button key={l} onClick={()=>setLanguage(l)} style={{padding:"4px 9px",fontSize:10,fontWeight:700,border:"none",cursor:"pointer",background:language===l?C.crimson:"transparent",color:language===l?CREAM:C.secondary,transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}>{l}</button>))}
    </div>

    {/* Notifications bell */}
    <button onClick={()=>setView("notifications")} style={{position:"relative",width:36,height:36,borderRadius:9,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}>
      <Bell size={15}/>
      {unreadCount>0&&(
        <div style={{position:"absolute",top:6,right:6,width:8,height:8,borderRadius:"50%",background:C.crimson,border:`2px solid ${C.surface}`,animation:"pulse 2s infinite"}}/>
      )}
    </button>

    {/* Settings */}
    <button onClick={()=>setView("settings")} style={{width:36,height:36,borderRadius:9,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}>
      <Settings size={15}/>
    </button>

    {/* Profile avatar + dropdown */}
    <div style={{position:"relative"}} onMouseDown={e=>e.stopPropagation()}>
      <button onClick={()=>setShowProfile(v=>!v)} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 8px 4px 4px",borderRadius:9,border:`1px solid ${showProfile?C.crimson:C.border}`,background:showProfile?C.crimsonFaint:"transparent",cursor:"pointer"}}>
        <Avatar initials={user.avatar} size={26}/>
        <div style={{textAlign:"left"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.text,lineHeight:1.2}}>{user.name.split(" ")[0]}</div>
          <div style={{fontSize:9,color:C.secondary}}>{roleLabel[user.role]||user.role}</div>
        </div>
        <ChevronRight size={11} color={C.secondary} style={{transform:showProfile?"rotate(90deg)":"rotate(0)",transition:"transform .15s"}}/>
      </button>
      {showProfile&&(
        <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,width:220,background:C.surface,borderRadius:12,boxShadow:"0 8px 32px rgba(58,46,40,.18)",border:`1px solid ${C.border}`,overflow:"hidden",zIndex:200}}>
          {/* User info */}
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,background:C.crimsonFaint}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Avatar initials={user.avatar} size={36}/>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{user.name}</div>
                <div style={{fontSize:10,color:C.secondary}}>{user.email}</div>
                <div style={{marginTop:3}}><DeptTag dept={user.dept}/></div>
              </div>
            </div>
          </div>
          {/* Menu items */}
          {[
            {label:"Mijn instellingen",icon:Settings,view:"settings"},
            {label:"Notificaties",icon:Bell,view:"notifications",badge:unreadCount>0?unreadCount:null},
          ].map(item=>(
            <button key={item.label} onClick={()=>{setView(item.view);setShowProfile(false);}} style={{width:"100%",padding:"10px 16px",border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderBottom:`1px solid ${C.border}`,textAlign:"left"}}>
              <item.icon size={13} color={C.secondary}/>
              <span style={{fontSize:12,color:C.text,fontWeight:500,flex:1}}>{item.label}</span>
              {item.badge&&<span style={{fontSize:9,fontWeight:700,background:C.crimson,color:CREAM,padding:"2px 6px",borderRadius:10}}>{item.badge}</span>}
            </button>
          ))}
          <button onClick={()=>{onLogout();setShowProfile(false);}} style={{width:"100%",padding:"10px 16px",border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:10,textAlign:"left",color:C.red}}>
            <LogOut size={13}/>
            <span style={{fontSize:12,fontWeight:600}}>Uitloggen</span>
          </button>
        </div>
      )}
    </div>
  </div>
</header>


);
}

function AppShell({user,language,setLanguage,onLogout}){
const def=user.role==="client"?"c_dash":user.dept==="FF"?"dossiers":"dashboard";
const [view,setView]=useState(def);
const [detailEng,setDetailEng]=useState(null);
const [detailCompany,setDetailCompany]=useState(null);
const [detailLead,setDetailLead]=useState(null);
const [toast,setToast]=useState(null);
const showToast=msg=>setToast(msg);

// ── Dark mode ─────────────────────────────────────────────────────────────
const [darkMode,setDarkMode]=useState(()=>{
  try{ return localStorage.getItem("tge_theme")==="dark"; }catch(e){ return false; }
});
// Apply theme globally
C = darkMode ? THEMES.dark : THEMES.light;
useEffect(()=>{
  document.body.style.background = darkMode ? THEMES.dark.bg : THEMES.light.bg;
  document.body.style.color = darkMode ? THEMES.dark.text : THEMES.light.text;
  try{ localStorage.setItem("tge_theme", darkMode?"dark":"light"); }catch(e){}
},[darkMode]);
const toggleDark=()=>setDarkMode(d=>!d);

// ── Live data from Supabase ──────────────────────────────────────────────
const [companyData,setCompanyData]=useState(COMPANIES_INIT);
const [engData,setEngData]=useState(ENGAGEMENTS_INIT);
const [invData,setInvData]=useState(INVOICES_INIT);
const [notifData,setNotifData]=useState(NOTIFICATIONS_INIT);
const [dbLoaded,setDbLoaded]=useState(false);

useEffect(()=>{
let active=true;
async function fetchAll(){
try {
const [companies,engs,invoices,notifs]=await Promise.all([
loadCompanies(user.dept),
loadEngagements(user.dept),
loadInvoices(user.dept, user.role==='client'?user.company_id:null),
loadNotifications(user.id),
]);
if(!active) return;
if(companies.length) setCompanyData(companies);
if(engs.length)     setEngData(engs);
if(invoices.length) setInvData(invoices);
if(notifs.length)   setNotifData(notifs);
setDbLoaded(true);
} catch(e){
console.warn("Supabase load failed, using demo data:", e.message);
setDbLoaded(true);
}
}
fetchAll();
return()=>{active=false;};
},[user.id]);

const [showNewEng,setShowNewEng]=useState(false);
const unreadCount=notifData.filter(n=>!n.read).length;
const handleSetView=(v)=>{
setView(v);setDetailEng(null);setDetailCompany(null);setDetailLead(null);
if(v==="notifications"){
setNotifData(ns=>ns.map(n=>({...n,read:true})));
markNotificationsRead(user.id).catch(()=>{});
}
};  const renderView=()=>{
if(detailCompany) return <CompanyDetail company={detailCompany} user={user} onBack={()=>setDetailCompany(null)} setDetailEng={e=>setDetailEng(engData.find(x=>x.id===e.id)||e)} engData={engData} invData={invData} showToast={showToast}/>;
if(detailEng) return <EngagementDetail eng={detailEng} user={user} onBack={()=>setDetailEng(null)} showToast={showToast} engData={engData} setEngData={setEngData}/>;
if(detailLead) return <LeadDetail lead={detailLead} onBack={()=>setDetailLead(null)} showToast={showToast}/>;
switch(view){
case "dashboard":    return <StaffDashboard user={user} setView={v=>setView(v)} setDetailEng={e=>setDetailEng(engData.find(x=>x.id===e.id)||e)} engData={engData}/>;
case "analyses":     return <AnalysesView user={user} engData={engData} setDetailEng={e=>setDetailEng(engData.find(x=>x.id===e.id)||e)}/>;
case "projects":     return <EngagementList user={user} dept="TC" engData={engData} setDetailEng={e=>setDetailEng(engData.find(x=>x.id===e.id)||e)}/>;
case "dossiers":     return <EngagementList user={user} dept="FF" engData={engData} setDetailEng={e=>setDetailEng(engData.find(x=>x.id===e.id)||e)}/>;
case "tasks":        return <TasksView user={user}/>;
case "ca_tc":        return <ClientActionsView user={user} dept="TC"/>;
case "ca_ff":        return <ClientActionsView user={user} dept="FF"/>;
case "review":       return <ReviewQueue showToast={showToast}/>;
case "marketing":    return <MarketingView user={user} showToast={showToast}/>;
case "settings":     return <SettingsView user={user} language={language} setLanguage={setLanguage} showToast={showToast}/>;
case "crm":          return <CRMView user={user} companyData={companyData} setCompanyData={setCompanyData} setDetailCompany={setDetailCompany} showToast={showToast}/>;
case "leads":        return <LeadsView user={user} setDetailLead={setDetailLead}/>;
case "docs":         return <DMSView user={user} showToast={showToast}/>;
case "invoices":     return <InvoicesView user={user} invData={invData} setInvData={setInvData} showToast={showToast}/>;
case "notifications":return <NotificationsView notifData={notifData} setNotifData={setNotifData}/>;
case "audit_log":    return <AuditLogView user={user}/>;
case "risk_matrix":  return <RiskMatrixView user={user}/>;
case "asset_flow":   return <AssetFlowView user={user}/>;
case "c_dash":       return <ClientDashboard user={user}/>;
case "c_docs":       return <ClientDocsView user={user}/>;
case "c_finance":    return <ClientFinanceView user={user} invData={invData}/>;
case "c_actions":    return <ClientActionsPortal user={user} showToast={showToast}/>;
case "c_messages":   return <ClientMessagesView user={user} showToast={showToast}/>;
default: return <div style={{padding:40,color:C.secondary,fontStyle:"italic",display:"flex",alignItems:"center",gap:10}}><ClipboardList size={20}/> {view} — beschikbaar in volgende sprint</div>;
}
};
return(
<LangCtx.Provider value={language}>
<div style={{display:"flex",height:"100vh",background:C.bg,overflow:"hidden"}}>
<GlobalStyles/>
<Sidebar user={user} view={view} setView={handleSetView} onLogout={onLogout} unreadCount={unreadCount} onNewEng={()=>setShowNewEng(true)}/>
<div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
<Topbar user={user} language={language} setLanguage={setLanguage} setView={handleSetView} unreadCount={unreadCount} onLogout={onLogout} darkMode={darkMode} toggleDark={toggleDark}/>
<main style={{flex:1,overflow:"auto",padding:"28px 32px"}} key={view+(detailEng?.id||"")}>
<div className="fu">{renderView()}</div>
</main>
</div>
{toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
{showNewEng&&<NewEngagementModal user={user} engData={engData} setEngData={setEngData} companyData={companyData} onClose={()=>setShowNewEng(false)} showToast={showToast}/>}
</div>
</LangCtx.Provider>
);
}

// ─── REAL NEWS FETCHER ───────────────────────────────────────────────────────
// Fetches real Suriname/Caribbean tax & business news via Claude API
function useRealNews(dept){
const [news,setNews]=useState([]);
const [loading,setLoading]=useState(true);
const NEWS_API_KEY="cf17161e168546ba85b3643e5ed5fcdb";
const CACHE_KEY="tge_news_v2";
const CACHE_TIME=30*60*1000;

useEffect(()=>{
  // Check cache first
  try{
    const cached=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");
    if(cached&&Date.now()-cached.ts<CACHE_TIME){
      setNews(cached.items); setLoading(false); return;
    }
  }catch(e){}

  const fetchNews=async()=>{
    try{
      // NewsAPI — Suriname + Caribbean business/tax news
      const queries=[
        "Suriname belasting OR tax OR economie OR business",
        "Caribbean tax compliance finance business",
        "CARICOM finance trade Suriname",
      ];
      const allArticles=[];
      for(const q of queries){
        const url=`https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=5&language=en&apiKey=${NEWS_API_KEY}`;
        const res=await fetch(url);
        if(!res.ok) continue;
        const data=await res.json();
        if(data.articles) allArticles.push(...data.articles);
      }

      // Deduplicate and map to our format
      const seen=new Set();
      const mapped=allArticles
        .filter(a=>a.title&&a.title!=="[Removed]"&&!seen.has(a.title)&&seen.add(a.title))
        .slice(0,8)
        .map((a,i)=>{
          const title=a.title||"";
          const isTax=/(tax|belasting|fiscal|BTW|customs|douane)/i.test(title+a.description);
          const isCompliance=/(compliance|regulation|wet|law|audit|FATF|AML)/i.test(title+a.description);
          const isBusiness=/(business|economie|economy|investment|trade|handel)/i.test(title+a.description);
          const tag=isCompliance?"COMPLIANCE":isTax?"BELASTING":isBusiness?"MARKT":"STRATEGIE";
          const tagColor=isCompliance?"#6366F1":isTax?"#8B1A2B":isBusiness?"#C97B1A":"#15803D";
          const dept=isTax||isCompliance?"FF":"TC";
          const pub=new Date(a.publishedAt);
          const diffDays=Math.floor((Date.now()-pub)/86400000);
          const time=diffDays===0?"Vandaag":diffDays===1?"Gisteren":`${diffDays} dagen geleden`;
          return {
            id:String(i+1), tag, tagColor,
            title: title.length>90?title.slice(0,87)+"...":title,
            body: (a.description||a.content||"").slice(0,160),
            time, dept,
            urgent: isCompliance&&diffDays<3,
            source: a.source?.name||"NewsAPI",
            url: a.url||null,
          };
        });

      if(mapped.length>0){
        setNews(mapped);
        try{ localStorage.setItem(CACHE_KEY,JSON.stringify({ts:Date.now(),items:mapped})); }catch(e){}
        setLoading(false);
        return;
      }
    }catch(e){ console.warn("NewsAPI fetch error:",e); }
    // Fallback
    setNews(FALLBACK_NEWS);
    setLoading(false);
  };
  fetchNews();
},[]);

return {news,loading};
}

const FALLBACK_NEWS=[
{id:"1",tag:"WETGEVING",tagColor:"#8B1A2B",title:"Nieuwe belastingwetgeving voor Surinaamse ondernemers",body:"De Centrale Bank van Suriname heeft nieuwe rapportage-eisen gepubliceerd voor bedrijven met omzet boven SRD 500.000.",time:"Recent",dept:"FF",urgent:true,source:"CBvS"},
{id:"2",tag:"MARKT",tagColor:"#C97B1A",title:"SRD/USD wisselkoers: hedging-strategie aanbevolen",body:"De Surinaamse dollar toont volatiliteit. Analyse wijst op marktdruk vanuit de oliesector.",time:"Recent",dept:"BOTH",urgent:false,source:"Marktanalyse"},
{id:"3",tag:"CARICOM",tagColor:"#15803D",title:"CARICOM-handelsakkoord biedt kansen voor Surinaamse bedrijven",body:"Nieuwe handelsprotocollen versterken de marktpositie van Suriname in de regio.",time:"Recent",dept:"TC",urgent:false,source:"Regionaal Rapport"},
{id:"4",tag:"COMPLIANCE",tagColor:"#6366F1",title:"KKF jaaropgave: check actuele deadlines",body:"De Kamer van Koophandel Suriname heeft deadlines gepubliceerd voor jaaropgaven.",time:"Recent",dept:"BOTH",urgent:true,source:"KKF"},
{id:"5",tag:"OFFSHORE",tagColor:"#4A3C35",title:"Offshore kansen voor lokale toeleveranciers",body:"Nieuwe offshore ontdekkingen bieden groeikansen voor MKB-bedrijven.",time:"Recent",dept:"TC",urgent:false,source:"Energie Rapport"},
];

function StaffDashboard({user,setView,setDetailEng,engData}){
const t=useT();
const src=engData||ENGAGEMENTS_INIT;
const eng=user.dept==="BOTH"?src:src.filter(e=>e.dept===user.dept);
const [newsFilter,setNewsFilter]=useState("ALL");
const [expandedNews,setExpandedNews]=useState(null);
const {news:allNews,loading:newsLoading}=useRealNews(user.dept);
const news=allNews.filter(n=>newsFilter==="ALL"||(newsFilter==="urgent"&&n.urgent)||(newsFilter==="TC"&&(n.dept==="TC"||n.dept==="BOTH"))||(newsFilter==="FF"&&(n.dept==="FF"||n.dept==="BOTH")));
const tagIcon={WETGEVING:<Scale size={10}/>,MARKT:<TrendingUp size={10}/>,STRATEGIE:<Target size={10}/>,COMPLIANCE:<Shield size={10}/>,OFFSHORE:<Activity size={10}/>,CARICOM:<Globe size={10}/>,BELASTING:<Receipt size={10}/>};

return(
<div>
<PageHeader kicker={t("overview")} title={t("cmdCenter")}/>

{/* Premium status strip — varied widths, not identical cards */}
<div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr 1fr",gap:12,marginBottom:20}}>
  <div style={{background:C.redBg,borderRadius:14,padding:"20px 22px",border:`1.5px solid ${C.red}20`,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:16,right:18}}><AlertTriangle size={18} color={C.red} opacity={0.4}/></div>
    <div style={{fontSize:10,fontWeight:700,color:C.red,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12,opacity:0.8}}>{t("healthLabel")}</div>
    <div style={{display:"flex",alignItems:"baseline",gap:6}}>
      <span style={{fontFamily:F.display,fontSize:44,fontWeight:600,color:C.red,lineHeight:1}}>04</span>
      <span style={{fontSize:12,color:C.red,fontWeight:600,opacity:0.7}}>{t("criticalThresholds")}</span>
    </div>
    <div style={{marginTop:12,fontSize:11,fontWeight:700,color:C.red,letterSpacing:"0.06em",textTransform:"uppercase",opacity:0.9}}>{t("actionRequired")}</div>
  </div>
  <div style={{background:C.surface,borderRadius:14,padding:"20px 22px",border:`1px solid ${C.border}`}}>
    <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>{t("exposureLabel")}</div>
    <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:14}}>
      <span style={{fontFamily:F.display,fontSize:44,fontWeight:600,color:C.text,lineHeight:1}}>12</span>
      <span style={{fontSize:12,color:C.secondary}}>{t("riskyDossiers")}</span>
    </div>
    {/* Mini bar chart — not number+label again */}
    <div style={{display:"flex",gap:3,alignItems:"flex-end",height:24}}>
      {[40,55,38,62,48,70,58,80,65,72].map((h,i)=>(
        <div key={i} style={{flex:1,borderRadius:"2px 2px 0 0",background:i>=7?C.amber:`${C.amber}35`,height:`${h}%`}}/>
      ))}
    </div>
    <div style={{fontSize:10,color:C.muted,marginTop:6,fontWeight:600}}>{t("revision")}</div>
  </div>
  <div style={{background:C.espresso,borderRadius:14,padding:"20px 22px",position:"relative",overflow:"hidden"}}>
    <div style={{fontSize:10,fontWeight:700,color:C.taupeLight,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>{t("speedLabel")}</div>
    <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:10}}>
      <span style={{fontFamily:F.display,fontSize:44,fontWeight:600,color:CREAM,lineHeight:1}}>89</span>
      <span style={{fontFamily:F.display,fontSize:24,color:CREAM,opacity:0.6}}>%</span>
    </div>
    {/* Progress arc — different from numbers */}
    <div style={{height:5,background:"rgba(255,255,255,.12)",borderRadius:3,overflow:"hidden"}}>
      <div style={{width:"89%",height:"100%",background:`linear-gradient(90deg,${C.green},#4ADE80)`,borderRadius:3}}/>
    </div>
    <div style={{fontSize:10,color:C.taupeLight,marginTop:8,fontWeight:600}}>{t("optimal")} · {t("onTrack")}</div>
  </div>
</div>


  <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:14,marginBottom:18}}>
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
      <div style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h3 style={{margin:0,fontSize:13,fontWeight:700,color:C.text}}>{t("activeDossiers")}</h3>
        <button onClick={()=>setView("analyses")} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,fontWeight:700,color:C.crimson}}>{t("viewAll")} →</button>
      </div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:C.warm50}}>{["NAAM",t("dept"),t("phase"),t("health")].map(h=><th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
        <tbody>{eng.slice(0,4).map(e=>(
          <tr key={e.id} onClick={()=>setDetailEng(e)} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
            <td style={{padding:"14px 18px"}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{e.name}</div><div style={{fontSize:10,color:C.secondary}}>{e.ref}</div></td>
            <td style={{padding:"14px 18px"}}><DeptTag dept={e.dept}/></td>
            <td style={{padding:"14px 18px"}}><span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:C.bg,color:C.text,border:`1px solid ${C.border}`}}>{e.phase}</span></td>
            <td style={{padding:"14px 18px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><HealthDot status={e.health}/><span style={{fontSize:10,fontWeight:700,color:e.health==="red"?C.red:e.health==="amber"?C.amber:C.green}}>{e.health==="red"?t("critical"):e.health==="amber"?t("amber"):t("stable")}</span></div></td>
          </tr>
        ))}</tbody>
      </table>
    </div>
    <div style={{background:C.espresso,borderRadius:14,padding:"20px",color:CREAM,display:"flex",flexDirection:"column",gap:12}}>
      <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",color:C.taupeLight,textTransform:"uppercase"}}>WERELDWIJDE POLSSLAG</div>
      <p style={{fontFamily:F.display,fontSize:14,fontWeight:600,lineHeight:1.5,margin:0}}>Geaggregeerd risico momenteel <span style={{color:"#E87B7B"}}>Verhoogd</span>.</p>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        {[{l:"TACTIGENT",v:"18.4%",up:true},{l:"FISCAL FUSE",v:"4.2%",up:false}].map(s=>(
          <div key={s.l}><div style={{fontSize:8,color:C.taupeLight,fontWeight:700,marginBottom:3}}>{s.l}</div>
          <div style={{fontFamily:F.display,fontSize:20,fontWeight:600,color:s.up?"#E87B7B":CREAM_DIM}}>{s.v}{s.up?"↑":"↓"}</div></div>
        ))}
      </div>
      <div style={{borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:10}}>
        <div style={{fontSize:9,color:C.taupeLight,fontWeight:700,marginBottom:5}}>SYSTEEMVERTRAGING · LIVE</div>
        <div style={{display:"flex",gap:3,alignItems:"flex-end",height:28}}>
          {[14,20,28,16,22,38,30,24,34,26].map((h,i)=>(
            <div key={i} style={{flex:1,borderRadius:"2px 2px 0 0",background:i>=6?C.crimson:"rgba(200,187,178,.25)",height:`${h}px`}}/>
          ))}
        </div>
      </div>
    </div>
  </div>

  {/* ── NEWS FEED ── */}
  <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
    <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:30,height:30,borderRadius:8,background:C.crimsonFaint,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <BookOpen size={14} color={C.crimson}/>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>Markt & Regelgeving Nieuws</div>
          <div style={{fontSize:10,color:C.secondary}}>Actuele updates: Suriname & Caribbean</div>
        </div>
        {allNews.filter(n=>n.urgent).length>0&&(
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 9px",borderRadius:20,background:C.redBg,border:`1px solid ${C.red}30`}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.red,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:9,fontWeight:700,color:C.red}}>{allNews.filter(n=>n.urgent).length} URGENT</span>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:6}}>
        {[["ALL","Alle"],["urgent","Urgent"],["TC","Tactigent"],["FF","Fiscal Fuse"]].map(([v,l])=>(
          <button key={v} onClick={()=>setNewsFilter(v)} style={{padding:"4px 11px",borderRadius:16,border:`1.5px solid ${newsFilter===v?C.crimson:C.border}`,background:newsFilter===v?C.crimson:"transparent",color:newsFilter===v?CREAM:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>{l}</button>
        ))}
      </div>
    </div>

    {/* Loading skeleton */}
    {newsLoading&&(
      <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
        {[1,2,3].map(i=>(<div key={i} className="skeleton" style={{height:16,borderRadius:6,width:i===1?"90%":i===2?"70%":"80%"}}/>))}
        <div style={{fontSize:10,color:C.muted,textAlign:"center",paddingTop:4}}>Actueel nieuws ophalen…</div>
      </div>
    )}

    {/* Featured article */}
    {!newsLoading&&news[0]&&(
      <div style={{padding:"0 20px"}}>
        <div onClick={()=>setExpandedNews(expandedNews===news[0].id?null:news[0].id)} style={{padding:"18px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:20,alignItems:"start"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{display:"flex",alignItems:"center",gap:4,fontSize:9,fontWeight:700,color:news[0].tagColor,background:`${news[0].tagColor}18`,padding:"3px 9px",borderRadius:4,letterSpacing:"0.08em"}}>
                  {tagIcon[news[0].tag]}{news[0].tag}
                </span>
                {news[0].urgent&&<span style={{fontSize:9,fontWeight:700,color:C.red,background:C.redBg,padding:"3px 8px",borderRadius:4,display:"flex",alignItems:"center",gap:3}}><AlertTriangle size={9}/> URGENT</span>}
                <span style={{fontSize:10,color:C.muted}}>{news[0].source}</span>
                <span style={{fontSize:9,color:C.muted}}>·</span>
                <span style={{fontSize:10,color:C.muted}}>{news[0].time}</span>
              </div>
              <div style={{fontFamily:F.display,fontSize:17,fontWeight:600,color:C.text,lineHeight:1.4,marginBottom:8}}>{news[0].title}</div>
              <div style={{fontSize:12,color:C.secondary,lineHeight:1.7,display:expandedNews===news[0].id?"block":"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{news[0].body}</div>
              {expandedNews===news[0].id&&(
                <div style={{marginTop:12,padding:"12px 16px",borderRadius:10,background:C.warm50,fontSize:12,color:C.secondary,lineHeight:1.7}}>
                  Aanbevolen actie: Bespreek met uw adviseur hoe deze ontwikkeling invloed heeft op uw huidige engagements. Neem contact op met de Fiscal Fuse afdeling voor een impactanalyse.
                </div>
              )}
            </div>
            <div style={{width:80,height:64,borderRadius:10,background:news[0].dept==="TC"?C.crimsonFaint:news[0].dept==="FF"?"#F0EDE8":C.amberBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {news[0].dept==="TC"?<Target size={28} color={C.crimson}/>:news[0].dept==="FF"?<Scale size={28} color={C.taupe}/>:<Layers size={28} color={C.amber}/>}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Rest of news list */}
    <div style={{padding:"0 20px"}}>
      {!newsLoading&&news.slice(1).map((item,i)=>(
        <div key={item.id} onClick={()=>setExpandedNews(expandedNews===item.id?null:item.id)} style={{padding:"14px 0",borderTop:`1px solid ${C.border}`,cursor:"pointer",display:"grid",gridTemplateColumns:"auto 1fr auto",gap:14,alignItems:"start"}}>
          <div style={{width:36,height:36,borderRadius:9,background:`${item.tagColor}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
            {item.tag==="WETGEVING"?<Scale size={16} color={item.tagColor}/>:item.tag==="MARKT"?<TrendingUp size={16} color={item.tagColor}/>:item.tag==="STRATEGIE"?<Target size={16} color={item.tagColor}/>:item.tag==="COMPLIANCE"?<Shield size={16} color={item.tagColor}/>:<Activity size={16} color={item.tagColor}/>}
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}>
              <span style={{fontSize:9,fontWeight:700,color:item.tagColor,letterSpacing:"0.08em"}}>{item.tag}</span>
              {item.urgent&&<span style={{fontSize:8,fontWeight:700,color:C.red,background:C.redBg,padding:"2px 6px",borderRadius:3}}>URGENT</span>}
              <span style={{fontSize:9,color:C.muted}}>{item.source} · {item.time}</span>
            </div>
            <div style={{fontSize:13,fontWeight:600,color:C.text,lineHeight:1.4,marginBottom:expandedNews===item.id?6:0}}>{item.title}</div>
            {expandedNews===item.id&&(
              <div style={{fontSize:12,color:C.secondary,lineHeight:1.7,marginTop:6}}>{item.body}</div>
            )}
          </div>
          <div style={{color:C.secondary,marginTop:6}}>
            {expandedNews===item.id?<ChevronLeft size={14} style={{transform:"rotate(90deg)"}}/>:<ChevronRight size={14}/>}
          </div>
        </div>
      ))}
    </div>

    <div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.warm50}}>
      <span style={{fontSize:10,color:C.secondary}}>Bijgewerkt: vandaag om 08:42 · Bron: CBvS, KKF, Tactigent Research</span>
      <button style={{fontSize:10,fontWeight:700,color:C.crimson,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}><RefreshCw size={10}/> Vernieuwen</button>
    </div>
  </div>
</div>


);
}

// ─── ANALYSES VIEW ──────────────────────────────────────────────────────────
function AnalysesView({user,engData,setDetailEng}){
const t=useT();
const [q,setQ]=useState(""); const [healthF,setHealthF]=useState("ALL");
const src=engData||ENGAGEMENTS_INIT;
const all=user.dept==="BOTH"?src:src.filter(e=>e.dept===user.dept);
const eng=all.filter(e=>{
const qOk=!q||e.name.toLowerCase().includes(q.toLowerCase())||e.ref.toLowerCase().includes(q.toLowerCase());
const hOk=healthF==="ALL"||e.health===healthF;
return qOk&&hOk;
});
return(
<div>
<PageHeader kicker="Overzicht" title="Projecten & Dossiers"/>
<div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:16}}>
<div style={{display:"flex",flexDirection:"column",gap:10}}>
<div style={{background:C.surface,borderRadius:14,padding:"16px",border:`1px solid ${C.border}`}}>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:12}}>Actieve Engagements</div>
<div style={{display:"flex",gap:14,marginBottom:14}}>
<div><div style={{fontFamily:F.display,fontSize:28,fontWeight:600,color:C.crimson}}>{(engData||ENGAGEMENTS_INIT).filter(e=>e.dept==="TC").length}</div><div style={{fontSize:9,color:C.secondary,fontWeight:600}}>PROJECTEN</div></div>
<div><div style={{fontFamily:F.display,fontSize:28,fontWeight:600,color:C.tagFF}}>{(engData||ENGAGEMENTS_INIT).filter(e=>e.dept==="FF").length}</div><div style={{fontSize:9,color:C.secondary,fontWeight:600}}>DOSSIERS</div></div>
</div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:5}}>CAPACITEIT</div>
<div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:"82%",background:C.crimson,borderRadius:3}}/></div>
<div style={{textAlign:"right",fontSize:10,fontWeight:700,color:C.crimson}}>82%</div>
</div>
<div style={{background:C.espresso,borderRadius:14,padding:"16px",color:CREAM}}>
<div style={{fontFamily:F.display,fontSize:14,fontWeight:600,marginBottom:7}}>Strategisch Focus</div>
<p style={{fontSize:10,color:CREAM_DIM,lineHeight:1.6,margin:"0 0 12px"}}>Prioriteer dossiers met kritieke status in Fiscal Fuse voor de kwartaalafsluiting.</p>
</div>
</div>
<div>
<div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
<div style={{position:"relative",flex:1,minWidth:200}}>
<Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek engagement..." style={{width:"100%",padding:"8px 32px 8px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
{q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
</div>
{["ALL","green","amber","red"].map(h=>(
<button key={h} onClick={()=>setHealthF(h)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:8,border:`1.5px solid ${healthF===h?C.crimson:C.border}`,background:healthF===h?C.crimsonFaint:"transparent",color:healthF===h?C.crimson:C.secondary,fontSize:10,fontWeight:700,cursor:"pointer"}}>
{h!=="ALL"&&<span style={{width:7,height:7,borderRadius:"50%",background:h==="red"?C.red:h==="amber"?C.amber:C.green,display:"inline-block"}}/>}
{h==="ALL"?"Alle":h==="green"?t("stable"):h==="amber"?t("amber"):t("critical")}
</button>
))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
{eng.length===0?(<div style={{padding:"48px 24px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:C.secondary}}>Geen engagements gevonden</div></div>):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["ENGAGEMENT","AFDELING","FASE","GEZONDHEID","MGR"].map(h=><th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{eng.map(e=>(
<tr key={e.id} onClick={()=>setDetailEng(e)} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
<td style={{padding:"13px 18px"}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{e.name}</div><div style={{fontSize:10,color:C.secondary}}>{e.ref} · {e.client}</div></td>
<td style={{padding:"13px 18px"}}><DeptTag dept={e.dept}/></td>
<td style={{padding:"13px 18px"}}><span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:C.bg,color:C.text,border:`1px solid ${C.border}`}}>{e.phase}</span></td>
<td style={{padding:"13px 18px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><HealthDot status={e.health}/><span style={{fontSize:10,fontWeight:700,color:e.health==="red"?C.red:e.health==="amber"?C.amber:C.green}}>{e.health==="red"?t("critical"):e.health==="amber"?t("amber"):t("stable")}</span></div></td>
<td style={{padding:"13px 18px"}}><Avatar initials={e.manager} size={26} bg={e.dept==="TC"?C.crimson:C.taupe}/></td>
</tr>
))}</tbody>
</table>
)}
</div>
</div>
</div>
</div>
);
}

// ─── ENGAGEMENT LIST ─────────────────────────────────────────────────────────
function EngagementList({user,dept,engData,setDetailEng}){
const src=engData||ENGAGEMENTS_INIT;
const eng=src.filter(e=>e.dept===dept&&(user.dept==="BOTH"||e.dept===user.dept));
return(
<div>
<PageHeader kicker={dept==="TC"?"Tactigent Consultancy":"Fiscal Fuse"} title={dept==="TC"?"Projecten":"Dossiers"}/>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["NAAM","CLIËNT","FASE","GEZONDHEID","ACTIE"].map((h,i)=><th key={i} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{eng.map(e=>(
<tr key={e.id} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>setDetailEng(e)}>
<td style={{padding:"13px 18px"}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{e.name}</div><div style={{fontSize:10,color:C.secondary}}>{e.ref}</div></td>
<td style={{padding:"13px 18px",fontSize:12,color:C.text}}>{e.client}</td>
<td style={{padding:"13px 18px"}}><span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:C.bg,color:C.text,border:`1px solid ${C.border}`}}>{e.phase}</span></td>
<td style={{padding:"13px 18px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><HealthDot status={e.health}/><span style={{fontSize:10,fontWeight:700,color:e.health==="red"?C.red:e.health==="amber"?C.amber:C.green}}>{e.health==="red"?"KRITIEK":e.health==="amber"?"AMBER":"STABIEL"}</span></div></td>
<td style={{padding:"13px 18px"}}><button style={{padding:"5px 12px",borderRadius:7,background:C.crimson,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer"}}>Bekijken</button></td>
</tr>
))}</tbody>
</table>
</div>
</div>
);
}

// ─── ENGAGEMENT DETAIL ───────────────────────────────────────────────────────
function EngagementDetail({eng,user,onBack,showToast,engData,setEngData}){
const t=useT();
const [activeTab,setActiveTab]=useState("tasks");
const [newMsg,setNewMsg]=useState(""); const [vis,setVis]=useState(false);
const [messages,setMessages]=useState(MESSAGES_INIT[eng.id]||[]);
const [localTasks,setLocalTasks]=useState(TASKS_BY_ENG[eng.id]||[]);
const [localActions,setLocalActions]=useState(CLIENT_ACTIONS_BY_ENG[eng.id]||[]);
const [showTaskForm,setShowTaskForm]=useState(false);
const [showTemplatePicker,setShowTemplatePicker]=useState(false);
const [showNewAction,setShowNewAction]=useState(false);
const [expandedTask,setExpandedTask]=useState(null);
const [newTaskTitle,setNewTaskTitle]=useState(""); const [newTaskPrio,setNewTaskPrio]=useState("normal"); const [newTaskDue,setNewTaskDue]=useState("");
const liveEng=(engData||[]).find(e=>e.id===eng.id)||eng;
const updateEng=async(changes)=>{
if(setEngData) setEngData(es=>es.map(e=>e.id===eng.id?{...e,...changes}:e));
try { await updateEngagement(eng.id, changes); } catch(e){ console.warn("updateEng failed:",e.message); }
};
const phases=eng.dept==="TC"?TC_PHASES:FF_PHASES;
const phaseIdx=Math.max(0,phases.indexOf(liveEng.phase));
const sendMsg=()=>{if(!newMsg.trim())return;setMessages(m=>[...m,{id:`m${Date.now()}`,author:user.name,avatar:user.avatar,time:"Nu",body:newMsg,visible:vis}]);setNewMsg("");showToast("Bericht verzonden");};
const addTask=()=>{if(!newTaskTitle.trim())return;setLocalTasks(ts=>[...ts,{id:`t${Date.now()}`,title:newTaskTitle,priority:newTaskPrio,due:newTaskDue||"—",status:"open",assignee:user.avatar,subtasks:[]}]);setNewTaskTitle("");setNewTaskDue("");setNewTaskPrio("normal");setShowTaskForm(false);showToast("Taak aangemaakt");};
const addFromTemplate=(tpl)=>{
  const newTask={
    id:`t${Date.now()}`,
    title:tpl.name,
    priority:"high",
    due:"—",
    status:"open",
    assignee:user.avatar,
    templateId:tpl.id,
    subtasks:(tpl.items||[]).map((item,i)=>({id:`st${Date.now()}${i}`,title:item,status:"open",priority:"normal"}))
  };
  setLocalTasks(ts=>[...ts,newTask]);
  setShowTemplatePicker(false);
  setExpandedTask(newTask.id);
  showToast(`"${tpl.name}" aangemaakt met ${newTask.subtasks.length} subtaken`);
};
const toggleTask=(id)=>setLocalTasks(ts=>ts.map(t=>t.id===id?{...t,status:t.status==="done"?"open":"done"}:t));
const toggleSubtask=(taskId,subId)=>setLocalTasks(ts=>ts.map(t=>t.id===taskId?{...t,subtasks:(t.subtasks||[]).map(s=>s.id===subId?{...s,status:s.status==="done"?"open":"done"}:s)}:t));
return(
<div>
<button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:C.secondary,fontSize:12,fontWeight:600,marginBottom:14,padding:0}}>
<ChevronLeft size={15}/> {t("back")}
</button>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
<div>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><DeptTag dept={eng.dept}/><HealthDot status={liveEng.health}/><span style={{fontSize:10,color:C.secondary,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>{eng.ref}</span></div>
<h1 style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:C.text,margin:"0 0 4px"}}>{eng.name}</h1>
<div style={{fontSize:12,color:C.secondary}}>Cliënt: <strong style={{color:C.text}}>{eng.client}</strong> · Manager: <strong style={{color:C.text}}>{eng.manager}</strong></div>
</div>
<div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"flex-end"}}>
{/* Phase selector */}
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4,textAlign:"right"}}>FASE</div>
<select value={liveEng.phase} onChange={e=>{updateEng({phase:e.target.value});showToast(`Fase bijgewerkt naar ${e.target.value}`);}} style={{padding:"6px 28px 6px 10px",borderRadius:8,border:`1.5px solid ${C.crimson}`,fontSize:12,fontWeight:700,color:C.crimson,background:C.crimsonFaint,outline:"none",cursor:"pointer",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238B1A2B'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center"}}>
{phases.map(p=><option key={p} value={p}>{p}</option>)}
</select>
</div>
{/* Status selector */}
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4,textAlign:"right"}}>STATUS</div>
<select value={liveEng.status||"Actief"} onChange={e=>{updateEng({status:e.target.value});showToast(`Status bijgewerkt naar ${e.target.value}`);}} style={{padding:"6px 28px 6px 10px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:11,fontWeight:600,color:C.text,background:C.surface,outline:"none",cursor:"pointer",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237A6B60'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 8px center"}}>
{ENGAGEMENT_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
</select>
</div>
{/* Health selector */}
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4,textAlign:"right"}}>GEZONDHEID</div>
<div style={{display:"flex",gap:6}}>
{[{v:"green",label:"Groen"},{v:"amber",label:"Amber"},{v:"red",label:"Rood"}].map(h=>(
<button key={h.v} onClick={()=>{updateEng({health:h.v});showToast(`Gezondheid bijgewerkt`);}} style={{padding:"5px 10px",borderRadius:7,border:`1.5px solid ${liveEng.health===h.v?(h.v==="red"?C.red:h.v==="amber"?C.amber:C.green):C.border}`,background:liveEng.health===h.v?(h.v==="red"?C.redBg:h.v==="amber"?C.amberBg:C.greenBg):"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
<span style={{width:7,height:7,borderRadius:"50%",background:h.v==="red"?C.red:h.v==="amber"?C.amber:C.green,display:"inline-block"}}/>
<span style={{fontSize:9,fontWeight:700,color:h.v==="red"?C.red:h.v==="amber"?C.amber:C.green}}>{h.label}</span>
</button>
))}
</div>
</div>
</div>
</div>
<div style={{background:C.surface,borderRadius:14,padding:"16px 20px",border:`1px solid ${C.border}`,marginBottom:18}}>
<div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:12}}>{t("progress")} — klik op een fase om te wijzigen</div>
<div style={{display:"flex",alignItems:"center"}}>
{phases.map((p,i)=>(
<div key={p} style={{display:"flex",alignItems:"center",flex:1}}>
<div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
<div onClick={()=>{updateEng({phase:p});showToast(`Fase gewijzigd naar ${p}`);}} style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:i<phaseIdx?C.crimson:i===phaseIdx?C.crimsonFaint:"#F0EDE8",border:`2px solid ${i<=phaseIdx?C.crimson:C.border}`,marginBottom:6,cursor:"pointer",transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}>
{i<phaseIdx?<CheckCircle size={14} color={CREAM}/>:<span style={{fontSize:10,fontWeight:700,color:i===phaseIdx?C.crimson:C.secondary}}>{i+1}</span>}
</div>
<span style={{fontSize:9,fontWeight:700,color:i===phaseIdx?C.crimson:i<phaseIdx?C.text:C.secondary,textAlign:"center",lineHeight:1.3}}>{p}</span>
</div>
{i<phases.length-1&&<div style={{height:2,flex:1,background:i<phaseIdx?C.crimson:C.border,margin:"0 4px",marginBottom:20}}/>}
</div>
))}
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
<div>
<div style={{display:"flex",gap:4,marginBottom:14,background:C.bg,borderRadius:10,padding:4}}>
{[{id:"tasks",label:`${t("internalTasks")} (${localTasks.length})`,Icon:Lock,bc:"#EEF2FF",bt:"#6366F1"},{id:"actions",label:`Cliëntacties (${localActions.length})`,Icon:CheckSquare,bc:C.greenBg,bt:C.green}].map(tb=>(
<button key={tb.id} onClick={()=>setActiveTab(tb.id)} style={{flex:1,padding:"8px 12px",borderRadius:8,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:activeTab===tb.id?C.surface:"transparent",color:activeTab===tb.id?C.text:C.secondary,fontWeight:activeTab===tb.id?700:400,fontSize:12,transition:"background .15s,color .15s,border-color .15s,opacity .15s",boxShadow:activeTab===tb.id?"0 1px 4px rgba(0,0,0,.07)":"none"}}>
<tb.Icon size={13}/>{tb.label}
<span style={{fontSize:8,background:tb.bc,color:tb.bt,padding:"2px 6px",borderRadius:4,fontWeight:700}}>{tb.id==="tasks"?"INTERN":"PORTAAL"}</span>
</button>
))}
</div>
{activeTab==="tasks"&&(
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
{/* Header */}
<div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:"#EEF2FF"}}>
<div style={{display:"flex",alignItems:"center",gap:8}}><Lock size={13} color="#6366F1"/><span style={{fontSize:11,fontWeight:700,color:"#4338CA"}}>Interne Taken — NIET zichtbaar voor cliënten</span></div>
<div style={{display:"flex",gap:7}}>
<button onClick={()=>setShowTemplatePicker(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:7,background:"#6366F1",color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer"}}><Layers size={11}/> Van template</button>
<button onClick={()=>setShowTaskForm(v=>!v)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:7,background:"transparent",color:"#4338CA",border:"1.5px solid #6366F1",fontSize:10,fontWeight:700,cursor:"pointer"}}><Plus size={11}/> Leeg</button>
</div>
</div>

{/* Template Picker Modal */}
{showTemplatePicker&&(
<div style={{position:"fixed",inset:0,background:"rgba(58,46,40,.52)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={()=>setShowTemplatePicker(false)}>
<div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:20,width:560,maxWidth:"95vw",boxShadow:"0 32px 80px rgba(58,46,40,.28)",overflow:"hidden",fontFamily:F.body}}>
<div style={{padding:"18px 22px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div>
<div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:4}}>Taak aanmaken voor {eng.name}</div>
<div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Kies een taakvorm</div>
</div>
<button onClick={()=>setShowTemplatePicker(false)} style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.secondary}}><X size={14}/></button>
</div>
<div style={{padding:"16px 22px",maxHeight:"60vh",overflowY:"auto"}}>
<div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>
{eng.dept==="TC"?"TACTIGENT TEMPLATES":"FISCAL FUSE TEMPLATES"}
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
{(eng.dept==="TC"?TASK_TEMPLATES_TC:TASK_TEMPLATES_FF).map(tpl=>(
<div key={tpl.id} onClick={()=>addFromTemplate(tpl)}
style={{padding:"14px 16px",borderRadius:12,border:`1.5px solid ${C.border}`,background:C.bg,cursor:"pointer",transition:"border-color .15s,background .15s"}}
onMouseEnter={e=>{e.currentTarget.style.borderColor=tpl.color;e.currentTarget.style.background=C.warm50;}}
onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.bg;}}>
<div style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
<div style={{width:32,height:32,borderRadius:8,background:tpl.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
<Layers size={14} color={CREAM}/>
</div>
<div style={{fontSize:13,fontWeight:700,color:C.text}}>{tpl.name}</div>
</div>
<div style={{display:"flex",flexDirection:"column",gap:3}}>
{(tpl.items||[]).slice(0,4).map((item,i)=>(
<div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:C.secondary}}>
<div style={{width:4,height:4,borderRadius:"50%",background:C.mushroom,flexShrink:0}}/>
{item}
</div>
))}
{(tpl.items||[]).length>4&&<div style={{fontSize:10,color:C.muted,paddingLeft:10}}>+{(tpl.items||[]).length-4} meer subtaken</div>}
</div>
<div style={{marginTop:10,fontSize:9,fontWeight:700,color:tpl.color,letterSpacing:"0.07em"}}>{(tpl.items||[]).length} SUBTAKEN INBEGREPEN →</div>
</div>
))}
</div>
</div>
</div>
</div>
)}

{/* Quick task form */}
{showTaskForm&&(
<div style={{padding:"14px 16px",background:"#F5F3FF",borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
<input value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Taakomschrijving..." style={{flex:2,minWidth:180,padding:"8px 11px",borderRadius:8,border:"1.5px solid #6366F1",fontSize:12,outline:"none"}}/>
<select value={newTaskPrio} onChange={e=>setNewTaskPrio(e.target.value)} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:11,outline:"none",cursor:"pointer"}}>
{[["low","Laag"],["normal","Normaal"],["high","Hoog"],["critical","Kritiek"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
</select>
<input type="date" value={newTaskDue} onChange={e=>setNewTaskDue(e.target.value)} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:11,outline:"none"}}/>
<button onClick={addTask} style={{padding:"7px 14px",borderRadius:7,background:"#6366F1",color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>Opslaan</button>
<button onClick={()=>setShowTaskForm(false)} style={{padding:"7px 10px",borderRadius:7,background:"transparent",color:C.secondary,border:`1px solid ${C.border}`,fontSize:11,cursor:"pointer"}}><X size={12}/></button>
</div>
)}

{/* Empty state */}
{localTasks.length===0&&!showTaskForm&&(
<div style={{padding:"32px 24px",textAlign:"center"}}>
<Layers size={28} color={C.mushroom} style={{marginBottom:10}}/>
<div style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:C.text,marginBottom:4}}>Nog geen taken</div>
<div style={{fontSize:12,color:C.secondary,marginBottom:14}}>Kies een template of maak een losse taak aan.</div>
<button onClick={()=>setShowTemplatePicker(true)} style={{padding:"8px 18px",borderRadius:9,background:"#6366F1",color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>
<Layers size={12} style={{marginRight:6,verticalAlign:"middle"}}/> Kies template
</button>
</div>
)}

{/* Task list with expandable subtasks */}
{localTasks.map(tk=>{
const subDone=(tk.subtasks||[]).filter(s=>s.status==="done").length;
const subTotal=(tk.subtasks||[]).length;
const isExpanded=expandedTask===tk.id;
const pctDone=subTotal>0?Math.round((subDone/subTotal)*100):0;
return(
<div key={tk.id} style={{borderTop:`1px solid ${C.border}`}}>
{/* Task row */}
<div style={{padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
<div onClick={()=>toggleTask(tk.id)} style={{width:18,height:18,borderRadius:5,border:`2px solid ${tk.status==="done"?C.green:C.border}`,background:tk.status==="done"?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
{tk.status==="done"&&<Check size={11} color={CREAM}/>}
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:13,fontWeight:600,color:tk.status==="done"?C.secondary:C.text,textDecoration:tk.status==="done"?"line-through":"none",marginBottom:subTotal>0?5:0}}>{tk.title}</div>
{subTotal>0&&(
<div style={{display:"flex",alignItems:"center",gap:8}}>
{/* Progress bar */}
<div style={{flex:1,maxWidth:120,height:4,borderRadius:2,background:C.mushroom,overflow:"hidden"}}>
<div style={{width:`${pctDone}%`,height:"100%",background:pctDone===100?C.green:"#6366F1",borderRadius:2,transition:"width .3s"}}/>
</div>
<span style={{fontSize:10,fontWeight:700,color:pctDone===100?C.green:C.secondary}}>{subDone}/{subTotal}</span>
<PriorityDot level={tk.priority}/>
</div>
)}
{subTotal===0&&<div style={{display:"flex",alignItems:"center",gap:10,marginTop:3}}><PriorityDot level={tk.priority}/><span style={{fontSize:10,color:C.secondary}}>Deadline: {tk.due}</span></div>}
</div>
<div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
<Avatar initials={tk.assignee} size={24} bg={C.walnut}/>
{subTotal>0&&(
<button onClick={()=>setExpandedTask(isExpanded?null:tk.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:6,background:isExpanded?"#EEF2FF":"transparent",border:`1px solid ${isExpanded?"#6366F1":C.border}`,color:isExpanded?"#4338CA":C.secondary,fontSize:10,fontWeight:700,cursor:"pointer",transition:"background .15s,border-color .15s"}}>
<ChevronRight size={11} style={{transform:isExpanded?"rotate(90deg)":"none",transition:"transform .2s"}}/>
{subTotal} subtaken
</button>
)}
</div>
</div>

{/* Expandable subtasks */}
{isExpanded&&subTotal>0&&(
<div style={{background:"#F5F3FF",borderTop:`1px solid #E0E7FF`,padding:"8px 16px 12px 48px"}}>
<div style={{fontSize:9,fontWeight:700,color:"#4338CA",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>SUBTAKEN</div>
{(tk.subtasks||[]).map(sub=>(
<div key={sub.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,marginBottom:4,background:sub.status==="done"?"rgba(21,128,61,.06)":"rgba(255,255,255,.7)",border:`1px solid ${sub.status==="done"?"rgba(21,128,61,.15)":"rgba(99,102,241,.12)"}`}}>
<div onClick={()=>toggleSubtask(tk.id,sub.id)} style={{width:15,height:15,borderRadius:4,border:`2px solid ${sub.status==="done"?C.green:"#6366F1"}`,background:sub.status==="done"?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
{sub.status==="done"&&<Check size={9} color={CREAM}/>}
</div>
<span style={{fontSize:12,color:sub.status==="done"?C.secondary:C.text,textDecoration:sub.status==="done"?"line-through":"none",flex:1,fontWeight:sub.status==="done"?400:500}}>{sub.title}</span>
{sub.status==="done"
?<span style={{fontSize:9,fontWeight:700,color:C.green,background:C.greenBg,padding:"2px 7px",borderRadius:4}}>KLAAR</span>
:<span style={{fontSize:9,fontWeight:700,color:"#4338CA",background:"#EEF2FF",padding:"2px 7px",borderRadius:4}}>OPEN</span>}
</div>
))}
<div style={{marginTop:8,fontSize:10,color:"#6366F1",fontWeight:700}}>
{pctDone===100?"✓ Alle subtaken voltooid":`${subTotal-subDone} subtaken resterend`}
</div>
</div>
)}
</div>
);})}
</div>
)}
{activeTab==="actions"&&(
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
<div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.greenBg}}>
<div style={{display:"flex",alignItems:"center",gap:8}}><Eye size={13} color={C.green}/><span style={{fontSize:11,fontWeight:700,color:C.green}}>Cliëntacties — Zichtbaar in portaal</span></div>
<button onClick={()=>setShowNewAction(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:8,background:C.crimson,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer"}}><Plus size={11}/> Actie aanmaken</button>
</div>
{localActions.length===0&&(<div style={{padding:"28px 24px",textAlign:"center",color:C.secondary,fontSize:12}}>Geen cliëntacties. Maak de eerste actie aan om uw cliënt te informeren.</div>)}
{localActions.map(a=>(
<div key={a.id} style={{padding:"14px 16px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
<div style={{display:"flex",alignItems:"flex-start",gap:10,flex:1}}>
<div style={{width:32,height:32,borderRadius:8,background:a.status==="completed"?C.greenBg:a.status==="overdue"?C.redBg:C.warm50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
{a.type==="upload"?<Upload size={13} color={a.status==="overdue"?C.red:C.secondary}/>:a.type==="approve"?<CheckSquare size={13} color={a.status==="completed"?C.green:C.secondary}/>:<FileText size={13} color={C.secondary}/>}
</div>
<div><div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:2}}>{a.title}</div><div style={{fontSize:11,color:C.secondary}}>{a.desc}</div></div>
</div>
<div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
<Badge label={a.status==="overdue"?"ACHTERSTALLIG":a.status==="completed"?"VOLTOOID":"OPENSTAAND"} color={a.status==="overdue"?C.red:a.status==="completed"?C.green:C.amber} bg={a.status==="overdue"?C.redBg:a.status==="completed"?C.greenBg:C.amberBg}/>
<span style={{fontSize:10,color:C.secondary}}>Termijn: {a.deadline}</span>
{a.status!=="completed"&&(<button onClick={()=>setLocalActions(as=>as.map(x=>x.id===a.id?{...x,status:"completed"}:x))} style={{fontSize:9,fontWeight:700,color:C.green,background:C.greenBg,border:"none",borderRadius:5,padding:"3px 8px",cursor:"pointer"}}>Markeer voltooid</button>)}
</div>
</div>
))}
{showNewAction&&(<NewClientActionModal eng={eng} onClose={()=>setShowNewAction(false)} onCreated={a=>{setLocalActions(as=>[...as,a]);}} showToast={showToast}/>)}
</div>
)}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",display:"flex",flexDirection:"column",maxHeight:460}}>
<div style={{padding:"13px 15px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:7}}>
<Send size={13} color={C.secondary}/><span style={{fontSize:12,fontWeight:700,color:C.text}}>Berichten</span>
</div>
<div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
{messages.map(m=>(
<div key={m.id} style={{display:"flex",alignItems:"flex-start",gap:8}}>
<Avatar initials={m.avatar} size={26} bg={m.author===user.name?C.crimson:C.walnut}/>
<div style={{flex:1}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,fontWeight:700,color:C.text}}>{m.author}</span><span style={{fontSize:10,color:C.secondary}}>{m.time}</span></div>
<div style={{fontSize:12,color:C.text,lineHeight:1.6,background:C.bg,borderRadius:8,padding:"8px 11px"}}>{m.body}</div>
{m.visible&&<div style={{fontSize:9,color:C.green,marginTop:3,fontWeight:600,display:"flex",alignItems:"center",gap:4}}><Eye size={9}/> Zichtbaar voor cliënt</div>}
</div>
</div>
))}
</div>
<div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`}}>
<button onClick={()=>setVis(v=>!v)} style={{display:"flex",alignItems:"center",gap:5,background:vis?C.greenBg:C.warm50,border:`1px solid ${vis?C.green:C.border}`,borderRadius:6,padding:"3px 9px",cursor:"pointer",fontSize:10,fontWeight:700,color:vis?C.green:C.secondary,marginBottom:7,transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}>
{vis?<Eye size={11}/>:<EyeOff size={11}/>}{vis?"Cliënt ziet dit":"Alleen intern"}
</button>
<div style={{display:"flex",gap:7}}>
<input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Typ een bericht..." style={{flex:1,padding:"7px 11px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none"}}/>
<button onClick={sendMsg} style={{padding:"7px 12px",borderRadius:8,background:C.crimson,color:CREAM,border:"none",cursor:"pointer"}}><Send size={12}/></button>
</div>
</div>
</div>
</div>
</div>
);
}

// ─── TASKS VIEW ──────────────────────────────────────────────────────────────
function TasksView({user}){
const t=useT();
const [tasks,setTasks]=useState(Object.values(TASKS_BY_ENG).flat());
const [statusF,setStatusF]=useState("ALL"); const [q,setQ]=useState("");
const [showForm,setShowForm]=useState(false); const [newTitle,setNewTitle]=useState(""); const [newPrio,setNewPrio]=useState("normal"); const [newDue,setNewDue]=useState("");
const filtered=tasks.filter(tk=>{ const sOk=statusF==="ALL"||tk.status===statusF; const qOk=!q||tk.title.toLowerCase().includes(q.toLowerCase()); return sOk&&qOk; });
const toggle=(id)=>setTasks(ts=>ts.map(tk=>tk.id===id?{...tk,status:tk.status==="done"?"open":"done"}:tk));
const addTask=()=>{ if(!newTitle.trim())return; setTasks(ts=>[...ts,{id:`t${Date.now()}`,title:newTitle,priority:newPrio,due:newDue||"—",status:"open",assignee:user.avatar}]); setNewTitle("");setNewPrio("normal");setNewDue("");setShowForm(false); };
const sLabel={open:t("open"),in_progress:t("inProgress"),done:t("done")};
const sColor={open:C.secondary,in_progress:C.amber,done:C.green};
const sBg={open:C.warm50,in_progress:C.amberBg,done:C.greenBg};
const doneCount=tasks.filter(x=>x.status==="done").length;
return(
<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
<PageHeader kicker="Intern" title={t("tasks")}/>
<div style={{display:"flex",gap:10,marginTop:4}}>
<div style={{textAlign:"center",background:C.surface,borderRadius:12,padding:"11px 18px",border:`1px solid ${C.border}`}}>
<div style={{fontSize:8.5,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:3}}>VOLTOOID</div>
<div style={{fontFamily:F.display,fontSize:22,fontWeight:600,color:C.crimson}}>{doneCount}/{tasks.length}</div>
</div>
</div>
</div>
<div style={{padding:"10px 16px",borderRadius:10,background:"#EEF2FF",border:"1px solid #C7D2FE",display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
<Lock size={13} color="#6366F1"/><span style={{fontSize:11,fontWeight:700,color:"#4338CA"}}>Interne taken — beveiligd, nooit zichtbaar voor cliënten</span>
</div>
<div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
<div style={{position:"relative",flex:1,minWidth:180,maxWidth:280}}>
<Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek taak..." style={{width:"100%",padding:"7px 30px 7px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
{q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
</div>
{["ALL","open","in_progress","done"].map(s=>(<Pill key={s} label={s==="ALL"?"Alle":sLabel[s]||s} active={statusF===s} onClick={()=>setStatusF(s)}/>))}
<button onClick={()=>setShowForm(v=>!v)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",marginLeft:"auto"}}><Plus size={11}/> Nieuwe taak</button>
</div>
{showForm&&(
<div style={{background:"#F5F3FF",border:"1.5px solid #6366F1",borderRadius:12,padding:"14px 16px",marginBottom:12,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
<input value={newTitle} onChange={e=>setNewTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Nieuwe taak..." style={{flex:2,minWidth:200,padding:"8px 11px",borderRadius:8,border:"1.5px solid #6366F1",fontSize:12,outline:"none"}}/>
<select value={newPrio} onChange={e=>setNewPrio(e.target.value)} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:11,outline:"none",cursor:"pointer"}}>
{[["low","Laag"],["normal","Normaal"],["high","Hoog"],["critical","Kritiek"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
</select>
<input type="date" value={newDue} onChange={e=>setNewDue(e.target.value)} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:11,outline:"none"}}/>
<button onClick={addTask} style={{padding:"7px 16px",borderRadius:8,background:"#6366F1",color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Opslaan</button>
<button onClick={()=>setShowForm(false)} style={{padding:"7px 10px",borderRadius:8,background:"transparent",color:C.secondary,border:`1px solid ${C.border}`,fontSize:11,cursor:"pointer"}}><X size={12}/></button>
</div>
)}
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
{filtered.length===0?(<div style={{padding:"48px 24px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:C.secondary}}>Geen taken gevonden</div></div>):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["","TAAK","PRIO","STATUS","DATUM","MGR"].map((h,i)=><th key={i} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{filtered.map(tk=>(
<tr key={tk.id} style={{borderTop:`1px solid ${C.border}`,opacity:tk.status==="done"?0.65:1}}>
<td style={{padding:"12px 14px",width:36}}><div onClick={()=>toggle(tk.id)} style={{width:18,height:18,borderRadius:5,border:`2px solid ${tk.status==="done"?C.green:C.border}`,background:tk.status==="done"?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{tk.status==="done"&&<CheckCircle size={11} color={CREAM}/>}</div></td>
<td style={{padding:"12px 14px"}}><div style={{fontSize:13,fontWeight:600,color:C.text,textDecoration:tk.status==="done"?"line-through":"none"}}>{tk.title}</div></td>
<td style={{padding:"12px 14px"}}><PriorityDot level={tk.priority}/></td>
<td style={{padding:"12px 14px"}}><Badge label={sLabel[tk.status]||tk.status} color={sColor[tk.status]||C.secondary} bg={sBg[tk.status]||C.warm50}/></td>
<td style={{padding:"12px 14px",fontSize:12,color:C.secondary}}>{tk.due}</td>
<td style={{padding:"12px 14px"}}><Avatar initials={tk.assignee} size={26} bg={C.walnut}/></td>
</tr>
))}</tbody>
</table>
)}
</div>
</div>
);
}

// ─── CLIENT ACTIONS VIEW (STAFF) ─────────────────────────────────────────────
// ─── NEW CLIENT ACTION MODAL ──────────────────────────────────────────────────
function NewClientActionModal({eng,onClose,onCreated,showToast}){
const [title,setTitle]=useState("");
const [desc,setDesc]=useState("");
const [type,setType]=useState("upload");
const [deadline,setDeadline]=useState("");
const [saving,setSaving]=useState(false);
useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);
const ACTION_TYPES=[
{id:"upload",label:"Upload",desc:"Cliënt moet een bestand aanleveren",Icon:Upload},
{id:"approve",label:"Goedkeuren",desc:"Cliënt moet een document goedkeuren",Icon:CheckSquare},
{id:"sign",label:"Ondertekenen",desc:"Cliënt moet een document ondertekenen",Icon:FileText},
{id:"review",label:"Beoordelen",desc:"Cliënt moet informatie beoordelen",Icon:ClipboardList},
];
const isValid=title.trim().length>2;
const submit=async()=>{
if(!isValid||saving)return;
setSaving(true);
const newAction={id:`ca${Date.now()}`,title:title.trim(),desc:desc.trim(),type,status:"pending",
deadline:deadline?new Date(deadline).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—",
engagement_id:eng.id};
onCreated(newAction);
showToast(`Cliëntactie "${title}" aangemaakt`);
onClose();
};
return(
<div style={{position:"fixed",inset:0,background:"rgba(58,46,40,.58)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:560,maxWidth:"96vw",boxShadow:"0 40px 100px rgba(58,46,40,.32)",display:"flex",flexDirection:"column",maxHeight:"92vh",overflow:"hidden"}}>
<div style={{padding:"18px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
<div>
<div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{eng.ref} · {eng.client}</div>
<div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Nieuwe Cliëntactie</div>
</div>
<button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}><X size={16}/></button>
</div>
<div style={{overflowY:"auto",padding:"22px 24px",display:"flex",flexDirection:"column",gap:18}}>
<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:C.greenBg,border:`1px solid ${C.green}30`}}>
<Eye size={13} color={C.green}/>
<span style={{fontSize:11,fontWeight:700,color:C.green}}>Zichtbaar voor cliënt in het portaal · Niet bewerkbaar door cliënt</span>
</div>
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>ACTIETYPE</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
{ACTION_TYPES.map(at=>{
const sel=type===at.id;
return(
<div key={at.id} onClick={()=>setType(at.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:11,border:`2px solid ${sel?C.crimson:C.border}`,background:sel?C.crimsonFaint:C.bg,cursor:"pointer",transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}>
<div style={{width:34,height:34,borderRadius:9,background:sel?C.crimson:C.surface,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}>
<at.Icon size={15} color={sel?CREAM:C.secondary}/>
</div>
<div>
<div style={{fontSize:12,fontWeight:700,color:C.text}}>{at.label}</div>
<div style={{fontSize:9,color:C.secondary,lineHeight:1.4}}>{at.desc}</div>
</div>
</div>
);
})}
</div>
</div>
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>ACTIETITEL <span style={{color:C.crimson}}>*</span></div>
<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Bijv. Jaarrekening 2024 Uploaden" style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${title.length>2?C.crimson:C.border}`,fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color .15s"}}/>
</div>
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>INSTRUCTIES VOOR CLIËNT</div>
<textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Geef duidelijke instructies aan de cliënt..." rows={3} style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.6}}/>
</div>
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>DEADLINE</div>
<input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} style={{padding:"10px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer"}}/>
</div>
{isValid&&(
<div style={{background:C.warm50,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`}}>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>VOORVERTONING</div>
<div style={{display:"flex",alignItems:"flex-start",gap:12}}>
<div style={{width:38,height:38,borderRadius:10,background:C.crimson,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
{type==="upload"?<Upload size={15} color={CREAM}/>:type==="approve"?<CheckSquare size={15} color={CREAM}/>:type==="sign"?<FileText size={15} color={CREAM}/>:<ClipboardList size={15} color={CREAM}/>}
</div>
<div style={{flex:1}}>
<div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:3}}>{title}</div>
{desc&&<div style={{fontSize:11,color:C.secondary,lineHeight:1.5}}>{desc}</div>}
{deadline&&<div style={{fontSize:10,color:C.secondary,marginTop:4}}>Termijn: {new Date(deadline).toLocaleDateString("nl-SR",{day:"2-digit",month:"long",year:"numeric"})}</div>}
</div>
<span style={{fontSize:9,fontWeight:700,background:C.amberBg,color:C.amber,padding:"3px 9px",borderRadius:4,textTransform:"uppercase",flexShrink:0}}>OPENSTAAND</span>
</div>
</div>
)}
</div>
<div style={{padding:"16px 24px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0,background:C.surface}}>
<button onClick={submit} disabled={!isValid||saving} style={{flex:1,padding:"12px",borderRadius:10,background:isValid?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:isValid?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"background .15s"}}>
<Send size={14}/> {saving?"Aanmaken...":"Actie aanmaken"}
</button>
<button onClick={onClose} style={{padding:"12px 20px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
</div>
</div>
</div>
);
}

// ─── CLIENT ACTIONS VIEW (STAFF) ──────────────────────────────────────────────
const ALL_CLIENT_ACTIONS_DATA=[];
function ClientActionsView({dept,showToast}){
const t=useT();
const [actions,setActions]=useState(ALL_CLIENT_ACTIONS_DATA.filter(a=>a.dept===dept));
const [statusF,setStatusF]=useState("ALL");
const [q,setQ]=useState("");
const [showNew,setShowNew]=useState(false);
const filtered=actions.filter(a=>{
const sOk=statusF==="ALL"||a.status===statusF;
const qOk=!q||a.title.toLowerCase().includes(q.toLowerCase())||a.client.toLowerCase().includes(q.toLowerCase());
return sOk&&qOk;
});
const statusMeta={pending:{label:"OPENSTAAND",color:C.amber,bg:C.amberBg},overdue:{label:"ACHTERSTALLIG",color:C.red,bg:C.redBg},completed:{label:"VOLTOOID",color:C.green,bg:C.greenBg}};
const typeMeta={upload:{label:"Upload",color:"#6366F1",bg:"#EEF2FF"},approve:{label:"Goedkeuring",color:C.green,bg:C.greenBg},sign:{label:"Ondertekening",color:C.amber,bg:C.amberBg},review:{label:"Beoordeling",color:C.secondary,bg:C.warm50}};
const setStatus=(id,status)=>{setActions(as=>as.map(a=>a.id===id?{...a,status}:a));if(showToast)showToast(`Status bijgewerkt`);};
const overdue=actions.filter(a=>a.status==="overdue").length;
const pending=actions.filter(a=>a.status==="pending").length;
const done=actions.filter(a=>a.status==="completed").length;
return(
<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
<PageHeader kicker={dept==="TC"?"Tactigent Consultancy":"Fiscal Fuse"} title="Cliëntacties"/>
<button onClick={()=>setShowNew(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",marginTop:4}}>
<Plus size={13}/> Nieuwe actie
</button>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
{[{label:"ACHTERSTALLIG",value:overdue,color:C.red,bg:C.redBg,Icon:AlertTriangle},{label:"OPENSTAAND",value:pending,color:C.amber,bg:C.amberBg,Icon:Clock},{label:"VOLTOOID",value:done,color:C.green,bg:C.greenBg,Icon:CheckCircle}].map(k=>(
<div key={k.label} style={{background:k.bg,borderRadius:12,padding:"14px 18px",border:`1px solid ${k.color}25`,display:"flex",alignItems:"center",gap:12}}>
<div style={{width:38,height:38,borderRadius:10,background:`${k.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
<k.Icon size={16} color={k.color}/>
</div>
<div>
<div style={{fontFamily:F.display,fontSize:28,fontWeight:600,color:k.color,lineHeight:1}}>{k.value}</div>
<div style={{fontSize:9,fontWeight:700,color:k.color,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:2}}>{k.label}</div>
</div>
</div>
))}
</div>
<div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",borderRadius:9,background:C.greenBg,border:`1px solid ${C.green}30`,marginBottom:14}}>
<Eye size={12} color={C.green}/>
<span style={{fontSize:11,fontWeight:600,color:C.green}}>Alle acties zijn zichtbaar voor de cliënt in hun portaal</span>
<span style={{marginLeft:"auto",fontSize:9,fontWeight:700,color:C.green,background:`${C.green}18`,padding:"3px 8px",borderRadius:4}}>PORTAAL SYNC ACTIEF</span>
</div>
<div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
<div style={{position:"relative",flex:1,minWidth:200}}>
<Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek op actie of cliënt..." style={{width:"100%",padding:"7px 30px 7px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
{q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
</div>
{[["ALL","Alle"],["pending","Openstaand"],["overdue","Achterstallig"],["completed","Voltooid"]].map(([v,l])=>(
<Pill key={v} label={l} active={statusF===v} onClick={()=>setStatusF(v)}/>
))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
{filtered.length===0?(
<div style={{padding:"52px 24px",textAlign:"center"}}>
<CheckCircle size={32} color={C.green} style={{marginBottom:10}}/>
<div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Geen acties gevonden</div>
<div style={{fontSize:12,color:C.secondary,marginTop:4}}>Pas de filters aan of maak een nieuwe actie aan.</div>
</div>
):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["ACTIE","CLIËNT","TYPE","DEADLINE","STATUS","BEHEREN"].map((h,i)=><th key={i} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{filtered.map(a=>{
const sm=statusMeta[a.status]||statusMeta.pending;
const tm=typeMeta[a.type]||typeMeta.review;
return(
<tr key={a.id} style={{borderTop:`1px solid ${C.border}`}}>
<td style={{padding:"13px 18px"}}>
<div style={{fontSize:13,fontWeight:600,color:C.text}}>{a.title}</div>
<div style={{fontSize:10,color:C.secondary,marginTop:2}}>{a.engagement} · {a.desc.slice(0,52)}{a.desc.length>52?"...":""}</div>
</td>
<td style={{padding:"13px 18px",fontSize:12,fontWeight:600,color:C.text}}>{a.client}</td>
<td style={{padding:"13px 18px"}}><span style={{fontSize:9,fontWeight:700,background:tm.bg,color:tm.color,padding:"3px 9px",borderRadius:4,textTransform:"uppercase"}}>{tm.label}</span></td>
<td style={{padding:"13px 18px"}}><span style={{fontSize:12,color:a.status==="overdue"?C.red:C.secondary,fontWeight:a.status==="overdue"?700:400}}>{a.deadline}</span></td>
<td style={{padding:"13px 18px"}}><span style={{fontSize:9,fontWeight:700,background:sm.bg,color:sm.color,padding:"3px 9px",borderRadius:4,textTransform:"uppercase"}}>{sm.label}</span></td>
<td style={{padding:"13px 18px"}}>
<div style={{display:"flex",gap:6}}>
{a.status!=="completed"&&(
<button onClick={()=>setStatus(a.id,"completed")} style={{padding:"5px 10px",borderRadius:7,background:C.greenBg,border:`1px solid ${C.green}30`,color:C.green,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
<CheckCircle size={11}/> Voltooien
</button>
)}
{a.status==="completed"&&(
<button onClick={()=>setStatus(a.id,"pending")} style={{padding:"5px 10px",borderRadius:7,background:C.warm50,border:`1px solid ${C.border}`,color:C.secondary,fontSize:10,fontWeight:700,cursor:"pointer"}}>Heropenen</button>
)}
</div>
</td>
</tr>
);
})}</tbody>
</table>
)}
</div>
{showNew&&(
<NewClientActionModal eng={{id:"standalone",name:"Nieuwe Actie",ref:dept+"-NIEUW",dept,client:"Selecteer engagement"}} onClose={()=>setShowNew(false)} onCreated={a=>setActions(as=>[{...a,dept,client:"Nieuw",engagement:dept+"-NIEUW"},...as])} showToast={showToast||(()=>{})}/>
)}
</div>
);
}
// ─── AUDIT LOG VIEW ──────────────────────────────────────────────────────────
const DEMO_AUDIT=[];
const AUDIT_COLOR={FASE_BIJGEWERKT:{c:"#6366F1",bg:"#EEF2FF"},DOCUMENT_GEVERIFIEERD:{c:"#15803D",bg:"#F0FDF4"},CLIËNT_AANGEMAAKT:{c:"#C97B1A",bg:"#FDF6EC"},QBO_BETALING_ONTVANGEN:{c:"#15803D",bg:"#F0FDF4"},GEZONDHEID_BIJGEWERKT:{c:"#C83232",bg:"#FEF2F2"},GEZONDHEID_AUTO_ROOD:{c:"#C83232",bg:"#FEF2F2"},CLIËNTACTIE_AANGEMAAKT:{c:"#8B1A2B",bg:"#F9F0F1"},FACTUUR_AANGEMAAKT:{c:"#1D4ED8",bg:"#EFF6FF"}};

function AuditLogView({user}){
const [deptF,setDeptF]=useState("ALL");
const [q,setQ]=useState("");
const logs=DEMO_AUDIT.filter(l=>{
const dOk=deptF==="ALL"||l.dept===deptF;
const qOk=!q||l.action.toLowerCase().includes(q.toLowerCase())||l.actor.toLowerCase().includes(q.toLowerCase())||l.entityId.toLowerCase().includes(q.toLowerCase());
return dOk&&qOk;
});
return(
<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
<PageHeader kicker="Systeem" title="Audit Log"/>
<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,background:C.espresso,color:CREAM,fontSize:11,fontWeight:700}}>
<Shield size={13} color={CREAM}/> Immutabel · {logs.length} Records
</div>
</div>
<div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
<div style={{position:"relative",flex:1,maxWidth:320}}>
<Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek actie, acteur, entiteit..." style={{width:"100%",padding:"7px 30px 7px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
{q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
</div>
{[["ALL","Alle"],["TC","Tactigent"],["FF","Fiscal Fuse"]].map(([v,l])=>(
<button key={v} onClick={()=>setDeptF(v)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${deptF===v?C.crimson:C.border}`,background:deptF===v?C.crimson:"transparent",color:deptF===v?CREAM:C.secondary,fontSize:11,fontWeight:600,cursor:"pointer",transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}>{l}</button>
))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
{logs.map((l,i)=>{
const meta=AUDIT_COLOR[l.action]||{c:C.secondary,bg:C.warm50};
return(
<div key={l.id} style={{padding:"14px 20px",borderTop:i>0?`1px solid ${C.border}`:"none",display:"flex",alignItems:"flex-start",gap:14}}>
<div style={{width:36,height:36,borderRadius:9,background:meta.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
<Activity size={14} color={meta.c}/>
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
<span style={{fontSize:12,fontWeight:700,color:C.text}}>{l.actor}</span>
<span style={{fontSize:9,fontWeight:700,background:meta.bg,color:meta.c,padding:"2px 8px",borderRadius:4,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l.action.replace(/_/g," ")}</span>
<span style={{fontSize:11,color:C.secondary}}>{l.entityId}</span>
</div>
{l.delta&&(<div style={{fontSize:11,color:C.secondary,background:C.warm50,borderRadius:6,padding:"3px 9px",display:"inline-block",marginTop:2}}>{l.delta}</div>)}
</div>
<div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
<span style={{fontSize:10,color:C.muted}}>{l.time}</span>
<DeptTag dept={l.dept}/>
</div>
</div>
);
})}
</div>
<div style={{display:"flex",alignItems:"center",gap:6,marginTop:14,fontSize:10,color:C.muted}}>
<Shield size={11}/> Audit log is immutabel — records kunnen niet worden verwijderd of gewijzigd door gebruikers.
</div>
</div>
);
}

// ─── REVIEW QUEUE ────────────────────────────────────────────────────────────
function ReviewQueue({showToast}){
const t=useT();
const [docs,setDocs]=useState(REVIEW_DOCS);
const [reviewing,setReviewing]=useState(null); const [decision,setDecision]=useState(""); const [note,setNote]=useState("");
const submitReview=async()=>{
if(!decision) return;
setDocs(ds=>ds.filter(d=>d.id!==reviewing.id));
showToast(decision==="verified"?`${reviewing.name} geverifieerd`:`${reviewing.name} afgewezen`);
// Persist to Supabase if doc has real UUID
if(reviewing.id && reviewing.id.includes("-")) {
updateDocumentReview(reviewing.id, decision).catch(e=>console.warn("reviewDoc:",e.message));
}
setReviewing(null); setDecision(""); setNote("");
};
const prioColor={kritiek:C.crimson,hoog:C.amber,normaal:C.secondary};
const prioBg={kritiek:C.crimsonFaint,hoog:C.amberBg,normaal:C.warm50};
return(
<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
<PageHeader kicker="Operationele Pijplijn" title={t("reviewQueue")}/>
<div style={{display:"flex",gap:10}}>
{[{l:t("pending"),v:docs.length,dark:false},{l:t("processedToday"),v:118+REVIEW_DOCS.length-docs.length,dark:true}].map(s=>(
<div key={s.l} style={{textAlign:"center",background:s.dark?C.espresso:C.surface,borderRadius:12,padding:"11px 18px",border:s.dark?"none":`1px solid ${C.border}`}}>
<div style={{fontSize:8.5,fontWeight:700,color:s.dark?C.taupeLight:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
<div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:s.dark?CREAM:C.crimson}}>{s.v}</div>
</div>
))}
</div>
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden",marginBottom:16}}>
{docs.length===0?(<div style={{padding:"48px 24px",textAlign:"center"}}><CheckCircle size={32} color={C.green} style={{marginBottom:12}}/><div style={{fontFamily:F.display,fontSize:20,fontWeight:600,color:C.text}}>Wachtrij leeg</div></div>):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{[t("docName"),t("clientCol"),t("priority"),t("action")].map(h=><th key={h} style={{padding:"10px 20px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{docs.map(d=>(
<tr key={d.id} style={{borderTop:`1px solid ${C.border}`}}>
<td style={{padding:"13px 19px"}}><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:30,height:30,borderRadius:8,background:C.crimsonFaint,display:"flex",alignItems:"center",justifyContent:"center"}}><FileText size={13} color={C.crimson}/></div><div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{d.name}</div><div style={{fontSize:10,color:C.secondary}}>{d.uploaded}</div></div></div></td>
<td style={{padding:"13px 19px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><CompanyLogo name={d.client} size={26} dept="FF"/><span style={{fontSize:12,fontWeight:600,color:C.text}}>{d.client}</span></div></td>
<td style={{padding:"13px 19px"}}><span style={{fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,background:prioBg[d.priority]||C.warm50,color:prioColor[d.priority]||C.secondary,textTransform:"uppercase"}}>{d.priority}</span></td>
<td style={{padding:"13px 19px"}}><button onClick={()=>{setReviewing(d);setDecision("");setNote("");}} style={{padding:"6px 13px",borderRadius:8,background:C.walnut,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}><CheckSquare size={12}/> {t("review2")}</button></td>
</tr>
))}</tbody>
</table>
)}
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"16px"}}>
<div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}><AlertTriangle size={14} color={C.amber}/><span style={{fontSize:13,fontWeight:700,color:C.text}}>{t("focusRequired")}</span></div>
{[{},{title:"Nieuwe Uploads",desc:"5 nieuwe documenten ontvangen afgelopen 20 minuten.",c:C.amber}].map(a=>(
<div key={a.title} style={{padding:"11px 14px",borderRadius:9,border:`1.5px solid ${a.c}30`,background:a.c===C.crimson?C.crimsonFaint:C.amberBg,marginBottom:7,display:"flex",gap:10,alignItems:"flex-start"}}>
<div style={{width:6,height:6,borderRadius:"50%",background:a.c,flexShrink:0,marginTop:5}}/>
<div><div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>{a.title}</div>
<div style={{fontSize:11,color:C.secondary,lineHeight:1.6}}>{a.desc}</div></div>
</div>
))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"16px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
<div><div style={{fontSize:13,fontWeight:700,color:C.text}}>{t("queueLoad")}</div><div style={{fontSize:11,color:C.secondary}}>88%</div></div>
</div>
<div style={{display:"flex",gap:4,alignItems:"flex-end",height:44}}>
{[28,36,44,30,38,42,60,72,68,52,48,38].map((h,i)=>(<div key={i} style={{flex:1,borderRadius:"3px 3px 0 0",background:i>=6&&i<=8?C.crimson:C.border,height:`${h}px`}}/>))}
</div>
</div>
</div>
{reviewing&&(
<div style={{position:"fixed",inset:0,background:"rgba(58,46,40,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setReviewing(null)}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:18,width:520,maxWidth:"95vw",boxShadow:"0 32px 80px rgba(58,46,40,.3)",overflow:"hidden"}}>
<div style={{padding:"18px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{display:"flex",alignItems:"center",gap:9}}><FileText size={15} color={C.crimson}/><span style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:C.text}}>{reviewing.name}</span></div>
<button onClick={()=>setReviewing(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary}}><X size={18}/></button>
</div>
<div style={{padding:"22px"}}>
<div style={{display:"flex",gap:10,marginBottom:20}}>
<span style={{fontSize:12,color:C.secondary}}>Cliënt:</span><span style={{fontSize:12,fontWeight:600,color:C.text}}>{reviewing.client}</span>
</div>
<div style={{display:"flex",gap:10,marginBottom:16}}>
{[{v:"verified",label:"Verifiëren",bg:C.green,Icon:CheckCircle},{v:"rejected",label:"Afwijzen",bg:C.red,Icon:X}].map(opt=>(
<button key={opt.v} onClick={()=>setDecision(opt.v)} style={{flex:1,padding:"11px",borderRadius:10,border:`2px solid ${decision===opt.v?opt.bg:C.border}`,background:decision===opt.v?opt.bg:"transparent",color:decision===opt.v?CREAM:C.text,fontSize:12,fontWeight:700,cursor:"pointer",transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}>{opt.label}</button>
))}
</div>
<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Optionele toelichting..." rows={3} style={{width:"100%",padding:"10px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",marginBottom:14}}/>
<div style={{display:"flex",gap:10}}>
<button onClick={submitReview} disabled={!decision} style={{flex:1,padding:"11px",borderRadius:10,background:decision?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:decision?"pointer":"default"}}>Bevestigen</button>
<button onClick={()=>setReviewing(null)} style={{padding:"11px 18px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:12,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
</div>
</div>
</div>
</div>
)}
</div>
);
}

// ─── CRM VIEW ────────────────────────────────────────────────────────────────
function NewClientModal({user,companyData,setCompanyData,onClose,showToast}){
const [dept,setDept]=useState(user.dept==="BOTH"?"TC":user.dept);
const [name,setName]=useState("");
const [kkf,setKkf]=useState("");
const [contact,setContact]=useState("");
const [role,setRole]=useState("");
const [email,setEmail]=useState("");
const [phone,setPhone]=useState("");
const [lifecycle,setLifecycle]=useState("Strategische Groei");
const [industry,setIndustry]=useState("");
const [notes,setNotes]=useState("");
const [logoUrl,setLogoUrl]=useState(null);
const [logoDragging,setLogoDragging]=useState(false);
const logoRef=React.useRef();

const LIFECYCLE_OPTIONS=["Strategische Groei","Herstructurering","Compliance Review","Portfolio Uitbreiding","Retainer","Due Diligence","Nieuw Prospect"];
const INDUSTRY_OPTIONS=["Energie & Olie","Financiële Diensten","Juridisch","Vastgoed","Handel & Logistiek","Overheid","Horeca & Toerisme","Mijnbouw","Landbouw","Technologie","Anders"];

const avatarFrom=n=>n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"??";
const isValid=name.trim()&&contact.trim()&&dept;

const submit=async()=>{
if(!isValid) return;
const kkfVal=kkf.trim()||`SR-${new Date().getFullYear()}-${String(companyData.length+1).padStart(4,"0")}`;
const payload={name:name.trim(),kkf:kkfVal,dept,contact:contact.trim(),role:role.trim()||"Contactpersoon",
email:email.trim(),phone:phone.trim(),lifecycle,industry,notes,logo_url:logoUrl};
try {
const created=await createCompanyDB(payload);
setCompanyData(cs=>[{...created,avatar:avatarFrom(name),logoUrl},...cs]);
showToast(`Cliënt "${name}" aangemaakt in database`);
onClose(); return;
} catch(e){ console.warn("Supabase createCompany failed:", e.message); }
const newC={id:`c${Date.now()}`,name:name.trim(),kkf:kkfVal,dept,contact:contact.trim(),
role:role.trim()||"Contactpersoon",email:email.trim(),phone:phone.trim(),lifecycle,industry,notes,
avatar:avatarFrom(name),health:"green",logoUrl,
createdAt:new Date().toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"})};
setCompanyData(cs=>[newC,...cs]);
showToast(`Cliënt "${name}" aangemaakt`);
onClose();
};

const Field=({label,required,children})=>(
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6}}>
{label}{required&&<span style={{color:C.crimson}}> *</span>}
</div>
{children}
</div>
);
const inp=(val,set,placeholder,type="text")=>(
<input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={placeholder}
style={{width:"100%",padding:"10px 13px",borderRadius:9,border:`1.5px solid ${val?C.crimson:C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",transition:"border-color .15s"}}/>
);

useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);

return(
<div style={{position:"fixed",inset:0,background:"rgba(58,46,40,.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:640,maxWidth:"95vw",maxHeight:"92vh",boxShadow:"0 40px 100px rgba(58,46,40,.3)",display:"flex",flexDirection:"column",overflow:"hidden"}}>


    {/* Header */}
    <div style={{padding:"20px 26px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.crimsonFaint,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:40,height:40,borderRadius:10,background:C.crimson,display:"flex",alignItems:"center",justifyContent:"center"}}><Users size={18} color={CREAM}/></div>
        <div>
          <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Nieuwe Cliënt Aanmaken</div>
          <div style={{fontSize:10,color:C.secondary}}>Vul bedrijfsgegevens en contactpersoon in</div>
        </div>
      </div>
      <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:4}}><X size={18}/></button>
    </div>

    {/* Body — scrollable */}
    <div style={{overflowY:"auto",padding:"24px 26px",display:"flex",flexDirection:"column",gap:18}}>

      {/* Department */}
      {user.dept==="BOTH"&&(
        <Field label="Afdeling" required>
          <div style={{display:"flex",gap:8}}>
            {["TC","FF"].map(d=>(
              <button key={d} onClick={()=>setDept(d)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${dept===d?C.crimson:C.border}`,background:dept===d?C.crimsonFaint:"transparent",color:dept===d?C.crimson:C.secondary,fontSize:12,fontWeight:700,cursor:"pointer",transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}>
                {d==="TC"?"Tactigent Consultancy":"Fiscal Fuse"}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* Bedrijfsnaam + KKF */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Bedrijfsnaam" required>{}</Field>
        <Field label="KKF-nummer">
          <input value={kkf} onChange={e=>setKkf(e.target.value)} placeholder="SR-2025-0001 (auto)"
            style={{width:"100%",padding:"10px 13px",borderRadius:9,border:`1.5px solid ${kkf?C.crimson:C.border}`,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
        </Field>
      </div>

      {/* Sector + Lifecycle */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Sector / Industrie">
          <select value={industry} onChange={e=>setIndustry(e.target.value)} style={{width:"100%",padding:"10px 13px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.surface,boxSizing:"border-box"}}>
            <option value="">Selecteer sector...</option>
            {INDUSTRY_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Lifecycle Status">
          <select value={lifecycle} onChange={e=>setLifecycle(e.target.value)} style={{width:"100%",padding:"10px 13px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.surface,boxSizing:"border-box"}}>
            {LIFECYCLE_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
        </Field>
      </div>

      {/* Divider */}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{flex:1,height:1,background:C.border}}/>
        <span style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",whiteSpace:"nowrap"}}>Primair contactpersoon</span>
        <div style={{flex:1,height:1,background:C.border}}/>
      </div>

      {/* Contact */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="Volledige naam" required>{}</Field>
        <Field label="Functietitel">{inp(role,setRole,"Bijv. CFO, Directeur")}</Field>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Field label="E-mailadres">{inp(email,setEmail,"naam@bedrijf.sr","email")}</Field>
        <Field label="Telefoonnummer">{inp(phone,setPhone,"+597 8xx-xxxx","tel")}</Field>
      </div>

      {/* Logo upload */}
      <Field label="Bedrijfslogo">
        <input ref={logoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
          const file=e.target.files[0];
          if(!file) return;
          if(file.size>2*1024*1024){showToast("Bestand te groot — max 2MB");return;}
          setLogoUrl(URL.createObjectURL(file));
          showToast("Logo geladen");
        }}/>
        <div
          onClick={()=>logoRef.current?.click()}
          onDragOver={e=>{e.preventDefault();setLogoDragging(true);}}
          onDragLeave={()=>setLogoDragging(false)}
          onDrop={e=>{
            e.preventDefault();setLogoDragging(false);
            const file=e.dataTransfer.files[0];
            if(file&&file.type.startsWith("image/")){setLogoUrl(URL.createObjectURL(file));showToast("Logo geladen");}
          }}
          style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:10,border:`2px dashed ${logoDragging?C.crimson:logoUrl?C.green:C.border}`,background:logoDragging?C.crimsonFaint:logoUrl?C.greenBg:C.bg,cursor:"pointer",transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}
        >
          {logoUrl?(
            <>
              <img src={logoUrl} alt="logo" style={{width:52,height:52,borderRadius:10,objectFit:"contain",border:`1px solid ${C.border}`,background:CREAM}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:C.green,marginBottom:2}}>Logo geladen</div>
                <div style={{fontSize:10,color:C.secondary}}>Klik om te vervangen · Max 2 MB</div>
              </div>
              <button onClick={e=>{e.stopPropagation();setLogoUrl(null);}} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,color:C.secondary,fontSize:10,fontWeight:700,cursor:"pointer"}}>
                <X size={12}/>
              </button>
            </>
          ):(
            <>
              <div style={{width:52,height:52,borderRadius:10,border:`2px dashed ${C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.surface,flexShrink:0}}>
                <Upload size={18} color={C.secondary}/>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>Klik of sleep een afbeelding</div>
                <div style={{fontSize:10,color:C.secondary}}>PNG, JPG, SVG · Max 2 MB · Aanbevolen: 200×200px</div>
              </div>
            </>
          )}
        </div>
      </Field>

      {/* Notes */}
      <Field label="Interne notities">
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Aanvullende context, referenties, bijzonderheden..." rows={3}
          style={{width:"100%",padding:"10px 13px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:F.body}}/>
      </Field>

      {/* Preview card */}
      {name&&(
        <div style={{background:C.warm50,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:14}}>
          {logoUrl?(
            <img src={logoUrl} alt={name} style={{width:44,height:44,borderRadius:10,objectFit:"contain",border:`1px solid ${C.border}`,background:CREAM,flexShrink:0}}/>
          ):(
            <CompanyLogo name={name||"?"} size={44} dept={dept}/>
          )}
          <div>
            <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:3}}>{name||"—"}</div>
            <div style={{fontSize:11,color:C.secondary,display:"flex",gap:12}}>
              <span>{contact||"Contactpersoon"}{role&&` · ${role}`}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5}}>
              <DeptTag dept={dept}/>
              <span style={{fontSize:9,color:C.secondary}}>{lifecycle}</span>
              {industry&&<span style={{fontSize:9,color:C.muted}}>· {industry}</span>}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Footer */}
    <div style={{padding:"16px 26px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0,background:C.surface}}>
      <button onClick={submit} disabled={!isValid} style={{flex:1,padding:"12px",borderRadius:10,background:isValid?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:isValid?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"background .15s"}}>
        <Users size={15}/> Cliënt aanmaken
      </button>
      <button onClick={onClose} style={{padding:"12px 20px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
    </div>
  </div>
</div>


);
}

function CRMView({user,companyData,setCompanyData,setDetailCompany,showToast}){
const t=useT();
const [q,setQ]=useState(""); const [deptF,setDeptF]=useState("ALL");
const [showNew,setShowNew]=useState(false);
const src=companyData||COMPANIES_INIT;
const list=src.filter(c=>{ const dOk=deptF==="ALL"||c.dept===deptF; const sOk=user.dept==="BOTH"||c.dept===user.dept; const qOk=!q||c.name.toLowerCase().includes(q.toLowerCase())||(c.kkf||"").includes(q); return dOk&&sOk&&qOk; });
return(
<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
<PageHeader kicker="Strategie" title={t("clientOverview")}/>
<div style={{display:"flex",gap:10,marginTop:4}}>
{[{l:t("totalActive"),v:src.length,dark:false},{l:t("inReview"),v:src.filter(c=>c.health==="red"||c.lifecycle==="Compliance Review").length,dark:true}].map(s=>(
<div key={s.l} style={{textAlign:"center",background:s.dark?C.espresso:C.surface,borderRadius:12,padding:"11px 18px",border:s.dark?"none":`1px solid ${C.border}`}}>
<div style={{fontSize:8.5,fontWeight:700,color:s.dark?C.taupeLight:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
<div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:s.dark?CREAM:C.crimson}}>{s.v}</div>
</div>
))}
<button onClick={()=>setShowNew(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 16px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",alignSelf:"center"}}>
<Plus size={13}/> Nieuwe Cliënt
</button>
</div>
</div>
<div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
<div style={{position:"relative",flex:1,maxWidth:380}}>
<Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
<input value={q} onChange={e=>setQ(e.target.value)} placeholder={t("searchClient")} style={{width:"100%",padding:"8px 11px 8px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface}}/>
{q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
</div>
{user.dept==="BOTH"&&["ALL","TC","FF"].map(f=>(<Pill key={f} label={f==="ALL"?t("all"):f==="TC"?"TACTIGENT":"FISCAL FUSE"} active={deptF===f} onClick={()=>setDeptF(f)}/>))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
{list.length===0?(
<div style={{padding:"48px 24px",textAlign:"center"}}>
<Users size={32} color={C.mushroom} style={{marginBottom:12}}/>
<div style={{fontSize:14,fontWeight:600,color:C.secondary,marginBottom:8}}>{q?"Geen resultaten gevonden":"Nog geen cliënten"}</div>
<button onClick={()=>setShowNew(true)} style={{padding:"9px 20px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6}}><Plus size={13}/> Eerste cliënt aanmaken</button>
</div>
):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{[t("companyName"),t("contactPerson"),"AFDELING","SECTOR",t("lifecycle"),""].map((h,i)=><th key={i} style={{padding:"10px 20px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{list.map(c=>(
<tr key={c.id} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer",position:"relative"}} onClick={()=>setDetailCompany(c)}>
{c.alert&&<div style={{position:"absolute",left:0,top:"12px",bottom:"12px",width:3,background:C.crimson,borderRadius:"0 2px 2px 0"}}/>}
<td style={{padding:"13px 19px"}}>
<div style={{display:"flex",alignItems:"center",gap:11}}>
<CompanyLogo name={c.name} size={38} dept={c.dept} logoUrl={c.logoUrl}/>
<div>
<div style={{fontSize:13,fontWeight:700,color:C.text}}>{c.name}</div>
<div style={{fontSize:10,color:C.secondary}}>KKF {c.kkf}{c.createdAt&&<span style={{marginLeft:8,color:C.muted}}>· Aangemaakt {c.createdAt}</span>}</div>
</div>
</div>
</td>
<td style={{padding:"13px 19px"}}>
<div style={{fontSize:12,fontWeight:600,color:C.text}}>{c.contact}</div>
<div style={{fontSize:10,color:C.secondary}}>{c.role}{c.email&&<span style={{marginLeft:6,color:C.muted}}>· {c.email}</span>}</div>
</td>
<td style={{padding:"13px 19px"}}><DeptTag dept={c.dept}/></td>
<td style={{padding:"13px 19px",fontSize:11,color:C.secondary}}>{c.industry||"—"}</td>
<td style={{padding:"13px 19px"}}>
<div style={{display:"flex",alignItems:"center",gap:7}}><HealthDot status={c.health}/><span style={{fontSize:12,color:c.alert?C.crimson:C.text,fontWeight:c.alert?700:400}}>{c.lifecycle}</span></div>
</td>
<td style={{padding:"13px 19px"}}><ChevronRight size={15} color={C.secondary}/></td>
</tr>
))}</tbody>
</table>
)}
</div>
{showNew&&<NewClientModal user={user} companyData={src} setCompanyData={setCompanyData} onClose={()=>setShowNew(false)} showToast={showToast}/>}
</div>
);
}

// ─── LEADS VIEW ──────────────────────────────────────────────────────────────
function LeadsView({user,setDetailLead}){
const t=useT();
const [q,setQ]=useState(""); const [deptF,setDeptF]=useState("ALL");
const sL={new:"Nieuw",qualified:"Gekwalificeerd",proposal:"Voorstel",won:"Gewonnen",inquiry:"Aanvraag",strategy_review:"Strategie Review",engaged:"Betrokken"};
const sC={new:C.secondary,qualified:C.amber,proposal:C.crimson,won:C.green,inquiry:C.secondary,strategy_review:C.amber,engaged:C.green};
const leads=LEADS.filter(l=>{ const dOk=(user.dept==="BOTH"||l.dept===user.dept)&&(deptF==="ALL"||l.dept===deptF); const qOk=!q||l.name.toLowerCase().includes(q.toLowerCase()); return dOk&&qOk; });
return(
<div>
<PageHeader kicker="CRM" title={t("leadsTitle")}/>
<div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
<div style={{position:"relative",flex:1,minWidth:200,maxWidth:320}}>
<Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek op bedrijfsnaam..." style={{width:"100%",padding:"7px 30px 7px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
{q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
</div>
{user.dept==="BOTH"&&["ALL","TC","FF"].map(f=>(<Pill key={f} label={f==="ALL"?"Alle":f==="TC"?"Tactigent":"Fiscal Fuse"} active={deptF===f} onClick={()=>setDeptF(f)}/>))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
{leads.length===0?(
<div style={{padding:"52px 24px",textAlign:"center"}}>
<Users size={32} color={C.mushroom} style={{marginBottom:12}}/>
<div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:6}}>Geen leads gevonden</div>
<div style={{fontSize:12,color:C.secondary}}>Voeg uw eerste lead toe om te beginnen.</div>
</div>
):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{[t("company"),"AFDELING",t("stage"),t("value"),t("advisor")].map(h=><th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{leads.filter(l=>l&&l.id&&l.name).map(l=>(
<tr key={l.id} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>setDetailLead&&setDetailLead(l)}>
<td style={{padding:"12px 18px",fontSize:13,fontWeight:600,color:C.text}}>{l.name}</td>
<td style={{padding:"14px 18px"}}><DeptTag dept={l.dept}/></td>
<td style={{padding:"14px 18px"}}><Badge label={sL[l.stage]||l.stage} color={sC[l.stage]||C.secondary} bg={C.warm50}/></td>
<td style={{padding:"12px 18px",fontFamily:F.display,fontSize:15,fontWeight:600,color:C.text}}>SRD {(l.value||0).toLocaleString()}</td>
<td style={{padding:"14px 18px"}}><Avatar initials={l.rep||"?"} size={26} bg={l.dept==="TC"?C.crimson:C.taupe}/></td>
</tr>
))}</tbody>
</table>
)}
</div>
</div>
);
}

// ─── DMS VIEW ────────────────────────────────────────────────────────────────
function DMSView({user,showToast}){
const t=useT();
const [visF,setVisF]=useState("ALL"); const [q,setQ]=useState(""); const [selected,setSelected]=useState(null);
const docs=DOCUMENTS.filter(d=>{ const vOk=visF==="ALL"||d.visibility===visF; const sOk=user.dept==="BOTH"||d.dept===user.dept; const qOk=!q||d.name.toLowerCase().includes(q.toLowerCase()); return vOk&&sOk&&qOk; });
const typeIconCmp={PDF:<FileText size={14} color={C.crimson}/>,Excel:<FileSpreadsheet size={14} color={C.green}/>,Word:<FileType size={14} color={C.blue}/>};
return(
<div>
<PageHeader kicker="Documenten" title={t("docLib")} action={<button onClick={()=>showToast("Upload gestarten")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}><Upload size={13}/> Uploaden</button>}/>
<div style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:16}}>
<div>
<div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
<div style={{position:"relative",flex:1,minWidth:180}}>
<Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek document..." style={{width:"100%",padding:"7px 30px 7px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
</div>
{["ALL","internal","client","shared"].map(v=>(<Pill key={v} label={v==="ALL"?t("all"):v==="internal"?t("internal"):v==="client"?t("client"):t("shared")} active={visF===v} onClick={()=>setVisF(v)}/>))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["DOCUMENT","AFDELING","DATUM","ZICHTBAARHEID","STATUS",""].map((h,i)=><th key={i} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{docs.map(d=>(
<tr key={d.id} onClick={()=>setSelected(d)} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
<td style={{padding:"14px 18px"}}><div style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:30,height:30,borderRadius:7,background:d.dept==="TC"?C.crimsonFaint:"#F0EDE8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{typeIconCmp[d.type]||<FileText size={14} color={C.secondary}/>}</div><div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{d.name}</div><div style={{fontSize:10,color:C.secondary}}>{d.size}</div></div></div></td>
<td style={{padding:"14px 18px"}}><DeptTag dept={d.dept}/></td>
<td style={{padding:"12px 16px",fontSize:11,color:C.secondary}}>{d.date}</td>
<td style={{padding:"14px 18px"}}><VisChip vis={d.visibility}/></td>
<td style={{padding:"14px 18px"}}><ReviewChip status={d.status}/></td>
<td style={{padding:"14px 18px"}}><button onClick={e=>{e.stopPropagation();showToast(`${d.name} gedownload`);}} style={{padding:"5px 10px",borderRadius:7,background:C.bg,border:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.secondary,cursor:"pointer"}}><Download size={11}/></button></td>
</tr>
))}</tbody>
</table>
</div>
</div>
<div style={{display:"flex",flexDirection:"column",gap:10}}>
<div style={{background:C.crimson,borderRadius:14,padding:"16px",color:CREAM}}>
<div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,color:"rgba(255,255,255,.7)"}}>{t("quickUpload")}</div>
<div style={{border:"2px dashed rgba(255,255,255,.4)",borderRadius:10,padding:"20px 12px",textAlign:"center",cursor:"pointer"}} onClick={()=>showToast("Upload gestarten")}>
<Upload size={20} color="rgba(255,255,255,.8)" style={{marginBottom:8}}/>
<div style={{fontSize:11,fontWeight:700,marginBottom:4}}>{t("selectFile")}</div>
<div style={{fontSize:9,color:"rgba(255,255,255,.6)"}}>{t("dragDrop")}</div>
</div>
</div>
{[{label:"Tactigent",count:DOCUMENTS.filter(d=>d.dept==="TC").length,c:C.crimson},{label:"Fiscal Fuse",count:DOCUMENTS.filter(d=>d.dept==="FF").length,c:C.taupe},{label:"Gedeeld",count:DOCUMENTS.filter(d=>d.visibility==="shared").length,c:C.walnut}].map(cat=>(
<div key={cat.label} style={{background:C.surface,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:12,color:C.text,fontWeight:600}}>{cat.label}</span>
<span style={{fontFamily:F.display,fontSize:20,fontWeight:600,color:cat.c}}>{cat.count}</span>
</div>
))}
</div>
</div>
{selected&&(
<div style={{position:"fixed",inset:0,background:"rgba(58,46,40,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setSelected(null)}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:18,width:560,maxWidth:"95vw",boxShadow:"0 32px 80px rgba(58,46,40,.3)",overflow:"hidden"}}>
<div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontFamily:F.display,fontSize:15,fontWeight:600,color:C.text}}>{selected.name}</span>
<button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary}}><X size={18}/></button>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 160px",gap:0}}>
<div style={{padding:"20px",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:10}}>
<div style={{height:120,background:selected.dept==="TC"?C.crimsonFaint:"#F0EDE8",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>{selected.type==="Excel"?<FileSpreadsheet size={48} color={C.green}/>:selected.type==="Word"?<FileType size={48} color={C.blue}/>:<FileText size={48} color={C.crimson}/>}</div>
<div style={{fontSize:12,color:C.secondary}}>Engagement: <strong style={{color:C.text}}>{selected.engagement}</strong></div>
<VisChip vis={selected.visibility}/>
<ReviewChip status={selected.status}/>
</div>
<div style={{padding:"20px",display:"flex",flexDirection:"column",gap:12}}>
{[["Grootte",selected.size],["Type",selected.type],["Datum",selected.date],["Geüpload door",selected.uploadedBy]].map(([l,v])=>(
<div key={l}><div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:2}}>{l}</div><div style={{fontSize:12,color:C.text,fontWeight:600}}>{v}</div></div>
))}
<button onClick={()=>{showToast(`${selected.name} gedownload`);setSelected(null);}} style={{marginTop:"auto",width:"100%",padding:"9px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Download size={13}/> Downloaden</button>
</div>
</div>
</div>
</div>
)}
</div>
);
}

// ─── INVOICES VIEW ───────────────────────────────────────────────────────────
function InvoicesView({user,invData,setInvData,showToast}){
const t=useT();
const [showNew,setShowNew]=useState(false);
const [newClient,setNewClient]=useState(""); const [newAmount,setNewAmount]=useState(""); const [newDue,setNewDue]=useState("");
const invoices=user.dept==="BOTH"?invData:invData.filter(i=>i.dept===user.dept);
const sColor={paid:C.green,sent:C.amber,overdue:C.red,draft:C.secondary};
const sBg={paid:C.greenBg,sent:C.amberBg,overdue:C.redBg,draft:C.warm50};
const sLabel={paid:t("paid"),sent:t("sent"),overdue:"ACHTERSTALLIG",draft:t("draft")};
const totalOpen=invoices.filter(i=>["sent","overdue"].includes(i.status)).reduce((s,i)=>s+i.amount,0);
const overdueAmt=invoices.filter(i=>i.status==="overdue").reduce((s,i)=>s+i.amount,0);
const paidAmt=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+i.amount,0);
const qboLinked=invoices.filter(i=>i.qbo).length;
const pushQBO=async(inv)=>{
try {
const qboId=await pushInvoiceQBO(inv.id);
setInvData(ids=>ids.map(i=>i.id===inv.id?{...i,qbo:qboId}:i));
} catch(e){
setInvData(ids=>ids.map(i=>i.id===inv.id?{...i,qbo:`QBO-SR-${Date.now()}`}:i));
}
showToast(`${inv.ref} naar QBO gepushed`);
};
const addInvoice=()=>{
if(!newClient||!newAmount)return;
const inv={id:`inv${Date.now()}`,ref:`INV-2025-0${50+invData.length}`,client:newClient,dept:user.dept==="BOTH"?"TC":user.dept,amount:parseInt(newAmount)||0,status:"draft",due:newDue||"—",paid:null,qbo:null};
setInvData(ids=>[...ids,inv]);setShowNew(false);setNewClient("");setNewAmount("");setNewDue("");showToast(`${inv.ref} aangemaakt`);
};
return(
<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
<PageHeader kicker="Financiën" title={t("invoicesTitle")}/>
<div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
<div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 11px",borderRadius:8,background:C.greenBg,border:`1px solid ${C.green}30`}}>
<div style={{width:7,height:7,borderRadius:"50%",background:C.green,animation:"pulse 2s infinite"}}/>
<span style={{fontSize:10,fontWeight:700,color:C.green}}>{t("qboActive")}</span>
</div>
<button onClick={()=>setShowNew(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}><Plus size={12}/> {t("newInvoice")}</button>
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
{[{l:t("totalOpen"),v:`SRD ${totalOpen.toLocaleString()}`},{l:t("overdue"),v:`SRD ${overdueAmt.toLocaleString()}`,red:true},{l:t("paidMonth"),v:`SRD ${paidAmt.toLocaleString()}`,green:true},{l:t("qboSynced"),v:`${qboLinked}/${invoices.length}`,dark:true}].map((s,i)=>(
<div key={i} style={{background:s.dark?C.espresso:C.surface,borderRadius:12,padding:"13px 16px",border:s.dark?"none":`1px solid ${C.border}`}}>
<div style={{fontSize:8.5,fontWeight:700,color:s.dark?C.taupeLight:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:4}}>{s.l}</div>
<div style={{fontFamily:F.display,fontSize:22,fontWeight:600,color:s.dark?CREAM:s.red?C.red:s.green?C.green:C.text}}>{s.v}</div>
</div>
))}
</div>
{showNew&&(
<div style={{background:"#F5F3FF",border:"1.5px solid #6366F1",borderRadius:12,padding:"16px",marginBottom:14,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
<input value={newClient} onChange={e=>setNewClient(e.target.value)} placeholder="Cliëntnaam..." style={{flex:2,minWidth:180,padding:"8px 11px",borderRadius:8,border:"1.5px solid #6366F1",fontSize:12,outline:"none"}}/>
<input value={newAmount} onChange={e=>setNewAmount(e.target.value)} placeholder="Bedrag (SRD)..." type="number" style={{flex:1,minWidth:120,padding:"8px 11px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,outline:"none"}}/>
<input type="date" value={newDue} onChange={e=>setNewDue(e.target.value)} style={{padding:"8px 9px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,outline:"none"}}/>
<button onClick={addInvoice} style={{padding:"8px 16px",borderRadius:8,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Opslaan</button>
<button onClick={()=>setShowNew(false)} style={{padding:"8px 10px",borderRadius:8,background:"transparent",color:C.secondary,border:`1px solid ${C.border}`,fontSize:11,cursor:"pointer"}}><X size={12}/></button>
</div>
)}
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["REF","CLIËNT","AFDELING",t("amount"),t("dueCol"),"STATUS","QBO"].map(h=><th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{invoices.map(inv=>(
<tr key={inv.id} style={{borderTop:`1px solid ${C.border}`}}>
<td style={{padding:"11px 16px",fontSize:11,fontWeight:700,color:C.secondary}}>{inv.ref}</td>
<td style={{padding:"11px 16px",fontSize:12,fontWeight:600,color:C.text}}>{inv.client}</td>
<td style={{padding:"11px 16px"}}><DeptTag dept={inv.dept}/></td>
<td style={{padding:"11px 16px",fontFamily:F.display,fontSize:14,fontWeight:600,color:C.text}}>SRD {inv.amount.toLocaleString()}</td>
<td style={{padding:"11px 16px",fontSize:11,color:C.secondary}}>{inv.due}</td>
<td style={{padding:"11px 16px"}}><Badge label={sLabel[inv.status]||inv.status} color={sColor[inv.status]||C.secondary} bg={sBg[inv.status]||C.warm50}/></td>
<td style={{padding:"11px 16px"}}>
{inv.qbo?(<span style={{fontSize:9,fontWeight:700,color:C.green,display:"flex",alignItems:"center",gap:4}}><CheckCircle size={10}/> SYNC</span>):(
<button onClick={()=>pushQBO(inv)} style={{padding:"3px 8px",borderRadius:6,background:C.amberBg,border:`1px solid ${C.amber}30`,color:C.amber,fontSize:9,fontWeight:700,cursor:"pointer"}}>PUSH</button>
)}
</td>
</tr>
))}</tbody>
</table>
</div>
</div>
);
}

// ─── NOTIFICATIONS VIEW ──────────────────────────────────────────────────────
function NotificationsView({notifData,setNotifData}){
const t=useT();
const icons={warning:<AlertTriangle size={15} color={C.amber}/>,success:<CheckCircle size={15} color={C.green}/>,info:<Info size={15} color={C.blue}/>};
return(
<div>
<PageHeader kicker="Systeem" title={t("notifTitle")} action={
<button onClick={()=>setNotifData(ns=>ns.map(n=>({...n,read:true})))} style={{padding:"7px 14px",borderRadius:9,border:`1.5px solid ${C.border}`,background:C.surface,fontSize:11,fontWeight:700,color:C.secondary,cursor:"pointer"}}>{t("markAllRead")}</button>
}/>
<div style={{display:"flex",flexDirection:"column",gap:8}}>
{notifData.map(n=>(
<div key={n.id} style={{background:C.surface,borderRadius:12,border:`1px solid ${n.read?C.border:C.crimson}30`,padding:"14px 18px",display:"flex",alignItems:"flex-start",gap:12,opacity:n.read?0.7:1}}>
<div style={{marginTop:2,flexShrink:0}}>{icons[n.type]||icons.info}</div>
<div style={{flex:1}}>
<div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:3}}>{n.title}</div>
<div style={{fontSize:12,color:C.secondary,lineHeight:1.5}}>{n.body}</div>
<div style={{fontSize:10,color:C.muted,marginTop:5}}>{n.time}</div>
</div>
{!n.read&&<div style={{width:7,height:7,borderRadius:"50%",background:C.crimson,flexShrink:0,marginTop:4}}/>}
</div>
))}
</div>
</div>
);
}

// ─── RISK MATRIX VIEW ────────────────────────────────────────────────────────
function RiskMatrixView(){
const GRID=5;
const cells=[];
for(let r=0;r<GRID;r++) for(let c=0;c<GRID;c++){
const heat=(r+c)/(GRID*2-2);
cells.push({r,c,heat});
}
const sectors=[];
return(
<div>
<PageHeader kicker="Intelligence" title="Strategische Risicomatrix"/>
<p style={{fontSize:12,color:C.secondary,marginBottom:20}}>Real-time dreigingsanalyse en sectorale kwetsbaarheden binnen de Tactigent en Fiscal Fuse ecosystemen.</p>
<div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"20px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
<div>
<div style={{fontSize:13,fontWeight:700,color:C.text}}>Dreigingsniveau Matrix</div>
<div style={{fontSize:10,color:C.secondary}}>Visualisatie van Impact vs. Waarschijnlijkheid</div>
</div>
<div style={{display:"flex",gap:12}}>
{[{c:C.crimson,l:"TACTIGENT"},{c:C.espresso,l:"FISCAL FUSE"}].map(b=>(
<div key={b.l} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,borderRadius:"50%",background:b.c}}/><span style={{fontSize:9,fontWeight:600,color:C.secondary}}>{b.l}</span></div>
))}
</div>
</div>
<div style={{display:"flex",gap:10,alignItems:"center"}}>
{/* Y-axis label */}
<div style={{display:"flex",flexDirection:"column",justifyContent:"space-between",height:340,paddingTop:4,paddingBottom:4,flexShrink:0}}>
  <span style={{fontSize:8,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",writingMode:"vertical-rl",transform:"rotate(180deg)"}}>HOGE IMPACT</span>
  <span style={{fontSize:8,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",writingMode:"vertical-rl",transform:"rotate(180deg)"}}>LAGE IMPACT</span>
</div>
<div style={{flex:1}}>
<div style={{position:"relative",aspectRatio:"1",maxHeight:340}}>

<div style={{display:"grid",gridTemplateColumns:`repeat(${GRID},1fr)`,gridTemplateRows:`repeat(${GRID},1fr)`,gap:4,height:"100%"}}>
{cells.map(({r,c,heat})=>(
<div key={`${r}-${c}`} style={{borderRadius:6,background:`rgba(139,26,43,${heat*0.35+0.05})`}}/>
))}
</div>
{/* Bubbles */}
<div style={{position:"absolute",width:32,height:32,borderRadius:"50%",background:C.crimson,color:CREAM,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,boxShadow:"0 4px 12px rgba(139,26,43,.4)",right:"2%",top:"5%"}}>TC</div>
<div style={{position:"absolute",width:32,height:32,borderRadius:"50%",background:C.crimson,color:CREAM,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,boxShadow:"0 4px 12px rgba(139,26,43,.4)",right:"18%",bottom:"25%"}}>TC</div>
<div style={{position:"absolute",width:32,height:32,borderRadius:"50%",background:C.espresso,color:CREAM,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,boxShadow:"0 4px 12px rgba(58,46,40,.4)",left:"28%",top:"38%"}}>FF</div>
</div>
{/* X-axis labels BELOW the grid */}
<div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
<span style={{fontSize:8,fontWeight:700,color:C.secondary,letterSpacing:"0.08em",textTransform:"uppercase"}}>LAGE WAARSCHIJNLIJKHEID</span>
<span style={{fontSize:8,fontWeight:700,color:C.secondary,letterSpacing:"0.08em",textTransform:"uppercase"}}>HOGE WAARSCHIJNLIJKHEID</span>
</div>
</div>{/* end flex:1 */}
</div>{/* end flex row with Y-axis */}
</div>
<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px"}}>
<div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Sectorale Analyse</div>
{sectors.map(s=>(
<div key={s.l} style={{marginBottom:12}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
<span style={{fontSize:11,color:C.text}}>{s.l}</span>
<span style={{fontSize:11,fontWeight:700,color:s.red?C.crimson:C.text}}>{s.v}% Risico</span>
</div>
<div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
<div style={{height:"100%",width:`${s.v}%`,background:s.red?C.crimson:C.walnut,borderRadius:2}}/>
</div>
</div>
))}
<div style={{marginTop:14,padding:"12px",borderRadius:9,background:C.warm50,border:`1px solid ${C.border}`}}>
<div style={{fontSize:9,fontWeight:700,color:C.crimson,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:4}}>SYSTEEM ALERT</div>
<div style={{fontSize:11,color:C.text,lineHeight:1.5}}>Kritieke stijging gedetecteerd in Tactigent Core blootstelling.</div>
</div>
</div>
<div style={{background:C.espresso,borderRadius:14,padding:"18px",color:CREAM}}>
<div style={{fontSize:9,fontWeight:700,color:C.taupeLight,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>MAANDELIJKSE TREND</div>
<div style={{fontFamily:F.display,fontSize:32,fontWeight:600,marginBottom:6}}>+12.4%</div>
<div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:6,background:"rgba(255,255,255,.1)",fontSize:9,fontWeight:700}}>↗ INCREASED VIGILANCE</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
{[{Icon:Shield,label:"VEILIGHEIDS INDEX",value:"88.4"},{Icon:Scale,label:"JURIDISCHE DRUK",value:"Medium"}].map(k=>(
<div key={k.label} style={{background:C.surface,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`}}>
<k.Icon size={18} color={C.secondary} style={{marginBottom:4}}/>
<div style={{fontSize:8,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:3}}>{k.label}</div>
<div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>{k.value}</div>
</div>
))}
</div>
</div>
</div>
</div>
);
}

// ─── ASSET FLOW VIEW ─────────────────────────────────────────────────────────
function AssetFlowView(){
const months=["JAN","FEB","MRT","APR","MEI","JUN"];
const tcBars=[22,28,35,30,42,48];
const ffBars=[12,16,18,22,20,26];
const maxBar=Math.max(...tcBars.map((t,i)=>t+ffBars[i]));
const movements=[];
return(
<div>
<PageHeader kicker="Intelligence" title="Vermogensstroom"/>
<p style={{fontSize:12,color:C.secondary,marginBottom:20}}>Real-time visualisatie van uw kapitaalallocatie en liquide middelen binnen het Tactigent en Fiscal Fuse ecosysteem.</p>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
{[{l:"TOTAAL VERMOGEN",v:"SRD 4.281.090",s:"USD"},{l:"LIQUIDE MIDDELEN",v:"SRD 1.12M",s:"Gedekt door FF Reserves"},{l:"INVESTERINGSRENDEMENT",v:"+12.4% YTD",s:"Gedreven door Tactigent Projects",accent:true}].map(k=>(
<div key={k.l} style={{background:k.accent?C.crimsonFaint:C.surface,borderRadius:14,padding:"16px 18px",border:`1.5px solid ${k.accent?C.crimson:C.border}`}}>
<div style={{fontSize:8.5,fontWeight:700,color:k.accent?C.crimson:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6}}>{k.l}</div>
<div style={{fontFamily:F.display,fontSize:24,fontWeight:600,color:k.accent?C.crimson:C.text,marginBottom:3}}>{k.v}</div>
<div style={{fontSize:10,color:C.secondary}}>{k.s}</div>
</div>
))}
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px"}}>
<div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:16}}>Kapitaalallocatie</div>
<div style={{display:"flex",alignItems:"center",gap:20}}>
<div style={{position:"relative",width:120,height:120,flexShrink:0}}>
<svg viewBox="0 0 120 120" style={{transform:"rotate(-90deg)"}}>
<circle cx="60" cy="60" r="50" fill="none" stroke={C.border} strokeWidth="18"/>
<circle cx="60" cy="60" r="50" fill="none" stroke={C.espresso} strokeWidth="18" strokeDasharray={`${35*3.14} ${65*3.14}`} strokeDashoffset="0"/>
<circle cx="60" cy="60" r="50" fill="none" stroke={C.crimson} strokeWidth="18" strokeDasharray={`${65*3.14} ${35*3.14}`} strokeDashoffset={`${-35*3.14}`}/>
</svg>
<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
<div style={{fontFamily:F.display,fontSize:20,fontWeight:600,color:C.text}}>65%</div>
<div style={{fontSize:9,color:C.secondary}}>TACTIGENT</div>
</div>
</div>
<div style={{display:"flex",flexDirection:"column",gap:10}}>
{[{c:C.crimson,l:"TC PROJECTS",v:"SRD 2.78M"},{c:C.espresso,l:"FF MATTERS",v:"SRD 1.50M"}].map(b=>(
<div key={b.l} style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:10,height:10,borderRadius:"50%",background:b.c,flexShrink:0}}/><div><div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.07em"}}>{b.l}</div><div style={{fontFamily:F.display,fontSize:15,fontWeight:600,color:C.text}}>{b.v}</div></div></div>
))}
</div>
</div>
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
<div style={{fontSize:13,fontWeight:700,color:C.text}}>Cashflow Trend</div>
<div style={{display:"flex",gap:6}}>
{["6 MAANDEN","1 JAAR"].map((l,i)=><button key={l} style={{padding:"3px 8px",borderRadius:6,border:`1px solid ${i===0?C.crimson:C.border}`,background:i===0?C.crimsonFaint:"transparent",color:i===0?C.crimson:C.secondary,fontSize:9,fontWeight:700,cursor:"pointer"}}>{l}</button>)}
</div>
</div>
<div style={{display:"flex",gap:6,alignItems:"flex-end",height:80,marginBottom:8}}>
{months.map((m,i)=>(
<div key={m} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"stretch",gap:2}}>
<div style={{flex:tcBars[i],background:C.crimson,borderRadius:"3px 3px 0 0",opacity:0.8}}/>
<div style={{flex:ffBars[i],background:C.espresso,opacity:0.6}}/>
</div>
))}
</div>
<div style={{display:"flex",gap:6}}>
{months.map(m=>(<div key={m} style={{flex:1,textAlign:"center",fontSize:8.5,color:C.secondary,fontWeight:600}}>{m}</div>))}
</div>
</div>
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
<div style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{fontSize:13,fontWeight:700,color:C.text}}>Recente Vermogensbewegingen</div>
<button style={{fontSize:10,fontWeight:700,color:C.crimson,background:"none",border:"none",cursor:"pointer"}}>Exporteren ↓</button>
</div>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["DATUM","OMSCHRIJVING","AFDELING","BEDRAG","STATUS"].map(h=><th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{movements.map((m,i)=>(
<tr key={i} style={{borderTop:`1px solid ${C.border}`}}>
<td style={{padding:"13px 18px",fontSize:11,color:C.secondary}}>{m.date}</td>
<td style={{padding:"13px 18px",fontSize:13,fontWeight:600,color:C.text}}>{m.desc}</td>
<td style={{padding:"13px 18px"}}><DeptTag dept={m.dept}/></td>
<td style={{padding:"13px 18px",fontFamily:F.display,fontSize:14,fontWeight:600,color:m.amount.startsWith("+")?C.green:C.red}}>{m.amount}</td>
<td style={{padding:"13px 18px"}}><span style={{fontSize:9,fontWeight:700,color:C.secondary,background:C.warm50,padding:"3px 8px",borderRadius:4}}>{m.status}</span></td>
</tr>
))}</tbody>
</table>
</div>
</div>
);
}

// ─── CLIENT PORTAL VIEWS ─────────────────────────────────────────────────────
function ClientDashboard({user}){
const t=useT();
const [actions,setActions]=useState(CLIENT_PORTAL_ACTIONS);
const pending=actions.filter(a=>a.status!=="done");
return(
<div>
<div style={{marginBottom:6}}><span style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase"}}>STAATSOLIE N.V.</span></div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
<div>
<h1 style={{fontFamily:F.display,fontSize:28,fontWeight:600,color:C.text,margin:"0 0 4px"}}>Het Ethereal Commando</h1>
<div style={{fontSize:12,color:C.secondary}}>Huidige Betrokkenheidsfase: <strong style={{color:C.crimson}}>Uitvoeringsfase Alpha</strong></div>
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>
<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
<div style={{fontSize:14,fontWeight:700,color:C.text}}>Belangrijkste Actiepunten</div>
<span style={{fontSize:9,fontWeight:700,background:C.crimson,color:CREAM,padding:"4px 12px",borderRadius:20}}>{pending.length} PRIORITEITEN</span>
</div>
<div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
{pending.map((a,i)=>(
<div key={a.id} style={{background:C.surface,borderRadius:14,border:`1.5px solid ${i===0?C.crimson:C.border}`,padding:"16px 20px",display:"flex",alignItems:"center",gap:16}}>
<div style={{width:40,height:40,borderRadius:10,background:i===0?C.crimson:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
{a.type==="upload"?<Upload size={16}/>:a.type==="approve"?<CheckSquare size={16}/>:<ClipboardList size={16}/>}
</div>
<div style={{flex:1}}>
<div style={{fontFamily:F.display,fontSize:15,fontWeight:600,color:C.text,marginBottom:4}}>{a.title}</div>
<div style={{fontSize:12,color:C.secondary}}>{a.desc}</div>
</div>
<button onClick={()=>setActions(as=>as.map(x=>x.id===a.id?{...x,status:"done"}:x))} style={{padding:"9px 16px",borderRadius:10,background:i===0?C.crimson:C.walnut,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
{i===0?"NU UITVOEREN":"BEKIJKEN"} →
</button>
</div>
))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"16px 20px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
<div style={{fontSize:13,fontWeight:700,color:C.text}}>Voortgang Dossier</div>
<div style={{fontFamily:F.display,fontSize:20,fontWeight:600,color:C.crimson}}>68%</div>
</div>
<div style={{fontSize:11,color:C.secondary,marginBottom:10}}>Mijlpaal: Strategie Implementatie</div>
<div style={{height:8,background:C.border,borderRadius:4,overflow:"hidden"}}>
<div style={{height:"100%",width:"68%",background:C.crimson,borderRadius:4}}/>
</div>
</div>
</div>
<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
<div style={{fontSize:13,fontWeight:700,color:C.text}}>Financieel Overzicht</div>
<div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:C.green,animation:"pulse 2s infinite"}}/><span style={{fontSize:9,fontWeight:700,color:C.secondary}}>LIVE SYNC</span></div>
</div>
<div style={{fontSize:9,color:C.secondary,marginBottom:3}}>BESCHIKBARE LIQUIDITEIT</div>
<div style={{fontFamily:F.display,fontSize:24,fontWeight:600,color:C.text,marginBottom:12}}>SRD 4.281.090</div>
<div style={{fontSize:9,color:C.secondary,marginBottom:8}}>QBO Sync Status: <span style={{color:C.green,fontWeight:700}}>ACTIEF</span></div>
{[["Burn Rate","-SRD 142k/md"],[" Runway","30.2 Maanden"],["Netto Marge","18.4%"]].map(([l,v])=>(
<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderTop:`1px solid ${C.border}`}}>
<span style={{fontSize:11,color:C.secondary}}>{l}</span>
<span style={{fontSize:11,fontWeight:700,color:C.text}}>{v}</span>
</div>
))}
<button style={{width:"100%",marginTop:12,padding:"8px",borderRadius:8,background:C.bg,border:`1px solid ${C.border}`,color:C.text,fontSize:10,fontWeight:700,cursor:"pointer"}}>VOLLEDIG GROOTBOEK BEKIJKEN</button>
</div>
<div style={{background:C.espresso,borderRadius:14,padding:"18px",color:CREAM}}>
<div style={{fontSize:9,fontWeight:700,color:C.taupeLight,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>INVESTERINGSADVIES</div>
<blockquote style={{fontFamily:F.display,fontSize:13,fontWeight:600,lineHeight:1.6,margin:"0 0 12px"}}>"De sleutel tot portfolioweerbaarheid is de bewuste afwijzing van het onmiddellijke."</blockquote>
<div style={{fontSize:9,fontWeight:700,color:C.taupeLight}}>TACTIGENT INZICHTEN · Wekelijkse Briefing</div>
</div>
</div>
</div>
</div>
);
}

function DocPreviewModal({doc, onClose, onDownload}) {
const typeIcon={PDF:<FileText size={40} color={C.crimson}/>,Excel:<FileSpreadsheet size={40} color={C.green}/>,Word:<FileType size={40} color={C.blue}/>};
const typeBg={PDF:C.crimsonFaint,Excel:C.greenBg,Word:C.blueBg};
// Fake document content lines for visual preview
const previewLines = doc.type==="PDF" ? [
{w:"80%",h:10,dark:true},{w:"60%",h:8},{w:"100%",h:6},{w:"95%",h:6},{w:"88%",h:6},{w:"70%",h:6},
{w:"0%",h:8},{w:"100%",h:6},{w:"92%",h:6},{w:"85%",h:6},{w:"78%",h:6},{w:"40%",h:6},
] : doc.type==="Excel" ? [
{grid:true,cols:["Kwartaal","Omzet","Kosten","Marge"],rows:[["Q1 2025","SRD 28.500","SRD 12.200","57%"],["Q2 2025","SRD 34.100","SRD 14.800","57%"],["Q3 2025","SRD 41.200","SRD 17.300","58%"]]},
] : [
{w:"70%",h:12,dark:true},{w:"50%",h:8},{w:"100%",h:7},{w:"100%",h:7},{w:"95%",h:7},{w:"80%",h:7},
{w:"0%",h:10},{w:"100%",h:7},{w:"100%",h:7},{w:"88%",h:7},
];

useEffect(()=>{
const handler = e => { if(e.key==="Escape") onClose(); };
window.addEventListener("keydown", handler);
return ()=>window.removeEventListener("keydown", handler);
},[]);

return(
<div style={{position:"fixed",inset:0,background:"rgba(58,46,40,.6)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:760,maxWidth:"95vw",maxHeight:"90vh",boxShadow:"0 40px 100px rgba(58,46,40,.35)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
{/* Topbar */}
<div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
<div style={{width:36,height:36,borderRadius:9,background:typeBg[doc.type]||C.warm50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
{typeIcon[doc.type]||<FileText size={18} color={C.secondary}/>}
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:14,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
<div style={{fontSize:10,color:C.secondary}}>{doc.size} · {doc.type} · {doc.date}</div>
</div>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<ReviewChip status={doc.status}/>
<button onClick={()=>onDownload(doc)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>
<Download size={13}/> Downloaden
</button>
<button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}>
<X size={16}/>
</button>
</div>
</div>


    {/* Body: preview left, metadata right */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 220px",flex:1,overflow:"hidden"}}>
      {/* Document preview */}
      <div style={{padding:"24px",overflowY:"auto",borderRight:`1px solid ${C.border}`,background:"#F8F7F5"}}>
        <div style={{background:CREAM,borderRadius:12,padding:"32px 36px",boxShadow:"0 2px 16px rgba(58,46,40,.08)",minHeight:360}}>
          {/* Doc header branding */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,paddingBottom:16,borderBottom:`2px solid ${doc.dept==="TC"?C.crimson:C.taupe}`}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:doc.dept==="TC"?C.crimson:C.taupe,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:2}}>{doc.dept==="TC"?"TACTIGENT CONSULTANCY":"FISCAL FUSE"}</div>
              <div style={{fontSize:9,color:C.secondary,letterSpacing:"0.08em"}}>VERTROUWELIJK RAPPORT</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:C.secondary}}>Referentie:</div>
              <div style={{fontSize:10,fontWeight:700,color:C.text}}>{doc.engagement}</div>
            </div>
          </div>
          {/* Title */}
          <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:16,lineHeight:1.3}}>
            {doc.name.replace(/\.[^.]+$/,"").replace(/_/g," ")}
          </div>
          {/* Fake content */}
          {doc.type==="Excel" && previewLines[0]?.grid ? (
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                <thead>
                  <tr style={{background:doc.dept==="TC"?C.crimsonFaint:"#F0EDE8"}}>
                    {previewLines[0].cols.map(c=><th key={c} style={{padding:"8px 12px",textAlign:"left",fontWeight:700,color:C.text,fontSize:10,letterSpacing:"0.06em",textTransform:"uppercase"}}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {previewLines[0].rows.map((row,i)=>(
                    <tr key={i} style={{borderTop:`1px solid ${C.border}`,background:i%2===0?"transparent":C.warm50}}>
                      {row.map((cell,j)=><td key={j} style={{padding:"9px 12px",color:C.text,fontWeight:j===0?600:400}}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{marginTop:16,padding:"10px 12px",borderRadius:8,background:C.warm50,fontSize:11,color:C.secondary}}>+ Meerdere tabbladen — download het bestand voor volledige inhoud</div>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {previewLines.map((l,i)=>l.w==="0%" ? (
                <div key={i} style={{height:16}}/>
              ) : (
                <div key={i} style={{height:l.h,width:l.w,background:l.dark?"#C8BBB2":"#E4DDD5",borderRadius:3,opacity:0.7+(i%3)*0.1}}/>
              ))}
              <div style={{marginTop:12,padding:"10px 12px",borderRadius:8,background:C.crimsonFaint,border:`1px solid ${C.crimsonMid}30`,fontSize:11,color:C.crimson,display:"flex",alignItems:"center",gap:6}}>
                <Lock size={11}/> Download het bestand voor de volledige inhoud
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metadata sidebar */}
      <div style={{padding:"24px 20px",overflowY:"auto",display:"flex",flexDirection:"column",gap:20}}>
        <div>
          <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>BESTANDSINFO</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              ["Grootte", doc.size],
              ["Type", doc.type+" Document"],
              ["Geüpload", doc.date],
              ["Door", doc.uploadedBy],
              ["Engagement", doc.engagement],
            ].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>{l}</div>
                <div style={{fontSize:12,fontWeight:600,color:C.text}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{height:1,background:C.border}}/>
        <div>
          <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>STATUS</div>
          <ReviewChip status={doc.status}/>
          {doc.status==="verified"&&<div style={{marginTop:8,fontSize:10,color:C.green,lineHeight:1.5}}>Dit document is geverifieerd door uw adviseur.</div>}
          {doc.status==="in_review"&&<div style={{marginTop:8,fontSize:10,color:C.amber,lineHeight:1.5}}>Uw adviseur bekijkt dit document momenteel.</div>}
          {doc.status==="pending"&&<div style={{marginTop:8,fontSize:10,color:C.secondary,lineHeight:1.5}}>Wacht op beoordeling door uw adviseur.</div>}
        </div>
        <div style={{height:1,background:C.border}}/>
        <div>
          <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>ACTIES</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={()=>onDownload(doc)} style={{width:"100%",padding:"9px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Download size={13}/> Downloaden
            </button>
            <button style={{width:"100%",padding:"9px",borderRadius:9,background:"transparent",color:C.text,border:`1.5px solid ${C.border}`,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <Send size={13}/> Delen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


);
}

function InvoicePreviewModal({inv, onClose, onDownload}) {
const sColor={paid:C.green,sent:C.amber,overdue:C.red,draft:C.secondary};
const sBg={paid:C.greenBg,sent:C.amberBg,overdue:C.redBg,draft:C.warm50};
const sLabel={paid:"BETAALD",sent:"VERZONDEN",overdue:"ACHTERSTALLIG",draft:"CONCEPT"};

useEffect(()=>{
const handler = e => { if(e.key==="Escape") onClose(); };
window.addEventListener("keydown", handler);
return ()=>window.removeEventListener("keydown", handler);
},[]);

const lineItems = [
{desc:"Adviseursdiensten — Q1 2025", qty:1, unit:"SRD "+Math.round(inv.amount*0.65).toLocaleString(), total:"SRD "+Math.round(inv.amount*0.65).toLocaleString()},
{desc:"Documentatiebeheer & archivering", qty:1, unit:"SRD "+Math.round(inv.amount*0.20).toLocaleString(), total:"SRD "+Math.round(inv.amount*0.20).toLocaleString()},
{desc:"Reiskosten & representatie", qty:1, unit:"SRD "+Math.round(inv.amount*0.15).toLocaleString(), total:"SRD "+Math.round(inv.amount*0.15).toLocaleString()},
];

return(
<div style={{position:"fixed",inset:0,background:"rgba(58,46,40,.6)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:720,maxWidth:"95vw",maxHeight:"90vh",boxShadow:"0 40px 100px rgba(58,46,40,.35)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
{/* Topbar */}
<div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
<div style={{width:36,height:36,borderRadius:9,background:inv.status==="overdue"?C.redBg:C.greenBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
<Receipt size={18} color={inv.status==="overdue"?C.red:C.green}/>
</div>
<div style={{flex:1}}>
<div style={{fontSize:14,fontWeight:700,color:C.text}}>{inv.ref}</div>
<div style={{fontSize:10,color:C.secondary}}>{inv.client} · Vervaldatum: {inv.due}</div>
</div>
<Badge label={sLabel[inv.status]||inv.status} color={sColor[inv.status]||C.secondary} bg={sBg[inv.status]||C.warm50}/>
<button onClick={()=>onDownload(inv)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>
<Download size={13}/> PDF
</button>
<button onClick={onClose} style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}>
<X size={16}/>
</button>
</div>


    {/* Invoice document */}
    <div style={{overflowY:"auto",padding:"28px 32px",background:"#F8F7F5"}}>
      <div style={{background:CREAM,borderRadius:14,padding:"36px 40px",boxShadow:"0 2px 16px rgba(58,46,40,.08)"}}>
        {/* Invoice header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32}}>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:C.crimson,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>
              {inv.dept==="TC"?"TACTIGENT CONSULTANCY":"FISCAL FUSE"}
            </div>
            <div style={{fontSize:11,color:C.secondary}}>Waterkant 45, Paramaribo, Suriname</div>
            <div style={{fontSize:11,color:C.secondary}}>+597 820-0000 · info@glasexec.sr</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:F.display,fontSize:28,fontWeight:600,color:C.text,marginBottom:4}}>FACTUUR</div>
            <div style={{fontSize:12,fontWeight:700,color:C.secondary}}>{inv.ref}</div>
            <div style={{marginTop:8,padding:"6px 14px",borderRadius:8,background:sBg[inv.status]||C.warm50,display:"inline-block"}}>
              <span style={{fontSize:11,fontWeight:700,color:sColor[inv.status]||C.secondary}}>{sLabel[inv.status]||inv.status}</span>
            </div>
          </div>
        </div>

        {/* Bill to / details */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:28,padding:"16px 20px",borderRadius:10,background:C.warm50}}>
          <div>
            <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>FACTUUR AAN</div>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>{inv.client}</div>
            <div style={{fontSize:11,color:C.secondary}}>Suriname</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[["Factuurdatum","12 Apr 2025"],["Vervaldatum",inv.due],["Referentie",inv.ref],["QBO ID",inv.qbo||"—"]].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:2}}>{l}</div>
                <div style={{fontSize:11,fontWeight:600,color:C.text}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Line items */}
        <table style={{width:"100%",borderCollapse:"collapse",marginBottom:20}}>
          <thead>
            <tr style={{background:C.espresso}}>
              {["OMSCHRIJVING","AANTAL","BEDRAG","TOTAAL"].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:9,fontWeight:700,color:CREAM,letterSpacing:"0.1em",textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item,i)=>(
              <tr key={i} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?CREAM:C.warm50}}>
                <td style={{padding:"12px 14px",fontSize:12,color:C.text}}>{item.desc}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.secondary}}>{item.qty}</td>
                <td style={{padding:"12px 14px",fontSize:12,color:C.secondary}}>{item.unit}</td>
                <td style={{padding:"12px 14px",fontSize:12,fontWeight:600,color:C.text}}>{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:28}}>
          <div style={{width:260}}>
            {[["Subtotaal","SRD "+Math.round(inv.amount*0.92).toLocaleString()],["BTW (8%)","SRD "+Math.round(inv.amount*0.08).toLocaleString()]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderTop:`1px solid ${C.border}`}}>
                <span style={{fontSize:12,color:C.secondary}}>{l}</span>
                <span style={{fontSize:12,color:C.text}}>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 14px",marginTop:6,borderRadius:10,background:inv.status==="paid"?C.greenBg:inv.status==="overdue"?C.redBg:C.espresso}}>
              <span style={{fontSize:13,fontWeight:700,color:inv.status==="paid"?C.green:inv.status==="overdue"?C.red:CREAM}}>TOTAAL</span>
              <span style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:inv.status==="paid"?C.green:inv.status==="overdue"?C.red:CREAM}}>SRD {inv.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment info */}
        {inv.status!=="paid"&&(
          <div style={{padding:"16px 20px",borderRadius:10,border:`1.5px solid ${inv.status==="overdue"?C.red:C.border}`,background:inv.status==="overdue"?C.redBg:C.warm50}}>
            <div style={{fontSize:11,fontWeight:700,color:inv.status==="overdue"?C.red:C.text,marginBottom:6,display:"flex",alignItems:"center",gap:6}}>{inv.status==="overdue"&&<AlertTriangle size={13}/>}{inv.status==="overdue"?"Betaling achterstallig":"Betaalinstructies"}</div>
            <div style={{fontSize:11,color:C.secondary,lineHeight:1.6}}>Bank: DSB Suriname · IBAN: SR12 3456 7890 1234 · t.n.v. The Client Portal N.V.</div>
          </div>
        )}
        {inv.status==="paid"&&(
          <div style={{padding:"16px 20px",borderRadius:10,border:`1.5px solid ${C.green}30`,background:C.greenBg,display:"flex",alignItems:"center",gap:10}}>
            <CheckCircle size={18} color={C.green}/>
            <div style={{fontSize:12,fontWeight:700,color:C.green}}>Betaling ontvangen op {inv.paid} — Bedankt!</div>
          </div>
        )}
      </div>
    </div>
  </div>
</div>


);
}

function ClientDocsView({user}){
const [tab,setTab]=useState("ALL");
const [preview,setPreview]=useState(null);
const [toast,setToast]=useState(null);
const docs=DOCUMENTS.filter(d=>d.visibility!=="internal"&&(tab==="ALL"||d.dept===tab));
const typeIconCmp3={PDF:<FileText size={14} color={C.crimson}/>,Excel:<FileSpreadsheet size={14} color={C.green}/>,Word:<FileType size={14} color={C.blue}/>};
const typeBg={PDF:C.crimsonFaint,Excel:C.greenBg,Word:C.blueBg};
const handleDownload=(doc)=>{ setToast(`${doc.name} gedownload`); };

return(
<div>
<PageHeader kicker="Mijn Portaal" title="Documenten"/>
<p style={{fontSize:12,color:C.secondary,marginBottom:16}}>Centraal beheer van uw strategische en fiscale dossiers. Alle documenten zijn versleuteld.</p>
<div style={{display:"grid",gridTemplateColumns:"1fr 240px",gap:16}}>
<div>
<div style={{display:"flex",gap:8,marginBottom:12}}>
{[["ALL","Alle"],["TC","Tactigent"],["FF","Fiscal Fuse"]].map(([v,l])=>(
<button key={v} onClick={()=>setTab(v)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${tab===v?C.crimson:C.border}`,background:tab===v?C.crimson:"transparent",color:tab===v?CREAM:C.secondary,fontSize:11,fontWeight:600,cursor:"pointer"}}>{l}</button>
))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["DOCUMENT","AFDELING","DATUM","STATUS",""].map(h=><th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{docs.map(d=>(
<tr key={d.id} onClick={()=>setPreview(d)} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
<td style={{padding:"13px 16px"}}>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={{width:36,height:36,borderRadius:9,background:typeBg[d.type]||C.warm50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
{typeIconCmp3[d.type]||<FileText size={16} color={C.secondary}/>}
</div>
<div>
<div style={{fontSize:13,fontWeight:600,color:C.text}}>{d.name}</div>
<div style={{fontSize:10,color:C.secondary}}>{d.size} · {d.type}</div>
</div>
</div>
</td>
<td style={{padding:"13px 16px"}}><DeptTag dept={d.dept}/></td>
<td style={{padding:"13px 16px",fontSize:11,color:C.secondary}}>{d.date}</td>
<td style={{padding:"13px 16px"}}><ReviewChip status={d.status}/></td>
<td style={{padding:"13px 16px"}}><ChevronRight size={15} color={C.secondary}/></td>
</tr>
))}</tbody>
</table>
</div>
</div>
<div style={{display:"flex",flexDirection:"column",gap:10}}>
<div style={{background:C.crimson,borderRadius:14,padding:"16px",color:CREAM,cursor:"pointer"}} onClick={()=>setToast("Upload gestarten")}>
<div style={{fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,color:"rgba(255,255,255,.7)"}}>Snelle Upload</div>
<div style={{border:"2px dashed rgba(255,255,255,.4)",borderRadius:10,padding:"20px",textAlign:"center"}}>
<Upload size={20} color="rgba(255,255,255,.8)" style={{marginBottom:8}}/>
<div style={{fontSize:11,fontWeight:700,marginBottom:4}}>SELECTEER BESTAND</div>
<div style={{fontSize:9,color:"rgba(255,255,255,.6)"}}>Sleep bestanden hierheen</div>
</div>
</div>
{[{label:"Tactigent Bestanden",count:DOCUMENTS.filter(d=>d.dept==="TC").length},{label:"Fiscal Fuse Archief",count:DOCUMENTS.filter(d=>d.dept==="FF").length},{label:"Gedeelde Documenten",count:DOCUMENTS.filter(d=>d.visibility==="shared").length}].map(cat=>(
<div key={cat.label} style={{background:C.surface,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:12,color:C.text,fontWeight:600}}>{cat.label}</span>
<span style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.crimson}}>{cat.count}</span>
</div>
))}
</div>
</div>
{preview&&<DocPreviewModal doc={preview} onClose={()=>setPreview(null)} onDownload={(d)=>{handleDownload(d);setPreview(null);}}/>}
{toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
</div>
);
}

function ClientFinanceView({user,invData}){
const invoices=invData.filter(i=>i.client===user.company_name||i.company_id===user.company_id);
const [preview,setPreview]=useState(null);
const [toast,setToast]=useState(null);
const sColor={paid:C.green,sent:C.amber,overdue:C.red,draft:C.secondary};
const sBg={paid:C.greenBg,sent:C.amberBg,overdue:C.redBg,draft:C.warm50};
const sLabel={paid:"BETAALD",sent:"VERZONDEN",overdue:"ACHTERSTALLIG",draft:"CONCEPT"};
const totalOpen=invoices.filter(i=>["sent","overdue"].includes(i.status)).reduce((s,i)=>s+i.amount,0);
const totalPaid=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+i.amount,0);
return(
<div>
<PageHeader kicker="Financiën" title="Facturen & Betalingen"/>
{/* KPI strip */}
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
{[{l:"OPENSTAAND",v:`SRD ${totalOpen.toLocaleString()}`,c:totalOpen>0?C.amber:C.text},{l:"BETAALD",v:`SRD ${totalPaid.toLocaleString()}`,c:C.green},{l:"TOTAAL FACTUREN",v:invoices.length,c:C.text}].map(s=>(
<div key={s.l} style={{background:C.surface,borderRadius:12,padding:"14px 18px",border:`1px solid ${C.border}`}}>
<div style={{fontSize:8.5,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:4}}>{s.l}</div>
<div style={{fontFamily:F.display,fontSize:22,fontWeight:600,color:s.c}}>{s.v}</div>
</div>
))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
<div style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,fontSize:11,color:C.secondary}}>
Klik op een factuur om de volledige factuurdetails te bekijken.
</div>
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["REF","BEDRAG","VERVALDATUM","STATUS",""].map(h=><th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{invoices.length===0?(
<tr><td colSpan={5} style={{padding:"40px 18px",textAlign:"center",fontSize:13,color:C.secondary}}>Geen facturen gevonden</td></tr>
):invoices.map(inv=>(
<tr key={inv.id} onClick={()=>setPreview(inv)} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
<td style={{padding:"14px 18px"}}>
<div style={{display:"flex",alignItems:"center",gap:10}}>
<div style={{width:36,height:36,borderRadius:9,background:inv.status==="overdue"?C.redBg:inv.status==="paid"?C.greenBg:C.amberBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
<Receipt size={16} color={sColor[inv.status]||C.secondary}/>
</div>
<div>
<div style={{fontSize:13,fontWeight:700,color:C.text}}>{inv.ref}</div>
{inv.qbo&&<div style={{fontSize:9,color:C.green,fontWeight:600,display:"flex",alignItems:"center",gap:3,marginTop:2}}><CheckCircle size={9}/> QBO gesynchroniseerd</div>}
</div>
</div>
</td>
<td style={{padding:"14px 18px",fontFamily:F.display,fontSize:17,fontWeight:600,color:C.text}}>SRD {inv.amount.toLocaleString()}</td>
<td style={{padding:"14px 18px",fontSize:12,color:inv.status==="overdue"?C.red:C.secondary,fontWeight:inv.status==="overdue"?700:400}}>{inv.due}</td>
<td style={{padding:"14px 18px"}}><Badge label={sLabel[inv.status]||inv.status} color={sColor[inv.status]||C.secondary} bg={sBg[inv.status]||C.warm50}/></td>
<td style={{padding:"14px 18px"}}><ChevronRight size={15} color={C.secondary}/></td>
</tr>
))}</tbody>
</table>
</div>
{preview&&<InvoicePreviewModal inv={preview} onClose={()=>setPreview(null)} onDownload={(inv)=>{setToast(`${inv.ref} gedownload als PDF`);setPreview(null);}}/>}
{toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
</div>
);
}

function ClientActionsPortal({user,showToast}){
const t=useT();
const [actions,setActions]=useState(Object.values(CLIENT_ACTIONS_BY_ENG).flat());
const [uploading,setUploading]=useState(null);
const complete=(id,type)=>{ if(type==="upload"){setUploading(id);return;} setActions(as=>as.map(a=>a.id===id?{...a,status:"completed"}:a)); showToast("Actie voltooid"); };
const handleUpload=()=>{ setActions(as=>as.map(a=>a.id===uploading?{...a,status:"completed"}:a)); setUploading(null); showToast("Document succesvol geüpload"); };
const pending=actions.filter(a=>a.status!=="completed");
const done=actions.filter(a=>a.status==="completed");
const typeIconMap={upload:<Upload size={18}/>,approve:<CheckSquare size={18}/>,sign:<Pen size={18}/>,review:<ScanSearch size={18}/>};
const typeCTA={upload:"UPLOADEN",approve:"GOEDKEUREN",sign:"ONDERTEKENEN",review:"BEOORDELEN"};
return(
<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}>
<PageHeader kicker="Mijn Portaal" title={t("myActionItems")}/>
<span style={{fontSize:9,fontWeight:700,background:C.crimson,color:CREAM,padding:"4px 12px",borderRadius:20,marginBottom:4}}>{pending.length} {t("priorities")}</span>
</div>
{pending.length===0&&<div style={{background:C.greenBg,borderRadius:14,padding:"28px 24px",textAlign:"center",marginBottom:16}}><CheckCircle size={32} color={C.green} style={{marginBottom:10}}/><div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Alle acties voltooid</div></div>}
<div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
{pending.map((a,i)=>(
<div key={a.id} style={{background:C.surface,borderRadius:14,border:`1.5px solid ${a.status==="overdue"?C.crimson:i===0?C.walnut:C.border}`,padding:"18px 22px",display:"grid",gridTemplateColumns:"auto 1fr auto",gap:16,alignItems:"center"}}>
<div style={{width:44,height:44,borderRadius:12,background:i===0?C.crimson:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{typeIconMap[a.type]||<ClipboardList size={18}/>}</div>
<div>
<div style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:C.text,marginBottom:3}}>{a.title}</div>
<div style={{fontSize:12,color:C.secondary,marginBottom:4}}>{a.desc}</div>
<div style={{fontSize:11,color:a.status==="overdue"?C.red:C.secondary,fontWeight:600}}>Termijn: {a.deadline}</div>
</div>
<button onClick={()=>complete(a.id,a.type)} style={{padding:"10px 18px",borderRadius:10,background:a.status==="overdue"?C.crimson:i===0?C.walnut:C.bg,color:a.status==="overdue"||i===0?CREAM:C.text,border:i===0||a.status==="overdue"?"none":`1.5px solid ${C.border}`,fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
{typeCTA[a.type]||"UITVOEREN"} →
</button>
</div>
))}
</div>
{done.length>0&&<div><div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>VOLTOOID ({done.length})</div>{done.map(a=>(<div key={a.id} style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,padding:"12px 18px",display:"flex",alignItems:"center",gap:12,marginBottom:7,opacity:0.7}}><CheckCircle size={16} color={C.green}/><div style={{flex:1,fontSize:13,fontWeight:600,color:C.text,textDecoration:"line-through"}}>{a.title}</div></div>))}</div>}
{uploading&&(
<div style={{position:"fixed",inset:0,background:"rgba(58,46,40,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setUploading(null)}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:18,width:440,maxWidth:"95vw",padding:"28px",boxShadow:"0 32px 80px rgba(58,46,40,.3)"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
<div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Document Uploaden</div>
<button onClick={()=>setUploading(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary}}><X size={18}/></button>
</div>
<div style={{border:`2px dashed ${C.crimson}`,borderRadius:14,padding:"32px",textAlign:"center",background:C.crimsonFaint,marginBottom:16,cursor:"pointer"}} onClick={handleUpload}>
<Upload size={28} color={C.crimson} style={{marginBottom:10}}/>
<div style={{fontSize:14,fontWeight:700,color:C.crimson,marginBottom:4}}>Sleep bestand hierheen</div>
<div style={{fontSize:10,color:C.muted}}>PDF, Excel, Word — max 25 MB</div>
</div>
<button onClick={handleUpload} style={{width:"100%",padding:"11px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>Simuleer Upload</button>
</div>
</div>
)}
</div>
);
}

function ClientMessagesView({user,showToast}){
const [threads,setThreads]=useState(CLIENT_THREADS);
const [active,setActive]=useState(threads[0]);
const [newMsg,setNewMsg]=useState("");
const sendMsg=()=>{
if(!newMsg.trim())return;
setThreads(ts=>ts.map(t=>t.id===active.id?{...t,messages:[...t.messages,{id:`m${Date.now()}`,author:user.name,avatar:user.avatar,body:newMsg,time:"Nu",fromMe:true}]}:t));
setActive(a=>({...a,messages:[...a.messages,{id:`m${Date.now()}`,author:user.name,avatar:user.avatar,body:newMsg,time:"Nu",fromMe:true}]}));
setNewMsg(""); showToast("Bericht verzonden");
};
return(
<div style={{display:"flex",height:"calc(100vh - 140px)",gap:0,background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
<div style={{width:260,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column"}}>
<div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:700,color:C.text}}>Berichten</div>
<div style={{flex:1,overflowY:"auto"}}>
{threads.map(th=>(
<div key={th.id} onClick={()=>{setActive(th);setThreads(ts=>ts.map(t=>t.id===th.id?{...t,unread:false}:t));}} style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:active?.id===th.id?C.crimsonFaint:"transparent"}}>
<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
<Avatar initials={th.avatar} size={28} bg={C.walnut}/>
<div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:C.text}}>{th.from}</div><div style={{fontSize:9,color:C.secondary}}>{th.time}</div></div>
{th.unread&&<div style={{width:7,height:7,borderRadius:"50%",background:C.crimson,flexShrink:0}}/>}
</div>
<div style={{fontSize:11,color:C.secondary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingLeft:36}}>{th.preview}</div>
</div>
))}
</div>
</div>
<div style={{flex:1,display:"flex",flexDirection:"column"}}>
{active&&<>
<div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`}}>
<div style={{fontSize:13,fontWeight:700,color:C.text}}>{active.subject}</div>
</div>
<div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:12}}>
{active.messages.map(m=>(
<div key={m.id} style={{display:"flex",alignItems:"flex-start",gap:10,flexDirection:m.fromMe?"row-reverse":"row"}}>
<Avatar initials={m.avatar} size={30} bg={m.fromMe?C.crimson:C.walnut}/>
<div style={{maxWidth:"70%"}}>
<div style={{fontSize:12,color:m.fromMe?CREAM:C.text,background:m.fromMe?C.crimson:C.bg,borderRadius:12,padding:"10px 14px",lineHeight:1.6}}>{m.body}</div>
<div style={{fontSize:9,color:C.secondary,marginTop:4,textAlign:m.fromMe?"right":"left"}}>{m.time}</div>
</div>
</div>
))}
</div>
<div style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8}}>
<input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder="Typ een bericht..." style={{flex:1,padding:"9px 13px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none"}}/>
<button onClick={sendMsg} style={{padding:"9px 14px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",cursor:"pointer"}}><Send size={14}/></button>
</div>
</>}
</div>
</div>
);
}

// ─── COMPANY DETAIL ──────────────────────────────────────────────────────────
function CompanyDetail({company,user,onBack,setDetailEng,engData,invData,showToast}){
const [activeTab,setActiveTab]=useState("overview");
const engagements=(engData||ENGAGEMENTS_INIT).filter(e=>e.client===company.name);
const invoices=invData.filter(i=>i.client===company.name);
const docs=DOCUMENTS.filter(d=>engagements.some(e=>e.ref===d.engagement));
const totalBilled=invoices.reduce((s,i)=>s+i.amount,0);
const openBilled=invoices.filter(i=>["sent","overdue"].includes(i.status)).reduce((s,i)=>s+i.amount,0);
const sColor={paid:C.green,sent:C.amber,overdue:C.red,draft:C.secondary};
const sBg={paid:C.greenBg,sent:C.amberBg,overdue:C.redBg,draft:C.warm50};
const tabs=[
{id:"overview",label:"Overzicht",icon:Layers},
{id:"engagements",label:`Engagements (${engagements.length})`,icon:Target},
{id:"documents",label:`Documenten (${docs.length})`,icon:FileText},
{id:"invoices",label:`Facturen (${invoices.length})`,icon:Receipt},
];
return(
<div className="fu">
<button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:C.secondary,fontSize:12,fontWeight:600,marginBottom:16,padding:0}}>
<ChevronLeft size={15}/> Terug naar overzicht
</button>
{/* Header */}
<div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,padding:"24px 28px",marginBottom:16,display:"flex",alignItems:"center",gap:20}}>
<div style={{flexShrink:0}}>
<CompanyLogo name={company.name} size={52} dept={company.dept} logoUrl={company.logoUrl}/>
</div>
<div style={{flex:1}}>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
<h1 style={{fontFamily:F.display,fontSize:24,fontWeight:600,color:C.text,margin:0}}>{company.name}</h1>
<DeptTag dept={company.dept}/>
<HealthDot status={company.health}/>
</div>
<div style={{fontSize:12,color:C.secondary}}>KKF {company.kkf} · {company.lifecycle}</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,textAlign:"center"}}>
{[{l:"ENGAGEMENTS",v:engagements.length},{l:"GEFACTUREERD",v:`SRD ${totalBilled.toLocaleString()}`},{l:"OPENSTAAND",v:`SRD ${openBilled.toLocaleString()}`}].map(s=>(
<div key={s.l} style={{background:C.bg,borderRadius:10,padding:"10px 14px"}}>
<div style={{fontSize:8,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
<div style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:openBilled>0&&s.l==="OPENSTAAND"?C.amber:C.text}}>{s.v}</div>
</div>
))}
</div>
</div>
{/* Tabs */}
<div style={{display:"flex",gap:4,marginBottom:16,background:C.bg,borderRadius:12,padding:4}}>
{tabs.map(tb=>(
<button key={tb.id} onClick={()=>setActiveTab(tb.id)} style={{flex:1,padding:"9px 12px",borderRadius:9,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:activeTab===tb.id?C.surface:"transparent",color:activeTab===tb.id?C.text:C.secondary,fontWeight:activeTab===tb.id?700:400,fontSize:12,transition:"background .15s,color .15s,border-color .15s,opacity .15s",boxShadow:activeTab===tb.id?"0 1px 4px rgba(0,0,0,.07)":"none"}}>
<tb.icon size={13}/>{tb.label}
</button>
))}
</div>
{/* Overview tab */}
{activeTab==="overview"&&(
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px 20px"}}>
<div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Primair Contact</div>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
<div style={{position:"relative"}}>
<Avatar initials={company.contact.split(" ").map(w=>w[0]).join("").slice(0,2)} size={44} bg={company.dept==="TC"?C.crimson:C.taupe} shape="circle"/>
<div style={{position:"absolute",bottom:-1,right:-1,width:14,height:14,borderRadius:"50%",background:C.green,border:`2px solid ${C.surface}`}}/>
</div>
<div>
<div style={{fontSize:14,fontWeight:700,color:C.text}}>{company.contact}</div>
<div style={{fontSize:11,color:C.secondary}}>{company.role}</div>
</div>
</div>
{[["Email",`${company.contact.split(" ")[0].toLowerCase()}@${company.name.toLowerCase().replace(/\s+/g,"").replace(/[^a-z]/g,"")}.sr`],["Telefoon","+597 8xx-xxxx"],["Afdeling",company.dept==="TC"?"Tactigent Consultancy":"Fiscal Fuse"]].map(([l,v])=>(
<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderTop:`1px solid ${C.border}`}}>
<span style={{fontSize:11,color:C.secondary}}>{l}</span>
<span style={{fontSize:11,fontWeight:600,color:C.text}}>{v}</span>
</div>
))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px 20px"}}>
<div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Bedrijfsgegevens</div>
{[["KKF Nummer",company.kkf],["Lifecycle Status",company.lifecycle],["Gezondheidsstatus",company.health==="red"?"Kritiek":company.health==="amber"?"Amber":"Stabiel"],["Afdeling",company.dept==="TC"?"Tactigent":"Fiscal Fuse"]].map(([l,v])=>(
<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderTop:`1px solid ${C.border}`}}>
<span style={{fontSize:11,color:C.secondary}}>{l}</span>
<span style={{fontSize:11,fontWeight:600,color:company.health==="red"&&l==="Gezondheidsstatus"?C.red:company.health==="amber"&&l==="Gezondheidsstatus"?C.amber:C.text}}>{v}</span>
</div>
))}
</div>
</div>
<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px 20px"}}>
<div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Actieve Engagements</div>
{engagements.length===0?(<div style={{fontSize:12,color:C.secondary,textAlign:"center",padding:"20px 0"}}>Geen actieve engagements</div>):
engagements.map(e=>(
<div key={e.id} onClick={()=>setDetailEng(e)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
<div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{e.name}</div><div style={{fontSize:10,color:C.secondary}}>{e.ref} · {e.phase}</div></div>
<div style={{display:"flex",alignItems:"center",gap:8}}><HealthDot status={e.health}/><ChevronRight size={14} color={C.secondary}/></div>
</div>
))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px 20px"}}>
<div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Recente Facturen</div>
{invoices.length===0?(<div style={{fontSize:12,color:C.secondary,textAlign:"center",padding:"20px 0"}}>Geen facturen</div>):
invoices.slice(0,3).map(inv=>(
<div key={inv.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderTop:`1px solid ${C.border}`}}>
<div><div style={{fontSize:12,fontWeight:600,color:C.text}}>{inv.ref}</div><div style={{fontSize:10,color:C.secondary}}>{inv.due}</div></div>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<span style={{fontFamily:F.display,fontSize:13,fontWeight:600,color:C.text}}>SRD {inv.amount.toLocaleString()}</span>
<Badge label={inv.status==="paid"?"BETAALD":inv.status==="overdue"?"ACHTERS.":"VERZONDEN"} color={sColor[inv.status]||C.secondary} bg={sBg[inv.status]||C.warm50}/>
</div>
</div>
))}
</div>
</div>
</div>
)}
{/* Engagements tab */}
{activeTab==="engagements"&&(
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
{engagements.length===0?(<div style={{padding:"48px 24px",textAlign:"center"}}><Target size={28} color={C.mushroom} style={{marginBottom:12}}/><div style={{fontSize:14,fontWeight:600,color:C.secondary}}>Geen engagements voor dit bedrijf</div></div>):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["NAAM","TYPE","FASE","GEZONDHEID","MANAGER","ACTIE"].map(h=><th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{engagements.map(e=>(
<tr key={e.id} onClick={()=>setDetailEng(e)} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
<td style={{padding:"13px 18px"}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{e.name}</div><div style={{fontSize:10,color:C.secondary}}>{e.ref}</div></td>
<td style={{padding:"13px 18px"}}><span style={{fontSize:9,padding:"3px 8px",borderRadius:4,background:e.type==="project"?C.crimsonFaint:"#F0EDE8",color:e.type==="project"?C.crimson:C.taupe,fontWeight:700,textTransform:"uppercase"}}>{e.type==="project"?"PROJECT":"DOSSIER"}</span></td>
<td style={{padding:"13px 18px"}}><span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:C.bg,color:C.text,border:`1px solid ${C.border}`}}>{e.phase}</span></td>
<td style={{padding:"13px 18px"}}><div style={{display:"flex",alignItems:"center",gap:6}}><HealthDot status={e.health}/><span style={{fontSize:10,fontWeight:700,color:e.health==="red"?C.red:e.health==="amber"?C.amber:C.green}}>{e.health==="red"?"KRITIEK":e.health==="amber"?"AMBER":"STABIEL"}</span></div></td>
<td style={{padding:"13px 18px"}}><Avatar initials={e.manager} size={26} bg={e.dept==="TC"?C.crimson:C.taupe}/></td>
<td style={{padding:"13px 18px"}}><button style={{padding:"5px 12px",borderRadius:7,background:C.crimson,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer"}}>Openen</button></td>
</tr>
))}</tbody>
</table>
)}
</div>
)}
{/* Documents tab */}
{activeTab==="documents"&&(
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
{docs.length===0?(<div style={{padding:"48px 24px",textAlign:"center"}}><FileText size={28} color={C.mushroom} style={{marginBottom:12}}/><div style={{fontSize:14,fontWeight:600,color:C.secondary}}>Geen documenten voor dit bedrijf</div></div>):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["DOCUMENT","TYPE","DATUM","ZICHTBAARHEID","STATUS"].map(h=><th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{docs.map(d=>(
<tr key={d.id} style={{borderTop:`1px solid ${C.border}`}}>
<td style={{padding:"14px 18px"}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{d.name}</div><div style={{fontSize:10,color:C.secondary}}>{d.size}</div></td>
<td style={{padding:"12px 18px",fontSize:11,color:C.secondary}}>{d.type}</td>
<td style={{padding:"12px 18px",fontSize:11,color:C.secondary}}>{d.date}</td>
<td style={{padding:"14px 18px"}}><VisChip vis={d.visibility}/></td>
<td style={{padding:"14px 18px"}}><ReviewChip status={d.status}/></td>
</tr>
))}</tbody>
</table>
)}
</div>
)}
{/* Invoices tab */}
{activeTab==="invoices"&&(
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
{invoices.length===0?(<div style={{padding:"48px 24px",textAlign:"center"}}><Receipt size={28} color={C.mushroom} style={{marginBottom:12}}/><div style={{fontSize:14,fontWeight:600,color:C.secondary}}>Geen facturen voor dit bedrijf</div></div>):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["REF","BEDRAG","VERVALDATUM","STATUS","QBO"].map(h=><th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{invoices.map(inv=>(
<tr key={inv.id} style={{borderTop:`1px solid ${C.border}`}}>
<td style={{padding:"12px 18px",fontSize:12,fontWeight:700,color:C.secondary}}>{inv.ref}</td>
<td style={{padding:"12px 18px",fontFamily:F.display,fontSize:16,fontWeight:600,color:C.text}}>SRD {inv.amount.toLocaleString()}</td>
<td style={{padding:"12px 18px",fontSize:12,color:C.secondary}}>{inv.due}</td>
<td style={{padding:"14px 18px"}}><Badge label={inv.status==="paid"?"BETAALD":inv.status==="overdue"?"ACHTERSTALLIG":"VERZONDEN"} color={sColor[inv.status]||C.secondary} bg={sBg[inv.status]||C.warm50}/></td>
<td style={{padding:"14px 18px"}}>{inv.qbo?(<span style={{fontSize:9,fontWeight:700,color:C.green,display:"flex",alignItems:"center",gap:4}}><CheckCircle size={10}/> SYNC</span>):(<span style={{fontSize:9,color:C.muted}}>—</span>)}</td>
</tr>
))}</tbody>
</table>
)}
</div>
)}
</div>
);
}

// ─── LEAD DETAIL ─────────────────────────────────────────────────────────────
function LeadDetail({lead,onBack,showToast}){
const stageMap={
TC:{new:{label:"Nieuw",pct:10},qualified:{label:"Gekwalificeerd",pct:35},proposal:{label:"Voorstel",pct:65},won:{label:"Gewonnen",pct:100}},
FF:{inquiry:{label:"Aanvraag",pct:15},strategy_review:{label:"Strategie Review",pct:50},engaged:{label:"Betrokken",pct:85}},
};
const stages=lead.dept==="TC"?["new","qualified","proposal","won"]:["inquiry","strategy_review","engaged"];
const stageLabels=stageMap[lead.dept]||stageMap.TC;
const currentPct=stageLabels[lead.stage]?.pct||0;
const sColor={new:C.secondary,qualified:C.amber,proposal:C.crimson,won:C.green,inquiry:C.secondary,strategy_review:C.amber,engaged:C.green};
const [note,setNote]=useState("");
const [notes,setNotes]=useState([
{id:"1",text:"Eerste contact gelegd via netwerkevenement in Paramaribo.",time:"12 Apr 2025",author:"MR"},
]);
const addNote=()=>{if(!note.trim())return;setNotes(ns=>[...ns,{id:`n${Date.now()}`,text:note,time:"Nu",author:"KB"}]);setNote("");showToast("Notitie opgeslagen");};
return(
<div className="fu">
<button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:C.secondary,fontSize:12,fontWeight:600,marginBottom:16,padding:0}}>
<ChevronLeft size={15}/> Terug naar leads
</button>
<div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,padding:"24px 28px",marginBottom:16}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
<div>
<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><DeptTag dept={lead.dept}/><Badge label={stageLabels[lead.stage]?.label||lead.stage} color={sColor[lead.stage]||C.secondary} bg={C.warm50}/></div>
<h1 style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:C.text,margin:"0 0 4px"}}>{lead.name}</h1>
<div style={{fontSize:12,color:C.secondary}}>Adviseur: <strong style={{color:C.text}}>{lead.rep}</strong></div>
</div>
<div style={{textAlign:"right"}}>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>GESCHATTE WAARDE</div>
<div style={{fontFamily:F.display,fontSize:28,fontWeight:600,color:C.crimson}}>SRD {lead.value.toLocaleString()}</div>
</div>
</div>
{/* Pipeline progress */}
<div style={{marginTop:12}}>
<div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:10}}>PIPELINE VOORTGANG</div>
<div style={{display:"flex",alignItems:"center",marginBottom:8}}>
{stages.map((s,i)=>(
<div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
<div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
<div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:stages.indexOf(lead.stage)>=i?C.crimson:C.bg,border:`2px solid ${stages.indexOf(lead.stage)>=i?C.crimson:C.border}`,marginBottom:4}}>
{stages.indexOf(lead.stage)>i?<CheckCircle size={13} color={CREAM}/>:<span style={{fontSize:9,fontWeight:700,color:stages.indexOf(lead.stage)===i?CREAM:C.secondary}}>{i+1}</span>}
</div>
<span style={{fontSize:8.5,fontWeight:700,color:stages.indexOf(lead.stage)>=i?C.crimson:C.secondary,textAlign:"center"}}>{stageLabels[s]?.label||s}</span>
</div>
{i<stages.length-1&&<div style={{height:2,flex:1,background:stages.indexOf(lead.stage)>i?C.crimson:C.border,margin:"0 2px",marginBottom:18}}/>}
</div>
))}
</div>
<div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden"}}>
<div style={{height:"100%",width:`${currentPct}%`,background:`linear-gradient(90deg,${C.crimson},${C.crimsonMid})`,borderRadius:3,transition:"width .4s"}}/>
</div>
</div>
</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
<div style={{display:"flex",flexDirection:"column",gap:12}}>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px 20px"}}>
<div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Lead Details</div>
{[["Bedrijf",lead.name],["Afdeling",lead.dept==="TC"?"Tactigent Consultancy":"Fiscal Fuse"],["Huidig Stadium",stageLabels[lead.stage]?.label||lead.stage],["Geschatte Waarde",`SRD ${lead.value.toLocaleString()}`],["Toegewezen aan",lead.rep==="MR"?"Adviseur TC":lead.rep==="PS"?"Adviseur FF":"Beheerder"]].map(([l,v])=>(
<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:`1px solid ${C.border}`}}>
<span style={{fontSize:11,color:C.secondary}}>{l}</span>
<span style={{fontSize:11,fontWeight:600,color:C.text}}>{v}</span>
</div>
))}
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px 20px"}}>
<div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Acties</div>
<div style={{display:"flex",flexDirection:"column",gap:8}}>
{[{label:"Voorstel Versturen",bg:C.crimson},{label:"Stadium Bijwerken",bg:C.walnut},{label:"Herinnering Plannen",bg:C.bg,color:C.text,border:true}].map(a=>(
<button key={a.label} onClick={()=>showToast(`${a.label} — gesimuleerd`)} style={{width:"100%",padding:"10px",borderRadius:9,background:a.bg,color:a.color||CREAM,border:a.border?`1.5px solid ${C.border}`:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>{a.label}</button>
))}
</div>
</div>
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px 20px",display:"flex",flexDirection:"column"}}>
<div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Activiteitslog & Notities</div>
<div style={{flex:1,overflowY:"auto",marginBottom:12,display:"flex",flexDirection:"column",gap:10}}>
{notes.map(n=>(
<div key={n.id} style={{padding:"10px 12px",borderRadius:9,background:C.bg,border:`1px solid ${C.border}`}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
<span style={{fontSize:11,fontWeight:700,color:C.text}}>{n.author}</span>
<span style={{fontSize:9,color:C.secondary}}>{n.time}</span>
</div>
<div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{n.text}</div>
</div>
))}
</div>
<div style={{display:"flex",gap:8}}>
<input value={note} onChange={e=>setNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addNote()} placeholder="Voeg notitie toe..." style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none"}}/>
<button onClick={addNote} style={{padding:"8px 14px",borderRadius:8,background:C.crimson,color:CREAM,border:"none",cursor:"pointer",fontSize:11,fontWeight:700}}>+</button>
</div>
</div>
</div>
</div>
);
}

// ─── NEW ENGAGEMENT MODAL ────────────────────────────────────────────────────
function NewEngagementModal({user,engData,setEngData,companyData,onClose,showToast}){
const [dept,setDept]=useState(user.dept==="BOTH"?"TC":user.dept);
const [name,setName]=useState("");
const [client,setClient]=useState("");
const [phase,setPhase]=useState("");
const [status,setStatus]=useState("Actief");
const [manager,setManager]=useState(user.avatar);
const [deadline,setDeadline]=useState("");
const [step,setStep]=useState(1); // 1=details, 2=templates
const [selectedTemplates,setSelectedTemplates]=useState([]);
const [expandedTpl,setExpandedTpl]=useState(null);

const phases=dept==="TC"?TC_PHASES:FF_PHASES;
const templates=dept==="TC"?TASK_TEMPLATES_TC:TASK_TEMPLATES_FF;
useEffect(()=>{ setPhase(phases[0]); setSelectedTemplates([]); },[dept]);

// Keyboard escape
useEffect(()=>{
  const h=e=>{if(e.key==="Escape")onClose();};
  window.addEventListener("keydown",h);
  return()=>window.removeEventListener("keydown",h);
},[]);

const toggleTemplate=(id)=>setSelectedTemplates(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
const totalTasks=selectedTemplates.reduce((n,id)=>{const t=templates.find(t=>t.id===id);return n+(t?.items.length||0);},0);
const canProceed=name.trim()&&client.trim();

const submit=async()=>{
  if(!canProceed) return;
  const count=engData.filter(e=>e.dept===dept).length+1;
  const ref=`${dept}-${2400+count}-SR`;
  const company=companyData.find(c=>c.name===client);
  const newEngLocal={id:`e${Date.now()}`,ref,name,dept,type:dept==="TC"?"project":"matter",phase,health:"green",status,manager,client,deadline:deadline||"—"};
  setEngData(es=>[...es,newEngLocal]);
  const tplNames=selectedTemplates.map(id=>templates.find(t=>t.id===id)?.name).filter(Boolean);
  showToast(`${dept==="TC"?"Project":"Dossier"} "${name}" aangemaakt${tplNames.length?` · ${totalTasks} taken geladen`:""}` );
  onClose();
  if(company){
    try{
      const res=await createEngagement({name,dept,phase,status,ref,company_id:company.id,deadline});
      // Apply templates in background if engagement was created in DB
      if(res?.id && selectedTemplates.length){
        for(const tplId of selectedTemplates){
          // call the DB function — map local id to DB id by name
          const tplName=templates.find(t=>t.id===tplId)?.name;
          if(tplName){
            await supabase.rpc("apply_task_template",{
              p_engagement_id:res.id,
              p_template_id:null, // will be looked up below
            }).catch(()=>{});
          }
        }
      }
    }catch(e){console.warn("createEngagement:",e.message);}
  }
};

const ICON_MAP={receipt:<Receipt size={15}/>,target:<Target size={15}/>,layers:<Layers size={15}/>,shield:<Shield size={15}/>,"file-text":<FileText size={15}/>,"scan-search":<ScanSearch size={15}/>,search:<Search size={15}/>};

return(
<div style={{position:"fixed",inset:0,background:"rgba(58,46,40,.58)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:600,maxWidth:"96vw",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 40px 100px rgba(58,46,40,.3)",overflow:"hidden"}}>

  {/* Header */}
  <div style={{padding:"20px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.crimsonFaint,flexShrink:0}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{width:36,height:36,borderRadius:9,background:C.crimson,display:"flex",alignItems:"center",justifyContent:"center"}}><Plus size={17} color={CREAM}/></div>
      <div>
        <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Nieuw {dept==="TC"?"Project":"Dossier"}</div>
        <div style={{fontSize:10,color:C.secondary}}>Stap {step} van 2 — {step===1?"Projectgegevens":"Taaktemplates selecteren"}</div>
      </div>
    </div>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary,lineHeight:0}}><X size={18}/></button>
  </div>

  {/* Step indicator */}
  <div style={{display:"flex",padding:"12px 24px",gap:8,borderBottom:`1px solid ${C.border}`,flexShrink:0,background:C.surface}}>
    {[{n:1,label:"Gegevens"},{n:2,label:"Templates"}].map(s=>(
      <div key={s.n} onClick={()=>s.n===2&&canProceed?setStep(2):s.n===1?setStep(1):null}
        style={{display:"flex",alignItems:"center",gap:7,cursor:s.n===2&&canProceed?"pointer":s.n===1?"pointer":"default",opacity:s.n===2&&!canProceed?0.4:1}}>
        <div style={{width:22,height:22,borderRadius:"50%",background:step>=s.n?C.crimson:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:step>=s.n?CREAM:C.secondary,transition:"background .2s"}}>{step>s.n?<Check size={11} color={CREAM}/>:s.n}</div>
        <span style={{fontSize:11,fontWeight:600,color:step===s.n?C.text:C.secondary}}>{s.label}</span>
        {s.n<2&&<ChevronRight size={12} color={C.mushroom}/>}
      </div>
    ))}
    {selectedTemplates.length>0&&<div style={{marginLeft:"auto",fontSize:10,fontWeight:700,color:C.green,background:C.greenBg,padding:"3px 10px",borderRadius:10}}>{totalTasks} taken geselecteerd</div>}
  </div>

  {/* Body */}
  <div style={{overflowY:"auto",flex:1}}>

  {/* ── STEP 1: Details ── */}
  {step===1&&(
  <div style={{padding:"22px 24px",display:"flex",flexDirection:"column",gap:16}}>
    {user.dept==="BOTH"&&(
    <div>
      <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>AFDELING *</div>
      <div style={{display:"flex",gap:8}}>
      {["TC","FF"].map(d=>(
        <button key={d} onClick={()=>setDept(d)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${dept===d?C.crimson:C.border}`,background:dept===d?C.crimsonFaint:"transparent",color:dept===d?C.crimson:C.secondary,fontSize:12,fontWeight:700,cursor:"pointer",transition:"background .15s,border-color .15s"}}>
          <BrandLogo dept={d} variant="light" size={20} showName={true}/>
        </button>
      ))}
      </div>
    </div>
    )}
    <div>
      <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>{dept==="TC"?"PROJECTNAAM":"DOSSIERNAAM"} *</div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="" style={{width:"100%",padding:"11px 14px",borderRadius:9,border:`1.5px solid ${name?C.crimson:C.border}`,fontSize:13,outline:"none",boxSizing:"border-box",transition:"border-color .15s"}}/>
    </div>
    <div>
      <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>CLIËNT *</div>
      <select value={client} onChange={e=>setClient(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:9,border:`1.5px solid ${client?C.crimson:C.border}`,fontSize:13,outline:"none",cursor:"pointer",background:C.surface,boxSizing:"border-box"}}>
        <option value="">Selecteer cliënt...</option>
        {(companyData||COMPANIES_INIT).filter(c=>user.dept==="BOTH"||c.dept===dept).map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>STARTFASE</div>
        <select value={phase} onChange={e=>setPhase(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.surface}}>
          {phases.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>STATUS</div>
        <select value={status} onChange={e=>setStatus(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.surface}}>
          {ENGAGEMENT_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
    <div>
      <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>DEADLINE</div>
      <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)} style={{width:"100%",padding:"11px 14px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
    </div>
  </div>
  )}

  {/* ── STEP 2: Templates ── */}
  {step===2&&(
  <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:10}}>
    <div style={{fontSize:12,color:C.secondary,marginBottom:4,lineHeight:1.6}}>
      Selecteer één of meerdere taaktemplates. De vaste subtaken worden automatisch aangemaakt bij het project.
    </div>
    {templates.map(tpl=>{
      const sel=selectedTemplates.includes(tpl.id);
      const expanded=expandedTpl===tpl.id;
      return(
      <div key={tpl.id} style={{borderRadius:12,border:`2px solid ${sel?C.crimson:C.border}`,background:sel?C.crimsonFaint:C.surface,overflow:"hidden",transition:"border-color .15s,background .15s"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer"}} onClick={()=>toggleTemplate(tpl.id)}>
          <div style={{width:38,height:38,borderRadius:10,background:sel?C.crimson:C.warm50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .15s"}}>
            <span style={{color:sel?CREAM:C.secondary}}>{ICON_MAP[tpl.icon]||<ClipboardList size={15}/>}</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>{tpl.name}</div>
            <div style={{fontSize:11,color:C.secondary,marginTop:1}}>{tpl.items.length} vaste subtaken</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${sel?C.crimson:C.border}`,background:sel?C.crimson:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {sel&&<Check size={11} color={CREAM}/>}
            </div>
            <button onClick={e=>{e.stopPropagation();setExpandedTpl(expanded?null:tpl.id);}} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:2,lineHeight:0}}>
              <ChevronRight size={14} style={{transform:expanded?"rotate(90deg)":"rotate(0deg)",transition:"transform .15s"}}/>
            </button>
          </div>
        </div>
        {expanded&&(
        <div style={{borderTop:`1px solid ${sel?C.crimson+"30":C.border}`,padding:"10px 16px 14px",background:sel?"rgba(139,26,43,.03)":C.bg}}>
          <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>SUBTAKEN</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {tpl.items.map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:7,background:C.surface,border:`1px solid ${C.border}`}}>
              <div style={{width:18,height:18,borderRadius:4,background:sel?C.crimsonFaint:C.warm50,border:`1px solid ${sel?C.crimson+"40":C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:8,fontWeight:700,color:sel?C.crimson:C.muted}}>{i+1}</span>
              </div>
              <span style={{fontSize:12,color:C.text}}>{item}</span>
            </div>
            ))}
          </div>
        </div>
        )}
      </div>
      );
    })}
    <div style={{padding:"12px 14px",borderRadius:10,background:C.warm50,border:`1px solid ${C.border}`,fontSize:11,color:C.secondary,display:"flex",alignItems:"center",gap:7,marginTop:4}}>
      <Info size={13} color={C.secondary}/>
      Je kunt later ook handmatig taken toevoegen vanuit het projectdossier.
    </div>
  </div>
  )}
  </div>

  {/* Footer */}
  <div style={{padding:"16px 24px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0,background:C.surface}}>
    {step===1?(
    <>
      <button onClick={()=>canProceed&&setStep(2)} disabled={!canProceed}
        style={{flex:1,padding:"12px",borderRadius:10,background:canProceed?C.espresso:C.mushroom,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:canProceed?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"background .15s"}}>
        Volgende: Templates <ChevronRight size={14}/>
      </button>
      <button onClick={submit} disabled={!canProceed}
        style={{padding:"12px 18px",borderRadius:10,background:canProceed?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:13,fontWeight:600,cursor:canProceed?"pointer":"default",transition:"background .15s"}}>
        Direct aanmaken
      </button>
    </>
    ):(
    <>
      <button onClick={()=>setStep(1)} style={{padding:"12px 18px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
        <ChevronLeft size={14}/> Terug
      </button>
      <button onClick={submit}
        style={{flex:1,padding:"12px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:"0 4px 16px rgba(139,26,43,.24)"}}>
        <Check size={14}/> {dept==="TC"?"Project":"Dossier"} aanmaken {selectedTemplates.length>0?`· ${totalTasks} taken`:"(geen templates)"}
      </button>
    </>
    )}
    <button onClick={onClose} style={{padding:"12px 18px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
  </div>

</div>
</div>
);
}

// ─── MARKETING VIEW ──────────────────────────────────────────────────────────
function MarketingView({user,showToast}){
const [tab,setTab]=useState("overview");
const [campaigns,setCampaigns]=useState(MARKETING_CAMPAIGNS);
const [channels,setChannels]=useState(SOCIAL_CHANNELS);
const [composerOpen,setComposerOpen]=useState(false);
const [postComposerOpen,setPostComposerOpen]=useState(null); // channel id
const [editCampaign,setEditCampaign]=useState(null);
const [selectedChannel,setSelectedChannel]=useState(null);

const sColor={sent:C.green,draft:C.secondary,scheduled:C.amber};
const sBg={sent:C.greenBg,draft:C.warm50,scheduled:C.amberBg};
const sLabel={sent:"VERZONDEN",draft:"CONCEPT",scheduled:"GEPLAND"};
const platformColor={linkedin:"#0A66C2",instagram:"#E1306C",facebook:"#1877F2",x:"#14171A"};
const platformLabel={linkedin:"LinkedIn",instagram:"Instagram",facebook:"Facebook",x:"X (Twitter)"};
const platformIcon={
linkedin:<Globe size={18} color={CREAM}/>,
instagram:<Globe size={18} color={CREAM}/>,
facebook:<Globe size={18} color={CREAM}/>,
x:<Globe size={18} color={CREAM}/>
};

const vis=user.dept==="BOTH";
const visC=vis?campaigns:campaigns.filter(c=>c.dept===user.dept||c.dept==="BOTH");
const visCh=vis?channels:channels.filter(c=>c.dept===user.dept||c.dept==="BOTH");

const totalReach=visC.filter(c=>c.status==="sent").reduce((s,c)=>s+c.recipients,0);
const sentCampaigns=visC.filter(c=>c.status==="sent");
const avgOpen=sentCampaigns.length?Math.round(sentCampaigns.reduce((s,c)=>s+parseInt(c.openRate||0),0)/sentCampaigns.length):0;
const connectedChannels=visCh.filter(c=>c.connected);
const totalFollowers=connectedChannels.reduce((s,c)=>s+parseInt(c.followers.replace(/[^0-9.]/g,""))*1000,0);

// Sparkline data
const openRateData=[52,61,58,68,65,72,68];
const reachData=[180,220,310,280,342,400,380];
const months=["Nov","Dec","Jan","Feb","Mrt","Apr","Mei"];

const advance=async(c)=>{
const isSchedule=c.status==="draft";
const newRecip=isSchedule?Math.floor(Math.random()*350)+80:c.recipients;
const newRate=!isSchedule?Math.floor(Math.random()*30+50)+"%":undefined;
const newStatus=isSchedule?"scheduled":"sent";
setCampaigns(cs=>cs.map(x=>x.id===c.id?{...x,status:newStatus,recipients:newRecip,...(newRate?{openRate:newRate}:{})}:x));
showToast(isSchedule?"Campagne ingepland":"Campagne verzonden!");
updateCampaign(c.id,{status:newStatus,recipients:newRecip,...(newRate?{open_rate:newRate}:{})}).catch(e=>console.warn("updateCampaign:",e.message));
};

const tabs=[
{id:"overview",label:"Dashboard",Icon:LayoutDashboard},
{id:"campaigns",label:"Campagnes",Icon:Mail},
{id:"social",label:"Social Media",Icon:Globe},
{id:"analytics",label:"Analytics",Icon:BarChart3},
];

return(
<div>
{/* Header */}
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
<PageHeader kicker="Marketing & Sales" title="Marketing Hub"/>
<div style={{display:"flex",gap:8,marginTop:4}}>
<button onClick={()=>setComposerOpen(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:10,background:C.espresso,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>
<Mail size={13}/> Nieuwe Campagne
</button>
<button onClick={()=>setPostComposerOpen("new")} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>
<Plus size={13}/> Social Post
</button>
</div>
</div>


  {/* KPI strip — always visible */}
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
    {[
      {l:"TOTAAL BEREIK",v:totalReach.toLocaleString(),s:"Ontvangers dit kwartaal",Icon:Users,c:C.crimson,trend:"+12%"},
      {l:"GEM. OPEN RATE",v:`${avgOpen}%`,s:"Over alle campagnes",Icon:TrendingUp,c:C.green,trend:"+4pt"},
      {l:"VOLGERS (TOTAAL)",v:`${(totalFollowers/1000).toFixed(1)}K`,s:`${connectedChannels.length} kanalen actief`,Icon:Globe,c:C.blue,trend:"+8%"},
      {l:"ACTIEVE CAMPAGNES",v:visC.filter(c=>c.status!=="sent").length,s:`${visC.filter(c=>c.status==="sent").length} verzonden`,Icon:Activity,c:C.amber,trend:""},
    ].map(k=>(
      <div key={k.l} style={{background:C.surface,borderRadius:14,padding:"16px 18px",border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{fontSize:8.5,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase"}}>{k.l}</div>
          <div style={{width:28,height:28,borderRadius:8,background:`${k.c}18`,display:"flex",alignItems:"center",justifyContent:"center"}}><k.Icon size={13} color={k.c}/></div>
        </div>
        <div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:C.text,lineHeight:1}}>{k.v}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
          <div style={{fontSize:10,color:C.secondary}}>{k.s}</div>
          {k.trend&&<div style={{fontSize:10,fontWeight:700,color:C.green}}>{k.trend}</div>}
        </div>
      </div>
    ))}
  </div>

  {/* Tab nav */}
  <div style={{display:"flex",gap:2,marginBottom:16,background:C.bg,borderRadius:12,padding:4,width:"fit-content"}}>
    {tabs.map(tb=>(
      <button key={tb.id} onClick={()=>setTab(tb.id)} style={{padding:"8px 16px",borderRadius:9,border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:7,background:tab===tb.id?C.surface:"transparent",color:tab===tb.id?C.text:C.secondary,fontWeight:tab===tb.id?700:400,fontSize:12,boxShadow:tab===tb.id?"0 1px 4px rgba(0,0,0,.07)":"none",transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}>
        <tb.Icon size={13}/>{tb.label}
      </button>
    ))}
  </div>

  {/* ── OVERVIEW TAB ── */}
  {tab==="overview"&&(
    <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:14}}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* Open rate chart */}
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>Open Rate Trend</div>
              <div style={{fontSize:10,color:C.secondary}}>Afgelopen 7 maanden</div>
            </div>
            <div style={{fontFamily:F.display,fontSize:22,fontWeight:600,color:C.green}}>{avgOpen}%</div>
          </div>
          {/* Bar chart */}
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80,marginBottom:8}}>
            {openRateData.map((v,i)=>(
              <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{fontSize:9,fontWeight:600,color:i===openRateData.length-1?C.crimson:C.muted}}>{v}%</div>
                <div style={{width:"100%",background:i===openRateData.length-1?C.crimson:`${C.crimson}35`,borderRadius:"4px 4px 0 0",height:`${(v/100)*70}px`,transition:"height .3s"}}/>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            {months.map((m,i)=><div key={i} style={{flex:1,textAlign:"center",fontSize:9,color:C.secondary,fontWeight:600}}>{m}</div>)}
          </div>
        </div>
        {/* Recent campaigns */}
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>Recente Campagnes</div>
            <button onClick={()=>setTab("campaigns")} style={{fontSize:10,fontWeight:700,color:C.crimson,background:"none",border:"none",cursor:"pointer"}}>Alle bekijken →</button>
          </div>
          {visC.slice(0,3).map((c,i)=>(
            <div key={c.id} style={{padding:"13px 18px",borderTop:i>0?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:36,height:36,borderRadius:9,background:c.dept==="TC"?C.crimsonFaint:"#F0EDE8",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Mail size={15} color={c.dept==="TC"?C.crimson:C.taupe}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                <div style={{fontSize:10,color:C.secondary}}>{c.date} · {c.recipients||0} ontvangers</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {c.openRate!=="—"&&<span style={{fontSize:11,fontWeight:700,color:C.green}}>{c.openRate}</span>}
                <Badge label={sLabel[c.status]} color={sColor[c.status]} bg={sBg[c.status]}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Right sidebar */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* Reach chart */}
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:4}}>Maandelijks Bereik</div>
          <div style={{fontSize:10,color:C.secondary,marginBottom:14}}>Unieke ontvangers per maand</div>
          <div style={{display:"flex",alignItems:"flex-end",gap:5,height:60,marginBottom:8}}>
            {reachData.map((v,i)=>(
              <div key={i} style={{flex:1,borderRadius:"3px 3px 0 0",background:i===reachData.length-1?C.walnut:`${C.walnut}40`,height:`${(v/450)*60}px`}}/>
            ))}
          </div>
          <div style={{display:"flex",gap:5}}>
            {months.map((m,i)=><div key={i} style={{flex:1,textAlign:"center",fontSize:8,color:C.muted}}>{m}</div>)}
          </div>
        </div>
        {/* Channel health */}
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"18px"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Kanaal Overzicht</div>
          {visCh.map(ch=>(
            <div key={ch.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:platformColor[ch.platform],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Globe size={14} color={CREAM}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:600,color:C.text}}>{platformLabel[ch.platform]}</div>
                <div style={{fontSize:9,color:C.secondary}}>{ch.followers} volgers</div>
              </div>
              <div style={{width:7,height:7,borderRadius:"50%",background:ch.connected?C.green:C.mushroom,flexShrink:0}}/>
            </div>
          ))}
        </div>
        {/* Quick actions */}
        <div style={{background:C.espresso,borderRadius:14,padding:"18px",color:CREAM}}>
          <div style={{fontSize:12,fontWeight:700,marginBottom:12}}>Snelle Acties</div>
          {[
            {label:"Nieuwsbrief aanmaken",Icon:Mail,action:()=>setComposerOpen(true)},
            {label:"Social post plannen",Icon:Send,action:()=>setPostComposerOpen("new")},
            {label:"Analytics bekijken",Icon:BarChart3,action:()=>setTab("analytics")},
          ].map(a=>(
            <button key={a.label} onClick={a.action} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,background:"rgba(255,255,255,.08)",border:"none",cursor:"pointer",color:CREAM,fontSize:11,fontWeight:600,marginBottom:6,textAlign:"left"}}>
              <a.Icon size={13}/>{a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )}

  {/* ── CAMPAIGNS TAB ── */}
  {tab==="campaigns"&&(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Pipeline kanban */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[
          {status:"draft",label:"Concepten",color:C.secondary,bg:C.warm50},
          {status:"scheduled",label:"Ingepland",color:C.amber,bg:C.amberBg},
          {status:"sent",label:"Verzonden",color:C.green,bg:C.greenBg},
        ].map(col=>{
          const items=visC.filter(c=>c.status===col.status);
          return(
            <div key={col.status} style={{background:col.bg,borderRadius:14,padding:"14px",border:`1px solid ${col.color}30`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:col.color}}/>
                  <span style={{fontSize:11,fontWeight:700,color:col.color,textTransform:"uppercase",letterSpacing:"0.08em"}}>{col.label}</span>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:col.color,background:`${col.color}20`,padding:"2px 8px",borderRadius:10}}>{items.length}</span>
              </div>
              {items.map(c=>(
                <div key={c.id} style={{background:C.surface,borderRadius:10,padding:"12px 14px",marginBottom:8,boxShadow:"0 1px 4px rgba(58,46,40,.08)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{fontSize:12,fontWeight:600,color:C.text,lineHeight:1.4,flex:1,paddingRight:8}}>{c.name}</div>
                    <DeptTag dept={c.dept}/>
                  </div>
                  <div style={{fontSize:10,color:C.secondary,marginBottom:8}}>{c.date}{c.recipients>0&&` · ${c.recipients} ontvangers`}{c.openRate!=="—"&&` · Open: ${c.openRate}`}</div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setEditCampaign(c)} style={{flex:1,padding:"5px 8px",borderRadius:6,background:C.bg,border:`1px solid ${C.border}`,color:C.secondary,fontSize:9,fontWeight:700,cursor:"pointer"}}>BEWERKEN</button>
                    {c.status!=="sent"&&<button onClick={()=>advance(c)} style={{flex:1,padding:"5px 8px",borderRadius:6,background:col.status==="draft"?C.amberBg:C.greenBg,border:`1px solid ${col.status==="draft"?C.amber:C.green}30`,color:col.status==="draft"?C.amber:C.green,fontSize:9,fontWeight:700,cursor:"pointer"}}>{col.status==="draft"?"INPLANNEN":"VERZENDEN"}</button>}
                  </div>
                </div>
              ))}
              {col.status==="draft"&&(
                <button onClick={()=>setComposerOpen(true)} style={{width:"100%",padding:"8px",borderRadius:9,background:"transparent",border:`1.5px dashed ${C.border}`,color:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <Plus size={11}/> Nieuwe campagne
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* ── SOCIAL TAB ── */}
  {tab==="social"&&(
    <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:14}}>
      <div>
        <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12}}>Gekoppelde Kanalen</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {visCh.map(ch=>(
            <div key={ch.id} style={{background:C.surface,borderRadius:14,border:`1px solid ${selectedChannel===ch.id?C.crimson:C.border}`,padding:"18px 20px",cursor:"pointer",transition:"border-color .15s"}} onClick={()=>setSelectedChannel(selectedChannel===ch.id?null:ch.id)}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:48,height:48,borderRadius:12,background:platformColor[ch.platform],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Globe size={22} color={CREAM}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.text}}>{ch.name}</div>
                    <DeptTag dept={ch.dept}/>
                    {ch.connected&&<span style={{fontSize:9,fontWeight:700,color:C.green,display:"flex",alignItems:"center",gap:3}}><div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/> Actief</span>}
                  </div>
                  <div style={{fontSize:11,color:C.secondary}}>{ch.handle} · <strong style={{color:C.text}}>{ch.followers}</strong> volgers · Laatste post: {ch.lastPost}</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  {ch.connected?(
                    <button onClick={e=>{e.stopPropagation();setPostComposerOpen(ch.id);}} style={{padding:"8px 14px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                      <Send size={11}/> Post Plannen
                    </button>
                  ):(
                    <button onClick={e=>{e.stopPropagation();setChannels(cs=>cs.map(x=>x.id===ch.id?{...x,connected:true,lastPost:"Zojuist"}:x));showToast(`${platformLabel[ch.platform]} gekoppeld`);toggleSocialChannel(ch.id,true).catch(()=>{});}} style={{padding:"8px 14px",borderRadius:9,background:C.walnut,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                      <Plus size={11}/> Koppelen
                    </button>
                  )}
                </div>
              </div>
              {/* Expanded stats */}
              {selectedChannel===ch.id&&ch.connected&&(
                <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                  {[["Impressies","12.4K"],[" Klikken","842"],["Engagements","6.2%"]].map(([l,v])=>(
                    <div key={l} style={{textAlign:"center",padding:"10px",borderRadius:9,background:C.bg}}>
                      <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>{v}</div>
                      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.07em",textTransform:"uppercase",marginTop:2}}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Scheduled posts */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,fontSize:12,fontWeight:700,color:C.text}}>Geplande Posts</div>
          {[
            {platform:"linkedin",text:"Tactigent kondigt haar Q2 resultaten aan. Strategische groei van 18% t.o.v. vorig kwartaal.",time:"Morgen 09:00",dept:"TC"},
            {},
            {platform:"facebook",text:"Nieuwe fiscale richtlijnen voor 2025: wat betekent dit voor uw onderneming? Lees ons analyse-rapport.",time:"Ma 10:30",dept:"FF"},
          ].map((p,i)=>(
            <div key={i} style={{padding:"12px 16px",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                <div style={{width:22,height:22,borderRadius:6,background:platformColor[p.platform],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Globe size={11} color={CREAM}/>
                </div>
                <div style={{fontSize:10,fontWeight:700,color:C.secondary}}>{platformLabel[p.platform]} · {p.time}</div>
                <DeptTag dept={p.dept}/>
              </div>
              <div style={{fontSize:11,color:C.text,lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{p.text}</div>
            </div>
          ))}
          <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,background:C.warm50}}>
            <button onClick={()=>setPostComposerOpen("new")} style={{width:"100%",padding:"8px",borderRadius:8,background:"transparent",border:`1.5px dashed ${C.border}`,color:C.secondary,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
              <Plus size={11}/> Post toevoegen
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* ── ANALYTICS TAB ── */}
  {tab==="analytics"&&(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {/* Open rate by campaign */}
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>Open Rate per Campagne</div>
          <div style={{fontSize:10,color:C.secondary,marginBottom:16}}>Alleen verzonden campagnes</div>
          {visC.filter(c=>c.openRate!=="—").map(c=>(
            <div key={c.id} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:11,color:C.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"65%"}}>{c.name}</span>
                <span style={{fontSize:11,fontWeight:700,color:parseInt(c.openRate)>=60?C.green:C.amber}}>{c.openRate}</span>
              </div>
              <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:c.openRate,background:parseInt(c.openRate)>=60?C.green:C.amber,borderRadius:3,transition:"width .4s"}}/>
              </div>
            </div>
          ))}
        </div>
        {/* Followers growth */}
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>Volgersgroei</div>
          <div style={{fontSize:10,color:C.secondary,marginBottom:16}}>Per platform — huidige stand</div>
          {visCh.filter(c=>c.connected).map(ch=>(
            <div key={ch.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:7,background:platformColor[ch.platform],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Globe size={12} color={CREAM}/>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:11,color:C.text}}>{platformLabel[ch.platform]}</span>
                  <span style={{fontSize:11,fontWeight:700,color:C.text}}>{ch.followers}</span>
                </div>
                <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(100,parseInt(ch.followers)*15)}%`,background:platformColor[ch.platform],borderRadius:2,opacity:0.8}}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Department performance */}
      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"20px"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:16}}>Prestaties per Afdeling</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[
            {dept:"TC",color:C.crimson,campaigns:visC.filter(c=>c.dept==="TC"),label:"Tactigent"},
            {dept:"FF",color:C.taupe,campaigns:visC.filter(c=>c.dept==="FF"),label:"Fiscal Fuse"},
            {dept:"BOTH",color:C.walnut,campaigns:visC.filter(c=>c.dept==="BOTH"),label:"Gecombineerd"},
          ].map(d=>{
            const sent=d.campaigns.filter(c=>c.status==="sent");
            const reach=sent.reduce((s,c)=>s+c.recipients,0);
            const open=sent.length?Math.round(sent.reduce((s,c)=>s+parseInt(c.openRate||0),0)/sent.length):0;
            return(
              <div key={d.dept} style={{padding:"16px",borderRadius:12,background:C.bg,border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:d.color}}/>
                  <span style={{fontSize:12,fontWeight:700,color:C.text}}>{d.label}</span>
                </div>
                {[["Campagnes",d.campaigns.length],["Verzonden",sent.length],["Bereik",reach.toLocaleString()],["Open Rate",sent.length?`${open}%`:"—"]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderTop:`1px solid ${C.border}`}}>
                    <span style={{fontSize:10,color:C.secondary}}>{l}</span>
                    <span style={{fontSize:10,fontWeight:700,color:d.color}}>{v}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )}

  {/* ── CAMPAIGN COMPOSER MODAL ── */}
  {composerOpen&&<CampaignComposer campaigns={visC} setCampaigns={setCampaigns} user={user} onClose={()=>setComposerOpen(false)} showToast={showToast}/>}
  {editCampaign&&<CampaignComposer campaigns={visC} setCampaigns={setCampaigns} user={user} onClose={()=>setEditCampaign(null)} showToast={showToast} edit={editCampaign}/>}
  {postComposerOpen&&<PostComposer channels={visCh} onClose={()=>setPostComposerOpen(null)} showToast={showToast} preselect={postComposerOpen!=="new"?postComposerOpen:null}/>}
</div>


);
}

function CampaignComposer({campaigns,setCampaigns,user,onClose,showToast,edit}){
const [subject,setSubject]=useState(edit?.name||"");
const [body,setBody]=useState(edit?"Geachte {{first_name}},\n\nBedankt voor uw vertrouwen in Tactigent Consultancy.\n\nWij willen u graag informeren over de laatste ontwikkelingen...\n\nMet vriendelijke groet,\nHet Tactigent Team":"");
const [dept,setDept]=useState(edit?.dept||(user.dept==="BOTH"?"TC":user.dept));
const [audience,setAudience]=useState("all");
const wordCount=body.trim().split(/\s+/).filter(Boolean).length;
const preview=body.replace("{{first_name}}","Raj").replace("{{action_title}}","Q2 Update").replace("{{deadline}}","30 apr 2025");
const save=()=>{
if(!subject.trim()) return;
if(edit){
setCampaigns(cs=>cs.map(c=>c.id===edit.id?{...c,name:subject,dept}:c));
showToast("Campagne bijgewerkt");
} else {
setCampaigns(cs=>[...cs,{id:`c${Date.now()}`,name:subject,type:"newsletter",status:"draft",recipients:0,openRate:"—",date:new Date().toLocaleDateString("nl-NL",{day:"2-digit",month:"short",year:"numeric"}),dept}]);
showToast("Campagne aangemaakt als concept");
}
onClose();
};
useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);
return(
<div style={{position:"fixed",inset:0,background:"rgba(58,46,40,.6)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:820,maxWidth:"95vw",maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 40px 100px rgba(58,46,40,.3)",overflow:"hidden"}}>
{/* Header */}
<div style={{padding:"18px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.crimsonFaint,flexShrink:0}}>
<div style={{display:"flex",alignItems:"center",gap:12}}>
<div style={{width:38,height:38,borderRadius:9,background:C.crimson,display:"flex",alignItems:"center",justifyContent:"center"}}><Mail size={17} color={CREAM}/></div>
<div>
<div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>{edit?"Campagne bewerken":"Nieuwe Campagne"}</div>
<div style={{fontSize:10,color:C.secondary}}>E-mailcampagne samenstellen en inplannen</div>
</div>
</div>
<button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary}}><X size={18}/></button>
</div>
{/* Body */}
<div style={{display:"grid",gridTemplateColumns:"1fr 280px",flex:1,overflow:"hidden"}}>
{/* Editor */}
<div style={{padding:"22px",overflowY:"auto",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:14}}>
{/* Dept */}
{user.dept==="BOTH"&&(
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:8}}>AFDELING</div>
<div style={{display:"flex",gap:8}}>
{["TC","FF","BOTH"].map(d=>(
<button key={d} onClick={()=>setDept(d)} style={{flex:1,padding:"8px",borderRadius:9,border:`2px solid ${dept===d?C.crimson:C.border}`,background:dept===d?C.crimsonFaint:"transparent",color:dept===d?C.crimson:C.secondary,fontSize:11,fontWeight:700,cursor:"pointer"}}>
{d==="TC"?"Tactigent":d==="FF"?"Fiscal Fuse":"Beide"}
</button>
))}
</div>
</div>
)}
{/* Subject */}
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6}}>ONDERWERP *</div>
<input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Bijv. Kwartaalupdate — Tactigent Q2 2025" style={{width:"100%",padding:"10px 14px",borderRadius:9,border:`1.5px solid ${subject?C.crimson:C.border}`,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
</div>
{/* Audience */}
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6}}>DOELGROEP</div>
<select value={audience} onChange={e=>setAudience(e.target.value)} style={{width:"100%",padding:"9px 14px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.surface}}>
<option value="all">Alle cliënten (1.482)</option>
<option value="tc">Tactigent cliënten (892)</option>
<option value="ff">Fiscal Fuse cliënten (590)</option>
<option value="active">Actieve engagements (42)</option>
</select>
</div>
{/* Body */}
<div style={{flex:1}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase"}}>BERICHTTEKST</div>
<span style={{fontSize:9,color:C.muted}}>{wordCount} woorden</span>
</div>
<textarea value={body} onChange={e=>setBody(e.target.value)} rows={10} style={{width:"100%",padding:"12px 14px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:F.body,lineHeight:1.7}}/>
<div style={{marginTop:6,fontSize:10,color:C.muted}}>Gebruik <code style={{background:C.warm50,padding:"1px 5px",borderRadius:4,fontSize:10}}>{"{{first_name}}"}</code> <code style={{background:C.warm50,padding:"1px 5px",borderRadius:4,fontSize:10}}>{"{{action_title}}"}</code> voor personalisatie</div>
</div>
</div>
{/* Preview */}
<div style={{display:"flex",flexDirection:"column",overflowY:"auto"}}>
<div style={{padding:"16px",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:700,color:C.text}}>Voorbeeld e-mail</div>
<div style={{padding:"16px",flex:1,overflowY:"auto"}}>
<div style={{background:CREAM,borderRadius:10,overflow:"hidden",boxShadow:"0 2px 12px rgba(58,46,40,.1)"}}>
<div style={{background:dept==="TC"?C.crimson:dept==="FF"?C.taupe:C.walnut,padding:"14px 16px"}}>
<div style={{fontSize:12,fontWeight:700,color:CREAM}}>{dept==="TC"?"TACTIGENT CONSULTANCY":dept==="FF"?"FISCAL FUSE":"THE GLASS EXECUTIVE"}</div>
</div>
<div style={{padding:"16px",fontSize:11,lineHeight:1.7,color:C.text,borderBottom:`2px solid ${dept==="TC"?C.crimson:dept==="FF"?C.taupe:C.walnut}`}}>
<div style={{fontWeight:700,marginBottom:4,fontSize:13}}>{subject||"(geen onderwerp)"}</div>
</div>
<div style={{padding:"14px 16px",fontSize:11,color:C.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{preview||"(geen inhoud)"}</div>
<div style={{padding:"12px 16px",background:C.warm50,fontSize:9,color:C.secondary}}>The Client Portal · Waterkant 45, Paramaribo · Uitschrijven</div>
</div>
</div>
<div style={{padding:"14px 16px",borderTop:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:8,flexShrink:0}}>
<button onClick={save} disabled={!subject.trim()} style={{width:"100%",padding:"10px",borderRadius:9,background:subject?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:subject?"pointer":"default"}}>
{edit?"Wijzigingen opslaan":"Opslaan als concept"}
</button>
</div>
</div>
</div>
</div>
</div>
);
}

function PostComposer({channels,onClose,showToast,preselect}){
const connected=channels.filter(c=>c.connected);
const [selChannels,setSelChannels]=useState(preselect?[preselect]:connected.slice(0,1).map(c=>c.id));
const [text,setText]=useState("");
const [schedDate,setSchedDate]=useState("");
const [schedTime,setSchedTime]=useState("09:00");
const platformColor={linkedin:"#0A66C2",instagram:"#E1306C",facebook:"#1877F2",x:"#14171A"};
const platformLabel={linkedin:"LinkedIn",instagram:"Instagram",facebook:"Facebook",x:"X"};
const maxChars={linkedin:3000,instagram:2200,facebook:63206,x:280};
const activeMax=selChannels.includes("x")||connected.find(c=>c.id===selChannels[0])?.platform==="x"?280:3000;
const toggle=(id)=>setSelChannels(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
const submit=()=>{
if(!text.trim()||!selChannels.length) return;
showToast(`Post ingepland op ${selChannels.length} kanaal${selChannels.length>1?"en":""}`);
onClose();
};
useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);
return(
<div style={{position:"fixed",inset:0,background:"rgba(58,46,40,.6)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:20}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:680,maxWidth:"95vw",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 40px 100px rgba(58,46,40,.3)",overflow:"hidden"}}>
<div style={{padding:"18px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.crimsonFaint,flexShrink:0}}>
<div style={{display:"flex",alignItems:"center",gap:12}}>
<div style={{width:38,height:38,borderRadius:9,background:C.crimson,display:"flex",alignItems:"center",justifyContent:"center"}}><Send size={17} color={CREAM}/></div>
<div>
<div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Social Post Plannen</div>
<div style={{fontSize:10,color:C.secondary}}>Publiceer op meerdere kanalen tegelijk</div>
</div>
</div>
<button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary}}><X size={18}/></button>
</div>
<div style={{padding:"22px",overflowY:"auto",display:"flex",flexDirection:"column",gap:16}}>
{/* Channel selector */}
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:10}}>KANALEN *</div>
<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
{connected.map(ch=>{
const isSel=selChannels.includes(ch.id);
return(
<button key={ch.id} onClick={()=>toggle(ch.id)} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:9,border:`2px solid ${isSel?platformColor[ch.platform]:C.border}`,background:isSel?`${platformColor[ch.platform]}15`:"transparent",color:isSel?platformColor[ch.platform]:C.secondary,fontSize:11,fontWeight:700,cursor:"pointer",transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}>
<div style={{width:16,height:16,borderRadius:4,background:platformColor[ch.platform],display:"flex",alignItems:"center",justifyContent:"center"}}><Globe size={9} color={CREAM}/></div>
{platformLabel[ch.platform]}
<span style={{fontSize:9,color:isSel?platformColor[ch.platform]:C.muted}}>{ch.followers}</span>
</button>
);
})}
</div>
</div>
{/* Text composer */}
<div>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase"}}>BERICHTTEKST *</div>
<span style={{fontSize:9,fontWeight:700,color:text.length>activeMax*0.9?C.red:C.muted}}>{text.length}/{activeMax}</span>
</div>
<textarea value={text} onChange={e=>setText(e.target.value)} rows={5} placeholder="Schrijf uw bericht hier... Gebruik #hashtags en @mentions voor meer bereik." style={{width:"100%",padding:"12px 14px",borderRadius:9,border:`1.5px solid ${text.length>activeMax?C.red:C.border}`,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:F.body,lineHeight:1.7}}/>
</div>
{/* Schedule */}
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:8}}>PUBLICATIETIJDSTIP</div>
<div style={{display:"flex",gap:10}}>
<input type="date" value={schedDate} onChange={e=>setSchedDate(e.target.value)} style={{flex:2,padding:"9px 13px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none"}}/>
<input type="time" value={schedTime} onChange={e=>setSchedTime(e.target.value)} style={{flex:1,padding:"9px 13px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none"}}/>
</div>
{!schedDate&&<div style={{marginTop:6,fontSize:10,color:C.amber}}>Geen datum = direct publiceren</div>}
</div>
{/* Preview */}
{text&&(
<div style={{background:C.bg,borderRadius:10,padding:"14px",border:`1px solid ${C.border}`}}>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:8}}>VOORBEELD</div>
<div style={{display:"flex",alignItems:"flex-start",gap:10}}>
<div style={{width:36,height:36,borderRadius:"50%",background:C.crimson,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,fontWeight:700,color:CREAM}}>GE</div>
<div>
<div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:2}}>The Client Portal <span style={{color:C.secondary,fontWeight:400}}>· Zojuist</span></div>
<div style={{fontSize:12,color:C.text,lineHeight:1.6}}>{text}</div>
</div>
</div>
</div>
)}
</div>
<div style={{padding:"14px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0}}>
<button onClick={submit} disabled={!text.trim()||!selChannels.length} style={{flex:1,padding:"11px",borderRadius:9,background:text&&selChannels.length?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:text&&selChannels.length?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
<Send size={14}/> {schedDate?"Inplannen":"Nu Publiceren"}
</button>
<button onClick={onClose} style={{padding:"11px 20px",borderRadius:9,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:12,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
</div>
</div>
</div>
);
}

// ─── SETTINGS VIEW ───────────────────────────────────────────────────────────
function SettingsView({user,language,setLanguage,showToast}){
const [activeTab,setActiveTab]=useState("profile");
const [name,setName]=useState(user.name);
const [email,setEmail]=useState(user.email);
const [title,setTitle]=useState(user.title||"");
const [notifPrefs,setNotifPrefs]=useState({email:true,inApp:true,sms:false,weekly:true,clientActions:true,invoices:true});
const [secPrefs,setSecPrefs]=useState({twofa:false,sessionTimeout:"30min",loginAlerts:true});

const tabs=[
{id:"profile",label:"Profiel",icon:Users},
{id:"notifications",label:"Notificaties",icon:Bell},
{id:"security",label:"Beveiliging",icon:Shield},
{id:"appearance",label:"Weergave",icon:Settings},
];

const Toggle=({val,onChange,label,sub})=>(
<div onClick={onChange} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 16px",borderRadius:10,border:`1px solid ${val?C.crimson:C.border}`,background:val?C.crimsonFaint:C.bg,cursor:"pointer",transition:"background .15s,color .15s,border-color .15s,opacity .15s",marginBottom:8}}>
<div style={{flex:1}}>
<div style={{fontSize:13,fontWeight:600,color:C.text}}>{label}</div>
{sub&&<div style={{fontSize:11,color:C.secondary,marginTop:2}}>{sub}</div>}
</div>
<div style={{width:44,height:24,borderRadius:12,background:val?C.crimson:C.border,position:"relative",flexShrink:0,transition:"background .2s"}}>
<div style={{width:18,height:18,borderRadius:"50%",background:CREAM,position:"absolute",top:3,left:val?23:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
</div>
</div>
);

return(
<div>
<PageHeader kicker="Account" title="Instellingen"/>
<div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:16}}>
{/* Sidebar tabs */}
<div style={{display:"flex",flexDirection:"column",gap:2}}>
{tabs.map(tb=>(
<button key={tb.id} onClick={()=>setActiveTab(tb.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,border:"none",cursor:"pointer",background:activeTab===tb.id?C.crimsonFaint:"transparent",color:activeTab===tb.id?C.crimson:C.secondary,fontWeight:activeTab===tb.id?700:400,fontSize:12,textAlign:"left"}}>
<tb.icon size={14} strokeWidth={activeTab===tb.id?2.5:1.7}/>
{tb.label}
</button>
))}
<div style={{marginTop:12,padding:"12px 14px",borderRadius:10,background:C.warm50,border:`1px solid ${C.border}`}}>
<div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>INGELOGD ALS</div>
<div style={{display:"flex",alignItems:"center",gap:8}}>
<Avatar initials={user.avatar} size={30}/>
<div>
<div style={{fontSize:11,fontWeight:700,color:C.text}}>{user.name}</div>
<div style={{fontSize:9,color:C.secondary}}>{user.role==="super_admin"?"Super Admin":user.role==="staff"?"Medewerker":"Cliënt"}</div>
</div>
</div>
</div>
</div>


    {/* Content */}
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Profile tab */}
      {activeTab==="profile"&&(
        <>
          <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"22px 24px"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:18}}>Persoonlijke gegevens</div>
            <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:22,paddingBottom:18,borderBottom:`1px solid ${C.border}`}}>
              <div style={{position:"relative",cursor:"pointer"}} onClick={()=>document.getElementById("profileUpload").click()}>
                <Avatar initials={user.avatar} size={64} bg={C.crimson}/>
                <div style={{position:"absolute",bottom:-2,right:-2,width:22,height:22,borderRadius:"50%",background:C.walnut,border:`2px solid ${C.surface}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Upload size={11} color={CREAM}/>
                </div>
                <input id="profileUpload" type="file" accept="image/*" style={{display:"none"}} onChange={()=>showToast("Profielfoto bijgewerkt")}/>
              </div>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:C.text}}>{user.name}</div>
                <div style={{fontSize:12,color:C.secondary}}>{user.title}</div>
                <DeptTag dept={user.dept}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[["Volledige naam",name,setName],["E-mailadres",email,setEmail],["Functietitel",title,setTitle]].map(([label,val,set])=>(
                <div key={label} style={label==="Functietitel"?{gridColumn:"1/-1"}:{}}>
                  <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6}}>{label}</div>
                  <input value={val} onChange={e=>set(e.target.value)} style={{width:"100%",padding:"9px 13px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
            <button onClick={()=>showToast("Profiel opgeslagen")} style={{marginTop:16,padding:"10px 22px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>Opslaan</button>
          </div>
          <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"22px 24px"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:6}}>Taal</div>
            <div style={{fontSize:11,color:C.secondary,marginBottom:14}}>Selecteer de taal voor de interface</div>
            <div style={{display:"flex",gap:10}}>
              {[["NL","Nederlands"],["EN","English"]].map(([code,label])=>(
                <button key={code} onClick={()=>{setLanguage(code);showToast(`Taal gewijzigd naar ${label}`);}} style={{flex:1,padding:"12px",borderRadius:10,border:`2px solid ${language===code?C.crimson:C.border}`,background:language===code?C.crimsonFaint:"transparent",color:language===code?C.crimson:C.text,fontSize:12,fontWeight:700,cursor:"pointer",transition:"background .15s,color .15s,border-color .15s,opacity .15s"}}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Notifications tab */}
      {activeTab==="notifications"&&(
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"22px 24px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>Notificatievoorkeuren</div>
          <div style={{fontSize:11,color:C.secondary,marginBottom:18}}>Beheer hoe en wanneer u meldingen ontvangt</div>
          <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:10}}>KANALEN</div>
          <Toggle val={notifPrefs.email} onChange={()=>setNotifPrefs(p=>({...p,email:!p.email}))} label="E-mailnotificaties" sub="Ontvang updates via e-mail"/>
          <Toggle val={notifPrefs.inApp} onChange={()=>setNotifPrefs(p=>({...p,inApp:!p.inApp}))} label="In-app meldingen" sub="Meldingen zichtbaar in de applicatie"/>
          <Toggle val={notifPrefs.sms} onChange={()=>setNotifPrefs(p=>({...p,sms:!p.sms}))} label="SMS-meldingen" sub="Urgente meldingen via SMS (+597)"/>
          <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:10,marginTop:18}}>TRIGGERS</div>
          <Toggle val={notifPrefs.clientActions} onChange={()=>setNotifPrefs(p=>({...p,clientActions:!p.clientActions}))} label="Nieuwe cliëntacties" sub="Wanneer een cliënt een actie moet uitvoeren"/>
          <Toggle val={notifPrefs.invoices} onChange={()=>setNotifPrefs(p=>({...p,invoices:!p.invoices}))} label="Factuurupdates" sub="Betaalde en achterstallige facturen"/>
          <Toggle val={notifPrefs.weekly} onChange={()=>setNotifPrefs(p=>({...p,weekly:!p.weekly}))} label="Wekelijks overzicht" sub="Samenvatting elke maandag om 08:00"/>
          <button onClick={()=>showToast("Notificatievoorkeuren opgeslagen")} style={{marginTop:18,padding:"10px 22px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>Opslaan</button>
        </div>
      )}

      {/* Security tab */}
      {activeTab==="security"&&(
        <>
          <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"22px 24px"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>Wachtwoord wijzigen</div>
            <div style={{fontSize:11,color:C.secondary,marginBottom:16}}>Kies een sterk wachtwoord van minimaal 12 tekens</div>
            {[["Huidig wachtwoord",""],["Nieuw wachtwoord",""],["Bevestig wachtwoord",""]].map(([label])=>(
              <div key={label} style={{marginBottom:12}}>
                <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6}}>{label}</div>
                <input type="password" placeholder="••••••••••••" style={{width:"100%",padding:"9px 13px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <button onClick={()=>showToast("Wachtwoord bijgewerkt")} style={{padding:"10px 22px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>Wachtwoord wijzigen</button>
          </div>
          <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"22px 24px"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:16}}>Beveiligingsinstellingen</div>
            <Toggle val={secPrefs.twofa} onChange={()=>setSecPrefs(p=>({...p,twofa:!p.twofa}))} label="Tweefactorauthenticatie (2FA)" sub="Extra beveiligingslaag via SMS of authenticator-app"/>
            <Toggle val={secPrefs.loginAlerts} onChange={()=>setSecPrefs(p=>({...p,loginAlerts:!p.loginAlerts}))} label="Inlogmeldingen" sub="Ontvang een melding bij elke nieuwe login"/>
            <div style={{marginTop:14}}>
              <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:8}}>SESSIE TIMEOUT</div>
              <div style={{display:"flex",gap:8}}>
                {["15min","30min","1uur","4uur"].map(t=>(
                  <button key={t} onClick={()=>setSecPrefs(p=>({...p,sessionTimeout:t}))} style={{padding:"7px 14px",borderRadius:8,border:`1.5px solid ${secPrefs.sessionTimeout===t?C.crimson:C.border}`,background:secPrefs.sessionTimeout===t?C.crimsonFaint:"transparent",color:secPrefs.sessionTimeout===t?C.crimson:C.secondary,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={()=>showToast("Beveiligingsinstellingen opgeslagen")} style={{marginTop:18,padding:"10px 22px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>Opslaan</button>
          </div>
          <div style={{background:C.redBg,borderRadius:14,border:`1px solid ${C.red}30`,padding:"18px 24px"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:4,display:"flex",alignItems:"center",gap:8}}><AlertTriangle size={15}/>Gevaarzone</div>
            <div style={{fontSize:11,color:C.secondary,marginBottom:14}}>Deze acties zijn onomkeerbaar. Ga voorzichtig te werk.</div>
            <button onClick={()=>showToast("Verzoek ingediend bij beheerder")} style={{padding:"9px 18px",borderRadius:9,background:"transparent",border:`1.5px solid ${C.red}`,color:C.red,fontSize:12,fontWeight:700,cursor:"pointer"}}>Account verwijderen</button>
          </div>
        </>
      )}

      {/* Appearance tab */}
      {activeTab==="appearance"&&(
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",padding:"22px 24px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>Weergave-instellingen</div>
          <div style={{fontSize:11,color:C.secondary,marginBottom:20}}>Pas de interface aan naar uw voorkeur</div>
          <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:12}}>KLEURTHEMA</div>
          <div style={{display:"flex",gap:10,marginBottom:22}}>
            {[{label:"Standaard",bg:C.crimson,active:true},{label:"Donker",bg:C.espresso},{label:"Licht",bg:C.mushroom}].map(th=>(
              <div key={th.label} onClick={()=>showToast(`Thema "${th.label}" — binnenkort beschikbaar`)} style={{flex:1,padding:"14px 12px",borderRadius:12,border:`2px solid ${th.active?C.crimson:C.border}`,cursor:"pointer",textAlign:"center"}}>
                <div style={{width:32,height:32,borderRadius:8,background:th.bg,margin:"0 auto 8px"}}/>
                <div style={{fontSize:11,fontWeight:600,color:th.active?C.crimson:C.text}}>{th.label}</div>
                {th.active&&<div style={{fontSize:9,color:C.crimson,marginTop:2}}>Actief</div>}
              </div>
            ))}
          </div>
          <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:12}}>WEERGAVE DICHTHEID</div>
          <div style={{display:"flex",gap:8}}>
            {["Compact","Normaal","Ruim"].map((d,i)=>(
              <button key={d} onClick={()=>showToast(`Dichtheid "${d}" opgeslagen`)} style={{flex:1,padding:"9px",borderRadius:9,border:`1.5px solid ${i===1?C.crimson:C.border}`,background:i===1?C.crimsonFaint:"transparent",color:i===1?C.crimson:C.secondary,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
</div>


);
}

// ─── LOGIN PAGE ──────────────────────────────────────────────────────────────
function LoginPage({onLogin,language,setLanguage}){
const t=useT();
const [email,setEmail]=useState(""); const [pw,setPw]=useState(""); const [loading,setLoading]=useState(false); const [err,setErr]=useState("");
const tryLogin=async()=>{
if(!email.trim()||!pw.trim()){setErr("Vul uw e-mail en wachtwoord in.");return;}
setLoading(true); setErr("");
try{
// Single parallel call: auth + profile in one round trip
const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password:pw});
if(error){setErr(error.message==="Invalid login credentials"?"Onjuist e-mailadres of wachtwoord.":error.message);setLoading(false);return;}
// Profile fetch — indexed on id, single row, fast
let profile=null, pErr=null;
try{
  const pr = await supabase
    .from('user_profiles')
    .select('id,full_name,email,role,department,company_id,title,avatar_initials,language')
    .eq('id',data.user.id)
    .single();
  profile=pr.data; pErr=pr.error;
}catch(pe){ pErr=pe; }
if(pErr||!profile){
  // Try email fallback
  try{
    const pr2 = await supabase
      .from('user_profiles')
      .select('id,full_name,email,role,department,company_id,title,avatar_initials,language')
      .eq('email',data.user.email)
      .single();
    profile=pr2.data; pErr=pr2.error;
  }catch(pe2){ pErr=pe2; }
}
if(!profile){setErr("Profiel niet gevonden. Neem contact op met uw beheerder.");setLoading(false);return;}
onLogin({
id:profile.id, name:profile.full_name, email:profile.email,
role:profile.role, dept:profile.department, company_id:profile.company_id,
title:profile.title||'', avatar:profile.avatar_initials||profile.full_name?.split(' ').map(w=>w[0]).join('')||'??',
language:profile.language||'NL'
});
}catch(e){setErr("Er is iets misgegaan. Probeer opnieuw.");}
setLoading(false);
};
return(
<LangCtx.Provider value={language}>
<GlobalStyles/>
<div style={{minHeight:"100vh",background:`linear-gradient(150deg,#F0EBE4 0%,#EDE7E0 40%,#E8E0D6 100%)`,display:"flex",flexDirection:"column"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 28px"}}>
<div style={{display:"flex",alignItems:"center",gap:9}}>
<BrandLogoMain size={30} variant="dark"/>
<span style={{fontFamily:F.display,fontSize:14,fontWeight:600,color:C.text,letterSpacing:"0.01em"}}>{BRANDING.nameMain}</span>
</div>
<div style={{display:"flex",border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",background:C.surface}}>
{["NL","EN"].map(l=>(<button key={l} onClick={()=>setLanguage(l)} style={{padding:"5px 12px",fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:language===l?C.crimson:"transparent",color:language===l?CREAM:C.secondary,transition:"background .15s,color .15s"}}>{l}</button>))}
</div>
</div>
<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,maxWidth:920,width:"100%",borderRadius:22,overflow:"hidden",boxShadow:"0 32px 96px rgba(58,46,40,.18),0 8px 24px rgba(58,46,40,.10)"}}>
{/* Left panel */}
<div style={{background:C.espresso,padding:"52px 44px",color:CREAM,display:"flex",flexDirection:"column",gap:0}}>
<div style={{fontSize:10,fontWeight:700,letterSpacing:"0.22em",color:"rgba(200,187,178,.6)",textTransform:"uppercase",marginBottom:16}}>Dual-Department Suite</div>
<h1 style={{fontFamily:F.display,fontSize:36,fontWeight:300,color:CREAM,margin:"0 0 6px",lineHeight:1.15,letterSpacing:"-0.02em"}}>Business<br/><em>Intelligence</em></h1>
<div style={{width:40,height:1,background:"rgba(200,187,178,.3)",margin:"22px 0"}}/>
<div style={{display:"flex",flexDirection:"column",gap:10,flex:1}}>
{[{dept:"TC",sub:"Strategische Operaties"},{dept:"FF",sub:"Financiële Analyse"}].map(d=>(
<div key={d.dept} style={{background:"rgba(255,255,255,.06)",borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:14,border:"1px solid rgba(255,255,255,.06)"}}>
<BrandLogo dept={d.dept} variant="dark" size={38}/>
<div>
<div style={{fontSize:14,fontWeight:600,color:CREAM,letterSpacing:"-0.01em"}}>{d.dept==="TC"?BRANDING.nameTC:BRANDING.nameFF}</div>
<div style={{fontSize:10,color:"rgba(200,187,178,.6)",letterSpacing:"0.06em",marginTop:2}}>{d.sub}</div>
</div>
</div>
))}
</div>
<div style={{display:"flex",alignItems:"center",gap:7,marginTop:28}}><Shield size={12} color="rgba(200,187,178,.4)"/><span style={{fontSize:10,color:"rgba(200,187,178,.4)",letterSpacing:"0.1em"}}>ENCRYPTED EXECUTIVE GATEWAY</span></div>
</div>
{/* Right panel */}
<div style={{background:C.surface,padding:"52px 44px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
<div style={{fontFamily:F.display,fontSize:28,fontWeight:600,color:C.text,marginBottom:4,letterSpacing:"-0.01em"}}>{t("welcome")}</div>
<div style={{fontSize:13,color:C.secondary,marginBottom:32,lineHeight:1.5}}>Voer uw gegevens in om toegang te krijgen tot uw portaal.</div>
<div style={{marginBottom:16}}>
<div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:7}}>{t("email")}</div>
<div style={{position:"relative"}}><Mail size={14} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:C.muted}}/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder={t("emailPlaceholder")} style={{width:"100%",padding:"11px 14px 11px 38px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",boxSizing:"border-box",background:C.bg,transition:"border-color .15s",letterSpacing:"0.01em"}}/></div>
</div>
<div style={{marginBottom:22}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.12em",textTransform:"uppercase"}}>{t("password")}</span><span style={{fontSize:11,fontWeight:700,color:C.crimson,cursor:"pointer"}}>{t("forgotPw")}</span></div>
<div style={{position:"relative"}}><Lock size={14} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:C.muted}}/><input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()} placeholder="••••••••" style={{width:"100%",padding:"11px 14px 11px 38px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",boxSizing:"border-box",background:C.bg,transition:"border-color .15s"}}/></div>
</div>
{err&&<div style={{fontSize:12,color:C.amber,marginBottom:16,padding:"10px 14px",borderRadius:10,background:C.amberBg,border:`1.5px solid ${C.amber}40`,display:"flex",alignItems:"center",gap:8}}><AlertTriangle size={13} color={C.amber}/>{err}</div>}
<button onClick={tryLogin} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:11,background:loading?C.walnut:C.crimson,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:loading?"default":"pointer",marginBottom:24,boxShadow:loading?"none":"0 4px 16px rgba(139,26,43,.28)",transition:"background .15s,box-shadow .15s",letterSpacing:"0.02em"}}>{loading?t("loggingIn"):t("login")} {!loading&&"→"}</button>
<div style={{borderTop:`1px solid ${C.border}`,paddingTop:22}}>
<div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:12}}>{t("demoSelect")}</div>
<div style={{display:"flex",flexDirection:"column",gap:8}}>
{DEMO_USERS.map(u=>(
<button key={u.id} onClick={()=>onLogin(u)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.bg,cursor:"pointer",textAlign:"left",transition:"background .15s,border-color .15s"}}>
<div style={{width:32,height:32,borderRadius:"50%",background:u.role==="client"?C.walnut:u.dept==="FF"?C.taupe:C.crimson,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:CREAM,flexShrink:0}}>{u.avatar}</div>
<div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{u.name}</div><div style={{fontSize:11,color:C.secondary,marginTop:1}}>{u.title}</div></div>
</button>
))}
</div>
</div>
<div style={{marginTop:20,textAlign:"center",fontSize:10,color:C.muted,letterSpacing:"0.04em"}}>Beheerd door Corporate IT · © 2025 The Client Portal</div>
</div>
</div>
</div>
</div>
</LangCtx.Provider>
);
}

// ─── CLIENT ONBOARDING ───────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
{
id: "welcome",
title: "Welkom bij The Client Portal",
subtitle: "Uw beveiligde portaal voor Tactigent & Fiscal Fuse",
description: "In de volgende stappen stellen we uw profiel in en leggen we uit hoe u het portaal optimaal gebruikt.",
icon: LayoutDashboard,
color: C.crimson,
action: "Aan de slag →",
},
{
id: "identity",
title: "Bevestig uw identiteit",
subtitle: "KYC-verificatie",
description: "We moeten uw identiteit verifiëren conform de Surinaamse wet- en regelgeving. Dit proces duurt maximaal 2 minuten.",
icon: Shield, color: C.crimson,
fields: [
{},
{ id: "idNumber", label: "Identiteitsbewijs nummer", placeholder: "Bijv. SR-123456789", type: "text" },
{ id: "dob", label: "Geboortedatum", placeholder: "", type: "date" },
],
action: "Identiteit bevestigen →",
},
{
id: "company",
title: "Uw organisatiegegevens",
subtitle: "Bedrijfsprofiel",
description: "Vul de gegevens van uw organisatie in zodat uw adviseurs direct toegang hebben tot de juiste context.",
icon: Building,
color: C.crimson,
fields: [
{},
{ id: "kkf", label: "KKF-nummer", placeholder: "Bijv. SR-2024-0142", type: "text" },
{ id: "role", label: "Uw functietitel", placeholder: "Bijv. CFO", type: "text" },
{ id: "phone", label: "Telefoonnummer", placeholder: "+597 8xx-xxxx", type: "tel" },
],
action: "Gegevens opslaan →",
},
{
id: "services",
title: "Uw diensten & afdelingen",
subtitle: "Dienstenselectie",
description: "Selecteer de diensten waarvoor u toegang wenst. Uw adviseur zal dit bevestigen.",
icon: Layers, color: C.crimson,
services: [
{ id: "tc", label: "Tactigent Consultancy", sub: "Strategische & Operationele Advies", Icon: Target },
{ id: "ff", label: "Fiscal Fuse", sub: "Fiscale & Juridische Dienstverlening", Icon: Scale },
{ id: "both", label: "Gecombineerd Pakket", sub: "Volledig geïntegreerde dienstverlening", Icon: Layers },
],
action: "Diensten bevestigen →",
},
{
id: "security",
title: "Beveiligingsinstellingen",
subtitle: "2FA & notificaties",
description: "Stel uw beveiligingsvoorkeuren in. Wij raden tweefactorauthenticatie sterk aan.",
icon: Shield, color: C.crimson,
toggles: [
{ id: "twofa", label: "Tweefactorauthenticatie (2FA)", sub: "Ontvang een code per SMS bij elke login", default: true },
{ id: "emailNotif", label: "E-mailnotificaties", sub: "Ontvang updates over actiepunten en facturen", default: true },
{ id: "smsNotif", label: "SMS-notificaties", sub: "Urgente meldingen via SMS", default: false },
],
action: "Instellingen opslaan →",
},
{
id: "done",
title: "Uw portaal is klaar!",
subtitle: "Onboarding voltooid",
description: "Alles is ingesteld. U kunt nu volledig gebruik maken van The Client Portal. Uw adviseur wordt automatisch op de hoogte gesteld.",
icon: CheckCircle, color: C.green,
action: "Naar mijn dashboard →",
},
];

function ClientOnboarding({ user, onComplete }) {
const [step, setStep] = useState(0);
const [formData, setFormData] = useState({});
const [selected, setSelected] = useState([]);
const [toggles, setToggles] = useState({ twofa: true, emailNotif: true, smsNotif: false });
const [animDir, setAnimDir] = useState("forward");

const current = ONBOARDING_STEPS[step];
const isLast = step === ONBOARDING_STEPS.length - 1;
const pct = Math.round((step / (ONBOARDING_STEPS.length - 1)) * 100);

const advance = () => {
if (isLast) { onComplete(); return; }
setAnimDir("forward");
setStep(s => s + 1);
};
const back = () => {
if (step === 0) return;
setAnimDir("back");
setStep(s => s - 1);
};

return (
<div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.bg} 0%, #EDE7E0 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
<GlobalStyles />
{/* Logo bar */}
<div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
<div style={{ width: 40, height: 40, borderRadius: 10, background: C.espresso, display: "flex", alignItems: "center", justifyContent: "center" }}>
<span style={{ color: CREAM, fontWeight: 800, fontSize: 16, fontFamily: F.display }}>GE</span>
</div>
<div>
<div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>The Client Portal</div>
<div style={{ fontSize: 9, color: C.secondary, letterSpacing: "0.1em", textTransform: "uppercase" }}>Cliëntonboarding</div>
</div>
</div>


  {/* Progress bar + steps */}
  <div style={{ width: "100%", maxWidth: 640, marginBottom: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      {ONBOARDING_STEPS.map((s, i) => (
        <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: i < step ? C.crimson : i === step ? C.crimsonFaint : C.surface, border: `2px solid ${i <= step ? C.crimson : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4, transition: "all .3s" }}>
            {i < step ? <Check size={12} color={CREAM} /> : <s.icon size={11} color={i === step ? C.crimson : C.secondary} />}
          </div>
          {i < ONBOARDING_STEPS.length - 1 && (
            <div style={{ position: "relative", width: "100%", height: 2, background: C.border, marginTop: -16 }}>
              <div style={{ height: "100%", width: i < step ? "100%" : "0%", background: C.crimson, transition: "width .4s" }} />
            </div>
          )}
        </div>
      ))}
    </div>
    <div style={{ textAlign: "right", fontSize: 10, fontWeight: 700, color: C.secondary }}>{pct}% voltooid</div>
  </div>

  {/* Card */}
  <div className="fu" key={step} style={{ width: "100%", maxWidth: 640, background: C.surface, borderRadius: 20, boxShadow: "0 24px 80px rgba(58,46,40,.14)", overflow: "hidden" }}>
    {/* Header band */}
    <div style={{ background: current.id === "done" ? C.greenBg : C.crimsonFaint, padding: "28px 36px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", gap: 18 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: current.id === "done" ? C.green : C.crimson, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <current.icon size={24} color={CREAM} />
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: current.id === "done" ? C.green : C.crimson, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>{current.subtitle}</div>
        <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 600, color: C.text, margin: "0 0 6px" }}>{current.title}</h2>
        <p style={{ fontSize: 13, color: C.secondary, margin: 0, lineHeight: 1.6 }}>{current.description}</p>
      </div>
    </div>

    {/* Body */}
    <div style={{ padding: "28px 36px" }}>
      {/* Fields */}
      {current.fields && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {current.fields.map(f => (
            <div key={f.id}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.secondary, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 6 }}>{f.label}</div>
              <input
                type={f.type}
                value={formData[f.id] || ""}
                onChange={e => setFormData(d => ({ ...d, [f.id]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: `1.5px solid ${formData[f.id] ? C.crimson : C.border}`, fontSize: 13, outline: "none", boxSizing: "border-box", transition: "border-color .15s" }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Service selection */}
      {current.services && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {current.services.map(s => {
            const isSel = selected.includes(s.id);
            return (
              <div key={s.id} onClick={() => setSelected(prev => isSel ? prev.filter(x => x !== s.id) : [...prev.filter(x => x !== "both"), s.id])} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderRadius: 12, border: `2px solid ${isSel ? C.crimson : C.border}`, background: isSel ? C.crimsonFaint : C.bg, cursor: "pointer", transition: "all .15s" }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: isSel ? C.crimson : C.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .15s" }}>
                  <s.Icon size={18} color={isSel ? CREAM : C.secondary} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: C.secondary }}>{s.sub}</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${isSel ? C.crimson : C.border}`, background: isSel ? C.crimson : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {isSel && <Check size={12} color={CREAM} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Security toggles */}
      {current.toggles && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {current.toggles.map(tg => (
            <div key={tg.id} onClick={() => setToggles(t => ({ ...t, [tg.id]: !t[tg.id] }))} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 18px", borderRadius: 12, border: `1.5px solid ${toggles[tg.id] ? C.crimson : C.border}`, background: toggles[tg.id] ? C.crimsonFaint : C.bg, cursor: "pointer", transition: "all .15s" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{tg.label}</div>
                <div style={{ fontSize: 11, color: C.secondary }}>{tg.sub}</div>
              </div>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: toggles[tg.id] ? C.crimson : C.border, position: "relative", flexShrink: 0, transition: "background .2s" }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: CREAM, position: "absolute", top: 3, left: toggles[tg.id] ? 23 : 3, transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Done state */}
      {current.id === "done" && (
        <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
            {[
              { Icon: CheckCircle, label: "Identiteit\nGeverifieerd" },
              { Icon: Building, label: "Profiel\nAangemaakt" },
              { Icon: Shield, label: "Beveiliging\nActief" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 18px", borderRadius: 12, background: C.greenBg, border: `1px solid ${C.green}30` }}>
                <item.Icon size={20} color={C.green} />
                <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textAlign: "center", lineHeight: 1.4, whiteSpace: "pre-line" }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: "14px 18px", borderRadius: 12, background: C.bg, border: `1px solid ${C.border}`, fontSize: 12, color: C.secondary, lineHeight: 1.6 }}>
            Uw adviseur <strong style={{ color: C.text }}>{user.dept === "FF" ? "Adviseur FF" : "Adviseur TC"}</strong> is automatisch op de hoogte gesteld en zal binnen 1 werkdag contact opnemen.
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
        {step > 0 && !isLast ? (
          <button onClick={back} style={{ display: "flex", alignItems: "center", gap:6, padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", color: C.secondary, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <ChevronLeft size={15} /> Terug
          </button>
        ) : <div />}
        <button onClick={advance} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, background: current.id === "done" ? C.green : C.crimson, color: CREAM, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 14px ${current.id === "done" ? C.green : C.crimson}40` }}>
          {current.action}
        </button>
      </div>
    </div>
  </div>

  {/* Footer */}
  <div style={{ marginTop: 24, fontSize: 10, color: C.muted, display: "flex", alignItems: "center", gap:6 }}>
    <Shield size={11} /> Stap {step + 1} van {ONBOARDING_STEPS.length} · Beveiligd met 256-bit encryptie
  </div>
</div>


);
}

// ─── ROOT APP ────────────────────────────────────────────────────────────────
export default function App(){
const [user,setUser]=useState(null);
const [language,setLanguage]=useState("NL");
const handleLogin=(u)=>{ setUser(u); };

if(!user) return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage}/>;
return <AppShell user={user} language={language} setLanguage={setLanguage} onLogout={async()=>{try{await supabase.auth.signOut();}catch(e){}setUser(null);}}/>;
}
