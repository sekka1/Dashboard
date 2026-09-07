import { Link } from "react-router-dom";

interface Listing {
  address: string;
  city: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  tag: string;
}

const LISTINGS: Listing[] = [
  {
    address: "412 Maple Ridge Ln",
    city: "Austin, TX",
    price: "$685,000",
    beds: 4,
    baths: 3,
    sqft: "2,640",
    tag: "New listing",
  },
  {
    address: "88 Harbor View Ct",
    city: "Tampa, FL",
    price: "$519,000",
    beds: 3,
    baths: 2,
    sqft: "1,980",
    tag: "Price reduced",
  },
  {
    address: "1207 Birchwood Ave",
    city: "Denver, CO",
    price: "$742,500",
    beds: 5,
    baths: 4,
    sqft: "3,110",
    tag: "Open house Sat",
  },
  {
    address: "56 Cobblestone Way",
    city: "Raleigh, NC",
    price: "$438,000",
    beds: 3,
    baths: 2,
    sqft: "1,760",
    tag: "New listing",
  },
  {
    address: "990 Sycamore Ter",
    city: "Boise, ID",
    price: "$471,900",
    beds: 4,
    baths: 3,
    sqft: "2,210",
    tag: "Under contract",
  },
  {
    address: "23 Lantern Hill Rd",
    city: "Charlotte, NC",
    price: "$599,000",
    beds: 4,
    baths: 3,
    sqft: "2,455",
    tag: "Open house Sun",
  },
];

export function ListingsDemoPage() {
  return (
    <div className="min-h-screen bg-[#f6efe4]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link
          to="/demos"
          className="text-sm text-[#8a6a4a] underline-offset-4 hover:text-[#5c4326] hover:underline"
        >
          ← All demos
        </Link>

        <div className="mt-6 border-b border-[#b5651d]/30 pb-6">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#b5651d]">
            Featured Listings
          </p>
          <h1 className="mt-2 font-serif text-4xl text-[#2e2418]">
            Homes our partners referred this month
          </h1>
          <p className="mt-3 max-w-xl font-serif text-[#5c4326]">
            Six properties currently active in the referral pipeline, presented the way a buyer
            would see them — not the way a spreadsheet would.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {LISTINGS.map((listing) => (
            <article key={listing.address} className="group">
              <div className="flex aspect-[4/3] items-end overflow-hidden rounded-md bg-gradient-to-br from-[#e7d9c3] to-[#cbb491] p-4">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[#5c4326]">
                  {listing.tag}
                </span>
              </div>
              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-serif text-lg text-[#2e2418]">{listing.address}</h2>
                  <span className="font-serif text-lg text-[#b5651d]">{listing.price}</span>
                </div>
                <p className="mt-0.5 text-sm text-[#8a6a4a]">{listing.city}</p>
                <p className="mt-2 text-sm text-[#5c4326]">
                  {listing.beds} beds · {listing.baths} baths · {listing.sqft} sqft
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
