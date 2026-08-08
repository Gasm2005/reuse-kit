// Single source of truth for the details that show up all over the site.
// These were copy-pasted across five components before.

// Was hardcoded as `const SITE_URL = "https://beigestates.vercel.app"` in
// four separate files (layout, sitemap, robots, the property page) — and
// the same mistake nearly repeated itself in the team-invite email, which
// built its redirect link from the request's own origin. Whoever happened
// to be running that request locally got a "localhost:3000" link mailed to
// someone else. One constant, overridable by an env var so a future custom
// domain is a one-line change instead of a redeploy across five files.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://beigestates.vercel.app";

export const SITE = {
  name: "Beig Estates",
  phones: [
    { display: "+91 74979 37625", tel: "+917497937625", wa: "917497937625" },
    { display: "+91 90267 85261", tel: "+919026785261", wa: "919026785261" },
  ],
  email: "kaifbegmirza7497@gmail.com",
  address: {
    line: "Mithai Wala Chauraha, Gomti Nagar",
    city: "Lucknow",
    state: "Uttar Pradesh",
    country: "IN",
  },
  mapsEmbed:
    "https://maps.google.com/maps?q=Mithai%20Wala%20Chauraha%2C%20Gomti%20Nagar%2C%20Lucknow&t=&z=15&ie=UTF8&iwloc=&output=embed",
  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Mithai+Wala+Chauraha%2C+Gomti+Nagar%2C+Lucknow",
} as const;

export const WA_MESSAGE = encodeURIComponent(
  "Hi, I'm looking for help with a property requirement through Beig Estates. Can we discuss?"
);

export function waLink(number: string, message = WA_MESSAGE) {
  return `https://wa.me/${number}?text=${message}`;
}

// ---------------------------------------------------------------------------
// Credentials. Left empty on purpose — a real number here is worth more than
// any amount of copy, and a made-up one is worse than nothing. Fill in what's
// actually true and the site starts showing it; leave it null and the section
// quietly stays hidden.
// ---------------------------------------------------------------------------
export const CREDENTIALS: {
  establishedYear: number | null;
  reraNumber: string | null;
  dealsClosed: number | null;
  owner: {
    name: string;
    role: string;
    // Drop a photo in /public and put the filename here, e.g. "/owner.jpg".
    photo: string | null;
    phone: string;
  } | null;
} = {
  establishedYear: null,
  reraNumber: null,
  dealsClosed: null,
  owner: null,
};
