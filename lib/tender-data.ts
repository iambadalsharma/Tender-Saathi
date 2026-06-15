export type CustomerProfile = {
  customerId: string;
  ownerName: string;
  businessName: string;
  phone: string;
  email: string;
};

export type TenderRow = {
  id?: string;
  custom_data?: Record<string, any>;
  serialNo: number;
  remarks: string;
  publishedDate: string;
  submissionEndDate: string;
  preBidDate: string;
  preBidLocation: string;
  toBeApplied: "Yes" | "No" | "Decide";
  notApplyingReason: string;
  applied: "Yes" | "No";
  dueDays: number;
  tenderNumber: string;
  tenderTitle: string;
  consignee: string;
  organisation: string;
  location: string;
  emdValue: string;
  ra: "Yes" | "No";
  tenderValue: string;
  ourQuotedValue: string;
  result: string;
  winningValue: string;
  tenderLink: string;
  currentStatus: "Live" | "Upcoming" | "Working" | "Filed" | "Missed" | "Won" | "Lost";
  folderLink: string;
};

export type OrderRow = {
  id?: string;
  custom_data?: Record<string, any>;
  serialNo: number;
  gemTenderReference: string;
  techSpecsReference: string;
  category: string;
  contractNo: string;
  contractDate: string;
  organisation: string;
  location: string;
  work: string;
  totalOrderValue: string;
  orderStatus: string;
  bgValue: string;
  bgNumber: string;
  bgIssueDate: string;
  timelineOfBg: string;
  bgStatus: string;
  collectedOrNot: string;
  couriered: string;
  cracLink: string;
};


export const tenderColumns: Array<{ key: keyof TenderRow; label: string }> = [
  { key: "serialNo", label: "S. No" },
  { key: "remarks", label: "Remarks (Update regularly)" },
  { key: "publishedDate", label: "Published Date" },
  { key: "submissionEndDate", label: "Submission End Date" },
  { key: "preBidDate", label: "Pre-Bid Date" },
  { key: "preBidLocation", label: "Pre-Bid Location" },
  { key: "toBeApplied", label: "To be applied?" },
  { key: "notApplyingReason", label: "Reasons for Not Applying" },
  { key: "applied", label: "Applied?" },
  { key: "dueDays", label: "Due Days" },
  { key: "tenderNumber", label: "Tender Number" },
  { key: "tenderTitle", label: "Tender Title" },
  { key: "consignee", label: "Consignee / Beneficiary" },
  { key: "organisation", label: "Organisation" },
  { key: "location", label: "Location" },
  { key: "emdValue", label: "EMD Value" },
  { key: "ra", label: "RA (Yes/No)" },
  { key: "tenderValue", label: "Tender Value" },
  { key: "ourQuotedValue", label: "Our Quoted Value" },
  { key: "result", label: "Result" },
  { key: "winningValue", label: "Winning Value" },
  { key: "tenderLink", label: "List of Tenders (Link)" },
  { key: "currentStatus", label: "Current Status" },
  { key: "folderLink", label: "Tender Folder" },
];

export const orderColumns: Array<{ key: keyof OrderRow; label: string }> = [
  { key: "serialNo", label: "S No." },
  { key: "gemTenderReference", label: "GeM Tender Reference" },
  { key: "techSpecsReference", label: "Tech Specs / SoW Reference" },
  { key: "category", label: "Category" },
  { key: "contractNo", label: "Contract No (Hyperlink)" },
  { key: "contractDate", label: "Contract Date" },
  { key: "organisation", label: "Organisation" },
  { key: "location", label: "Location" },
  { key: "work", label: "Work" },
  { key: "totalOrderValue", label: "Total Order Value" },
  { key: "orderStatus", label: "Order Status" },
  { key: "bgValue", label: "BG Value" },
  { key: "bgNumber", label: "BG Number (link)" },
  { key: "bgIssueDate", label: "BG Issue date" },
  { key: "timelineOfBg", label: "Timeline of BG" },
  { key: "bgStatus", label: "BG Status" },
  { key: "collectedOrNot", label: "Collected or Not" },
  { key: "couriered", label: "Courriered" },
  { key: "cracLink", label: "CRAC Link" },
];

export const demoCustomer: CustomerProfile = {
  customerId: "CUST-2047",
  ownerName: "Rajesh Kumar",
  businessName: "RK Engineering Works",
  phone: "9876543210",
  email: "owner@example.com",
};

export const serviceHighlights: Array<{
  title: string;
  text: string;
  titleHi?: string;
  textHi?: string;
}> = [
  {
    title: "Tender filing support",
    text: "Tender number, due date, EMD, pre-bid, quoted value aur status ek jagah manage hota hai.",
  },
  {
    title: "Order follow-up",
    text: "Contract, BG, courier, CRAC aur pending work ka clear record team ke saamne rehta hai.",
  },
  {
    title: "Folder system",
    text: "Har tender ka alag folder hota hai jahan documents, PDFs aur generated files ke links milte hain.",
  },
  {
    title: "Owner-friendly dashboard",
    text: "Simple Hindi-English labels, bade buttons aur due-day alerts se owner ko turant samajh aata hai.",
  },
];


