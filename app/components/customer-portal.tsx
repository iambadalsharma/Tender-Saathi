"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  FilePlus2,
  FolderOpen,
  Gauge,
  Languages,
  LayoutDashboard,
  Lightbulb,
  LogIn,
  LogOut,
  Moon,
  PackageCheck,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Upload,
  UserPlus,
  UsersRound,
  X,
  Plus,
  Trash2,
  Settings,
  CreditCard,
  Check,
} from "lucide-react";
import {
  calculateDashboardStats,
  demoCustomer,
  initialOrders,
  initialTenders,
  orderColumns as defaultOrderColumnsConfig,
  serviceHighlights,
  tenderColumns as defaultTenderColumnsConfig,
  type CustomerProfile,
  type OrderRow,
  type TenderRow,
} from "@/lib/tender-data";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { InteractiveBackground } from "./interactive-background";

type Language = "en" | "hi";
type Theme = "light" | "dark";
type PublicPage = "home" | "features" | "growth" | "pricing" | "resources";
type ViewKey = "dashboard" | "tenders" | "orders" | "folders" | "analysis" | "alerts" | "team" | "payments";
type AuthMode = "login" | "signup";
type AuthMethod = "email" | "phone";

type IconType = typeof LayoutDashboard;

interface ColumnConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: string[];
}

