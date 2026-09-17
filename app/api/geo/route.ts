import { NextRequest, NextResponse } from "next/server";
import { AFRICAN_COUNTRY_CODES } from "@/lib/i18n/geo";

export async function GET(req: NextRequest) {
  const headers = req.headers;

  const country =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country") ||
    headers.get("x-geo-country") ||
    headers.get("x-client-ip-country") ||
    "";

  const upperCountry = country.toUpperCase();
  const isAfrican = upperCountry ? AFRICAN_COUNTRY_CODES.has(upperCountry) : false;

  return NextResponse.json({
    country: upperCountry || null,
    isAfrican,
  });
}
