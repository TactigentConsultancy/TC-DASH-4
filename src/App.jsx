import React, { useState, useEffect, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import {
Target, Building2, BarChart3, FileText, TrendingUp, LogOut, Settings,
Plus, Globe, Bell, Eye, EyeOff, ChevronRight, AlertTriangle,
CheckCircle, Lock, Mail, Search, Download,
ChevronLeft, Users, CheckSquare, Upload, X, Shield, Clock,
Send, Layers, Receipt, RefreshCw, Check, Info, ImageOff,
Activity, FileSpreadsheet, FileType, Pen,
ScanSearch, ClipboardList, Scale, BookOpen, FolderOpen, HelpCircle,
Building, LayoutDashboard,
ArrowRight
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
const BRANDING_USE_IMAGES = true; // <- set to true after adding images

const BRANDING = {
  // Image paths (relative to /public)
  logoTC:       "/images/branding/logo-tc.png",
  logoFF:       "/images/branding/logo-ff.png",
  logoTCLight:  "/images/branding/logo-tc.png",
  logoFFLight:  "/images/branding/logo-ff.png",
  logoMain:     "/images/branding/logo-main.png",

  // Fallback text when images are not yet set
  nameTC:       "Tactigent Consultancy",
  nameFF:       "Fiscal Fuse",
  nameMain:     "The Client Portal",
  initTC:       "TC",
  initFF:       "FF",
  initMain:     "CP",

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

// ── Officiële Supabase SDK client ────────────────────────────────
const supabase = createClient(SB_URL, SB_ANON, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ── Auth token helper (voor raw DELETE fetches) ──────────────────
// De SDK beheert de sessie automatisch — we lezen het token
// uit de sessie wanneer nodig voor de raw fetch DELETE calls.
let _authToken = SB_ANON;
const setAuthToken = (t) => { _authToken = t || SB_ANON; };
const getAuthToken = () => {
  const session = supabase.auth.session?.();
  return session?.access_token || _authToken;
};

// ── ADAPTERS ─────────────────────────────────────────────────────
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
const {data:row,error:compErr}=await supabase.from("companies").insert({
name:payload.name,kkf_number:payload.kkf,department:payload.dept,
industry:payload.industry,lifecycle_status:payload.lifecycle,health:"green",
logo_url:payload.logo_url||null,notes:payload.notes||null
}).select().single();
if(compErr) throw new Error(compErr.message);
if(payload.contact) {
await supabase.from("contacts").insert({company_id:row.id,full_name:payload.contact,role_title:payload.role||null,
email:payload.email||null,phone:payload.phone||null,is_primary:true});
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
const {data:row,error:engErr}=await supabase.from("engagements").insert({
name:data.name,department:data.dept,type:data.dept==="TC"?"project":"matter",
phase:data.phase,status:data.status||"Actief",health:"green",
company_id:data.company_id,reference_code:data.ref,deadline:data.deadline||null
}).select().single();
if(engErr) throw new Error(engErr.message);
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
    espresso:"#3A2E28", walnut:"#4A3C35", oak:"#5E4E45", darkAccent:"#3A2E28",
    bg:"#F5F1EC", surface:"#FDFCF9", warm50:"#F0EBE5",
    text:"#3A2E28", secondary:"#7A6B60", muted:"#A89B92", border:"#E4DDD5", onDark:"#F0EBE4",
    amber:"#C97B1A", amberBg:"#FDF6EC",
    red:"#C83232", redBg:"#FEF2F2",
    green:"#15803D", greenBg:"#F0FDF4",
    blue:"#1D4ED8", blueBg:"#EFF6FF", indigo:"#6366F1", indigoBg:"#EEF2FF", indigoDark:"#4338CA",
    tagFF:"#9A877A",
    navBg:"#FDFCF9", topbarBg:"#FDFCF9",
  },
  dark: {
    crimson:"#C0283C", crimsonDeep:"#8B1A2B", crimsonFaint:"#2A1518", crimsonMid:"#7A3040",
    taupe:"#8A7B72", taupeLight:"#4A3E38", taupeDeep:"#6A5E58", mushroom:"#4A4038",
    espresso:"#F0EBE4", walnut:"#8B6B52", oak:"#7A6B62", darkAccent:"#2A2218",
    bg:"#141210", surface:"#1E1A16", warm50:"#252018",
    text:"#F0EBE4", secondary:"#A89B92", muted:"#6A5E58", border:"#2E2820", onDark:"#F0EBE4",
    amber:"#F59E0B", amberBg:"#1C1200",
    red:"#EF4444", redBg:"#1C0808",
    green:"#22C55E", greenBg:"#052E16",
    blue:"#60A5FA", blueBg:"#0A1628", indigo:"#818CF8", indigoBg:"#1E1B4B", indigoDark:"#6366F1",
    tagFF:"#8A7B72",
    navBg:"#1A1612", topbarBg:"#1A1612",
  }
};
// C is set dynamically based on theme — default light
let C = THEMES.light;
const CREAM="#F5F1EC", CREAM_DIM="#C8BBB2";
const F = { display:"'Cormorant Garamond',Georgia,serif", body:"'Jost',sans-serif", mono:"'JetBrains Mono','Fira Code',monospace" };



function GlobalStyles({darkMode=false}) {
useEffect(()=>{
const id="gds-fonts"; if(document.getElementById(id)) return;
const l=document.createElement("link"); l.id=id; l.rel="stylesheet";
l.href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Jost:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap";
l.setAttribute("crossorigin","anonymous");
document.head.appendChild(l);
},[]);

const dm = darkMode;
const bg      = dm ? "#141210" : "#F5F1EC";
const surface = dm ? "#1E1A16" : "#FDFCF9";
const text     = dm ? "#F0EBE4" : "#3A2E28";
const border   = dm ? "#2E2820" : "#E4DDD5";
const inputBg  = dm ? "#252018" : "#FFFFFF";
const muted    = dm ? "#6A5E58" : "#A89B92";
const secondary= dm ? "#A89B92" : "#7A6B60";

return <style>{`
*,*::before,*::after{box-sizing:border-box;}
html,body{margin:0;padding:0;}
body{
  font-family:'Jost',sans-serif;
  background:${bg};
  color:${text};
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
  text-rendering:optimizeLegibility;
}
button,input,textarea,select{font-family:'Jost',sans-serif;}

/* ── Input/Select contrast-safe overrides ── */
input, textarea {
  background: ${inputBg} !important;
  color: ${text} !important;
}
input::placeholder, textarea::placeholder {
  color: ${muted} !important;
  opacity: 1;
}
select {
  background: ${inputBg} !important;
  color: ${text} !important;
}
select option {
  background: ${surface} !important;
  color: ${text} !important;
}
/* Force all inline-styled divs with hardcoded bgs to inherit dark colors */
body.dark-mode [style*="background: #F5F3FF"],
body.dark-mode [style*="background: #EEF2FF"],
body.dark-mode [style*="background: #EFF6FF"],
body.dark-mode [style*="background:#F5F3FF"],
body.dark-mode [style*="background:#EEF2FF"],
body.dark-mode [style*="background:#EFF6FF"] {
  background: ${surface} !important;
  color: ${text} !important;
}
/* Dashboard dark card text: handled via C.bg token */
/* Ensure all text inside dark-accent cards is legible */
body.dark-mode table thead tr th {
  color: #A89B92 !important;
}
/* QBO and KPI stat cards */
body.dark-mode [style*="background: #3A2E28"],
body.dark-mode [style*="background:#3A2E28"] {
  background: #2A2218 !important;
}
body.dark-mode table thead tr {
  color: #F0EBE4 !important;
}
/* Prevent white-on-white or dark-on-dark */
input[style*="background"], textarea[style*="background"] {
  color: ${text} !important;
}

/* modal overlays: transparent */

/* ── Scrollbar ── */
/* Modal portal styles */
#modal-root, [id^="modal-root-"] { 
  position:fixed;top:0;left:0;
  width:100vw;height:100vh;
  z-index:99999;
  pointer-events:auto;
}
.modal-open{overflow:hidden!important;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:${border};border-radius:3px;}
::-webkit-scrollbar-thumb:hover{background:${secondary};}

/* ── Focus rings ── */
:focus-visible{outline:2px solid #8B1A2B;outline-offset:2px;border-radius:4px;}
button:focus-visible,a:focus-visible{outline:2px solid #8B1A2B;outline-offset:2px;}

/* ── Design tokens ── */
:root{
  --ease-out-expo:cubic-bezier(0.16,1,0.3,1);
  --ease-out-quart:cubic-bezier(0.25,1,0.5,1);
  --ease-in-out:cubic-bezier(0.4,0,0.2,1);
  --shadow-sm:0 1px 3px rgba(0,0,0,.${dm?'18':'08'}),0 1px 2px rgba(0,0,0,.${dm?'12':'06'});
  --shadow-md:0 4px 12px rgba(0,0,0,.${dm?'28':'10'}),0 2px 4px rgba(0,0,0,.${dm?'16':'06'});
  --shadow-lg:0 12px 32px rgba(0,0,0,.${dm?'36':'12'}),0 4px 8px rgba(0,0,0,.${dm?'20':'06'});
  --shadow-xl:0 24px 64px rgba(0,0,0,.${dm?'44':'14'}),0 8px 16px rgba(0,0,0,.${dm?'24':'08'});
  --shadow-crimson:0 4px 16px rgba(139,26,43,.${dm?'40':'24'});
}

/* ── Animations ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
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
const SideSection=({label,collapsed})=>collapsed?<div style={{height:1,background:C.border,margin:"8px 12px"}}/>:(<div style={{padding:"18px 14px 5px",fontSize:9.5,fontWeight:700,color:C.mushroom,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:F.body}}>{label}</div>);
const SideBtn=({icon:Icon,label,isActive,onClick,danger,badge,collapsed,title})=>(
  <button onClick={onClick} title={collapsed?label:undefined} style={{width:"100%",display:"flex",alignItems:"center",gap:collapsed?0:10,padding:collapsed?"9px 0":"9px 12px",justifyContent:collapsed?"center":"flex-start",borderRadius:9,border:"none",cursor:"pointer",textAlign:"left",background:isActive?"rgba(139,26,43,0.08)":"transparent",color:isActive?C.crimson:danger?"#DC2626":C.secondary,marginBottom:1,transition:"background .15s,color .15s",position:"relative",fontFamily:F.body}}>
    {isActive&&<div style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:3,borderRadius:"0 2px 2px 0",background:C.crimson}}/>}
    {Icon&&<Icon size={14} strokeWidth={isActive?2.2:1.6} style={{flexShrink:0}}/>}
    {!collapsed&&<span style={{fontSize:12,fontWeight:isActive?600:400,flex:1,letterSpacing:isActive?"0.01em":"0"}}>{label}</span>}
    {!collapsed&&badge&&<span style={{fontSize:9,fontWeight:700,background:C.crimson,color:CREAM,padding:"2px 7px",borderRadius:10,minWidth:18,textAlign:"center",letterSpacing:"0.02em"}}>{badge}</span>}
    {collapsed&&badge&&<span style={{position:"absolute",top:4,right:4,width:8,height:8,borderRadius:"50%",background:C.crimson}}/>}
  </button>
);
const Pill=({label,active,onClick})=>(<button onClick={onClick} style={{padding:"6px 16px",borderRadius:20,border:`1.5px solid ${active?C.crimson:C.border}`,background:active?C.crimson:"transparent",color:active?CREAM:C.secondary,fontSize:12,fontWeight:600,cursor:"pointer",transition:"background .15s,color .15s,border-color .15s",whiteSpace:"nowrap"}}>{label}</button>);
function Toast({msg,onClose}){useEffect(()=>{const t=setTimeout(onClose,3400);return()=>clearTimeout(t);},[]);return(<div className="sir" style={{position:"fixed",bottom:28,right:28,zIndex:2000,background:C.espresso,color:C.bg,borderRadius:14,padding:"13px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 20px 48px rgba(58,46,40,.32),0 4px 8px rgba(58,46,40,.16)",fontSize:13,fontWeight:500,maxWidth:360,lineHeight:1.5}}><div style={{width:20,height:20,borderRadius:"50%",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Check size={12} color="#4ADE80"/></div>{msg}<button onClick={onClose} style={{background:"none",border:"none",color:C.taupeLight,cursor:"pointer",marginLeft:"auto",padding:"2px",opacity:.7,lineHeight:0}}><X size={14}/></button></div>);}

// ─── DATA ───────────────────────────────────────────────────────────────────
const DEMO_USERS=[];
const COMPANIES_INIT=[];
const TC_PHASES=["Intake","Informatieverzameling","Scoping","Uitvoering","Review","Oplevering","Afgerond"];
const FF_PHASES=["Assessment","Technische Analyse","Draft Advies","Review","Retainer Monitoring","Afgerond"];
const ENGAGEMENT_STATUSES=["Actief","Prioriteit","In Review","Geblokkeerd","Wacht op Cliënt","Gepauzeerd","Gesloten"];
const STATUS_COLOR={Actief:C.green,Prioriteit:C.crimson,"In Review":C.indigo,Geblokkeerd:C.red,GepauzeerD:C.secondary,"Wacht op Cliënt":C.amber,Gepauzeerd:C.secondary,Gesloten:C.mushroom};
const STATUS_BG={Actief:C.greenBg,Prioriteit:C.crimsonFaint,"In Review":C.indigoBg,Geblokkeerd:C.redBg,"Wacht op Cliënt":C.amberBg,Gepauzeerd:C.warm50,Gesloten:C.warm50};

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
const TRANSACTIONS=[];
const NOTIFICATIONS_INIT=[];
const LEADS=[];
const MARKETING_CAMPAIGNS=[];
const SOCIAL_CHANNELS=[];

const REVIEW_DOCS=[];
const CLIENT_PORTAL_ACTIONS=[];
const CLIENT_THREADS=[];

// ─── SIDEBAR ────────────────────────────────────────────────────────────────
function Sidebar({user,view,setView,onLogout,unreadCount,onNewEng,collapsed,setCollapsed,pendingActionsCount=0}){
const t=useT();
const isFF=user.dept==="FF",isTC=user.dept==="TC",isBOTH=user.dept==="BOTH";
const W=collapsed?68:228;
return(
<aside style={{
  width:W,minWidth:W,
  background:C.surface,
  borderRight:`1px solid ${C.border}`,
  display:"flex",flexDirection:"column",
  flexShrink:0,overflowY:"auto",
  transition:"width .22s cubic-bezier(0.4,0,0.2,1),min-width .22s cubic-bezier(0.4,0,0.2,1)",
  position:"relative",overflow:"visible",
}}>
{/* Brand header */}
<div style={{padding:collapsed?"14px 0":"20px 16px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:collapsed?0:11,justifyContent:collapsed?"center":"flex-start",minHeight:64}}>
  {collapsed
    ? <BrandLogoMain size={30} variant="light"/>
    : <>
        <BrandLogoMain size={36} variant="light"/>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:C.text,lineHeight:1.3,letterSpacing:"-0.01em"}}>{BRANDING.nameMain}</div>
          <div style={{fontSize:10,color:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",marginTop:2,fontWeight:500}}>{user.role==="client"?"Portaal":"Command Center"}</div>
        </div>
      </>
  }
</div>

{/* Collapse toggle button */}
<button
  onClick={()=>setCollapsed(c=>!c)}
  title={collapsed?"Uitklappen":"Inklappen"}
  style={{
    position:"absolute",top:20,right:collapsed?8:12,
    width:22,height:22,borderRadius:6,
    background:C.warm50,border:`1px solid ${C.border}`,
    display:"flex",alignItems:"center",justifyContent:"center",
    cursor:"pointer",zIndex:20,color:C.secondary,
    boxShadow:"0 1px 3px rgba(0,0,0,.08)",
    transition:"right .22s",
  }}>
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{transform:collapsed?"rotate(0deg)":"rotate(180deg)",transition:"transform .22s",display:"block"}}><polyline points="15,18 9,12 15,6"/></svg>
</button>

<nav style={{flex:1,padding:collapsed?"6px 6px":"6px 8px",overflowY:"auto"}}>
{user.role!=="client"&&<>
<SideSection label={t("overview")} collapsed={collapsed}/>
<SideBtn icon={Layers} label={t("dashboard")} isActive={view==="dashboard"} onClick={()=>setView("dashboard")} collapsed={collapsed}/>
<SideBtn icon={BarChart3} label={t("analyses")} isActive={view==="analyses"} onClick={()=>setView("analyses")} collapsed={collapsed}/>
{(isTC||isBOTH)&&<>
<SideSection label={t("tc")} collapsed={collapsed}/>
<SideBtn icon={Target} label={t("projects")} isActive={view==="projects"} onClick={()=>setView("projects")} collapsed={collapsed}/>
<SideBtn icon={CheckSquare} label={t("tasks")} isActive={view==="tasks"} onClick={()=>setView("tasks")} collapsed={collapsed}/>
<SideBtn icon={CheckCircle} label={`${t("clientActions")} (TC)`} isActive={view==="ca_tc"} onClick={()=>setView("ca_tc")} collapsed={collapsed}/>
</>}
{(isFF||isBOTH)&&<>
<SideSection label={t("ff")} collapsed={collapsed}/>
<SideBtn icon={Building2} label={t("dossiers")} isActive={view==="dossiers"} onClick={()=>setView("dossiers")} collapsed={collapsed}/>
<SideBtn icon={CheckCircle} label={`${t("clientActions")} (FF)`} isActive={view==="ca_ff"} onClick={()=>setView("ca_ff")} collapsed={collapsed}/>
</>}
{(isTC||isFF||isBOTH)&&<>
<SideSection label="Documentbeheer" collapsed={collapsed}/>
<SideBtn icon={ClipboardList} label={t("review")} isActive={view==="review"} onClick={()=>setView("review")} collapsed={collapsed}/>
<SideBtn icon={Upload} label="Documentverzoeken" isActive={view==="doc_requests"} onClick={()=>setView("doc_requests")} collapsed={collapsed} badge={0}/>
</>}
<SideSection label={t("crmLeads")} collapsed={collapsed}/>
<SideBtn icon={Users} label={t("crm")} isActive={view==="crm"} onClick={()=>setView("crm")} collapsed={collapsed}/>
<SideBtn icon={TrendingUp} label={t("leads")} isActive={view==="leads"} onClick={()=>setView("leads")} collapsed={collapsed}/>
<SideSection label="Marketing & Sales" collapsed={collapsed}/>
<SideBtn icon={Send} label="Marketing Hub" isActive={view==="marketing"} onClick={()=>setView("marketing")} collapsed={collapsed}/>
<SideSection label={t("docsFinance")} collapsed={collapsed}/>
<SideBtn icon={FileText} label={t("docs")} isActive={view==="docs"} onClick={()=>setView("docs")} collapsed={collapsed}/>
<SideBtn icon={Receipt} label={t("invoices")} isActive={view==="invoices"} onClick={()=>setView("invoices")} collapsed={collapsed}/>
<SideSection label={t("intelligence")} collapsed={collapsed}/>
<SideBtn icon={Shield} label={t("riskMatrix")} isActive={view==="risk_matrix"} onClick={()=>setView("risk_matrix")} collapsed={collapsed}/>
{user.role==="super_admin"&&<SideBtn icon={Activity} label={t("assetFlow")} isActive={view==="asset_flow"} onClick={()=>setView("asset_flow")} collapsed={collapsed}/>}
<SideSection label={t("system")} collapsed={collapsed}/>
<SideBtn icon={Bell} label={t("notifications")} isActive={view==="notifications"} onClick={()=>setView("notifications")} badge={unreadCount>0?unreadCount:null} collapsed={collapsed}/>
{(user.role==="super_admin"||user.role==="admin")&&<SideBtn icon={ClipboardList} label="Audit Log" isActive={view==="audit_log"} onClick={()=>setView("audit_log")} collapsed={collapsed}/>}
<SideBtn icon={Settings} label={t("settings")} isActive={view==="settings"} onClick={()=>setView("settings")} collapsed={collapsed}/>
<SideBtn icon={LogOut} label={t("logout")} isActive={false} onClick={onLogout} danger collapsed={collapsed}/>
</>}
{user.role==="client"&&<>
<SideSection label={t("myPortal")}/>
<SideBtn icon={Layers} label={t("dashboard")} isActive={view==="c_dash"} onClick={()=>setView("c_dash")}/>
<SideBtn icon={CheckSquare} label={t("myActions")} isActive={view==="c_actions"} onClick={()=>setView("c_actions")} badge={pendingActionsCount||0}/>
<SideBtn icon={FileText} label={t("myDocs")} isActive={view==="c_docs"} onClick={()=>setView("c_docs")}/>
<SideSection label="Financiën"/>
<SideBtn icon={Receipt} label={t("financeNav")} isActive={view==="c_finance"} onClick={()=>setView("c_finance")}/>
<SideSection label={t("intelligence")}/>
<SideBtn icon={Shield} label={t("riskMatrix")} isActive={view==="risk_matrix"} onClick={()=>setView("risk_matrix")}/>
{user.role==="super_admin"&&<SideBtn icon={Activity} label={t("assetFlow")} isActive={view==="asset_flow"} onClick={()=>setView("asset_flow")}/>}
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


function TopbarAvatar({user,setView,size=32,clickable=true}){
const [url,setUrl]=useState(null);
useEffect(()=>{
  supabase.from("user_profiles").select("avatar_url").eq("id",user.id).single()
    .then(({data})=>{ if(data?.avatar_url) setUrl(data.avatar_url); })
    .catch(e=>console.warn("DB [companies]:", e?.message||e));
},[user.id]);
return(
  <div onClick={clickable?()=>setView("settings"):undefined} style={{width:size,height:size,borderRadius:"50%",border:`2px solid ${C.border}`,overflow:"hidden",cursor:clickable?"pointer":"default",flexShrink:0}}>
    {url
      ? <img src={url} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
      : <div style={{width:"100%",height:"100%",background:C.crimson,display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(size*.34),fontWeight:700,color:CREAM}}>{user.avatar}</div>
    }
  </div>
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
placeholder={t("search")} onClick={()=>setShowSearch(true)} readOnly
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
    <div style={{display:"flex",border:`1px solid ${C.border}`,borderRadius:7}}>
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
        <TopbarAvatar user={user} setView={setView} size={26}/>
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


// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────
function GlobalSearch({user,engData,companyData,onClose,setView,setDetailEng,setDetailCompany,setDetailLead}){
const [q,setQ]=useState("");
const [results,setResults]=useState([]);
const [loading,setLoading]=useState(false);
const [selected,setSelected]=useState(0);
const inputRef=React.useRef(null);

useEffect(()=>{
  inputRef.current?.focus();
  const handler=e=>{
    if(e.key==="Escape") onClose();
    if(e.key==="ArrowDown") setSelected(s=>Math.min(s+1,results.length-1));
    if(e.key==="ArrowUp") setSelected(s=>Math.max(s-1,0));
    if(e.key==="Enter"&&results[selected]) handleSelect(results[selected]);
  };
  window.addEventListener("keydown",handler);
  return()=>window.removeEventListener("keydown",handler);
},[results,selected]);

useEffect(()=>{
  setSelected(0);
  if(q.trim().length<2){ setResults([]); return; }
  setLoading(true);
  const term=q.toLowerCase().trim();

  // Search across 5 tables simultaneously
  Promise.all([
    // Engagements
    supabase.from("engagements")
      .select("id,name,department,status,health,phase")
      .ilike("name",`%${term}%`)
      .limit(4),
    // Companies
    supabase.from("companies")
      .select("id,name,department,lifecycle_status,kkf_number")
      .or(`name.ilike.%${term}%,kkf_number.ilike.%${term}%`)
      .limit(4),
    // Documents
    supabase.from("documents")
      .select("id,name,file_type,department,review_status")
      .ilike("name",`%${term}%`)
      .limit(3),
    // Invoices
    supabase.from("invoices")
      .select("id,reference_code,amount,status,department")
      .or(`reference_code.ilike.%${term}%,description.ilike.%${term}%`)
      .limit(3),
    // Leads
    supabase.from("leads")
      .select("id,company_name,contact_name,stage,department")
      .or(`company_name.ilike.%${term}%,contact_name.ilike.%${term}%`)
      .limit(3),
  ]).then(([{data:engs},{data:comps},{data:docs},{data:invs},{data:leads}])=>{
    const out=[];
    (engs||[]).forEach(e=>out.push({
      type:"engagement",id:e.id,label:e.name,
      sub:`${e.department} · ${e.phase||e.status||"—"}`,
      icon:"target",dept:e.department,health:e.health,data:e,
    }));
    (comps||[]).forEach(c=>out.push({
      type:"company",id:c.id,label:c.name,
      sub:c.department+" · "+(c.lifecycle_status||"—")+(c.kkf_number?" · KKF: "+c.kkf_number:""),
      icon:"building",dept:c.department,data:c,
    }));
    (docs||[]).forEach(d=>out.push({
      type:"document",id:d.id,label:d.name,
      sub:`${d.department} · ${(d.file_type||"").toUpperCase()} · ${d.review_status||"—"}`,
      icon:"file",dept:d.department,data:d,
    }));
    (invs||[]).forEach(i=>out.push({
      type:"invoice",id:i.id,label:i.reference_code||"Factuur",
      sub:`${i.department} · SRD ${Number(i.amount||0).toLocaleString()} · ${i.status||"—"}`,
      icon:"receipt",dept:i.department,data:i,
    }));
    (leads||[]).forEach(l=>out.push({
      type:"lead",id:l.id,label:l.company_name,
      sub:`${l.department} · ${l.contact_name||"—"} · ${l.stage||"—"}`,
      icon:"trending",dept:l.department,data:l,
    }));
    setResults(out);
    setLoading(false);
  }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[q]);

const handleSelect=(item)=>{
  onClose();
  switch(item.type){
    case "engagement":
      if(setDetailEng){ setDetailEng(item.data); setView("analyses"); }
      break;
    case "company":
      if(setDetailCompany){ setDetailCompany(item.data); setView("crm"); }
      break;
    case "document":
      setView("dms"); break;
    case "invoice":
      setView("invoices"); break;
    case "lead":
      if(setDetailLead){ setDetailLead(item.data); setView("leads"); }
      else setView("leads");
      break;
  }
};

const TYPE_CONFIG={
  engagement:{label:"Engagement",Icon:Target,c:C.crimson,bg:C.crimsonFaint},
  company:{label:"Cliënt",Icon:Building2,c:C.taupe,bg:"#F5F3F0"},
  document:{label:"Document",Icon:FileText,c:C.indigo,bg:C.indigoBg},
  invoice:{label:"Factuur",Icon:Receipt,c:C.amber,bg:C.amberBg},
  lead:{label:"Lead",Icon:TrendingUp,c:C.green,bg:C.greenBg},
};

const SHORTCUTS=[
  {key:"P",label:"Projecten",view:"analyses"},
  {key:"C",label:"Cliënten",view:"crm"},
  {key:"F",label:"Facturen",view:"invoices"},
  {key:"D",label:"Documenten",view:"dms"},
  {key:"L",label:"Leads",view:"leads"},
];

return(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"flex-start",justifyContent:"center",zIndex:99999,paddingTop:"10vh"}}
  onClick={onClose}>
  <div onClick={e=>e.stopPropagation()}
    style={{width:620,maxWidth:"95vw",background:C.surface,borderRadius:16,boxShadow:"0 8px 48px rgba(0,0,0,.22)",overflow:"hidden",fontFamily:F.body}}>

    {/* Search input */}
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 18px",borderBottom:`1px solid ${C.border}`}}>
      <Search size={18} color={C.secondary}/>
      <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
        placeholder="Zoek engagements, cliënten, facturen, documenten, leads..."
        style={{flex:1,border:"none",outline:"none",fontSize:15,background:"transparent",color:C.text,fontFamily:F.body}}/>
      {loading&&<div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${C.crimson}`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>}
      {q&&<button onClick={()=>setQ("")} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={16}/></button>}
      <div style={{padding:"2px 8px",borderRadius:5,background:C.warm50,border:`1px solid ${C.border}`,fontSize:10,fontWeight:700,color:C.secondary}}>ESC</div>
    </div>

    {/* Results */}
    {q.length>=2?(
      <div style={{maxHeight:420,overflowY:"auto"}}>
        {results.length===0&&!loading&&(
          <div style={{padding:"32px 20px",textAlign:"center"}}>
            <Search size={24} color={C.mushroom} style={{marginBottom:8,display:"block",margin:"0 auto 8px"}}/>
            <div style={{fontSize:13,fontWeight:600,color:C.secondary}}>Geen resultaten voor "{q}"</div>
            <div style={{fontSize:11,color:C.muted,marginTop:4}}>Probeer een andere zoekterm</div>
          </div>
        )}
        {results.map((item,i)=>{
          const cfg=TYPE_CONFIG[item.type]||TYPE_CONFIG.document;
          const isSelected=i===selected;
          return(
            <div key={`${item.type}-${item.id}`}
              onClick={()=>handleSelect(item)}
              onMouseEnter={()=>setSelected(i)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"11px 18px",
                background:isSelected?C.warm50:"transparent",
                borderLeft:`3px solid ${isSelected?cfg.c:"transparent"}`,
                cursor:"pointer",transition:"background .1s"}}>
              <div style={{width:36,height:36,borderRadius:9,background:cfg.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <cfg.Icon size={16} color={cfg.c}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.label}</div>
                <div style={{fontSize:11,color:C.secondary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.sub}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <span style={{fontSize:9,fontWeight:700,color:cfg.c,background:cfg.bg,padding:"2px 7px",borderRadius:4,textTransform:"uppercase"}}>{cfg.label}</span>
                {item.dept&&<DeptTag dept={item.dept}/>}
              </div>
            </div>
          );
        })}
      </div>
    ):(
      /* Quick shortcuts when no query */
      <div style={{padding:"16px 18px"}}>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>SNELKOPPELINGEN</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
          {SHORTCUTS.map(s=>(
            <button key={s.key} onClick={()=>{onClose();setView(s.view);}}
              style={{padding:"10px 8px",borderRadius:10,background:C.warm50,border:`1px solid ${C.border}`,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.text}}>{s.label}</div>
              <div style={{fontSize:9,color:C.secondary,marginTop:3}}>Ga naar</div>
            </button>
          ))}
        </div>
        <div style={{marginTop:14,padding:"10px 12px",borderRadius:8,background:C.warm50,display:"flex",gap:16,fontSize:10,color:C.secondary}}>
          <span><kbd style={{padding:"1px 5px",borderRadius:3,background:C.surface,border:`1px solid ${C.border}`,fontSize:10}}>↑↓</kbd> navigeren</span>
          <span><kbd style={{padding:"1px 5px",borderRadius:3,background:C.surface,border:`1px solid ${C.border}`,fontSize:10}}>↵</kbd> openen</span>
          <span><kbd style={{padding:"1px 5px",borderRadius:3,background:C.surface,border:`1px solid ${C.border}`,fontSize:10}}>ESC</kbd> sluiten</span>
        </div>
      </div>
    )}
  </div>
</div>
);
}

function AppShell({user,language,setLanguage,onLogout}){
// Global unhandled promise rejection handler
useEffect(()=>{
  const handler=(e)=>{
    console.error('Unhandled DB/Promise error:', e.reason?.message || e.reason);
  };
  window.addEventListener('unhandledrejection', handler);
  return ()=>window.removeEventListener('unhandledrejection', handler);
},[]);
const def=user.role==="client"?"c_dash":user.dept==="FF"?"dossiers":"dashboard";
const [view,setView]=useState(def);
const [detailEng,setDetailEng]=useState(null);
const [detailCompany,setDetailCompany]=useState(null);
const [detailLead,setDetailLead]=useState(null);
const [toast,setToast]=useState(null);
const showToast=msg=>setToast(msg);
const [showSearch,setShowSearch]=useState(false);

// ── Dark mode ─────────────────────────────────────────────────────────────
const [darkMode,setDarkMode]=useState(()=>{
  try{ return localStorage.getItem("tge_theme")==="dark"; }catch(e){ return false; }
});
// ── Sidebar collapsed state ───────────────────────────────────────────────
const [sideCollapsed,setSideCollapsed]=useState(()=>{
  try{ return localStorage.getItem("tge_sidebar")==="collapsed"; }catch(e){ return false; }
});
const toggleSide=v=>{
  setSideCollapsed(typeof v==="boolean"?v:c=>!c);
  try{ localStorage.setItem("tge_sidebar",sideCollapsed?"expanded":"collapsed"); }catch(e){}
};
// Apply theme — update C and force re-render via key
const theme = darkMode ? THEMES.dark : THEMES.light;
C = theme; // update module-level C for all components
useEffect(()=>{
  // Inject CSS variables for any CSS-dependent styles
  const root = document.documentElement;
  Object.entries(theme).forEach(([k,v])=>root.style.setProperty(`--c-${k}`,v));
  document.body.style.background = theme.bg;
  document.body.style.color = theme.text;
  document.body.classList.toggle("dark-mode", darkMode);
  try{ localStorage.setItem("tge_theme", darkMode?"dark":"light"); }catch(e){}
},[darkMode]);
const toggleDark=()=>setDarkMode(d=>!d);
// themeKey forces child components to re-render when theme changes
const themeKey = darkMode?"dark":"light";

// ── Live data from Supabase ──────────────────────────────────────────────
const [companyData,setCompanyData]=useState(COMPANIES_INIT);
const [engData,setEngData]=useState(ENGAGEMENTS_INIT);
const [invData,setInvData]=useState(INVOICES_INIT);
const [dbReady,setDbReady]=useState(false);

// Load all data on mount
useEffect(()=>{
  const loadAll=async()=>{
    try{
      // Load companies
      const {data:cos}=await supabase
        .from("companies")
        .select("id,name,kkf_number,department,lifecycle_status,industry,health,contact_name,contact_email,logo_url,portal_user_id,created_at")
        .order("created_at",{ascending:false});
      if(cos?.length) setCompanyData(cos.map(c=>({
        id:c.id, name:c.name, kkf:c.kkf_number, dept:c.department,
        lifecycle:c.lifecycle_status, industry:c.industry,
        health:c.health||"green", contact:c.contact_name, email:c.contact_email,
        logoUrl:c.logo_url, avatar:(c.name||"??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
      })));
      const compNameMap={};
      (cos||[]).forEach(c=>{compNameMap[c.id]=c.name;});

      // Load engagements (no join — fetch company name from map)
      const {data:engs}=await supabase
        .from("engagements")
        .select("id,name,department,type,status,health,phase,company_id,assigned_to,created_at")
        .order("created_at",{ascending:false});
      if(engs?.length) setEngData(engs.map(e=>({
        id:e.id, name:e.name, dept:e.department, type:e.type,
        status:e.status||"active", health:e.health||"green", phase:e.phase,
        company_id:e.company_id, client:compNameMap[e.company_id]||"—",
        ref:`${e.department}-${e.id.slice(0,4).toUpperCase()}`,
        assignee:"—",
      })));

      // Load invoices (no join — fetch company name from map)
      const {data:invs}=await supabase
        .from("invoices")
        .select("id,ref,company_id,amount,status,due_date")
        .order("created_at",{ascending:false});
      if(invs?.length) setInvData(invs.map(i=>({
        id:i.id, ref:i.ref, company_id:i.company_id,
        client:compNameMap[i.company_id]||"—",
        amount:i.amount||0, status:i.status, due:i.due_date,
      })));

      // Load client portal data if user is a client
      if(user.role==='client'){
        try{
          const {data:myCompany}=await supabase.from('companies')
            .select('id,name,department,health,lifecycle_status,kkf_number,contact_name,contact_email,portal_user_id')
            .eq('portal_user_id',user.id).single();
          if(myCompany){
            setClientCompany(myCompany);
            const [{data:ca},{data:dr}]=await Promise.all([
              supabase.from('client_actions')
                .select('id,title,description,action_type,status,deadline,department,engagement_id')
                .eq('company_id',myCompany.id).eq('is_visible_to_client',true)
                .order('deadline',{ascending:true}),
              supabase.from('document_requests')
                .select('id,title,description,document_type,deadline,status')
                .eq('company_id',myCompany.id).eq('status','pending')
                .order('deadline',{ascending:true}),
            ]);
            const docActions=(dr||[]).map(r=>({
              id:'dr_'+r.id,title:r.title,
              description:r.description||('Upload '+r.document_type),
              action_type:'upload',status:'pending',
              deadline:r.deadline,isDocRequest:true,docRequestId:r.id,
            }));
            setClientActionsData([...(ca||[]),...docActions]);
          }
        }catch(e){console.warn('Client portal load:',e?.message||e);}
      }
      setDbReady(true);
    }catch(e){ console.warn("loadAll error:",e.message); setDbReady(true); }
  };
  loadAll();
},[user.id]);
const [notifData,setNotifData]=useState([]);
// Ctrl+K global search
useEffect(()=>{
  const h=e=>{ if((e.ctrlKey||e.metaKey)&&e.key==="k"){ e.preventDefault(); setShowSearch(s=>!s); } };
  window.addEventListener("keydown",h);
  return()=>window.removeEventListener("keydown",h);
},[]);

// Load notifications from Supabase + realtime subscription
useEffect(()=>{
  supabase.from("notifications")
    .select("id,title,body,is_read,created_at,action_type,entity_type,entity_id,company_id,archived")
    .eq("user_id",user.id)
    .order("created_at",{ascending:false})
    .limit(50)
    .then(({data})=>{ if(data?.length) setNotifData(data.map(n=>({...n,read:n.is_read}))); })
    .catch(e=>console.warn("DB [engagements]:", e?.message||e));

  // Poll for new notifications every 30 seconds
  const poll=setInterval(()=>{
    supabase.from("notifications")
      .select("id,title,body,is_read,created_at,action_type,entity_type,entity_id,company_id,archived")
      .eq("user_id",user.id)
      .eq("is_read",false)
      .order("created_at",{ascending:false})
      .limit(10)
      .then(({data})=>{
        if(!data?.length) return;
        setNotifData(prev=>{
          const existingIds=new Set(prev.map(n=>n.id));
          const newOnes=data.filter(n=>!existingIds.has(n.id));
          if(newOnes.length>0){
            newOnes.forEach(n=>{ if(n.title) showToast("🔔 "+n.title); });
            return [...newOnes.map(n=>({...n,read:false})),...prev];
          }
          return prev;
        });
      }).catch(e=>console.warn("DB [notifications]:", e?.message||e));
  },30000);

  return ()=>{ clearInterval(poll); };
},[user.id]);
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
const [clientActionsData,setClientActionsData]=useState([]);
const [clientCompany,setClientCompany]=useState(null);
const unreadCount=notifData.filter(n=>!n.read&&!n.is_read).length;
const handleSetView=(v)=>{
setView(v);setDetailEng(null);setDetailCompany(null);setDetailLead(null);
if(v==="notifications"){
setNotifData(ns=>ns.map(n=>({...n,read:true,is_read:true})));
    // Mark all read in DB
    supabase.from("notifications").update({is_read:true}).eq("user_id",user?.id||"").then(()=>{});
markNotificationsRead(user.id).catch(e=>console.warn("DB [notifications]:", e?.message||e));
}
};  const renderView=()=>{
if(detailCompany) return <CompanyDetail company={detailCompany} user={user} onBack={()=>setDetailCompany(null)} setDetailEng={e=>setDetailEng(engData.find(x=>x.id===e.id)||e)} engData={engData} invData={invData} showToast={showToast}/>;
if(detailEng) return <EngagementDetail eng={detailEng} user={user} onBack={()=>setDetailEng(null)} showToast={showToast} engData={engData} setEngData={setEngData}/>;
if(detailLead) return <LeadDetail lead={detailLead} onBack={()=>setDetailLead(null)} showToast={showToast}/>;
switch(view){
case "dashboard":    return <StaffDashboard user={user} setView={v=>setView(v)} setDetailEng={e=>setDetailEng(engData.find(x=>x.id===e.id)||e)} engData={engData} dbReady={dbReady}/>;
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
case "leads":        return <LeadsView user={user} setDetailLead={setDetailLead} showToast={showToast}/>;
case "docs":         return <DMSView user={user} showToast={showToast}/>;
case "doc_requests":return <DocRequestsPage user={user} engData={engData} showToast={showToast}/>;
case "invoices":     return <InvoicesView user={user} invData={invData} setInvData={setInvData} showToast={showToast}/>;
case "notifications":return <NotificationsView notifData={notifData} setNotifData={setNotifData} onNavigate={handleSetView} setDetailEng={setDetailEng} setDetailCompany={setDetailCompany} engData={engData} companyData={companyData}/>;
case "audit_log":    return <AuditLogView user={user}/>;
case "risk_matrix":  return <RiskMatrixView user={user} engData={engData}/>;
case "asset_flow":   return (user.role==="super_admin"
  ? <AssetFlowView user={user}/>
  : <div style={{padding:40,textAlign:"center"}}>
      <Shield size={32} color={C.muted} style={{marginBottom:12}}/>
      <div style={{fontFamily:F.display,fontSize:18,color:C.text,marginBottom:6}}>Beperkte toegang</div>
      <div style={{fontSize:12,color:C.secondary}}>Vermogensstroom is alleen beschikbaar voor de CEO.</div>
    </div>
);
case "c_dash":       return <ClientDashboard user={user} actionsData={clientActionsData} onNavigate={(v)=>setView(v)}/>;
case "c_docs":       return <ClientDocsView user={user}/>;
case "c_finance":    return <ClientFinanceView user={user} invData={invData}/>;
case "c_actions":    return <ClientActionsPortal user={user} showToast={showToast} initialActions={clientActionsData} initialCompany={clientCompany} onActionsChange={setClientActionsData}/>;
case "c_messages":   return <ClientMessagesView user={user} showToast={showToast}/>;
default: return <div style={{padding:40,color:C.secondary,fontStyle:"italic",display:"flex",alignItems:"center",gap:10}}><ClipboardList size={20}/> {view} — beschikbaar in volgende sprint</div>;
}
};
return(
<LangCtx.Provider value={language}>
<div key={themeKey} style={{display:"flex",height:"100vh",background:C.bg}}>
<GlobalStyles darkMode={darkMode}/>
<Sidebar user={user} view={view} setView={handleSetView} onLogout={onLogout} unreadCount={unreadCount} onNewEng={()=>setShowNewEng(true)} collapsed={sideCollapsed} setCollapsed={setSideCollapsed} pendingActionsCount={clientActionsData.filter(a=>a.status==="pending"||a.status==="open").length}/>
<div style={{flex:1,display:"flex",flexDirection:"column"}}>
<Topbar user={user} language={language} setLanguage={setLanguage} setView={handleSetView} unreadCount={unreadCount} onLogout={onLogout} darkMode={darkMode} toggleDark={toggleDark}/>
<main style={{flex:1,overflow:"auto",padding:"28px 32px",background:C.bg,color:C.text}} key={view+(detailEng?.id||"")}>
<div className="fu">{renderView()}</div>
</main>
</div>
{showSearch&&<GlobalSearch
  user={user} engData={engData} companyData={companyData}
  onClose={()=>setShowSearch(false)}
  setView={handleSetView}
  setDetailEng={setDetailEng}
  setDetailCompany={setDetailCompany}
  setDetailLead={setDetailLead}
/>}
{toast&&<Toast msg={toast} onClose={()=>setToast(null)}/>}
{showNewEng&&<NewEngagementModal user={user} onClose={()=>setShowNewEng(false)} onCreated={(eng)=>{setEngData(es=>[eng,...es]);}} showToast={showToast}/>}
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
{id:"4",tag:"COMPLIANCE",tagColor:C.indigo,title:"KKF jaaropgave: check actuele deadlines",body:"De Kamer van Koophandel Suriname heeft deadlines gepubliceerd voor jaaropgaven.",time:"Recent",dept:"BOTH",urgent:true,source:"KKF"},
{id:"5",tag:"OFFSHORE",tagColor:"#4A3C35",title:"Offshore kansen voor lokale toeleveranciers",body:"Nieuwe offshore ontdekkingen bieden groeikansen voor MKB-bedrijven.",time:"Recent",dept:"TC",urgent:false,source:"Energie Rapport"},
];

function StaffDashboard({user,setView,setDetailEng,engData,dbReady}){
const t=useT();
const [tasks,setTasks]=useState([]);
const [queueCount,setQueueCount]=useState(0);
const [overdueInvoices,setOverdueInvoices]=useState([]);
const [openActions,setOpenActions]=useState([]);
const [loading,setLoading]=useState(true);
const [newsFilter,setNewsFilter]=useState("ALL");
const [expandedNews,setExpandedNews]=useState(null);
const {news:allNews,loading:newsLoading}=useRealNews(user.dept);

// Derived from props (already loaded in AppShell)
const src=engData||[];
const eng=user.dept==="BOTH"?src:src.filter(e=>e.dept===user.dept);
const redEngs=eng.filter(e=>e.health==="red");
const healthPct=eng.length>0?Math.round((eng.filter(e=>e.health!=="red").length/eng.length)*100):100;

useEffect(()=>{
  const dept=user.dept==="BOTH"?null:user.dept;
  const today=new Date().toISOString().split("T")[0];

  Promise.all([
    // My tasks due today/soon
    supabase.from("tasks")
      .select("id,title,priority,status,due_date,engagement_id")
      .eq("status","open")
      .eq("assigned_to",user.id)
      .lte("due_date", new Date(Date.now()+3*86400000).toISOString())
      .order("due_date",{ascending:true})
      .limit(5),
    // Review queue count
    supabase.from("documents")
      .select("id",{count:"exact",head:true})
      .eq("review_status","pending"),
    // Overdue invoices
    supabase.from("invoices")
      .select("id,reference_code,amount,due_date,company_id")
      .eq("status","overdue")
      .order("due_date",{ascending:true})
      .limit(4),
    // Open client actions
    supabase.from("client_actions")
      .select("id,title,status,deadline,department,company_id")
      .eq("status","pending")
      .order("deadline",{ascending:true})
      .limit(5),
  ]).then(([{data:tk},{count:qc},{data:inv},{data:ca}])=>{
    setTasks(tk||[]);
    setQueueCount(qc||0);
    setOverdueInvoices(inv||[]);
    setOpenActions(ca||[]);
    setLoading(false);
  }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[user.id]);

const fmtDate=(d)=>{
  if(!d) return "—";
  const date=new Date(d);
  const diff=Math.ceil((date-new Date())/86400000);
  if(diff===0) return "Vandaag";
  if(diff===1) return "Morgen";
  if(diff<0) return `${Math.abs(diff)}d achterstallig`;
  return `${diff}d`;
};
const fmtAmt=(n)=>`SRD ${Number(n||0).toLocaleString()}`;

const news=allNews.filter(n=>newsFilter==="ALL"||(newsFilter==="urgent"&&n.urgent)||(newsFilter==="TC"&&(n.dept==="TC"||n.dept==="BOTH"))||(newsFilter==="FF"&&(n.dept==="FF"||n.dept==="BOTH")));
const tagIcon={WETGEVING:<Scale size={10}/>,MARKT:<TrendingUp size={10}/>,STRATEGIE:<Target size={10}/>,COMPLIANCE:<Shield size={10}/>,OFFSHORE:<Activity size={10}/>,CARICOM:<Globe size={10}/>,BELASTING:<Receipt size={10}/>};

if(!dbReady) return (
  <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column",gap:12}}>
    <div style={{width:32,height:32,border:`3px solid ${C.crimson}30`,borderTopColor:C.crimson,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
    <div style={{fontSize:13,color:C.secondary}}>Laden...</div>
  </div>
);

return(
<div>
  <PageHeader kicker={t("overview")} title={t("cmdCenter")}/>

  {/* ── KPI Strip ── */}
  <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr 1fr",gap:12,marginBottom:20}}>
    {/* Kritieke engagements */}
    <div style={{background:redEngs.length>0?C.redBg:C.greenBg,borderRadius:14,padding:"20px 22px",border:`1.5px solid ${redEngs.length>0?C.red:C.green}20`,position:"relative"}}>
      <div style={{position:"absolute",top:16,right:18}}><AlertTriangle size={18} color={redEngs.length>0?C.red:C.green} opacity={0.4}/></div>
      <div style={{fontSize:10,fontWeight:700,color:redEngs.length>0?C.red:C.green,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12,opacity:0.8}}>{t("healthLabel")}</div>
      <div style={{display:"flex",alignItems:"baseline",gap:6}}>
        <span style={{fontFamily:F.display,fontSize:44,fontWeight:600,color:redEngs.length>0?C.red:C.green,lineHeight:1}}>
          {String(redEngs.length).padStart(2,"0")}
        </span>
        <span style={{fontSize:12,color:redEngs.length>0?C.red:C.green,fontWeight:600,opacity:0.7}}>{t("criticalThresholds")}</span>
      </div>
      <div style={{marginTop:12,fontSize:11,fontWeight:700,color:redEngs.length>0?C.red:C.green,letterSpacing:"0.06em",textTransform:"uppercase",opacity:0.9}}>
        {redEngs.length>0?t("actionRequired"):"Alles stabiel"}
      </div>
    </div>

    {/* Engagement activiteit */}
    <div style={{background:C.surface,borderRadius:14,padding:"20px 22px",border:`1px solid ${C.border}`}}>
      <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>{t("exposureLabel")}</div>
      <div style={{display:"flex",alignItems:"baseline",gap:6,marginBottom:14}}>
        <span style={{fontFamily:F.display,fontSize:44,fontWeight:600,color:C.text,lineHeight:1}}>
          {String(eng.length).padStart(2,"0")}
        </span>
        <span style={{fontSize:12,color:C.secondary}}>{t("riskyDossiers")}</span>
      </div>
      {/* Health distribution bar */}
      <div style={{display:"flex",gap:3,height:8,borderRadius:4,overflow:"hidden",marginBottom:6}}>
        {eng.length>0?<>
          <div style={{flex:eng.filter(e=>e.health==="red").length||0.01,background:C.red,borderRadius:2}}/>
          <div style={{flex:eng.filter(e=>e.health==="amber").length||0.01,background:C.amber,borderRadius:2}}/>
          <div style={{flex:eng.filter(e=>e.health==="green"||!e.health).length||0.01,background:C.green,borderRadius:2}}/>
        </>:<div style={{flex:1,background:C.border,borderRadius:2}}/>}
      </div>
      <div style={{display:"flex",gap:10,fontSize:9,fontWeight:700}}>
        <span style={{color:C.red}}>{eng.filter(e=>e.health==="red").length} kritiek</span>
        <span style={{color:C.amber}}>{eng.filter(e=>e.health==="amber").length} amber</span>
        <span style={{color:C.green}}>{eng.filter(e=>e.health==="green"||!e.health).length} stabiel</span>
      </div>
    </div>

    {/* Gezondheidspercentage */}
    <div style={{background:C.darkAccent,borderRadius:14,padding:"20px 22px",position:"relative"}}>
      <div style={{fontSize:10,fontWeight:700,color:"rgba(240,235,228,0.65)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>{t("speedLabel")}</div>
      <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:10}}>
        <span style={{fontFamily:F.display,fontSize:44,fontWeight:600,color:C.onDark,lineHeight:1}}>{healthPct}</span>
        <span style={{fontFamily:F.display,fontSize:24,color:C.onDark,opacity:0.6}}>%</span>
      </div>
      <div style={{height:5,background:"rgba(255,255,255,.12)",borderRadius:3}}>
        <div style={{width:`${healthPct}%`,height:"100%",background:`linear-gradient(90deg,${C.green},#4ADE80)`,borderRadius:3,transition:"width .5s"}}/>
      </div>
      <div style={{fontSize:10,color:"rgba(240,235,228,0.65)",marginTop:8,fontWeight:600}}>{t("optimal")} · {t("onTrack")}</div>
    </div>
  </div>

  {/* ── Vandaag sectie ── */}
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:20}}>
    {[
      {l:"MIJN TAKEN",v:loading?"…":tasks.length,c:tasks.length>0?C.amber:C.green,bg:tasks.length>0?C.amberBg:C.greenBg,icon:<CheckSquare size={14}/>,click:()=>setView("tasks")},
      {l:"BEOORDELINGSWACHTRIJ",v:loading?"…":queueCount,c:queueCount>0?C.crimson:C.green,bg:queueCount>0?C.crimsonFaint:C.greenBg,icon:<ClipboardList size={14}/>,click:()=>setView("review")},
      {l:"ACHTERSTALLIGE FACTUREN",v:loading?"…":overdueInvoices.length,c:overdueInvoices.length>0?C.red:C.green,bg:overdueInvoices.length>0?C.redBg:C.greenBg,icon:<Receipt size={14}/>,click:()=>setView("invoices")},
      {l:"OPEN CLIËNTACTIES",v:loading?"…":openActions.length,c:openActions.length>0?C.amber:C.green,bg:openActions.length>0?C.amberBg:C.greenBg,icon:<Users size={14}/>,click:()=>setView("ca_tc")},
    ].map(k=>(
      <div key={k.l} onClick={k.click} style={{background:k.bg,borderRadius:12,padding:"14px 16px",border:`1px solid ${k.c}30`,cursor:"pointer",transition:"transform .1s"}}
        onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
        onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div style={{color:k.c,opacity:0.7}}>{k.icon}</div>
          <ChevronRight size={12} color={k.c} opacity={0.5}/>
        </div>
        <div style={{fontFamily:F.display,fontSize:28,fontWeight:600,color:k.c,lineHeight:1,marginBottom:4}}>{k.v}</div>
        <div style={{fontSize:9,fontWeight:700,color:k.c,letterSpacing:"0.1em",textTransform:"uppercase",opacity:0.8}}>{k.l}</div>
      </div>
    ))}
  </div>

  {/* ── Main content row ── */}
  <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:14,marginBottom:18}}>
    {/* Actieve engagements tabel */}
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07)"}}>
      <div style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h3 style={{margin:0,fontSize:13,fontWeight:700,color:C.text}}>{t("activeDossiers")}</h3>
        <button onClick={()=>setView("analyses")} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,fontWeight:700,color:C.crimson,display:"flex",alignItems:"center",gap:4}}>
          {t("viewAll")} <ChevronRight size={11}/>
        </button>
      </div>
      {eng.length===0?(
        <div style={{padding:"32px 20px",textAlign:"center",color:C.secondary,fontSize:12}}>Geen actieve engagements</div>
      ):(
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:C.warm50}}>
            {["NAAM",t("dept"),t("phase"),t("health")].map(h=>(
              <th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{eng.slice(0,5).map(e=>(
            <tr key={e.id} onClick={()=>setDetailEng(e)} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
              <td style={{padding:"13px 18px"}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{e.name}</div>
                <div style={{fontSize:10,color:C.secondary}}>{e.ref}</div>
              </td>
              <td style={{padding:"13px 18px"}}><DeptTag dept={e.dept}/></td>
              <td style={{padding:"13px 18px"}}><span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:C.bg,color:C.text,border:`1px solid ${C.border}`}}>{e.phase||"—"}</span></td>
              <td style={{padding:"13px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <HealthDot status={e.health}/>
                  <span style={{fontSize:10,fontWeight:700,color:e.health==="red"?C.red:e.health==="amber"?C.amber:C.green}}>
                    {e.health==="red"?t("critical"):e.health==="amber"?t("amber"):t("stable")}
                  </span>
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>

    {/* Rechter kolom: taken + wachtrij */}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {/* Mijn taken */}
      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",flex:1}}>
        <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:tasks.length>0?C.amberBg:C.greenBg}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <CheckSquare size={13} color={tasks.length>0?C.amber:C.green}/>
            <span style={{fontSize:12,fontWeight:700,color:tasks.length>0?C.amber:C.green}}>Mijn Taken</span>
          </div>
          <span style={{fontSize:10,fontWeight:700,color:tasks.length>0?C.amber:C.green}}>{loading?"…":tasks.length}</span>
        </div>
        {loading?(
          <div style={{padding:"20px",textAlign:"center",color:C.secondary,fontSize:11}}>Laden...</div>
        ):tasks.length===0?(
          <div style={{padding:"20px",textAlign:"center",color:C.secondary,fontSize:11}}>
            <CheckCircle size={20} color={C.green} style={{marginBottom:6,display:"block",margin:"0 auto 6px"}}/>
            Geen openstaande taken
          </div>
        ):tasks.map((tk,i)=>{
          const days=tk.due_date?Math.ceil((new Date(tk.due_date)-new Date())/86400000):null;
          const urgent=days!==null&&days<=1;
          return(
            <div key={tk.id} style={{padding:"10px 16px",borderTop:i>0?`1px solid ${C.border}`:"none",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tk.title}</div>
                <div style={{fontSize:9,fontWeight:700,color:urgent?C.red:C.secondary,marginTop:2}}>{fmtDate(tk.due_date)}</div>
              </div>
              <div style={{width:8,height:8,borderRadius:"50%",background:tk.priority==="high"?C.red:tk.priority==="normal"?C.amber:C.green,flexShrink:0,marginTop:4,marginLeft:8}}/>
            </div>
          );
        })}
      </div>

      {/* Wachtrij + TC/FF split */}
      <div style={{background:C.darkAccent,borderRadius:14,padding:"16px",color:C.onDark}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.12em",color:"rgba(240,235,228,0.65)",textTransform:"uppercase",marginBottom:10}}>WERELDWIJDE POLSSLAG</div>
        <p style={{fontFamily:F.display,fontSize:13,fontWeight:600,lineHeight:1.5,margin:"0 0 10px"}}>
          Geaggregeerd risico momenteel <span style={{color:redEngs.length>3?"#E87B7B":"#86EFAC"}}>{redEngs.length>3?"Verhoogd":"Stabiel"}</span>.
        </p>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
          {[{l:"TACTIGENT",v:eng.filter(e=>e.dept==="TC").length},{l:"FISCAL FUSE",v:eng.filter(e=>e.dept==="FF").length}].map(s=>(
            <div key={s.l}>
              <div style={{fontSize:8,color:"rgba(240,235,228,0.65)",fontWeight:700,marginBottom:3}}>{s.l}</div>
              <div style={{fontFamily:F.display,fontSize:22,fontWeight:600,color:CREAM}}>{s.v} <span style={{fontSize:11,opacity:0.6}}>actief</span></div>
            </div>
          ))}
        </div>
        {queueCount>0&&(
          <div onClick={()=>setView("review")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,.08)",cursor:"pointer",marginTop:4}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:C.crimson,animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:11,fontWeight:700,color:CREAM}}>{queueCount} in wachtrij</span>
            </div>
            <ChevronRight size={12} color="rgba(240,235,228,0.5)"/>
          </div>
        )}
      </div>
    </div>
  </div>

  {/* ── Achterstallige facturen row (if any) ── */}
  {overdueInvoices.length>0&&(
    <div style={{background:C.redBg,borderRadius:14,border:`1px solid ${C.red}30`,padding:"14px 18px",marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <AlertTriangle size={18} color={C.red}/>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:C.red}}>{overdueInvoices.length} Achterstallige Factuur{overdueInvoices.length!==1?"en":""}</div>
          <div style={{fontSize:11,color:C.red,opacity:0.8}}>
            Totaal: {fmtAmt(overdueInvoices.reduce((s,i)=>s+Number(i.amount||0),0))} · Oudste: {fmtDate(overdueInvoices[0]?.due_date)}
          </div>
        </div>
      </div>
      <button onClick={()=>setView("invoices")}
        style={{padding:"7px 14px",borderRadius:9,background:C.red,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>
        <Receipt size={12}/> Bekijk facturen
      </button>
    </div>
  )}

  {/* ── News Feed ── */}
  <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07)"}}>
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
          <button key={v} onClick={()=>setNewsFilter(v)}
            style={{padding:"4px 11px",borderRadius:16,border:`1.5px solid ${newsFilter===v?C.crimson:C.border}`,background:newsFilter===v?C.crimson:"transparent",color:newsFilter===v?CREAM:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>{l}
          </button>
        ))}
      </div>
    </div>

    {newsLoading&&(
      <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
        {[1,2,3].map(i=>(<div key={i} className="skeleton" style={{height:16,borderRadius:6,width:i===1?"90%":i===2?"70%":"80%"}}/>))}
        <div style={{fontSize:10,color:C.muted,textAlign:"center",paddingTop:4}}>Actueel nieuws ophalen...</div>
      </div>
    )}

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
                <span style={{fontSize:10,color:C.muted}}>{news[0].source} · {news[0].time}</span>
              </div>
              <div style={{fontFamily:F.display,fontSize:17,fontWeight:600,color:C.text,lineHeight:1.4,marginBottom:8}}>{news[0].title}</div>
              <div style={{fontSize:12,color:C.secondary,lineHeight:1.7,display:expandedNews===news[0].id?"block":"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{news[0].body}</div>
            </div>
            <div style={{width:80,height:64,borderRadius:10,background:news[0].dept==="TC"?C.crimsonFaint:news[0].dept==="FF"?"#F0EDE8":C.amberBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {news[0].dept==="TC"?<Target size={28} color={C.crimson}/>:news[0].dept==="FF"?<Scale size={28} color={C.taupe}/>:<Layers size={28} color={C.amber}/>}
            </div>
          </div>
        </div>
      </div>
    )}

    <div style={{padding:"0 20px"}}>
      {!newsLoading&&news.slice(1).map((item,i)=>(
        <div key={item.id} onClick={()=>setExpandedNews(expandedNews===item.id?null:item.id)}
          style={{padding:"14px 0",borderTop:`1px solid ${C.border}`,cursor:"pointer",display:"grid",gridTemplateColumns:"auto 1fr auto",gap:14,alignItems:"start"}}>
          <div style={{width:36,height:36,borderRadius:9,background:`${item.tagColor}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
            {item.tag==="WETGEVING"?<Scale size={16} color={item.tagColor}/>:item.tag==="MARKT"?<TrendingUp size={16} color={item.tagColor}/>:item.tag==="STRATEGIE"?<Target size={16} color={item.tagColor}/>:item.tag==="COMPLIANCE"?<Shield size={16} color={item.tagColor}/>:<Activity size={16} color={item.tagColor}/>}
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexWrap:"wrap"}}>
              <span style={{fontSize:9,fontWeight:700,color:item.tagColor,letterSpacing:"0.08em"}}>{item.tag}</span>
              {item.urgent&&<span style={{fontSize:8,fontWeight:700,color:C.red,background:C.redBg,padding:"2px 6px",borderRadius:3}}>URGENT</span>}
              <span style={{fontSize:9,color:C.muted}}>{item.source} · {item.time}</span>
            </div>
            <div style={{fontSize:13,fontWeight:600,color:C.text,lineHeight:1.4}}>{item.title}</div>
            {expandedNews===item.id&&<div style={{fontSize:12,color:C.secondary,lineHeight:1.7,marginTop:6}}>{item.body}</div>}
          </div>
          <div style={{color:C.secondary,marginTop:6}}>
            {expandedNews===item.id?<ChevronLeft size={14} style={{transform:"rotate(90deg)"}}/>:<ChevronRight size={14}/>}
          </div>
        </div>
      ))}
    </div>

    <div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.warm50}}>
      <span style={{fontSize:10,color:C.secondary}}>Bron: CBvS, KKF, Tactigent Research</span>
      <button style={{fontSize:10,fontWeight:700,color:C.crimson,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
        <RefreshCw size={10}/> Vernieuwen
      </button>
    </div>
  </div>
</div>
);
}



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
<div style={{background:C.darkAccent,borderRadius:14,padding:"16px",color:C.onDark}}>
<div style={{fontFamily:F.display,fontSize:14,fontWeight:600,marginBottom:7}}>Strategisch Focus</div>
<p style={{fontSize:10,color:C.onDark_DIM,lineHeight:1.6,margin:"0 0 12px"}}>Prioriteer dossiers met kritieke status in Fiscal Fuse voor de kwartaalafsluiting.</p>
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
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)"}}>
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

// ─── NEW ENGAGEMENT MODAL ────────────────────────────────────────────────────
// CEO/admin creates a project, assigns dept + staff member + client
function NewEngagementModal({user,onClose,onCreated,showToast}){
const [name,setName]=useState("");
const [dept,setDept]=useState("TC");
const [phase,setPhase]=useState("Intake");
const [assignedTo,setAssignedTo]=useState("");
const [clientId,setClientId]=useState("");
const [saving,setSaving]=useState(false);
const [staff,setStaff]=useState([]);
const [clients,setClients]=useState([]);
const [templates,setTemplates]=useState([]);
const [selectedTemplate,setSelectedTemplate]=useState("");
const [dropLoading,setDropLoading]=useState(true);

// Load staff and clients from Supabase
useEffect(()=>{
  const load=async()=>{
    setDropLoading(true);
    try{
      // Load staff from permanent view
      const {data:staffData}=await supabase
        .from("v_staff_dropdown")
        .select("id,full_name,department,title,avatar_initials");
      setStaff(staffData||[]);
      // Load clients directly from companies (no view)
      const {data:compData}=await supabase
        .from("companies")
        .select("id,name,department,portal_user_id")
        .order("name");
      setClients((compData||[]).map(c=>({
        id: c.id,
        company_id: c.id,
        full_name: c.name+(c.portal_user_id?" ✓":""),
        department: c.department,
        has_portal: !!c.portal_user_id,
        portal_user_id: c.portal_user_id,
        avatar_initials: (c.name||"??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
      })));
      // Load task templates
      const {data:tmplData}=await supabase
        .from("task_templates")
        .select("id,name,department,description,items")
        .order("name");
      setTemplates(tmplData||[]);
    }catch(e){ console.warn("load error",e); }
    finally{ setDropLoading(false); }
  };
  load();
},[]);

const filteredStaff=staff.filter(s=>s.department===dept||s.department==="BOTH");
const phases=dept==="TC"?TC_PHASES:FF_PHASES;
const typeLabel=dept==="TC"?"Project":"Dossier";

const submit=async()=>{
  if(!name.trim()||saving)return;
  setSaving(true);
  try{
    const selectedClient=clients.find(c=>c.id===clientId);
    // company_id for engagement (required NOT NULL)
    const companyId=selectedClient?.company_id||'00000000-0000-0000-0000-000000000000';
    // client_id = portal_user_id only (must be a user_profiles UUID or null)
    const portalUserId=selectedClient?.portal_user_id||null;

    const {data,error}=await supabase
      .from("engagements")
      .insert({
        name:name.trim(),
        department:dept,
        type:dept==="TC"?"project":"matter",
        phase,
        status:"active",
        health:"green",
        assigned_to:assignedTo||null,
        client_id:portalUserId,
        company_id:companyId,
      })
      .select("id,name,department,phase,status,health,company_id,assigned_to")
      .single();

    if(error) throw new Error(error.message||error.details||JSON.stringify(error));

    const clientName=selectedClient?.full_name||"—";
    const staffMember=staff.find(s=>s.id===assignedTo);

    // Create tasks from selected template
    if(selectedTemplate && data?.id){
      const tmpl=templates.find(t=>t.id===selectedTemplate);
      if(tmpl?.items?.length>0){
        const now=new Date();
        const taskRows=tmpl.items.map(item=>({
          title:item.title,
          priority:item.priority||"normal",
          status:"open",
          engagement_id:data.id,
          department:dept,
          due_date:item.due_days?new Date(now.getTime()+item.due_days*86400000).toISOString().split("T")[0]:null,
          assigned_to:assignedTo||null,
        }));
        supabase.from("tasks").insert(taskRows).then(({error:te})=>{
          if(te) console.warn("Template tasks insert:",te.message);
        });
      }
    }

    onCreated({
      id:data.id,
      ref:`${dept}-${data.id.slice(0,4).toUpperCase()}`,
      name:data.name,
      dept:data.department,
      phase:data.phase,
      status:data.status,
      health:data.health,
      client:clientName,
      company_id:data.company_id,
      assignee:staffMember?.avatar_initials||"—",
    });
    showToast(`${typeLabel} "${name}" aangemaakt ✓`);
    setSelectedTemplate("");
    onClose();
  }catch(e){
    console.error("Engagement insert failed:",e);
    const errMsg = e?.message || (e?.error?.message) || "Onbekende DB fout";
    showToast(`Fout: ${errMsg}`);
  }finally{ setSaving(false); }
};

useEffect(()=>{
  const h=e=>{if(e.key==="Escape")onClose();};
  window.addEventListener("keydown",h);
  document.body.classList.add("modal-open");
  return()=>{ window.removeEventListener("keydown",h); document.body.classList.remove("modal-open"); };
},[]);

return(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,pointerEvents:"auto",}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:20,width:700,maxWidth:"96vw",maxHeight:"92vh",boxShadow:"0 4px 32px rgba(0,0,0,.13),0 1px 6px rgba(0,0,0,.08)",fontFamily:F.body,display:"flex",flexDirection:"column"}}>
  {/* Header */}
  <div style={{padding:"14px 20px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
    <div>
      <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:4}}>CEO — Nieuw aanmaken</div>
      <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Nieuw {dept==="TC"?"Project":"Dossier"}</div>
    </div>
    <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.secondary}}><X size={14}/></button>
  </div>

  <div style={{overflowY:"auto",padding:"20px 22px",display:"flex",flexDirection:"column",gap:16}}>
    {/* Dept toggle */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>AFDELING</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["TC","Tactigent","Project"],["FF","Fiscal Fuse","Dossier"]].map(([d,label,type])=>(
          <div key={d} onClick={()=>{setDept(d);setAssignedTo("");setPhase(d==="TC"?TC_PHASES[0]:FF_PHASES[0]);}}
            style={{padding:"12px 14px",borderRadius:10,border:`2px solid ${dept===d?C.crimson:C.border}`,background:dept===d?C.crimsonFaint:C.bg,cursor:"pointer",transition:"border-color .15s,background .15s"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <div style={{width:28,height:28,borderRadius:7,background:dept===d?C.crimson:C.warm50,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:9,fontWeight:700,color:dept===d?CREAM:C.secondary}}>{d}</span>
              </div>
              <div style={{fontSize:13,fontWeight:700,color:C.text}}>{label}</div>
            </div>
            <div style={{fontSize:10,color:C.secondary}}>{type}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Template selector */}
    {templates.length>0&&(
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>TAKENPAKKET TEMPLATE</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
        {templates.filter(t=>t.department===dept||t.department==="BOTH").map(t=>(
          <button key={t.id} onClick={()=>setSelectedTemplate(selectedTemplate===t.id?"":t.id)}
            title={t.description}
            style={{
              padding:"7px 13px",borderRadius:9,fontSize:11,fontWeight:selectedTemplate===t.id?700:400,
              border:`1.5px solid ${selectedTemplate===t.id?C.crimson:C.border}`,
              background:selectedTemplate===t.id?C.crimsonFaint:C.bg,
              color:selectedTemplate===t.id?C.crimson:C.secondary,
              cursor:"pointer",display:"flex",alignItems:"center",gap:6,
              transition:"all .15s",
            }}>
            <CheckSquare size={11} style={{opacity:selectedTemplate===t.id?1:0.4}}/>
            {t.name}
            {t.items?.length>0&&<span style={{fontSize:9,opacity:0.6}}>({t.items.length} taken)</span>}
          </button>
        ))}
      </div>
      {selectedTemplate&&(()=>{
        const tmpl=templates.find(t=>t.id===selectedTemplate);
        return tmpl?.items?.length>0?(
          <div style={{marginTop:8,padding:"8px 12px",borderRadius:8,background:C.warm50,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:9,fontWeight:700,color:C.secondary,marginBottom:5}}>TAKEN IN TEMPLATE:</div>
            {(tmpl.items||[]).map((item,i)=>(
              <div key={i} style={{fontSize:11,color:C.text,display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:item.priority==="high"?C.red:item.priority==="normal"?C.amber:C.green,flexShrink:0}}/>
                {item.title} <span style={{color:C.muted,fontSize:10}}>+{item.due_days}d</span>
              </div>
            ))}
          </div>
        ):null;
      })()}
    </div>
    )}

    {/* Name */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{dept==="TC"?"PROJECTNAAM":"DOSSIERNAAM"} <span style={{color:C.crimson}}>*</span></div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder={dept==="TC"?"Bijv. Jaarplan 2026":"Bijv. Belastingaangifte 2025"}
        style={{width:"100%",padding:"10px 14px",borderRadius:9,border:`1.5px solid ${name.length>2?C.crimson:C.border}`,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:F.body,background:C.bg,color:C.text,transition:"border-color .15s"}}/>
    </div>

    {/* Phase */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>STARTFASE</div>
      <select value={phase} onChange={e=>setPhase(e.target.value)}
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,fontFamily:F.body}}>
        {phases.map(p=><option key={p} value={p}>{p}</option>)}
      </select>
    </div>

    {/* Assign staff */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>TOEWIJZEN AAN MEDEWERKER</div>
      {filteredStaff.length===0?(
        <div style={{fontSize:11,color:C.muted,padding:"10px 14px",background:C.warm50,borderRadius:8}}>
          Geen {dept} medewerkers gevonden. Controleer of de accounts zijn aangemaakt.
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {filteredStaff.map(s=>(
            <div key={s.id} onClick={()=>setAssignedTo(s.id===assignedTo?"":s.id)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,border:`1.5px solid ${assignedTo===s.id?C.crimson:C.border}`,background:assignedTo===s.id?C.crimsonFaint:C.bg,cursor:"pointer",transition:"border-color .15s,background .15s"}}>
              <Avatar initials={s.avatar_initials||"?"} size={30} bg={s.department==="TC"?C.crimson:C.taupe}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:C.text}}>{s.full_name}</div>
                <div style={{fontSize:10,color:C.secondary}}>{s.title||s.department}</div>
              </div>
              {assignedTo===s.id&&<CheckCircle size={14} color={C.crimson}/>}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Assign client */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>KOPPEL AAN CLIËNT <span style={{color:C.muted,fontWeight:400,textTransform:"none",fontSize:9}}>(optioneel)</span></div>
      <select value={clientId} onChange={e=>setClientId(e.target.value)} disabled={dropLoading}
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,fontFamily:F.body}}>
        {dropLoading
          ? <option disabled>Laden...</option>
          : <>
              <option value="">— Geen cliënt koppelen —</option>
              {clients.map(c=><option key={c.id} value={c.id}>{c.full_name}</option>)}
            </>
        }
      </select>
    </div>
  </div>

  {/* Footer */}
  <div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0,background:C.surface}}>
    <button onClick={submit} disabled={!name.trim()||saving}
      style={{flex:1,padding:"11px",borderRadius:10,background:name.trim()?C.crimson:"#D6D3CE",color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:name.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:name.trim()?"0 4px 12px rgba(139,26,43,.24)":"none",transition:"background .15s"}}>
      <Plus size={14}/>{saving?"Aanmaken...":`${dept==="TC"?"Project":"Dossier"} aanmaken`}
    </button>
    <button onClick={onClose} style={{padding:"11px 18px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
  </div>
</div>
</div>
);
}

function EngagementList({user,dept,engData,setDetailEng}){
const src=engData||ENGAGEMENTS_INIT;
const eng=src.filter(e=>e.dept===dept&&(user.dept==="BOTH"||e.dept===user.dept));
return(
<div>
<PageHeader kicker={dept==="TC"?"Tactigent Consultancy":"Fiscal Fuse"} title={dept==="TC"?"Projecten":"Dossiers"}/>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)"}}>
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
const [messages,setMessages]=useState([]);

// Load messages from DB
useEffect(()=>{
  if(!eng.id) return;
  supabase.from("messages")
    .select("id,body,author_id,author_name,author_initials,created_at,visible_to_client")
    .eq("engagement_id",eng.id)
    .order("created_at",{ascending:true})
    .then(({data})=>{
      if(data?.length) setMessages(data.map(m=>({
        id:m.id,
        body:m.body,
        author:m.author_name||"Medewerker",
        avatar:m.author_initials||"ME",
        time:new Date(m.created_at).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}),
        visible:m.visible_to_client,
        isMe:m.author_id===user.id,
      })));
    }).catch(e=>console.warn("DB [tasks]:", e?.message||e));
},[eng.id]);
const [localTasks,setLocalTasks]=useState([]);
const [localActions,setLocalActions]=useState([]);
const [showTaskForm,setShowTaskForm]=useState(false);
const [showTemplatePicker,setShowTemplatePicker]=useState(false);
const [showNewAction,setShowNewAction]=useState(false);
const [expandedTask,setExpandedTask]=useState(null);
const [newTaskTitle,setNewTaskTitle]=useState(""); const [newTaskPrio,setNewTaskPrio]=useState("normal"); const [newTaskDue,setNewTaskDue]=useState("");

// Load tasks + client actions from DB
useEffect(()=>{
  if(!eng.id) return;
  // Load tasks (no join — fetch assignee profiles separately)
  supabase.from("tasks")
    .select("id,title,priority,status,due_date,assigned_to")
    .eq("engagement_id",eng.id)
    .order("created_at",{ascending:true})
    .then(async ({data})=>{
      const tasks=data||[];
      const assignedIds=[...new Set(tasks.map(t=>t.assigned_to).filter(Boolean))];
      let nameMap={};
      if(assignedIds.length>0){
        const {data:profiles}=await supabase
          .from("user_profiles")
          .select("id,full_name,avatar_initials")
          .in("id",assignedIds);
        (profiles||[]).forEach(p=>{nameMap[p.id]=p;});
      }
      if(tasks.length) setLocalTasks(tasks.map(t=>({
        id:t.id, title:t.title, priority:t.priority||"normal",
        status:t.status||"open",
        due:t.due_date?new Date(t.due_date).toLocaleDateString("nl-SR",{day:"2-digit",month:"short"}):"—",
        assignee:nameMap[t.assigned_to]?.avatar_initials||"—",
        subtasks:[],
      })));
    }).catch(e=>console.warn("DB [tasks]:", e?.message||e));
  // Load client actions
  supabase.from("client_actions")
    .select("id,title,description,action_type,status,deadline,is_visible_to_client")
    .eq("engagement_id",eng.id)
    .order("created_at",{ascending:false})
    .then(({data})=>{
      if(data?.length) setLocalActions(data.map(a=>({
        id:a.id, title:a.title, desc:a.description||"",
        type:a.action_type, status:a.status,
        deadline:a.deadline?new Date(a.deadline).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—",
        visible:a.is_visible_to_client,
      })));
    }).catch(e=>console.warn("DB [client_actions]:", e?.message||e));
},[eng.id]);
const liveEng=(engData||[]).find(e=>e.id===eng.id)||eng;
const updateEng=async(changes)=>{
if(setEngData) setEngData(es=>es.map(e=>e.id===eng.id?{...e,...changes}:e));
try { await updateEngagement(eng.id, changes); } catch(e){ console.warn("updateEng failed:",e.message); }
};

// ── Add to Beoordelingswachtrij directly ──────────────────────────────────
const [addingToQueue,setAddingToQueue]=useState(false);
const [inQueue,setInQueue]=useState(false);
const addToReviewQueue=async()=>{
  setAddingToQueue(true);
  try{
    // First set status to In Review
    await updateEng({status:"In Review"});
    // Then directly insert into documents table as pending review
    const {data,error}=await supabase.from("documents").insert({
      name:"Review: "+eng.name,
      department:eng.dept||eng.department,
      visibility:"internal",
      review_status:"pending",
      review_type:"engagement",
      source_id:eng.id,
      company_id:eng.company_id||"00000000-0000-0000-0000-000000000000",
      engagement_id:eng.id,
    }).select("id").single();
    if(error) throw new Error(error.message||JSON.stringify(error));
    setInQueue(true);
    showToast(`"${eng.name}" toegevoegd aan Beoordelingswachtrij ✓`);
  }catch(e){
    console.error("addToReviewQueue:",e);
    showToast("Fout: "+( e?.message||"Onbekend"));
  }
  setAddingToQueue(false);
};
const phases=eng.dept==="TC"?TC_PHASES:FF_PHASES;
const phaseIdx=Math.max(0,phases.indexOf(liveEng.phase));
const sendMsg=async()=>{
  if(!newMsg.trim()) return;
  const body=newMsg.trim();
  const optimistic={id:`m${Date.now()}`,author:user.name||"Medewerker",avatar:user.avatar||"ME",time:"Nu",body,visible:vis};
  setMessages(m=>[...m,optimistic]);
  setNewMsg("");
  try{
    await supabase.from("messages").insert({
      body, engagement_id:eng.id,
      author_id:user.id,
      author_name:user.name||"Medewerker",
      author_initials:user.avatar||"ME",
      visible_to_client:vis,
    });
    showToast("Bericht verzonden");
  }catch(e){ showToast("Verzenden mislukt: "+e.message); }
};
const addTask=async()=>{
  if(!newTaskTitle.trim()) return;
  const localTask={id:`t${Date.now()}`,title:newTaskTitle,priority:newTaskPrio,
    due:newTaskDue?new Date(newTaskDue).toLocaleDateString("nl-SR",{day:"2-digit",month:"short"}):"—",
    status:"open",assignee:user.avatar||"ME",subtasks:[]};
  setLocalTasks(ts=>[...ts,localTask]);
  setNewTaskTitle("");setNewTaskDue("");setNewTaskPrio("normal");setShowTaskForm(false);
  showToast("Taak aangemaakt");
  try{
    const {data}=await supabase.from("tasks").insert({
      title:newTaskTitle.trim(), priority:newTaskPrio, status:"open",
      engagement_id:eng.id,
      department:eng.dept||"TC",
      due_date:newTaskDue||null,
      assigned_to:user.id||null,
    }).select("id").single();
    if(data?.id) setLocalTasks(ts=>ts.map(t=>t.id===localTask.id?{...t,id:data.id}:t));
  }catch(e){ console.warn("addTask DB:",e.message); }
};
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
const toggleTask=async(id)=>{
  const tk=localTasks.find(t=>t.id===id);
  if(!tk) return;
  const newStatus=tk.status==="done"?"open":"done";
  setLocalTasks(ts=>ts.map(t=>t.id===id?{...t,status:newStatus}:t));
  try{ await supabase.from("tasks").update({status:newStatus}).eq("id",id); }catch(e){}
};
const toggleSubtask=(taskId,subId)=>setLocalTasks(ts=>ts.map(t=>t.id===taskId?{...t,subtasks:(t.subtasks||[]).map(s=>s.id===subId?{...s,status:s.status==="done"?"open":"done"}:s)}:t));
return(
<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
<button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:C.secondary,fontSize:12,fontWeight:600,padding:0}}>
<ChevronLeft size={15}/> {t("back")}
</button>
{(user.role==="super_admin"||user.role==="staff")&&(
<button onClick={async()=>{
  if(!window.confirm(`Weet je zeker dat je "${eng.name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) return;
  try{
    await supabase.from("engagements").update({status:"deleted"}).eq("id",eng.id);
    // Soft delete via status, then hard delete
    const {error}=await supabase.from("engagements").update({}).eq("id","__force_delete__");
    await fetch(`${SB_URL}/rest/v1/engagements?id=eq.${eng.id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`,"Content-Type":"application/json"}});
    if(setEngData) setEngData(es=>es.filter(e=>e.id!==eng.id));
    showToast(`"${eng.name}" verwijderd`);
    onBack();
  }catch(e){ showToast("Fout bij verwijderen: "+e.message); }
}} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,border:`1px solid ${C.red}40`,background:C.redBg,color:C.red,fontSize:11,fontWeight:700,cursor:"pointer"}}>
<X size={12}/> Verwijderen
</button>
)}
</div>
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
{/* ── Beoordelingswachtrij knop ─────────────────────── */}
<button
  onClick={addToReviewQueue}
  disabled={addingToQueue||inQueue}
  style={{
    display:"flex",alignItems:"center",gap:7,
    padding:"9px 14px",borderRadius:10,width:"100%",justifyContent:"center",
    background:inQueue?C.greenBg:addingToQueue?C.warm50:C.indigo,
    border:`1.5px solid ${inQueue?C.green:addingToQueue?C.border:"#6366F1"}`,
    color:inQueue?C.green:addingToQueue?C.secondary:CREAM,
    fontSize:11,fontWeight:700,
    cursor:inQueue||addingToQueue?"default":"pointer",
    transition:"all .2s",
  }}>
  {addingToQueue
    ? <><div style={{width:11,height:11,border:"2px solid rgba(0,0,0,.15)",borderTopColor:C.secondary,borderRadius:"50%",animation:"spin 1s linear infinite"}}/> Toevoegen...</>
    : inQueue
    ? <><CheckCircle size={13}/> In Wachtrij ✓</>
    : <><ClipboardList size={13}/> Voeg toe aan Wachtrij</>
  }
</button>
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
{[{id:"tasks",label:`${t("internalTasks")} (${localTasks.length})`,Icon:Lock,bc:C.blueBg,bt:C.indigo},{id:"actions",label:`Cliëntacties (${localActions.length})`,Icon:CheckSquare,bc:C.greenBg,bt:C.green}].map(tb=>(
<button key={tb.id} onClick={()=>setActiveTab(tb.id)} style={{flex:1,padding:"8px 12px",borderRadius:8,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,background:activeTab===tb.id?C.surface:"transparent",color:activeTab===tb.id?C.text:C.secondary,fontWeight:activeTab===tb.id?700:400,fontSize:12,transition:"background .15s,color .15s,border-color .15s,opacity .15s",boxShadow:activeTab===tb.id?"0 1px 4px rgba(0,0,0,.07)":"none"}}>
<tb.Icon size={13}/>{tb.label}
<span style={{fontSize:8,background:tb.bc,color:tb.bt,padding:"2px 6px",borderRadius:4,fontWeight:700}}>{tb.id==="tasks"?"INTERN":"PORTAAL"}</span>
</button>
))}
</div>
{activeTab==="tasks"&&(
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)"}}>
{/* Header */}
<div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.blueBg}}>
<div style={{display:"flex",alignItems:"center",gap:8}}><Lock size={13} color="#6366F1"/><span style={{fontSize:11,fontWeight:700,color:C.indigo}}>Interne Taken — NIET zichtbaar voor cliënten</span></div>
<div style={{display:"flex",gap:7}}>
<button onClick={()=>setShowTemplatePicker(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:7,background:C.indigo,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer"}}><Layers size={11}/> Van template</button>
<button onClick={()=>setShowTaskForm(v=>!v)} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 11px",borderRadius:7,background:"transparent",color:C.indigo,border:`1.5px solid ${C.blue||C.indigo}`,fontSize:10,fontWeight:700,cursor:"pointer"}}><Plus size={11}/> Leeg</button>
</div>
</div>

{/* Template Picker Modal */}
{showTemplatePicker&&(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,pointerEvents:"auto",}} onClick={()=>setShowTemplatePicker(false)}>
<div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:20,width:560,maxWidth:"95vw",boxShadow:"0 32px 80px rgba(58,46,40,.28)",overflow:"hidden",fontFamily:F.body,display:"flex",flexDirection:"column",boxShadow:"0 4px 32px rgba(0,0,0,.13),0 1px 6px rgba(0,0,0,.08),inset 0 0 0 1px rgba(0,0,0,.05)"}}>
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
<div style={{marginTop:10,fontSize:9,fontWeight:700,color:tpl.color,letterSpacing:"0.07em"}}>{(tpl.items||[]).length} SUBTAKEN INBEGREPEN -></div>
</div>
))}
</div>
</div>
</div>
</div>
)}

{/* Quick task form */}
{showTaskForm&&(
<div style={{padding:"14px 16px",background:C.warm50,borderBottom:`1px solid ${C.border}`,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
<input value={newTaskTitle} onChange={e=>setNewTaskTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Taakomschrijving..." style={{flex:2,minWidth:180,padding:"8px 11px",borderRadius:8,border:`1.5px solid ${C.blue||C.indigo}`,fontSize:12,outline:"none"}}/>
<select value={newTaskPrio} onChange={e=>setNewTaskPrio(e.target.value)} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:11,outline:"none",cursor:"pointer"}}>
{[["low","Laag"],["normal","Normaal"],["high","Hoog"],["critical","Kritiek"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
</select>
<input type="date" value={newTaskDue} onChange={e=>setNewTaskDue(e.target.value)} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:11,outline:"none"}}/>
<button onClick={addTask} style={{padding:"7px 14px",borderRadius:7,background:C.indigo,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>Opslaan</button>
<button onClick={()=>setShowTaskForm(false)} style={{padding:"7px 10px",borderRadius:7,background:"transparent",color:C.secondary,border:`1px solid ${C.border}`,fontSize:11,cursor:"pointer"}}><X size={12}/></button>
</div>
)}

{/* Empty state */}
{localTasks.length===0&&!showTaskForm&&(
<div style={{padding:"32px 24px",textAlign:"center"}}>
<Layers size={28} color={C.mushroom} style={{marginBottom:10}}/>
<div style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:C.text,marginBottom:4}}>Nog geen taken</div>
<div style={{fontSize:12,color:C.secondary,marginBottom:14}}>Kies een template of maak een losse taak aan.</div>
<button onClick={()=>setShowTemplatePicker(true)} style={{padding:"8px 18px",borderRadius:9,background:C.indigo,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>
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
<div style={{display:"flex",alignItems:"center",gap:6}}>
<div onClick={()=>toggleTask(tk.id)} style={{width:18,height:18,borderRadius:5,border:`2px solid ${tk.status==="done"?C.green:C.border}`,background:tk.status==="done"?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
{tk.status==="done"&&<Check size={11} color={CREAM}/>}
</div>
<button onClick={async()=>{
  setLocalTasks(ts=>ts.filter(t=>t.id!==tk.id));
  showToast("Taak verwijderd");
  try{ await fetch(`${SB_URL}/rest/v1/tasks?id=eq.${tk.id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`}}); }catch(e){}
}} title="Verwijder taak" style={{width:16,height:16,borderRadius:4,border:"none",background:"transparent",cursor:"pointer",color:C.mushroom,display:"flex",alignItems:"center",justifyContent:"center",padding:0,opacity:0.5}} onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}>
<X size={10}/>
</button>
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:13,fontWeight:600,color:tk.status==="done"?C.secondary:C.text,textDecoration:tk.status==="done"?"line-through":"none",marginBottom:subTotal>0?5:0}}>{tk.title}</div>
{subTotal>0&&(
<div style={{display:"flex",alignItems:"center",gap:8}}>
{/* Progress bar */}
<div style={{flex:1,maxWidth:120,height:4,borderRadius:2,background:C.mushroom}}>
<div style={{width:`${pctDone}%`,height:"100%",background:pctDone===100?C.green:C.indigo,borderRadius:2,transition:"width .3s"}}/>
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
<button onClick={()=>setExpandedTask(isExpanded?null:tk.id)} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:6,background:isExpanded?C.blueBg:"transparent",border:`1px solid ${isExpanded?"#6366F1":C.border}`,color:isExpanded?C.indigoDark:C.secondary,fontSize:10,fontWeight:700,cursor:"pointer",transition:"background .15s,border-color .15s"}}>
<ChevronRight size={11} style={{transform:isExpanded?"rotate(90deg)":"none",transition:"transform .2s"}}/>
{subTotal} subtaken
</button>
)}
</div>
</div>

{/* Expandable subtasks */}
{isExpanded&&subTotal>0&&(
<div style={{background:C.warm50,borderTop:`1px solid #E0E7FF`,padding:"8px 16px 12px 48px"}}>
<div style={{fontSize:9,fontWeight:700,color:C.indigo,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8}}>SUBTAKEN</div>
{(tk.subtasks||[]).map(sub=>(
<div key={sub.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,marginBottom:4,background:sub.status==="done"?"rgba(21,128,61,.06)":"rgba(255,255,255,.7)",border:`1px solid ${sub.status==="done"?"rgba(21,128,61,.15)":"rgba(99,102,241,.12)"}`}}>
<div onClick={()=>toggleSubtask(tk.id,sub.id)} style={{width:15,height:15,borderRadius:4,border:`2px solid ${sub.status==="done"?C.green:C.indigo}`,background:sub.status==="done"?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
{sub.status==="done"&&<Check size={9} color={CREAM}/>}
</div>
<span style={{fontSize:12,color:sub.status==="done"?C.secondary:C.text,textDecoration:sub.status==="done"?"line-through":"none",flex:1,fontWeight:sub.status==="done"?400:500}}>{sub.title}</span>
{sub.status==="done"
?<span style={{fontSize:9,fontWeight:700,color:C.green,background:C.greenBg,padding:"2px 7px",borderRadius:4}}>KLAAR</span>
:<span style={{fontSize:9,fontWeight:700,color:C.indigo,background:C.blueBg,padding:"2px 7px",borderRadius:4}}>OPEN</span>}
</div>
))}
<div style={{marginTop:8,fontSize:10,color:C.blue||C.indigo,fontWeight:700}}>
{pctDone===100?"✓ Alle subtaken voltooid":`${subTotal-subDone} subtaken resterend`}
</div>
</div>
)}
</div>
);})}
</div>
)}
{activeTab==="actions"&&(
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)"}}>
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
<div style={{display:"flex",gap:5}}>
{a.status!=="completed"&&(
<button onClick={async()=>{
  setLocalActions(as=>as.map(x=>x.id===a.id?{...x,status:"completed"}:x));
  try{ await supabase.from("client_actions").update({status:"completed"}).eq("id",a.id); }catch(e){}
  showToast("Actie voltooid ✓");
}} style={{fontSize:9,fontWeight:700,color:C.green,background:C.greenBg,border:"none",borderRadius:5,padding:"3px 8px",cursor:"pointer"}}>
Markeer voltooid
</button>
)}
<button onClick={async()=>{
  if(!window.confirm(`Cliëntactie "${a.title}" verwijderen?`)) return;
  setLocalActions(as=>as.filter(x=>x.id!==a.id));
  try{ await fetch(`${SB_URL}/rest/v1/client_actions?id=eq.${a.id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`}}); }catch(e){}
  showToast("Cliëntactie verwijderd");
}} style={{fontSize:9,fontWeight:700,color:C.red,background:C.redBg,border:"none",borderRadius:5,padding:"3px 8px",cursor:"pointer"}}>Verwijder</button>
</div>
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

// ─── TEAM MEMBERS HOOK ───────────────────────────────────────────────────────
// Returns all staff + clients from DB for assignment dropdowns
function useTeamMembers(dept){
  const [members,setMembers]=useState([]);
  const [clients,setClients]=useState([]);
  useEffect(()=>{
    supabase.from("v_staff_dropdown")
      .select("id,full_name,role,department,avatar_initials")
      .then(({data})=>setMembers((data||[]).filter(m=>dept==="BOTH"||m.department===dept||m.department==="BOTH")));
      // Load all companies (not just portal ones)
  supabase.from("companies")
        .select("id,name,department,portal_user_id")
        .order("name")
        .then(({data})=>{
          if(data) setClients(data.map(c=>({
            id: c.id,
            company_id: c.id,
            full_name: c.name,
            department: c.department,
            has_portal: !!c.portal_user_id,
          })));
        }).catch(e=>console.warn("DB [documents]:", e?.message||e));
  },[dept]);
  return {members,clients};
}


// ─── useQuery — centralized DB fetch with error handling ─────────────────────
// Usage: const {data, loading, error} = useQuery(() => supabase.from('x').select('*'))
function useQuery(queryFn, deps=[], showToast=null){
  const [data,setData]=React.useState(null);
  const [loading,setLoading]=React.useState(true);
  const [error,setError]=React.useState(null);
  React.useEffect(()=>{
    let cancelled=false;
    setLoading(true);
    queryFn()
      .then(({data:d,error:e})=>{
        if(cancelled) return;
        if(e){ 
          setError(e.message);
          console.warn("useQuery error:",e.message);
          if(showToast) showToast("Laden mislukt: "+e.message);
        } else {
          setData(d);
          setError(null);
        }
        setLoading(false);
      })
      .catch(e=>{
        if(cancelled) return;
        setError(e?.message||"Onbekende fout");
        console.warn("useQuery catch:",e?.message||e);
        setLoading(false);
      });
    return()=>{cancelled=true;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[...deps]);
  return {data,loading,error};
}

// ─── ASSIGNEE SELECT ──────────────────────────────────────────────────────────
function AssigneeSelect({value,onChange,members,label="Toewijzen aan",style={}}){
  return(
    <select value={value||""} onChange={e=>onChange(e.target.value)}
      style={{padding:"7px 10px",borderRadius:8,border:`1px solid ${C.border}`,
        fontSize:11,outline:"none",cursor:"pointer",background:C.surface,
        color:C.text,fontFamily:F.body,...style}}>
      <option value="">— {label} —</option>
      {members.map(m=>(
        <option key={m.id} value={m.id}>
          {m.full_name} ({m.department})
        </option>
      ))}
    </select>
  );
}

function TasksView({user}){
const t=useT();
const {members}=useTeamMembers(user.dept);
const [assigneeFilter,setAssigneeFilter]=useState("");
const [tasks,setTasks]=useState([]);
const [statusF,setStatusF]=useState("ALL"); const [q,setQ]=useState("");
const [showForm,setShowForm]=useState(false);
const [newTitle,setNewTitle]=useState("");
const [newPrio,setNewPrio]=useState("normal");
const [newDue,setNewDue]=useState("");
const [newAssignee,setNewAssignee]=useState("");
const [newEngId,setNewEngId]=useState("");
const [engList,setEngList]=useState([]);
useEffect(()=>{ supabase.from("engagements").select("id,name,department").then(({data})=>setEngList(data||[])); },[]);

// Load tasks from DB (no join — fetch assignee profiles separately)
useEffect(()=>{
  supabase.from("tasks")
    .select("id,title,priority,status,due_date,assigned_to,engagement_id")
    .order("created_at",{ascending:false})
    .then(async ({data})=>{
      const tasks=data||[];
      const assignedIds=[...new Set(tasks.map(t=>t.assigned_to).filter(Boolean))];
      let nameMap={};
      if(assignedIds.length>0){
        const {data:profiles}=await supabase
          .from("user_profiles")
          .select("id,full_name,avatar_initials")
          .in("id",assignedIds);
        (profiles||[]).forEach(p=>{nameMap[p.id]=p;});
      }
      if(tasks.length) setTasks(tasks.map(tk=>({
        id:tk.id,title:tk.title,priority:tk.priority||"normal",
        status:tk.status||"open",
        due:tk.due_date?new Date(tk.due_date).toLocaleDateString("nl-SR",{day:"2-digit",month:"short"}):"—",
        due_date_raw:tk.due_date||null,
        assignee:nameMap[tk.assigned_to]?.avatar_initials||"—",
        assignee_name:nameMap[tk.assigned_to]?.full_name||"",
        assigned_to:tk.assigned_to,
      })));
    }).catch(e=>console.warn("DB [engagements]:", e?.message||e));
},[]);

const filtered=tasks.filter(tk=>{
  const sOk=statusF==="ALL"||tk.status===statusF;
  const aOk=!assigneeFilter||tk.assigned_to===assigneeFilter;
  const qOk=!q||tk.title.toLowerCase().includes(q.toLowerCase());
  return sOk&&aOk&&qOk;
});

const toggle=async(id)=>{
  const tk=tasks.find(t=>t.id===id);
  if(!tk) return;
  const newStatus=tk.status==="done"?"open":"done";
  setTasks(ts=>ts.map(t=>t.id===id?{...t,status:newStatus}:t));
  await supabase.from("tasks").update({status:newStatus}).eq("id",id).catch(e=>console.warn("DB [tasks]:", e?.message||e));
};

const addTask=async()=>{
  if(!newTitle.trim()) return;
  const assigneeMember=members.find(m=>m.id===newAssignee);
  const localTask={
    id:`t${Date.now()}`,title:newTitle,priority:newPrio,
    due:newDue?new Date(newDue).toLocaleDateString("nl-SR",{day:"2-digit",month:"short"}):"—",
    status:"open",
    assignee:assigneeMember?.avatar_initials||user.avatar,
    assignee_name:assigneeMember?.full_name||"",
    assigned_to:newAssignee||null,
    engagement_id:newEngId||null,
  };
  // Save to Supabase - use first available engagement if none selected
  try{
    // Load first engagement to use as fallback (engagement_id required by DB)
    let engId=newEngId;
    if(!engId){
      const {data:engs}=await supabase.from("engagements").select("id").limit(1);
      engId=engs?.[0]?.id||null;
    }
    if(!engId){ setTasks(ts=>[localTask,...ts]); setNewTitle("");setNewPrio("normal");setNewDue("");setNewAssignee("");setShowForm(false); return; }
    const {data}=await supabase.from("tasks").insert({
      title:newTitle.trim(),priority:newPrio,status:"open",
      due_date:newDue||null,
      assigned_to:newAssignee||null,
      engagement_id:engId,
      department:user.dept==="BOTH"?"TC":user.dept,
    }).select().single();
    if(data) localTask.id=data.id;
  }catch(e){ console.warn("task insert:",e); }
  setTasks(ts=>[localTask,...ts]);
  setNewTitle("");setNewPrio("normal");setNewDue("");setNewAssignee("");setNewEngId("");setShowForm(false);
};
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
<div style={{padding:"10px 16px",borderRadius:10,background:C.blueBg,border:`1px solid ${C.blue||C.indigo}30`,display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
<Lock size={13} color="#6366F1"/><span style={{fontSize:11,fontWeight:700,color:C.indigo}}>Interne taken — beveiligd, nooit zichtbaar voor cliënten</span>
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
<div style={{background:C.warm50,border:`1.5px solid ${C.blue||C.indigo}`,borderRadius:12,padding:"14px 16px",marginBottom:12,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
<input value={newTitle} onChange={e=>setNewTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask()} placeholder="Nieuwe taak..." style={{flex:2,minWidth:200,padding:"8px 11px",borderRadius:8,border:`1.5px solid ${C.blue||C.indigo}`,fontSize:12,outline:"none"}}/>
<select value={newPrio} onChange={e=>setNewPrio(e.target.value)} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:11,outline:"none",cursor:"pointer"}}>
{[["low","Laag"],["normal","Normaal"],["high","Hoog"],["critical","Kritiek"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
</select>
<select value={newEngId} onChange={e=>setNewEngId(e.target.value)} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${newEngId?C.crimson:C.border}`,fontSize:11,outline:"none",cursor:"pointer",background:C.bg,color:C.text}}>
<option value="">— Project —</option>
{engList.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
</select>
<select value={newAssignee} onChange={e=>setNewAssignee(e.target.value)} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:11,outline:"none",cursor:"pointer",background:C.bg,color:C.text}}>
<option value="">— Medewerker —</option>
{members.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}
</select>
<input type="date" value={newDue} onChange={e=>setNewDue(e.target.value)} style={{padding:"7px 9px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:11,outline:"none"}}/>
<button onClick={addTask} style={{padding:"7px 16px",borderRadius:8,background:C.indigo,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Opslaan</button>
<button onClick={()=>setShowForm(false)} style={{padding:"7px 10px",borderRadius:8,background:"transparent",color:C.secondary,border:`1px solid ${C.border}`,fontSize:11,cursor:"pointer"}}><X size={12}/></button>
</div>
)}
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)"}}>
{filtered.length===0?(<div style={{padding:"48px 24px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:C.secondary}}>Geen taken gevonden</div></div>):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["","TAAK","PRIO","STATUS","DATUM","MGR",""].map((h,i)=><th key={i} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{filtered.map(tk=>(
<tr key={tk.id} style={{borderTop:`1px solid ${C.border}`,opacity:tk.status==="done"?0.65:1,background:(()=>{
  if(tk.status==="done") return "transparent";
  if(!tk.due_date_raw) return "transparent";
  const days=Math.ceil((new Date(tk.due_date_raw)-new Date())/86400000);
  if(days<0) return C.redBg;
  if(days===0) return C.amberBg;
  return "transparent";
})()}}>
<td style={{padding:"12px 14px",width:36}}><div onClick={()=>toggle(tk.id)} style={{width:18,height:18,borderRadius:5,border:`2px solid ${tk.status==="done"?C.green:C.border}`,background:tk.status==="done"?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{tk.status==="done"&&<CheckCircle size={11} color={CREAM}/>}</div></td>
<td style={{padding:"12px 14px"}}><div style={{fontSize:13,fontWeight:600,color:C.text,textDecoration:tk.status==="done"?"line-through":"none"}}>{tk.title}</div></td>
<td style={{padding:"12px 14px"}}><PriorityDot level={tk.priority}/></td>
<td style={{padding:"12px 14px"}}><Badge label={sLabel[tk.status]||tk.status} color={sColor[tk.status]||C.secondary} bg={sBg[tk.status]||C.warm50}/></td>
<td style={{padding:"12px 14px"}}>
{(()=>{
  if(!tk.due_date_raw||tk.status==="done") return <span style={{fontSize:12,color:C.secondary}}>{tk.due}</span>;
  const days=Math.ceil((new Date(tk.due_date_raw)-new Date())/86400000);
  if(days<0) return <span style={{fontSize:11,fontWeight:700,color:C.red,display:"flex",alignItems:"center",gap:4}}><AlertTriangle size={10}/>{Math.abs(days)}d achterstallig</span>;
  if(days===0) return <span style={{fontSize:11,fontWeight:700,color:C.amber,display:"flex",alignItems:"center",gap:4}}><AlertTriangle size={10}/>Vandaag</span>;
  if(days===1) return <span style={{fontSize:11,fontWeight:600,color:C.amber}}>Morgen</span>;
  return <span style={{fontSize:12,color:C.secondary}}>{tk.due}</span>;
})()}
</td>
<td style={{padding:"12px 14px"}}><Avatar initials={tk.assignee} size={26} bg={C.walnut}/></td>
<td style={{padding:"12px 14px"}}>
<button onClick={async()=>{
  if(!window.confirm(`Taak "${tk.title}" verwijderen?`)) return;
  setTasks(ts=>ts.filter(t=>t.id!==tk.id));
  try{ await fetch(`${SB_URL}/rest/v1/tasks?id=eq.${tk.id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`}}); }catch(e){}
}} style={{padding:"4px 8px",borderRadius:7,background:C.redBg,border:`1px solid ${C.red}30`,color:C.red,fontSize:9,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:3}}>
<X size={10}/> Del
</button>
</td>
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

function ClientAssignSelect({engId,value,onChange}){
  const [clients,setClients]=useState([]);
  const [dropLoading,setDropLoading]=useState(true);
  useEffect(()=>{
    setDropLoading(true);
    supabase.from("companies")
      .select("id,name,department,portal_user_id")
      .order("name")
      .then(({data})=>{
        setClients((data||[]).map(c=>({
          id: c.id,
          company_id: c.id,
          full_name: c.name+(c.portal_user_id?" ✓":""),
          department: c.department,
          has_portal: !!c.portal_user_id,
          portal_user_id: c.portal_user_id,
        })));
        setDropLoading(false);
      })
      .catch(e=>{console.warn("companies load:",e?.message||e); setDropLoading(false);});
  },[]);
  return(
    <select value={value||""} onChange={e=>onChange(e.target.value)} disabled={dropLoading}
      style={{width:"100%",padding:"10px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,
        fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,fontFamily:F.body}}>
      {dropLoading
        ? <option disabled>Laden...</option>
        : <>
            <option value="">— Geen specifieke cliënt —</option>
            {clients.map(c=>(<option key={c.id} value={c.id}>{c.full_name}</option>))}
          </>
      }
    </select>
  );
}

function NewClientActionModal({eng,onClose,onCreated,showToast}){
const [title,setTitle]=useState("");
const [desc,setDesc]=useState("");
const [type,setType]=useState("upload");
const [deadline,setDeadline]=useState("");
const [saving,setSaving]=useState(false);
const [assignedClient,setAssignedClient]=useState("");
const [staffList,setStaffList]=useState([]);
const [clientList,setClientList]=useState([]);
const [assignedStaff,setAssignedStaff]=useState("");
const [dropLoading,setDropLoading]=useState(true);

useEffect(()=>{
  const h=e=>{if(e.key==="Escape")onClose();};
  window.addEventListener("keydown",h);
  document.body.classList.add("modal-open");
  // Load staff and clients
  setDropLoading(true);
  let staffDone=false, clientsDone=false;
  const checkDone=()=>{ if(staffDone&&clientsDone) setDropLoading(false); };
  supabase.from("v_staff_dropdown")
    .select("id,full_name,department,avatar_initials,role")
    .then(({data})=>{setStaffList(data||[]); staffDone=true; checkDone();})
    .catch(e=>{console.warn("staff load:",e?.message||e); staffDone=true; checkDone();});
  // Load all companies directly (not just portal ones)
  supabase.from("companies")
    .select("id,name,department,contact_name,portal_user_id")
    .order("name")
    .then(({data})=>{
      if(data) setClientList(data.map(c=>({
        id: c.id,
        company_id: c.id,
        full_name: c.name+(c.portal_user_id?" ✓":""),
        department: c.department,
        has_portal: !!c.portal_user_id,
      })));
      clientsDone=true; checkDone();
    }).catch(e=>{console.warn("DB [engagements]:", e?.message||e); clientsDone=true; checkDone();});
  return()=>{ window.removeEventListener("keydown",h); document.body.classList.remove("modal-open"); };
},[]);
const ACTION_TYPES=[
{id:"upload",label:"Upload",desc:"Cliënt moet een bestand aanleveren",Icon:Upload},
{id:"approve",label:"Goedkeuren",desc:"Cliënt moet een document goedkeuren",Icon:CheckSquare},
{id:"sign",label:"Ondertekenen",desc:"Cliënt moet een document ondertekenen",Icon:FileText},
{id:"review",label:"Beoordelen",desc:"Cliënt moet informatie beoordelen",Icon:ClipboardList},
];
const isValid=title.trim().length>2&&assignedClient;
const submit=async()=>{
if(!isValid||saving)return;
setSaving(true);
const newAction={
  id:`ca${Date.now()}`,title:title.trim(),desc:desc.trim(),type,status:"pending",
  deadline:deadline?new Date(deadline).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—",
  engagement_id:eng.id,
  client_id:assignedClient||null,
  assigned_to:assignedStaff||null,
};
// Save to Supabase
try{
  const {data:caData}=await supabase.from("client_actions").insert({
    title:newAction.title, description:newAction.desc,
    action_type:newAction.type, status:"pending",
    deadline:deadline||null, engagement_id:eng.id,
    client_id:assignedClient||null, assigned_to:assignedStaff||null,
    department:eng.dept||"TC", is_visible_to_client:true,
    company_id:eng.company_id||null,
  }).select("id").single();

  // Send notification to client if company has portal user
  if(eng.company_id){
    const {data:comp}=await supabase.from("companies")
      .select("portal_user_id,name")
      .eq("id",eng.company_id)
      .single();
    if(comp?.portal_user_id){
      const typeLabel=newAction.type==="upload"?"Uploadverzoek":newAction.type==="approve"?"Goedkeuring vereist":newAction.type==="sign"?"Handtekening vereist":"Actie vereist";
      await supabase.from("notifications").insert({
        user_id:comp.portal_user_id,
        title:`${typeLabel}: ${newAction.title}`,
        body:`Uw adviseur heeft een nieuw actiepunt aangemaakt${deadline?` — deadline: ${new Date(deadline).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"})}`:""}.`,
        entity_type:"client_action",
        entity_id:caData?.id||null,
        action_type:newAction.type,
      }).catch(e=>console.warn("DB [client_actions]:", e?.message||e));
    }
  }
}catch(e){ console.warn("client_action insert:",e.message); }
onCreated(newAction);
showToast(`Cliëntactie "${title}" aangemaakt`);
onClose();
};
return(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,pointerEvents:"auto",}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} style={{
  background:C.surface,borderRadius:16,width:540,maxWidth:"92vw",
  boxShadow:"0 24px 60px rgba(58,46,40,.18)",
  display:"flex",flexDirection:"column",
  fontFamily:F.body,boxShadow:"0 4px 32px rgba(0,0,0,.13),0 1px 6px rgba(0,0,0,.08)"}}>
{/* Header */}
<div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase"}}>{eng.ref} · {eng.client}</div>
<div style={{fontFamily:F.display,fontSize:17,fontWeight:600,color:C.text}}>Nieuwe Cliëntactie</div>
</div>
<button onClick={onClose} style={{width:28,height:28,borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}><X size={14}/></button>
</div>
{/* Body - NO scroll, all fits */}
<div style={{padding:"14px 20px",display:"flex",flexDirection:"column",gap:12}}>
{/* Visibility badge */}
<div style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:8,background:C.greenBg,border:`1px solid ${C.green}30`}}>
<Eye size={11} color={C.green}/>
<span style={{fontSize:10,fontWeight:700,color:C.green}}>Zichtbaar voor cliënt · Niet bewerkbaar door cliënt</span>
</div>
{/* Action type - compact horizontal pills */}
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>ACTIETYPE</div>
<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
{ACTION_TYPES.map(at=>{
const sel=type===at.id;
return(
<div key={at.id} onClick={()=>setType(at.id)} style={{
  display:"flex",alignItems:"center",gap:6,padding:"7px 12px",
  borderRadius:8,border:`1.5px solid ${sel?C.crimson:C.border}`,
  background:sel?C.crimsonFaint:C.bg,cursor:"pointer",
  fontSize:11,fontWeight:sel?700:400,color:sel?C.crimson:C.text,
  transition:"all .15s",
}}>
<at.Icon size={12} color={sel?C.crimson:C.secondary}/>
{at.label}
</div>
);
})}
</div>
</div>
{/* Row: Title + Deadline side by side */}
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>ACTIETITEL <span style={{color:C.crimson}}>*</span></div>
<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Bijv. Jaarrekening Uploaden"
  style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1.5px solid ${title.length>2?C.crimson:C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
</div>
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>DEADLINE</div>
<input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}
  style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}/>
</div>
</div>
{/* Row: Client + Staff side by side */}
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>CLIËNT <span style={{color:C.crimson}}>*</span></div>
<select value={assignedClient} onChange={e=>setAssignedClient(e.target.value)} disabled={dropLoading}
  style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1.5px solid ${assignedClient?C.crimson:C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
  {dropLoading
    ? <option disabled>Laden...</option>
    : <>
        <option value="">— Selecteer —</option>
        {clientList.map(c=><option key={c.id} value={c.id}>{c.full_name}</option>)}
      </>
  }
</select>
</div>
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>MEDEWERKER</div>
<select value={assignedStaff} onChange={e=>setAssignedStaff(e.target.value)} disabled={dropLoading}
  style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
  {dropLoading
    ? <option disabled>Laden...</option>
    : <>
        <option value="">— Optioneel —</option>
        {staffList.map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}
      </>
  }
</select>
</div>
</div>
{/* Instructies */}
<div>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>INSTRUCTIES VOOR CLIËNT</div>
<textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Geef duidelijke instructies..." rows={2}
  style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit",background:C.bg,color:C.text}}/>
</div>
</div>
{/* Footer */}
<div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8}}>
<button onClick={submit} disabled={!isValid||saving} style={{flex:1,padding:"10px",borderRadius:9,background:isValid?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:isValid?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
<Send size={13}/>{saving?"Aanmaken...":"Actie aanmaken"}
</button>
<button onClick={onClose} style={{padding:"10px 16px",borderRadius:9,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:12,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
</div>
</div>
</div>
);}


// ─── CLIENT ACTIONS VIEW (STAFF) ──────────────────────────────────────────────
const ALL_CLIENT_ACTIONS_DATA=[];
function ClientActionsView({dept,showToast}){
const t=useT();
const [actions,setActions]=useState([]);
const [loading,setLoading]=useState(true);
const [statusF,setStatusF]=useState("ALL");

// Load from DB
useEffect(()=>{
  supabase.from("client_actions")
    .select("id,title,description,action_type,status,deadline,department,company_id,engagement_id,is_visible_to_client,created_at")
    .eq("department",dept)
    .order("created_at",{ascending:false})
    .then(({data})=>{
      setActions((data||[]).map(a=>({
        ...a,
        dept:a.department,
        desc:a.description||"",
        type:a.action_type,
        deadline:a.deadline?new Date(a.deadline).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—",
        client:"—", engagement:"—",
      })));
      setLoading(false);
    }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[dept]);
const [q,setQ]=useState("");
const [showNew,setShowNew]=useState(false);
const filtered=actions.filter(a=>{
const sOk=statusF==="ALL"||a.status===statusF;
const qOk=!q||a.title.toLowerCase().includes(q.toLowerCase())||a.client.toLowerCase().includes(q.toLowerCase());
return sOk&&qOk;
});
const statusMeta={pending:{label:"OPENSTAAND",color:C.amber,bg:C.amberBg},overdue:{label:"ACHTERSTALLIG",color:C.red,bg:C.redBg},completed:{label:"VOLTOOID",color:C.green,bg:C.greenBg}};
const typeMeta={upload:{label:"Upload",color:C.blue||C.indigo,bg:C.blueBg},approve:{label:"Goedkeuring",color:C.green,bg:C.greenBg},sign:{label:"Ondertekening",color:C.amber,bg:C.amberBg},review:{label:"Beoordeling",color:C.secondary,bg:C.warm50}};
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
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)"}}>
{filtered.length===0?(
<div style={{padding:"52px 24px",textAlign:"center"}}>
{loading?<div style={{color:C.secondary,fontSize:12}}>Laden...</div>:(
<><CheckCircle size={32} color={C.green} style={{marginBottom:10}}/>
<div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Geen acties gevonden</div>
<div style={{fontSize:12,color:C.secondary,marginTop:4}}>Pas de filters aan of maak een nieuwe actie aan.</div></>
)}
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
<button onClick={async()=>{
  if(!window.confirm(`Actie "${a.title}" verwijderen?`)) return;
  setActions(as=>as.filter(x=>x.id!==a.id));
  try{ await fetch(`${SB_URL}/rest/v1/client_actions?id=eq.${a.id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`}}); }catch(e){}
  if(showToast) showToast("Actie verwijderd");
}} style={{padding:"5px 10px",borderRadius:7,background:C.redBg,border:`1px solid ${C.red}30`,color:C.red,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
<X size={11}/> Verwijder
</button>
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
const AUDIT_COLOR={FASE_BIJGEWERKT:{c:C.indigo,bg:C.blueBg},DOCUMENT_GEVERIFIEERD:{c:"#15803D",bg:"#F0FDF4"},CLIËNT_AANGEMAAKT:{c:"#C97B1A",bg:"#FDF6EC"},QBO_BETALING_ONTVANGEN:{c:"#15803D",bg:"#F0FDF4"},GEZONDHEID_BIJGEWERKT:{c:"#C83232",bg:"#FEF2F2"},GEZONDHEID_AUTO_ROOD:{c:"#C83232",bg:"#FEF2F2"},CLIËNTACTIE_AANGEMAAKT:{c:"#8B1A2B",bg:"#F9F0F1"},FACTUUR_AANGEMAAKT:{c:"#1D4ED8",bg:C.blueBg}};

function AuditLogView({user}){
const [logs,setLogs]=useState([]);
const [loading,setLoading]=useState(true);
const [deptF,setDeptF]=useState("ALL");
const [typeF,setTypeF]=useState("ALL");
const [q,setQ]=useState("");
const [dateF,setDateF]=useState("all");

useEffect(()=>{
  supabase.from("audit_log")
    .select("id,actor_name,actor_role,action,entity_type,entity_id,entity_name,department,delta,created_at")
    .order("created_at",{ascending:false})
    .limit(200)
    .then(({data})=>{
      setLogs(data||[]);
      setLoading(false);
    }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[]);

const ACTION_META={
  ENGAGEMENT_AANGEMAAKT:{c:C.crimson,bg:C.crimsonFaint,Icon:Target,label:"Engagement aangemaakt"},
  STATUS_BIJGEWERKT:{c:C.indigo,bg:C.indigoBg,Icon:RefreshCw,label:"Status bijgewerkt"},
  FASE_BIJGEWERKT:{c:C.amber,bg:C.amberBg,Icon:ArrowRight,label:"Fase bijgewerkt"},
  GEZONDHEID_BIJGEWERKT:{c:C.amber,bg:C.amberBg,Icon:Activity,label:"Gezondheid bijgewerkt"},
  ENGAGEMENT_VERWIJDERD:{c:C.red,bg:C.redBg,Icon:X,label:"Engagement verwijderd"},
  DOCUMENT_GEUPLOAD:{c:C.blue,bg:C.blueBg,Icon:Upload,label:"Document geüpload"},
  DOCUMENT_BEOORDEELD:{c:C.green,bg:C.greenBg,Icon:CheckCircle,label:"Document beoordeeld"},
  CLIËNT_AANGEMAAKT:{c:C.walnut,bg:C.warm50,Icon:Users,label:"Cliënt aangemaakt"},
  CLIËNT_VERWIJDERD:{c:C.red,bg:C.redBg,Icon:X,label:"Cliënt verwijderd"},
  ACTIE_BIJGEWERKT:{c:C.green,bg:C.greenBg,Icon:CheckSquare,label:"Actie bijgewerkt"},
};

const now=new Date();
const filtered=logs.filter(l=>{
  const dOk=deptF==="ALL"||l.department===deptF;
  const tOk=typeF==="ALL"||l.entity_type===typeF;
  const qOk=!q||l.actor_name?.toLowerCase().includes(q.toLowerCase())||l.entity_name?.toLowerCase().includes(q.toLowerCase())||l.action?.toLowerCase().includes(q.toLowerCase());
  let dateOk=true;
  if(dateF!=="all"){
    const d=new Date(l.created_at);
    const diff=(now-d)/(1000*60*60);
    if(dateF==="1h") dateOk=diff<=1;
    else if(dateF==="24h") dateOk=diff<=24;
    else if(dateF==="7d") dateOk=diff<=168;
  }
  return dOk&&tOk&&qOk&&dateOk;
});

const formatTime=(ts)=>{
  if(!ts) return "—";
  const d=new Date(ts);
  const diff=(now-d)/1000;
  if(diff<60) return "Zojuist";
  if(diff<3600) return `${Math.floor(diff/60)} min geleden`;
  if(diff<86400) return `${Math.floor(diff/3600)} uur geleden`;
  return d.toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
};

const exportCSV=()=>{
  const rows=[["Tijdstip","Acteur","Actie","Entiteit","Naam","Afdeling","Details"],...filtered.map(l=>[
    new Date(l.created_at).toISOString(),
    l.actor_name||"—",l.action,l.entity_type,l.entity_name||"—",l.department||"—",
    l.delta?JSON.stringify(l.delta):"",
  ])];
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const a=document.createElement("a");
  a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
  a.download=`audit_log_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
};

// Group by date
const groups={};
filtered.forEach(l=>{
  const d=new Date(l.created_at);
  const key=d.toLocaleDateString("nl-SR",{weekday:"long",day:"2-digit",month:"long",year:"numeric"});
  if(!groups[key]) groups[key]=[];
  groups[key].push(l);
});

return(
<div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
    <PageHeader kicker="Systeem" title="Audit Log"/>
    <div style={{display:"flex",gap:8,marginTop:4}}>
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,background:C.darkAccent,color:CREAM,fontSize:11,fontWeight:700}}>
        <Shield size={13} color={CREAM}/> {filtered.length} Records
      </div>
      <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>
        <Download size={13}/> CSV Export
      </button>
    </div>
  </div>

  {/* KPI strip */}
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
  {[
    {l:"VANDAAG",v:logs.filter(l=>(now-new Date(l.created_at))<86400000).length,c:C.text},
    {l:"ENGAGEMENTS",v:logs.filter(l=>l.entity_type==="engagement").length,c:C.crimson},
    {l:"DOCUMENTEN",v:logs.filter(l=>l.entity_type==="document").length,c:C.blue},
    {l:"CLIËNTEN",v:logs.filter(l=>l.entity_type==="company").length,c:C.walnut},
  ].map(k=>(
    <div key={k.l} style={{background:C.surface,borderRadius:12,padding:"12px 16px",border:`1px solid ${C.border}`}}>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
      <div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:k.c}}>{k.v}</div>
    </div>
  ))}
  </div>

  {/* Filter bar */}
  <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
    <div style={{position:"relative",flex:1,minWidth:200}}>
      <Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek op acteur, entiteit of actie..."
        style={{width:"100%",padding:"7px 30px 7px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
      {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
    </div>
    {[["all","Alle tijd"],["1h","Laatste uur"],["24h","Laatste 24u"],["7d","Laatste 7d"]].map(([v,l])=>(
      <button key={v} onClick={()=>setDateF(v)} style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${dateF===v?C.crimson:C.border}`,background:dateF===v?C.crimson:"transparent",color:dateF===v?CREAM:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
        {l}
      </button>
    ))}
    <select value={typeF} onChange={e=>setTypeF(e.target.value)}
      style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:11,outline:"none",cursor:"pointer",background:C.surface,color:C.text}}>
      <option value="ALL">Alle entiteiten</option>
      <option value="engagement">Engagements</option>
      <option value="document">Documenten</option>
      <option value="company">Cliënten</option>
      <option value="client_action">Cliëntacties</option>
    </select>
    {user.dept==="BOTH"&&(
      <select value={deptF} onChange={e=>setDeptF(e.target.value)}
        style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:11,outline:"none",cursor:"pointer",background:C.surface,color:C.text}}>
        <option value="ALL">Alle afdelingen</option>
        <option value="TC">Tactigent</option>
        <option value="FF">Fiscal Fuse</option>
      </select>
    )}
  </div>

  {/* Timeline grouped by date */}
  {loading?(
    <div style={{background:C.surface,borderRadius:14,padding:"40px 24px",textAlign:"center",color:C.secondary,border:`1px solid ${C.border}`}}>Laden...</div>
  ):filtered.length===0?(
    <div style={{background:C.surface,borderRadius:14,padding:"52px 24px",textAlign:"center",border:`1px solid ${C.border}`}}>
      <Activity size={32} color={C.mushroom} style={{marginBottom:12}}/>
      <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:6}}>Geen activiteit gevonden</div>
      <div style={{fontSize:12,color:C.secondary}}>Acties worden automatisch gelogd als medewerkers wijzigingen maken.</div>
    </div>
  ):(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {Object.entries(groups).map(([dateLabel,groupLogs])=>(
        <div key={dateLabel}>
          {/* Date divider */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.08em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{dateLabel}</div>
            <div style={{flex:1,height:1,background:C.border}}/>
            <div style={{fontSize:10,color:C.muted,whiteSpace:"nowrap"}}>{groupLogs.length} activiteiten</div>
          </div>
          {/* Log items */}
          <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 1px 4px rgba(58,46,40,.06)"}}>
            {groupLogs.map((l,i)=>{
              const meta=ACTION_META[l.action]||{c:C.secondary,bg:C.warm50,Icon:Activity,label:l.action};
              const IconComp=meta.Icon;
              return(
                <div key={l.id} style={{padding:"14px 18px",borderTop:i>0?`1px solid ${C.border}`:"none",display:"flex",alignItems:"flex-start",gap:14}}>
                  {/* Icon */}
                  <div style={{width:36,height:36,borderRadius:9,background:meta.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2}}>
                    <IconComp size={14} color={meta.c}/>
                  </div>
                  {/* Content */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.text}}>{l.actor_name||"Systeem"}</span>
                      <span style={{fontSize:9,fontWeight:700,background:meta.bg,color:meta.c,padding:"2px 8px",borderRadius:4,textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{meta.label}</span>
                      {l.entity_name&&<span style={{fontSize:11,color:C.secondary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>— {l.entity_name}</span>}
                    </div>
                    {l.delta&&(
                      <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:C.secondary,background:C.warm50,borderRadius:6,padding:"4px 10px",display:"inline-flex",flexWrap:"wrap",gap:6}}>
                        {l.delta.van&&<><span style={{color:C.red,fontWeight:600}}>{l.delta.van}</span><ArrowRight size={10}/></>}
                        {l.delta.naar&&<span style={{color:C.green,fontWeight:600}}>{l.delta.naar}</span>}
                        {l.delta.note&&<span style={{color:C.secondary}}>· "{l.delta.note}"</span>}
                      </div>
                    )}
                  </div>
                  {/* Right: time + dept */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0}}>
                    <span style={{fontSize:10,color:C.muted,whiteSpace:"nowrap"}}>{formatTime(l.created_at)}</span>
                    {l.department&&<DeptTag dept={l.department}/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  )}
  <div style={{display:"flex",alignItems:"center",gap:6,marginTop:14,fontSize:10,color:C.muted}}>
    <Shield size={11}/> Audit log is immutabel — records worden automatisch aangemaakt door het systeem.
  </div>
</div>
);
}


// ─── REVIEW QUEUE ────────────────────────────────────────────────────────────
function ReviewQueue({showToast}){
const t=useT();
const [docs,setDocs]=useState([]);
const [loading,setLoading]=useState(true);
const [processedCount,setProcessedCount]=useState(0);
const [reviewing,setReviewing]=useState(null); const [decision,setDecision]=useState(""); const [note,setNote]=useState("");

// Load all pending review items from DB (3 sources)
useEffect(()=>{
  const loadAll=async()=>{
    const items=[];
    const compMap={};
    try{
      const {data:compList}=await supabase.from("companies").select("id,name");
      (compList||[]).forEach(c=>{ compMap[c.id]=c.name; });
    }catch(e){}

    // 1. Documents with review_status = 'pending'
    try{
      const {data:pendingDocs}=await supabase.from("documents")
        .select("id,name,department,review_status,uploaded_at,company_id")
        .eq("review_status","pending")
        .order("uploaded_at",{ascending:false});
      (pendingDocs||[]).forEach(d=>items.push({
        id:d.id, name:d.name, dept:d.department,
        uploaded:d.uploaded_at?new Date(d.uploaded_at).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}):"—",
        client:compMap[d.company_id]||"Intern", priority:"normaal",
        sourceType:"document", reviewType:"document", typeLabel:"Document",
      }));
    }catch(e){ console.warn("ReviewQueue docs:",e.message||e); }

    // 2. Engagements with status = 'In Review'
    try{
      const {data:reviewEngs}=await supabase.from("engagements")
        .select("id,name,department,status,updated_at,company_id")
        .eq("status","In Review")
        .order("updated_at",{ascending:false});
      (reviewEngs||[]).forEach(e=>items.push({
        id:e.id, name:e.name, dept:e.department,
        uploaded:e.updated_at?new Date(e.updated_at).toLocaleDateString("nl-SR",{day:"2-digit",month:"short"}):"—",
        client:compMap[e.company_id]||"—", priority:"hoog",
        sourceType:"engagement", reviewType:"engagement", typeLabel:"Engagement Review",
      }));
    }catch(e){ console.warn("ReviewQueue engs:",e.message||e); }

    // 3. Client actions with action_type = 'review'
    try{
      const {data:reviewActions}=await supabase.from("client_actions")
        .select("id,title,action_type,status,created_at,department,company_id")
        .eq("action_type","review")
        .eq("status","pending")
        .order("created_at",{ascending:false});
      (reviewActions||[]).forEach(a=>items.push({
        id:a.id, name:a.title, dept:a.department,
        uploaded:a.created_at?new Date(a.created_at).toLocaleDateString("nl-SR",{day:"2-digit",month:"short"}):"—",
        client:compMap[a.company_id]||"—", priority:"normaal",
        sourceType:"client_action", reviewType:"client_action", typeLabel:"Cliëntactie Review",
      }));
    }catch(e){ console.warn("ReviewQueue actions:",e.message||e); }

    // Count today's processed
    try{
      const today=new Date(); today.setHours(0,0,0,0);
      const {data:processedDocs}=await supabase.from("documents")
        .select("id").in("review_status",["verified","rejected"])
        .gte("updated_at",today.toISOString());
      setProcessedCount((processedDocs||[]).length);
    }catch(e){}

    setDocs(items);
    setLoading(false);
  };
  loadAll();
},[]);

const submitReview=async()=>{
if(!decision) return;
const item=reviewing;
// Optimistic UI update
setDocs(ds=>ds.filter(d=>!(d.id===item.id&&d.sourceType===item.sourceType)));
setProcessedCount(c=>c+1);
const labels={verified:"geverifieerd",rejected:"afgewezen",return:"teruggestuurd naar cliënt"};
showToast(`"${item.name}" ${labels[decision]} ✓`);
try{
  const now=new Date().toISOString();
  if(item.sourceType==="document"){
    const newStatus=decision==="verified"?"verified":decision==="rejected"?"rejected":"pending";
    await supabase.from("documents").update({
      review_status:newStatus,
      review_note:note||null,
      reviewed_at:now,
    }).eq("id",item.id);
  } else if(item.sourceType==="engagement"){
    // Update the document record
    const docStatus=decision==="verified"?"verified":decision==="rejected"?"rejected":"pending";
    await supabase.from("documents").update({
      review_status:docStatus,
      review_note:note||null,
      reviewed_at:now,
    }).eq("id",item.id);
    // Update the engagement status
    const engStatus=decision==="verified"?"Actief":decision==="rejected"?"Geblokkeerd":"Wacht op Cliënt";
    await supabase.from("engagements").update({
      status:engStatus,
      review_note:note||null,
    }).eq("id",item.sourceId||item.id);
    // If returning to client — create a client action requesting info
    if(decision==="return"&&note?.trim()){
      await supabase.from("client_actions").insert({
        title:"Feedback op review: "+item.name,
        description:note,
        action_type:"review",
        status:"pending",
        engagement_id:item.sourceId||item.id,
        department:item.dept,
        is_visible_to_client:true,
      });
    }
  } else if(item.sourceType==="client_action"){
    const caStatus=decision==="verified"?"completed":decision==="rejected"?"overdue":"pending";
    await supabase.from("client_actions").update({
      status:caStatus,
      review_note:note||null,
    }).eq("id",item.id);
  }
  // Create notification for the team
  if(note?.trim()){
    await supabase.from("notifications").insert({
      title:`Review beslissing: ${item.name}`,
      body:`${labels[decision].charAt(0).toUpperCase()+labels[decision].slice(1)}${note?`. Toelichting: ${note}`:""}`,
      action_type:decision==="verified"?"success":decision==="rejected"?"warning":"info",
      entity_type:item.sourceType,
      is_read:false,
    });
  }
}catch(e){ console.warn("reviewSubmit:",e.message||e); }
setReviewing(null); setDecision(""); setNote("");
};

const typeIconMap={engagement:<Target size={13} color={C.indigo}/>,client_action:<CheckSquare size={13} color={C.amber}/>,document:<FileText size={13} color={C.crimson}/>};
const typeBgMap={engagement:C.indigoBg,client_action:C.amberBg,document:C.crimsonFaint};
const typeColorMap={engagement:C.indigo,client_action:C.amber,document:C.crimson};
return(
<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
<PageHeader kicker="Operationele Pijplijn" title={t("reviewQueue")}/>
<div style={{display:"flex",gap:10}}>
{[{l:t("pending"),v:docs.length,dark:false},{l:t("processedToday"),v:118+REVIEW_DOCS.length-docs.length,dark:true}].map(s=>(
<div key={s.l} style={{textAlign:"center",background:s.dark?C.darkAccent:C.surface,borderRadius:12,padding:"11px 18px",border:s.dark?"none":`1px solid ${C.border}`}}>
<div style={{fontSize:8.5,fontWeight:700,color:s.dark?C.muted:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
<div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:s.dark?C.onDark:C.crimson}}>{s.v}</div>
</div>
))}
</div>
</div>
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)",overflow:"hidden",marginBottom:16}}>
{loading?(<div style={{padding:"32px 24px",textAlign:"center",color:C.secondary,fontSize:12}}>Laden...</div>)
:docs.length===0?(
  <div style={{padding:"48px 24px",textAlign:"center"}}>
    <FileText size={32} color={C.mushroom} style={{marginBottom:12}}/>
    <div style={{fontFamily:F.display,fontSize:20,fontWeight:600,color:C.text,marginBottom:6}}>Wachtrij leeg</div>
    <div style={{fontSize:12,color:C.secondary,marginBottom:16}}>Items verschijnen hier automatisch wanneer:<br/>
    * Een engagement op <strong>"In Review"</strong> wordt gezet<br/>
    * Een cliëntactie op <strong>"In Review"</strong> wordt gezet<br/>
    * Een document wordt geüpload via Documentbeheer</div>
  </div>
):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{["ITEM","TYPE","CLIËNT","DATUM",t("action")].map(h=><th key={h} style={{padding:"10px 20px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{docs.map(d=>(
<tr key={`${d.sourceType||"doc"}-${d.id}`} style={{borderTop:`1px solid ${C.border}`}}>
<td style={{padding:"13px 19px"}}>
  <div style={{display:"flex",alignItems:"center",gap:9}}>
    <div style={{width:30,height:30,borderRadius:8,background:d.reviewType==="engagement"?C.indigoBg:d.reviewType==="client_action"?C.amberBg:C.crimsonFaint,display:"flex",alignItems:"center",justifyContent:"center"}}>
      {d.reviewType==="engagement"?<Target size={13} color={C.indigo}/>:d.reviewType==="client_action"?<CheckSquare size={13} color={C.amber}/>:<FileText size={13} color={C.crimson}/>}
    </div>
    <div>
      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{d.name}</div>
      <div style={{fontSize:10,color:C.secondary}}>{d.dept}</div>
    </div>
  </div>
</td>
<td style={{padding:"13px 19px"}}>
  <span style={{fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,
    background:d.reviewType==="engagement"?C.indigoBg:d.reviewType==="client_action"?C.amberBg:C.crimsonFaint,
    color:d.reviewType==="engagement"?C.indigo:d.reviewType==="client_action"?C.amber:C.crimson,
    textTransform:"uppercase"}}>
    {d.typeLabel||"Document"}
  </span>
</td>
<td style={{padding:"13px 19px"}}><div style={{display:"flex",alignItems:"center",gap:8}}><CompanyLogo name={d.client} size={26} dept="FF"/><span style={{fontSize:12,fontWeight:600,color:C.text}}>{d.client}</span></div></td>
<td style={{padding:"13px 19px",fontSize:11,color:C.secondary}}>{d.uploaded}</td>
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
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,pointerEvents:"auto"}} onClick={()=>{setReviewing(null);setDecision("");setNote("");}}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:18,width:560,maxWidth:"95vw",boxShadow:"0 4px 32px rgba(0,0,0,.18)",fontFamily:F.body,display:"flex",flexDirection:"column",overflow:"hidden"}}>
{/* Header */}
<div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,background:C.crimsonFaint,display:"flex",alignItems:"center",gap:12}}>
<div style={{width:36,height:36,borderRadius:9,background:typeBgMap[reviewing.reviewType]||C.warm50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
{typeIconMap[reviewing.reviewType]||<FileText size={14} color={C.crimson}/>}
</div>
<div style={{flex:1,minWidth:0}}>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{reviewing.typeLabel}</div>
<div style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{reviewing.name}</div>
</div>
<button onClick={()=>{setReviewing(null);setDecision("");setNote("");}} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:4}}><X size={16}/></button>
</div>
{/* Context strip */}
<div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.warm50}}>
{[["Cliënt",reviewing.client],["Afdeling",reviewing.dept],["Ingediend",reviewing.uploaded]].map(([l,v])=>(
<div key={l} style={{flex:1,padding:"10px 16px",borderRight:`1px solid ${C.border}`}}>
<div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{l}</div>
<div style={{fontSize:12,fontWeight:600,color:C.text}}>{v||"—"}</div>
</div>
))}
</div>
{/* Body */}
<div style={{padding:"20px 22px"}}>
{/* 3 Decision buttons */}
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>BESLISSING</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
{[
{v:"verified",label:"Verifiëren",sub:"Goedkeuren & afsluiten",bg:C.green,Icon:CheckCircle},
{v:"return",label:"Terugsturen",sub:"Cliënt om actie vragen",bg:"#6366F1",Icon:RefreshCw},
{v:"rejected",label:"Afwijzen",sub:"Blokkeren & informeren",bg:C.red,Icon:X},
].map(opt=>{
const sel=decision===opt.v;
return(
<button key={opt.v} onClick={()=>setDecision(opt.v)} style={{padding:"12px 8px",borderRadius:11,border:`2px solid ${sel?opt.bg:C.border}`,background:sel?opt.bg:"transparent",color:sel?CREAM:C.text,cursor:"pointer",textAlign:"center",transition:"all .15s"}}>
<div style={{display:"flex",justifyContent:"center",marginBottom:6}}><opt.Icon size={18}/></div>
<div style={{fontSize:12,fontWeight:700,marginBottom:2}}>{opt.label}</div>
<div style={{fontSize:9,opacity:sel?0.85:0.5,lineHeight:1.3}}>{opt.sub}</div>
</button>
);
})}
</div>
{/* Note */}
<div style={{marginBottom:14}}>
<div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>
TOELICHTING {decision==="return"?<span style={{color:C.crimson}}>*</span>:<span style={{color:C.muted,fontWeight:400}}>(optioneel)</span>}
</div>
<textarea value={note} onChange={e=>setNote(e.target.value)} rows={3}
placeholder={decision==="verified"?"Optionele opmerking bij goedkeuring...":decision==="return"?"Beschrijf wat de cliënt moet aanleveren of aanpassen...":decision==="rejected"?"Reden voor afwijzing...":"Selecteer eerst een beslissing..."}
style={{width:"100%",padding:"10px 13px",borderRadius:9,border:`1.5px solid ${decision==="return"&&!note.trim()?C.amber:C.border}`,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:F.body,background:C.bg,color:C.text,lineHeight:1.6}}/>
{decision==="return"&&!note.trim()&&(
<div style={{fontSize:10,color:C.amber,marginTop:4,display:"flex",alignItems:"center",gap:4}}><AlertTriangle size={10}/> Vul in wat de cliënt moet doen</div>
)}
</div>
{/* What happens preview */}
{decision&&(
<div style={{padding:"10px 14px",borderRadius:9,background:decision==="verified"?C.greenBg:decision==="return"?C.indigoBg:C.redBg,border:`1px solid ${decision==="verified"?C.green+"40":decision==="return"?"#6366F140":C.red+"40"}`,marginBottom:16,fontSize:11,color:C.text,display:"flex",gap:8,alignItems:"flex-start"}}>
<Info size={13} color={decision==="verified"?C.green:decision==="return"?C.indigo:C.red} style={{flexShrink:0,marginTop:1}}/>
<div>
{decision==="verified"&&<><strong>Verifiëren:</strong> Status wordt <strong>Actief</strong>. Item verdwijnt uit de wachtrij.</>}
{decision==="return"&&<><strong>Terugsturen:</strong> Status wordt <strong>Wacht op Cliënt</strong>. Er wordt automatisch een cliëntactie aangemaakt met jouw toelichting.</>}
{decision==="rejected"&&<><strong>Afwijzen:</strong> Status wordt <strong>Geblokkeerd</strong>. Item wordt gemarkeerd als afgewezen.</>}
</div>
</div>
)}
{/* Footer */}
<div style={{display:"flex",gap:10}}>
<button onClick={submitReview} disabled={!decision||(decision==="return"&&!note.trim())}
style={{flex:1,padding:"11px",borderRadius:10,border:"none",fontSize:13,fontWeight:700,cursor:(!decision||(decision==="return"&&!note.trim()))?"default":"pointer",background:!decision||(decision==="return"&&!note.trim())?C.mushroom:decision==="verified"?C.green:decision==="return"?"#6366F1":C.red,color:CREAM,display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"background .15s"}}>
{decision==="verified"?<CheckCircle size={14}/>:decision==="return"?<RefreshCw size={14}/>:decision==="rejected"?<X size={14}/>:null}
{!decision?"Selecteer een beslissing":decision==="verified"?"Bevestig — Verifiëren":decision==="return"?"Bevestig — Terugsturen":"Bevestig — Afwijzen"}
</button>
<button onClick={()=>{setReviewing(null);setDecision("");setNote("");}} style={{padding:"11px 18px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
</div>
</div>
</div>
</div>
)}

</div>
);
}

// ─── CRM VIEW ────────────────────────────────────────────────────────────────

// ─── FORM HELPERS (module-level — never recreated, no focus loss) ─────────────
const FormField=({label,required,children})=>(
<div>
<div style={{fontSize:9,fontWeight:700,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6,color:"#7A6B60"}}>
  {label}{required&&<span style={{color:"#8B1A2B"}}> *</span>}
</div>
{children}
</div>
);

function FormInput({val,set,placeholder,type="text"}){
return(
<input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={placeholder}
style={{width:"100%",padding:"10px 13px",borderRadius:9,
  border:`1.5px solid ${val?"#8B1A2B":"#E4DDD5"}`,
  fontSize:12,outline:"none",boxSizing:"border-box",
  transition:"border-color .15s",fontFamily:"'Jost',sans-serif",background:C.bg,color:C.text}}/>
);
}

function NewClientModal({user,companyData,setCompanyData,onClose,showToast}){
const [dept,setDept]=useState(user.dept==="BOTH"?"TC":user.dept);
const [name,setName]=useState("");
const [kkf,setKkf]=useState("");
const [contact,setContact]=useState("");
const [contactRole,setContactRole]=useState("");
const [email,setEmail]=useState("");
const [phone,setPhone]=useState("");
const [lifecycle,setLifecycle]=useState("Strategische Groei");
const [industry,setIndustry]=useState("");
const [notes,setNotes]=useState("");
const [logoUrl,setLogoUrl]=useState(null);
const [logoDragging,setLogoDragging]=useState(false);
const [saving,setSaving]=useState(false);
const [createdAccount,setCreatedAccount]=useState(null);
const logoRef=React.useRef();

const LIFECYCLE_OPTIONS=["Strategische Groei","Herstructurering","Compliance Review","Portfolio Uitbreiding","Retainer","Due Diligence","Nieuw Prospect"];
const INDUSTRY_OPTIONS=["Energie & Olie","Financiële Diensten","Juridisch","Vastgoed","Handel & Logistiek","Overheid","Horeca & Toerisme","Mijnbouw","Landbouw","Technologie","Anders"];
const avatarFrom=n=>n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"??";
const isValid=name.trim()&&contact.trim()&&email.trim()&&email.includes("@")&&dept;

const submit=async()=>{
  if(!isValid||saving) return;
  setSaving(true);
  const kkfVal=kkf.trim()||`SR-${new Date().getFullYear()}-${String(companyData.length+1).padStart(4,"0")}`;
  try{
    const {data:compData,error:compErr}=await supabase
      .from("companies")
      .insert({
        name:name.trim(),
        kkf_number:kkfVal,
        department:dept,
        lifecycle_status:lifecycle,
        industry:industry||null,
        notes_internal:notes||null,
        logo_url:logoUrl||null,
        contact_name:contact.trim(),
        contact_email:email.trim(),
        contact_phone:phone.trim()||null,
        health:"green",
        created_by:user.id,
      })
      .select()
      .single();

    if(compErr) throw new Error(compErr.message);

    const {data:accountData}=await supabase.rpc("create_client_portal_account",{
      p_company_id:   compData.id,
      p_email:        email.trim(),
      p_company_name: name.trim(),
      p_department:   dept,
    });

    const account=accountData||{};
    const portalPw=account.password||`${name.trim().slice(0,3).toUpperCase()}${new Date().getFullYear()}#CP`;

    setCompanyData(cs=>[{
      id:compData.id,name:name.trim(),kkf:kkfVal,dept,
      contact:contact.trim(),role:contactRole.trim()||"Contactpersoon",
      email:email.trim(),phone:phone.trim(),lifecycle,industry,notes,
      avatar:avatarFrom(name),health:"green",logoUrl,
      createdAt:new Date().toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}),
    },...cs]);

    setCreatedAccount({companyName:name.trim(),email:email.trim(),password:portalPw,dept});
  }catch(e){
    console.warn("Create client error:",e.message);
    const newC={id:`c${Date.now()}`,name:name.trim(),kkf:kkfVal,dept,
      contact:contact.trim(),role:contactRole||"Contactpersoon",
      email:email.trim(),phone:phone.trim(),lifecycle,industry,notes,
      avatar:avatarFrom(name),health:"green",logoUrl,
      createdAt:new Date().toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"})};
    setCompanyData(cs=>[newC,...cs]);
    showToast(`Cliënt "${name}" aangemaakt (lokaal)`);
    onClose();
  }finally{ setSaving(false); }
};

useEffect(()=>{
  const h=e=>{if(e.key==="Escape")onClose();};
  window.addEventListener("keydown",h);
  document.body.classList.add("modal-open");
  return()=>{ window.removeEventListener("keydown",h); document.body.classList.remove("modal-open"); };
},[]);

if(createdAccount) return(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,pointerEvents:"auto",}}>
<div className="fu" style={{background:C.surface,borderRadius:20,width:500,maxWidth:"95vw",boxShadow:"0 40px 100px rgba(0,0,0,.5)",overflow:"hidden",fontFamily:F.body,boxShadow:"0 4px 32px rgba(0,0,0,.13),0 1px 6px rgba(0,0,0,.08),inset 0 0 0 1px rgba(0,0,0,.05)"}}>
  <div style={{padding:"28px 28px 24px",textAlign:"center"}}>
    <div style={{width:56,height:56,borderRadius:"50%",background:C.greenBg,border:`2px solid ${C.green}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
      <CheckCircle size={26} color={C.green}/>
    </div>
    <div style={{fontFamily:F.display,fontSize:22,fontWeight:600,color:C.text,marginBottom:6}}>Cliënt aangemaakt!</div>
    <div style={{fontSize:12,color:C.secondary,marginBottom:24}}>
      Portaalaccount voor <strong>{createdAccount.companyName}</strong> aangemaakt.<br/>
      Deel onderstaande gegevens veilig met de cliënt.
    </div>
    <div style={{background:C.warm50,borderRadius:14,padding:"18px 22px",textAlign:"left",marginBottom:20,border:`1px solid ${C.border}`}}>
      <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>PORTAAL INLOGGEGEVENS</div>
      {[
        ["E-mailadres",createdAccount.email],
        ["Tijdelijk wachtwoord",createdAccount.password],
        ["URL","tc-dash-4.vercel.app"],
      ].map(([label,val])=>(
        <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.secondary}}>{label}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <code style={{fontSize:12,fontWeight:700,color:C.text,background:C.surface,padding:"3px 8px",borderRadius:5}}>{val}</code>
            <button onClick={()=>navigator.clipboard?.writeText(val).then(()=>showToast(`${label} gekopieerd`))}
              style={{background:"none",border:`1px solid ${C.border}`,borderRadius:5,padding:"2px 7px",fontSize:9,cursor:"pointer",color:C.secondary}}>
              Kopieer
            </button>
          </div>
        </div>
      ))}
      <div style={{fontSize:10,color:C.amber,marginTop:10,display:"flex",alignItems:"center",gap:6}}>
        <AlertTriangle size={11}/> Vraag de cliënt het wachtwoord bij eerste login te wijzigen.
      </div>
    </div>
    <button onClick={onClose} style={{width:"100%",padding:"12px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(139,26,43,.24)"}}>
      Sluiten
    </button>
  </div>
</div>
</div>
);

return(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,pointerEvents:"auto",}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:640,maxWidth:"95vw",margin:"16px auto",boxShadow:"0 40px 100px rgba(58,46,40,.3)",display:"flex",flexDirection:"column",boxShadow:"0 4px 32px rgba(0,0,0,.13),0 1px 6px rgba(0,0,0,.08),inset 0 0 0 1px rgba(0,0,0,.05)"}}>

  {/* Header */}
  <div style={{padding:"20px 26px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.crimsonFaint,flexShrink:0}}>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{width:40,height:40,borderRadius:10,background:C.crimson,display:"flex",alignItems:"center",justifyContent:"center"}}><Users size={18} color={CREAM}/></div>
      <div>
        <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Nieuwe Cliënt Aanmaken</div>
        <div style={{fontSize:10,color:C.secondary}}>Portaalaccount wordt automatisch aangemaakt</div>
      </div>
    </div>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:4}}><X size={18}/></button>
  </div>

  {/* Body */}
  <div style={{overflowY:"auto",padding:"24px 26px",display:"flex",flexDirection:"column",gap:18,flex:1}}>

    {user.dept==="BOTH"&&(
      <div style={{display:"flex",gap:8}}>
        {["TC","FF"].map(d=>(
          <button key={d} onClick={()=>setDept(d)} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${dept===d?C.crimson:C.border}`,background:dept===d?C.crimsonFaint:"transparent",color:dept===d?C.crimson:C.secondary,fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {d==="TC"?"Tactigent Consultancy":"Fiscal Fuse"}
          </button>
        ))}
      </div>
    )}

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <FormField label="Bedrijfsnaam" required><FormInput val={name} set={setName} placeholder="Bijv. Wrokomang Logistics N.V."/></FormField>
      <FormField label="KKF-nummer">
        <input value={kkf} onChange={e=>setKkf(e.target.value)} placeholder="SR-2025-0001 (auto)"
          style={{width:"100%",padding:"10px 13px",borderRadius:9,border:`1.5px solid ${kkf?C.crimson:C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:"inherit",color:"inherit"}}/>
      </FormField>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <FormField label="Sector / Industrie">
        <select value={industry} onChange={e=>setIndustry(e.target.value)}
          style={{width:"100%",padding:"10px 13px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",background:"inherit",color:"inherit",cursor:"pointer"}}>
          <option value="">Selecteer sector...</option>
          {INDUSTRY_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      </FormField>
      <FormField label="Lifecycle Status">
        <select value={lifecycle} onChange={e=>setLifecycle(e.target.value)}
          style={{width:"100%",padding:"10px 13px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",background:"inherit",color:"inherit",cursor:"pointer"}}>
          {LIFECYCLE_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      </FormField>
    </div>

    <div style={{display:"flex",alignItems:"center",gap:12}}>
      <div style={{flex:1,height:1,background:C.border}}/>
      <span style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em"}}>PRIMAIR CONTACTPERSOON</span>
      <div style={{flex:1,height:1,background:C.border}}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <FormField label="Volledige naam" required><FormInput val={contact} set={setContact} placeholder="Bijv. Jan Jansen"/></FormField>
      <FormField label="Functietitel"><FormInput val={contactRole} set={setContactRole} placeholder="Bijv. CFO, Directeur"/></FormField>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <FormField label="E-mailadres" required><FormInput val={email} set={setEmail} placeholder="naam@bedrijf.sr" type="email"/></FormField>
      <FormField label="Telefoonnummer"><FormInput val={phone} set={setPhone} placeholder="+597 8xx-xxxx"/></FormField>
    </div>

    <FormField label="Bedrijfslogo">
      <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/svg+xml" style={{display:"none"}}
        onChange={e=>{
          const f=e.target.files?.[0];
          if(!f||f.size>2*1024*1024) return;
          const reader=new FileReader();
          reader.onload=ev=>setLogoUrl(ev.target.result);
          reader.readAsDataURL(f);
        }}/>
      <div onClick={()=>logoRef.current?.click()}
        onDragOver={e=>{e.preventDefault();setLogoDragging(true);}}
        onDragLeave={()=>setLogoDragging(false)}
        onDrop={e=>{
          e.preventDefault();setLogoDragging(false);
          const f=e.dataTransfer.files?.[0];
          if(!f||f.size>2*1024*1024) return;
          const reader=new FileReader();
          reader.onload=ev=>setLogoUrl(ev.target.result);
          reader.readAsDataURL(f);
        }}
        style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:10,
          border:`2px dashed ${logoDragging?C.crimson:C.border}`,cursor:"pointer",
          background:logoDragging?C.crimsonFaint:C.warm50,transition:"border-color .15s,background .15s"}}>
        {logoUrl
          ? <img src={logoUrl} alt="logo" style={{width:40,height:40,borderRadius:8,objectFit:"contain"}}/>
          : <div style={{width:40,height:40,borderRadius:8,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center"}}><Upload size={16} color={C.secondary}/></div>
        }
        <div>
          <div style={{fontSize:12,fontWeight:600,color:C.text}}>Klik of sleep een afbeelding</div>
          <div style={{fontSize:10,color:C.secondary}}>PNG, JPG, SVG · Max 2 MB · Aanbevolen: 200×200px</div>
        </div>
      </div>
    </FormField>

    <FormField label="Interne notities">
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Aanvullende context, referenties, bijzonderheden..."
        rows={3} style={{width:"100%",padding:"10px 13px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit",background:"inherit",color:"inherit"}}/>
    </FormField>

    {name&&(
      <div style={{background:C.warm50,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:14}}>
        {logoUrl
          ? <img src={logoUrl} alt={name} style={{width:44,height:44,borderRadius:10,objectFit:"contain",border:`1px solid ${C.border}`,background:CREAM,flexShrink:0}}/>
          : <div style={{width:44,height:44,borderRadius:10,background:dept==="TC"?C.crimson:C.taupe,display:"flex",alignItems:"center",justifyContent:"center",color:CREAM,fontWeight:700,fontSize:14,flexShrink:0}}>{avatarFrom(name)}</div>
        }
        <div>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:3}}>{name}</div>
          <div style={{fontSize:11,color:C.secondary}}>{contact||"Contactpersoon"}{contactRole&&` · ${contactRole}`}</div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5}}>
            <DeptTag dept={dept}/><span style={{fontSize:9,color:C.secondary}}>{lifecycle}</span>
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Footer */}
  <div style={{padding:"16px 26px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0,background:C.surface}}>
    <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
      {!isValid&&!saving&&(
        <div style={{fontSize:10,color:C.amber,display:"flex",alignItems:"center",gap:5}}>
          <AlertTriangle size={11}/>
          {!name.trim()?"Bedrijfsnaam verplicht":!contact.trim()?"Contactpersoon verplicht":!email.includes("@")?"Geldig e-mailadres verplicht":"Vul verplichte velden in"}
        </div>
      )}
      <button onClick={submit} disabled={!isValid||saving} style={{width:"100%",padding:"12px",borderRadius:10,background:isValid&&!saving?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:isValid&&!saving?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
        {saving
          ? <><div style={{width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:CREAM,borderRadius:"50%",animation:"spin 1s linear infinite"}}/> Aanmaken...</>
          : <><Users size={15}/> Cliënt aanmaken</>
        }
      </button>
    </div>
    <button onClick={onClose} style={{padding:"12px 20px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
  </div>
</div>
</div>
);
}

function CRMView({user,companyData,setCompanyData,setDetailCompany,showToast}){
// Refresh company list from Supabase on mount
useEffect(()=>{
  supabase.from("companies")
    .select("id,name,kkf_number,department,lifecycle_status,industry,health,contact_name,contact_email,logo_url,created_at")
    .order("created_at",{ascending:false})
    .then(({data})=>{
      if(data?.length) setCompanyData(data.map(c=>({
        id:c.id,name:c.name,kkf:c.kkf_number,dept:c.department,
        lifecycle:c.lifecycle_status,industry:c.industry,
        health:c.health||"green",contact:c.contact_name,email:c.contact_email,
        logoUrl:c.logo_url,
        avatar:(c.name||"??").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),
      })));
    });
},[]);
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
<div key={s.l} style={{textAlign:"center",background:s.dark?C.darkAccent:C.surface,borderRadius:12,padding:"11px 18px",border:s.dark?"none":`1px solid ${C.border}`}}>
<div style={{fontSize:8.5,fontWeight:700,color:s.dark?C.muted:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
<div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:s.dark?C.onDark:C.crimson}}>{s.v}</div>
</div>
))}
<button onClick={()=>setShowNew(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"10px 16px",borderRadius:10,background:C.crimson,color:C.onDark,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",alignSelf:"center"}}>
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
<div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07),0 1px 2px rgba(58,46,40,.04)"}}>
{list.length===0?(
<div style={{padding:"48px 24px",textAlign:"center"}}>
<Users size={32} color={C.mushroom} style={{marginBottom:12}}/>
<div style={{fontSize:14,fontWeight:600,color:C.secondary,marginBottom:8}}>{q?"Geen resultaten gevonden":"Nog geen cliënten"}</div>
<button onClick={()=>setShowNew(true)} style={{padding:"9px 20px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6}}><Plus size={13}/> Eerste cliënt aanmaken</button>
</div>
):(
<table style={{width:"100%",borderCollapse:"collapse"}}>
<thead><tr style={{background:C.warm50}}>{[t("companyName"),t("contactPerson"),"AFDELING","SECTOR",t("lifecycle"),""].map((h,i)=><th key={i} style={{padding:"10px 20px",textAlign:"left",fontSize:10,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{list.length===0?(<tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:C.secondary,fontSize:13}}>Geen cliënten gevonden. Maak een nieuwe cliënt aan via de knop rechtsboven.</td></tr>):list.map(c=>(
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
<td style={{padding:"13px 19px",display:"flex",alignItems:"center",gap:8}}>
<ChevronRight size={15} color={C.secondary}/>
{(user.role==="super_admin")&&(
<button onClick={async(e)=>{
  e.stopPropagation();
  if(!window.confirm(`Cliënt "${c.name}" verwijderen? Alle gekoppelde data wordt ook verwijderd.`)) return;
  try{
    await fetch(`${SB_URL}/rest/v1/companies?id=eq.${c.id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`}});
    setCompanyData(cs=>cs.filter(x=>x.id!==c.id));
    showToast(`"${c.name}" verwijderd`);
  }catch(e){ showToast("Fout: "+e.message); }
}} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:7,border:`1px solid ${C.red}30`,background:C.redBg,color:C.red,fontSize:9,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
<X size={10}/> Verwijder
</button>
)}
</td>
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
const TC_STAGES=[
  {id:"new",      label:"Nieuw",           pct:0,   color:C.secondary, bg:C.warm50},
  {id:"qualified",label:"Gekwalificeerd",  pct:33,  color:C.amber,     bg:C.amberBg},
  {id:"proposal", label:"Voorstel",        pct:66,  color:C.crimson,   bg:C.crimsonFaint},
  {id:"won",      label:"Gewonnen",        pct:100, color:C.green,     bg:C.greenBg},
];
const FF_STAGES=[
  {id:"inquiry",        label:"Aanvraag",        pct:0,   color:C.secondary, bg:C.warm50},
  {id:"strategy_review",label:"Strategie Review", pct:50,  color:C.amber,     bg:C.amberBg},
  {id:"engaged",        label:"Betrokken",        pct:75,  color:C.crimson,   bg:C.crimsonFaint},
  {id:"won",            label:"Gewonnen",          pct:100, color:C.green,     bg:C.greenBg},
];
const LOST_STAGE={id:"lost",label:"Verloren",pct:0,color:C.red,bg:C.redBg};

function LeadsView({user,setDetailLead,showToast}){
const {members}=useTeamMembers(user.dept);
const [leads,setLeads]=useState([]);
const [loading,setLoading]=useState(true);
const [view,setView]=useState("kanban"); // kanban | list
const [deptF,setDeptF]=useState(user.dept==="BOTH"?"ALL":user.dept);
const [q,setQ]=useState("");
const [showNew,setShowNew]=useState(false);
const [newStage,setNewStage]=useState("new"); // pre-select stage when clicking +

// Load from DB
useEffect(()=>{
  supabase.from("leads")
    .select("id,company_name,contact_name,contact_email,phone,estimated_value,stage,department,assigned_to,notes,source,priority,expected_close,created_at")
    .order("created_at",{ascending:false})
    .then(({data})=>{
      setLeads((data||[]).map(l=>({
        id:l.id, name:l.company_name||"—", contact:l.contact_name||"",
        email:l.contact_email||"", phone:l.phone||"",
        value:Number(l.estimated_value)||0, stage:l.stage||"new",
        dept:l.department, assignedTo:l.assigned_to,
        notes:l.notes||"", source:l.source||"",
        priority:l.priority||"normal",
        expectedClose:l.expected_close||null,
        createdAt:l.created_at||null,
        daysSinceCreated:l.created_at?Math.floor((new Date()-new Date(l.created_at))/86400000):0,
      })));
      setLoading(false);
    }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[]);

const stages=deptF==="FF"?FF_STAGES:TC_STAGES;
const allStages=[...stages,LOST_STAGE];

const filtered=leads.filter(l=>{
  const dOk=deptF==="ALL"||(l.dept===deptF);
  const qOk=!q||l.name.toLowerCase().includes(q.toLowerCase())||l.contact.toLowerCase().includes(q.toLowerCase());
  return dOk&&qOk;
});

// KPI totals
const totalValue=filtered.filter(l=>l.stage!=="lost").reduce((s,l)=>s+l.value,0);
const wonValue=filtered.filter(l=>l.stage==="won").reduce((s,l)=>s+l.value,0);
const convRate=filtered.length?Math.round((filtered.filter(l=>l.stage==="won").length/filtered.length)*100):0;

const moveLead=async(leadId,newStage)=>{
  setLeads(ls=>ls.map(l=>l.id===leadId?{...l,stage:newStage}:l));
  await supabase.from("leads").update({stage:newStage}).eq("id",leadId);
};

const deleteLead=async(id,name)=>{
  if(!window.confirm(`Lead "${name}" verwijderen?`)) return;
  setLeads(ls=>ls.filter(l=>l.id!==id));
  await fetch(`${SB_URL}/rest/v1/leads?id=eq.${id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`}});
  if(showToast) showToast(`"${name}" verwijderd`);
};

const convertToClient=async(lead)=>{
  if(!window.confirm(`Lead "${lead.name}" converteren naar cliënt? Er wordt een nieuw bedrijfsprofiel aangemaakt.`)) return;
  try{
    // Create company
    const {data:company,error}=await supabase.from("companies").insert({
      name:lead.name,
      department:lead.dept||"TC",
      contact_name:lead.contact||null,
      contact_email:lead.email||null,
      lifecycle_status:"Nieuw Prospect",
      health:"green",
    }).select("id,name").single();
    if(error) throw new Error(error.message);
    // Mark lead as won + converted
    await supabase.from("leads").update({stage:"won",converted_at:new Date().toISOString(),converted_company_id:company.id}).eq("id",lead.id);
    setLeads(ls=>ls.map(l=>l.id===lead.id?{...l,stage:"won"}:l));
    if(showToast) showToast(`"${lead.name}" geconverteerd naar cliënt ✓`);
  }catch(e){
    if(showToast) showToast("Fout bij conversie: "+e.message);
  }
};

return(
<div>
  {/* Header */}
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
    <PageHeader kicker="CRM" title="Leads Pipeline"/>
    <div style={{display:"flex",gap:8,marginTop:4}}>
      {/* View toggle */}
      <div style={{display:"flex",border:`1px solid ${C.border}`,borderRadius:9,overflow:"hidden"}}>
        {[{v:"kanban",Icon:Layers},{v:"list",Icon:BarChart3}].map(({v,Icon})=>(
          <button key={v} onClick={()=>setView(v)}
            style={{padding:"7px 12px",border:"none",cursor:"pointer",background:view===v?C.crimson:"transparent",color:view===v?CREAM:C.secondary,display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700}}>
            <Icon size={13}/> {v==="kanban"?"Kanban":"Lijst"}
          </button>
        ))}
      </div>
      <button onClick={()=>{setNewStage("new");setShowNew(true);}}
        style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>
        <Plus size={13}/> Nieuwe lead
      </button>
    </div>
  </div>

  {/* KPI strip */}
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
  {[
    {l:"TOTALE PIPELINE",v:`SRD ${(totalValue/1000).toFixed(0)}K`,c:C.text},
    {l:"GEWONNEN",v:`SRD ${(wonValue/1000).toFixed(0)}K`,c:C.green},
    {l:"CONVERSIE",v:`${convRate}%`,c:convRate>=30?C.green:C.amber},
    {l:"ACTIEVE LEADS",v:filtered.filter(l=>l.stage!=="won"&&l.stage!=="lost").length,c:C.crimson},
  ].map(k=>(
    <div key={k.l} style={{background:C.surface,borderRadius:12,padding:"12px 16px",border:`1px solid ${C.border}`}}>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
      <div style={{fontFamily:F.display,fontSize:24,fontWeight:600,color:k.c}}>{k.v}</div>
    </div>
  ))}
  </div>

  {/* Filter bar */}
  <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
    <div style={{position:"relative",flex:1,minWidth:200,maxWidth:320}}>
      <Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek lead..."
        style={{width:"100%",padding:"7px 30px 7px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
      {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
    </div>
    {user.dept==="BOTH"&&["ALL","TC","FF"].map(d=>(
      <button key={d} onClick={()=>setDeptF(d)}
        style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${deptF===d?C.crimson:C.border}`,background:deptF===d?C.crimson:"transparent",color:deptF===d?CREAM:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
        {d==="ALL"?"Alle":d}
      </button>
    ))}
  </div>

  {/* ── KANBAN BOARD ── */}
  {view==="kanban"&&(
    <div style={{display:"grid",gridTemplateColumns:`repeat(${allStages.length},1fr)`,gap:12,alignItems:"start"}}>
      {allStages.map(stage=>{
        const stageLeads=filtered.filter(l=>l.stage===stage.id);
        const stageVal=stageLeads.reduce((s,l)=>s+l.value,0);
        return(
          <div key={stage.id}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{e.preventDefault();const id=e.dataTransfer.getData("leadId");if(id)moveLead(id,stage.id);}}>
            {/* Column header */}
            <div style={{padding:"10px 12px",borderRadius:"10px 10px 0 0",background:stage.bg,border:`1px solid ${stage.color}30`,borderBottom:"none",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:0}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:stage.color}}/>
                <span style={{fontSize:11,fontWeight:700,color:stage.color,textTransform:"uppercase",letterSpacing:"0.07em"}}>{stage.label}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:10,fontWeight:700,color:stage.color,background:`${stage.color}20`,padding:"2px 7px",borderRadius:8}}>{stageLeads.length}</span>
              </div>
            </div>
            {stageVal>0&&(
              <div style={{padding:"4px 12px",background:stage.bg,borderLeft:`1px solid ${stage.color}30`,borderRight:`1px solid ${stage.color}30`,fontSize:10,color:stage.color,fontWeight:700}}>
                SRD {(stageVal/1000).toFixed(0)}K
              </div>
            )}

            {/* Cards */}
            <div style={{display:"flex",flexDirection:"column",gap:6,padding:"8px",background:C.bg,borderRadius:"0 0 10px 10px",border:`1px solid ${C.border}`,borderTop:"none",minHeight:80}}>
              {stageLeads.map(lead=>(
                <div key={lead.id} draggable
                  onDragStart={e=>{e.dataTransfer.setData("leadId",lead.id);e.currentTarget.style.opacity="0.5";}}
                  onDragEnd={e=>{e.currentTarget.style.opacity="1";}}
                  onClick={()=>setDetailLead&&setDetailLead(lead)}
                  style={{background:C.surface,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`,cursor:"pointer",transition:"box-shadow .15s",boxShadow:"0 1px 3px rgba(58,46,40,.06)"}}>
                  {/* Card header */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text,lineHeight:1.3,flex:1,paddingRight:8}}>{lead.name}</div>
                    <button onClick={e=>{e.stopPropagation();deleteLead(lead.id,lead.name);}}
                      style={{width:20,height:20,borderRadius:5,border:"none",background:"transparent",cursor:"pointer",color:C.mushroom,display:"flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0,opacity:0.6}}>
                      <X size={11}/>
                    </button>
                  </div>
                  {lead.contact&&<div style={{fontSize:10,color:C.secondary,marginBottom:4}}>{lead.contact}</div>}
                  {/* Value */}
                  <div style={{fontFamily:F.display,fontSize:15,fontWeight:600,color:C.crimson,marginBottom:6}}>SRD {lead.value.toLocaleString()}</div>
                  {/* Follow-up reminder */}
                  {lead.daysSinceCreated>14&&lead.stage!=="won"&&lead.stage!=="lost"&&(
                    <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 7px",borderRadius:5,background:lead.daysSinceCreated>30?C.redBg:C.amberBg,marginBottom:6}}>
                      <Clock size={9} color={lead.daysSinceCreated>30?C.red:C.amber}/>
                      <span style={{fontSize:9,fontWeight:700,color:lead.daysSinceCreated>30?C.red:C.amber}}>
                        {lead.daysSinceCreated}d geen activiteit
                      </span>
                    </div>
                  )}
                  {/* Footer */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <DeptTag dept={lead.dept}/>
                    {/* Stage move buttons */}
                    <div style={{display:"flex",gap:4}}>
                      {stage.id!=="won"&&stage.id!=="lost"&&(
                        <button onClick={e=>{e.stopPropagation();const nextIdx=allStages.findIndex(s=>s.id===stage.id)+1;if(nextIdx<allStages.length-1)moveLead(lead.id,allStages[nextIdx].id);}}
                          title="Volgende fase"
                          style={{width:22,height:22,borderRadius:6,border:`1px solid ${C.border}`,background:C.bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.secondary}}>
                          <ChevronRight size={11}/>
                        </button>
                      )}
                      {stage.id==="won"&&(
                        <button onClick={e=>{e.stopPropagation();convertToClient(lead);}}
                          title="Converteer naar cliënt"
                          style={{fontSize:9,fontWeight:700,padding:"3px 7px",borderRadius:6,border:`1px solid ${C.green}40`,background:C.greenBg,color:C.green,cursor:"pointer",whiteSpace:"nowrap"}}>
                          + Cliënt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Quick add */}
              {stage.id!=="lost"&&(
                <button onClick={()=>{setNewStage(stage.id);setShowNew(true);}}
                  style={{width:"100%",padding:"7px",borderRadius:8,border:`1.5px dashed ${C.border}`,background:"transparent",color:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:2}}>
                  <Plus size={11}/> Toevoegen
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )}

  {/* ── LIST VIEW ── */}
  {view==="list"&&(
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 1px 4px rgba(58,46,40,.07)"}}>
      {loading?(
        <div style={{padding:"40px 24px",textAlign:"center",color:C.secondary}}>Laden...</div>
      ):filtered.length===0?(
        <div style={{padding:"52px 24px",textAlign:"center"}}>
          <TrendingUp size={32} color={C.mushroom} style={{marginBottom:12}}/>
          <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:6}}>Geen leads gevonden</div>
          <button onClick={()=>setShowNew(true)} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",marginTop:8}}>
            <Plus size={13}/> Eerste lead aanmaken
          </button>
        </div>
      ):(
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:C.warm50}}>
              {["BEDRIJF","CONTACT","AFDELING","STADIUM","WAARDE","SLUITDATUM",""].map((h,i)=>(
                <th key={i} style={{padding:"10px 16px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(l=>{
              const stg=allStages.find(s=>s.id===l.stage)||allStages[0];
              return(
                <tr key={l.id} onClick={()=>setDetailLead&&setDetailLead(l)} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
                  <td style={{padding:"13px 16px"}}>
                    <div style={{fontSize:13,fontWeight:700,color:C.text}}>{l.name}</div>
                    {l.source&&<div style={{fontSize:10,color:C.muted}}>{l.source}</div>}
                  </td>
                  <td style={{padding:"13px 16px"}}>
                    <div style={{fontSize:12,color:C.text}}>{l.contact||"—"}</div>
                    {l.email&&<div style={{fontSize:10,color:C.secondary}}>{l.email}</div>}
                  </td>
                  <td style={{padding:"13px 16px"}}><DeptTag dept={l.dept}/></td>
                  <td style={{padding:"13px 16px"}}>
                    <span style={{fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,background:stg.bg,color:stg.color,textTransform:"uppercase"}}>{stg.label}</span>
                  </td>
                  <td style={{padding:"13px 16px",fontFamily:F.display,fontSize:15,fontWeight:600,color:C.crimson}}>SRD {l.value.toLocaleString()}</td>
                  <td style={{padding:"13px 16px",fontSize:11,color:C.secondary}}>{l.expectedClose||"—"}</td>
                  <td style={{padding:"13px 16px"}}>
                    <div style={{display:"flex",gap:6}}>
                      {l.stage==="won"&&(
                        <button onClick={e=>{e.stopPropagation();convertToClient(l);}}
                          style={{padding:"4px 9px",borderRadius:7,border:`1px solid ${C.green}40`,background:C.greenBg,color:C.green,fontSize:9,fontWeight:700,cursor:"pointer"}}>
                          → Cliënt
                        </button>
                      )}
                      <button onClick={e=>{e.stopPropagation();deleteLead(l.id,l.name);}}
                        style={{padding:"4px 8px",borderRadius:7,border:`1px solid ${C.red}30`,background:C.redBg,color:C.red,fontSize:9,fontWeight:700,cursor:"pointer"}}>
                        <X size={10}/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  )}

  {/* ── NEW LEAD MODAL ── */}
  {showNew&&(
    <NewLeadModal
      user={user} members={members} initialStage={newStage}
      onClose={()=>setShowNew(false)}
      onCreated={lead=>{setLeads(ls=>[lead,...ls]);if(showToast)showToast(`Lead "${lead.name}" aangemaakt ✓`);}}
      showToast={showToast}
    />
  )}
</div>
);
}


function NewLeadModal({user,members,initialStage,onClose,onCreated,showToast}){
const [name,setName]=useState("");
const [contact,setContact]=useState("");
const [email,setEmail]=useState("");
const [phone,setPhone]=useState("");
const [dept,setDept]=useState(user.dept==="BOTH"?"TC":user.dept);
const [stage,setStage]=useState(initialStage||"new");
const [value,setValue]=useState("");
const [assignedTo,setAssignedTo]=useState("");
const [source,setSource]=useState("");
const [expectedClose,setExpectedClose]=useState("");
const [notes,setNotes]=useState("");
const [saving,setSaving]=useState(false);

const stages=dept==="FF"?FF_STAGES:TC_STAGES;
const isValid=name.trim().length>1;
const dropLoading=!Array.isArray(members)||members.length===0;

useEffect(()=>{
  const h=e=>{if(e.key==="Escape")onClose();};
  window.addEventListener("keydown",h);
  return()=>window.removeEventListener("keydown",h);
},[]);

const submit=async()=>{
  if(!isValid||saving) return;
  setSaving(true);
  try{
    const {data,error}=await supabase.from("leads").insert({
      company_name:name.trim(),
      contact_name:contact.trim()||null,
      contact_email:email.trim()||null,
      phone:phone.trim()||null,
      department:dept,
      stage,
      estimated_value:Number(value)||0,
      assigned_to:assignedTo||null,
      source:source||null,
      expected_close:expectedClose||null,
      notes:notes.trim()||null,
      created_by:user.id,
    }).select().single();
    if(error) throw new Error(error.message);
    onCreated({
      id:data.id,name:data.company_name,contact:data.contact_name||"",
      email:data.contact_email||"",phone:data.phone||"",
      value:Number(data.estimated_value)||0,stage:data.stage,
      dept:data.department,assignedTo:data.assigned_to,
      source:data.source||"",notes:data.notes||"",
      expectedClose:data.expected_close||null,priority:"normal",
    });
    onClose();
  }catch(e){
    if(showToast) showToast("Fout: "+e.message);
  }finally{setSaving(false);}
};

return(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:580,maxWidth:"95vw",maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 4px 32px rgba(0,0,0,.18)",overflow:"hidden",fontFamily:F.body}}>
  {/* Header */}
  <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,background:C.crimsonFaint,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:3}}>Leads Pipeline</div>
      <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text}}>Nieuwe Lead aanmaken</div>
    </div>
    <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.secondary}}><X size={14}/></button>
  </div>
  {/* Body */}
  <div style={{overflowY:"auto",padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
    {/* Dept */}
    {user.dept==="BOTH"&&(
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>AFDELING</div>
        <div style={{display:"flex",gap:8}}>
          {["TC","FF"].map(d=>(
            <button key={d} onClick={()=>setDept(d)}
              style={{flex:1,padding:"9px",borderRadius:9,border:`2px solid ${dept===d?C.crimson:C.border}`,background:dept===d?C.crimsonFaint:"transparent",color:dept===d?C.crimson:C.secondary,fontSize:12,fontWeight:700,cursor:"pointer"}}>
              {d==="TC"?"Tactigent Consultancy":"Fiscal Fuse"}
            </button>
          ))}
        </div>
      </div>
    )}
    {/* Company + Value */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>BEDRIJFSNAAM <span style={{color:C.crimson}}>*</span></div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Bijv. Volkskrant N.V."
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${name.length>1?C.crimson:C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
      </div>
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>GESCHATTE WAARDE (SRD)</div>
        <input type="number" value={value} onChange={e=>setValue(e.target.value)} placeholder="0"
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
      </div>
    </div>
    {/* Contact */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>CONTACTPERSOON</div>
        <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="Naam contactpersoon"
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
      </div>
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>E-MAILADRES</div>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="naam@bedrijf.sr"
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
      </div>
    </div>
    {/* Stage */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>STARTSTADIUM</div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {stages.map(s=>(
          <button key={s.id} onClick={()=>setStage(s.id)}
            style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${stage===s.id?s.color:C.border}`,background:stage===s.id?s.bg:"transparent",color:stage===s.id?s.color:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
    {/* Source + Close date */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>BRON</div>
        <select value={source} onChange={e=>setSource(e.target.value)}
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
          <option value="">Selecteer bron...</option>
          {["Website","Referral","Netwerkevenement","Cold outreach","Social media","Anders"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>VERWACHTE SLUITDATUM</div>
        <input type="date" value={expectedClose} onChange={e=>setExpectedClose(e.target.value)}
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",background:C.bg,color:C.text,boxSizing:"border-box"}}/>
      </div>
    </div>
    {/* Assign */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>TOEWIJZEN AAN</div>
      <select value={assignedTo} onChange={e=>setAssignedTo(e.target.value)} disabled={dropLoading}
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
        {dropLoading
          ? <option disabled>Laden...</option>
          : <>
              <option value="">— Selecteer adviseur —</option>
              {members.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}
            </>
        }
      </select>
    </div>
    {/* Notes */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>NOTITIES</div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Eerste indruk, context, aantekeningen..."
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:F.body,background:C.bg,color:C.text,lineHeight:1.6}}/>
    </div>
  </div>
  {/* Footer */}
  <div style={{padding:"12px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0}}>
    <button onClick={submit} disabled={!isValid||saving}
      style={{flex:1,padding:"11px",borderRadius:10,background:isValid?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:isValid?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
      <TrendingUp size={14}/>{saving?"Aanmaken...":"Lead aanmaken"}
    </button>
    <button onClick={onClose} style={{padding:"11px 18px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
  </div>
</div>
</div>
);
}


function LeadDetail({lead,onBack,showToast}){
const stages=lead.dept==="FF"?FF_STAGES:TC_STAGES;
const allStages=[...stages,LOST_STAGE];
const currentStage=allStages.find(s=>s.id===lead.stage)||allStages[0];
const currentPct=currentStage.pct;
const [activities,setActivities]=useState([]);
const [note,setNote]=useState("");
const [noteType,setNoteType]=useState("note");
const [savingNote,setSavingNote]=useState(false);
const [currentLead,setCurrentLead]=useState(lead);

useEffect(()=>{
  supabase.from("lead_activities").select("*").eq("lead_id",lead.id).order("created_at",{ascending:false})
    .then(({data})=>setActivities(data||[])).catch(e=>console.warn("DB [client_actions]:", e?.message||e));
},[lead.id]);

const moveStage=async(newStageId)=>{
  await supabase.from("leads").update({stage:newStageId}).eq("id",lead.id);
  setCurrentLead(l=>({...l,stage:newStageId}));
  showToast(`Stadium bijgewerkt naar ${allStages.find(s=>s.id===newStageId)?.label}`);
};

const addActivity=async()=>{
  if(!note.trim()||savingNote) return;
  setSavingNote(true);
  try{
    const {data}=await supabase.from("lead_activities").insert({
      lead_id:lead.id,type:noteType,content:note.trim(),
    }).select().single();
    setActivities(as=>[data,...as]);
    setNote("");
    showToast("Activiteit opgeslagen ✓");
  }catch(e){showToast("Fout: "+e.message);}
  setSavingNote(false);
};

const typeIcon={note:<FileText size={12}/>,call:<Activity size={12}/>,email:<Send size={12}/>,meeting:<Users size={12}/>,stage_change:<RefreshCw size={12}/>};
const typeColor={note:C.secondary,call:C.amber,email:C.indigo,meeting:C.crimson,stage_change:C.green};

return(
<div className="fu">
  <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:C.secondary,fontSize:12,fontWeight:600,marginBottom:16,padding:0}}>
    <ChevronLeft size={15}/> Terug naar leads
  </button>

  {/* Header card */}
  <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,padding:"24px 28px",marginBottom:16}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <DeptTag dept={currentLead.dept}/>
          <span style={{fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,background:currentStage.bg,color:currentStage.color,textTransform:"uppercase"}}>{currentStage.label}</span>
        </div>
        <h1 style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:C.text,margin:"0 0 4px"}}>{currentLead.name}</h1>
        <div style={{fontSize:12,color:C.secondary}}>{currentLead.contact||"Geen contactpersoon"}{currentLead.email&&` · ${currentLead.email}`}</div>
      </div>
      <div style={{textAlign:"right"}}>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>GESCHATTE WAARDE</div>
        <div style={{fontFamily:F.display,fontSize:28,fontWeight:600,color:C.crimson}}>SRD {currentLead.value?.toLocaleString()}</div>
      </div>
    </div>

    {/* Pipeline progress bar */}
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase"}}>PIPELINE VOORTGANG</div>
        <div style={{fontSize:10,fontWeight:700,color:currentStage.color}}>{currentPct}%</div>
      </div>
      <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden",marginBottom:12}}>
        <div style={{height:"100%",width:`${currentPct}%`,background:`linear-gradient(90deg,${C.crimson},${currentStage.color})`,borderRadius:3,transition:"width .4s"}}/>
      </div>
      {/* Stage buttons */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {allStages.map(s=>(
          <button key={s.id} onClick={()=>moveStage(s.id)}
            style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${currentLead.stage===s.id?s.color:C.border}`,background:currentLead.stage===s.id?s.bg:"transparent",color:currentLead.stage===s.id?s.color:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer",transition:"all .15s"}}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  </div>

  <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:16}}>
    {/* Left: Activity log */}
    <div>
      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 1px 4px rgba(58,46,40,.06)"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,fontSize:13,fontWeight:700,color:C.text}}>Activiteiten & Notities</div>
        {/* Add activity */}
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,background:C.warm50}}>
          <div style={{display:"flex",gap:6,marginBottom:8}}>
            {[{v:"note",l:"Notitie"},{v:"call",l:"Gesprek"},{v:"email",l:"E-mail"},{v:"meeting",l:"Meeting"}].map(t=>(
              <button key={t.v} onClick={()=>setNoteType(t.v)}
                style={{padding:"4px 10px",borderRadius:16,border:`1.5px solid ${noteType===t.v?typeColor[t.v]:C.border}`,background:noteType===t.v?`${typeColor[t.v]}18`:"transparent",color:noteType===t.v?typeColor[t.v]:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                {typeIcon[t.v]} {t.l}
              </button>
            ))}
          </div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&e.metaKey)addActivity();}} rows={2}
            placeholder={noteType==="call"?"Gespreksverslag...":noteType==="meeting"?"Verslag van de meeting...":noteType==="email"?"Samenvatting e-mail...":"Notitie toevoegen..."}
            style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:F.body,background:C.bg,color:C.text,lineHeight:1.6,marginBottom:8}}/>
          <button onClick={addActivity} disabled={!note.trim()||savingNote}
            style={{padding:"7px 16px",borderRadius:8,background:note.trim()?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:note.trim()?"pointer":"default"}}>
            {savingNote?"Opslaan...":"Opslaan"}
          </button>
        </div>
        {/* Activity list */}
        {activities.length===0?(
          <div style={{padding:"28px 24px",textAlign:"center",color:C.secondary,fontSize:12}}>Nog geen activiteiten. Voeg een notitie toe om te beginnen.</div>
        ):activities.map((a,i)=>(
          <div key={a.id} style={{padding:"13px 18px",borderTop:i>0?`1px solid ${C.border}`:"none",display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:28,height:28,borderRadius:7,background:`${typeColor[a.type]||C.secondary}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:typeColor[a.type]||C.secondary}}>
              {typeIcon[a.type]||<FileText size={11}/>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:C.text,lineHeight:1.6,marginBottom:3}}>{a.content}</div>
              <div style={{fontSize:10,color:C.muted}}>{a.author_name||"Systeem"} · {new Date(a.created_at).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Right: Details + Actions */}
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"18px"}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Lead Details</div>
        {[
          ["Bedrijf",currentLead.name],
          ["Contactpersoon",currentLead.contact||"—"],
          ["E-mail",currentLead.email||"—"],
          ["Telefoon",currentLead.phone||"—"],
          ["Bron",currentLead.source||"—"],
          ["Sluitdatum",currentLead.expectedClose||"—"],
          ["Afdeling",currentLead.dept==="TC"?"Tactigent":"Fiscal Fuse"],
        ].map(([l,v])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderTop:`1px solid ${C.border}`}}>
            <span style={{fontSize:11,color:C.secondary}}>{l}</span>
            <span style={{fontSize:11,fontWeight:600,color:C.text,maxWidth:160,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis"}}>{v}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"18px"}}>
        <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12}}>Acties</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {currentLead.stage!=="won"&&(
            <button onClick={()=>moveStage("won")}
              style={{width:"100%",padding:"9px 14px",borderRadius:9,background:C.greenBg,border:`1px solid ${C.green}40`,color:C.green,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
              <CheckCircle size={14}/> Markeer als Gewonnen
            </button>
          )}
          {currentLead.stage==="won"&&(
            <button onClick={()=>{/* convertToClient */showToast("Conversie — ga naar de lijst");}}
              style={{width:"100%",padding:"9px 14px",borderRadius:9,background:C.crimson,border:"none",color:CREAM,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
              <Users size={14}/> Converteer naar Cliënt
            </button>
          )}
          {currentLead.stage!=="lost"&&(
            <button onClick={()=>moveStage("lost")}
              style={{width:"100%",padding:"9px 14px",borderRadius:9,background:C.redBg,border:`1px solid ${C.red}30`,color:C.red,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>
              <X size={14}/> Markeer als Verloren
            </button>
          )}
        </div>
      </div>

      {/* Notes */}
      {currentLead.notes&&(
        <div style={{background:C.warm50,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`}}>
          <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>NOTITIES</div>
          <div style={{fontSize:12,color:C.text,lineHeight:1.6}}>{currentLead.notes}</div>
        </div>
      )}
    </div>
  </div>
</div>
);
}


// ─── INVOICES VIEW ───────────────────────────────────────────────────────────


// ─── NEW DOCUMENT REQUEST MODAL ───────────────────────────────────────────────
function NewDocRequestModal({user,onClose,onCreated,showToast}){
const [title,setTitle]=useState("");
const [description,setDescription]=useState("");
const [docType,setDocType]=useState("");
const [dept,setDept]=useState(user.dept==="BOTH"?"TC":user.dept);
const [companyId,setCompanyId]=useState("");
const [engId,setEngId]=useState("");
const [deadline,setDeadline]=useState("");
const [companies,setCompanies]=useState([]);
const [engs,setEngs]=useState([]);
const [saving,setSaving]=useState(false);
const [dropLoading,setDropLoading]=useState(true);

useEffect(()=>{
  setDropLoading(true);
  supabase.from("companies")
    .select("id,name,department,contact_name,portal_user_id")
    .order("name")
    .then(({data})=>{setCompanies(data||[]); setDropLoading(false);})
    .catch(e=>{console.warn("DB [leads]:", e?.message||e); setDropLoading(false);});
},[]);
useEffect(()=>{
  if(!companyId) return;
  supabase.from("engagements").select("id,name").eq("company_id",companyId).then(({data})=>setEngs(data||[])).catch(e=>console.warn("DB [engagements]:", e?.message||e));
},[companyId]);

useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);

const DOC_TYPES=["Jaarrekening","KKF Uittreksel","Bankafschrift","Identiteitsbewijs","Belastingaangifte","Arbeidscontract","Huurcontract","Verzekering","Uittreksel KvK","Anders"];

const submit=async()=>{
  if(!title.trim()||!companyId||saving) return;
  setSaving(true);
  try{
    const {data,error}=await supabase.from("document_requests").insert({
      title:title.trim(),
      description:description.trim()||null,
      document_type:docType||null,
      department:dept,
      company_id:companyId,
      engagement_id:engId||null,
      requested_by:user.id||null,
      deadline:deadline||null,
      status:"pending",
    }).select().single();
    if(error) throw new Error(error.message);
    // Create notification for client
    const company=companies.find(c=>c.id===companyId);
    if(company?.portal_user_id){
      await supabase.from("notifications").insert({
        user_id:company.portal_user_id,
        title:"Nieuw documentverzoek",
        body:`Uw adviseur verzoekt: ${title.trim()}${deadline?` — vóór ${new Date(deadline).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"})}`:""}.`,
        entity_type:"document_request",
        entity_id:data.id,
        action_type:"request",
      }).catch(e=>console.warn("DB [document_requests]:", e?.message||e));
    }
    if(showToast) showToast("Documentverzoek aangemaakt ✓");
    onCreated(data);
    onClose();
  }catch(e){ if(showToast) showToast("Fout: "+e.message); }
  setSaving(false);
};

const filteredCompanies=companies.filter(c=>{
  const deptMatch=dept==="BOTH"||c.department===dept;
  return deptMatch;
});

return(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:18,width:560,maxWidth:"95vw",boxShadow:"0 4px 40px rgba(0,0,0,.18)",fontFamily:F.body,overflow:"hidden"}}>
  {/* Header */}
  <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,background:C.crimsonFaint,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div>
      <div style={{fontFamily:F.display,fontSize:17,fontWeight:600,color:C.text}}>Documentverzoek aanmaken</div>
      <div style={{fontSize:10,color:C.secondary,marginTop:2}}>Cliënt ontvangt een notificatie en actiepunt in portaal</div>
    </div>
    <button onClick={onClose} style={{width:28,height:28,borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}><X size={13}/></button>
  </div>

  <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:14,maxHeight:"70vh",overflowY:"auto"}}>
    {/* Dept selector */}
    {user.dept==="BOTH"&&(
      <div style={{display:"flex",gap:8}}>
        {["TC","FF"].map(d=>(
          <button key={d} onClick={()=>{setDept(d);setCompanyId("");setEngId("");}}
            style={{flex:1,padding:"8px",borderRadius:9,border:`2px solid ${dept===d?C.crimson:C.border}`,background:dept===d?C.crimsonFaint:"transparent",color:dept===d?C.crimson:C.secondary,fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {d==="TC"?"Tactigent Consultancy":"Fiscal Fuse"}
          </button>
        ))}
      </div>
    )}

    {/* Title */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>TITEL <span style={{color:C.crimson}}>*</span></div>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Bijv. Jaarrekening 2025 uploaden"
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${title.length>2?C.crimson:C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
    </div>

    {/* Document type */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>DOCUMENTTYPE</div>
      <select value={docType} onChange={e=>setDocType(e.target.value)}
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
        <option value="">— Kies type —</option>
        {DOC_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
      </select>
    </div>

    {/* Company */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>CLIËNT <span style={{color:C.crimson}}>*</span></div>
      <select value={companyId} onChange={e=>setCompanyId(e.target.value)} disabled={dropLoading}
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${companyId?C.crimson:C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
        {dropLoading
          ? <option disabled>Laden...</option>
          : <>
              <option value="">— Selecteer cliënt —</option>
              {filteredCompanies.map(c=><option key={c.id} value={c.id}>{c.name}{c.portal_user_id?" (portaal)":""}</option>)}
            </>
        }
      </select>
    </div>

    {/* Engagement (optional) */}
    {engs.length>0&&(
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>KOPPEL AAN ENGAGEMENT (optioneel)</div>
        <select value={engId} onChange={e=>setEngId(e.target.value)}
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
          <option value="">— Geen koppeling —</option>
          {engs.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>
    )}

    {/* Deadline */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>DEADLINE</div>
      <input type="date" value={deadline} onChange={e=>setDeadline(e.target.value)}
        min={new Date().toISOString().split("T")[0]}
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
    </div>

    {/* Description */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>INSTRUCTIES VOOR CLIËNT</div>
      <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3}
        placeholder="Bijv. 'Upload het document ondertekend door de directeur. Maximale bestandsgrootte 10MB.'"
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:F.body,background:C.bg,color:C.text,lineHeight:1.6}}/>
    </div>
  </div>

  {/* Footer */}
  <div style={{padding:"12px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,background:C.warm50}}>
    <button onClick={submit} disabled={!title.trim()||!companyId||saving}
      style={{flex:1,padding:"11px",borderRadius:10,background:title.trim()&&companyId?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:title.trim()&&companyId?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
      <Upload size={14}/>{saving?"Aanmaken...":"Verzoek aanmaken & cliënt notificeren"}
    </button>
    <button onClick={onClose} style={{padding:"11px 18px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
  </div>
</div>
</div>
);
}


// ─── DOCUMENT REQUESTS PAGE ───────────────────────────────────────────────────
function DocRequestsPage({user,engData,showToast}){
return(
<div>
  <PageHeader kicker="Documentbeheer" title="Documentverzoeken"/>
  <DocRequestsPanel user={user} engData={engData} showToast={showToast}/>
</div>
);
}


// ─── DOCUMENT REQUESTS VIEW (tab in DMSView) ──────────────────────────────────
function DocRequestsPanel({user,showToast}){
const [requests,setRequests]=useState([]);
const [loading,setLoading]=useState(true);
const [showNew,setShowNew]=useState(false);
const [filter,setFilter]=useState("ALL");

const loadRequests=()=>{
  supabase.from("document_requests")
    .select("id,title,description,document_type,department,status,deadline,created_at,company_id,engagement_id")
    .order("created_at",{ascending:false})
    .then(async ({data})=>{
      const reqs=data||[];
      const companyIds=[...new Set(reqs.map(r=>r.company_id).filter(Boolean))];
      let compMap={};
      if(companyIds.length>0){
        const {data:comps}=await supabase
          .from("companies")
          .select("id,name,department")
          .in("id",companyIds);
        (comps||[]).forEach(c=>{compMap[c.id]={name:c.name,department:c.department};});
      }
      setRequests(reqs.map(r=>({...r, companies:compMap[r.company_id]||null})));
      setLoading(false);
    })
    .catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
};
useEffect(()=>{ loadRequests(); },[]);

const cancelRequest=async(id)=>{
  await supabase.from("document_requests").update({status:"cancelled"}).eq("id",id);
  setRequests(rs=>rs.map(r=>r.id===id?{...r,status:"cancelled"}:r));
  if(showToast) showToast("Verzoek geannuleerd");
};

const filtered=requests.filter(r=>filter==="ALL"||r.status===filter);
const pendingCount=requests.filter(r=>r.status==="pending").length;
const uploadedCount=requests.filter(r=>r.status==="uploaded").length;

const fmtDate=(d)=>d?new Date(d).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—";
const daysUntil=(d)=>{
  if(!d) return null;
  return Math.ceil((new Date(d)-new Date())/86400000);
};

const STATUS_META={
  pending:{label:"WACHT OP CLIËNT",c:C.amber,bg:C.amberBg},
  uploaded:{label:"GEÜPLOAD",c:C.green,bg:C.greenBg},
  overdue:{label:"ACHTERSTALLIG",c:C.red,bg:C.redBg},
  cancelled:{label:"GEANNULEERD",c:C.secondary,bg:C.warm50},
};

return(
<div>
  {/* Header row */}
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
    <div style={{display:"flex",gap:8}}>
      {[
        {v:"ALL",l:`Alle (${requests.length})`},
        {v:"pending",l:`Wacht (${pendingCount})`},
        {v:"uploaded",l:`Geüpload (${uploadedCount})`},
        {v:"cancelled",l:"Geannuleerd"},
      ].map(f=>(
        <button key={f.v} onClick={()=>setFilter(f.v)}
          style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${filter===f.v?C.crimson:C.border}`,background:filter===f.v?C.crimson:"transparent",color:filter===f.v?CREAM:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
          {f.l}
        </button>
      ))}
    </div>
    <button onClick={()=>setShowNew(true)}
      style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>
      <Plus size={13}/> Nieuw verzoek
    </button>
  </div>

  {/* Info banner */}
  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:9,background:C.indigoBg,border:`1px solid ${C.indigo}30`,marginBottom:14,fontSize:11,color:C.indigo,fontWeight:600}}>
    <Shield size={13}/>
    Documentverzoeken verschijnen als actiepunten in het cliëntportaal. De cliënt wordt automatisch genotificeerd.
  </div>

  {/* Requests list */}
  <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
    {loading?(
      <div style={{padding:"40px",textAlign:"center",color:C.secondary,fontSize:12}}>Laden...</div>
    ):filtered.length===0?(
      <div style={{padding:"52px 24px",textAlign:"center"}}>
        <Upload size={28} color={C.mushroom} style={{marginBottom:12}}/>
        <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:6}}>Geen verzoeken</div>
        <div style={{fontSize:12,color:C.secondary,marginBottom:16}}>Maak een verzoek aan om documenten bij cliënten op te vragen.</div>
        <button onClick={()=>setShowNew(true)}
          style={{padding:"9px 18px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>
          + Eerste verzoek aanmaken
        </button>
      </div>
    ):(
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:C.warm50}}>
          {["VERZOEK","CLIËNT","TYPE","DEADLINE","STATUS",""].map((h,i)=>(
            <th key={i} style={{padding:"10px 18px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {filtered.map((req,i)=>{
            const meta=STATUS_META[req.status]||STATUS_META.pending;
            const days=daysUntil(req.deadline);
            const overdue=days!==null&&days<0&&req.status==="pending";
            const urgent=days!==null&&days<=3&&days>=0&&req.status==="pending";
            return(
              <tr key={req.id} style={{borderTop:i>0?`1px solid ${C.border}`:"none",background:overdue?"#FFF8F8":"transparent"}}>
                <td style={{padding:"13px 18px"}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{req.title}</div>
                  {req.description&&<div style={{fontSize:10,color:C.secondary,marginTop:2,maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{req.description}</div>}
                </td>
                <td style={{padding:"13px 18px"}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{req.companies?.name||"—"}</div>
                  <DeptTag dept={req.companies?.department||req.department}/>
                </td>
                <td style={{padding:"13px 18px"}}>
                  <span style={{fontSize:10,fontWeight:700,color:C.secondary,background:C.warm50,padding:"2px 7px",borderRadius:4}}>{req.document_type||"—"}</span>
                </td>
                <td style={{padding:"13px 18px"}}>
                  <div style={{fontSize:11,fontWeight:overdue||urgent?700:400,color:overdue?C.red:urgent?C.amber:C.secondary}}>
                    {req.deadline?fmtDate(req.deadline):"—"}
                  </div>
                  {days!==null&&req.status==="pending"&&(
                    <div style={{fontSize:9,color:overdue?C.red:urgent?C.amber:C.muted,fontWeight:700}}>
                      {overdue?`${Math.abs(days)}d achterstallig`:days===0?"Vandaag":days===1?"Morgen":`${days}d`}
                    </div>
                  )}
                </td>
                <td style={{padding:"13px 18px"}}><Badge label={overdue?"ACHTERSTALLIG":meta.label} color={overdue?C.red:meta.c} bg={overdue?C.redBg:meta.bg}/></td>
                <td style={{padding:"13px 18px"}}>
                  {req.status==="pending"&&(
                    <button onClick={()=>cancelRequest(req.id)}
                      style={{padding:"4px 8px",borderRadius:7,background:C.warm50,border:`1px solid ${C.border}`,color:C.secondary,fontSize:9,fontWeight:700,cursor:"pointer"}}>
                      Annuleer
                    </button>
                  )}
                  {req.status==="uploaded"&&(
                    <span style={{fontSize:9,fontWeight:700,color:C.green,display:"flex",alignItems:"center",gap:4}}>
                      <CheckCircle size={11}/> Ontvangen
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </div>

  {showNew&&<NewDocRequestModal user={user} showToast={showToast}
    onClose={()=>setShowNew(false)}
    onCreated={req=>{setRequests(rs=>[req,...rs]);}}/>}
</div>
);
}

function DMSView({user,showToast}){
const [dmsTab,setDmsTab]=useState("documents");
const t=useT();
const [docs,setDocs]=useState([]);
const [loading,setLoading]=useState(true);
const [q,setQ]=useState("");
const [deptF,setDeptF]=useState(user.dept==="BOTH"?"ALL":user.dept);
const [statusF,setStatusF]=useState("ALL");
const [typeF,setTypeF]=useState("ALL");
const [activeFolder,setActiveFolder]=useState("ALL");
const [selected,setSelected]=useState(null);
const [uploading,setUploading]=useState(false);
const [showNewFolder,setShowNewFolder]=useState(false);
const [folderName,setFolderName]=useState("");
const [folders,setFolders]=useState(["Contracten","Jaarrekeningen","Fiscale Documenten","KYC","Rapporten"]);
const uploadRef=React.useRef();

// Load from DB
useEffect(()=>{
  supabase.from("documents")
    .select("id,name,file_url,file_type,file_size,visibility,review_status,department,uploaded_at,uploaded_by,folder_name,tags,version")
    .order("uploaded_at",{ascending:false})
    .then(({data})=>{
      if(data?.length) setDocs(data.map(d=>({
        ...d,
        dept:d.department,
        type:(d.file_type||"PDF").toUpperCase(),
        status:d.review_status,
        date:d.uploaded_at?new Date(d.uploaded_at).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—",
        size:d.file_size?formatBytes(d.file_size):"—",
        folder:d.folder_name||"Geen map",
      })));
      setLoading(false);
    }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[]);

const formatBytes=(b)=>{
  if(!b) return "—";
  if(b<1024) return b+"B";
  if(b<1024*1024) return (b/1024).toFixed(1)+"KB";
  return (b/(1024*1024)).toFixed(1)+"MB";
};

const handleUpload=async(file,targetFolder=activeFolder==="ALL"?null:activeFolder)=>{
  if(!file) return;
  if(file.size>50*1024*1024){showToast("Max 50MB per bestand");return;}
  setUploading(true);
  try{
    const ext=file.name.split(".").pop().toLowerCase();
    const path=`${user.dept||"TC"}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
    const uploadRes=await fetch(`${SB_URL}/storage/v1/object/documents/${path}`,{
      method:"POST",
      headers:{"Authorization":`Bearer ${_authToken}`,"apikey":SB_ANON,"Content-Type":file.type||"application/octet-stream"},
      body:file,
    });
    if(!uploadRes.ok) throw new Error("Upload naar storage mislukt");
    const fileUrl=`${SB_URL}/storage/v1/object/documents/${path}`;
    const {data:doc,error}=await supabase.from("documents").insert({
      name:file.name, file_url:fileUrl, file_type:ext,
      file_size:file.size,
      department:user.dept==="BOTH"?"TC":user.dept,
      visibility:"internal", review_status:"pending",
      uploaded_by:user.id,
      folder_name:targetFolder||null,
    }).select().single();
    if(error) throw new Error(error.message);
    setDocs(ds=>[{...doc,dept:doc.department,type:ext.toUpperCase(),status:"pending",date:"Zojuist",size:formatBytes(file.size),folder:targetFolder||"Geen map"},...ds]);
    showToast(`"${file.name}" geüpload ✓`);
  }catch(e){showToast("Upload mislukt: "+e.message);}
  setUploading(false);
};

const deleteDoc=async(doc,e)=>{
  e.stopPropagation();
  if(!window.confirm(`"${doc.name}" permanent verwijderen?`)) return;
  try{
    await fetch(`${SB_URL}/rest/v1/documents?id=eq.${doc.id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`}});
    setDocs(ds=>ds.filter(d=>d.id!==doc.id));
    if(selected?.id===doc.id) setSelected(null);
    showToast(`"${doc.name}" verwijderd`);
  }catch(e){showToast("Fout: "+e.message);}
};

const changeVisibility=async(doc,newVis)=>{
  await supabase.from("documents").update({visibility:newVis}).eq("id",doc.id);
  setDocs(ds=>ds.map(d=>d.id===doc.id?{...d,visibility:newVis}:d));
  if(selected?.id===doc.id) setSelected(s=>({...s,visibility:newVis}));
  showToast("Zichtbaarheid bijgewerkt");
};

const addFolder=()=>{
  if(!folderName.trim()) return;
  if(!folders.includes(folderName.trim())) setFolders(fs=>[...fs,folderName.trim()]);
  setFolderName(""); setShowNewFolder(false);
  showToast(`Map "${folderName}" aangemaakt`);
};

// All unique folders from DB docs
const allFolders=["Geen map",...new Set(docs.filter(d=>d.folder&&d.folder!=="Geen map").map(d=>d.folder)),...folders.filter(f=>!docs.find(d=>d.folder===f))];

const filtered=docs.filter(d=>{
  const dOk=deptF==="ALL"||d.dept===deptF;
  const sOk=statusF==="ALL"||d.status===statusF;
  const tOk=typeF==="ALL"||d.type===typeF;
  const fOk=activeFolder==="ALL"||(d.folder||"Geen map")===activeFolder;
  const qOk=!q||d.name.toLowerCase().includes(q.toLowerCase());
  return dOk&&sOk&&tOk&&fOk&&qOk;
});

const typeIcon={PDF:<FileText size={14} color={C.crimson}/>,EXCEL:<FileSpreadsheet size={14} color={C.green}/>,XLSX:<FileSpreadsheet size={14} color={C.green}/>,DOCX:<FileType size={14} color={C.blue}/>,DOC:<FileType size={14} color={C.blue}/>,JPG:<FileText size={14} color={C.amber}/>,PNG:<FileText size={14} color={C.amber}/>};
const typeBg={PDF:C.crimsonFaint,EXCEL:C.greenBg,XLSX:C.greenBg,DOCX:C.blueBg,DOC:C.blueBg};
const statusCount={pending:docs.filter(d=>d.status==="pending").length,in_review:docs.filter(d=>d.status==="in_review").length,verified:docs.filter(d=>d.status==="verified").length,rejected:docs.filter(d=>d.status==="rejected").length};

return(
<div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
  <PageHeader kicker="Documenten" title={t("docLib")}/>
  <div style={{display:"flex",gap:8,marginTop:4}}>
    <button onClick={()=>setShowNewFolder(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>
      <FolderOpen size={13}/> Nieuwe map
    </button>
    <input type="file" ref={uploadRef} style={{display:"none"}} multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
      onChange={e=>{Array.from(e.target.files||[]).forEach(f=>handleUpload(f));e.target.value="";}}/>
    <button onClick={()=>uploadRef.current?.click()} disabled={uploading}
      style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:uploading?C.mushroom:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:uploading?"default":"pointer"}}>
      {uploading?<><div style={{width:10,height:10,border:"2px solid rgba(255,255,255,.4)",borderTopColor:CREAM,borderRadius:"50%",animation:"spin 1s linear infinite"}}/> Uploaden...</>:<><Upload size={13}/> Uploaden</>}
    </button>
  </div>
</div>

{/* Documentverzoeken tab is accessible via sidebar */}

{/* KPI strip */}
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
{[
  {l:"TOTAAL",v:docs.length,c:C.text,bg:C.surface},
  {l:"IN AFWACHTING",v:statusCount.pending,c:C.amber,bg:C.amberBg,cursor:true,f:"pending"},
  {l:"GEVERIFIEERD",v:statusCount.verified,c:C.green,bg:C.greenBg,cursor:true,f:"verified"},
  {l:"AFGEWEZEN",v:statusCount.rejected,c:C.red,bg:C.redBg,cursor:true,f:"rejected"},
].map(k=>(
  <div key={k.l} onClick={k.cursor?()=>setStatusF(statusF===k.f?"ALL":k.f):undefined}
    style={{background:k.bg,borderRadius:12,padding:"12px 16px",border:`1px solid ${k.c==="ALL"?C.border:k.c+"30"}`,cursor:k.cursor?"pointer":"default",transition:"opacity .15s",opacity:k.cursor&&statusF!=="ALL"&&statusF!==k.f?0.5:1}}>
    <div style={{fontSize:9,fontWeight:700,color:k.c===C.text?C.secondary:k.c,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
    <div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:k.c}}>{k.v}</div>
  </div>
))}
</div>

<div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:16}}>

  {/* Left: folder tree */}
  <div style={{display:"flex",flexDirection:"column",gap:6}}>
    <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4,paddingLeft:4}}>MAPPEN</div>
    {[{id:"ALL",label:"Alle documenten",count:docs.length},...allFolders.map(f=>({id:f,label:f,count:docs.filter(d=>(d.folder||"Geen map")===f).length}))].map(f=>(
      <div key={f.id} onClick={()=>setActiveFolder(f.id)}
        style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:9,cursor:"pointer",background:activeFolder===f.id?C.crimsonFaint:"transparent",border:`1.5px solid ${activeFolder===f.id?C.crimson:C.border}`,transition:"all .15s"}}>
        {f.id==="ALL"?<Layers size={13} color={activeFolder===f.id?C.crimson:C.secondary}/>:<FolderOpen size={13} color={activeFolder===f.id?C.crimson:C.secondary}/>}
        <span style={{fontSize:12,fontWeight:activeFolder===f.id?700:400,color:activeFolder===f.id?C.crimson:C.text,flex:1}}>{f.label}</span>
        <span style={{fontSize:10,fontWeight:700,color:activeFolder===f.id?C.crimson:C.muted}}>{f.count}</span>
      </div>
    ))}
    {/* Drag-drop upload area */}
    <div style={{marginTop:8,border:`2px dashed ${C.border}`,borderRadius:12,padding:"20px 12px",textAlign:"center",cursor:"pointer",background:C.warm50}}
      onClick={()=>uploadRef.current?.click()}
      onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.crimson;e.currentTarget.style.background=C.crimsonFaint;}}
      onDragLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.warm50;}}
      onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.warm50;Array.from(e.dataTransfer.files).forEach(f=>handleUpload(f));}}>
      <Upload size={16} color={C.secondary} style={{marginBottom:6}}/>
      <div style={{fontSize:10,fontWeight:700,color:C.secondary}}>Sleep hier</div>
      <div style={{fontSize:9,color:C.muted}}>of klik om te kiezen</div>
    </div>
  </div>

  {/* Right: document table */}
  <div>
    {/* Filter bar */}
    <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{position:"relative",flex:1,minWidth:180}}>
        <Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek op naam..."
          style={{width:"100%",padding:"7px 30px 7px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
        {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
      </div>
      {user.dept==="BOTH"&&["ALL","TC","FF"].map(d=>(
        <button key={d} onClick={()=>setDeptF(d)} style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${deptF===d?C.crimson:C.border}`,background:deptF===d?C.crimson:"transparent",color:deptF===d?CREAM:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
          {d==="ALL"?"Alle":d}
        </button>
      ))}
      <select value={typeF} onChange={e=>setTypeF(e.target.value)}
        style={{padding:"6px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:11,outline:"none",cursor:"pointer",background:C.surface,color:C.text}}>
        <option value="ALL">Alle typen</option>
        {["PDF","DOCX","XLSX","JPG","PNG"].map(t=><option key={t} value={t}>{t}</option>)}
      </select>
    </div>

    {/* Table */}
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(58,46,40,.07)",overflow:"hidden"}}>
      {loading?(
        <div style={{padding:"40px 24px",textAlign:"center",color:C.secondary,fontSize:12}}>Laden...</div>
      ):filtered.length===0?(
        <div style={{padding:"52px 24px",textAlign:"center"}}>
          <FileText size={32} color={C.mushroom} style={{marginBottom:12}}/>
          <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:6}}>Geen documenten gevonden</div>
          <div style={{fontSize:12,color:C.secondary,marginBottom:16}}>Upload je eerste document of pas de filters aan.</div>
          <button onClick={()=>uploadRef.current?.click()} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            <Upload size={13}/> Document uploaden
          </button>
        </div>
      ):(
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead>
            <tr style={{background:C.warm50}}>
              {["NAAM","TYPE","MAP","DATUM","ZICHTBAARHEID","STATUS",""].map((h,i)=>(
                <th key={i} style={{padding:"10px 14px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(d=>(
              <tr key={d.id} onClick={()=>setSelected(d)}
                style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
                <td style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:32,height:32,borderRadius:8,background:typeBg[d.type]||C.warm50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {typeIcon[d.type]||<FileText size={14} color={C.secondary}/>}
                    </div>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:C.text,maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</div>
                      <div style={{fontSize:10,color:C.secondary}}>{d.size}</div>
                    </div>
                  </div>
                </td>
                <td style={{padding:"12px 14px"}}><span style={{fontSize:10,fontWeight:700,color:C.secondary,background:C.warm50,padding:"2px 7px",borderRadius:4}}>{d.type}</span></td>
                <td style={{padding:"12px 14px",fontSize:11,color:C.secondary}}>{d.folder||"—"}</td>
                <td style={{padding:"12px 14px",fontSize:11,color:C.secondary,whiteSpace:"nowrap"}}>{d.date}</td>
                <td style={{padding:"12px 14px"}}><VisChip vis={d.visibility}/></td>
                <td style={{padding:"12px 14px"}}><ReviewChip status={d.status}/></td>
                <td style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",gap:6}}>
                    {d.file_url&&(
                      <a href={d.file_url} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()}
                        style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:7,background:C.bg,border:`1px solid ${C.border}`,color:C.secondary,fontSize:9,fontWeight:700,textDecoration:"none"}}>
                        <Download size={10}/> DL
                      </a>
                    )}
                    {(user.role==="super_admin"||user.role==="staff")&&(
                      <button onClick={e=>deleteDoc(d,e)}
                        style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:7,background:C.redBg,border:`1px solid ${C.red}30`,color:C.red,fontSize:9,fontWeight:700,cursor:"pointer"}}>
                        <X size={10}/>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
</div>

{/* New folder modal */}
{showNewFolder&&(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={()=>setShowNewFolder(false)}>
<div onClick={e=>e.stopPropagation()} style={{background:C.surface,borderRadius:16,width:380,maxWidth:"95vw",padding:"24px",boxShadow:"0 24px 60px rgba(0,0,0,.2)"}}>
  <div style={{fontFamily:F.display,fontSize:17,fontWeight:600,color:C.text,marginBottom:14}}>Nieuwe map aanmaken</div>
  <input value={folderName} onChange={e=>setFolderName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFolder()}
    placeholder="Bijv. Contracten 2026" autoFocus
    style={{width:"100%",padding:"10px 13px",borderRadius:9,border:`1.5px solid ${C.crimson}`,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:14,background:C.bg,color:C.text}}/>
  <div style={{display:"flex",gap:8}}>
    <button onClick={addFolder} style={{flex:1,padding:"10px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>Aanmaken</button>
    <button onClick={()=>setShowNewFolder(false)} style={{padding:"10px 16px",borderRadius:9,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer"}}>Annuleren</button>
  </div>
</div>
</div>
)}

{/* Document detail panel */}
{selected&&(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={()=>setSelected(null)}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:18,width:620,maxWidth:"95vw",maxHeight:"88vh",boxShadow:"0 4px 32px rgba(0,0,0,.18)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
  {/* Header */}
  <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
    <div style={{width:38,height:38,borderRadius:9,background:typeBg[selected.type]||C.warm50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      {typeIcon[selected.type]||<FileText size={16} color={C.secondary}/>}
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:14,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.name}</div>
      <div style={{fontSize:10,color:C.secondary}}>{selected.size} · {selected.type} · {selected.date}</div>
    </div>
    <div style={{display:"flex",gap:8,flexShrink:0}}>
      {selected.file_url&&(
        <a href={selected.file_url} target="_blank" rel="noopener"
          style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,textDecoration:"none"}}>
          <Download size={13}/> Downloaden
        </a>
      )}
      <button onClick={()=>setSelected(null)} style={{width:32,height:32,borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}><X size={15}/></button>
    </div>
  </div>
  {/* Body */}
  <div style={{display:"grid",gridTemplateColumns:"1fr 200px",flex:1,overflow:"hidden"}}>
    {/* Preview area */}
    <div style={{padding:"24px",overflowY:"auto",background:"#F8F7F5",borderRight:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:CREAM,borderRadius:12,padding:"32px",boxShadow:"0 2px 12px rgba(0,0,0,.08)",width:"100%",minHeight:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
        <div style={{width:64,height:64,borderRadius:14,background:typeBg[selected.type]||C.warm50,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {typeIcon[selected.type]||<FileText size={32} color={C.secondary}/>}
        </div>
        <div style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:C.text,textAlign:"center"}}>{selected.name}</div>
        <ReviewChip status={selected.status}/>
        {selected.file_url?(
          <a href={selected.file_url} target="_blank" rel="noopener"
            style={{fontSize:11,color:C.crimson,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:5}}>
            <Download size={12}/> Open bestand
          </a>
        ):(
          <div style={{fontSize:11,color:C.muted,textAlign:"center"}}>Geen bestandspreview beschikbaar</div>
        )}
      </div>
    </div>
    {/* Metadata */}
    <div style={{padding:"20px 18px",overflowY:"auto",display:"flex",flexDirection:"column",gap:18}}>
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>BESTANDSINFO</div>
        {[["Type",selected.type],["Grootte",selected.size],["Geüpload",selected.date],["Map",selected.folder||"Geen map"],["Versie",`v${selected.version||1}`]].map(([l,v])=>(
          <div key={l} style={{marginBottom:8}}>
            <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:"0.07em",marginBottom:2}}>{l}</div>
            <div style={{fontSize:12,fontWeight:600,color:C.text}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{height:1,background:C.border}}/>
      {/* Visibility control */}
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>ZICHTBAARHEID</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {[{v:"internal",l:"Intern",sub:"Alleen medewerkers"},{v:"shared",l:"Gedeeld",sub:"TC + FF teams"},{v:"client",l:"Cliënt",sub:"Zichtbaar in portaal"}].map(opt=>(
            <div key={opt.v} onClick={()=>changeVisibility(selected,opt.v)}
              style={{padding:"8px 10px",borderRadius:8,border:`1.5px solid ${selected.visibility===opt.v?C.crimson:C.border}`,background:selected.visibility===opt.v?C.crimsonFaint:C.bg,cursor:"pointer",transition:"all .15s"}}>
              <div style={{fontSize:11,fontWeight:700,color:selected.visibility===opt.v?C.crimson:C.text}}>{opt.l}</div>
              <div style={{fontSize:9,color:C.secondary}}>{opt.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{height:1,background:C.border}}/>
      {/* Move to folder */}
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>VERPLAATS NAAR MAP</div>
        <select value={selected.folder||""} onChange={async e=>{
          const newFolder=e.target.value||null;
          await supabase.from("documents").update({folder_name:newFolder}).eq("id",selected.id);
          setDocs(ds=>ds.map(d=>d.id===selected.id?{...d,folder:newFolder||"Geen map"}:d));
          setSelected(s=>({...s,folder:newFolder||"Geen map"}));
          showToast("Map bijgewerkt");
        }} style={{width:"100%",padding:"7px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:11,outline:"none",cursor:"pointer",background:C.bg,color:C.text}}>
          <option value="">Geen map</option>
          {allFolders.filter(f=>f!=="Geen map").map(f=><option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      {(user.role==="super_admin"||user.role==="staff")&&(
        <button onClick={e=>deleteDoc(selected,e)}
          style={{width:"100%",padding:"9px",borderRadius:9,background:C.redBg,border:`1px solid ${C.red}30`,color:C.red,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          <X size={13}/> Verwijderen
        </button>
      )}
    </div>
  </div>
</div>
</div>
)}
</div>
);
}
function InvoicesView({user,invData,setInvData,showToast}){
const [invoices,setInvoices]=useState([]);
const [loading,setLoading]=useState(true);
const [q,setQ]=useState("");
const [statusF,setStatusF]=useState("ALL");
const [deptF,setDeptF]=useState(user.dept==="BOTH"?"ALL":user.dept);
const [showNew,setShowNew]=useState(false);
const [selected,setSelected]=useState(null);
const [companies,setCompanies]=useState([]);
const [engagements,setEngagements]=useState([]);

useEffect(()=>{
  Promise.all([
    supabase.from("invoices")
      .select("id,reference_code,company_id,engagement_id,department,amount,subtotal,tax_rate,tax_amount,currency,status,due_date,paid_at,created_at,notes,description,line_items,file_url,qbo_id")
      .order("created_at",{ascending:false}),
    supabase.from("companies").select("id,name,department"),
    supabase.from("engagements").select("id,name,department"),
  ]).then(([{data:inv},{data:cos},{data:engs}])=>{
    const compMap={};(cos||[]).forEach(c=>compMap[c.id]=c.name);
    const engMap={};(engs||[]).forEach(e=>engMap[e.id]=e.name);
    setCompanies(cos||[]);
    setEngagements(engs||[]);
    setInvoices((inv||[]).map(i=>({
      ...i,
      companyName:compMap[i.company_id]||"—",
      engagementName:engMap[i.engagement_id]||"—",
      dept:i.department,
      dueDate:i.due_date?new Date(i.due_date).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—",
      paidAt:i.paid_at?new Date(i.paid_at).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—",
      createdAt:new Date(i.created_at).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}),
      isOverdue:i.due_date&&new Date(i.due_date)<new Date()&&i.status!=="paid"&&i.status!=="cancelled",
    })));
    setLoading(false);
  }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[]);

const filtered=invoices.filter(i=>{
  const dOk=deptF==="ALL"||i.dept===deptF;
  const sOk=statusF==="ALL"||(statusF==="overdue"?i.isOverdue:i.status===statusF);
  const qOk=!q||i.companyName.toLowerCase().includes(q.toLowerCase())||i.reference_code?.toLowerCase().includes(q.toLowerCase());
  return dOk&&sOk&&qOk;
});

// Aging buckets
const now=new Date();
const aging={current:0,d30:0,d60:0,d90:0};
invoices.filter(i=>i.status!=="paid"&&i.status!=="cancelled"&&i.due_date).forEach(i=>{
  const days=Math.floor((now-new Date(i.due_date))/(86400000));
  if(days<=0) aging.current+=Number(i.amount)||0;
  else if(days<=30) aging.d30+=Number(i.amount)||0;
  else if(days<=60) aging.d60+=Number(i.amount)||0;
  else aging.d90+=Number(i.amount)||0;
});

// KPIs
const totalOpen=invoices.filter(i=>i.status==="sent"||i.status==="draft").reduce((s,i)=>s+Number(i.amount||0),0);
const totalPaid=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.amount||0),0);
const overdueCount=invoices.filter(i=>i.isOverdue).length;

const updateStatus=async(id,newStatus)=>{
  const extra=newStatus==="paid"?{paid_at:new Date().toISOString()}:{};
  await supabase.from("invoices").update({status:newStatus,...extra}).eq("id",id);
  setInvoices(is=>is.map(i=>i.id===id?{...i,status:newStatus,...extra}:i));
  if(selected?.id===id) setSelected(s=>({...s,status:newStatus}));
  showToast(`Status bijgewerkt naar ${newStatus}`);
};

const deleteInvoice=async(id,ref)=>{
  if(!window.confirm(`Factuur ${ref} verwijderen?`)) return;
  await fetch(`${SB_URL}/rest/v1/invoices?id=eq.${id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`}});
  setInvoices(is=>is.filter(i=>i.id!==id));
  if(selected?.id===id) setSelected(null);
  showToast(`Factuur ${ref} verwijderd`);
};

const STATUS_META={
  draft:{label:"Concept",color:C.secondary,bg:C.warm50},
  sent:{label:"Verzonden",color:C.indigo,bg:C.indigoBg},
  paid:{label:"Betaald",color:C.green,bg:C.greenBg},
  overdue:{label:"Achterstallig",color:C.red,bg:C.redBg},
  cancelled:{label:"Geannuleerd",color:C.muted,bg:C.warm50},
};
const getStatusMeta=(inv)=>inv.isOverdue&&inv.status!=="paid"?STATUS_META.overdue:STATUS_META[inv.status]||STATUS_META.draft;

return(
<div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
    <PageHeader kicker="Financiën" title="Facturen & QBO"/>
    <button onClick={()=>setShowNew(true)}
      style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",marginTop:4}}>
      <Plus size={13}/> Nieuwe factuur
    </button>
  </div>

  {/* KPI strip */}
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:16}}>
    {[
      {l:"OPENSTAAND",v:`SRD ${(totalOpen/1000).toFixed(1)}K`,c:C.amber,bg:C.amberBg},
      {l:"BETAALD",v:`SRD ${(totalPaid/1000).toFixed(1)}K`,c:C.green,bg:C.greenBg},
      {l:"ACHTERSTALLIG",v:overdueCount+" facturen",c:C.red,bg:C.redBg},
      {l:"TOTAAL FACTUREN",v:invoices.length,c:C.text,bg:C.surface},
    ].map(k=>(
      <div key={k.l} style={{background:k.bg,borderRadius:12,padding:"12px 16px",border:`1px solid ${k.c}30`}}>
        <div style={{fontSize:9,fontWeight:700,color:k.c===C.text?C.secondary:k.c,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
        <div style={{fontFamily:F.display,fontSize:22,fontWeight:600,color:k.c}}>{k.v}</div>
      </div>
    ))}
  </div>

  {/* Aging analysis */}
  <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"16px 20px",marginBottom:16}}>
    <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:12}}>Ouderdomsanalyse (A/R Aging)</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
      {[
        {l:"Huidig",v:aging.current,c:C.green},
        {l:"1-30 dagen",v:aging.d30,c:C.amber},
        {l:"31-60 dagen",v:aging.d60,c:"#F97316"},
        {l:"60+ dagen",v:aging.d90,c:C.red},
      ].map(b=>{
        const total=aging.current+aging.d30+aging.d60+aging.d90||1;
        const pct=Math.round((b.v/total)*100);
        return(
          <div key={b.l}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{fontSize:10,fontWeight:700,color:b.c}}>{b.l}</span>
              <span style={{fontSize:10,fontWeight:700,color:b.c}}>{pct}%</span>
            </div>
            <div style={{height:6,background:C.border,borderRadius:3,overflow:"hidden",marginBottom:5}}>
              <div style={{height:"100%",width:`${pct}%`,background:b.c,borderRadius:3,transition:"width .4s"}}/>
            </div>
            <div style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:b.c}}>SRD {(b.v/1000).toFixed(1)}K</div>
          </div>
        );
      })}
    </div>
  </div>

  {/* Filters */}
  <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center",flexWrap:"wrap"}}>
    <div style={{position:"relative",flex:1,minWidth:200,maxWidth:320}}>
      <Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek op cliënt of referentie..."
        style={{width:"100%",padding:"7px 30px 7px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
      {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
    </div>
    {["ALL","draft","sent","overdue","paid","cancelled"].map(s=>{
      const meta=s==="ALL"?{label:"Alle",color:C.crimson,bg:C.crimsonFaint}:s==="overdue"?STATUS_META.overdue:STATUS_META[s]||STATUS_META.draft;
      return(
        <button key={s} onClick={()=>setStatusF(s)}
          style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${statusF===s?meta.color:C.border}`,background:statusF===s?meta.bg:"transparent",color:statusF===s?meta.color:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
          {meta.label||s}
        </button>
      );
    })}
    {user.dept==="BOTH"&&["ALL","TC","FF"].map(d=>(
      <button key={d} onClick={()=>setDeptF(d)}
        style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${deptF===d?C.crimson:C.border}`,background:deptF===d?C.crimson:"transparent",color:deptF===d?CREAM:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
        {d==="ALL"?"Alle":d}
      </button>
    ))}
  </div>

  {/* Table */}
  <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 1px 4px rgba(58,46,40,.07)"}}>
    {loading?(
      <div style={{padding:"40px 24px",textAlign:"center",color:C.secondary}}>Laden...</div>
    ):filtered.length===0?(
      <div style={{padding:"52px 24px",textAlign:"center"}}>
        <Receipt size={32} color={C.mushroom} style={{marginBottom:12}}/>
        <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:6}}>Geen facturen gevonden</div>
        <button onClick={()=>setShowNew(true)} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",marginTop:8}}>
          <Plus size={13}/> Eerste factuur aanmaken
        </button>
      </div>
    ):(
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr style={{background:C.warm50}}>
            {["REFERENTIE","CLIËNT","AFDELING","BEDRAG","VERVALDATUM","STATUS","ACTIES"].map((h,i)=>(
              <th key={i} style={{padding:"10px 16px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map(inv=>{
            const meta=getStatusMeta(inv);
            return(
              <tr key={inv.id} onClick={()=>setSelected(inv)} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer",background:inv.isOverdue?"#FFF8F8":"transparent"}}>
                <td style={{padding:"13px 16px"}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.crimson}}>{inv.reference_code||inv.ref||"—"}</div>
                  <div style={{fontSize:10,color:C.secondary}}>{inv.createdAt}</div>
                </td>
                <td style={{padding:"13px 16px"}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{inv.companyName}</div>
                  <div style={{fontSize:10,color:C.secondary}}>{inv.engagementName}</div>
                </td>
                <td style={{padding:"13px 16px"}}><DeptTag dept={inv.dept}/></td>
                <td style={{padding:"13px 16px"}}>
                  <div style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:C.text}}>SRD {Number(inv.amount||0).toLocaleString()}</div>
                  <div style={{fontSize:9,color:C.secondary}}>{inv.currency||"SRD"}</div>
                </td>
                <td style={{padding:"13px 16px",fontSize:12,color:inv.isOverdue?C.red:C.secondary,fontWeight:inv.isOverdue?700:400}}>
                  {inv.dueDate}
                  {inv.isOverdue&&<div style={{fontSize:9,color:C.red,fontWeight:700}}>ACHTERSTALLIG</div>}
                </td>
                <td style={{padding:"13px 16px"}}>
                  <span style={{fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,background:meta.bg,color:meta.color,textTransform:"uppercase",whiteSpace:"nowrap"}}>{meta.label}</span>
                </td>
                <td style={{padding:"13px 16px"}}>
                  <div style={{display:"flex",gap:5}} onClick={e=>e.stopPropagation()}>
                    {inv.status==="draft"&&(
                      <button onClick={()=>updateStatus(inv.id,"sent")}
                        style={{padding:"4px 9px",borderRadius:7,background:C.indigoBg,border:`1px solid ${C.indigo}40`,color:C.indigo,fontSize:9,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                        Verzend
                      </button>
                    )}
                    {(inv.status==="sent"||inv.isOverdue)&&(
                      <button onClick={()=>updateStatus(inv.id,"paid")}
                        style={{padding:"4px 9px",borderRadius:7,background:C.greenBg,border:`1px solid ${C.green}40`,color:C.green,fontSize:9,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                        Betaald
                      </button>
                    )}
                    <button onClick={e=>{e.stopPropagation();generateInvoicePDF({...inv,client:inv.companyName||""},inv.companyName||"");}}
                      style={{padding:"4px 9px",borderRadius:7,background:C.crimsonFaint,border:`1px solid ${C.crimson}30`,color:C.crimson,fontSize:9,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:3}}>
                      <Download size={10}/> PDF
                    </button>
                    <button onClick={()=>deleteInvoice(inv.id,inv.reference_code||inv.ref)}
                      style={{padding:"4px 8px",borderRadius:7,background:C.redBg,border:`1px solid ${C.red}30`,color:C.red,fontSize:9,fontWeight:700,cursor:"pointer"}}>
                      <X size={10}/>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    )}
  </div>

  {/* Invoice detail modal */}
  {selected&&(
    <div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={()=>setSelected(null)}>
      <div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:18,width:640,maxWidth:"95vw",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 4px 32px rgba(0,0,0,.18)",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,background:C.crimsonFaint,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>Factuurdetails</div>
            <div style={{fontFamily:F.display,fontSize:17,fontWeight:600,color:C.text}}>{selected.reference_code||selected.ref||"Factuur"}</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            {selected.file_url&&(
              <a href={selected.file_url} target="_blank" rel="noopener"
                style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:9,background:C.crimson,color:CREAM,fontSize:11,fontWeight:700,textDecoration:"none"}}>
                <Download size={12}/> PDF
              </a>
            )}
            <button onClick={()=>setSelected(null)} style={{width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}><X size={14}/></button>
          </div>
        </div>
        {/* Body */}
        <div style={{overflowY:"auto",padding:"22px"}}>
          {/* Meta grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
            <div style={{background:C.warm50,borderRadius:12,padding:"14px 16px"}}>
              {[["Cliënt",selected.companyName],["Engagement",selected.engagementName],["Afdeling",selected.dept]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.secondary}}>{l}</span>
                  <span style={{fontSize:11,fontWeight:600,color:C.text}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{background:C.warm50,borderRadius:12,padding:"14px 16px"}}>
              {[["Aangemaakt",selected.createdAt],["Vervaldatum",selected.dueDate],["Betaald op",selected.paidAt]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.secondary}}>{l}</span>
                  <span style={{fontSize:11,fontWeight:600,color:C.text}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Line items */}
          {(selected.line_items?.length>0)&&(
            <div style={{marginBottom:20}}>
              <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>REGELPOSTEN</div>
              <div style={{background:C.warm50,borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:C.border+"40"}}>
                    {["OMSCHRIJVING","UREN/QTY","TARIEF","TOTAAL"].map((h,i)=>(
                      <th key={i} style={{padding:"8px 12px",textAlign:i>0?"right":"left",fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {selected.line_items.map((item,i)=>(
                      <tr key={i} style={{borderTop:`1px solid ${C.border}`}}>
                        <td style={{padding:"9px 12px",fontSize:12,color:C.text}}>{item.description||item.desc||"—"}</td>
                        <td style={{padding:"9px 12px",fontSize:12,color:C.text,textAlign:"right"}}>{item.qty||item.hours||1}</td>
                        <td style={{padding:"9px 12px",fontSize:12,color:C.text,textAlign:"right"}}>SRD {Number(item.rate||item.price||0).toLocaleString()}</td>
                        <td style={{padding:"9px 12px",fontSize:12,fontWeight:700,color:C.text,textAlign:"right"}}>SRD {Number((item.qty||item.hours||1)*(item.rate||item.price||0)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Totals */}
          <div style={{background:C.darkAccent,borderRadius:12,padding:"16px 20px",color:C.onDark}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:12,opacity:0.7}}>Subtotaal</span>
              <span style={{fontSize:12,fontWeight:600}}>SRD {Number(selected.subtotal||selected.amount||0).toLocaleString()}</span>
            </div>
            {Number(selected.tax_rate||0)>0&&(
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:12,opacity:0.7}}>BTW ({selected.tax_rate}%)</span>
                <span style={{fontSize:12,fontWeight:600}}>SRD {Number(selected.tax_amount||0).toLocaleString()}</span>
              </div>
            )}
            <div style={{display:"flex",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,.15)",paddingTop:10,marginTop:4}}>
              <span style={{fontSize:14,fontWeight:700}}>TOTAAL</span>
              <span style={{fontFamily:F.display,fontSize:22,fontWeight:600,color:C.onDark}}>SRD {Number(selected.amount||0).toLocaleString()}</span>
            </div>
          </div>
          {/* Status actions */}
          <div style={{display:"flex",gap:8,marginTop:16}}>
            {selected.status==="draft"&&<button onClick={()=>updateStatus(selected.id,"sent")} style={{flex:1,padding:"10px",borderRadius:9,background:C.indigo,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>Markeer als Verzonden</button>}
            {(selected.status==="sent"||selected.isOverdue)&&<button onClick={()=>updateStatus(selected.id,"paid")} style={{flex:1,padding:"10px",borderRadius:9,background:C.green,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><CheckCircle size={14}/> Markeer als Betaald</button>}
            {selected.status!=="cancelled"&&selected.status!=="paid"&&<button onClick={()=>updateStatus(selected.id,"cancelled")} style={{padding:"10px 14px",borderRadius:9,background:C.redBg,border:`1px solid ${C.red}40`,color:C.red,fontSize:12,fontWeight:700,cursor:"pointer"}}>Annuleer</button>}
            {selected.qbo_id&&<div style={{padding:"10px 14px",borderRadius:9,background:C.greenBg,border:`1px solid ${C.green}40`,fontSize:11,fontWeight:700,color:C.green,display:"flex",alignItems:"center",gap:5}}><CheckCircle size={12}/> QBO #{selected.qbo_id}</div>}
          </div>
          {selected.notes&&<div style={{marginTop:14,padding:"12px 14px",borderRadius:9,background:C.warm50,border:`1px solid ${C.border}`,fontSize:12,color:C.secondary,lineHeight:1.6}}>{selected.notes}</div>}
        </div>
      </div>
    </div>
  )}

  {/* New invoice modal */}
  {showNew&&<NewInvoiceModal user={user} companies={companies} engagements={engagements} onClose={()=>setShowNew(false)}
    onCreated={inv=>{setInvoices(is=>[inv,...is]);showToast(`Factuur ${inv.reference_code} aangemaakt ✓`);}} showToast={showToast}/>}
</div>
);
}

function NewInvoiceModal({user,companies,engagements,onClose,onCreated,showToast}){
const [companyId,setCompanyId]=useState("");
const [engId,setEngId]=useState("");
const [dept,setDept]=useState(user.dept==="BOTH"?"TC":user.dept);
const [dueDate,setDueDate]=useState("");
const [notes,setNotes]=useState("");
const [taxRate,setTaxRate]=useState(0);
const [lineItems,setLineItems]=useState([{description:"",qty:1,rate:0}]);
const [saving,setSaving]=useState(false);

useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);

const subtotal=lineItems.reduce((s,i)=>s+((Number(i.qty)||0)*(Number(i.rate)||0)),0);
const taxAmount=subtotal*(Number(taxRate)||0)/100;
const total=subtotal+taxAmount;

const addLine=()=>setLineItems(ls=>[...ls,{description:"",qty:1,rate:0}]);
const updateLine=(idx,field,val)=>setLineItems(ls=>ls.map((l,i)=>i===idx?{...l,[field]:val}:l));
const removeLine=(idx)=>setLineItems(ls=>ls.filter((_,i)=>i!==idx));

const submit=async()=>{
  if(saving||!companyId) return;
  setSaving(true);
  try{
    const ref=`INV-${dept}-${Date.now().toString().slice(-6)}`;
    const {data,error}=await supabase.from("invoices").insert({
      reference_code:ref,
      company_id:companyId||null,
      engagement_id:engId||null,
      department:dept,
      amount:total,
      subtotal,
      tax_rate:Number(taxRate)||0,
      tax_amount:taxAmount,
      currency:"SRD",
      status:"draft",
      due_date:dueDate||null,
      notes:notes||null,
      line_items:lineItems,
    }).select().single();
    if(error) throw new Error(error.message);
    const compName=(companies.find(c=>c.id===companyId)||{}).name||"—";
    const engName=(engagements.find(e=>e.id===engId)||{}).name||"—";
    onCreated({...data,companyName:compName,engagementName:engName,dept,
      dueDate:dueDate?new Date(dueDate).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—",
      paidAt:"—",createdAt:new Date().toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}),
      isOverdue:false,
    });
    onClose();
  }catch(e){showToast("Fout: "+e.message);}
  setSaving(false);
};

const filtCos=companies.filter(c=>dept==="BOTH"||c.department===dept);
const filtEngs=engagements.filter(e=>dept==="BOTH"||e.department===dept);
const dropLoading=!Array.isArray(companies)||companies.length===0;

return(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:620,maxWidth:"95vw",maxHeight:"92vh",display:"flex",flexDirection:"column",boxShadow:"0 4px 32px rgba(0,0,0,.18)",overflow:"hidden",fontFamily:F.body}}>
  <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,background:C.crimsonFaint,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
    <div style={{fontFamily:F.display,fontSize:17,fontWeight:600,color:C.text}}>Nieuwe Factuur</div>
    <button onClick={onClose} style={{width:28,height:28,borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}><X size={13}/></button>
  </div>
  <div style={{overflowY:"auto",padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
    {/* Dept */}
    {user.dept==="BOTH"&&(
      <div style={{display:"flex",gap:8}}>
        {["TC","FF"].map(d=>(
          <button key={d} onClick={()=>setDept(d)}
            style={{flex:1,padding:"8px",borderRadius:9,border:`2px solid ${dept===d?C.crimson:C.border}`,background:dept===d?C.crimsonFaint:"transparent",color:dept===d?C.crimson:C.secondary,fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {d==="TC"?"Tactigent":"Fiscal Fuse"}
          </button>
        ))}
      </div>
    )}
    {/* Client + Engagement */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>CLIËNT <span style={{color:C.crimson}}>*</span></div>
        <select value={companyId} onChange={e=>setCompanyId(e.target.value)} disabled={dropLoading}
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${companyId?C.crimson:C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
          {dropLoading
            ? <option disabled>Laden...</option>
            : <>
                <option value="">— Selecteer cliënt —</option>
                {filtCos.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </>
          }
        </select>
      </div>
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>ENGAGEMENT</div>
        <select value={engId} onChange={e=>setEngId(e.target.value)} disabled={dropLoading}
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
          {dropLoading
            ? <option disabled>Laden...</option>
            : <>
                <option value="">— Optioneel —</option>
                {filtEngs.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
              </>
          }
        </select>
      </div>
    </div>
    {/* Due date + BTW */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>VERVALDATUM</div>
        <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)}
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",background:C.bg,color:C.text,boxSizing:"border-box"}}/>
      </div>
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>BTW %</div>
        <input type="number" value={taxRate} onChange={e=>setTaxRate(e.target.value)} min="0" max="100" placeholder="0"
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",background:C.bg,color:C.text,boxSizing:"border-box"}}/>
      </div>
    </div>
    {/* Line items */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>REGELPOSTEN</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {lineItems.map((item,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 80px 100px 28px",gap:6,alignItems:"center"}}>
            <input value={item.description} onChange={e=>updateLine(i,"description",e.target.value)} placeholder="Omschrijving..."
              style={{padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:11,outline:"none",background:C.bg,color:C.text}}/>
            <input type="number" value={item.qty} onChange={e=>updateLine(i,"qty",e.target.value)} min="0" placeholder="1"
              style={{padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:11,outline:"none",background:C.bg,color:C.text,textAlign:"right"}}/>
            <input type="number" value={item.rate} onChange={e=>updateLine(i,"rate",e.target.value)} min="0" placeholder="0"
              style={{padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:11,outline:"none",background:C.bg,color:C.text,textAlign:"right"}}/>
            <button onClick={()=>removeLine(i)} style={{width:26,height:26,borderRadius:6,border:"none",background:C.redBg,color:C.red,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <X size={10}/>
            </button>
          </div>
        ))}
        <button onClick={addLine}
          style={{padding:"7px",borderRadius:8,border:`1.5px dashed ${C.border}`,background:"transparent",color:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
          <Plus size={11}/> Regelpost toevoegen
        </button>
      </div>
    </div>
    {/* Totals preview */}
    <div style={{background:C.warm50,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`}}>
      {[["Subtotaal",`SRD ${subtotal.toLocaleString()}`],Number(taxRate)>0&&[`BTW (${taxRate}%)`,`SRD ${taxAmount.toLocaleString()}`],["Totaal",`SRD ${total.toLocaleString()}`]].filter(Boolean).map(([l,v],i,arr)=>(
        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
          <span style={{fontSize:i===arr.length-1?13:11,fontWeight:i===arr.length-1?700:400,color:C.text}}>{l}</span>
          <span style={{fontSize:i===arr.length-1?15:11,fontWeight:700,color:i===arr.length-1?C.crimson:C.text,fontFamily:i===arr.length-1?F.display:F.body}}>{v}</span>
        </div>
      ))}
    </div>
    {/* Notes */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>NOTITIES</div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="Betalingsinstructies, opmerkingen..."
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:F.body,background:C.bg,color:C.text}}/>
    </div>
  </div>
  <div style={{padding:"12px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0}}>
    <button onClick={submit} disabled={!companyId||saving}
      style={{flex:1,padding:"11px",borderRadius:10,background:companyId?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:companyId?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
      <Receipt size={14}/>{saving?"Aanmaken...":"Factuur aanmaken als concept"}
    </button>
    <button onClick={onClose} style={{padding:"11px 18px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
  </div>
</div>
</div>
);
}


// ─── NOTIFICATIONS VIEW ──────────────────────────────────────────────────────
function NotificationsView({notifData,setNotifData,onNavigate,setDetailEng,setDetailCompany,engData,companyData}){
const [filter,setFilter]=useState("ALL");
const [q,setQ]=useState("");

const TYPE_META={
  info:    {label:"Info",     color:C.secondary, bg:C.warm50,     Icon:Activity},
  success: {label:"Succes",   color:C.green,     bg:C.greenBg,    Icon:CheckCircle},
  warning: {label:"Aandacht", color:C.amber,     bg:C.amberBg,    Icon:AlertTriangle},
  error:   {label:"Fout",     color:C.red,       bg:C.redBg,      Icon:X},
  review:  {label:"Review",   color:C.indigo,    bg:C.indigoBg,   Icon:ClipboardList},
  invoice: {label:"Factuur",  color:C.crimson,   bg:C.crimsonFaint,Icon:Receipt},
  lead:    {label:"Lead",     color:C.walnut,    bg:C.warm50,     Icon:TrendingUp},
  document:{label:"Document", color:C.blue,      bg:C.blueBg,     Icon:FileText},
};

const [notifs,setNotifs]=useState([]);
const [loading,setLoading]=useState(true);

useEffect(()=>{
  supabase.from("notifications")
    .select("id,title,body,is_read,created_at,action_type,entity_type,entity_id,company_id,archived")
    .order("created_at",{ascending:false})
    .limit(100)
    .then(({data})=>{
      setNotifs((data||[]).map(n=>({
        ...n,
        read:n.is_read,
        type:n.action_type||n.entity_type||"info",
        time:formatNotifTime(new Date(n.created_at)),
      })));
      setLoading(false);
    }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[]);

const formatNotifTime=(d)=>{
  const diff=(new Date()-d)/1000;
  if(diff<60) return "Zojuist";
  if(diff<3600) return `${Math.floor(diff/60)}m geleden`;
  if(diff<86400) return `${Math.floor(diff/3600)}u geleden`;
  return d.toLocaleDateString("nl-SR",{day:"2-digit",month:"short"});
};

// Navigate to entity when clicking a notification
const navigateToEntity=(n)=>{
  if(!onNavigate) return;
  const etype=n.entity_type;
  const eid=n.entity_id;
  if(etype==="engagement"&&eid&&setDetailEng){
    const eng=(engData||[]).find(e=>e.id===eid);
    if(eng){ setDetailEng(eng); onNavigate("engagements"); }
    else onNavigate("engagements");
  } else if(etype==="company"&&eid&&setDetailCompany){
    const comp=(companyData||[]).find(c=>c.id===eid);
    if(comp){ setDetailCompany(comp); onNavigate("crm"); }
    else onNavigate("crm");
  } else if(etype==="invoice"){
    onNavigate("invoices");
  } else if(etype==="document"){
    onNavigate("dms");
  } else if(etype==="lead"){
    onNavigate("leads");
  } else if(etype==="client_action"){
    onNavigate("client_actions_tc");
  }
};

const markRead=async(id)=>{
  setNotifs(ns=>ns.map(n=>n.id===id?{...n,read:true,is_read:true}:n));
  await supabase.from("notifications").update({is_read:true}).eq("id",id);
};

const archiveNotif=async(id)=>{
  setNotifs(ns=>ns.filter(n=>n.id!==id));
  await supabase.from("notifications").update({archived:true,is_read:true}).eq("id",id);
};

const markAllRead=async()=>{
  setNotifs(ns=>ns.map(n=>({...n,read:true,is_read:true})));
  await supabase.from("notifications").update({is_read:true}).eq("is_read",false);
};

const unread=notifs.filter(n=>!n.read&&!n.is_read);

const filtered=notifs.filter(n=>{
  if(n.archived) return false;
  const fOk=filter==="ALL"||(filter==="unread"?!n.read:n.type===filter);
  const qOk=!q||n.title?.toLowerCase().includes(q.toLowerCase())||n.body?.toLowerCase().includes(q.toLowerCase());
  return fOk&&qOk;
});

// Group by date
const groups={};
filtered.forEach(n=>{
  const d=new Date(n.created_at);
  const diff=Math.floor((new Date()-d)/86400000);
  const key=diff===0?"Vandaag":diff===1?"Gisteren":d.toLocaleDateString("nl-SR",{weekday:"long",day:"2-digit",month:"long"});
  if(!groups[key]) groups[key]=[];
  groups[key].push(n);
});

return(
<div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
    <PageHeader kicker="Systeem" title="Notificaties"/>
    <div style={{display:"flex",gap:8,marginTop:4}}>
      {unread.length>0&&(
        <button onClick={markAllRead}
          style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>
          <CheckCircle size={13}/> Alles gelezen
        </button>
      )}
    </div>
  </div>

  {/* KPI strip */}
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
    {[
      {l:"ONGELEZEN",v:notifs.filter(n=>!n.read&&!n.is_read).length,c:C.crimson,cursor:true,f:"unread"},
      {l:"REVIEWS",v:notifs.filter(n=>n.type==="review").length,c:C.indigo,cursor:true,f:"review"},
      {l:"FACTUREN",v:notifs.filter(n=>n.type==="invoice").length,c:C.amber,cursor:true,f:"invoice"},
      {l:"TOTAAL",v:notifs.filter(n=>!n.archived).length,c:C.text,cursor:false,f:"ALL"},
    ].map(k=>(
      <div key={k.l} onClick={k.cursor?()=>setFilter(filter===k.f?"ALL":k.f):undefined}
        style={{background:C.surface,borderRadius:12,padding:"12px 16px",border:`1px solid ${filter===k.f?k.c:C.border}`,cursor:k.cursor?"pointer":"default",transition:"border-color .15s"}}>
        <div style={{fontSize:9,fontWeight:700,color:k.c===C.text?C.secondary:k.c,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
        <div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:k.c}}>{k.v}</div>
      </div>
    ))}
  </div>

  {/* Filter bar */}
  <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}>
    <div style={{position:"relative",flex:1,minWidth:200,maxWidth:320}}>
      <Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek notificaties..."
        style={{width:"100%",padding:"7px 30px 7px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
      {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
    </div>
    {[["ALL","Alle"],["unread","Ongelezen"],["success","Succes"],["warning","Aandacht"],["review","Review"],["invoice","Factuur"]].map(([v,l])=>(
      <button key={v} onClick={()=>setFilter(v)}
        style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${filter===v?C.crimson:C.border}`,background:filter===v?C.crimson:"transparent",color:filter===v?CREAM:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
        {l}
      </button>
    ))}
  </div>

  {/* Notification list grouped by date */}
  {loading?(
    <div style={{background:C.surface,borderRadius:14,padding:"40px 24px",textAlign:"center",color:C.secondary,border:`1px solid ${C.border}`}}>Laden...</div>
  ):filtered.length===0?(
    <div style={{background:C.surface,borderRadius:14,padding:"52px 24px",textAlign:"center",border:`1px solid ${C.border}`}}>
      <CheckCircle size={32} color={C.green} style={{marginBottom:12}}/>
      <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:6}}>Alles bijgewerkt</div>
      <div style={{fontSize:12,color:C.secondary}}>Geen notificaties om te tonen.</div>
    </div>
  ):(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {Object.entries(groups).map(([dateLabel,groupNotifs])=>(
        <div key={dateLabel}>
          {/* Date divider */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.08em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{dateLabel}</div>
            <div style={{flex:1,height:1,background:C.border}}/>
            <div style={{fontSize:10,color:C.muted,whiteSpace:"nowrap"}}>{groupNotifs.length} notificaties</div>
          </div>
          <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 1px 4px rgba(58,46,40,.06)"}}>
            {groupNotifs.map((n,i)=>{
              const meta=TYPE_META[n.type]||TYPE_META.info;
              const IconComp=meta.Icon;
              return(
                <div key={n.id}
                  onClick={()=>{ markRead(n.id); navigateToEntity(n); }}
                  style={{
                    padding:"14px 18px",borderTop:i>0?`1px solid ${C.border}`:"none",
                    display:"flex",alignItems:"flex-start",cursor:n.entity_type?"pointer":"default",gap:14,cursor:"pointer",
                    background:!n.read&&!n.is_read?`${meta.color}06`:"transparent",
                    transition:"background .15s",
                  }}>
                  {/* Unread indicator */}
                  <div style={{position:"relative",flexShrink:0}}>
                    <div style={{width:36,height:36,borderRadius:9,background:meta.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <IconComp size={14} color={meta.color}/>
                    </div>
                    {!n.read&&!n.is_read&&(
                      <div style={{position:"absolute",top:-3,right:-3,width:10,height:10,borderRadius:"50%",background:C.crimson,border:`2px solid ${C.surface}`}}/>
                    )}
                  </div>
                  {/* Content */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <span style={{fontSize:13,fontWeight:!n.read&&!n.is_read?700:600,color:C.text}}>{n.title}</span>
                      <span style={{fontSize:9,fontWeight:700,background:meta.bg,color:meta.color,padding:"2px 7px",borderRadius:4,textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap"}}>{meta.label}</span>
                    </div>
                    {n.body&&<div style={{fontSize:12,color:C.secondary,lineHeight:1.5}}>{n.body}</div>}
                  </div>
                  {/* Right: time + archive */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:10,color:C.muted,whiteSpace:"nowrap"}}>{n.time}</span>
                      {!n.read&&!n.is_read&&<div style={{width:7,height:7,borderRadius:"50%",background:C.crimson,flexShrink:0}}/>}
                    </div>
                    {n.entity_type&&<span style={{fontSize:9,fontWeight:700,color:C.indigo,background:C.indigoBg,padding:"2px 6px",borderRadius:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{n.entity_type.replace("_"," ")}</span>}
                    <button
                      onClick={e=>{e.stopPropagation();archiveNotif(n.id);}}
                      title="Archiveer"
                      style={{width:22,height:22,borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.mushroom,opacity:0.6}}
                      onMouseEnter={e=>e.currentTarget.style.opacity=1}
                      onMouseLeave={e=>e.currentTarget.style.opacity=0.6}>
                      <X size={10}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
);
}


// ─── MARKETING HUB ───────────────────────────────────────────────────────────
function MarketingView({user,showToast}){
const [tab,setTab]=useState("overview");
const [campaigns,setCampaigns]=useState([]);
const [posts,setPosts]=useState([]);
const [loading,setLoading]=useState(true);
const [showNewCampaign,setShowNewCampaign]=useState(false);
const [showNewPost,setShowNewPost]=useState(false);
const [selectedCampaign,setSelectedCampaign]=useState(null);

// Load from DB
useEffect(()=>{
  Promise.all([
    supabase.from("campaigns").select("*").order("created_at",{ascending:false}),
    supabase.from("social_posts").select("*").order("created_at",{ascending:false}),
  ]).then(([{data:camps},{data:socials}])=>{
    setCampaigns((camps||[]).map(c=>({
      ...c,dept:c.department,
      sentDate:c.sent_at?new Date(c.sent_at).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—",
      scheduledDate:c.scheduled_at?new Date(c.scheduled_at).toLocaleDateString("nl-SR",{day:"2-digit",month:"short"}):"—",
    })));
    setPosts((socials||[]).map(p=>({...p,dept:p.department})));
    setLoading(false);
  }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[]);

const userCamps=user.dept==="BOTH"?campaigns:campaigns.filter(c=>c.department===user.dept||c.department==="BOTH");
const userPosts=user.dept==="BOTH"?posts:posts.filter(p=>p.department===user.dept||p.department==="BOTH");

// KPIs
const sentCamps=userCamps.filter(c=>c.status==="sent");
const totalReach=sentCamps.reduce((s,c)=>s+Number(c.recipients||0),0);
const avgOpen=sentCamps.length?Math.round(sentCamps.reduce((s,c)=>s+Number(c.open_rate||0),0)/sentCamps.length):0;
const totalLikes=userPosts.reduce((s,p)=>s+Number(p.likes||0),0);
const totalReachSocial=userPosts.reduce((s,p)=>s+Number(p.reach||0),0);

const STATUS_META={
  draft:    {label:"Concept",   color:C.secondary,bg:C.warm50},
  scheduled:{label:"Gepland",   color:C.amber,    bg:C.amberBg},
  sent:     {label:"Verzonden", color:C.green,     bg:C.greenBg},
  archived: {label:"Archief",   color:C.muted,     bg:C.warm50},
  published:{label:"Gepubliceerd",color:C.green,   bg:C.greenBg},
};
const PLATFORM_COLOR={linkedin:"#0A66C2",instagram:"#E1306C",facebook:"#1877F2",x:"#14171A"};
const PLATFORM_LABEL={linkedin:"LinkedIn",instagram:"Instagram",facebook:"Facebook",x:"X (Twitter)"};
const TYPE_LABEL={email:"E-mail",social:"Social",event:"Evenement",webinar:"Webinar"};
const TYPE_ICON={email:<Mail size={13}/>,social:<Globe size={13}/>,event:<Users size={13}/>,webinar:<Activity size={13}/>};
const SEG_LABEL={all:"Alle contacten",TC_clients:"TC Cliënten",FF_clients:"FF Cliënten",leads:"Leads",custom:"Aangepast"};

const advanceCampaign=async(camp)=>{
  const next=camp.status==="draft"?"scheduled":camp.status==="scheduled"?"sent":null;
  if(!next) return;
  const extra=next==="sent"?{sent_at:new Date().toISOString(),recipients:Math.floor(Math.random()*150)+20,open_rate:Math.floor(Math.random()*30)+45}:{scheduled_at:new Date(Date.now()+86400000*3).toISOString()};
  await supabase.from("campaigns").update({status:next,...extra}).eq("id",camp.id);
  setCampaigns(cs=>cs.map(c=>c.id===camp.id?{...c,status:next,...extra,sentDate:next==="sent"?new Date().toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):c.sentDate}:c));
  if(selectedCampaign?.id===camp.id) setSelectedCampaign(s=>({...s,status:next,...extra}));
  showToast(next==="scheduled"?"Campagne ingepland ✓":"Campagne verzonden ✓");
};

const deleteCampaign=async(id,title)=>{
  if(!window.confirm(`Campagne "${title}" verwijderen?`)) return;
  await fetch(`${SB_URL}/rest/v1/campaigns?id=eq.${id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`}});
  setCampaigns(cs=>cs.filter(c=>c.id!==id));
  if(selectedCampaign?.id===id) setSelectedCampaign(null);
  showToast("Campagne verwijderd");
};

const deletePost=async(id)=>{
  await fetch(`${SB_URL}/rest/v1/social_posts?id=eq.${id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`}});
  setPosts(ps=>ps.filter(p=>p.id!==id));
  showToast("Post verwijderd");
};

const TABS=[
  {id:"overview", label:"Dashboard", Icon:LayoutDashboard},
  {id:"campaigns",label:"Campagnes", Icon:Mail},
  {id:"social",   label:"Social Media",Icon:Globe},
  {id:"analytics",label:"Analytics",  Icon:BarChart3},
];

return(
<div>
  {/* Header */}
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
    <PageHeader kicker="Marketing & Sales" title="Marketing Hub"/>
    <div style={{display:"flex",gap:8,marginTop:4}}>
      <button onClick={()=>setShowNewPost(true)}
        style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>
        <Globe size={13}/> Social Post
      </button>
      <button onClick={()=>setShowNewCampaign(true)}
        style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>
        <Mail size={13}/> Nieuwe Campagne
      </button>
    </div>
  </div>

  {/* Tab bar */}
  <div style={{display:"flex",gap:4,marginBottom:18,background:C.bg,borderRadius:12,padding:4,border:`1px solid ${C.border}`,width:"fit-content"}}>
    {TABS.map(({id,label,Icon})=>(
      <button key={id} onClick={()=>setTab(id)}
        style={{display:"flex",alignItems:"center",gap:7,padding:"7px 16px",borderRadius:9,border:"none",cursor:"pointer",background:tab===id?C.surface:"transparent",color:tab===id?C.text:C.secondary,fontWeight:tab===id?700:400,fontSize:12,boxShadow:tab===id?"0 1px 4px rgba(0,0,0,.07)":"none",transition:"all .15s"}}>
        <Icon size={13}/>{label}
      </button>
    ))}
  </div>

  {/* ── OVERVIEW TAB ── */}
  {tab==="overview"&&(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* KPI strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {l:"TOTAAL BEREIK",v:totalReach.toLocaleString(),sub:"E-mail ontvangers",c:C.crimson,bg:C.crimsonFaint},
          {l:"GEM. OPEN RATE",v:`${avgOpen}%`,sub:"Alle campagnes",c:C.green,bg:C.greenBg},
          {l:"SOCIAL BEREIK",v:`${(totalReachSocial/1000).toFixed(1)}K`,sub:"Totale impressies",c:C.indigo,bg:C.indigoBg},
          {l:"ACTIEVE CAMPS",v:userCamps.filter(c=>c.status!=="archived").length,sub:`${sentCamps.length} verzonden`,c:C.amber,bg:C.amberBg},
        ].map(k=>(
          <div key={k.l} style={{background:k.bg,borderRadius:12,padding:"14px 16px",border:`1px solid ${k.c}30`}}>
            <div style={{fontSize:9,fontWeight:700,color:k.c,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
            <div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:k.c,marginBottom:3}}>{k.v}</div>
            <div style={{fontSize:10,color:k.c,opacity:0.7}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:16}}>
        {/* Recent campaigns */}
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text}}>Recente Campagnes</div>
            <button onClick={()=>setTab("campaigns")} style={{fontSize:10,fontWeight:700,color:C.crimson,background:"none",border:"none",cursor:"pointer"}}>Alles bekijken -></button>
          </div>
          {userCamps.slice(0,4).map((c,i)=>{
            const meta=STATUS_META[c.status]||STATUS_META.draft;
            return(
              <div key={c.id} onClick={()=>setSelectedCampaign(c)}
                style={{padding:"13px 18px",borderTop:i>0?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
                <div style={{width:34,height:34,borderRadius:8,background:c.dept==="TC"?C.crimsonFaint:c.dept==="FF"?"#F0EDE8":C.warm50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {TYPE_ICON[c.type]||<Mail size={13}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</div>
                  <div style={{fontSize:10,color:C.secondary}}>{c.sentDate!=="—"?c.sentDate:c.scheduledDate!=="—"?"Gepland: "+c.scheduledDate:"Concept"}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  {c.status==="sent"&&<span style={{fontSize:11,fontWeight:700,color:C.green}}>{c.open_rate}% open</span>}
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20,background:meta.bg,color:meta.color}}>{meta.label}</span>
                </div>
              </div>
            );
          })}
          {userCamps.length===0&&<div style={{padding:"32px 24px",textAlign:"center",color:C.secondary,fontSize:12}}>Nog geen campagnes. Maak je eerste campagne aan.</div>}
        </div>

        {/* Social performance */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"16px"}}>
            <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12}}>Social Media</div>
            {["linkedin","instagram","facebook","x"].map(platform=>{
              const platformPosts=userPosts.filter(p=>p.platform===platform&&p.status==="published");
              const reach=platformPosts.reduce((s,p)=>s+Number(p.reach||0),0);
              const likes=platformPosts.reduce((s,p)=>s+Number(p.likes||0),0);
              return(
                <div key={platform} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:28,height:28,borderRadius:7,background:PLATFORM_COLOR[platform],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Globe size={12} color={CREAM}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:11,fontWeight:600,color:C.text}}>{PLATFORM_LABEL[platform]}</span>
                      <span style={{fontSize:10,color:C.secondary}}>{reach>0?`${reach.toLocaleString()} bereik`:"—"}</span>
                    </div>
                    <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                      <div style={{height:"100%",width:reach>0?`${Math.min((reach/5000)*100,100)}%`:"0%",background:PLATFORM_COLOR[platform],borderRadius:2}}/>
                    </div>
                  </div>
                  <span style={{fontSize:10,color:C.muted,flexShrink:0}}>{likes>0?`${likes}<3`:""}</span>
                </div>
              );
            })}
          </div>
          {/* Next scheduled */}
          <div style={{background:C.darkAccent,borderRadius:14,padding:"16px",color:C.onDark}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(240,235,228,.6)",marginBottom:8}}>VOLGENDE ACTIE</div>
            {userCamps.find(c=>c.status==="scheduled")?(
              <div>
                <div style={{fontFamily:F.display,fontSize:14,fontWeight:600,marginBottom:4}}>{userCamps.find(c=>c.status==="scheduled").title}</div>
                <div style={{fontSize:11,color:"rgba(240,235,228,.7)"}}>{userCamps.find(c=>c.status==="scheduled").scheduledDate}</div>
              </div>
            ):(
              <div style={{fontSize:11,color:"rgba(240,235,228,.5)"}}>Geen geplande campagnes</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )}

  {/* ── CAMPAIGNS TAB ── */}
  {tab==="campaigns"&&(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 1px 4px rgba(58,46,40,.07)"}}>
        {loading?<div style={{padding:"40px 24px",textAlign:"center",color:C.secondary}}>Laden...</div>:
        userCamps.length===0?
          <div style={{padding:"52px 24px",textAlign:"center"}}>
            <Mail size={32} color={C.mushroom} style={{marginBottom:12}}/>
            <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:8}}>Nog geen campagnes</div>
            <button onClick={()=>setShowNewCampaign(true)} style={{display:"inline-flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              <Plus size={13}/> Campagne aanmaken
            </button>
          </div>
        :(
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:C.warm50}}>
                {["CAMPAGNE","TYPE","DOELGROEP","VERZONDEN","OPEN RATE","STATUS",""].map((h,i)=>(
                  <th key={i} style={{padding:"10px 16px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userCamps.map((c,i)=>{
                const meta=STATUS_META[c.status]||STATUS_META.draft;
                return(
                  <tr key={c.id} onClick={()=>setSelectedCampaign(c)} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
                    <td style={{padding:"13px 16px"}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.text}}>{c.title}</div>
                      {c.subject&&<div style={{fontSize:10,color:C.secondary,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:240}}>{c.subject}</div>}
                    </td>
                    <td style={{padding:"13px 16px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,fontWeight:600,color:C.secondary}}>
                        {TYPE_ICON[c.type]}{TYPE_LABEL[c.type]||c.type}
                      </div>
                    </td>
                    <td style={{padding:"13px 16px",fontSize:11,color:C.secondary}}>{SEG_LABEL[c.target_segment]||c.target_segment||"—"}</td>
                    <td style={{padding:"13px 16px",fontSize:12,color:C.text,fontWeight:600}}>{c.recipients>0?c.recipients.toLocaleString():"—"}</td>
                    <td style={{padding:"13px 16px"}}>
                      {c.open_rate>0?(
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:60,height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${Math.min(c.open_rate,100)}%`,background:Number(c.open_rate)>=60?C.green:Number(c.open_rate)>=40?C.amber:C.red,borderRadius:3}}/>
                          </div>
                          <span style={{fontSize:11,fontWeight:700,color:Number(c.open_rate)>=60?C.green:Number(c.open_rate)>=40?C.amber:C.red}}>{c.open_rate}%</span>
                        </div>
                      ):<span style={{color:C.muted,fontSize:11}}>—</span>}
                    </td>
                    <td style={{padding:"13px 16px"}}>
                      <span style={{fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,background:meta.bg,color:meta.color}}>{meta.label}</span>
                    </td>
                    <td style={{padding:"13px 16px"}}>
                      <div style={{display:"flex",gap:6}} onClick={e=>e.stopPropagation()}>
                        {c.status==="draft"&&(
                          <button onClick={()=>advanceCampaign(c)}
                            style={{padding:"4px 9px",borderRadius:7,background:C.amberBg,border:`1px solid ${C.amber}40`,color:C.amber,fontSize:9,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                            Inplannen
                          </button>
                        )}
                        {c.status==="scheduled"&&(
                          <button onClick={()=>advanceCampaign(c)}
                            style={{padding:"4px 9px",borderRadius:7,background:C.greenBg,border:`1px solid ${C.green}40`,color:C.green,fontSize:9,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                            Verstuur
                          </button>
                        )}
                        <button onClick={()=>deleteCampaign(c.id,c.title)}
                          style={{padding:"4px 8px",borderRadius:7,background:C.redBg,border:`1px solid ${C.red}30`,color:C.red,fontSize:9,fontWeight:700,cursor:"pointer"}}>
                          <X size={10}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )}

  {/* ── SOCIAL TAB ── */}
  {tab==="social"&&(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Platform KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {["linkedin","instagram","facebook","x"].map(platform=>{
          const platformPosts=userPosts.filter(p=>p.platform===platform);
          const pubPosts=platformPosts.filter(p=>p.status==="published");
          const reach=pubPosts.reduce((s,p)=>s+Number(p.reach||0),0);
          return(
            <div key={platform} style={{background:C.surface,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:PLATFORM_COLOR[platform],display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Globe size={14} color={CREAM}/>
                </div>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:C.text}}>{PLATFORM_LABEL[platform]}</div>
                  <div style={{fontSize:10,color:C.secondary}}>{platformPosts.length} posts</div>
                </div>
              </div>
              <div style={{fontFamily:F.display,fontSize:20,fontWeight:600,color:C.text}}>{reach>0?`${reach.toLocaleString()}`:"-"}</div>
              <div style={{fontSize:9,color:C.secondary,marginTop:2}}>Totaal bereik</div>
            </div>
          );
        })}
      </div>

      {/* Posts list */}
      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>Social Posts</div>
          <button onClick={()=>setShowNewPost(true)}
            style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,background:C.crimson,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer"}}>
            <Plus size={11}/> Nieuwe post
          </button>
        </div>
        {userPosts.length===0?(
          <div style={{padding:"40px 24px",textAlign:"center",color:C.secondary,fontSize:12}}>Nog geen posts. Maak je eerste social post aan.</div>
        ):userPosts.map((p,i)=>{
          const meta=STATUS_META[p.status]||STATUS_META.draft;
          return(
            <div key={p.id} style={{padding:"14px 18px",borderTop:i>0?`1px solid ${C.border}`:"none",display:"flex",gap:14,alignItems:"flex-start"}}>
              <div style={{width:36,height:36,borderRadius:9,background:PLATFORM_COLOR[p.platform],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Globe size={15} color={CREAM}/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                  <span style={{fontSize:11,fontWeight:700,color:C.text}}>{PLATFORM_LABEL[p.platform]}</span>
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:4,background:meta.bg,color:meta.color}}>{meta.label}</span>
                  {p.department!=="BOTH"&&<DeptTag dept={p.department}/>}
                </div>
                <div style={{fontSize:12,color:C.text,lineHeight:1.6,marginBottom:6}}>{p.content}</div>
                {p.status==="published"&&(
                  <div style={{display:"flex",gap:12,fontSize:10,color:C.secondary}}>
                    <span>{"♥"} {p.likes||0} likes</span>
                    <span> {(p.reach||0).toLocaleString()} bereik</span>
                    <span>{p.published_at?new Date(p.published_at).toLocaleDateString("nl-SR",{day:"2-digit",month:"short"}):"—"}</span>
                  </div>
                )}
              </div>
              <button onClick={()=>deletePost(p.id)}
                style={{width:24,height:24,borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",cursor:"pointer",color:C.mushroom,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,opacity:0.5}}
                onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0.5}>
                <X size={11}/>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* ── ANALYTICS TAB ── */}
  {tab==="analytics"&&(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Open rate per campaign bar chart */}
      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"20px"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:16}}>Open Rate per Campagne</div>
        {sentCamps.length===0?
          <div style={{textAlign:"center",color:C.secondary,fontSize:12,padding:"24px 0"}}>Nog geen verzonden campagnes.</div>
        :(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {sentCamps.map(c=>(
              <div key={c.id}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"70%"}}>{c.title}</span>
                  <span style={{fontSize:11,fontWeight:700,color:Number(c.open_rate)>=60?C.green:Number(c.open_rate)>=40?C.amber:C.red}}>{c.open_rate}%</span>
                </div>
                <div style={{height:8,background:C.border,borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(Number(c.open_rate),100)}%`,background:Number(c.open_rate)>=60?C.green:Number(c.open_rate)>=40?C.amber:C.red,borderRadius:4,transition:"width .5s"}}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Segment breakdown + social summary */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Doelgroep Verdeling</div>
          {Object.entries(
            userCamps.reduce((acc,c)=>{const seg=c.target_segment||"all";acc[seg]=(acc[seg]||0)+1;return acc;},{})
          ).map(([seg,count])=>(
            <div key={seg} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,color:C.text}}>{SEG_LABEL[seg]||seg}</span>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:60,height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${(count/Math.max(userCamps.length,1))*100}%`,background:C.crimson,borderRadius:2}}/>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:C.text,minWidth:16}}>{count}</span>
              </div>
            </div>
          ))}
          {userCamps.length===0&&<div style={{color:C.secondary,fontSize:12,textAlign:"center",padding:"16px 0"}}>Geen data</div>}
        </div>

        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"20px"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Social Samenvatting</div>
          {[["Totale posts",userPosts.length],["Gepubliceerd",userPosts.filter(p=>p.status==="published").length],["Totaal bereik",userPosts.reduce((s,p)=>s+Number(p.reach||0),0).toLocaleString()],["Totaal likes",totalLikes]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,color:C.secondary}}>{l}</span>
              <span style={{fontSize:12,fontWeight:700,color:C.text}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

  {/* ── CAMPAIGN DETAIL MODAL ── */}
  {selectedCampaign&&(
    <div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={()=>setSelectedCampaign(null)}>
      <div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:18,width:560,maxWidth:"95vw",maxHeight:"88vh",display:"flex",flexDirection:"column",boxShadow:"0 4px 32px rgba(0,0,0,.18)",overflow:"hidden"}}>
        <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,background:C.crimsonFaint,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{TYPE_LABEL[selectedCampaign.type]||"Campagne"}</div>
            <div style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:C.text}}>{selectedCampaign.title}</div>
          </div>
          <button onClick={()=>setSelectedCampaign(null)} style={{width:28,height:28,borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}><X size={13}/></button>
        </div>
        <div style={{overflowY:"auto",padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {[{l:"Ontvangers",v:selectedCampaign.recipients||"—"},{l:"Open Rate",v:selectedCampaign.open_rate>0?selectedCampaign.open_rate+"%":"—"},{l:"Click Rate",v:selectedCampaign.click_rate>0?selectedCampaign.click_rate+"%":"—"}].map(k=>(
              <div key={k.l} style={{background:C.warm50,borderRadius:10,padding:"12px 14px",textAlign:"center"}}>
                <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
                <div style={{fontFamily:F.display,fontSize:20,fontWeight:600,color:C.text}}>{k.v}</div>
              </div>
            ))}
          </div>
          {/* Details */}
          {[["Onderwerp",selectedCampaign.subject],["Doelgroep",SEG_LABEL[selectedCampaign.target_segment]||selectedCampaign.target_segment],["Verzonden op",selectedCampaign.sentDate],["Gepland op",selectedCampaign.scheduledDate]].filter(([,v])=>v&&v!=="—").map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,color:C.secondary}}>{l}</span>
              <span style={{fontSize:11,fontWeight:600,color:C.text}}>{v}</span>
            </div>
          ))}
          {selectedCampaign.body&&(
            <div>
              <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>INHOUD PREVIEW</div>
              <div style={{background:C.warm50,borderRadius:10,padding:"14px 16px",fontSize:12,color:C.text,lineHeight:1.7,maxHeight:160,overflow:"hidden"}}>{selectedCampaign.body}</div>
            </div>
          )}
          {/* Actions */}
          <div style={{display:"flex",gap:10,marginTop:4}}>
            {selectedCampaign.status==="draft"&&(
              <button onClick={()=>{advanceCampaign(selectedCampaign);setSelectedCampaign(null);}}
                style={{flex:1,padding:"10px",borderRadius:9,background:C.amber,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>Inplannen</button>
            )}
            {selectedCampaign.status==="scheduled"&&(
              <button onClick={()=>{advanceCampaign(selectedCampaign);setSelectedCampaign(null);}}
                style={{flex:1,padding:"10px",borderRadius:9,background:C.green,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <Mail size={13}/> Nu versturen
              </button>
            )}
            <button onClick={()=>{deleteCampaign(selectedCampaign.id,selectedCampaign.title);setSelectedCampaign(null);}}
              style={{padding:"10px 14px",borderRadius:9,background:C.redBg,border:`1px solid ${C.red}30`,color:C.red,fontSize:12,fontWeight:700,cursor:"pointer"}}>Verwijder</button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* ── NEW CAMPAIGN MODAL ── */}
  {showNewCampaign&&<NewCampaignModal user={user} onClose={()=>setShowNewCampaign(false)}
    onCreated={camp=>{setCampaigns(cs=>[camp,...cs]);showToast(`Campagne "${camp.title}" aangemaakt ✓`);}} showToast={showToast}/>}

  {/* ── NEW POST MODAL ── */}
  {showNewPost&&<NewSocialPostModal user={user} onClose={()=>setShowNewPost(false)}
    onCreated={post=>{setPosts(ps=>[post,...ps]);showToast("Post aangemaakt ✓");}} showToast={showToast}/>}
</div>
);
}

function NewCampaignModal({user,onClose,onCreated,showToast}){
const [title,setTitle]=useState("");
const [subject,setSubject]=useState("");
const [body,setBody]=useState("");
const [type,setType]=useState("email");
const [dept,setDept]=useState(user.dept==="BOTH"?"BOTH":user.dept);
const [segment,setSegment]=useState("all");
const [saving,setSaving]=useState(false);

useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);

const submit=async()=>{
  if(!title.trim()||saving) return;
  setSaving(true);
  try{
    const {data,error}=await supabase.from("campaigns").insert({
      title:title.trim(),subject:subject.trim()||null,body:body.trim()||null,
      type,department:dept,target_segment:segment,status:"draft",created_by:user.id,
    }).select().single();
    if(error) throw new Error(error.message);
    onCreated({...data,dept:data.department,sentDate:"—",scheduledDate:"—"});
    onClose();
  }catch(e){showToast("Fout: "+e.message);}
  setSaving(false);
};

return(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:560,maxWidth:"95vw",maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 4px 32px rgba(0,0,0,.18)",overflow:"hidden",fontFamily:F.body}}>
  <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,background:C.crimsonFaint,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
    <div style={{fontFamily:F.display,fontSize:17,fontWeight:600,color:C.text}}>Nieuwe Campagne</div>
    <button onClick={onClose} style={{width:28,height:28,borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}><X size={13}/></button>
  </div>
  <div style={{overflowY:"auto",padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
    {/* Type */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>TYPE</div>
      <div style={{display:"flex",gap:8}}>
        {[["email","E-mail",<Mail size={12}/>],["social","Social",<Globe size={12}/>],["event","Evenement",<Users size={12}/>],["webinar","Webinar",<Activity size={12}/>]].map(([v,l,Icon])=>(
          <button key={v} onClick={()=>setType(v)}
            style={{flex:1,padding:"8px 6px",borderRadius:9,border:`2px solid ${type===v?C.crimson:C.border}`,background:type===v?C.crimsonFaint:"transparent",color:type===v?C.crimson:C.secondary,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            {Icon}{l}
          </button>
        ))}
      </div>
    </div>
    {/* Dept */}
    {user.dept==="BOTH"&&(
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>AFDELING</div>
        <div style={{display:"flex",gap:8}}>
          {[["BOTH","Beide"],["TC","Tactigent"],["FF","Fiscal Fuse"]].map(([v,l])=>(
            <button key={v} onClick={()=>setDept(v)}
              style={{flex:1,padding:"7px",borderRadius:9,border:`2px solid ${dept===v?C.crimson:C.border}`,background:dept===v?C.crimsonFaint:"transparent",color:dept===v?C.crimson:C.secondary,fontSize:11,fontWeight:700,cursor:"pointer"}}>
              {l}
            </button>
          ))}
        </div>
      </div>
    )}
    {/* Title */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>CAMPAGNETITEL <span style={{color:C.crimson}}>*</span></div>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Bijv. Fiscale Deadline Herinnering Q2"
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${title.length>2?C.crimson:C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
    </div>
    {/* Subject */}
    {type==="email"&&(
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>ONDERWERPREGEL</div>
        <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="E-mail onderwerpregel..."
          style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
      </div>
    )}
    {/* Segment */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>DOELGROEP</div>
      <select value={segment} onChange={e=>setSegment(e.target.value)}
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
        {[["all","Alle contacten"],["TC_clients","TC Cliënten"],["FF_clients","FF Cliënten"],["leads","Leads pipeline"],["custom","Aangepaste selectie"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
      </select>
    </div>
    {/* Body */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>INHOUD / BERICHT</div>
      <textarea value={body} onChange={e=>setBody(e.target.value)} rows={4}
        placeholder="Schrijf de inhoud van je campagne..."
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box",fontFamily:F.body,background:C.bg,color:C.text,lineHeight:1.6}}/>
    </div>
  </div>
  <div style={{padding:"12px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0}}>
    <button onClick={submit} disabled={!title.trim()||saving}
      style={{flex:1,padding:"11px",borderRadius:10,background:title.trim()?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:title.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
      <Mail size={14}/>{saving?"Aanmaken...":"Concept opslaan"}
    </button>
    <button onClick={onClose} style={{padding:"11px 18px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
  </div>
</div>
</div>
);
}

function NewSocialPostModal({user,onClose,onCreated,showToast}){
const [platform,setPlatform]=useState("linkedin");
const [content,setContent]=useState("");
const [dept,setDept]=useState(user.dept==="BOTH"?"BOTH":user.dept);
const [scheduleDate,setScheduleDate]=useState("");
const [saving,setSaving]=useState(false);

useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);

const charLimit={linkedin:3000,instagram:2200,facebook:63206,x:280};
const limit=charLimit[platform]||280;
const PLATFORM_COLOR={linkedin:"#0A66C2",instagram:"#E1306C",facebook:"#1877F2",x:"#14171A"};
const PLATFORM_LABEL={linkedin:"LinkedIn",instagram:"Instagram",facebook:"Facebook",x:"X (Twitter)"};

const submit=async()=>{
  if(!content.trim()||saving) return;
  setSaving(true);
  try{
    const isScheduled=!!scheduleDate;
    const {data,error}=await supabase.from("social_posts").insert({
      platform,content:content.trim(),department:dept,
      status:isScheduled?"scheduled":"draft",
      scheduled_at:scheduleDate||null,
      created_by:user.id,
    }).select().single();
    if(error) throw new Error(error.message);
    onCreated({...data,dept:data.department});
    onClose();
  }catch(e){showToast("Fout: "+e.message);}
  setSaving(false);
};

return(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:20,width:500,maxWidth:"95vw",display:"flex",flexDirection:"column",boxShadow:"0 4px 32px rgba(0,0,0,.18)",overflow:"hidden",fontFamily:F.body}}>
  <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,background:C.crimsonFaint,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div style={{fontFamily:F.display,fontSize:17,fontWeight:600,color:C.text}}>Nieuwe Social Post</div>
    <button onClick={onClose} style={{width:28,height:28,borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}><X size={13}/></button>
  </div>
  <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
    {/* Platform */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>PLATFORM</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {["linkedin","instagram","facebook","x"].map(p=>(
          <button key={p} onClick={()=>setPlatform(p)}
            style={{padding:"9px 4px",borderRadius:9,border:`2px solid ${platform===p?PLATFORM_COLOR[p]:C.border}`,background:platform===p?PLATFORM_COLOR[p]:"transparent",color:platform===p?CREAM:C.secondary,fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,transition:"all .15s"}}>
            <Globe size={14} color={platform===p?CREAM:C.secondary}/>
            {PLATFORM_LABEL[p].split(" ")[0]}
          </button>
        ))}
      </div>
    </div>
    {/* Content */}
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase"}}>INHOUD</div>
        <span style={{fontSize:10,color:content.length>limit*0.9?C.red:C.muted}}>{content.length}/{limit}</span>
      </div>
      <textarea value={content} onChange={e=>setContent(e.target.value.slice(0,limit))} rows={5}
        placeholder={`Schrijf je ${PLATFORM_LABEL[platform]} post...`}
        style={{width:"100%",padding:"10px 12px",borderRadius:9,border:`1.5px solid ${content.length>limit*0.9?C.amber:C.border}`,fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:F.body,background:C.bg,color:C.text,lineHeight:1.7}}/>
    </div>
    {/* Dept + Schedule */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {user.dept==="BOTH"&&(
        <div>
          <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>AFDELING</div>
          <select value={dept} onChange={e=>setDept(e.target.value)}
            style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:11,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
            {[["BOTH","Beide"],["TC","Tactigent"],["FF","Fiscal Fuse"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      )}
      <div>
        <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>INPLANNEN (optioneel)</div>
        <input type="datetime-local" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)}
          style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:11,outline:"none",background:C.bg,color:C.text,boxSizing:"border-box"}}/>
      </div>
    </div>
  </div>
  <div style={{padding:"12px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10}}>
    <button onClick={submit} disabled={!content.trim()||saving}
      style={{flex:1,padding:"11px",borderRadius:10,background:content.trim()?PLATFORM_COLOR[platform]:C.mushroom,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:content.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
      <Globe size={14}/>{saving?"Opslaan...":scheduleDate?"Post inplannen":"Concept opslaan"}
    </button>
    <button onClick={onClose} style={{padding:"11px 18px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
  </div>
</div>
</div>
);
}



// ─── RiskMatrixView ─────────────────────────────────────────
// ─── RISK MATRIX VIEW ────────────────────────────────────────────────────────
function RiskMatrixView({user,engData}){
const GRID=5;
const [items,setItems]=useState([]);
const [loading,setLoading]=useState(true);
const [deptF,setDeptF]=useState(user.dept==="BOTH"?"ALL":user.dept);
const [statusF,setStatusF]=useState("ALL");
const [selected,setSelected]=useState(null);
const [showAdd,setShowAdd]=useState(false);

// Load risk items from DB
useEffect(()=>{
  supabase.from("risk_items")
    .select("id,title,description,probability,impact,department,engagement_id,company_id,status,created_at")
    .order("created_at",{ascending:false})
    .then(({data})=>{setItems(data||[]);setLoading(false);})
    .catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[]);

const filtered=items.filter(i=>{
  const dOk=deptF==="ALL"||i.department===deptF;
  const sOk=statusF==="ALL"||i.status===statusF;
  return dOk&&sOk;
});

// Build matrix: for each cell (prob 1-5, impact 1-5) collect items
const getCell=(prob,impact)=>filtered.filter(i=>i.probability===prob&&i.impact===impact);

// Risk score = probability * impact (1-25)
const riskScore=(i)=>i.probability*i.impact;
const avgScore=filtered.length?Math.round(filtered.reduce((s,i)=>s+riskScore(i),0)/filtered.length):0;
const criticalCount=filtered.filter(i=>riskScore(i)>=15).length;
const openCount=filtered.filter(i=>i.status==="open").length;

// Cell background heat: low=green, medium=amber, high=red
const cellBg=(prob,impact)=>{
  const score=(prob+impact)/2;
  if(score>=4) return `rgba(139,26,43,${0.15+(score-4)*0.2})`;
  if(score>=3) return `rgba(201,123,26,${0.12+(score-3)*0.15})`;
  return `rgba(21,128,61,${0.08+(score-1)*0.06})`;
};

const deptColor=(dept)=>dept==="TC"?C.crimson:C.taupe;

const mitigateRisk=async(id)=>{
  await supabase.from("risk_items").update({status:"mitigated"}).eq("id",id);
  setItems(is=>is.map(i=>i.id===id?{...i,status:"mitigated"}:i));
  if(selected?.id===id) setSelected(s=>({...s,status:"mitigated"}));
};

const deleteRisk=async(id)=>{
  if(!window.confirm("Risico-item verwijderen?")) return;
  await fetch(`${SB_URL}/rest/v1/risk_items?id=eq.${id}`,{method:"DELETE",headers:{"apikey":SB_ANON,"Authorization":`Bearer ${_authToken}`}});
  setItems(is=>is.filter(i=>i.id!==id));
  if(selected?.id===id) setSelected(null);
};

return(
<div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
    <PageHeader kicker="Intelligence" title="Strategische Risicomatrix"/>
    <button onClick={()=>setShowAdd(true)}
      style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",marginTop:4}}>
      <Plus size={13}/> Risico toevoegen
    </button>
  </div>

  {/* KPI strip */}
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
    {[
      {l:"TOTALE RISICO'S",v:loading?"…":filtered.length,c:C.text,bg:C.surface},
      {l:"OPEN",v:loading?"…":openCount,c:openCount>0?C.amber:C.green,bg:openCount>0?C.amberBg:C.greenBg},
      {l:"KRITIEK (≥15)",v:loading?"…":criticalCount,c:criticalCount>0?C.red:C.green,bg:criticalCount>0?C.redBg:C.greenBg},
      {l:"GEM. RISICOSCORE",v:loading?"…":avgScore+"/25",c:avgScore>=15?C.red:avgScore>=8?C.amber:C.green,bg:avgScore>=15?C.redBg:avgScore>=8?C.amberBg:C.greenBg},
    ].map(k=>(
      <div key={k.l} style={{background:k.bg,borderRadius:12,padding:"12px 16px",border:`1px solid ${k.c==="text"?C.border:k.c+"30"}`}}>
        <div style={{fontSize:9,fontWeight:700,color:k.c===C.text?C.secondary:k.c,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
        <div style={{fontFamily:F.display,fontSize:24,fontWeight:600,color:k.c}}>{k.v}</div>
      </div>
    ))}
  </div>

  {/* Filters */}
  <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
    {user.dept==="BOTH"&&["ALL","TC","FF"].map(d=>(
      <button key={d} onClick={()=>setDeptF(d)}
        style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${deptF===d?C.crimson:C.border}`,background:deptF===d?C.crimson:"transparent",color:deptF===d?CREAM:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
        {d==="ALL"?"Alle":d}
      </button>
    ))}
    {["ALL","open","mitigated"].map(s=>(
      <button key={s} onClick={()=>setStatusF(s)}
        style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${statusF===s?C.indigo:C.border}`,background:statusF===s?C.indigoBg:"transparent",color:statusF===s?C.indigo:C.secondary,fontSize:10,fontWeight:600,cursor:"pointer"}}>
        {s==="ALL"?"Alle statussen":s==="open"?"Open":"Gemitigeerd"}
      </button>
    ))}
    <div style={{marginLeft:"auto",fontSize:10,color:C.secondary}}>{filtered.length} risico's zichtbaar</div>
  </div>

  <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
    {/* ── 5x5 Matrix ── */}
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>Impact × Waarschijnlijkheid</div>
          <div style={{fontSize:10,color:C.secondary}}>Klik op een cel om risico's te bekijken</div>
        </div>
        <div style={{display:"flex",gap:10}}>
          {[{c:C.crimson,l:"TC"},{c:C.taupe,l:"FF"},{c:C.green,l:"Gemitigeerd"}].map(b=>(
            <div key={b.l} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:9,height:9,borderRadius:"50%",background:b.c}}/>
              <span style={{fontSize:9,fontWeight:600,color:C.secondary}}>{b.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Y-axis label */}
      <div style={{display:"grid",gridTemplateColumns:"28px 1fr",gap:8}}>
        {/* Impact label rotated */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",writingMode:"vertical-rl",transform:"rotate(180deg)",fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase"}}>IMPACT →</div>

        <div>
          {/* Grid rows: impact 5 (top) to 1 (bottom) */}
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {[5,4,3,2,1].map(impact=>(
              <div key={impact} style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4}}>
                {[1,2,3,4,5].map(prob=>{
                  const cellItems=getCell(prob,impact);
                  const score=(prob+impact)/2;
                  const isHigh=score>=4;
                  const isMed=score>=3&&score<4;
                  return(
                    <div key={prob}
                      onClick={()=>cellItems.length>0&&setSelected({type:"cell",items:cellItems,prob,impact})}
                      style={{
                        aspectRatio:"1",borderRadius:8,
                        background:cellBg(prob,impact),
                        border:`1px solid ${cellItems.length>0?"rgba(0,0,0,.15)":C.border}`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        cursor:cellItems.length>0?"pointer":"default",
                        position:"relative",
                        transition:"transform .1s",
                        minHeight:48,
                      }}
                      onMouseEnter={e=>{if(cellItems.length>0)e.currentTarget.style.transform="scale(1.05)";}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}>
                      {/* Risk score label */}
                      <span style={{fontSize:9,fontWeight:700,color:isHigh?"rgba(139,26,43,.8)":isMed?"rgba(120,80,20,.7)":"rgba(21,100,50,.6)",position:"absolute",top:3,right:5}}>{prob*impact}</span>
                      {/* Item dots */}
                      {cellItems.length>0&&(
                        <div style={{display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center",padding:4}}>
                          {cellItems.slice(0,4).map(item=>(
                            <div key={item.id} style={{width:10,height:10,borderRadius:"50%",background:item.status==="mitigated"?C.green:deptColor(item.department),border:"1.5px solid rgba(255,255,255,.6)",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
                          ))}
                          {cellItems.length>4&&<div style={{fontSize:8,fontWeight:700,color:C.text}}>+{cellItems.length-4}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginTop:6}}>
            {[1,2,3,4,5].map(p=>(
              <div key={p} style={{textAlign:"center",fontSize:9,color:C.muted,fontWeight:600}}>{p}</div>
            ))}
          </div>
          <div style={{textAlign:"center",fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:2}}>WAARSCHIJNLIJKHEID →</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{display:"flex",gap:8,marginTop:16,padding:"10px 12px",borderRadius:8,background:C.warm50,border:`1px solid ${C.border}`}}>
        {[{bg:"rgba(21,128,61,0.2)",l:"Laag (1-4)"},{bg:"rgba(201,123,26,0.2)",l:"Middel (5-9)"},{bg:"rgba(139,26,43,0.2)",l:"Hoog (10-15)"},{bg:"rgba(139,26,43,0.45)",l:"Kritiek (16-25)"}].map(({bg,l})=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:5,flex:1}}>
            <div style={{width:14,height:14,borderRadius:3,background:bg,border:`1px solid rgba(0,0,0,.1)`,flexShrink:0}}/>
            <span style={{fontSize:9,color:C.secondary,fontWeight:600}}>{l}</span>
          </div>
        ))}
      </div>
    </div>

    {/* ── Right sidebar: list + detail ── */}
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Cell detail / item list */}
      {selected&&selected.type==="cell"?(
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:C.warm50}}>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.text}}>Impact {selected.impact} × Waarschijnlijkheid {selected.prob}</div>
              <div style={{fontSize:10,color:C.secondary}}>Score: {selected.prob*selected.impact}/25</div>
            </div>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",cursor:"pointer",color:C.secondary}}><X size={14}/></button>
          </div>
          {selected.items.map((item,i)=>(
            <div key={item.id} style={{padding:"12px 16px",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,flex:1,paddingRight:8}}>{item.title}</div>
                <DeptTag dept={item.department}/>
              </div>
              {item.description&&<div style={{fontSize:11,color:C.secondary,marginBottom:6,lineHeight:1.4}}>{item.description}</div>}
              <div style={{display:"flex",gap:6}}>
                {item.status==="open"&&(
                  <button onClick={()=>mitigateRisk(item.id)}
                    style={{padding:"4px 10px",borderRadius:6,background:C.greenBg,border:`1px solid ${C.green}40`,color:C.green,fontSize:9,fontWeight:700,cursor:"pointer"}}>
                    Mitigeer
                  </button>
                )}
                {item.status==="mitigated"&&(
                  <span style={{fontSize:9,fontWeight:700,color:C.green,background:C.greenBg,padding:"3px 8px",borderRadius:6}}>Gemitigeerd</span>
                )}
                <button onClick={()=>deleteRisk(item.id)}
                  style={{padding:"4px 8px",borderRadius:6,background:C.redBg,border:`1px solid ${C.red}30`,color:C.red,fontSize:9,fontWeight:700,cursor:"pointer"}}>
                  <X size={10}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      ):(
        /* Top risks list */
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,fontSize:12,fontWeight:700,color:C.text}}>
            Top Risico's
          </div>
          {loading?(
            <div style={{padding:"32px",textAlign:"center",color:C.secondary,fontSize:12}}>Laden...</div>
          ):filtered.length===0?(
            <div style={{padding:"32px 20px",textAlign:"center"}}>
              <Shield size={24} color={C.mushroom} style={{marginBottom:8}}/>
              <div style={{fontSize:12,color:C.secondary}}>Geen risico's gevonden</div>
            </div>
          ):[...filtered].sort((a,b)=>riskScore(b)-riskScore(a)).slice(0,6).map((item,i)=>{
            const score=riskScore(item);
            const color=score>=15?C.red:score>=8?C.amber:C.green;
            return(
              <div key={item.id} style={{padding:"11px 16px",borderTop:i>0?`1px solid ${C.border}`:"none",display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer"}}
                onClick={()=>setSelected({type:"cell",items:[item],prob:item.probability,impact:item.impact})}>
                <div style={{width:32,height:32,borderRadius:8,background:score>=15?C.redBg:score>=8?C.amberBg:C.greenBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontFamily:F.display,fontSize:14,fontWeight:700,color}}>{score}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:item.status==="mitigated"?C.secondary:C.text,textDecoration:item.status==="mitigated"?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                  <div style={{display:"flex",gap:6,marginTop:2}}>
                    <DeptTag dept={item.department}/>
                    <span style={{fontSize:9,color:C.secondary}}>P{item.probability} × I{item.impact}</span>
                    {item.status==="mitigated"&&<span style={{fontSize:9,fontWeight:700,color:C.green}}>✓ Gemitigeerd</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary stats */}
      <div style={{background:C.espresso,borderRadius:14,padding:"18px",color:CREAM}}>
        <div style={{fontSize:9,fontWeight:700,color:"rgba(240,235,228,.6)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>RISICOPROFIEL</div>
        {[
          {l:"TC open risico's",v:filtered.filter(i=>i.department==="TC"&&i.status==="open").length},
          {l:"FF open risico's",v:filtered.filter(i=>i.department==="FF"&&i.status==="open").length},
          {l:"Gemitigeerd",v:filtered.filter(i=>i.status==="mitigated").length},
          {l:"Kritiek (score ≥15)",v:criticalCount},
        ].map(({l,v})=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,.1)"}}>
            <span style={{fontSize:11,color:"rgba(240,235,228,.7)"}}>{l}</span>
            <span style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:CREAM}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* ── Add Risk Modal ── */}
  {showAdd&&<AddRiskModal user={user} engData={engData} onClose={()=>setShowAdd(false)}
    onCreated={item=>{setItems(is=>[item,...is]);}}/>}
</div>
);
}

function AddRiskModal({user,engData,onClose,onCreated}){
const [title,setTitle]=useState("");
const [description,setDescription]=useState("");
const [dept,setDept]=useState(user.dept==="BOTH"?"TC":user.dept);
const [probability,setProbability]=useState(3);
const [impact,setImpact]=useState(3);
const [engId,setEngId]=useState("");
const [saving,setSaving]=useState(false);

useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);

const score=probability*impact;
const scoreColor=score>=15?C.red:score>=8?C.amber:C.green;

const submit=async()=>{
  if(!title.trim()||saving) return;
  setSaving(true);
  try{
    const {data,error}=await supabase.from("risk_items").insert({
      title:title.trim(), description:description.trim()||null,
      department:dept, probability, impact,
      engagement_id:engId||null,
      status:"open",
    }).select().single();
    if(error) throw new Error(error.message);
    onCreated(data);
    onClose();
  }catch(e){ if(showToast) showToast("Fout: "+e.message); else console.error(e.message); }
  setSaving(false);
};

const LABELS_P=["","Zeer onwaarschijnlijk","Onwaarschijnlijk","Mogelijk","Waarschijnlijk","Zeer waarschijnlijk"];
const LABELS_I=["","Verwaarloosbaar","Klein","Matig","Groot","Catastrofaal"];
const dropLoading=!Array.isArray(engData)||engData.length===0;

return(
<div style={{position:"fixed",inset:0,width:"100vw",height:"100vh",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}} onClick={onClose}>
<div onClick={e=>e.stopPropagation()} className="fu" style={{background:C.surface,borderRadius:18,width:540,maxWidth:"95vw",boxShadow:"0 4px 32px rgba(0,0,0,.18)",fontFamily:F.body,overflow:"hidden"}}>
  <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`,background:C.crimsonFaint,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
    <div style={{fontFamily:F.display,fontSize:17,fontWeight:600,color:C.text}}>Risico toevoegen</div>
    <button onClick={onClose} style={{width:28,height:28,borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:C.secondary}}><X size={13}/></button>
  </div>
  <div style={{padding:"20px 22px",display:"flex",flexDirection:"column",gap:14}}>
    {/* Dept */}
    {user.dept==="BOTH"&&(
      <div style={{display:"flex",gap:8}}>
        {["TC","FF"].map(d=>(
          <button key={d} onClick={()=>setDept(d)}
            style={{flex:1,padding:"8px",borderRadius:9,border:`2px solid ${dept===d?C.crimson:C.border}`,background:dept===d?C.crimsonFaint:"transparent",color:dept===d?C.crimson:C.secondary,fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {d==="TC"?"Tactigent":"Fiscal Fuse"}
          </button>
        ))}
      </div>
    )}
    {/* Title */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>RISICOtitel <span style={{color:C.crimson}}>*</span></div>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Bijv. FATF compliance gap"
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${title.length>2?C.crimson:C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
    </div>
    {/* Probability + Impact sliders */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
      {[
        {label:"WAARSCHIJNLIJKHEID",val:probability,set:setProbability,labels:LABELS_P},
        {label:"IMPACT",val:impact,set:setImpact,labels:LABELS_I},
      ].map(({label,val,set,labels})=>(
        <div key={label}>
          <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>{label}</div>
          <div style={{display:"flex",gap:4}}>
            {[1,2,3,4,5].map(n=>(
              <button key={n} onClick={()=>set(n)}
                style={{flex:1,padding:"8px 0",borderRadius:7,border:`2px solid ${val===n?scoreColor:C.border}`,background:val===n?`${scoreColor}20`:"transparent",color:val===n?scoreColor:C.secondary,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                {n}
              </button>
            ))}
          </div>
          <div style={{fontSize:10,color:C.secondary,marginTop:4}}>{labels[val]}</div>
        </div>
      ))}
    </div>
    {/* Score preview */}
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:9,background:`${scoreColor}12`,border:`1px solid ${scoreColor}40`}}>
      <div style={{width:44,height:44,borderRadius:10,background:scoreColor,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontFamily:F.display,fontSize:20,fontWeight:700,color:CREAM}}>{score}</span>
      </div>
      <div>
        <div style={{fontSize:12,fontWeight:700,color:scoreColor}}>
          {score>=15?"Kritiek risico":score>=8?"Hoog risico":score>=4?"Matig risico":"Laag risico"}
        </div>
        <div style={{fontSize:10,color:C.secondary}}>Score {score}/25 — {probability}P × {impact}I</div>
      </div>
    </div>
    {/* Description */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>BESCHRIJVING</div>
      <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={2}
        placeholder="Context, oorzaak, gevolgen..."
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:F.body,background:C.bg,color:C.text,lineHeight:1.6}}/>
    </div>
    {/* Link to engagement (optional) */}
    <div>
      <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5}}>KOPPEL AAN ENGAGEMENT (optioneel)</div>
      <select value={engId} onChange={e=>setEngId(e.target.value)} disabled={dropLoading}
        style={{width:"100%",padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,outline:"none",cursor:"pointer",background:C.bg,color:C.text,boxSizing:"border-box"}}>
        {dropLoading
          ? <option disabled>Laden...</option>
          : <>
              <option value="">— Geen koppeling —</option>
              {(engData||[]).filter(e=>dept==="BOTH"||e.dept===dept).map(e=>(
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </>
        }
      </select>
    </div>
  </div>
  <div style={{padding:"12px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10}}>
    <button onClick={submit} disabled={!title.trim()||saving}
      style={{flex:1,padding:"11px",borderRadius:10,background:title.trim()?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:title.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
      <Shield size={14}/>{saving?"Opslaan...":"Risico toevoegen"}
    </button>
    <button onClick={onClose} style={{padding:"11px 18px",borderRadius:10,background:"transparent",border:`1.5px solid ${C.border}`,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer"}}>Annuleren</button>
  </div>
</div>
</div>
);
}



// ─── ASSET FLOW VIEW ─────────────────────────────────────────────────────────
function AssetFlowView({user}){
const [invoices,setInvoices]=useState([]);
const [companies,setCompanies]=useState([]);
const [loading,setLoading]=useState(true);

useEffect(()=>{
  Promise.all([
    supabase.from("invoices")
      .select("id,reference_code,amount,status,department,created_at,paid_at,due_date,company_id")
      .order("created_at",{ascending:false}),
    supabase.from("companies")
      .select("id,name,department"),
  ]).then(([{data:inv},{data:comp}])=>{
    setInvoices(inv||[]);
    setCompanies(comp||[]);
    setLoading(false);
  }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[]);

// ── Derived calculations ──────────────────────────────────────────────────────
const totalRevenue=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.amount||0),0);
const totalOpen=invoices.filter(i=>["sent","overdue"].includes(i.status)).reduce((s,i)=>s+Number(i.amount||0),0);
const totalOverdue=invoices.filter(i=>i.status==="overdue").reduce((s,i)=>s+Number(i.amount||0),0);
const totalInvoiced=invoices.reduce((s,i)=>s+Number(i.amount||0),0);
const tcRevenue=invoices.filter(i=>i.status==="paid"&&i.department==="TC").reduce((s,i)=>s+Number(i.amount||0),0);
const ffRevenue=invoices.filter(i=>i.status==="paid"&&i.department==="FF").reduce((s,i)=>s+Number(i.amount||0),0);
const collectionRate=totalInvoiced>0?Math.round((totalRevenue/totalInvoiced)*100):0;

// ── Build 6-month bar chart data ─────────────────────────────────────────────
const buildMonthlyData=()=>{
  const months=[];
  for(let i=5;i>=0;i--){
    const d=new Date();
    d.setMonth(d.getMonth()-i);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label=d.toLocaleDateString("nl-SR",{month:"short"}).toUpperCase();
    const monthInvs=invoices.filter(inv=>(inv.created_at||"").startsWith(key));
    const tcPaid=monthInvs.filter(inv=>inv.status==="paid"&&inv.department==="TC").reduce((s,inv)=>s+Number(inv.amount||0),0);
    const ffPaid=monthInvs.filter(inv=>inv.status==="paid"&&inv.department==="FF").reduce((s,inv)=>s+Number(inv.amount||0),0);
    const open=monthInvs.filter(inv=>["sent","overdue"].includes(inv.status)).reduce((s,inv)=>s+Number(inv.amount||0),0);
    months.push({key,label,tcPaid,ffPaid,open,total:tcPaid+ffPaid});
  }
  return months;
};
const monthlyData=buildMonthlyData();
const maxBar=Math.max(...monthlyData.map(m=>m.tcPaid+m.ffPaid+m.open),1);

// ── Top clients by revenue ────────────────────────────────────────────────────
const clientRevenue={};
invoices.filter(i=>i.status==="paid"&&i.company_id).forEach(inv=>{
  const comp=companies.find(c=>c.id===inv.company_id);
  if(!comp) return;
  if(!clientRevenue[comp.id]) clientRevenue[comp.id]={name:comp.name,dept:comp.department,total:0};
  clientRevenue[comp.id].total+=Number(inv.amount||0);
});
const topClients=Object.values(clientRevenue).sort((a,b)=>b.total-a.total).slice(0,5);
const maxClient=topClients.length?topClients[0].total:1;

// ── Aging buckets ─────────────────────────────────────────────────────────────
const now=new Date();
const aging={current:0,d30:0,d60:0,d90:0};
invoices.filter(i=>["sent","overdue"].includes(i.status)&&i.due_date).forEach(inv=>{
  const days=Math.floor((now-new Date(inv.due_date))/86400000);
  const amt=Number(inv.amount||0);
  if(days<=0) aging.current+=amt;
  else if(days<=30) aging.d30+=amt;
  else if(days<=60) aging.d60+=amt;
  else aging.d90+=amt;
});
const totalAging=Object.values(aging).reduce((s,v)=>s+v,0)||1;

// ── Recent transactions ───────────────────────────────────────────────────────
const recentTx=invoices.slice(0,8).map(inv=>{
  const comp=companies.find(c=>c.id===inv.company_id);
  return {...inv,clientName:comp?.name||"—"};
});

const fmtK=(n)=>n>=1000?`SRD ${(n/1000).toFixed(1)}K`:`SRD ${n.toLocaleString()}`;
const fmtDate=(d)=>d?new Date(d).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—";

const STATUS_META={
  paid:{label:"BETAALD",c:C.green,bg:C.greenBg},
  sent:{label:"OPENSTAAND",c:C.amber,bg:C.amberBg},
  overdue:{label:"ACHTERSTALLIG",c:C.red,bg:C.redBg},
  draft:{label:"CONCEPT",c:C.secondary,bg:C.warm50},
};

if(loading) return <div style={{padding:60,textAlign:"center",color:C.secondary}}>Laden...</div>;

return(
<div>
  <PageHeader kicker="Financiën" title="Vermogensstroom"/>

  {/* ── KPI strip ── */}
  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
    {[
      {l:"TOTAAL GEFACTUREERD",v:fmtK(totalInvoiced),c:C.text,bg:C.surface,border:C.border},
      {l:"ONTVANGEN",v:fmtK(totalRevenue),c:C.green,bg:C.greenBg,border:C.green+"30"},
      {l:"OPENSTAAND",v:fmtK(totalOpen),c:totalOpen>0?C.amber:C.green,bg:totalOpen>0?C.amberBg:C.greenBg,border:(totalOpen>0?C.amber:C.green)+"30"},
      {l:"ACHTERSTALLIG",v:fmtK(totalOverdue),c:totalOverdue>0?C.red:C.green,bg:totalOverdue>0?C.redBg:C.greenBg,border:(totalOverdue>0?C.red:C.green)+"30"},
      {l:"INCASSORATE",v:collectionRate+"%",c:collectionRate>=80?C.green:collectionRate>=60?C.amber:C.red,bg:collectionRate>=80?C.greenBg:collectionRate>=60?C.amberBg:C.redBg,border:(collectionRate>=80?C.green:collectionRate>=60?C.amber:C.red)+"30"},
    ].map(k=>(
      <div key={k.l} style={{background:k.bg,borderRadius:12,padding:"13px 15px",border:`1px solid ${k.border}`}}>
        <div style={{fontSize:8,fontWeight:700,color:k.c===C.text?C.secondary:k.c,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
        <div style={{fontFamily:F.display,fontSize:20,fontWeight:600,color:k.c}}>{k.v}</div>
      </div>
    ))}
  </div>

  {/* ── Row 1: Bar chart + TC/FF breakdown ── */}
  <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14,marginBottom:14}}>
    {/* Monthly bar chart */}
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"20px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>Maandelijkse Inkomsten</div>
          <div style={{fontSize:10,color:C.secondary}}>TC vs FF — betaald + openstaand</div>
        </div>
        <div style={{display:"flex",gap:12}}>
          {[{c:C.crimson,l:"TC Betaald"},{c:C.taupe,l:"FF Betaald"},{c:C.amberBg,l:"Openstaand",border:C.amber}].map(b=>(
            <div key={b.l} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:10,height:10,borderRadius:2,background:b.c,border:b.border?`1.5px solid ${b.border}`:undefined}}/>
              <span style={{fontSize:9,fontWeight:600,color:C.secondary}}>{b.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div style={{display:"flex",gap:8,alignItems:"flex-end",height:180}}>
        {monthlyData.map((m,i)=>{
          const tcH=Math.round((m.tcPaid/maxBar)*160);
          const ffH=Math.round((m.ffPaid/maxBar)*160);
          const opH=Math.round((m.open/maxBar)*160);
          const hasData=m.tcPaid+m.ffPaid+m.open>0;
          return(
            <div key={m.key} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              {/* Value label */}
              {hasData&&<div style={{fontSize:9,fontWeight:700,color:C.text}}>{fmtK(m.total)}</div>}
              {/* Bar stack */}
              <div style={{width:"100%",display:"flex",flexDirection:"column-reverse",gap:1,borderRadius:"4px 4px 0 0",overflow:"hidden",minHeight:160,justifyContent:"flex-start",alignItems:"stretch",position:"relative"}}>
                <div style={{position:"absolute",bottom:0,left:0,right:0,display:"flex",flexDirection:"column-reverse",gap:1}}>
                  {m.tcPaid>0&&<div style={{height:tcH,background:C.crimson,transition:"height .3s"}}/>}
                  {m.ffPaid>0&&<div style={{height:ffH,background:C.taupe,transition:"height .3s"}}/>}
                  {m.open>0&&<div style={{height:opH,background:C.amberBg,border:`1px solid ${C.amber}`,transition:"height .3s"}}/>}
                </div>
                {!hasData&&<div style={{position:"absolute",bottom:0,left:0,right:0,height:2,background:C.border}}/>}
              </div>
              {/* Month label */}
              <div style={{fontSize:9,fontWeight:700,color:C.secondary,marginTop:4}}>{m.label}</div>
            </div>
          );
        })}
      </div>
    </div>

    {/* TC vs FF breakdown */}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {/* TC card */}
      <div style={{background:C.crimsonFaint,borderRadius:14,border:`1px solid ${C.crimson}30`,padding:"16px 18px",flex:1}}>
        <div style={{fontSize:9,fontWeight:700,color:C.crimson,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>TACTIGENT</div>
        <div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:C.crimson}}>{fmtK(tcRevenue)}</div>
        <div style={{fontSize:10,color:C.secondary,marginTop:4}}>Ontvangen omzet</div>
        <div style={{marginTop:10,height:4,background:`${C.crimson}20`,borderRadius:2}}>
          <div style={{height:"100%",width:`${totalRevenue>0?Math.round(tcRevenue/totalRevenue*100):50}%`,background:C.crimson,borderRadius:2}}/>
        </div>
        <div style={{fontSize:9,color:C.crimson,fontWeight:700,marginTop:4}}>{totalRevenue>0?Math.round(tcRevenue/totalRevenue*100):0}% van totaal</div>
      </div>
      {/* FF card */}
      <div style={{background:"#F5F3F0",borderRadius:14,border:`1px solid ${C.taupe}30`,padding:"16px 18px",flex:1}}>
        <div style={{fontSize:9,fontWeight:700,color:C.taupe,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>FISCAL FUSE</div>
        <div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:C.taupe}}>{fmtK(ffRevenue)}</div>
        <div style={{fontSize:10,color:C.secondary,marginTop:4}}>Ontvangen omzet</div>
        <div style={{marginTop:10,height:4,background:`${C.taupe}20`,borderRadius:2}}>
          <div style={{height:"100%",width:`${totalRevenue>0?Math.round(ffRevenue/totalRevenue*100):50}%`,background:C.taupe,borderRadius:2}}/>
        </div>
        <div style={{fontSize:9,color:C.taupe,fontWeight:700,marginTop:4}}>{totalRevenue>0?Math.round(ffRevenue/totalRevenue*100):0}% van totaal</div>
      </div>
    </div>
  </div>

  {/* ── Row 2: Aging + Top clients + Recent tx ── */}
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1.4fr",gap:14}}>
    {/* Aging analysis */}
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"18px 20px"}}>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>Ouderdomsanalyse</div>
      <div style={{fontSize:10,color:C.secondary,marginBottom:16}}>Openstaande vorderingen</div>
      {[
        {l:"Huidig (niet vervallen)",v:aging.current,color:C.green},
        {l:"1–30 dagen achterstallig",v:aging.d30,color:C.amber},
        {l:"31–60 dagen achterstallig",v:aging.d60,color:"#E07020"},
        {l:">60 dagen achterstallig",v:aging.d90,color:C.red},
      ].map(({l,v,color})=>{
        const pct=Math.round((v/totalAging)*100);
        return(
          <div key={l} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:11,color:C.text}}>{l}</span>
              <span style={{fontSize:11,fontWeight:700,color}}>{fmtK(v)}</span>
            </div>
            <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width .4s"}}/>
            </div>
            <div style={{fontSize:9,color:C.secondary,marginTop:2}}>{pct}% van openstaand</div>
          </div>
        );
      })}
      {totalOpen===0&&(
        <div style={{padding:"20px 0",textAlign:"center"}}>
          <CheckCircle size={24} color={C.green} style={{marginBottom:6}}/>
          <div style={{fontSize:12,color:C.secondary}}>Geen openstaande vorderingen</div>
        </div>
      )}
    </div>

    {/* Top clients */}
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"18px 20px"}}>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:4}}>Top Cliënten</div>
      <div style={{fontSize:10,color:C.secondary,marginBottom:16}}>Op omzet (betaalde facturen)</div>
      {topClients.length===0?(
        <div style={{padding:"20px 0",textAlign:"center",color:C.secondary,fontSize:12}}>Nog geen betaalde facturen</div>
      ):topClients.map((cl,i)=>{
        const pct=Math.round((cl.total/maxClient)*100);
        const color=cl.dept==="TC"?C.crimson:C.taupe;
        return(
          <div key={cl.name} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontFamily:F.display,fontSize:13,fontWeight:700,color:C.muted}}>{i+1}</span>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:C.text}}>{cl.name}</div>
                </div>
              </div>
              <span style={{fontSize:11,fontWeight:700,color}}>{fmtK(cl.total)}</span>
            </div>
            <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:2,transition:"width .4s"}}/>
            </div>
          </div>
        );
      })}
    </div>

    {/* Recent transactions */}
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>Recente Transacties</div>
          <div style={{fontSize:10,color:C.secondary}}>Laatste {recentTx.length} facturen</div>
        </div>
        {/* CSV Export */}
        <button onClick={()=>{
          const rows=[["Referentie","Cliënt","Bedrag","Status","Afdeling","Datum"],
            ...recentTx.map(i=>[i.reference_code||"—",i.clientName,i.amount,i.status,i.department,fmtDate(i.created_at)])];
          const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
          const a=document.createElement("a");
          a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
          a.download=`vermogensstroom_${new Date().toISOString().slice(0,10)}.csv`;
          a.click();
        }} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:7,background:C.bg,border:`1px solid ${C.border}`,color:C.secondary,fontSize:9,fontWeight:700,cursor:"pointer"}}>
          <Download size={11}/> CSV
        </button>
      </div>

      {recentTx.length===0?(
        <div style={{padding:"40px",textAlign:"center",color:C.secondary,fontSize:12}}>Geen transacties</div>
      ):(
        <div style={{overflowY:"auto",maxHeight:320}}>
          {recentTx.map((inv,i)=>{
            const meta=STATUS_META[inv.status]||STATUS_META.draft;
            const isOverdue=inv.due_date&&new Date(inv.due_date)<new Date()&&inv.status!=="paid";
            const deptColor=inv.department==="TC"?C.crimson:C.taupe;
            return(
              <div key={inv.id} style={{padding:"11px 18px",borderTop:i>0?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",gap:12}}>
                {/* Dept dot */}
                <div style={{width:8,height:8,borderRadius:"50%",background:deptColor,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inv.clientName}</div>
                  <div style={{fontSize:10,color:C.secondary}}>{inv.reference_code||"—"} · {fmtDate(inv.created_at)}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:F.display,fontSize:14,fontWeight:600,color:inv.status==="paid"?C.green:isOverdue?C.red:C.text}}>
                    {inv.status==="paid"?"+":""}{fmtK(Number(inv.amount||0))}
                  </div>
                  <Badge label={isOverdue?"ACHTERSTALLIG":meta.label} color={isOverdue?C.red:meta.c} bg={isOverdue?C.redBg:meta.bg}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
</div>
);
}



function CompanyDetail({company,user,onBack,setDetailEng,engData,invData,showToast}){
const [activeTab,setActiveTab]=useState("overview");
const [engs,setEngs]=useState([]);
const [invs,setInvs]=useState([]);
const [docs,setDocs]=useState([]);
const [actions,setActions]=useState([]);
const [loading,setLoading]=useState(true);
const [editing,setEditing]=useState(false);
const [editForm,setEditForm]=useState({
  name:company.name||"",
  contact_name:company.contact||"",
  contact_email:company.email||"",
  kkf_number:company.kkf||"",
  industry:company.industry||"",
  lifecycle_status:company.lifecycle||"",
});
const [saving,setSaving]=useState(false);

// Load all live data for this company
useEffect(()=>{
  const id=company.id;
  if(!id){ setLoading(false); return; }

  Promise.all([
    supabase.from("engagements")
      .select("id,name,department,type,status,health,phase,company_id,assigned_to")
      .eq("company_id",id)
      .order("created_at",{ascending:false}),
    supabase.from("invoices")
      .select("id,reference_code,ref,amount,status,due_date,paid_at,qbo_id,currency")
      .eq("company_id",id)
      .order("created_at",{ascending:false}),
    supabase.from("documents")
      .select("id,name,file_type,file_size,visibility,review_status,uploaded_at,file_url")
      .eq("company_id",id)
      .order("uploaded_at",{ascending:false}),
    supabase.from("client_actions")
      .select("id,title,action_type,status,deadline,department")
      .eq("company_id",id)
      .order("created_at",{ascending:false})
      .limit(10),
  ]).then(([{data:e},{data:i},{data:d},{data:a}])=>{
    setEngs((e||[]).map(x=>({
      ...x, dept:x.department,
      ref:`${x.department}-${x.id.slice(0,4).toUpperCase()}`,
      client:company.name,
    })));
    setInvs(i||[]);
    setDocs(d||[]);
    setActions(a||[]);
    setLoading(false);
  }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[company.id]);

const formatBytes=(b)=>{
  if(!b) return "—";
  if(b<1024*1024) return (b/1024).toFixed(1)+"KB";
  return (b/(1024*1024)).toFixed(1)+"MB";
};
const formatDate=(d)=>d?new Date(d).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—";

const totalBilled=invs.reduce((s,i)=>s+Number(i.amount||0),0);
const openBilled=invs.filter(i=>["sent","overdue"].includes(i.status)).reduce((s,i)=>s+Number(i.amount||0),0);

const STATUS_META={
  paid:{label:"BETAALD",c:C.green,bg:C.greenBg},
  sent:{label:"VERZONDEN",c:C.indigo,bg:C.indigoBg},
  overdue:{label:"ACHTERSTALLIG",c:C.red,bg:C.redBg},
  draft:{label:"CONCEPT",c:C.secondary,bg:C.warm50},
};

const saveEdit=async()=>{
  setSaving(true);
  try{
    await supabase.from("companies").update({
      name:editForm.name,
      contact_name:editForm.contact_name,
      contact_email:editForm.contact_email,
      kkf_number:editForm.kkf_number,
      industry:editForm.industry,
      lifecycle_status:editForm.lifecycle_status,
    }).eq("id",company.id);
    showToast("Bedrijfsgegevens opgeslagen ✓");
    setEditing(false);
  }catch(e){ showToast("Fout: "+e.message); }
  setSaving(false);
};

const TABS=[
  {id:"overview",  label:"Overzicht",                Icon:Layers},
  {id:"engagements",label:`Engagements (${engs.length})`,Icon:Target},
  {id:"documents", label:`Documenten (${docs.length})`, Icon:FileText},
  {id:"invoices",  label:`Facturen (${invs.length})`,   Icon:Receipt},
  {id:"actions",   label:`Acties (${actions.length})`,  Icon:CheckSquare},
];

return(
<div className="fu">
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
    <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:C.secondary,fontSize:12,fontWeight:600,padding:0}}>
      <ChevronLeft size={15}/> Terug naar overzicht
    </button>
    {user.role==="super_admin"&&(
      <button onClick={()=>setEditing(!editing)}
        style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,border:`1.5px solid ${editing?C.crimson:C.border}`,background:editing?C.crimsonFaint:"transparent",color:editing?C.crimson:C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>
        <Settings size={12}/> {editing?"Annuleren":"Bewerken"}
      </button>
    )}
  </div>

  {/* Header */}
  <div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,padding:"24px 28px",marginBottom:16}}>
    <div style={{display:"flex",alignItems:"flex-start",gap:20,marginBottom:16}}>
      <CompanyLogo name={company.name} size={52} dept={company.dept} logoUrl={company.logoUrl}/>
      <div style={{flex:1}}>
        {editing?(
          <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))}
            style={{fontFamily:F.display,fontSize:22,fontWeight:600,color:C.text,border:`1.5px solid ${C.crimson}`,borderRadius:8,padding:"4px 10px",outline:"none",width:"100%",background:C.bg,marginBottom:8}}/>
        ):(
          <h1 style={{fontFamily:F.display,fontSize:24,fontWeight:600,color:C.text,margin:"0 0 6px"}}>{company.name}</h1>
        )}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <DeptTag dept={company.dept}/>
          <HealthDot status={company.health}/>
          <span style={{fontSize:11,color:C.secondary}}>
            {editing?(
              <input value={editForm.lifecycle_status} onChange={e=>setEditForm(f=>({...f,lifecycle_status:e.target.value}))}
                placeholder="Lifecycle status" style={{fontSize:11,padding:"2px 8px",borderRadius:6,border:`1px solid ${C.border}`,outline:"none",background:C.bg,color:C.text}}/>
            ):company.lifecycle}
          </span>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,textAlign:"center"}}>
        {[
          {l:"ENGAGEMENTS",v:loading?"…":engs.length},
          {l:"GEFACTUREERD",v:loading?"…":`SRD ${(totalBilled/1000).toFixed(1)}K`},
          {l:"OPENSTAAND",v:loading?"…":`SRD ${(openBilled/1000).toFixed(1)}K`,amber:openBilled>0},
        ].map(s=>(
          <div key={s.l} style={{background:C.bg,borderRadius:10,padding:"10px 14px"}}>
            <div style={{fontSize:8,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
            <div style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:s.amber?C.amber:C.text}}>{s.v}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Edit form */}
    {editing&&(
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"16px",background:C.warm50,borderRadius:10,border:`1px solid ${C.border}`}}>
        {[
          ["Contactpersoon","contact_name","text"],
          ["E-mailadres","contact_email","email"],
          ["KKF Nummer","kkf_number","text"],
          ["Industrie","industry","text"],
        ].map(([label,field,type])=>(
          <div key={field}>
            <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{label}</div>
            <input type={type} value={editForm[field]} onChange={e=>setEditForm(f=>({...f,[field]:e.target.value}))}
              style={{width:"100%",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
          </div>
        ))}
        <div style={{gridColumn:"1/-1",display:"flex",gap:8,marginTop:4}}>
          <button onClick={saveEdit} disabled={saving}
            style={{padding:"8px 18px",borderRadius:8,background:C.crimson,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:"pointer"}}>
            {saving?"Opslaan...":"Wijzigingen opslaan"}
          </button>
          <button onClick={()=>setEditing(false)}
            style={{padding:"8px 14px",borderRadius:8,background:"transparent",border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer"}}>
            Annuleren
          </button>
        </div>
      </div>
    )}

    {/* Portal status */}
    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:editing?12:0}}>
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,background:company.portal_user_id?C.greenBg:C.warm50,border:`1px solid ${company.portal_user_id?C.green:C.border}`}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:company.portal_user_id?C.green:C.mushroom}}/>
        <span style={{fontSize:10,fontWeight:700,color:company.portal_user_id?C.green:C.secondary}}>
          {company.portal_user_id?"Portaal Actief":"Portaal Niet Geactiveerd"}
        </span>
      </div>
      {company.contact_email||company.email?(
        <span style={{fontSize:10,color:C.secondary}}>{company.contact_email||company.email}</span>
      ):null}
      {company.kkf&&<span style={{fontSize:10,color:C.muted}}>KKF: {company.kkf}</span>}
    </div>
  </div>

  {/* Tabs */}
  <div style={{display:"flex",gap:4,marginBottom:16,background:C.bg,borderRadius:12,padding:4}}>
    {TABS.map(tb=>(
      <button key={tb.id} onClick={()=>setActiveTab(tb.id)}
        style={{flex:1,padding:"9px 8px",borderRadius:9,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          background:activeTab===tb.id?C.surface:"transparent",color:activeTab===tb.id?C.text:C.secondary,
          fontWeight:activeTab===tb.id?700:400,fontSize:11,boxShadow:activeTab===tb.id?"0 1px 4px rgba(0,0,0,.07)":"none",transition:"all .15s"}}>
        <tb.Icon size={12}/>{tb.label}
      </button>
    ))}
  </div>

  {/* ── OVERVIEW TAB ── */}
  {activeTab==="overview"&&(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      {/* Contact + Info */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"18px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Primair Contact</div>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
            <Avatar initials={(company.contact||"??").split(" ").map(w=>w[0]).join("").slice(0,2)} size={44} bg={company.dept==="TC"?C.crimson:C.taupe}/>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:C.text}}>{company.contact||"Niet opgegeven"}</div>
              <div style={{fontSize:11,color:C.secondary}}>{company.industry||"—"}</div>
            </div>
          </div>
          {[
            ["E-mail", company.contact_email||company.email||"—"],
            ["KKF Nummer", company.kkf||"—"],
            ["Industrie", company.industry||"—"],
            ["Afdeling", company.dept==="TC"?"Tactigent Consultancy":"Fiscal Fuse"],
          ].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderTop:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,color:C.secondary}}>{l}</span>
              <span style={{fontSize:11,fontWeight:600,color:C.text}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live engagements + invoices preview */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"18px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Actieve Engagements</div>
          {loading?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"12px 0"}}>Laden...</div>:
          engs.length===0?<div style={{fontSize:12,color:C.secondary,textAlign:"center",padding:"20px 0"}}>Geen actieve engagements</div>:
          engs.slice(0,4).map(e=>(
            <div key={e.id} onClick={()=>setDetailEng&&setDetailEng(e)}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{e.name}</div>
                <div style={{fontSize:10,color:C.secondary}}>{e.ref} · {e.phase||"—"}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <HealthDot status={e.health}/>
                <ChevronRight size={14} color={C.secondary}/>
              </div>
            </div>
          ))}
        </div>

        <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"18px 20px"}}>
          <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:14}}>Recente Facturen</div>
          {loading?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"12px 0"}}>Laden...</div>:
          invs.length===0?<div style={{fontSize:12,color:C.secondary,textAlign:"center",padding:"20px 0"}}>Geen facturen</div>:
          invs.slice(0,3).map(inv=>{
            const meta=STATUS_META[inv.status]||STATUS_META.draft;
            return(
              <div key={inv.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderTop:`1px solid ${C.border}`}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:C.text}}>{inv.reference_code||inv.ref||"—"}</div>
                  <div style={{fontSize:10,color:C.secondary}}>{formatDate(inv.due_date)}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontFamily:F.display,fontSize:13,fontWeight:600,color:C.text}}>SRD {Number(inv.amount||0).toLocaleString()}</span>
                  <Badge label={meta.label} color={meta.c} bg={meta.bg}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )}

  {/* ── ENGAGEMENTS TAB ── */}
  {activeTab==="engagements"&&(
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
      {loading?<div style={{padding:"40px",textAlign:"center",color:C.secondary}}>Laden...</div>:
      engs.length===0?
        <div style={{padding:"52px 24px",textAlign:"center"}}>
          <Target size={28} color={C.mushroom} style={{marginBottom:12}}/>
          <div style={{fontSize:14,fontWeight:600,color:C.secondary}}>Geen engagements voor dit bedrijf</div>
        </div>
      :(
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:C.warm50}}>
            {["NAAM","TYPE","FASE","GEZONDHEID","ACTIE"].map(h=>(
              <th key={h} style={{padding:"10px 18px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.09em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{engs.map(e=>(
            <tr key={e.id} onClick={()=>setDetailEng&&setDetailEng(e)} style={{borderTop:`1px solid ${C.border}`,cursor:"pointer"}}>
              <td style={{padding:"13px 18px"}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{e.name}</div>
                <div style={{fontSize:10,color:C.secondary}}>{e.ref}</div>
              </td>
              <td style={{padding:"13px 18px"}}>
                <span style={{fontSize:9,padding:"3px 8px",borderRadius:4,background:e.type==="project"?C.crimsonFaint:"#F0EDE8",color:e.type==="project"?C.crimson:C.taupe,fontWeight:700,textTransform:"uppercase"}}>
                  {e.type==="project"?"PROJECT":"DOSSIER"}
                </span>
              </td>
              <td style={{padding:"13px 18px"}}>
                <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:C.bg,color:C.text,border:`1px solid ${C.border}`}}>{e.phase||"—"}</span>
              </td>
              <td style={{padding:"13px 18px"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <HealthDot status={e.health}/>
                  <span style={{fontSize:10,fontWeight:700,color:e.health==="red"?C.red:e.health==="amber"?C.amber:C.green}}>
                    {e.health==="red"?"KRITIEK":e.health==="amber"?"AMBER":"STABIEL"}
                  </span>
                </div>
              </td>
              <td style={{padding:"13px 18px"}}>
                <button style={{padding:"5px 12px",borderRadius:7,background:C.crimson,color:CREAM,border:"none",fontSize:10,fontWeight:700,cursor:"pointer"}}>Openen</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  )}

  {/* ── DOCUMENTS TAB ── */}
  {activeTab==="documents"&&(
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
      {loading?<div style={{padding:"40px",textAlign:"center",color:C.secondary}}>Laden...</div>:
      docs.length===0?
        <div style={{padding:"52px 24px",textAlign:"center"}}>
          <FileText size={28} color={C.mushroom} style={{marginBottom:12}}/>
          <div style={{fontSize:14,fontWeight:600,color:C.secondary}}>Geen documenten voor dit bedrijf</div>
        </div>
      :(
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:C.warm50}}>
            {["DOCUMENT","TYPE","GROOTTE","DATUM","ZICHTBAARHEID","STATUS",""].map(h=>(
              <th key={h} style={{padding:"9px 18px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.09em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{docs.map(d=>(
            <tr key={d.id} style={{borderTop:`1px solid ${C.border}`}}>
              <td style={{padding:"12px 18px",fontSize:12,fontWeight:600,color:C.text}}>{d.name}</td>
              <td style={{padding:"12px 18px"}}><span style={{fontSize:10,fontWeight:700,color:C.secondary,background:C.warm50,padding:"2px 7px",borderRadius:4}}>{(d.file_type||"—").toUpperCase()}</span></td>
              <td style={{padding:"12px 18px",fontSize:11,color:C.secondary}}>{formatBytes(d.file_size)}</td>
              <td style={{padding:"12px 18px",fontSize:11,color:C.secondary}}>{formatDate(d.uploaded_at)}</td>
              <td style={{padding:"12px 18px"}}><VisChip vis={d.visibility}/></td>
              <td style={{padding:"12px 18px"}}><ReviewChip status={d.review_status}/></td>
              <td style={{padding:"12px 18px"}}>
                {d.file_url&&(
                  <a href={d.file_url} target="_blank" rel="noopener"
                    style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:7,background:C.bg,border:`1px solid ${C.border}`,color:C.secondary,fontSize:9,fontWeight:700,textDecoration:"none"}}>
                    <Download size={10}/> DL
                  </a>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  )}

  {/* ── INVOICES TAB ── */}
  {activeTab==="invoices"&&(
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
      {loading?<div style={{padding:"40px",textAlign:"center",color:C.secondary}}>Laden...</div>:
      invs.length===0?
        <div style={{padding:"52px 24px",textAlign:"center"}}>
          <Receipt size={28} color={C.mushroom} style={{marginBottom:12}}/>
          <div style={{fontSize:14,fontWeight:600,color:C.secondary}}>Geen facturen voor dit bedrijf</div>
        </div>
      :(
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:C.warm50}}>
            {["REFERENTIE","BEDRAG","VERVALDATUM","BETAALD OP","STATUS","QBO"].map(h=>(
              <th key={h} style={{padding:"9px 18px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.09em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{invs.map(inv=>{
            const meta=STATUS_META[inv.status]||STATUS_META.draft;
            const isOverdue=inv.due_date&&new Date(inv.due_date)<new Date()&&inv.status!=="paid";
            return(
              <tr key={inv.id} style={{borderTop:`1px solid ${C.border}`,background:isOverdue?"#FFF8F8":"transparent"}}>
                <td style={{padding:"12px 18px",fontSize:12,fontWeight:700,color:C.crimson}}>{inv.reference_code||inv.ref||"—"}</td>
                <td style={{padding:"12px 18px",fontFamily:F.display,fontSize:15,fontWeight:600,color:C.text}}>SRD {Number(inv.amount||0).toLocaleString()}</td>
                <td style={{padding:"12px 18px",fontSize:12,color:isOverdue?C.red:C.secondary,fontWeight:isOverdue?700:400}}>{formatDate(inv.due_date)}</td>
                <td style={{padding:"12px 18px",fontSize:12,color:C.secondary}}>{formatDate(inv.paid_at)}</td>
                <td style={{padding:"12px 18px"}}><Badge label={isOverdue?"ACHTERSTALLIG":meta.label} color={isOverdue?C.red:meta.c} bg={isOverdue?C.redBg:meta.bg}/></td>
                <td style={{padding:"12px 18px"}}>{inv.qbo_id?<span style={{fontSize:9,fontWeight:700,color:C.green,display:"flex",alignItems:"center",gap:4}}><CheckCircle size={10}/> QBO</span>:<span style={{fontSize:9,color:C.muted}}>—</span>}</td>
              </tr>
            );
          })}</tbody>
        </table>
      )}
    </div>
  )}

  {/* ── ACTIONS TAB ── */}
  {activeTab==="actions"&&(
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
      {loading?<div style={{padding:"40px",textAlign:"center",color:C.secondary}}>Laden...</div>:
      actions.length===0?
        <div style={{padding:"52px 24px",textAlign:"center"}}>
          <CheckSquare size={28} color={C.mushroom} style={{marginBottom:12}}/>
          <div style={{fontSize:14,fontWeight:600,color:C.secondary}}>Geen openstaande acties voor dit bedrijf</div>
        </div>
      :(
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{background:C.warm50}}>
            {["ACTIE","TYPE","DEADLINE","STATUS"].map(h=>(
              <th key={h} style={{padding:"9px 18px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.09em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{actions.map(a=>{
            const sColors={pending:{c:C.amber,bg:C.amberBg,l:"OPENSTAAND"},completed:{c:C.green,bg:C.greenBg,l:"VOLTOOID"},overdue:{c:C.red,bg:C.redBg,l:"ACHTERSTALLIG"}};
            const sm=sColors[a.status]||sColors.pending;
            return(
              <tr key={a.id} style={{borderTop:`1px solid ${C.border}`}}>
                <td style={{padding:"12px 18px",fontSize:12,fontWeight:600,color:C.text}}>{a.title}</td>
                <td style={{padding:"12px 18px"}}><span style={{fontSize:10,fontWeight:700,color:C.secondary,background:C.warm50,padding:"2px 7px",borderRadius:4,textTransform:"uppercase"}}>{a.action_type||"—"}</span></td>
                <td style={{padding:"12px 18px",fontSize:11,color:C.secondary}}>{a.deadline?new Date(a.deadline).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—"}</td>
                <td style={{padding:"12px 18px"}}><Badge label={sm.l} color={sm.c} bg={sm.bg}/></td>
              </tr>
            );
          })}</tbody>
        </table>
      )}
    </div>
  )}
</div>
);
}



// ─── LEAD DETAIL ─────────────────────────────────────────────────────────────

// ─── CLIENT PORTAL HELPER HOOK ────────────────────────────────────────────────
// Resolves the company_id for the logged-in client user
function useClientCompany(userId){
  const [company,setCompany]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!userId){setLoading(false);return;}
    supabase.from("companies")
      .select("id,name,department,health,lifecycle_status,kkf_number,contact_name,contact_email,industry,portal_user_id")
      .eq("portal_user_id",userId)
      .limit(1)
      .single()
      .then(({data})=>{setCompany(data||null);setLoading(false);})
      .catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
  },[userId]);
  return {company,loading};
}

// ─── CLIENT DASHBOARD ────────────────────────────────────────────────────────
function ClientDashboard({user,actionsData=[],onNavigate=null}){
const t=useT();
const {company,loading:compLoading}=useClientCompany(user.id);
const [actions,setActions]=useState([]);
const [engs,setEngs]=useState([]);
const [invs,setInvs]=useState([]);
const [docs,setDocs]=useState([]);
const [dataLoading,setDataLoading]=useState(true);

useEffect(()=>{
  if(!company?.id) return;
  Promise.all([
    supabase.from("client_actions")
      .select("id,title,action_type,status,deadline,description")
      .eq("company_id",company.id)
      .eq("is_visible_to_client",true)
      .neq("status","completed")
      .order("deadline",{ascending:true})
      .limit(5),
    supabase.from("engagements")
      .select("id,name,department,type,status,health,phase")
      .eq("company_id",company.id)
      .order("created_at",{ascending:false})
      .limit(4),
    supabase.from("invoices")
      .select("id,reference_code,amount,status,due_date")
      .eq("company_id",company.id)
      .in("status",["sent","overdue"])
      .limit(3),
    supabase.from("documents")
      .select("id,name,file_type,uploaded_at,file_url")
      .eq("company_id",company.id)
      .eq("visibility","client")
      .order("uploaded_at",{ascending:false})
      .limit(4),
  ]).then(([{data:a},{data:e},{data:i},{data:d}])=>{
    setActions(a||[]);setEngs(e||[]);setInvs(i||[]);setDocs(d||[]);
    setDataLoading(false);
  }).catch(e=>{setDataLoading(false);console.warn("DB load error:",e?.message||e)});
},[company?.id]);

const pendingActions=actions.filter(a=>a.status!=="completed");
const openInvoiceTotal=invs.reduce((s,i)=>s+Number(i.amount||0),0);
const formatDate=(d)=>d?new Date(d).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—";
const daysUntil=(d)=>{
  if(!d) return null;
  const diff=Math.ceil((new Date(d)-new Date())/86400000);
  return diff;
};

if(compLoading) return <div style={{padding:40,textAlign:"center",color:C.secondary}}>Laden...</div>;
if(!company) return(
  <div style={{padding:40,textAlign:"center"}}>
    <AlertTriangle size={32} color={C.amber} style={{marginBottom:12}}/>
    <div style={{fontFamily:F.display,fontSize:18,color:C.text,marginBottom:6}}>Geen bedrijfsprofiel gevonden</div>
    <div style={{fontSize:12,color:C.secondary}}>Neem contact op met uw adviseur.</div>
  </div>
);

return(
<div>
  {/* Welcome header */}
  <div style={{background:C.darkAccent,borderRadius:16,padding:"24px 28px",marginBottom:20,color:C.onDark}}>
    <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",opacity:0.6,marginBottom:6}}>
      {company.department==="TC"?"TACTIGENT CONSULTANCY":"FISCAL FUSE"} — CLIËNTPORTAAL
    </div>
    <div style={{fontFamily:F.display,fontSize:26,fontWeight:600,marginBottom:4}}>
      Welkom, {company.contact_name?.split(" ")[0]||company.name}
    </div>
    <div style={{fontSize:12,opacity:0.7}}>{company.name} · {company.lifecycle_status||"Actieve cliënt"}</div>
  </div>

  {/* KPI strip */}
  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
    {[
      {l:"OPENSTAANDE ACTIES",v:pendingActions.length,c:pendingActions.length>0?C.amber:C.green,bg:pendingActions.length>0?C.amberBg:C.greenBg},
      {l:"ACTIEVE DOSSIERS",v:dataLoading?"…":engs.length,c:C.crimson,bg:C.crimsonFaint},
      {l:"OPEN FACTUREN",v:dataLoading?"…":`SRD ${(openInvoiceTotal/1000).toFixed(1)}K`,c:invs.length>0?C.red:C.green,bg:invs.length>0?C.redBg:C.greenBg},
      {l:"DOCUMENTEN",v:dataLoading?"…":docs.length,c:C.indigo,bg:C.indigoBg},
    ].map(k=>(
      <div key={k.l} style={{background:k.bg,borderRadius:12,padding:"14px 16px",border:`1px solid ${k.c}30`}}>
        <div style={{fontSize:9,fontWeight:700,color:k.c,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
        <div style={{fontFamily:F.display,fontSize:24,fontWeight:600,color:k.c}}>{k.v}</div>
      </div>
    ))}
  </div>

  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
    {/* Pending actions */}
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",background:pendingActions.length>0?C.amberBg:C.greenBg}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {pendingActions.length>0?<AlertTriangle size={14} color={C.amber}/>:<CheckCircle size={14} color={C.green}/>}
          <span style={{fontSize:13,fontWeight:700,color:pendingActions.length>0?C.amber:C.green}}>
            {pendingActions.length>0?`${pendingActions.length} Actiepunten vereist`:"Alles up-to-date"}
          </span>
        </div>
      </div>
      {dataLoading?<div style={{padding:"32px",textAlign:"center",color:C.secondary,fontSize:12}}>Laden...</div>:
      pendingActions.length===0?(
        <div style={{padding:"32px 24px",textAlign:"center"}}>
          <CheckCircle size={28} color={C.green} style={{marginBottom:10}}/>
          <div style={{fontSize:13,color:C.secondary}}>Geen openstaande acties</div>
        </div>
      ):pendingActions.map((a,i)=>{
        const days=daysUntil(a.deadline);
        const urgent=days!==null&&days<=3;
        return(
          <div key={a.id} style={{padding:"14px 18px",borderTop:i>0?`1px solid ${C.border}`:"none",display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:34,height:34,borderRadius:8,background:urgent?C.redBg:C.amberBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {a.action_type==="upload"?<Upload size={14} color={urgent?C.red:C.amber}/>:
               a.action_type==="approve"?<CheckSquare size={14} color={urgent?C.red:C.amber}/>:
               <ClipboardList size={14} color={urgent?C.red:C.amber}/>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:2}}>{a.title}</div>
              {a.description&&<div style={{fontSize:11,color:C.secondary,marginBottom:4,lineHeight:1.4}}>{a.description.slice(0,80)}{a.description.length>80?"...":""}</div>}
              {a.deadline&&(
                <div style={{fontSize:10,fontWeight:700,color:urgent?C.red:C.secondary}}>
                  {days===0?"Vandaag":days<0?`${Math.abs(days)} dagen achterstallig`:days===1?"Morgen":`${days} dagen`}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>

    {/* Right: engagements + recent docs */}
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"16px 18px"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Uw Dossiers</div>
        {dataLoading?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"12px 0"}}>Laden...</div>:
        engs.length===0?<div style={{fontSize:12,color:C.secondary,textAlign:"center",padding:"16px 0"}}>Geen actieve dossiers</div>:
        engs.map((e,i)=>(
          <div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:C.text}}>{e.name}</div>
              <div style={{fontSize:10,color:C.secondary}}>{e.phase||"—"}</div>
            </div>
            <HealthDot status={e.health}/>
          </div>
        ))}
      </div>

      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"16px 18px"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Recente Documenten</div>
        {dataLoading?<div style={{fontSize:12,color:C.muted,textAlign:"center",padding:"12px 0"}}>Laden...</div>:
        docs.length===0?<div style={{fontSize:12,color:C.secondary,textAlign:"center",padding:"16px 0"}}>Geen documenten beschikbaar</div>:
        docs.map((d,i)=>(
          <div key={d.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <FileText size={13} color={C.secondary}/>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:C.text}}>{d.name}</div>
                <div style={{fontSize:10,color:C.secondary}}>{formatDate(d.uploaded_at)}</div>
              </div>
            </div>
            {d.file_url&&(
              <a href={d.file_url} target="_blank" rel="noopener"
                style={{display:"flex",alignItems:"center",gap:4,padding:"4px 9px",borderRadius:7,background:C.bg,border:`1px solid ${C.border}`,color:C.secondary,fontSize:9,fontWeight:700,textDecoration:"none"}}>
                <Download size={10}/> DL
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>

{/* Openstaande Actiepunten preview */}
{actionsData.filter(a=>a.status==="pending"||a.status==="open").length>0&&(
<div style={{marginTop:20}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
    <div style={{fontFamily:F.display,fontSize:16,fontWeight:600,color:C.text}}>Openstaande Actiepunten</div>
    {onNavigate&&<button onClick={()=>onNavigate("c_actions")}
      style={{fontSize:11,color:C.crimson,fontWeight:700,background:"none",border:"none",cursor:"pointer"}}>
      Alle bekijken →
    </button>}
  </div>
  <div style={{display:"flex",flexDirection:"column",gap:8}}>
    {actionsData.filter(a=>a.status==="pending"||a.status==="open").slice(0,3).map(a=>{
      const overdue=a.deadline&&new Date(a.deadline)<new Date();
      return(
        <div key={a.id} onClick={()=>onNavigate&&onNavigate("c_actions")}
          style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,
            background:C.surface,border:`1px solid ${overdue?C.red:C.border}`,cursor:"pointer",
            boxShadow:"0 1px 4px rgba(58,46,40,.06)"}}>
          <div style={{width:32,height:32,borderRadius:8,background:overdue?C.redBg:C.crimsonFaint,
            display:"flex",alignItems:"center",justifyContent:"center",color:overdue?C.red:C.crimson,flexShrink:0}}>
            {a.action_type==="upload"?<Upload size={13}/>:a.action_type==="sign"?<FileText size={13}/>:<CheckSquare size={13}/>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</div>
            {a.deadline&&<div style={{fontSize:10,color:overdue?C.red:C.secondary,marginTop:2,fontWeight:overdue?700:400}}>
              {overdue?"Achterstallig — ":""}{new Date(a.deadline).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"})}
            </div>}
          </div>
          <ChevronRight size={14} color={C.secondary}/>
        </div>
      );
    })}
  </div>
</div>
)}
</div>);
}

// ─── CLIENT DOCS VIEW ─────────────────────────────────────────────────────────
function ClientDocsView({user}){
const {company,loading:compLoading}=useClientCompany(user.id);
const [docs,setDocs]=useState([]);
const [loading,setLoading]=useState(true);
const [q,setQ]=useState("");

useEffect(()=>{
  if(!company?.id) return;
  supabase.from("documents")
    .select("id,name,file_type,file_size,visibility,review_status,uploaded_at,file_url,folder_name")
    .eq("company_id",company.id)
    .eq("visibility","client")
    .order("uploaded_at",{ascending:false})
    .then(({data})=>{setDocs(data||[]);setLoading(false);})
    .catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[company?.id]);

const formatBytes=(b)=>{
  if(!b) return "—";
  if(b<1024*1024) return (b/1024).toFixed(1)+"KB";
  return (b/(1024*1024)).toFixed(1)+"MB";
};
const formatDate=(d)=>d?new Date(d).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—";

const filtered=docs.filter(d=>!q||d.name.toLowerCase().includes(q.toLowerCase()));

if(compLoading||loading) return <div style={{padding:40,textAlign:"center",color:C.secondary}}>Laden...</div>;

return(
<div>
  <PageHeader kicker="Portaal" title="Mijn Documenten"/>
  <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
    <div style={{position:"relative",flex:1,maxWidth:320}}>
      <Search size={13} style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.secondary}}/>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Zoek document..."
        style={{width:"100%",padding:"7px 30px 7px 32px",borderRadius:9,border:`1.5px solid ${q?C.crimson:C.border}`,fontSize:12,outline:"none",background:C.surface,boxSizing:"border-box"}}/>
      {q&&<button onClick={()=>setQ("")} style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.secondary,padding:0}}><X size={13}/></button>}
    </div>
    <div style={{fontSize:11,color:C.secondary,marginLeft:"auto"}}>{filtered.length} document{filtered.length!==1?"en":""}</div>
  </div>

  <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
    {filtered.length===0?(
      <div style={{padding:"52px 24px",textAlign:"center"}}>
        <FileText size={32} color={C.mushroom} style={{marginBottom:12}}/>
        <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:6}}>
          {q?"Geen resultaten":"Geen documenten beschikbaar"}
        </div>
        <div style={{fontSize:12,color:C.secondary}}>
          {q?"Probeer een andere zoekterm.":"Uw adviseur heeft nog geen documenten gedeeld."}
        </div>
      </div>
    ):(
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:C.warm50}}>
          {["DOCUMENT","TYPE","MAP","DATUM",""].map((h,i)=>(
            <th key={i} style={{padding:"10px 18px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{filtered.map((d,i)=>(
          <tr key={d.id} style={{borderTop:`1px solid ${C.border}`}}>
            <td style={{padding:"13px 18px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:C.crimsonFaint,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <FileText size={14} color={C.crimson}/>
                </div>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:C.text}}>{d.name}</div>
                  <div style={{fontSize:10,color:C.secondary}}>{formatBytes(d.file_size)}</div>
                </div>
              </div>
            </td>
            <td style={{padding:"13px 18px"}}>
              <span style={{fontSize:10,fontWeight:700,color:C.secondary,background:C.warm50,padding:"2px 7px",borderRadius:4}}>
                {(d.file_type||"—").toUpperCase()}
              </span>
            </td>
            <td style={{padding:"13px 18px",fontSize:11,color:C.secondary}}>{d.folder_name||"—"}</td>
            <td style={{padding:"13px 18px",fontSize:11,color:C.secondary}}>{formatDate(d.uploaded_at)}</td>
            <td style={{padding:"13px 18px"}}>
              {d.file_url?(
                <a href={d.file_url} target="_blank" rel="noopener"
                  style={{display:"inline-flex",alignItems:"center",gap:5,padding:"6px 12px",borderRadius:8,background:C.crimson,color:CREAM,fontSize:10,fontWeight:700,textDecoration:"none"}}>
                  <Download size={11}/> Downloaden
                </a>
              ):<span style={{color:C.muted,fontSize:11}}>—</span>}
            </td>
          </tr>
        ))}</tbody>
      </table>
    )}
  </div>
</div>
);
}

// ─── CLIENT FINANCE VIEW ──────────────────────────────────────────────────────
function ClientFinanceView({user,invData}){
const {company,loading:compLoading}=useClientCompany(user.id);
const [invs,setInvs]=useState([]);
const [loading,setLoading]=useState(true);

useEffect(()=>{
  if(!company?.id) return;
  supabase.from("invoices")
    .select("id,reference_code,ref,amount,currency,status,due_date,paid_at,description,file_url")
    .eq("company_id",company.id)
    .order("created_at",{ascending:false})
    .then(({data})=>{setInvs(data||[]);setLoading(false);})
    .catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[company?.id]);

const formatDate=(d)=>d?new Date(d).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—";
const total=invs.reduce((s,i)=>s+Number(i.amount||0),0);
const paid=invs.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.amount||0),0);
const open=invs.filter(i=>["sent","overdue"].includes(i.status)).reduce((s,i)=>s+Number(i.amount||0),0);

const STATUS={
  draft:{label:"CONCEPT",c:C.secondary,bg:C.warm50},
  sent:{label:"OPENSTAAND",c:C.amber,bg:C.amberBg},
  overdue:{label:"ACHTERSTALLIG",c:C.red,bg:C.redBg},
  paid:{label:"BETAALD",c:C.green,bg:C.greenBg},
  cancelled:{label:"GEANNULEERD",c:C.muted,bg:C.warm50},
};

if(compLoading||loading) return <div style={{padding:40,textAlign:"center",color:C.secondary}}>Laden...</div>;

return(
<div>
  <PageHeader kicker="Portaal" title="Mijn Facturen"/>
  {/* KPIs */}
  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
    {[
      {l:"TOTAAL GEFACTUREERD",v:`SRD ${(total/1000).toFixed(1)}K`,c:C.text,bg:C.surface},
      {l:"BETAALD",v:`SRD ${(paid/1000).toFixed(1)}K`,c:C.green,bg:C.greenBg},
      {l:"OPENSTAAND",v:`SRD ${(open/1000).toFixed(1)}K`,c:open>0?C.red:C.green,bg:open>0?C.redBg:C.greenBg},
    ].map(k=>(
      <div key={k.l} style={{background:k.bg,borderRadius:12,padding:"14px 16px",border:`1px solid ${k.c==="text"?C.border:k.c+"30"}`}}>
        <div style={{fontSize:9,fontWeight:700,color:k.c===C.text?C.secondary:k.c,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
        <div style={{fontFamily:F.display,fontSize:22,fontWeight:600,color:k.c}}>{k.v}</div>
      </div>
    ))}
  </div>

  <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
    {invs.length===0?(
      <div style={{padding:"52px 24px",textAlign:"center"}}>
        <Receipt size={32} color={C.mushroom} style={{marginBottom:12}}/>
        <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:6}}>Geen facturen</div>
        <div style={{fontSize:12,color:C.secondary}}>Er zijn nog geen facturen aangemaakt voor uw account.</div>
      </div>
    ):(
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:C.warm50}}>
          {["REFERENTIE","OMSCHRIJVING","BEDRAG","VERVALDATUM","STATUS",""].map((h,i)=>(
            <th key={i} style={{padding:"10px 18px",textAlign:"left",fontSize:9,fontWeight:700,letterSpacing:"0.08em",color:C.secondary,textTransform:"uppercase"}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{invs.map(inv=>{
          const isOverdue=inv.due_date&&new Date(inv.due_date)<new Date()&&inv.status!=="paid";
          const meta=isOverdue?STATUS.overdue:(STATUS[inv.status]||STATUS.sent);
          return(
            <tr key={inv.id} style={{borderTop:`1px solid ${C.border}`,background:isOverdue?"#FFF8F8":"transparent"}}>
              <td style={{padding:"13px 18px",fontSize:12,fontWeight:700,color:C.crimson}}>{inv.reference_code||inv.ref||"—"}</td>
              <td style={{padding:"13px 18px",fontSize:11,color:C.secondary,maxWidth:200}}>{inv.description||"—"}</td>
              <td style={{padding:"13px 18px",fontFamily:F.display,fontSize:16,fontWeight:600,color:C.text}}>SRD {Number(inv.amount||0).toLocaleString()}</td>
              <td style={{padding:"13px 18px",fontSize:12,color:isOverdue?C.red:C.secondary,fontWeight:isOverdue?700:400}}>{formatDate(inv.due_date)}</td>
              <td style={{padding:"13px 18px"}}><Badge label={meta.label} color={meta.c} bg={meta.bg}/></td>
              <td style={{padding:"13px 18px"}}>
                {inv.file_url&&(
                  <a href={inv.file_url} target="_blank" rel="noopener"
                    style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 10px",borderRadius:7,background:C.crimson,color:CREAM,fontSize:9,fontWeight:700,textDecoration:"none"}}>
                    <Download size={10}/> PDF
                  </a>
                )}
              </td>
            </tr>
          );
        })}</tbody>
      </table>
    )}
  </div>
</div>
);
}

// ─── CLIENT ACTIONS PORTAL ────────────────────────────────────────────────────
function ClientActionsPortal({user,showToast,initialActions=[],initialCompany=null,onActionsChange=null}){
const t=useT();
const {company:hookCompany,loading:compLoading}=useClientCompany(user.id);
const company=initialCompany||hookCompany;
const [actions,setActions]=useState([]);
const [loading,setLoading]=useState(true);

// Sync parent state when actions change locally
const updateActions=(fn)=>{
  setActions(prev=>{
    const next=typeof fn==='function'?fn(prev):fn;
    if(onActionsChange) onActionsChange(next);
    return next;
  });
};
const [filter,setFilter]=useState("ALL");

// Always load fresh from DB when company is known
// Simple, no stale closure bugs, always correct
useEffect(()=>{
  if(!company?.id) return;
  setLoading(true);
  Promise.all([
    supabase.from("client_actions")
      .select("id,title,description,action_type,status,deadline,department,engagement_id")
      .eq("company_id",company.id)
      .eq("is_visible_to_client",true)
      .order("deadline",{ascending:true}),
    supabase.from("document_requests")
      .select("id,title,description,document_type,deadline,status")
      .eq("company_id",company.id)
      .eq("status","pending")
      .order("deadline",{ascending:true}),
  ]).then(([{data:ca},{data:dr}])=>{
    const docActions=(dr||[]).map(r=>({
      id:"dr_"+r.id, title:r.title,
      description:r.description||("Upload "+r.document_type+" document"),
      action_type:"upload", status:"pending",
      deadline:r.deadline, isDocRequest:true, docRequestId:r.id,
    }));
    const merged=[...(ca||[]),...docActions];
    setActions(merged);
    if(onActionsChange) onActionsChange(merged);
    setLoading(false);
  }).catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[company?.id]);

const markDone=async(id,actionType)=>{
  // For sign actions: record signature details
  const signedAt=new Date().toISOString();
  const updateData={status:"completed"};
  if(actionType==="sign"){
    updateData.review_note=`Ondertekend door ${company?.contact_name||"Cliënt"} op ${new Date().toLocaleDateString("nl-SR",{day:"2-digit",month:"long",year:"numeric"})} om ${new Date().toLocaleTimeString("nl-SR",{hour:"2-digit",minute:"2-digit"})}`;
  }
  setActions(as=>as.map(a=>a.id===id?{...a,status:"completed",signedAt:actionType==="sign"?signedAt:null}:a));
  await supabase.from("client_actions").update(updateData).eq("id",id);
  // Notify staff of signature
  if(actionType==="sign"){
    if(showToast) showToast("Document ondertekend ✓ — uw adviseur is notificeerd");
  } else {
    if(showToast) showToast("Actie gemarkeerd als voltooid ✓");
  }
};

const formatDate=(d)=>d?new Date(d).toLocaleDateString("nl-SR",{day:"2-digit",month:"short",year:"numeric"}):"—";
const daysUntil=(d)=>{
  if(!d) return null;
  return Math.ceil((new Date(d)-new Date())/86400000);
};

const filtered=actions.filter(a=>{
  if(filter==="ALL") return true;
  if(filter==="open") return a.status!=="completed";
  if(filter==="done") return a.status==="completed";
  return true;
});

const openCount=actions.filter(a=>a.status!=="completed").length;
const doneCount=actions.filter(a=>a.status==="completed").length;

if(compLoading||loading) return <div style={{padding:40,textAlign:"center",color:C.secondary}}>Laden...</div>;

return(
<div>
  <PageHeader kicker="Portaal" title="Mijn Actiepunten"/>

  {/* KPIs */}
  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
    {[
      {l:"OPENSTAAND",v:openCount,c:openCount>0?C.amber:C.green,bg:openCount>0?C.amberBg:C.greenBg,f:"open"},
      {l:"VOLTOOID",v:doneCount,c:C.green,bg:C.greenBg,f:"done"},
      {l:"TOTAAL",v:actions.length,c:C.text,bg:C.surface,f:"ALL"},
    ].map(k=>(
      <div key={k.l} onClick={()=>setFilter(k.f)}
        style={{background:k.bg,borderRadius:12,padding:"14px 16px",border:`1px solid ${filter===k.f?k.c:k.c+"30"}`,cursor:"pointer",transition:"border-color .15s"}}>
        <div style={{fontSize:9,fontWeight:700,color:k.c===C.text?C.secondary:k.c,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{k.l}</div>
        <div style={{fontFamily:F.display,fontSize:26,fontWeight:600,color:k.c}}>{k.v}</div>
      </div>
    ))}
  </div>

  {/* Info banner */}
  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 16px",borderRadius:9,background:C.indigoBg,border:`1px solid ${C.indigo}30`,marginBottom:16,fontSize:11,color:C.indigo,fontWeight:600}}>
    <Shield size={13}/>
    Uw actiepunten zijn aangemaakt door uw adviseur. Klik op "Voltooid" zodra u een actie heeft afgerond.
  </div>

  {/* Actions list */}
  <div style={{display:"flex",flexDirection:"column",gap:10}}>
    {filtered.length===0?(
      <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,padding:"52px 24px",textAlign:"center"}}>
        <CheckCircle size={32} color={C.green} style={{marginBottom:12}}/>
        <div style={{fontFamily:F.display,fontSize:18,fontWeight:600,color:C.text,marginBottom:6}}>
          {filter==="done"?"Voltooide acties":filter==="open"?"Geen openstaande acties":"Geen acties"}
        </div>
        <div style={{fontSize:12,color:C.secondary}}>
          {filter==="open"?"Alle acties zijn afgehandeld. Goed gedaan!":"Uw adviseur heeft nog geen acties aangemaakt."}
        </div>
      </div>
    ):filtered.map(a=>{
      const done=a.status==="completed";
      const days=daysUntil(a.deadline);
      const overdue=days!==null&&days<0&&!done;
      const urgent=days!==null&&days<=2&&!done;
      return(
        <div key={a.id} style={{background:C.surface,borderRadius:14,border:`1.5px solid ${done?C.green+"40":overdue?C.red+"40":urgent?C.amber+"40":C.border}`,padding:"18px 20px",display:"flex",gap:16,alignItems:"flex-start",opacity:done?0.7:1,transition:"opacity .15s"}}>
          {/* Type icon */}
          <div style={{width:42,height:42,borderRadius:10,background:done?C.greenBg:overdue?C.redBg:urgent?C.amberBg:C.crimsonFaint,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {a.action_type==="upload"?<Upload size={17} color={done?C.green:overdue?C.red:urgent?C.amber:C.crimson}/>:
             a.action_type==="approve"?<CheckSquare size={17} color={done?C.green:overdue?C.red:urgent?C.amber:C.crimson}/>:
             a.action_type==="sign"?<FileText size={17} color={done?C.green:overdue?C.red:urgent?C.amber:C.crimson}/>:
             <ClipboardList size={17} color={done?C.green:overdue?C.red:urgent?C.amber:C.crimson}/>}
          </div>
          {/* Content */}
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:700,color:done?C.secondary:C.text,textDecoration:done?"line-through":"none"}}>{a.title}</span>
              {done&&<span style={{fontSize:9,fontWeight:700,color:C.green,background:C.greenBg,padding:"2px 8px",borderRadius:4}}>VOLTOOID</span>}
              {overdue&&<span style={{fontSize:9,fontWeight:700,color:C.red,background:C.redBg,padding:"2px 8px",borderRadius:4}}>ACHTERSTALLIG</span>}
              {urgent&&!overdue&&<span style={{fontSize:9,fontWeight:700,color:C.amber,background:C.amberBg,padding:"2px 8px",borderRadius:4}}>URGENT</span>}
            </div>
            {a.description&&<div style={{fontSize:12,color:C.secondary,lineHeight:1.6,marginBottom:6}}>{a.description}</div>}
            <div style={{display:"flex",alignItems:"center",gap:12,fontSize:11,color:C.secondary}}>
              {a.deadline&&<span style={{color:overdue?C.red:days<=2?C.amber:C.secondary,fontWeight:overdue||days<=2?700:400}}>
                Deadline: {formatDate(a.deadline)}
                {!done&&days!==null&&` (${days===0?"vandaag":days<0?`${Math.abs(days)}d achterstallig`:`${days}d`})`}
              </span>}
              <span style={{fontSize:9,fontWeight:700,color:C.secondary,background:C.warm50,padding:"2px 7px",borderRadius:4,textTransform:"uppercase"}}>
                {a.action_type==="upload"?"Upload vereist":a.action_type==="approve"?"Goedkeuring vereist":a.action_type==="sign"?"Handtekening vereist":"Beoordeling vereist"}
              </span>
            </div>
          </div>
          {/* Action button */}
          {!done&&(
            <button onClick={()=>markDone(a.id,a.action_type)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:9,background:a.action_type==="sign"?C.taupe:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>
              {a.action_type==="sign"?<FileText size={13}/>:<CheckCircle size={13}/>}
              {a.action_type==="sign"?"Bevestig handtekening":"Markeer voltooid"}
            </button>
          )}
        </div>
      );
    })}
  </div>
</div>
);
}

// ─── CLIENT MESSAGES VIEW ─────────────────────────────────────────────────────
function ClientMessagesView({user,showToast}){
const {company,loading:compLoading}=useClientCompany(user.id);
const [messages,setMessages]=useState([]);
const [engagements,setEngagements]=useState([]);
const [activeEng,setActiveEng]=useState(null);
const [loading,setLoading]=useState(true);
const [newMsg,setNewMsg]=useState("");
const [sending,setSending]=useState(false);
const messagesEndRef=React.useRef(null);

useEffect(()=>{
  if(!company?.id) return;
  supabase.from("engagements")
    .select("id,name,department,status")
    .eq("company_id",company.id)
    .order("created_at",{ascending:false})
    .then(({data})=>{
      setEngagements(data||[]);
      if(data?.length>0) setActiveEng(data[0].id);
    }).catch(e=>console.warn("DB [document_requests]:", e?.message||e));
},[company?.id]);

useEffect(()=>{
  if(!activeEng){setLoading(false);return;}
  setLoading(true);
  supabase.from("messages")
    .select("id,body,author_id,created_at,visible_to_client")
    .eq("engagement_id",activeEng)
    .eq("visible_to_client",true)
    .order("created_at",{ascending:true})
    .then(({data})=>{setMessages(data||[]);setLoading(false);})
    .catch(e=>{setLoading(false);console.warn("DB load error:",e?.message||e)});
},[activeEng]);

useEffect(()=>{
  messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
},[messages]);

const sendMessage=async()=>{
  if(!newMsg.trim()||!activeEng||sending) return;
  setSending(true);
  const optimistic={id:`temp_${Date.now()}`,body:newMsg.trim(),author_id:user.id,created_at:new Date().toISOString(),visible_to_client:true};
  setMessages(ms=>[...ms,optimistic]);
  setNewMsg("");
  try{
    await supabase.from("messages").insert({
      body:newMsg.trim(),
      engagement_id:activeEng,
      author_id:user.id,
      visible_to_client:true,
    });
    if(showToast) showToast("Bericht verzonden ✓");
  }catch(e){
    setMessages(ms=>ms.filter(m=>m.id!==optimistic.id));
    if(showToast) showToast("Verzenden mislukt");
  }
  setSending(false);
};

const formatTime=(d)=>{
  const date=new Date(d);
  const diff=(new Date()-date)/1000;
  if(diff<60) return "Zojuist";
  if(diff<3600) return `${Math.floor(diff/60)}m geleden`;
  if(diff<86400) return `${Math.floor(diff/3600)}u geleden`;
  return date.toLocaleDateString("nl-SR",{day:"2-digit",month:"short"});
};

if(compLoading) return <div style={{padding:40,textAlign:"center",color:C.secondary}}>Laden...</div>;

return(
<div>
  <PageHeader kicker="Portaal" title="Berichten"/>
  <div style={{display:"grid",gridTemplateColumns:"220px 1fr",gap:16,height:"calc(100vh - 220px)",minHeight:500}}>
    {/* Sidebar: engagement list */}
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:700,color:C.secondary,letterSpacing:"0.08em",textTransform:"uppercase"}}>DOSSIERS</div>
      <div style={{overflowY:"auto",flex:1}}>
        {engagements.length===0?(
          <div style={{padding:"24px",textAlign:"center",color:C.secondary,fontSize:11}}>Geen dossiers</div>
        ):engagements.map(e=>(
          <div key={e.id} onClick={()=>setActiveEng(e.id)}
            style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:activeEng===e.id?C.crimsonFaint:"transparent",transition:"background .15s"}}>
            <div style={{fontSize:12,fontWeight:activeEng===e.id?700:600,color:activeEng===e.id?C.crimson:C.text,marginBottom:2}}>{e.name}</div>
            <div style={{fontSize:10,color:C.secondary}}>{e.department==="TC"?"Project":"Dossier"}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Messages panel */}
    <div style={{background:C.surface,borderRadius:14,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Header */}
      <div style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <Send size={14} color={C.crimson}/>
        <span style={{fontSize:13,fontWeight:700,color:C.text}}>
          {activeEng?engagements.find(e=>e.id===activeEng)?.name||"Berichten":"Selecteer een dossier"}
        </span>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px",display:"flex",flexDirection:"column",gap:12}}>
        {!activeEng?(
          <div style={{textAlign:"center",color:C.secondary,fontSize:12,marginTop:40}}>Selecteer een dossier om berichten te bekijken</div>
        ):loading?(
          <div style={{textAlign:"center",color:C.secondary,fontSize:12,marginTop:40}}>Laden...</div>
        ):messages.length===0?(
          <div style={{textAlign:"center",color:C.secondary,fontSize:12,marginTop:40}}>
            <Send size={24} color={C.mushroom} style={{marginBottom:10,display:"block",margin:"0 auto 10px"}}/>
            Nog geen berichten. Stuur het eerste bericht aan uw adviseur.
          </div>
        ):messages.map(m=>{
          const isMe=m.author_id===user.id;
          return(
            <div key={m.id} style={{display:"flex",alignItems:"flex-end",gap:8,flexDirection:isMe?"row-reverse":"row"}}>
              <Avatar initials={isMe?(user.name||"U").slice(0,2).toUpperCase():"AD"} size={28} bg={isMe?C.crimson:C.taupe}/>
              <div style={{maxWidth:"70%"}}>
                <div style={{fontSize:11,color:C.secondary,marginBottom:4,textAlign:isMe?"right":"left"}}>
                  {isMe?"Ik":"Adviseur"} · {formatTime(m.created_at)}
                </div>
                <div style={{background:isMe?C.crimson:C.warm50,color:isMe?CREAM:C.text,borderRadius:isMe?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"10px 14px",fontSize:13,lineHeight:1.6}}>
                  {m.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}/>
      </div>

      {/* Input */}
      {activeEng&&(
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"flex",gap:10,flexShrink:0}}>
          <input value={newMsg} onChange={e=>setNewMsg(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
            placeholder="Typ een bericht aan uw adviseur..."
            style={{flex:1,padding:"10px 14px",borderRadius:10,border:`1.5px solid ${newMsg?C.crimson:C.border}`,fontSize:12,outline:"none",fontFamily:F.body,background:C.bg,color:C.text}}/>
          <button onClick={sendMessage} disabled={!newMsg.trim()||sending}
            style={{padding:"10px 16px",borderRadius:10,background:newMsg.trim()?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:newMsg.trim()?"pointer":"default",display:"flex",alignItems:"center",gap:6}}>
            <Send size={13}/>{sending?"...":"Stuur"}
          </button>
        </div>
      )}
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
<div style={{position:"fixed",inset:0,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
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


// ─── INVOICE PDF GENERATOR ───────────────────────────────────────────────────
function generateInvoicePDF(inv, companyName){
  const sLabel={paid:"BETAALD",sent:"OPENSTAAND",overdue:"ACHTERSTALLIG",draft:"CONCEPT"};
  const sColor={paid:"#15803D",sent:"#B45309",overdue:"#DC2626",draft:"#6B7280"};
  const sBg={paid:"#F0FDF4",sent:"#FFFBEB",overdue:"#FEF2F2",draft:"#F9FAFB"};
  const status=inv.status||"draft";
  const ref=inv.reference_code||inv.ref||"—";
  const amount=Number(inv.amount||0);
  const subtotal=inv.subtotal||amount*0.85;
  const tax=inv.tax_amount||amount*0.15;
  const fmtDate=(d)=>d?new Date(d).toLocaleDateString("nl-SR",{day:"2-digit",month:"long",year:"numeric"}):"—";
  const fmtAmt=(n)=>"SRD "+Number(n).toLocaleString("nl-SR",{minimumFractionDigits:2,maximumFractionDigits:2});

  // Parse line items if stored as JSON
  let lineItems=[];
  try{
    if(inv.line_items) lineItems=typeof inv.line_items==="string"?JSON.parse(inv.line_items):inv.line_items;
  }catch(e){}
  if(!lineItems.length){
    lineItems=[
      {desc:inv.description||"Dienstverlening",qty:1,unit:fmtAmt(subtotal),total:fmtAmt(subtotal)},
      {desc:"BTW (15%)",qty:1,unit:fmtAmt(tax),total:fmtAmt(tax)},
    ];
  }

  const html=`<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8"/>
<title>Factuur ${ref}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:"Helvetica Neue",Arial,sans-serif;color:#1C1917;background:#fff;font-size:12px;line-height:1.5;}
  .page{max-width:794px;margin:0 auto;padding:48px 52px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #8B1A2B;}
  .logo-block .brand{font-size:22px;font-weight:700;color:#8B1A2B;letter-spacing:-0.5px;}
  .logo-block .sub{font-size:10px;color:#78716C;letter-spacing:0.12em;text-transform:uppercase;margin-top:2px;}
  .invoice-title{text-align:right;}
  .invoice-title h1{font-size:28px;font-weight:300;color:#8B1A2B;letter-spacing:-1px;}
  .invoice-title .ref{font-size:13px;font-weight:700;color:#1C1917;margin-top:4px;}
  .invoice-title .date{font-size:11px;color:#78716C;margin-top:2px;}
  .meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;margin-bottom:36px;}
  .meta-block .label{font-size:8px;font-weight:700;color:#78716C;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:5px;}
  .meta-block .value{font-size:13px;font-weight:600;color:#1C1917;}
  .meta-block .value-sub{font-size:11px;color:#78716C;margin-top:1px;}
  .status-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:0.08em;background:${sBg[status]};color:${sColor[status]};border:1px solid ${sColor[status]}40;}
  table{width:100%;border-collapse:collapse;margin-bottom:28px;}
  thead tr{background:#8B1A2B;}
  thead th{padding:10px 14px;text-align:left;font-size:9px;font-weight:700;color:#fff;letter-spacing:0.1em;text-transform:uppercase;}
  thead th:last-child{text-align:right;}
  tbody tr{border-bottom:1px solid #F0EDE8;}
  tbody tr:last-child{border-bottom:none;}
  tbody td{padding:12px 14px;font-size:12px;color:#1C1917;vertical-align:top;}
  tbody td:last-child{text-align:right;font-weight:600;}
  .totals{margin-left:auto;width:260px;}
  .total-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #F0EDE8;font-size:12px;}
  .total-row.grand{border-bottom:none;padding-top:10px;margin-top:4px;border-top:2px solid #8B1A2B;}
  .total-row.grand .label{font-weight:700;font-size:14px;color:#1C1917;}
  .total-row.grand .value{font-weight:700;font-size:16px;color:#8B1A2B;}
  .total-row .label{color:#78716C;}
  .total-row .value{font-weight:600;color:#1C1917;}
  .paid-banner{margin-top:24px;padding:14px 18px;background:#F0FDF4;border:1px solid #15803D30;border-radius:8px;display:flex;align-items:center;gap:10px;}
  .paid-banner .check{color:#15803D;font-size:18px;}
  .paid-banner .text{font-size:12px;font-weight:600;color:#15803D;}
  .footer{margin-top:48px;padding-top:20px;border-top:1px solid #E8E0D8;display:flex;justify-content:space-between;align-items:center;}
  .footer .left{font-size:10px;color:#78716C;line-height:1.7;}
  .footer .right{text-align:right;font-size:10px;color:#A8A29E;}
  .notes{margin-top:20px;padding:14px;background:#FAFAF9;border-radius:6px;font-size:11px;color:#78716C;line-height:1.6;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div class="header">
    <div class="logo-block">
      <div class="brand">The Glass Executive</div>
      <div class="sub">${status==="sent"||status==="draft"?"Tactigent Consultancy":"Fiscal Fuse"} · Suriname</div>
    </div>
    <div class="invoice-title">
      <h1>Factuur</h1>
      <div class="ref">${ref}</div>
      <div class="date">Datum: ${fmtDate(inv.created_at||inv.date||new Date())}</div>
    </div>
  </div>

  <!-- Meta -->
  <div class="meta">
    <div class="meta-block">
      <div class="label">Cliënt</div>
      <div class="value">${companyName||inv.client||"—"}</div>
    </div>
    <div class="meta-block">
      <div class="label">Vervaldatum</div>
      <div class="value">${fmtDate(inv.due_date)}</div>
      ${inv.paid_at?`<div class="value-sub">Betaald op: ${fmtDate(inv.paid_at)}</div>`:""}
    </div>
    <div class="meta-block">
      <div class="label">Status</div>
      <div class="status-badge">${sLabel[status]||"ONBEKEND"}</div>
    </div>
  </div>

  <!-- Line items table -->
  <table>
    <thead>
      <tr>
        <th style="width:50%">Omschrijving</th>
        <th style="width:15%;text-align:center">Aantal</th>
        <th style="width:17%;text-align:right">Eenheidsprijs</th>
        <th style="width:18%;text-align:right">Totaal</th>
      </tr>
    </thead>
    <tbody>
      ${lineItems.map(item=>`
        <tr>
          <td>${item.desc||item.description||"—"}</td>
          <td style="text-align:center">${item.qty||1}</td>
          <td style="text-align:right">${item.unit||fmtAmt(item.unit_price||0)}</td>
          <td>${item.total||fmtAmt(item.total_price||0)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="total-row">
      <span class="label">Subtotaal</span>
      <span class="value">${fmtAmt(subtotal)}</span>
    </div>
    <div class="total-row">
      <span class="label">BTW (15%)</span>
      <span class="value">${fmtAmt(tax)}</span>
    </div>
    <div class="total-row grand">
      <span class="label">TOTAAL</span>
      <span class="value">${fmtAmt(amount)}</span>
    </div>
  </div>

  ${status==="paid"?`<div class="paid-banner"><span class="check">&#10003;</span><span class="text">Betaling ontvangen op ${fmtDate(inv.paid_at)} — Bedankt!</span></div>`:""}

  ${inv.notes?`<div class="notes"><strong>Notities:</strong> ${inv.notes}</div>`:""}

  <!-- Footer -->
  <div class="footer">
    <div class="left">
      The Glass Executive · Paramaribo, Suriname<br/>
      info@tactigentconsultancy.com<br/>
      KKF Nr. 12345678
    </div>
    <div class="right">
      Factuur ${ref}<br/>
      Gegenereerd op ${new Date().toLocaleDateString("nl-SR",{day:"2-digit",month:"long",year:"numeric"})}<br/>
      Pagina 1 van 1
    </div>
  </div>
</div>
</body>
</html>`;

  // Open in print window
  const win=window.open("","_blank","width=900,height=700");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(()=>{
    win.print();
  },600);
}

// ─── InvoicePreviewModal ─────────────────────────────────────────
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
<div style={{position:"fixed",inset:0,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
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
<button onClick={()=>generateInvoicePDF(inv, inv.client||"")} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:9,background:C.crimson,color:CREAM,border:"none",fontSize:11,fontWeight:700,cursor:"pointer"}}>
<Download size={13}/> PDF Genereren
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
            <div style={{fontSize:11,color:C.secondary,lineHeight:1.6}}>Bank: DSB Suriname · IBAN: SR12 3456 7890 1234 · t.n.v. The Glass Executive N.V.</div>
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


function SettingsView({user,language,setLanguage,showToast}){
const [activeTab,setActiveTab]=useState("profile");
const [name,setName]=useState(user.name);
const [email,setEmail]=useState(user.email);
const [title,setTitle]=useState(user.title||"");
const [notifPrefs,setNotifPrefs]=useState({email:true,inApp:true,sms:false,weekly:true,clientActions:true,invoices:true});
const [avatarUrl,setAvatarUrl]=useState(null);
const [uploading,setUploading]=useState(false);

// Load existing avatar on mount
useEffect(()=>{
  const loadAvatar=async()=>{
    try{
      const {data}=await supabase.from("user_profiles").select("avatar_url").eq("id",user.id).single();
      if(data?.avatar_url) setAvatarUrl(data.avatar_url);
    }catch(e){}
  };
  loadAvatar();
},[user.id]);
const [pwdNew,setPwdNew]=useState("");
const [pwdConfirm,setPwdConfirm]=useState("");
const [pwdSaving,setPwdSaving]=useState(false);
const [pwdError,setPwdError]=useState("");
const changePassword=async()=>{
  if(!pwdNew.trim()) return setPwdError("Voer een nieuw wachtwoord in");
  if(pwdNew.length<8) return setPwdError("Wachtwoord minimaal 8 tekens");
  if(pwdNew!==pwdConfirm) return setPwdError("Wachtwoorden komen niet overeen");
  setPwdSaving(true);setPwdError("");
  try{
    const {error:pwdErr}=await supabase.auth.updateUser({password:pwdNew});
    if(pwdErr) throw new Error(pwdErr.message||"Fout bij wijzigen");
    const d={};
    showToast("Wachtwoord gewijzigd ✓");
    setPwdNew("");setPwdConfirm("");
  }catch(e){setPwdError(e.message);}
  setPwdSaving(false);
};
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
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" style={{width:64,height:64,borderRadius:"50%",objectFit:"cover",border:`3px solid ${C.border}`}}/>
                  : <Avatar initials={user.avatar} size={64} bg={C.crimson}/>
                }
                <div style={{position:"absolute",bottom:-2,right:-2,width:22,height:22,borderRadius:"50%",background:uploading?C.amber:C.walnut,border:`2px solid ${C.surface}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {uploading
                    ? <div style={{width:10,height:10,border:"2px solid rgba(255,255,255,.4)",borderTopColor:CREAM,borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
                    : <Upload size={11} color={CREAM}/>
                  }
                </div>
                <input id="profileUpload" type="file" accept="image/jpeg,image/png,image/webp" style={{display:"none"}}
                  onChange={async(e)=>{
                    const file=e.target.files?.[0];
                    if(!file) return;
                    if(file.size>2*1024*1024){showToast("Afbeelding mag max 2MB zijn");return;}
                    setUploading(true);
                    try{
                      // Upload to Supabase Storage
                      const ext=file.name.split(".").pop();
                      const path=`${user.id}.${ext}`;
                      const formData=new FormData();
                      formData.append("",file);
                      const SB_URL_STORAGE="https://qjlijtlqtyzytxcmzwvu.supabase.co";
                      const res=await fetch(`${SB_URL_STORAGE}/storage/v1/object/avatars/${path}`,{
                        method:"POST",
                        headers:{
                          "Authorization":`Bearer ${_authToken}`,
                          "apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbGlqdGxxdHl6eXR4Y216d3Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTE3MjAsImV4cCI6MjA5MjEyNzcyMH0.EwHl1enE8b5LBXUBQTMSDT4Mv0O6Kkdjbtg1LooH4f8",
                          "x-upsert":"true",
                        },
                        body:formData,
                      });
                      if(res.ok){
                        // Get public URL
                        const publicUrl=`${SB_URL_STORAGE}/storage/v1/object/public/avatars/${path}?t=${Date.now()}`;
                        setAvatarUrl(publicUrl);
                        // Save URL to user_profiles
                        await supabase.from("user_profiles").update({avatar_url:publicUrl}).eq("id",user.id);
                        showToast("Profielfoto bijgewerkt ✓");
                      } else {
                        const err=await res.json().catch(e=>console.warn("auth error:",e?.message||e));
                        showToast(`Upload mislukt: ${err.message||res.statusText}`);
                      }
                    }catch(ex){showToast("Upload mislukt. Probeer opnieuw.");}
                    setUploading(false);
                  }}
                />
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
            {pwdError&&<div style={{fontSize:11,color:C.red,marginBottom:10,padding:"8px 12px",borderRadius:8,background:C.redBg}}>{pwdError}</div>}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6}}>NIEUW WACHTWOORD</div>
              <input type="password" value={pwdNew} onChange={e=>setPwdNew(e.target.value)} placeholder="Minimaal 8 tekens"
                style={{width:"100%",padding:"9px 13px",borderRadius:9,border:`1.5px solid ${pwdNew?C.crimson:C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:9,fontWeight:700,color:C.secondary,letterSpacing:"0.09em",textTransform:"uppercase",marginBottom:6}}>BEVESTIG WACHTWOORD</div>
              <input type="password" value={pwdConfirm} onChange={e=>setPwdConfirm(e.target.value)} placeholder="Herhaal nieuw wachtwoord"
                style={{width:"100%",padding:"9px 13px",borderRadius:9,border:`1.5px solid ${pwdConfirm&&pwdConfirm===pwdNew?C.green:pwdConfirm?C.red:C.border}`,fontSize:12,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text}}/>
            </div>
            <button onClick={changePassword} disabled={pwdSaving||!pwdNew||!pwdConfirm}
              style={{padding:"10px 22px",borderRadius:9,background:pwdNew&&pwdConfirm?C.crimson:C.mushroom,color:CREAM,border:"none",fontSize:12,fontWeight:700,cursor:pwdNew&&pwdConfirm?"pointer":"default"}}>
              {pwdSaving?"Opslaan...":"Wachtwoord wijzigen"}</button>
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
const {data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password:pw});
if(error){setErr("Onjuist e-mailadres of wachtwoord.");setLoading(false);return;}
const uid=data.user.id;
const meta=data.user.user_metadata||{};
let profile=null;
try{
  const pr=await supabase.from('user_profiles').select('id,full_name,email,role,department,company_id,title,avatar_initials,language').eq('id',uid).single();
  if(pr.data) profile=pr.data;
}catch(e){}
if(!profile){
  profile={
    id:uid,
    full_name:meta.full_name||data.user.email||email.trim(),
    email:data.user.email||email.trim(),
    role:meta.role||'staff',
    department:meta.department||'BOTH',
    company_id:null,
    title:meta.role==='super_admin'?'CEO & Super Admin':meta.role==='staff'?'Adviseur':'',
    avatar_initials:(meta.full_name||email.trim()).split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'??',
    language:'NL',
  };
}
// Update _authToken for raw DELETE fetch calls
setAuthToken(data.session?.access_token || data.user?.id);
onLogin({
  id:profile.id, name:profile.full_name, email:profile.email,
  role:profile.role, dept:profile.department, company_id:profile.company_id,
  title:profile.title||'', avatar:profile.avatar_initials||'??',
  language:profile.language||'NL',
});
}catch(e){setErr("Er is iets misgegaan. Probeer opnieuw.");}
setLoading(false);
};
return(
<LangCtx.Provider value={language}>
<GlobalStyles darkMode={false}/>
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
<div style={{position:"relative"}}><Mail size={14} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:C.muted}}/><input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()} placeholder={t("emailPlaceholder")} style={{width:"100%",padding:"11px 14px 11px 38px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text,transition:"border-color .15s"}}/></div>
</div>
<div style={{marginBottom:22}}>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:10,fontWeight:700,color:C.secondary,letterSpacing:"0.12em",textTransform:"uppercase"}}>{t("password")}</span><span style={{fontSize:11,fontWeight:700,color:C.crimson,cursor:"pointer"}}>{t("forgotPw")}</span></div>
<div style={{position:"relative"}}><Lock size={14} style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:C.muted}}/><input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()} placeholder="********" style={{width:"100%",padding:"11px 14px 11px 38px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",boxSizing:"border-box",background:C.bg,color:C.text,transition:"border-color .15s"}}/></div>
</div>
{err&&<div style={{fontSize:12,color:C.amber,marginBottom:16,padding:"10px 14px",borderRadius:10,background:C.amberBg,border:`1.5px solid ${C.amber}40`,display:"flex",alignItems:"center",gap:8}}><AlertTriangle size={13} color={C.amber}/>{err}</div>}
<button onClick={tryLogin} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:11,background:loading?C.walnut:C.crimson,color:CREAM,border:"none",fontSize:13,fontWeight:700,cursor:loading?"default":"pointer",marginBottom:24,boxShadow:loading?"none":"0 4px 16px rgba(139,26,43,.28)",transition:"background .15s,box-shadow .15s",letterSpacing:"0.02em"}}>{loading?t("loggingIn"):t("login")} {!loading&&"->"}</button>
<div style={{marginTop:4,textAlign:"center",fontSize:10,color:C.muted,letterSpacing:"0.04em"}}>(c) {new Date().getFullYear()} The Client Portal · Beheerd door Corporate IT</div>
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
action: "Aan de slag ->",
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
action: "Identiteit bevestigen ->",
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
action: "Gegevens opslaan ->",
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
action: "Diensten bevestigen ->",
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
action: "Instellingen opslaan ->",
},
{
id: "done",
title: "Uw portaal is klaar!",
subtitle: "Onboarding voltooid",
description: "Alles is ingesteld. U kunt nu volledig gebruik maken van The Client Portal. Uw adviseur wordt automatisch op de hoogte gesteld.",
icon: CheckCircle, color: C.green,
action: "Naar mijn dashboard ->",
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




// ─── ERROR BOUNDARY ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={hasError:false,error:null}; }
  static getDerivedStateFromError(error){ return {hasError:true,error}; }
  componentDidCatch(error,info){ console.error("AppError:",error,info); }
  render(){
    if(this.state.hasError){
      const C2=THEMES.light;
      return(
        <div style={{minHeight:"100vh",background:C2.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Jost',sans-serif"}}>
          <div style={{background:C2.surface,borderRadius:20,padding:"32px 36px",maxWidth:480,width:"95vw",boxShadow:"0 24px 60px rgba(58,46,40,.15)",textAlign:"center"}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:C2.redBg,border:`2px solid ${C2.red}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
              <span style={{fontSize:22}}>!</span>
            </div>
            <div style={{fontFamily:"'Cormorant Garamond',Georgia,serif",fontSize:22,fontWeight:600,color:C2.text,marginBottom:8}}>Er is iets misgegaan</div>
            <div style={{fontSize:12,color:C2.secondary,marginBottom:6,lineHeight:1.6}}>
              {this.state.error?.message || "Onbekende fout"}
            </div>
            <div style={{fontSize:10,color:C2.muted,fontFamily:"monospace",background:C2.warm50,padding:"8px 12px",borderRadius:8,marginBottom:20,textAlign:"left",wordBreak:"break-all"}}>
              {this.state.error?.stack?.split("\n")[0] || ""}
            </div>
            <button onClick={()=>window.location.reload()}
              style={{padding:"10px 24px",borderRadius:10,background:"#8B1A2B",color:"#F5F1EC",border:"none",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              Pagina herladen
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App(){
const [user,setUser]=useState(null);
const [language,setLanguage]=useState("NL");
const handleLogin=(u)=>{ setUser(u); };

if(!user) return <LoginPage onLogin={handleLogin} language={language} setLanguage={setLanguage}/>;
return <ErrorBoundary><AppShell user={user} language={language} setLanguage={setLanguage} onLogout={async()=>{try{await supabase.auth.signOut();}catch(e){}setAuthToken(null);setUser(null);}}/></ErrorBoundary>;
}