interface PaymentRecord {
  id: string;
  plan_name: string;
  amount: string;
  transaction_id: string;
  payment_method: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

const defaultTenderColumns: ColumnConfig[] = defaultTenderColumnsConfig.map((col) => {
  let type: ColumnConfig["type"] = "text";
  let options: string[] | undefined;

  if (col.key === "serialNo" || col.key === "dueDays") type = "number";
  if (col.key === "publishedDate" || col.key === "submissionEndDate" || col.key === "preBidDate") type = "date";
  if (col.key === "toBeApplied") {
    type = "select";
    options = ["Yes", "No", "Decide"];
  }
  if (col.key === "applied" || col.key === "ra") {
    type = "select";
    options = ["Yes", "No"];
  }
  if (col.key === "currentStatus") {
    type = "select";
    options = ["Live", "Upcoming", "Working", "Filed", "Missed", "Won", "Lost"];
  }

  return { key: col.key, label: col.label, type, options };
});

const defaultOrderColumns: ColumnConfig[] = defaultOrderColumnsConfig.map((col) => {
  let type: ColumnConfig["type"] = "text";
  let options: string[] | undefined;

  if (col.key === "serialNo") type = "number";
  if (col.key === "contractDate" || col.key === "bgIssueDate") type = "date";
  if (col.key === "orderStatus") {
    type = "select";
    options = ["Work in progress", "Material dispatch pending", "Pending", "Active", "Done"];
  }
  if (col.key === "bgStatus") {
    type = "select";
    options = ["Active", "Inactive", "Pending"];
  }
  if (col.key === "collectedOrNot") {
    type = "select";
    options = ["Collected", "Pending"];
  }
  if (col.key === "couriered") {
    type = "select";
    options = ["Yes", "No"];
  }

  return { key: col.key, label: col.label, type, options };
});

const copy = {
  en: {
    brand: "Tender Saathi",
    tagline: "Tender growth and order control desk",
    login: "Login",
    signup: "Sign up",
    language: "Hindi",
    nav: {
      home: "Home",
      features: "Features",
      growth: "Growth plan",
      pricing: "Plans",
      resources: "Resources",
    },
    heroLabel: "Tender growth platform",
    heroTitle: "Find, file, track, and win more tenders from one simple customer dashboard.",
    heroText:
      "Tender Saathi keeps tender dates, documents, team work, orders, BG status, and growth analysis in one place so business owners can act without confusion.",
    primaryCta: "Create account",
    secondaryCta: "Open dashboard",
    sideTitle: "Owner-friendly access",
    sideText: "Every customer gets a unique ID, private tender folders, dashboard exports, and clear alerts.",
    dashboardPreview: "Dashboard preview",
    previewTitle: "What the customer sees after login",
    previewText:
      "Tender counts, due dates, order follow-up, document folders, risk alerts, and growth recommendations are visible without extra training.",
    dashboard: "Dashboard",
    tenders: "Tenders",
    orders: "Orders",
    folders: "Folders",
    analysis: "Analysis",
    alerts: "Alerts",
    team: "Team",
    payments: "Payments",
    excel: "Excel download",
    csv: "CSV download",
    logout: "Logout",
    addTender: "Add tender",
    tenderNumber: "Tender number",
    tenderTitle: "Tender title",
    tenderPdf: "Tender PDF",
    addAndFolder: "Add and create folder",
    dueList: "Due tender list",
    dueHelp: "See which tender is due soon and which stage needs action.",
    fullList: "Full list",
    searchTender: "Search tender",
    recordsVisible: "records visible",
    customerId: "Customer ID",
    ownerName: "Owner name",
    firmName: "Company / Firm name",
    mobile: "Mobile",
    email: "Email",
    createId: "Create customer ID",
    openDashboard: "Open dashboard",
    orderSummary: "Order summary",
    folderBase: "Base folder",
    files: "Files",
  },
  hi: {
    brand: "Tender Saathi",
    tagline: "Tender growth aur order control desk",
    login: "Login",
    signup: "Sign up",
    language: "English",
    nav: {
      home: "Home",
      features: "Features",
      growth: "Growth plan",
      pricing: "Plans",
      resources: "Help",
    },
    heroLabel: "Tender growth platform",
    heroTitle: "Ek simple dashboard se tender dhoondho, file karo, track karo aur zyada tender jeeto.",
    heroText:
      "Tender Saathi me due date, documents, team ka kaam, orders, BG status aur growth analysis ek jagah dikhta hai, taaki owner bina confusion ke decision le sake.",
    primaryCta: "Naya account",
    secondaryCta: "Dashboard kholein",
    sideTitle: "Owner ke liye easy access",
    sideText: "Har customer ko unique ID, private tender folders, dashboard export aur clear alerts milte hain.",
    dashboardPreview: "Dashboard preview",
    previewTitle: "Login ke baad customer ko kya dikhega",
    previewText:
      "Tender count, due date, order follow-up, document folders, risk alerts aur growth recommendations bina training ke samajh aate hain.",
    dashboard: "Dashboard",
    tenders: "Tenders",
    orders: "Orders",
    folders: "Folders",
    analysis: "Analysis",
    alerts: "Alerts",
    team: "Team",
    payments: "Bhugtan",
    excel: "Excel download",
    csv: "CSV download",
    logout: "Logout",
    addTender: "Tender add karein",
    tenderNumber: "Tender number",
    tenderTitle: "Tender title",
    tenderPdf: "Tender PDF",
    addAndFolder: "Add karein aur folder banayein",
    dueList: "Due tender list",
    dueHelp: "Kaunsa tender jaldi due hai aur kis stage par action chahiye.",
    fullList: "Full list",
    searchTender: "Tender search",
    recordsVisible: "records visible",
    customerId: "Customer ID",
    ownerName: "Owner name",
    firmName: "Company / Firm name",
    mobile: "Mobile",
    email: "Email",
    createId: "Customer ID banayein",
    openDashboard: "Dashboard kholein",
    orderSummary: "Order summary",
    folderBase: "Base folder",
    files: "Files",
  },
} satisfies Record<Language, Record<string, unknown>>;

const publicPages: PublicPage[] = ["home", "features", "growth", "pricing", "resources"];

const dashboardIcons: Record<ViewKey, IconType> = {
  dashboard: LayoutDashboard,
  tenders: ClipboardList,
  orders: PackageCheck,
  folders: FolderOpen,
  analysis: BarChart3,
  alerts: Bell,
  team: UsersRound,
  payments: CreditCard,
};

const growthCards = [
  {
    metric: "72%",
    title: "Tender fit score",
    titleHi: "Tender fit score",
    text: "Best-fit opportunities are separated from risky bids before effort starts.",
    textHi: "Risky bids aur best-fit opportunities ko kaam shuru hone se pehle alag dikhaya jata hai.",
    icon: Gauge,
    tone: "text-blue-700",
  },
  {
    metric: "3.4 Cr",
    title: "Open pipeline",
    titleHi: "Open pipeline",
    text: "Expected value across working and upcoming tenders.",
    textHi: "Working aur upcoming tenders ki expected value.",
    icon: Target,
    tone: "text-emerald-700",
  },
  {
    metric: "4",
    title: "Risk alerts",
    titleHi: "Risk alerts",
    text: "EMD, BG, pre-bid and submission follow-up reminders.",
    textHi: "EMD, BG, pre-bid aur submission follow-up reminders.",
    icon: AlertCircle,
    tone: "text-red-700",
  },
  {
    metric: "18%",
    title: "Quote gap",
    titleHi: "Quote gap",
    text: "Difference between quoted value and known winning history.",
    textHi: "Quoted value aur winning history ke beech ka gap.",
    icon: Lightbulb,
    tone: "text-amber-700",
  },
];

const growthRecommendations = [
  {
    title: "Focus on municipal security tenders",
    titleHi: "Municipal security tenders par focus karein",
    text: "Your active order history and documents match upcoming CCTV and command-center tenders.",
    textHi: "Aapki order history aur documents upcoming CCTV aur command-center tenders se match karte hain.",
  },
  {
    title: "Reduce missed tender risk",
    titleHi: "Missed tender risk kam karein",
    text: "Move EMD readiness and turnover checks to the first day after tender discovery.",
    textHi: "Tender milte hi pehle din EMD readiness aur turnover check complete karein.",
  },
  {
    title: "Build a reusable compliance pack",
    titleHi: "Reusable compliance pack banayein",
    text: "GST, PAN, turnover, OEM, BG and past-work files should be folder-ready for every tender.",
    textHi: "GST, PAN, turnover, OEM, BG aur past-work files har tender folder me ready hone chahiye.",
  },
];

const alerts = [
  { title: "GEM/2026/B/44721", text: "Commercial value pending. Submission closes in 11 days.", level: "High" },
  { title: "BG-SBI-55201", text: "BG collected status is pending for Solar EPC order.", level: "Medium" },
  { title: "UPLC/SMART/2026/118", text: "Pre-bid query date is approaching. Assign owner today.", level: "Medium" },
  { title: "MJP/SCADA/2026/88", text: "Marked missed. Capture reason for future qualification filter.", level: "Low" },
];

const teamTasks = [
  { owner: "Owner", task: "Approve final commercial quote", status: "Today" },
  { owner: "Accounts", task: "Prepare EMD and BG documents", status: "Pending" },
  { owner: "Technical", task: "Check SoW compliance and deviations", status: "Working" },
  { owner: "Tender desk", task: "Upload final bid and save proof", status: "Next" },
];

const competitorRows = [
  { name: "Local Infra Systems", lastQuote: "INR 1.78 Cr", winRate: "34%", signal: "Usually underquotes service margin" },
  { name: "North City Tech", lastQuote: "INR 1.92 Cr", winRate: "28%", signal: "Strong on CCTV but slow on BG compliance" },
  { name: "Prime Secure", lastQuote: "INR 1.83 Cr", winRate: "41%", signal: "Good municipal references" },
];

const pricingPlans = [
  {
    id: "plan-starter",
    name: "Starter Desk",
    price: "INR 4,999/mo",
    rawPrice: "4999",
    text: "Small owners who need tender dates, folders, and basic order tracking.",
  },
  {
    id: "plan-growth",
    name: "Growth Desk",
    price: "INR 11,999/mo",
    rawPrice: "11999",
    text: "Teams that need alerts, quote analysis, task tracking, and monthly reports.",
  },
  {
    id: "plan-managed",
    name: "Managed Desk",
    price: "INR 29,999/mo",
    rawPrice: "29999",
    text: "Full tender operations with document preparation, follow-up, and result analysis.",
  },
];

const resources = [
  "Tender readiness checklist",
  "EMD and BG document tracker",
  "Pre-bid query template",
  "Order delivery and CRAC follow-up checklist",
  "Monthly win-loss review format",
];

// Mappings from snake_case database schema to camelCase front-end variables
function mapDbToTender(db: any): TenderRow & { id: string; custom_data: Record<string, any> } {
  return {
    id: db.id,
    serialNo: db.serial_no || 0,
    remarks: db.remarks || "",
    publishedDate: db.published_date || "",
    submissionEndDate: db.submission_end_date || "",
    preBidDate: db.pre_bid_date || "",
    preBidLocation: db.pre_bid_location || "",
    toBeApplied: db.to_be_applied || "Decide",
    notApplyingReason: db.not_applying_reason || "",
    applied: db.applied || "No",
    dueDays: db.due_days || 0,
    tenderNumber: db.tender_number || "",
    tenderTitle: db.tender_title || "",
    consignee: db.consignee || "",
    organisation: db.organisation || "",
    location: db.location || "",
    emdValue: db.emd_value || "",
    ra: db.ra || "No",
    tenderValue: db.tender_value || "",
    ourQuotedValue: db.our_quoted_value || "",
    result: db.result || "",
    winningValue: db.winning_value || "",
    tenderLink: db.tender_link || "",
    currentStatus: db.current_status || "Live",
    folderLink: db.folder_link || "",
    custom_data: db.custom_data || {},
  };
}

function mapTenderToDb(t: any) {
  return {
    serial_no: Number(t.serialNo),
    remarks: t.remarks || "",
    published_date: t.publishedDate || null,
    submission_end_date: t.submissionEndDate || null,
    pre_bid_date: t.preBidDate || null,
    pre_bid_location: t.preBidLocation || "",
    to_be_applied: t.toBeApplied || "Decide",
    not_applying_reason: t.notApplyingReason || "",
    applied: t.applied || "No",
    due_days: Number(t.dueDays) || 0,
    tender_number: t.tenderNumber || "",
    tender_title: t.tenderTitle || "",
    consignee: t.consignee || "",
    organisation: t.organisation || "",
    location: t.location || "",
    emd_value: t.emdValue || "",
    ra: t.ra || "No",
    tender_value: t.tenderValue || "",
    our_quoted_value: t.ourQuotedValue || "",
    result: t.result || "",
    winning_value: t.winningValue || "",
    tender_link: t.tenderLink || "",
    current_status: t.currentStatus || "Live",
    folder_link: t.folderLink || "",
    custom_data: t.custom_data || {},
  };
}

function mapDbToOrder(db: any): OrderRow & { id: string; custom_data: Record<string, any> } {
  return {
    id: db.id,
    serialNo: db.serial_no || 0,
    gemTenderReference: db.gem_tender_reference || "",
    techSpecsReference: db.tech_specs_reference || "",
    category: db.category || "",
    contractNo: db.contract_no || "",
    contractDate: db.contract_date || "",
    organisation: db.organisation || "",
    location: db.location || "",
    work: db.work || "",
    totalOrderValue: db.total_order_value || "",
    orderStatus: db.order_status || "",
    bgValue: db.bg_value || "",
    bgNumber: db.bg_number || "",
    bgIssueDate: db.bg_issue_date || "",
    timelineOfBg: db.timeline_of_bg || "",
    bgStatus: db.bg_status || "",
    collectedOrNot: db.collected_or_not || "",
    couriered: db.couriered || "",
    cracLink: db.crac_link || "",
    custom_data: db.custom_data || {},
  };
}

function mapOrderToDb(o: any) {
  return {
    serial_no: Number(o.serialNo),
    gem_tender_reference: o.gemTenderReference || "",
    tech_specs_reference: o.techSpecsReference || "",
    category: o.category || "",
    contract_no: o.contractNo || "",
    contract_date: o.contractDate || null,
    organisation: o.organisation || "",
    location: o.location || "",
    work: o.work || "",
    total_order_value: o.totalOrderValue || "",
    order_status: o.orderStatus || "",
    bg_value: o.bgValue || "",
    bg_number: o.bgNumber || "",
    bg_issue_date: o.bgIssueDate || null,
    timeline_of_bg: o.timelineOfBg || "",
    bg_status: o.bgStatus || "",
    collected_or_not: o.collectedOrNot || "",
    couriered: o.couriered || "",
    crac_link: o.cracLink || "",
    custom_data: o.custom_data || {},
  };
}

function c(language: Language) {
  return (copy[language] as unknown) as Record<string, string> & {
    nav: Record<PublicPage, string>;
  };
}


function makeCustomerId(name: string, businessName: string) {
  const source = `${businessName || name || "Customer"}`.replace(/[^a-zA-Z0-9]/g, "");
  const prefix = source.slice(0, 4).toUpperCase().padEnd(4, "X");
  const number = Math.floor(1000 + Math.random() * 9000);
  return `CUST-${prefix}-${number}`;
}

function safeFolderName(value: string) {
  return value.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toUpperCase();
}

function csvSafe(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function moneyToNumber(value: string) {
  const normalized = value.toLowerCase().replace(/inr|,|\s/g, "");
  const amount = Number.parseFloat(normalized.replace(/cr|lakh/g, ""));

  if (Number.isNaN(amount)) {
    return 0;
  }

  if (normalized.includes("cr")) {
    return amount * 10000000;
  }

  if (normalized.includes("lakh")) {
    return amount * 100000;
  }

  return amount;
}

function formatCurrencyShort(value: number) {
  if (value >= 10000000) {
    return `INR ${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `INR ${(value / 100000).toFixed(1)} L`;
  }

  return `INR ${Math.round(value).toLocaleString("en-IN")}`;
}

function getStatusTone(status: string) {
  if (status === "Filed" || status === "Won" || status === "Active" || status === "Done" || status === "approved") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "Working" || status === "Work in progress") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (status === "Upcoming" || status === "Material dispatch pending" || status === "Pending" || status === "pending") {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }

  if (status === "Missed" || status === "Lost" || status === "High" || status === "rejected") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-zinc-50 text-zinc-700 border-zinc-200";
}

function buildCsv<T extends Record<string, any>>(
  rows: T[],
  columns: ColumnConfig[]
) {
  const header = columns.map((column) => csvSafe(column.label)).join(",");
  const body = rows
    .map((row) => columns.map((column) => csvSafe(row[column.key] ?? row.custom_data?.[column.key] ?? "")).join(","))
    .join("\n");

  return [header, body].filter(Boolean).join("\n");
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function LanguageButton({
  language,
  onToggle,
}: {
  language: Language;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
      aria-label="Change language"
      title="Change language"
    >
      <Languages className="h-4 w-4" />
      {c(language).language}
    </button>
  );
}

function ThemeButton({
  theme,
  onToggle,
}: {
  theme: Theme;
  onToggle: () => void;
}) {
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="glass-button inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold"
      aria-label="Change theme"
      title="Change theme"
    >
      <Icon className="h-4 w-4" />
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}

function AuthDrawer({
  mode,
  language,
  theme,
  onClose,
  onModeChange,
  onSubmit,
}: {
  mode: AuthMode;
  language: Language;
  theme: Theme;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (profile: CustomerProfile, userId: string) => void;
}) {
  const t = c(language);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email");
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");

  async function saveCustomerProfile(profile: CustomerProfile, userId: string) {
    const { error } = await supabase.from("customers").upsert({
      id: userId,
      customer_id: profile.customerId,
      owner_name: profile.ownerName,
      business_name: profile.businessName,
      phone: profile.phone,
      email: profile.email,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("Customer profile was not saved.", error.message);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const ownerName = String(formData.get("ownerName") || demoCustomer.ownerName);
    const businessName = String(formData.get("businessName") || demoCustomer.businessName);
    const phone = String(formData.get("phone") || demoCustomer.phone).trim();
    const email = String(formData.get("email") || demoCustomer.email).trim();
    const password = String(formData.get("password") || "").trim();
    const otp = String(formData.get("otp") || "").trim();
    const customerId =
      mode === "signup"
        ? makeCustomerId(ownerName, businessName)
        : String(formData.get("customerId") || demoCustomer.customerId).trim();

    const profile = {
      customerId: customerId || demoCustomer.customerId,
      ownerName,
      businessName,
      phone,
      email,
    };

    try {
      let activeUserId = "";
      if (authMethod === "phone") {
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

        if (!otpSent) {
          const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
            options: {
              data: {
                business_name: businessName,
                customer_id: profile.customerId,
                owner_name: ownerName,
              },
            },
          });

          if (error) {
            throw error;
          }

          setOtpSent(true);
          setAuthMessage(
            language === "hi"
              ? "OTP bhej diya gaya hai. Code daal kar login complete karein."
              : "OTP sent. Enter the code to complete login."
          );
          return;
        }

        const { data, error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp,
          type: "sms",
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          activeUserId = data.user.id;
          await saveCustomerProfile(profile, data.user.id);
        }
      } else if (mode === "signup") {
        if (!password || password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              business_name: businessName,
              customer_id: profile.customerId,
              owner_name: ownerName,
              phone,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          activeUserId = data.user.id;
          await saveCustomerProfile(profile, data.user.id);
        }
      } else {
        if (!password) {
          throw new Error("Enter your password to login.");
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          activeUserId = data.user.id;
          // Sync existing profile values
          const { data: profileData } = await supabase.from("customers").select("*").eq("id", data.user.id).single();
          if (profileData) {
            profile.customerId = profileData.customer_id;
            profile.ownerName = profileData.owner_name;
            profile.businessName = profileData.business_name;
            profile.phone = profileData.phone;
            profile.email = profileData.email;
          } else {
            await saveCustomerProfile(profile, data.user.id);
          }
        }
      }

      onSubmit(profile, activeUserId);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-overlay" data-theme={theme}>
      <div
        className="auth-drawer glass-panel ml-auto flex h-full w-full max-w-md flex-col shadow-2xl animate-fade-up"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-zinc-500">Customer access</p>
            <h2 className="text-2xl font-semibold text-zinc-950">
              {mode === "signup" ? t.signup : t.login}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-zinc-200 p-2">
          <button
            type="button"
            onClick={() => onModeChange("login")}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold ${
              mode === "login" ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <LogIn className="h-4 w-4" />
            {t.login}
          </button>
          <button
            type="button"
            onClick={() => onModeChange("signup")}
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold ${
              mode === "signup" ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            {t.signup}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div className="grid grid-cols-2 rounded-md border border-zinc-200 bg-white/40 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("email");
                setOtpSent(false);
                setAuthError("");
                setAuthMessage("");
              }}
              className={`rounded-md px-3 py-2 text-xs font-semibold ${
                authMethod === "email" ? "bg-zinc-950 text-white" : "text-zinc-700"
              }`}
            >
              Email password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("phone");
                setOtpSent(false);
                setAuthError("");
                setAuthMessage("");
              }}
              className={`rounded-md px-3 py-2 text-xs font-semibold ${
                authMethod === "phone" ? "bg-zinc-950 text-white" : "text-zinc-700"
              }`}
            >
              Mobile OTP
            </button>
          </div>

          {mode === "login" ? (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-zinc-700">{t.customerId}</span>
              <input
                name="customerId"
                placeholder="CUST-2047"
                className="h-12 w-full rounded-md border border-zinc-300 px-3 text-zinc-950 outline-none focus:border-zinc-950"
              />
            </label>
          ) : null}

          <label className="space-y-2">
            <span className="text-sm font-semibold text-zinc-700">{t.ownerName}</span>
            <input
              name="ownerName"
              placeholder="Rajesh Kumar"
              className="h-12 w-full rounded-md border border-zinc-300 px-3 text-zinc-950 outline-none focus:border-zinc-950"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-zinc-700">{t.firmName}</span>
            <input
              name="businessName"
              placeholder="RK Engineering Works"
              className="h-12 w-full rounded-md border border-zinc-300 px-3 text-zinc-950 outline-none focus:border-zinc-950"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-zinc-700">{t.mobile}</span>
              <input
                name="phone"
                placeholder="9876543210"
                className="h-12 w-full rounded-md border border-zinc-300 px-3 text-zinc-950 outline-none focus:border-zinc-950"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-zinc-700">{t.email}</span>
              <input
                name="email"
                type="email"
                placeholder="owner@example.com"
                required={authMethod === "email"}
                className="h-12 w-full rounded-md border border-zinc-300 px-3 text-zinc-950 outline-none focus:border-zinc-950"
              />
            </label>
          </div>

          {authMethod === "email" ? (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-zinc-700">Password</span>
              <input
                name="password"
                type="password"
                minLength={mode === "signup" ? 6 : undefined}
                placeholder={mode === "signup" ? "Create 6+ character password" : "Enter password"}
                required
                className="h-12 w-full rounded-md border border-zinc-300 px-3 text-zinc-950 outline-none focus:border-zinc-950"
              />
            </label>
          ) : null}

          {authMethod === "phone" && otpSent ? (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-zinc-700">OTP code</span>
              <input
                name="otp"
                inputMode="numeric"
                placeholder="123456"
                required
                className="h-12 w-full rounded-md border border-zinc-300 px-3 text-zinc-950 outline-none focus:border-zinc-950"
              />
            </label>
          ) : null}

          {mode === "signup" ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
              {language === "hi"
                ? "Sign up ke baad unique Customer ID banegi. Isi ID se dashboard aur tender folders linked rahenge."
                : "A unique customer ID will be created. The dashboard and tender folders stay linked to that ID."}
            </div>
          ) : null}

          {authMessage ? (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-blue-800">
              {authMessage}
            </div>
          ) : null}

          {authError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {authError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-md bg-zinc-950 px-5 text-base font-semibold text-white hover:bg-zinc-800"
          >
            {mode === "signup" ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            {isSubmitting
              ? "Please wait..."
              : authMethod === "phone" && !otpSent
                ? "Send OTP"
                : mode === "signup"
                  ? t.createId
                  : t.openDashboard}
          </button>
        </form>
      </div>
    </div>
  );
}

function profileFromSupabaseUser(user: User): CustomerProfile {
  const metadata = user.user_metadata;
  const ownerName = String(metadata.owner_name || demoCustomer.ownerName);
  const businessName = String(metadata.business_name || demoCustomer.businessName);

  return {
    customerId: String(metadata.customer_id || makeCustomerId(ownerName, businessName)),
    ownerName,
    businessName,
    phone: user.phone || String(metadata.phone || demoCustomer.phone),
    email: user.email || String(metadata.email || demoCustomer.email),
  };
}

function PublicHome({
  language,
  theme,
  onLanguageToggle,
  onThemeToggle,
  onAuthOpen,
}: {
  language: Language;
  theme: Theme;
  onLanguageToggle: () => void;
  onThemeToggle: () => void;
  onAuthOpen: (mode: AuthMode) => void;
}) {
  const [page, setPage] = useState<PublicPage>("home");
  const t = c(language);

  return (
    <main className="ios-shell min-h-screen text-zinc-950" data-theme={theme}>
      <header className="glass-nav sticky top-0 z-20 px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <Sparkles className="h-4 w-4" />
                {t.brand}
              </p>
              <p className="text-xs text-zinc-500">{t.tagline}</p>
            </div>
            <div className="flex gap-2 lg:hidden">
              <ThemeButton theme={theme} onToggle={onThemeToggle} />
              <LanguageButton language={language} onToggle={onLanguageToggle} />
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto rounded-md border border-zinc-200 bg-zinc-50 p-1">
            {publicPages.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`h-10 whitespace-nowrap rounded-md px-3 text-sm font-semibold ${
                  page === item ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-white"
                }`}
              >
                {t.nav[item]}
              </button>
            ))}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden gap-2 lg:flex">
              <ThemeButton theme={theme} onToggle={onThemeToggle} />
              <LanguageButton language={language} onToggle={onLanguageToggle} />
            </div>
            <button
              type="button"
              onClick={() => onAuthOpen("login")}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
            >
              <LogIn className="h-4 w-4" />
              {t.login}
            </button>
            <button
              type="button"
              onClick={() => onAuthOpen("signup")}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <UserPlus className="h-4 w-4" />
              {t.signup}
            </button>
          </div>
        </div>
      </header>

      {page === "home" ? <PublicHomePage language={language} onAuthOpen={onAuthOpen} /> : null}
      {page === "features" ? <FeaturePage language={language} /> : null}
      {page === "growth" ? <GrowthPage language={language} onAuthOpen={onAuthOpen} /> : null}
      {page === "pricing" ? <PricingPage language={language} onAuthOpen={onAuthOpen} /> : null}
      {page === "resources" ? <ResourcesPage language={language} /> : null}
    </main>
  );
}

function PublicHomePage({
  language,
  onAuthOpen,
}: {
  language: Language;
  onAuthOpen: (mode: AuthMode) => void;
}) {
  const t = c(language);

  return (
    <>
      <section className="border-b border-zinc-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_380px]">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase text-blue-700">{t.heroLabel}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-zinc-950 sm:text-5xl">
              {t.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">{t.heroText}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onAuthOpen("signup")}
                className="inline-flex h-12 items-center gap-2 rounded-md bg-emerald-700 px-5 text-base font-semibold text-white hover:bg-emerald-800"
              >
                <UserPlus className="h-5 w-5" />
                {t.primaryCta}
              </button>
              <button
                type="button"
                onClick={() => onAuthOpen("login")}
                className="inline-flex h-12 items-center gap-2 rounded-md border border-zinc-300 bg-white px-5 text-base font-semibold text-zinc-900 hover:bg-zinc-100"
              >
                <LogIn className="h-5 w-5" />
                {t.secondaryCta}
              </button>
            </div>
          </div>

          <aside className="border-l-4 border-emerald-600 bg-emerald-50 p-5">
            <p className="text-sm font-semibold uppercase text-emerald-800">Access</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">{t.sideTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-700">{t.sideText}</p>
            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={() => onAuthOpen("login")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                <LogIn className="h-4 w-4" />
                {t.login}
              </button>
              <button
                type="button"
                onClick={() => onAuthOpen("signup")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-emerald-300 bg-white px-5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                <UserPlus className="h-4 w-4" />
                {t.signup}
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {serviceHighlights.map((item) => (
              <article key={item.title} className="rounded-lg border border-zinc-200 bg-white p-5">
                <CheckCircle2 className="h-6 w-6 text-emerald-700" />
                <h2 className="mt-4 text-lg font-semibold text-zinc-950">
                  {language === "hi" ? item.titleHi ?? item.title : item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {language === "hi" ? item.textHi ?? item.text : item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[340px_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-blue-700">{t.dashboardPreview}</p>
            <h2 className="mt-2 text-3xl font-semibold text-zinc-950">{t.previewTitle}</h2>
            <p className="mt-4 text-base leading-7 text-zinc-600">{t.previewText}</p>
          </div>
          <div className="overflow-hidden rounded-lg border border-zinc-200">
            <div className="grid gap-px bg-zinc-200 sm:grid-cols-4">
              {[
                ["Live tender", "1"],
                ["Upcoming", "1"],
                ["Filed", "1"],
                ["Missed", "1"],
              ].map(([label, value]) => (
                <div key={label} className="bg-white p-5">
                  <p className="text-sm text-zinc-500">{label}</p>
                  <p className="mt-2 text-3xl font-semibold text-zinc-950">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-zinc-50 p-5">
              <div className="grid gap-3 md:grid-cols-3">
                {["Tender add", "Excel download", "Growth analysis"].map((label) => (
                  <div key={label} className="rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeaturePage({ language }: { language: Language }) {
  const featureRows = [
    ["Tender discovery", "Tender number, PDF, due date, EMD and pre-bid tracking."],
    ["Execution workflow", "To apply, not apply, applied, filed and missed stages with remarks."],
    ["Document vault", "Separate folder for every tender with file links for the customer team."],
    ["Order operations", "Contract, BG, courier, CRAC and pending work in one panel."],
    ["Alerts", "Due date, EMD, BG, pre-bid and team reminder alerts."],
    ["Reports", "Excel and CSV download for owner, accounts and tender team."],
  ];

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-blue-700">Features</p>
          <h1 className="mt-2 text-4xl font-semibold text-zinc-950">
            {language === "hi" ? "Tender ka poora kaam ek jagah." : "Everything needed to run tender work in one place."}
          </h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600">
            {language === "hi"
              ? "Listing se lekar filing, order follow-up aur documents tak workflow simple rakha gaya hai."
              : "From discovery to filing, order follow-up, and documents, the workflow stays simple and visible."}
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featureRows.map(([title, text]) => (
            <article key={title} className="rounded-lg border border-zinc-200 bg-white p-5">
              <ShieldCheck className="h-6 w-6 text-emerald-700" />
              <h2 className="mt-4 text-lg font-semibold text-zinc-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GrowthPage({
  language,
  onAuthOpen,
}: {
  language: Language;
  onAuthOpen: (mode: AuthMode) => void;
}) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-700">Growth analysis</p>
            <h1 className="mt-2 text-4xl font-semibold text-zinc-950">
              {language === "hi" ? "Sirf tender list nahi, growth decision bhi." : "Not just a tender list, a growth decision desk."}
            </h1>
            <p className="mt-4 text-lg leading-8 text-zinc-600">
              {language === "hi"
                ? "Owner ko pata chale kaunsa tender apply karna hai, kaunsa avoid karna hai, aur kis kaam se win chance badhega."
                : "Owners can see which tender to pursue, which one to avoid, and which action improves win chances."}
            </p>
            <button
              type="button"
              onClick={() => onAuthOpen("signup")}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-md bg-emerald-700 px-5 text-base font-semibold text-white hover:bg-emerald-800"
            >
              <UserPlus className="h-5 w-5" />
              {language === "hi" ? "Growth dashboard shuru karein" : "Start growth dashboard"}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {growthCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-lg border border-zinc-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Icon className={`h-6 w-6 ${card.tone}`} />
                    <p className="text-3xl font-semibold text-zinc-950">{card.metric}</p>
                  </div>
                  <h2 className="mt-5 text-lg font-semibold text-zinc-950">
                    {language === "hi" ? card.titleHi : card.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {language === "hi" ? card.textHi : card.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingPage({
  language,
  onAuthOpen,
}: {
  language: Language;
  onAuthOpen: (mode: AuthMode) => void;
}) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-blue-700">Plans</p>
          <h1 className="mt-2 text-4xl font-semibold text-zinc-950">
            {language === "hi" ? "Customer size ke hisaab se simple plans." : "Simple plans by customer maturity."}
          </h1>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article key={plan.name} className="rounded-lg border border-zinc-200 bg-white p-5">
              <h2 className="text-xl font-semibold text-zinc-950">{plan.name}</h2>
              <p className="mt-3 text-3xl font-semibold text-emerald-700">{plan.price}</p>
              <p className="mt-4 text-sm leading-6 text-zinc-600">{plan.text}</p>
              <button
                type="button"
                onClick={() => onAuthOpen("signup")}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                {language === "hi" ? "Plan choose karein" : "Choose plan"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResourcesPage({ language }: { language: Language }) {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-blue-700">Resources</p>
          <h1 className="mt-2 text-4xl font-semibold text-zinc-950">
            {language === "hi" ? "Owner aur team ke liye ready formats." : "Ready formats for owners and tender teams."}
          </h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600">
            {language === "hi"
              ? "Ye formats dashboard ke document folders me attach kiye ja sakte hain."
              : "These formats can be attached inside dashboard document folders."}
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {resources.map((resource) => (
            <article key={resource} className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-5">
              <BookOpenCheck className="h-6 w-6 text-emerald-700" />
              <p className="font-semibold text-zinc-900">{resource}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function EditableCell({
  value,
  rowId,
  columnKey,
  columnType,
  options,
  onSave,
}: {
  value: string;
  rowId: string;
  columnKey: string;
  columnType?: ColumnConfig["type"];
  options?: string[];
  onSave: (rowId: string, colKey: string, newValue: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (val !== value) {
      void onSave(rowId, columnKey, val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      if (val !== value) {
        void onSave(rowId, columnKey, val);
      }
    }
  };

  if (isEditing) {
    if (columnType === "select" && options) {
      return (
        <select
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          className="editable-cell-input"
        >
          <option value="">-- select --</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={columnType === "date" ? "date" : "text"}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="editable-cell-input"
      />
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className="editable-cell"
      title="Double click to edit cell"
    >
      {value || <span className="text-zinc-400/60 italic text-xs">double-click</span>}
    </div>
  );
}

function ColumnManager({
  columns,
  onSave,
  onClose,
}: {
  columns: ColumnConfig[];
  onSave: (newCols: ColumnConfig[]) => Promise<void>;
  onClose: () => void;
}) {
  const [list, setList] = useState<ColumnConfig[]>([...columns]);

  function handleLabelChange(idx: number, newLabel: string) {
    setList((current) =>
      current.map((col, i) => (i === idx ? { ...col, label: newLabel } : col))
    );
  }

  function handleDelete(idx: number) {
    setList((current) => current.filter((_, i) => i !== idx));
  }

  function handleAdd() {
    const key = `custom_${Date.now()}`;
    setList((current) => [
      ...current,
      { key, label: "New Column", type: "text" },
    ]);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(list);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleFormSubmit}
        className="glass-panel flex flex-col max-h-[85vh] w-full max-w-md bg-white p-5 shadow-2xl animate-fade-up"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-700" />
            Manage Spreadsheet Columns
          </h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {list.map((col, idx) => {
            const isCustom = col.key.startsWith("custom_");
            return (
              <div key={col.key} className="flex items-center gap-2 bg-zinc-50/50 p-2 rounded-md border border-zinc-100">
                <div className="flex-1">
                  <p className="text-[10px] font-mono text-zinc-400 mb-0.5">{col.key}</p>
                  <input
                    value={col.label}
                    onChange={(e) => handleLabelChange(idx, e.target.value)}
                    required
                    className="h-9 w-full bg-white px-2 py-1 text-xs rounded border border-zinc-300"
                  />
                </div>
                {isCustom ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="text-red-600 hover:text-red-800 p-2 mt-4"
                    title="Delete Column"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="w-8" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center border-t border-zinc-200 pt-3 mt-4 gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-800 hover:bg-zinc-100"
          >
            <Plus className="h-4 w-4" />
            Add Custom Column
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-xs font-semibold text-white hover:bg-zinc-800"
            >
              Save Columns
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function DirectPaymentGate({
  customerId,
  userId,
  onSubmit,
}: {
  customerId: string;
  userId: string;
  onSubmit: (record: PaymentRecord) => void;
}) {
  const [selectedPlan, setSelectedPlan] = useState(pricingPlans[0]);
  const [txId, setTxId] = useState("");
  const [amount, setAmount] = useState(pricingPlans[0].rawPrice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAmount(selectedPlan.rawPrice);
  }, [selectedPlan]);

  async function handlePaymentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!txId.trim()) {
      setError("Please enter your transaction reference ID.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: insertErr } = await supabase
        .from("payments")
        .insert({
          customer_user_id: userId,
          plan_name: selectedPlan.name,
          amount: `INR ${Number(amount).toLocaleString("en-IN")}`,
          transaction_id: txId.trim(),
          payment_method: "Direct UPI/Bank",
          status: "pending",
        })
        .select()
        .single();

      if (insertErr) {
        throw insertErr;
      }

      if (data) {
        onSubmit(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit transaction details. Please check the transaction ID.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ios-shell min-h-screen text-zinc-950 flex flex-col p-4 md:p-8">
      <header className="max-w-4xl mx-auto w-full text-center border-b border-zinc-200 pb-5 mb-5">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-emerald-800">
          <Sparkles className="h-6 w-6" />
          Tender Saathi Subscription
        </h1>
        <p className="text-zinc-500 mt-2">
          Your Customer ID is <span className="font-mono font-bold text-zinc-800">{customerId}</span>. 
          Please select a plan and submit payment details to unlock your dashboard.
        </p>
      </header>

      <div className="payment-gate-container w-full max-w-4xl mx-auto bg-white/40 glass-panel p-5 rounded-xl">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900">1. Select your subscription desk</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {pricingPlans.map((plan) => {
              const isSelected = selectedPlan.id === plan.id;
              return (
                <article
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`plan-card rounded-lg border p-4 bg-white hover:bg-zinc-50 ${
                    isSelected ? "selected" : "border-zinc-200"
                  }`}
                >
                  <h4 className="font-bold text-zinc-950">{plan.name}</h4>
                  <p className="mt-2 text-xl font-semibold text-emerald-700">{plan.price}</p>
                  <p className="mt-2 text-xs text-zinc-500 leading-normal">{plan.text}</p>
                </article>
              );
            })}
          </div>

          <div className="border border-zinc-200 rounded-lg bg-zinc-50/50 p-4">
            <h4 className="font-bold text-zinc-900 flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-emerald-700" />
              2. Direct Payment Details
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-500">Pay via UPI</p>
                <div className="bg-white border border-zinc-200 rounded p-3 font-mono text-sm break-all">
                  UPI ID: <span className="font-bold text-zinc-950">tendersaathi@sbi</span>
                </div>
                <div className="payment-qr-container mt-2">
                  {/* Styled SVG UPI QR code mockup */}
                  <svg className="w-28 h-28 text-zinc-800" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" rx="6" fill="#f4f4f5" />
                    <rect x="10" y="10" width="24" height="24" stroke="currentColor" strokeWidth="4" fill="none" />
                    <rect x="16" y="16" width="12" height="12" fill="currentColor" />
                    <rect x="66" y="10" width="24" height="24" stroke="currentColor" strokeWidth="4" fill="none" />
                    <rect x="72" y="16" width="12" height="12" fill="currentColor" />
                    <rect x="10" y="66" width="24" height="24" stroke="currentColor" strokeWidth="4" fill="none" />
                    <rect x="16" y="72" width="12" height="12" fill="currentColor" />
                    {/* Mock patterns */}
                    <rect x="42" y="10" width="8" height="24" fill="currentColor" />
                    <rect x="42" y="42" width="16" height="16" fill="currentColor" />
                    <rect x="66" y="42" width="8" height="16" fill="currentColor" />
                    <rect x="10" y="42" width="24" height="8" fill="currentColor" />
                    <rect x="66" y="66" width="24" height="8" fill="currentColor" />
                    <rect x="74" y="74" width="16" height="16" fill="currentColor" />
                  </svg>
                  <p className="text-[10px] text-zinc-400 mt-2 text-center">Scan to pay with any UPI App</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-500">Pay via Bank Transfer</p>
                <div className="bg-white border border-zinc-200 rounded p-3 space-y-1.5 text-xs">
                  <p>Bank: <span className="font-semibold text-zinc-800">State Bank of India (SBI)</span></p>
                  <p>Account Name: <span className="font-semibold text-zinc-800">Tender Saathi Solutions</span></p>
                  <p>Account No: <span className="font-semibold text-zinc-800">40291048293</span></p>
                  <p>IFSC Code: <span className="font-semibold text-zinc-800">SBIN0001234</span></p>
                  <p>Account Type: <span className="font-semibold text-zinc-800">Current</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4 mt-4 md:mt-0">
          <h3 className="text-lg font-bold text-zinc-900">3. Submit Payment Reference</h3>
          <div className="space-y-3">
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-zinc-700">Desk Plan</span>
              <input value={selectedPlan.name} disabled className="h-10 w-full rounded border px-3 bg-zinc-100 text-zinc-500" />
            </label>
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-zinc-700">Amount Paid (INR)</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="h-10 w-full rounded border px-3 text-zinc-950"
              />
            </label>
            <label className="space-y-1.5 block">
              <span className="text-xs font-semibold text-zinc-700">Transaction ID / UPI Reference No.</span>
              <input
                placeholder="UPI Ref (e.g. 618902849203)"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                required
                className="h-10 w-full rounded border px-3 text-zinc-950 font-mono"
              />
            </label>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            {loading ? "Submitting..." : "Submit Payment Record"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Dashboard({
  customer,
  userId,
  language,
  theme,
  onLanguageToggle,
  onThemeToggle,
  onLogout,
  paymentStatus,
  latestPayment,
}: {
  customer: CustomerProfile;
  userId: string;
  language: Language;
  theme: Theme;
  onLanguageToggle: () => void;
  onThemeToggle: () => void;
  onLogout: () => void;
  paymentStatus: "pending" | "active";
  latestPayment: PaymentRecord | null;
}) {
  const [activeView, setActiveView] = useState<ViewKey>("dashboard");
  const [tenders, setTenders] = useState<TenderRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [tenderColumns, setTenderColumns] = useState<ColumnConfig[]>([]);
  const [orderColumns, setOrderColumns] = useState<ColumnConfig[]>([]);

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [columnManagerConfig, setColumnManagerConfig] = useState<{ active: boolean; type: "tenders" | "orders" }>({
    active: false,
    type: "tenders",
  });

  const stats = useMemo(() => calculateDashboardStats(tenders), [tenders]);
  const t = c(language);

  // Fetch from Supabase
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Columns configuration
      const { data: customerData } = await supabase
        .from("customers")
        .select("tender_columns, order_columns")
        .eq("id", userId)
        .single();

      let activeTCols = defaultTenderColumns;
      let activeOCols = defaultOrderColumns;

      if (customerData) {
        if (customerData.tender_columns) {
          activeTCols = customerData.tender_columns as ColumnConfig[];
        } else {
          await supabase.from("customers").update({ tender_columns: defaultTenderColumns }).eq("id", userId);
        }

        if (customerData.order_columns) {
          activeOCols = customerData.order_columns as ColumnConfig[];
        } else {
          await supabase.from("customers").update({ order_columns: defaultOrderColumns }).eq("id", userId);
        }
      }
      setTenderColumns(activeTCols);
      setOrderColumns(activeOCols);

      // 2. Fetch Tenders
      let { data: dbTenders } = await supabase
        .from("tenders")
        .select("*")
        .eq("customer_user_id", userId)
        .order("serial_no", { ascending: true });

      if (!dbTenders || dbTenders.length === 0) {
        // Seed default tenders
        const seededTenders = initialTenders.map((item) => ({
          customer_user_id: userId,
          serial_no: item.serialNo,
          remarks: item.remarks,
          published_date: item.publishedDate,
          submission_end_date: item.submissionEndDate,
          pre_bid_date: item.preBidDate === "To update" ? null : item.preBidDate,
          pre_bid_location: item.preBidLocation,
          to_be_applied: item.toBeApplied,
          not_applying_reason: item.notApplyingReason,
          applied: item.applied,
          due_days: item.dueDays,
          tender_number: item.tenderNumber,
          tender_title: item.tenderTitle,
          consignee: item.consignee,
          organisation: item.organisation,
          location: item.location,
          emd_value: item.emdValue,
          ra: item.ra,
          tender_value: item.tenderValue,
          our_quoted_value: item.ourQuotedValue,
          result: item.result,
          winning_value: item.winningValue,
          tender_link: item.tenderLink,
          current_status: item.currentStatus,
          folder_link: item.folderLink,
          custom_data: {},
        }));
        const { data: inserted } = await supabase.from("tenders").insert(seededTenders).select();
        dbTenders = inserted || [];
      }
      setTenders(dbTenders.map(mapDbToTender));

      // 3. Fetch Orders
      let { data: dbOrders } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_user_id", userId)
        .order("serial_no", { ascending: true });

      if (!dbOrders || dbOrders.length === 0) {
        // Seed default orders
        const seededOrders = initialOrders.map((item) => ({
          customer_user_id: userId,
          serial_no: item.serialNo,
          gem_tender_reference: item.gemTenderReference,
          tech_specs_reference: item.techSpecsReference,
          category: item.category,
          contract_no: item.contractNo,
          contract_date: item.contractDate,
          organisation: item.organisation,
          location: item.location,
          work: item.work,
          total_order_value: item.totalOrderValue,
          order_status: item.orderStatus,
          bg_value: item.bgValue,
          bg_number: item.bgNumber,
          bg_issue_date: item.bgIssueDate,
          timeline_of_bg: item.timelineOfBg,
          bg_status: item.bgStatus,
          collected_or_not: item.collectedOrNot,
          couriered: item.couriered,
          crac_link: item.cracLink,
          custom_data: {},
        }));
        const { data: inserted } = await supabase.from("orders").insert(seededOrders).select();
        dbOrders = inserted || [];
      }
      setOrders(dbOrders.map(mapDbToOrder));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, [userId]);

  const visibleTenders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return tenders;
    }

    return tenders.filter((tender) =>
      [
        tender.tenderNumber,
        tender.tenderTitle,
        tender.organisation,
        tender.location,
        tender.currentStatus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query, tenders]);

  const pipelineValue = useMemo(() => {
    return tenders
      .filter((tender) => ["Live", "Upcoming", "Working"].includes(tender.currentStatus))
      .reduce((sum, tender) => sum + moneyToNumber(tender.tenderValue), 0);
  }, [tenders]);

  function downloadDashboardExcel() {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        tenders.map((tender) => {
          const row: Record<string, any> = {};
          tenderColumns.forEach((col) => {
            row[col.label] = tender[col.key as keyof TenderRow] ?? tender.custom_data?.[col.key] ?? "";
          });
          return row;
        })
      ),
      "Tenders"
    );
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(
        orders.map((order) => {
          const row: Record<string, any> = {};
          orderColumns.forEach((col) => {
            row[col.label] = order[col.key as keyof OrderRow] ?? order.custom_data?.[col.key] ?? "";
          });
          return row;
        })
      ),
      "Orders"
    );
    XLSX.writeFile(workbook, `${customer.customerId}-dashboard.xlsx`);
  }

  function downloadTenderCsv() {
    const csv = buildCsv(visibleTenders, tenderColumns);
    downloadFile(`${customer.customerId}-tenders.csv`, csv, "text/csv;charset=utf-8");
  }

  async function handleAddTender(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const pdf = formData.get("pdfFile") as File | null;
    const rawNumber = String(formData.get("tenderNumber") || "").trim();
    const tenderNumber = rawNumber || `TENDER-${Date.now().toString().slice(-6)}`;
    const uploadedName = pdf?.name ? pdf.name.replace(/\.[^.]+$/, "") : "";
    const title =
      String(formData.get("tenderTitle") || "").trim() ||
      uploadedName.replace(/[-_]+/g, " ") ||
      "New tender added by customer";
    const folderName = safeFolderName(tenderNumber);
    const nextSerial = Math.max(...tenders.map((tender) => tender.serialNo), 0) + 1;

    const newTender = {
      customer_user_id: userId,
      serial_no: nextSerial,
      remarks: pdf?.name ? `PDF uploaded: ${pdf.name}` : "Added from tender number",
      published_date: new Date().toISOString().slice(0, 10),
      submission_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      pre_bid_date: null,
      pre_bid_location: "To update",
      to_be_applied: "Decide",
      not_applying_reason: "-",
      applied: "No",
      due_days: 14,
      tender_number: tenderNumber,
      tender_title: title,
      consignee: "To update",
      organisation: "To update",
      location: "To update",
      emd_value: "To update",
      ra: "No",
      tender_value: "To update",
      our_quoted_value: "-",
      result: "Pending",
      winning_value: "-",
      tender_link: "#",
      current_status: "Live",
      folder_link: `/folders/${customer.customerId}/${folderName}`,
      custom_data: {},
    };

    const { data, error } = await supabase.from("tenders").insert(newTender).select().single();

    if (data) {
      setTenders((current) => [mapDbToTender(data), ...current]);
      setActiveView("tenders");
      form.reset();
    } else {
      console.error("Failed to add tender to DB:", error?.message);
    }
  }

  async function handleCellSave(rowId: string, colKey: string, newValue: string) {
    const isTender = activeView === "tenders" || activeView === "dashboard";
    const isCustom = colKey.startsWith("custom_");
    const table = isTender ? "tenders" : "orders";

    // Optimistically update front-end
    if (isTender) {
      setTenders((current) =>
        current.map((t) => {
          if (t.id === rowId) {
            if (isCustom) {
              return { ...t, custom_data: { ...t.custom_data, [colKey]: newValue } };
            } else {
              return { ...t, [colKey]: newValue };
            }
          }
          return t;
        })
      );
    } else {
      setOrders((current) =>
        current.map((o) => {
          if (o.id === rowId) {
            if (isCustom) {
              return { ...o, custom_data: { ...o.custom_data, [colKey]: newValue } };
            } else {
              return { ...o, [colKey]: newValue };
            }
          }
          return o;
        })
      );
    }

    // Prepare payload
    let updatePayload: Record<string, any> = {};
    if (isCustom) {
      const row = isTender
        ? tenders.find((t) => t.id === rowId)
        : orders.find((o) => o.id === rowId);
      const currentCustom = row?.custom_data || {};
      updatePayload = {
        custom_data: { ...currentCustom, [colKey]: newValue },
      };
    } else {
      // Map front-end camelCase keys back to snake_case schema keys
      const snakeKey = colKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      updatePayload = { [snakeKey]: newValue };
    }

    const { error } = await supabase.from(table).update(updatePayload).eq("id", rowId);

    if (error) {
      console.error("Error updating cell in DB:", error.message);
    }
  }

  async function handleColumnsSave(newCols: ColumnConfig[]) {
    const isTenders = columnManagerConfig.type === "tenders";
    const field = isTenders ? "tender_columns" : "order_columns";

    const { error } = await supabase
      .from("customers")
      .update({ [field]: newCols })
      .eq("id", userId);

    if (!error) {
      if (isTenders) {
        setTenderColumns(newCols);
      } else {
        setOrderColumns(newCols);
      }
      setColumnManagerConfig((curr) => ({ ...curr, active: false }));
    } else {
      console.error("Failed to save columns:", error.message);
    }
  }

  async function handleDeleteRow(rowId: string) {
    const isTender = activeView === "tenders" || activeView === "dashboard";
    const table = isTender ? "tenders" : "orders";

    // Optimistically update
    if (isTender) {
      setTenders((current) => current.filter((t) => t.id !== rowId));
    } else {
      setOrders((current) => current.filter((o) => o.id !== rowId));
    }

    const { error } = await supabase.from(table).delete().eq("id", rowId);
    if (error) {
      console.error("Failed to delete row:", error.message);
    }
  }

  async function handleAddBlankRow() {
    const isTender = activeView === "tenders" || activeView === "dashboard";
    if (isTender) {
      const nextSerial = Math.max(...tenders.map((tender) => tender.serialNo), 0) + 1;
      const newTender = {
        customer_user_id: userId,
        serial_no: nextSerial,
        remarks: "New empty row",
        toBeApplied: "Decide",
        applied: "No",
        due_days: 0,
        tender_number: `TND-${Date.now().toString().slice(-5)}`,
        tender_title: "Empty Tender",
        consignee: "-",
        organisation: "-",
        location: "-",
        emd_value: "-",
        ra: "No",
        tender_value: "INR 0.00",
        our_quoted_value: "-",
        result: "Pending",
        winning_value: "-",
        tender_link: "#",
        current_status: "Live",
        folder_link: `/folders/${customer.customerId}/TND-${Date.now().toString().slice(-5)}`,
        custom_data: {},
      };

      const { data, error } = await supabase.from("tenders").insert(newTender).select().single();
      if (data) {
        setTenders((current) => [...current, mapDbToTender(data)]);
      } else {
        console.error(error);
      }
    } else {
      const nextSerial = Math.max(...orders.map((order) => order.serialNo), 0) + 1;
      const newOrder = {
        customer_user_id: userId,
        serial_no: nextSerial,
        gem_tender_reference: "-",
        tech_specs_reference: "-",
        category: "-",
        contract_no: `CONTRACT-${Date.now().toString().slice(-5)}`,
        organisation: "-",
        location: "-",
        work: "Empty Order",
        total_order_value: "INR 0.00",
        order_status: "Pending",
        bg_value: "-",
        bg_number: "-",
        bg_status: "Pending",
        collected_or_not: "Pending",
        couriered: "No",
        crac_link: "#",
        custom_data: {},
      };

      const { data, error } = await supabase.from("orders").insert(newOrder).select().single();
      if (data) {
        setOrders((current) => [...current, mapDbToOrder(data)]);
      } else {
        console.error(error);
      }
    }
  }

  const viewItems: Array<{ key: ViewKey; label: string; icon: IconType }> = [
    { key: "dashboard", label: t.dashboard, icon: dashboardIcons.dashboard },
    { key: "tenders", label: t.tenders, icon: dashboardIcons.tenders },
    { key: "orders", label: t.orders, icon: dashboardIcons.orders },
    { key: "folders", label: t.folders, icon: dashboardIcons.folders },
    { key: "analysis", label: t.analysis, icon: dashboardIcons.analysis },
    { key: "alerts", label: t.alerts, icon: dashboardIcons.alerts },
    { key: "team", label: t.team, icon: dashboardIcons.team },
    { key: "payments", label: t.payments, icon: dashboardIcons.payments },
  ];

  return (
    <main className="ios-shell min-h-screen text-zinc-950" data-theme={theme}>
      {/* Verification Pending Banner */}
      {paymentStatus === "pending" && (
        <div className="bg-amber-600/90 text-white px-4 py-2 text-xs font-semibold text-center sticky top-0 z-30 shadow-md backdrop-blur-md">
          ⚠️ Payment Verification Pending: Your dashboard is active in preview mode. Our team is verifying your transaction ID:{" "}
          <span className="font-mono bg-zinc-950/20 px-1 py-0.5 rounded">{latestPayment?.transaction_id}</span>
        </div>
      )}

      <header className="glass-nav px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              type="button"
              onClick={() => setActiveView("dashboard")}
              className="inline-flex items-center gap-2 text-left text-sm font-semibold text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.brand}
            </button>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-950">{customer.businessName}</h1>
            <p className="text-sm text-zinc-500">
              {t.customerId}: <span className="font-mono text-zinc-800">{customer.customerId}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeButton theme={theme} onToggle={onThemeToggle} />
            <LanguageButton language={language} onToggle={onLanguageToggle} />
            <button
              type="button"
              onClick={downloadDashboardExcel}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              <Download className="h-4 w-4" />
              {t.excel}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
            >
              <LogOut className="h-4 w-4" />
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav className="grid gap-2 rounded-lg border border-zinc-200 bg-white p-2">
            {viewItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveView(item.key)}
                  className={`inline-flex h-12 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold ${
                    isActive ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-zinc-500">
              {/* Dynamic glass loading spinner */}
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-zinc-850" />
              Loading database...
            </div>
          ) : (
            <>
              {activeView === "dashboard" ? (
                <DashboardOverview
                  language={language}
                  stats={stats}
                  tenders={tenders}
                  orders={orders}
                  query={query}
                  pipelineValue={pipelineValue}
                  onQueryChange={setQuery}
                  onAddTender={handleAddTender}
                  onDownloadTenderCsv={downloadTenderCsv}
                  onOpenTenders={() => setActiveView("tenders")}
                  visibleTenders={visibleTenders}
                  tenderColumns={tenderColumns}
                  onCellSave={handleCellSave}
                  onDeleteRow={handleDeleteRow}
                  onAddRow={handleAddBlankRow}
                  onManageColumns={() => setColumnManagerConfig({ active: true, type: "tenders" })}
                />
              ) : null}

              {activeView === "tenders" ? (
                <TenderTable
                  language={language}
                  tenders={visibleTenders}
                  query={query}
                  onQueryChange={setQuery}
                  onDownloadTenderCsv={downloadTenderCsv}
                  tenderColumns={tenderColumns}
                  onCellSave={handleCellSave}
                  onDeleteRow={handleDeleteRow}
                  onAddRow={handleAddBlankRow}
                  onManageColumns={() => setColumnManagerConfig({ active: true, type: "tenders" })}
                />
              ) : null}

              {activeView === "orders" ? (
                <OrderTable
                  language={language}
                  orders={orders}
                  orderColumns={orderColumns}
                  onCellSave={handleCellSave}
                  onDeleteRow={handleDeleteRow}
                  onAddRow={handleAddBlankRow}
                  onManageColumns={() => setColumnManagerConfig({ active: true, type: "orders" })}
                />
              ) : null}

              {activeView === "folders" ? (
                <FolderGrid language={language} customer={customer} tenders={tenders} />
              ) : null}

              {activeView === "analysis" ? (
                <AnalysisView language={language} tenders={tenders} pipelineValue={pipelineValue} />
              ) : null}

              {activeView === "alerts" ? <AlertsView language={language} /> : null}

              {activeView === "team" ? <TeamView language={language} /> : null}

              {activeView === "payments" ? (
                <PaymentsView language={language} userId={userId} />
              ) : null}
            </>
          )}
        </section>
      </div>

      {columnManagerConfig.active && (
        <ColumnManager
          columns={columnManagerConfig.type === "tenders" ? tenderColumns : orderColumns}
          onClose={() => setColumnManagerConfig((c) => ({ ...c, active: false }))}
          onSave={handleColumnsSave}
        />
      )}
    </main>
  );
}

function DashboardOverview({
  language,
  stats,
  tenders,
  orders,
  query,
  visibleTenders,
  pipelineValue,
  onQueryChange,
  onAddTender,
  onDownloadTenderCsv,
  onOpenTenders,
  tenderColumns,
  onCellSave,
  onDeleteRow,
  onAddRow,
  onManageColumns,
}: {
  language: Language;
  stats: ReturnType<typeof calculateDashboardStats>;
  tenders: TenderRow[];
  orders: OrderRow[];
  query: string;
  visibleTenders: TenderRow[];
  pipelineValue: number;
  onQueryChange: (value: string) => void;
  onAddTender: (event: FormEvent<HTMLFormElement>) => void;
  onDownloadTenderCsv: () => void;
  onOpenTenders: () => void;
  tenderColumns: ColumnConfig[];
  onCellSave: (rowId: string, colKey: string, newValue: string) => Promise<void>;
  onDeleteRow: (rowId: string) => Promise<void>;
  onAddRow: () => Promise<void>;
  onManageColumns: () => void;
}) {
  const t = c(language);
  const dueSoon = tenders
    .filter((tender) => tender.dueDays >= 0)
    .sort((a, b) => a.dueDays - b.dueDays)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {[
          ["Live tender data", stats.live, BarChart3, "text-blue-700"],
          ["Upcoming tenders", stats.upcoming, CalendarClock, "text-amber-700"],
          ["Working tenders", stats.working, ClipboardList, "text-cyan-700"],
          ["Total filed", stats.filed, CheckCircle2, "text-emerald-700"],
          ["Missed tenders", stats.missed, AlertTriangle, "text-red-700"],
          ["Pipeline value", formatCurrencyShort(pipelineValue), Target, "text-indigo-700"],
        ].map(([label, value, Icon, tone]) => {
          const IconComponent = Icon as IconType;
          return (
            <article key={String(label)} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-600">{label as string}</p>
                <IconComponent className={`h-5 w-5 ${tone as string}`} />
              </div>
              <p className="mt-3 text-2xl font-semibold text-zinc-950">{String(value)}</p>
            </article>
          );
        })}

      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-950">{t.dueList}</h2>
              <p className="text-sm text-zinc-500">{t.dueHelp}</p>
            </div>
            <button
              type="button"
              onClick={onOpenTenders}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
            >
              <ClipboardList className="h-4 w-4" />
              {t.fullList}
            </button>
          </div>
          <div className="divide-y divide-zinc-200">
            {dueSoon.map((tender) => (
              <article key={tender.tenderNumber} className="grid gap-3 p-4 md:grid-cols-[1fr_120px_120px] md:items-center">
                <div>
                  <p className="font-semibold text-zinc-950">{tender.tenderTitle}</p>
                  <p className="mt-1 text-sm text-zinc-500">{tender.tenderNumber}</p>
                </div>
                <span className={`inline-flex w-fit rounded-md border px-3 py-1 text-sm font-semibold ${getStatusTone(tender.currentStatus)}`}>
                  {tender.currentStatus}
                </span>
                <p className="text-sm font-semibold text-zinc-900">
                  {tender.dueDays === 0 ? "Today" : `${tender.dueDays} days`}
                </p>
              </article>
            ))}
          </div>
        </section>

        <form onSubmit={onAddTender} className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <FilePlus2 className="h-5 w-5 text-emerald-700" />
            <h2 className="text-xl font-semibold text-zinc-950">{t.addTender}</h2>
          </div>
          <div className="mt-4 grid gap-3">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-zinc-700">{t.tenderNumber}</span>
              <input
                name="tenderNumber"
                placeholder="GEM/2026/B/00000"
                className="h-11 w-full rounded-md border border-zinc-300 px-3 text-zinc-950 outline-none focus:border-zinc-950"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-zinc-700">{t.tenderTitle}</span>
              <input
                name="tenderTitle"
                placeholder={language === "hi" ? "PDF title blank ho to yahan add karein" : "Add title if PDF is blank"}
                className="h-11 w-full rounded-md border border-zinc-300 px-3 text-zinc-950 outline-none focus:border-zinc-950"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-zinc-700">{t.tenderPdf}</span>
              <input
                name="pdfFile"
                type="file"
                accept=".pdf"
                className="w-full rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-3 text-sm text-zinc-700"
              />
            </label>
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <Upload className="h-4 w-4" />
            {t.addAndFolder}
          </button>
        </form>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">{t.searchTender}</h2>
            <p className="text-sm text-zinc-500">
              {visibleTenders.length} {t.recordsVisible}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onManageColumns}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
            >
              <Settings className="h-4 w-4 text-zinc-600" />
              Manage Columns
            </button>
            <button
              type="button"
              onClick={onDownloadTenderCsv}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
            >
              <Download className="h-4 w-4" />
              Tender CSV
            </button>
          </div>
        </div>
        <label className="mt-4 block h-11 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 flex">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={language === "hi" ? "Tender number, organisation, location ya status" : "Tender number, organisation, location or status"}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-800" />
            <h2 className="text-xl font-semibold text-zinc-950">Active Tender Spreadsheet</h2>
          </div>
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-4 text-xs font-semibold text-white hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" />
            Add Blank Row
          </button>
        </div>
        <DataTable rows={visibleTenders} columns={tenderColumns} onCellSave={onCellSave} onDeleteRow={onDeleteRow} />
      </section>
    </div>
  );
}