export const initialTenders: TenderRow[] = [
  {
    serialNo: 1,
    remarks: "Technical documents ready, finance approval pending",
    publishedDate: "2026-06-10",
    submissionEndDate: "2026-06-24",
    preBidDate: "2026-06-15",
    preBidLocation: "Online",
    toBeApplied: "Yes",
    notApplyingReason: "-",
    applied: "No",
    dueDays: 11,
    tenderNumber: "GEM/2026/B/44721",
    tenderTitle: "CCTV surveillance system with command center",
    consignee: "Municipal Corporation",
    organisation: "Municipal Corporation of Delhi",
    location: "Delhi",
    emdValue: "INR 2,10,000",
    ra: "Yes",
    tenderValue: "INR 2.10 Cr",
    ourQuotedValue: "Drafting",
    result: "Pending",
    winningValue: "-",
    tenderLink: "https://bidplus.gem.gov.in/all-bids",
    currentStatus: "Working",
    folderLink: "/folders/CUST-2047/GEM-2026-B-44721",
  },
  {
    serialNo: 2,
    remarks: "Submitted, waiting for technical evaluation",
    publishedDate: "2026-05-28",
    submissionEndDate: "2026-06-12",
    preBidDate: "2026-06-02",
    preBidLocation: "Raipur",
    toBeApplied: "Yes",
    notApplyingReason: "-",
    applied: "Yes",
    dueDays: -1,
    tenderNumber: "2026_CPPP_912566_1",
    tenderTitle: "Project monitoring dashboard for highway safety works",
    consignee: "National Highway Division",
    organisation: "Ministry of Road Transport and Highways",
    location: "Chhattisgarh",
    emdValue: "INR 4,80,000",
    ra: "No",
    tenderValue: "INR 4.80 Cr",
    ourQuotedValue: "INR 4.62 Cr",
    result: "Under evaluation",
    winningValue: "-",
    tenderLink: "https://eprocure.gov.in/eprocure/app",
    currentStatus: "Filed",
    folderLink: "/folders/CUST-2047/2026-CPPP-912566-1",
  },
  {
    serialNo: 3,
    remarks: "Pre-bid query to be prepared",
    publishedDate: "2026-06-13",
    submissionEndDate: "2026-07-05",
    preBidDate: "2026-06-20",
    preBidLocation: "Lucknow",
    toBeApplied: "Decide",
    notApplyingReason: "-",
    applied: "No",
    dueDays: 22,
    tenderNumber: "UPLC/SMART/2026/118",
    tenderTitle: "Smart traffic signal installation and maintenance",
    consignee: "Smart City Office",
    organisation: "Lucknow Smart City Limited",
    location: "Uttar Pradesh",
    emdValue: "INR 9,50,000",
    ra: "Yes",
    tenderValue: "INR 9.50 Cr",
    ourQuotedValue: "-",
    result: "Pending",
    winningValue: "-",
    tenderLink: "https://etender.up.nic.in",
    currentStatus: "Upcoming",
    folderLink: "/folders/CUST-2047/UPLC-SMART-2026-118",
  },
  {
    serialNo: 4,
    remarks: "Eligibility not matching turnover criteria",
    publishedDate: "2026-05-20",
    submissionEndDate: "2026-06-08",
    preBidDate: "2026-05-25",
    preBidLocation: "Mumbai",
    toBeApplied: "No",
    notApplyingReason: "Turnover criteria not matching",
    applied: "No",
    dueDays: -5,
    tenderNumber: "MJP/SCADA/2026/88",
    tenderTitle: "SCADA modernization for water grid",
    consignee: "Regional Water Board",
    organisation: "Maharashtra Jeevan Pradhikaran",
    location: "Maharashtra",
    emdValue: "INR 11,70,000",
    ra: "No",
    tenderValue: "INR 11.70 Cr",
    ourQuotedValue: "-",
    result: "Not applied",
    winningValue: "-",
    tenderLink: "https://mahatenders.gov.in",
    currentStatus: "Missed",
    folderLink: "/folders/CUST-2047/MJP-SCADA-2026-88",
  },
];

export const initialOrders: OrderRow[] = [
  {
    serialNo: 1,
    gemTenderReference: "GEM/2025/B/33981",
    techSpecsReference: "SoW-CCTV-DEL-14",
    category: "Security Systems",
    contractNo: "CONTRACT/2026/DEL/091",
    contractDate: "2026-04-18",
    organisation: "Municipal Corporation of Delhi",
    location: "Delhi",
    work: "Supply and installation of CCTV cameras",
    totalOrderValue: "INR 1.85 Cr",
    orderStatus: "Work in progress",
    bgValue: "INR 18,50,000",
    bgNumber: "BG-HDFC-77881",
    bgIssueDate: "2026-04-20",
    timelineOfBg: "Valid till 2027-04-19",
    bgStatus: "Active",
    collectedOrNot: "Collected",
    couriered: "Yes",
    cracLink: "https://gem.gov.in/crac/demo-091",
  },
  {
    serialNo: 2,
    gemTenderReference: "GEM/2025/B/42872",
    techSpecsReference: "SoW-SOLAR-TN-03",
    category: "Solar EPC",
    contractNo: "CONTRACT/2026/TN/044",
    contractDate: "2026-05-02",
    organisation: "Tamil Nadu Medical Services Corporation",
    location: "Chennai",
    work: "Solar rooftop installation",
    totalOrderValue: "INR 2.40 Cr",
    orderStatus: "Material dispatch pending",
    bgValue: "INR 24,00,000",
    bgNumber: "BG-SBI-55201",
    bgIssueDate: "2026-05-04",
    timelineOfBg: "Valid till 2027-05-03",
    bgStatus: "Active",
    collectedOrNot: "Pending",
    couriered: "No",
    cracLink: "https://gem.gov.in/crac/demo-044",
  },
];

export function calculateDashboardStats(tenders: TenderRow[]) {
  return {
    live: tenders.filter((tender) => tender.currentStatus === "Live").length,
    upcoming: tenders.filter((tender) => tender.currentStatus === "Upcoming").length,
    working: tenders.filter((tender) => tender.currentStatus === "Working").length,
    filed: tenders.filter((tender) => tender.currentStatus === "Filed").length,
    missed: tenders.filter((tender) => tender.currentStatus === "Missed").length,
  };
}
