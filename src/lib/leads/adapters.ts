// Lead Discovery adapters.
//
// Each adapter is a self-contained, swappable source of prospect data.
// The rest of the platform never talks to a provider directly — it only
// talks to this interface — so a provider can be swapped or added later
// without touching admin UI or scoring logic.
//
// Compliance rule: we never scrape Instagram, Google, or WhatsApp in a way
// that violates their terms of service. Sources are either (a) an approved
// public API called with a real credential, or (b) data an admin or the
// business itself has supplied directly (manual entry, CSV paste, the
// onboarding form). No headless-browser scraping of logged-in surfaces.

export type ProspectDraft = {
  business_name: string;
  category?: string | undefined;
  city?: string | undefined;
  country?: string | undefined;
  instagram_url?: string | undefined;
  instagram_followers?: number | undefined;
  google_maps_url?: string | undefined;
  google_rating?: number | undefined;
  google_reviews_count?: number | undefined;
  website_url?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  description?: string | undefined;
  lead_source: string;
};

export interface DiscoveryAdapter {
  key: string;
  label: string;
  configured(): boolean;
  /** Human-readable reason the adapter is inactive, for the admin UI. */
  inactiveReason(): string | null;
}

// ---------------------------------------------------------------------------
// Manual / user-supplied adapter — always available, zero credentials.
// Covers: an admin researching a business by hand, a business owner sending
// their own links, or a bulk CSV paste of already-researched leads.
// ---------------------------------------------------------------------------
export const manualAdapter: DiscoveryAdapter = {
  key: "manual",
  label: "Manual / user-supplied",
  configured: () => true,
  inactiveReason: () => null,
};

// ---------------------------------------------------------------------------
// Google Places (New) — Text Search + Place Details.
// Legitimate, ToS-compliant API for exactly this data: name, category,
// rating, review count, website, and a Maps link. Requires a Google Cloud
// API key with the "Places API (New)" enabled.
// ---------------------------------------------------------------------------
export const GOOGLE_PLACES_ENV_VAR = "GOOGLE_PLACES_API_KEY";

export const googlePlacesAdapter: DiscoveryAdapter = {
  key: "google_places",
  label: "Google Places API",
  configured: () => Boolean(process.env[GOOGLE_PLACES_ENV_VAR]),
  inactiveReason() {
    return this.configured()
      ? null
      : `Integration prepared — credential required: ${GOOGLE_PLACES_ENV_VAR}.`;
  },
};

export async function searchGooglePlaces(params: {
  query: string; // e.g. "cafes in Beirut"
}): Promise<ProspectDraft[]> {
  const apiKey = process.env[GOOGLE_PLACES_ENV_VAR];
  if (!apiKey) {
    throw new Error(`Integration prepared — credential required: ${GOOGLE_PLACES_ENV_VAR}.`);
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.googleMapsUri,places.primaryTypeDisplayName,places.nationalPhoneNumber",
    },
    body: JSON.stringify({ textQuery: params.query, maxResultCount: 20 }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Google Places request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    places?: Array<{
      displayName?: { text?: string };
      formattedAddress?: string;
      rating?: number;
      userRatingCount?: number;
      websiteUri?: string;
      googleMapsUri?: string;
      primaryTypeDisplayName?: { text?: string };
      nationalPhoneNumber?: string;
    }>;
  };

  return (data.places ?? []).map((p) => ({
    business_name: p.displayName?.text ?? "Unknown business",
    category: p.primaryTypeDisplayName?.text,
    city: undefined,
    country: undefined,
    google_maps_url: p.googleMapsUri,
    google_rating: p.rating,
    google_reviews_count: p.userRatingCount,
    website_url: p.websiteUri,
    phone: p.nationalPhoneNumber,
    description: p.formattedAddress,
    lead_source: "google_places",
  }));
}

// ---------------------------------------------------------------------------
// Instagram — deliberately manual-only.
// Instagram's Graph API only exposes data for accounts that have explicitly
// connected their own Facebook/Instagram Business login to *our* app — there
// is no public "search businesses by city/category" endpoint, and scraping
// public profiles violates Instagram's Terms of Service. So this adapter
// documents the honest, compliant path: the Instagram URL and follower count
// are supplied by an admin (who looked at the public profile) or by the
// business itself via the onboarding form.
// ---------------------------------------------------------------------------
export const INSTAGRAM_GRAPH_ENV_VAR = "INSTAGRAM_GRAPH_ACCESS_TOKEN";

export const instagramAdapter: DiscoveryAdapter = {
  key: "instagram",
  label: "Instagram (manual entry only)",
  configured: () => true,
  inactiveReason: () =>
    "Instagram has no compliant public discovery API. Follower counts and profile links are entered manually (by an admin, or supplied by the business). " +
    `Connecting ${INSTAGRAM_GRAPH_ENV_VAR} would only ever unlock reading a business's own connected account, never third-party discovery.`,
};

export const DISCOVERY_ADAPTERS: DiscoveryAdapter[] = [
  manualAdapter,
  googlePlacesAdapter,
  instagramAdapter,
];