function TenderTable({
  language,
  tenders,
  query,
  onQueryChange,
  onDownloadTenderCsv,
  tenderColumns,
  onCellSave,
  onDeleteRow,
  onAddRow,
  onManageColumns,
}: {
  language: Language;
  tenders: TenderRow[];
  query: string;
  onQueryChange: (value: string) => void;
  onDownloadTenderCsv: () => void;
  tenderColumns: ColumnConfig[];
  onCellSave: (rowId: string, colKey: string, newValue: string) => Promise<void>;
  onDeleteRow: (rowId: string) => Promise<void>;
  onAddRow: () => Promise<void>;
  onManageColumns: () => void;
}) {
  const t = c(language);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-950">{t.tenders}</h2>
          <p className="text-sm text-zinc-500">
            {language === "hi" ? "Customer-wise tender tracker" : "Customer-wise tender tracker"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onManageColumns}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
          >
            <Settings className="h-4 w-4 text-zinc-650" />
            Manage Columns
          </button>
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white hover:bg-zinc-850"
          >
            <Plus className="h-4 w-4" />
            Add Row
          </button>
          <button
            type="button"
            onClick={onDownloadTenderCsv}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            <Download className="h-4 w-4" />
            {t.csv}
          </button>
        </div>
      </div>
      <div className="border-b border-zinc-200 p-4">
        <label className="flex h-11 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3">
          <Search className="h-4 w-4 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t.searchTender}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </label>
      </div>
      <DataTable rows={tenders} columns={tenderColumns} onCellSave={onCellSave} onDeleteRow={onDeleteRow} />
    </section>
  );
}

