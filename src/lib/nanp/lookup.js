import { GOVERNMENT, N11, NPAS, PERSONAL, PREMIUM, TOLL_FREE, } from "./npas.js";
const CARRIERS = [
    { name: "Verizon Wireless", ocn: "6392", line: "wireless" },
    { name: "AT&T Mobility", ocn: "6534", line: "wireless" },
    { name: "T-Mobile USA", ocn: "6664", line: "wireless" },
    { name: "US Cellular", ocn: "6500", line: "wireless" },
    { name: "Dish Wireless", ocn: "8829", line: "wireless" },
    { name: "Comcast Metro by T-Mobile", ocn: "9817", line: "wireless" },
    { name: "AT&T Corp", ocn: "9323", line: "wireline" },
    { name: "Verizon", ocn: "9212", line: "wireline" },
    { name: "Lumen (CenturyLink)", ocn: "3333", line: "wireline" },
    { name: "Frontier Communications", ocn: "4420", line: "wireline" },
    { name: "Bandwidth.com", ocn: "6529", line: "voip" },
    { name: "Twilio", ocn: "9814", line: "voip" },
    { name: "Inteliquent", ocn: "6180", line: "voip" },
    { name: "Telnyx", ocn: "073H", line: "voip" },
    { name: "Rogers Wireless", ocn: "8821", line: "wireless" },
    { name: "Bell Mobility", ocn: "6535", line: "wireless" },
    { name: "TELUS Mobility", ocn: "8300", line: "wireless" },
];
function hash32(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i += 1) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
export function digitsOnly(input) {
    const raw = input.replace(/[^\d+]/g, "");
    if (raw.startsWith("+1"))
        return raw.slice(2).replace(/\D/g, "");
    if (raw.startsWith("1") && raw.length === 11)
        return raw.slice(1);
    return raw.replace(/\D/g, "");
}
export function formatNational(digits) {
    if (digits.length !== 10)
        return digits;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
export function formatE164(digits) {
    if (digits.length !== 10)
        return digits;
    return `+1 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
function tzAbbr(tz, at) {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            timeZoneName: "short",
        }).formatToParts(at);
        return parts.find((p) => p.type === "timeZoneName")?.value ?? tz;
    }
    catch {
        return tz;
    }
}
function countryName(cc) {
    switch (cc) {
        case "US":
            return "United States";
        case "CA":
            return "Canada";
        case "PR":
            return "Puerto Rico";
        case "VI":
            return "U.S. Virgin Islands";
        case "GU":
            return "Guam";
        case "AS":
            return "American Samoa";
        case "MP":
            return "Northern Mariana Islands";
        default:
            return "";
    }
}
function lataFor(npa, region) {
    const known = {
        "212": "132",
        "646": "132",
        "917": "132",
        "332": "132",
        "718": "132",
        "347": "132",
        "929": "132",
        "415": "722",
        "628": "722",
        "312": "358",
        "773": "358",
        "872": "358",
        "310": "730",
        "424": "730",
        "213": "730",
        "323": "730",
        "402": "644",
        "531": "644",
        "206": "674",
        "404": "438",
        "416": "804",
        "647": "804",
        "437": "804",
        "305": "460",
        "786": "460",
    };
    if (known[npa])
        return known[npa];
    return String(200 + (hash32(region || npa) % 700));
}
function classify(npa, nxx, line) {
    if (N11.has(npa) || nxx === "555" && line.startsWith("01"))
        return "reserved";
    if (TOLL_FREE.has(npa))
        return "toll-free";
    if (PREMIUM.has(npa))
        return "premium";
    if (PERSONAL.has(npa))
        return "personal";
    if (GOVERNMENT.has(npa))
        return "government";
    if (!/^[2-9]\d{2}$/.test(npa))
        return "invalid";
    if (!/^[2-9]\d{2}$/.test(nxx))
        return "invalid";
    return "geographic";
}
/**
 * The pool-state model.
 *
 * IMPORTANT: this is not a lookup. Nothing here has contacted a carrier. The
 * state is a deterministic function of the digits, chosen so that the site
 * demonstrates the concepts in its guides and so a tracking slot has something
 * to re-evaluate. Real pool state lives behind the thousands-block code holder
 * and is not publicly available.
 *
 * Every detail string below therefore DESCRIBES THE MODEL. None of them assert
 * what a carrier has on file.
 */
function rollStatus(digits, numberClass) {
    if (numberClass === "invalid") {
        return {
            status: "invalid",
            label: "Not a subscriber number",
            detail: "This input is outside NANP subscriber numbering.",
            aging: null,
        };
    }
    if (numberClass === "reserved") {
        return {
            status: "reserved",
            label: "Reserved / media block",
            detail: "NXX 555 with 01xx is held for fiction and directory-assistance patterns. It will not appear in a recycling pool.",
            aging: null,
        };
    }
    if (numberClass !== "geographic" && numberClass !== "toll-free") {
        return {
            status: "non-geo",
            label: "Non-geographic resource",
            detail: "Assigned outside ordinary rate-center pooling. Recovery follows a different admin (Somos / NANPA non-geo).",
            aging: null,
        };
    }
    const h = hash32(digits);
    const bucket = h % 100;
    if (bucket < 6) {
        return {
            status: "available",
            label: "Modeled as pool-available",
            detail: "If this line were unassigned and past aging, it would be reachable through a request to the thousands-block code holder. No carrier system was consulted, so treat this as an example state rather than a fact about the number.",
            aging: 0,
        };
    }
    if (bucket < 16) {
        const days = 4 + (h % 86);
        return {
            status: "aging",
            label: "Modeled as aging",
            detail: `A disconnected line would sit in aging before returning to inventory. FCC rules cap aging; typical windows are 45–90 days. The model places this line about ${days} days from pool eligibility.`,
            aging: days,
        };
    }
    if (bucket < 20) {
        return {
            status: "disconnected",
            label: "Modeled as recently disconnected",
            detail: "A line that has just disconnected would still be inside its aging window and would not yet be assignable.",
            aging: 90,
        };
    }
    if (bucket < 24) {
        return {
            status: "reserved",
            label: "Modeled as held by the code holder",
            detail: "Some blocks are reserved by their holder for test, administrative, or reserved-for-customer use, and never reach the donation pool.",
            aging: null,
        };
    }
    return {
        status: "in-service",
        label: "Modeled as in service",
        detail: "Most numbers are assigned to an active subscriber. If a line disconnects, aging begins, and only then can the number re-enter inventory.",
        aging: null,
    };
}
function pickCarrier(digits, cc) {
    const pool = cc === "CA"
        ? CARRIERS.filter((c) => /Rogers|Bell|TELUS|Bandwidth|Twilio/.test(c.name))
        : CARRIERS.filter((c) => !/Rogers|Bell|TELUS/.test(c.name));
    return pool[hash32(digits + "c") % pool.length] ?? CARRIERS[0];
}
function recommendations(result) {
    const out = [];
    if (result.status === "available") {
        out.push("The model places this line in the public pool. Confirm the real state with the thousands-block code holder before acting on it.");
    }
    else if (result.status === "aging") {
        out.push("A tracking slot re-checks this number for you and emails you when the modeled state changes.");
    }
    else if (result.status === "in-service") {
        out.push("Do not contact the current subscriber. A number only becomes recoverable after a disconnect and a completed aging cycle.");
    }
    else if (result.status === "disconnected") {
        out.push("A tracking slot will catch the transition into the pool.");
    }
    if (result.ported) {
        out.push("The model flags this line as ported (LNP), so the current OCN may differ from the original block holder.");
    }
    if (result.numberClass === "toll-free") {
        out.push("Toll-free recovery is administered through Somos, not geographic thousands-block pooling.");
    }
    if (out.length === 0) {
        out.push("Run a reverse lookup on related NPA-NXX blocks, or open the pooling guide before requesting retrieval.");
    }
    return out;
}
export function lookupNumber(input) {
    const computedAt = new Date().toISOString();
    const digits = digitsOnly(input);
    const empty = (detail, status = "invalid") => ({
        input,
        e164: "",
        national: input.trim(),
        digits,
        npa: "",
        nxx: "",
        line: "",
        block: "",
        valid: false,
        numberClass: "invalid",
        status,
        statusLabel: "Cannot resolve",
        statusDetail: detail,
        agingDaysRemaining: null,
        lineType: "reserved",
        lineTypeLabel: "Unknown",
        carrier: "—",
        ocn: "—",
        ported: false,
        originalCarrier: null,
        rateCenter: "—",
        lata: "—",
        timezone: "",
        timezoneAbbr: "",
        city: "",
        region: "",
        country: "",
        countryCode: "",
        overlayWith: [],
        confidence: 0,
        computedAt,
        lastRealCheckAt: null,
        provenance: {},
        hasModeledFields: false,
        recommendations: ["Enter a 10-digit US or Canadian number, with or without +1."],
        sources: ["NANP allocation index"],
    });
    if (digits.length === 0) {
        return empty("No digits found.");
    }
    if (digits.length < 10) {
        return empty("Need 10 digits (NPA-NXX-XXXX) after stripping a leading 1.");
    }
    if (digits.length > 10) {
        return empty("This service covers NANP (+1) numbers only.");
    }
    const npa = digits.slice(0, 3);
    const nxx = digits.slice(3, 6);
    const line = digits.slice(6);
    const block = `${npa}-${nxx}-${line.slice(0, 1)}`;
    const numberClass = classify(npa, nxx, line);
    const npaRec = NPAS[npa];
    const rolled = rollStatus(digits, numberClass);
    const carrierPick = npaRec ? pickCarrier(digits, npaRec.cc) : CARRIERS[0];
    const ported = numberClass === "geographic" && hash32(digits + "p") % 5 === 0;
    const original = ported ? pickCarrier(digits + "o", npaRec?.cc ?? "US") : null;
    let lineType = carrierPick.line;
    let lineTypeLabel = carrierPick.line === "wireless"
        ? "Wireless"
        : carrierPick.line === "voip"
            ? "VoIP"
            : "Wireline";
    if (numberClass === "toll-free") {
        lineType = "tollfree";
        lineTypeLabel = "Toll-free";
    }
    else if (numberClass === "reserved") {
        lineType = "reserved";
        lineTypeLabel = "Reserved";
    }
    const at = new Date(computedAt);
    const tz = npaRec?.tz ?? "";
    const valid = numberClass === "geographic" ||
        numberClass === "toll-free" ||
        numberClass === "premium" ||
        numberClass === "personal" ||
        numberClass === "government";
    // Geography comes from the published NANP area-code table; everything about
    // the LINE itself is modeled. The UI reads this map to label each field.
    const provenance = {
        npa: "derived",
        nxx: "derived",
        line: "derived",
        block: "derived",
        numberClass: "derived",
        city: npaRec ? "table" : "modeled",
        region: npaRec ? "table" : "modeled",
        country: npaRec ? "table" : "modeled",
        timezone: npaRec ? "table" : "modeled",
        overlayWith: npaRec ? "table" : "modeled",
        carrier: "modeled",
        ocn: "modeled",
        lineType: "modeled",
        lata: "modeled",
        rateCenter: "table",
        ported: "modeled",
        originalCarrier: "modeled",
        status: "modeled",
        agingDaysRemaining: "modeled",
    };
    const result = {
        input,
        e164: formatE164(digits),
        national: formatNational(digits),
        digits,
        npa,
        nxx,
        line,
        block,
        valid: valid && rolled.status !== "invalid",
        numberClass,
        status: rolled.status,
        statusLabel: rolled.label,
        statusDetail: rolled.detail,
        agingDaysRemaining: rolled.aging,
        lineType,
        lineTypeLabel,
        carrier: numberClass === "reserved" ? "NANPA reserved" : carrierPick.name,
        ocn: numberClass === "reserved" ? "—" : carrierPick.ocn,
        ported,
        originalCarrier: original && ported ? original.name : null,
        rateCenter: npaRec ? npaRec.city.toUpperCase() : "UNLISTED",
        lata: npaRec ? lataFor(npa, npaRec.region) : "—",
        timezone: tz,
        timezoneAbbr: tz ? tzAbbr(tz, at) : "",
        city: npaRec?.city ?? "",
        region: npaRec?.region ?? "",
        country: npaRec ? countryName(npaRec.cc) : "",
        countryCode: npaRec?.cc ?? "",
        overlayWith: npaRec?.overlay ?? [],
        confidence: npaRec ? (numberClass === "geographic" ? 0.86 : 0.7) : 0.45,
        computedAt,
        lastRealCheckAt: null,
        provenance,
        hasModeledFields: true,
        recommendations: [],
        sources: [
            "NANP / NANPA NPA assignment table (published area-code data)",
            "Thousands-block arithmetic on the digits you entered",
            "Allocation model — carrier, line type, porting, pool state and aging are ESTIMATES",
        ],
    };
    result.recommendations = recommendations(result);
    if (!npaRec && numberClass === "geographic") {
        result.statusDetail +=
            " This area code is well-formed but not in the local city table, so geography is incomplete.";
    }
    return result;
}
export const EXAMPLE_NUMBERS = [
    { digits: "2129704481", hint: "Manhattan" },
    { digits: "4156281044", hint: "San Francisco" },
    { digits: "4025312040", hint: "Omaha overlay" },
    { digits: "4164372201", hint: "Toronto" },
    { digits: "3057860199", hint: "Miami" },
    { digits: "2069731104", hint: "Seattle" },
    { digits: "3128724410", hint: "Chicago" },
    { digits: "2125550100", hint: "Reserved 555 line" },
];
/**
 * Real, checkable coverage facts for the home page strip.
 *
 * Deliberately NOT a live event feed. The previous ticker rendered invented
 * "aging expired / 4m ago" events reseeded every ten minutes, which read as
 * carrier activity that did not exist. If this site ever gets a genuine data
 * source, that belongs here — behind a real timestamp and a real source.
 */
export function coverageStats() {
    const all = Object.values(NPAS);
    const us = all.filter((r) => r.cc === "US").length;
    const ca = all.filter((r) => r.cc === "CA").length;
    const overlays = all.filter((r) => (r.overlay?.length ?? 0) > 0).length;
    return { total: all.length, us, ca, overlays };
}