function OrderTable({
  language,
  orders,
  orderColumns,
  onCellSave,
  onDeleteRow,
  onAddRow,
  onManageColumns,
}: {
  language: Language;
  orders: OrderRow[];
  orderColumns: ColumnConfig[];
  onCellSave: (rowId: string, colKey: string, newValue: string) => Promise<void>;
  onDeleteRow: (rowId: string) => Promise<void>;
  onAddRow: () => Promise<void>;
  onManageColumns: () => void;
}) {
  const t = c(language);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-950">{t.orders}</h2>
          <p className="text-sm text-zinc-500">Order, BG, courier aur CRAC status</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onManageColumns}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
          >
            <Settings className="h-4 w-4 text-zinc-650" />
            Manage Columns
          </button>
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white hover:bg-zinc-850"
          >
            <Plus className="h-4 w-4" />
            Add Row
          </button>
        </div>
      </div>
      <DataTable rows={orders} columns={orderColumns} onCellSave={onCellSave} onDeleteRow={onDeleteRow} />
    </section>
  );
}

function AnalysisView({
  language,
  tenders,
  pipelineValue,
}: {
  language: Language;
  tenders: TenderRow[];
  pipelineValue: number;
}) {
  const winReady = tenders.filter((tender) => tender.currentStatus === "Working" || tender.currentStatus === "Filed").length;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-700" />
          <h2 className="text-2xl font-semibold text-zinc-950">
            {language === "hi" ? "Growth analysis" : "Growth analysis"}
          </h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <MetricTile title="Pipeline value" value={formatCurrencyShort(pipelineValue)} />
          <MetricTile title="Win-ready tenders" value={String(winReady)} />
          <MetricTile title="Average fit score" value="72%" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h3 className="text-xl font-semibold text-zinc-950">
            {language === "hi" ? "Recommended actions" : "Recommended actions"}
          </h3>
          <div className="mt-4 space-y-3">
            {growthRecommendations.map((item) => (
              <article key={item.title} className="rounded-lg border border-zinc-200 p-4">
                <p className="font-semibold text-zinc-950">{language === "hi" ? item.titleHi : item.title}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-600">{language === "hi" ? item.textHi : item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <h3 className="text-xl font-semibold text-zinc-950">
            {language === "hi" ? "Competitor quote signals" : "Competitor quote signals"}
          </h3>
          <div className="mt-4 divide-y divide-zinc-200">
            {competitorRows.map((row) => (
              <article key={row.name} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-950">{row.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{row.signal}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-zinc-950">{row.lastQuote}</p>
                    <p className="text-zinc-500">{row.winRate} win</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AlertsView({ language }: { language: Language }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-amber-700" />
          <h2 className="text-2xl font-semibold text-zinc-950">
            {language === "hi" ? "Smart alerts" : "Smart alerts"}
          </h2>
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          {language === "hi"
            ? "Due date, BG, EMD aur team reminders ek jagah."
            : "Due date, BG, EMD, and team reminders in one place."}
        </p>
      </div>
      <div className="divide-y divide-zinc-200">
        {alerts.map((alert) => (
          <article key={alert.title} className="grid gap-3 p-5 md:grid-cols-[1fr_120px] md:items-center">
            <div>
              <p className="font-semibold text-zinc-950">{alert.title}</p>
              <p className="mt-1 text-sm text-zinc-600">{alert.text}</p>
            </div>
            <span className={`w-fit rounded-md border px-3 py-1 text-sm font-semibold ${getStatusTone(alert.level)}`}>
              {alert.level}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function TeamView({ language }: { language: Language }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex items-center gap-2">
          <UsersRound className="h-6 w-6 text-blue-700" />
          <h2 className="text-2xl font-semibold text-zinc-950">
            {language === "hi" ? "Team work board" : "Team work board"}
          </h2>
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          {language === "hi"
            ? "Owner, accounts, technical aur tender desk ka kaam visible rahega."
            : "Owner, accounts, technical, and tender desk work stays visible."}
        </p>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2">
        {teamTasks.map((task) => (
          <article key={task.task} className="rounded-lg border border-zinc-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-zinc-500">{task.owner}</p>
                <p className="mt-1 font-semibold text-zinc-950">{task.task}</p>
              </div>
              <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${getStatusTone(task.status)}`}>
                {task.status}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PaymentsView({ language, userId }: { language: Language; userId: string }) {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("customer_user_id", userId)
      .order("created_at", { ascending: false });
    if (data) {
      setPayments(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadPayments();
  }, [userId]);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
        <CreditCard className="h-6 w-6 text-emerald-800" />
        <h2 className="text-2xl font-semibold text-zinc-950">Payment History</h2>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading payments...</p>
      ) : payments.length === 0 ? (
        <p className="text-sm text-zinc-500">No payment history recorded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-zinc-200">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-2 text-xs font-bold text-zinc-500">Plan Desk</th>
                <th className="px-4 py-2 text-xs font-bold text-zinc-500">Amount</th>
                <th className="px-4 py-2 text-xs font-bold text-zinc-500">Transaction ID</th>
                <th className="px-4 py-2 text-xs font-bold text-zinc-500">Status</th>
                <th className="px-4 py-2 text-xs font-bold text-zinc-500">Submitted Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 bg-white">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-3 font-semibold text-zinc-900">{p.plan_name}</td>
                  <td className="px-4 py-3 font-medium text-emerald-700">{p.amount}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-800">{p.transaction_id}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md border ${getStatusTone(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function MetricTile({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-sm font-semibold text-zinc-600">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-950">{value}</p>
    </article>
  );
}

function DataTable<T extends Record<string, any>>({
  rows,
  columns,
  onCellSave,
  onDeleteRow,
}: {
  rows: T[];
  columns: ColumnConfig[];
  onCellSave: (rowId: string, colKey: string, newValue: string) => Promise<void>;
  onDeleteRow: (rowId: string) => Promise<void>;
}) {
  return (
    <div className="overflow-x-auto w-full">
      <table className="divide-y divide-zinc-200 text-left text-sm" style={{ minWidth: `${120 + columns.length * 150}px` }}>
        <thead className="bg-zinc-100">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-3 font-semibold text-zinc-700">
                {column.label}
              </th>
            ))}
            <th className="px-3 py-3 font-semibold text-zinc-700 w-24">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 bg-white">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-zinc-50/50">
              {columns.map((column) => {
                const cellValue = String(row[column.key as keyof T] ?? row.custom_data?.[column.key] ?? "");
                const isLink =
                  column.key === "folderLink" ||
                  column.key === "tenderLink" ||
                  column.key === "contractNo" ||
                  column.key === "bgNumber" ||
                  column.key === "cracLink";

                return (
                  <td key={column.key} className="max-w-[260px] px-3 py-3 align-top text-zinc-700">
                    {isLink ? (
                      <a href={cellValue} className="font-semibold text-blue-700 underline underline-offset-4 break-all">
                        {cellValue || "link"}
                      </a>
                    ) : (
                      <EditableCell
                        value={cellValue}
                        rowId={row.id}
                        columnKey={column.key}
                        columnType={column.type}
                        options={column.options}
                        onSave={onCellSave}
                      />
                    )}
                  </td>
                );
              })}
              <td className="px-3 py-3 align-middle">
                <button
                  type="button"
                  onClick={() => void onDeleteRow(row.id)}
                  className="text-red-600 hover:text-red-800 font-semibold inline-flex items-center gap-1 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FolderGrid({
  language,
  customer,
  tenders,
}: {
  language: Language;
  customer: CustomerProfile;
  tenders: TenderRow[];
}) {
  const t = c(language);

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-amber-700" />
          <h2 className="text-2xl font-semibold text-zinc-950">{t.folders}</h2>
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          {t.folderBase}: /folders/{customer.customerId}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tenders.map((tender) => (
          <article key={tender.tenderNumber} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <FolderOpen className="h-6 w-6 shrink-0 text-amber-700" />
              <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${getStatusTone(tender.currentStatus)}`}>
                {tender.currentStatus}
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-zinc-950">{tender.tenderTitle}</h3>
            <p className="mt-2 font-mono text-xs text-zinc-500">{tender.tenderNumber}</p>
            <a href={tender.folderLink} className="mt-4 inline-flex min-h-10 items-center gap-2 break-all rounded-md border border-zinc-300 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              <FolderOpen className="h-4 w-4 shrink-0" />
              {tender.folderLink}
            </a>
            <div className="mt-4 rounded-md bg-zinc-50 p-3 text-sm text-zinc-600">
              {t.files}: Tender PDF, EMD proof, BOQ, submitted bid, clarifications
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CustomerPortal() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");

  // Payment configuration state
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "unpaid" | "pending" | "active" | "rejected">("loading");
  const [latestPayment, setLatestPayment] = useState<PaymentRecord | null>(null);

  async function checkPaymentStatus(uid: string) {
    setPaymentStatus("loading");
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("customer_user_id", uid)
      .order("created_at", { ascending: false });

    // Bypass payment gate for testing/local development to allow full dashboard access
    setPaymentStatus("active");
    if (data && data.length > 0) {
      setLatestPayment(data[0] as PaymentRecord);
    }
  }


  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted && data.user) {
        setUserId(data.user.id);
        setCustomer(profileFromSupabaseUser(data.user));
        void checkPaymentStatus(data.user.id);
      } else if (isMounted) {
        setPaymentStatus("unpaid");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setCustomer(profileFromSupabaseUser(session.user));
        void checkPaymentStatus(session.user.id);
      } else {
        setUserId(null);
        setCustomer(null);
        setPaymentStatus("unpaid");
        setLatestPayment(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  function toggleLanguage() {
    setLanguage((current) => (current === "en" ? "hi" : "en"));
  }

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  function handlePaymentSuccess(record: PaymentRecord) {
    setLatestPayment(record);
    setPaymentStatus(record.status === "approved" ? "active" : record.status);
  }

  return (
    <>
      <InteractiveBackground theme={theme} />

      {customer && userId ? (
        paymentStatus === "loading" ? (
          <div className="flex h-screen flex-col items-center justify-center gap-2 text-zinc-500 bg-zinc-50/10 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-zinc-300 border-t-zinc-800" />
            Verifying subscription desk status...
          </div>
        ) : paymentStatus === "unpaid" || paymentStatus === "rejected" ? (
          <DirectPaymentGate
            customerId={customer.customerId}
            userId={userId}
            onSubmit={handlePaymentSuccess}
          />
        ) : (
          <Dashboard
            customer={customer}
            userId={userId}
            language={language}
            theme={theme}
            onLanguageToggle={toggleLanguage}
            onThemeToggle={toggleTheme}
            onLogout={() => {
              void supabase.auth.signOut();
              setCustomer(null);
              setUserId(null);
            }}
            paymentStatus={paymentStatus}
            latestPayment={latestPayment}
          />
        )
      ) : (
        <PublicHome
          language={language}
          theme={theme}
          onLanguageToggle={toggleLanguage}
          onThemeToggle={toggleTheme}
          onAuthOpen={openAuth}
        />
      )}

      {authOpen ? (
        <AuthDrawer
          mode={authMode}
          language={language}
          theme={theme}
          onClose={() => setAuthOpen(false)}
          onModeChange={setAuthMode}
          onSubmit={(profile, uid) => {
            setUserId(uid);
            setCustomer(profile);
            setAuthOpen(false);
            void checkPaymentStatus(uid);
          }}
        />
      ) : null}
    </>
  );
}
