import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface LeadData {
  address: string;
  firstName: string;
  email: string;
  phone: string;
  sellingTimeline: string;
  propertyType: string;
  relationship?: string; // Optional - defaults to "homeowner"
  website: string;
  lat: number | null;
  lng: number | null;
  // Visitor geo location data
  visitorCity?: string | null;
  visitorRegion?: string | null;
  visitorCountry?: string | null;
  visitorLatitude?: string | null;
  visitorLongitude?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadData = await request.json();
    const {
      address,
      firstName,
      email,
      phone,
      sellingTimeline,
      propertyType,
      relationship,
      website,
      lat,
      lng,
      visitorCity,
      visitorRegion,
      visitorCountry,
      visitorLatitude,
      visitorLongitude,
    } = body;

    // Honeypot check - if website field is filled, it's a bot
    if (website) {
      // Return 200 silently to trick bots
      return NextResponse.json({ success: true });
    }

    // Validate required fields
    if (!address || !firstName || !email || !phone || !sellingTimeline || !propertyType) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Default relationship to "homeowner" if not provided
    const relationshipValue = relationship || "homeowner";

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const hubspotToken = process.env.HUBSPOT_TOKEN;
    if (!hubspotToken) {
      console.error("HUBSPOT_TOKEN is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Build address with coordinates if available
    const fullAddress = lat && lng
      ? `${address} (${lat.toFixed(6)}, ${lng.toFixed(6)})`
      : address;

    // Map selling timeline to readable value
    const timelineMap: Record<string, string> = {
      "asap": "ASAP - Ready now",
      "1-3months": "1-3 months",
      "3-6months": "3-6 months",
      "6-12months": "6-12 months",
      "curious": "Just curious about my value",
    };

    // Map property type to readable value
    const propertyTypeMap: Record<string, string> = {
      "single-family": "Single Family Home",
      "townhouse": "Townhouse",
      "condo": "Condo",
      "multi-family": "Multi-Family",
      "land": "Land",
      "other": "Other",
    };

    // Map relationship to readable value
    const relationshipMap: Record<string, string> = {
      "homeowner": "Homeowner",
      "co-owner": "Co-owner",
      "family-member": "Family member of owner",
      "agent": "Real estate agent",
      "other": "Other",
    };

    // Build HubSpot properties object
    const hubspotProperties: Record<string, string> = {
      email: email,
      firstname: firstName,
      phone: phone,
      address: fullAddress,
      selling_timeline: timelineMap[sellingTimeline] || sellingTimeline,
      property_type: propertyTypeMap[propertyType] || propertyType,
      relationship_to_property: relationshipMap[relationshipValue] || relationshipValue,
    };

    // Add visitor location data if available
    if (visitorCity) {
      hubspotProperties.city = visitorCity;
    }
    if (visitorRegion) {
      hubspotProperties.state = visitorRegion;
    }
    if (visitorCountry) {
      hubspotProperties.country = visitorCountry;
    }
    if (visitorLatitude) {
      hubspotProperties.ip_latitude = visitorLatitude;
    }
    if (visitorLongitude) {
      hubspotProperties.ip_longitude = visitorLongitude;
    }

    // Send to HubSpot
    const hubspotResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hubspotToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: hubspotProperties,
        }),
      }
    );

    if (hubspotResponse.ok) {
      return NextResponse.json({ success: true });
    }

    // Handle HubSpot conflict (contact already exists)
    if (hubspotResponse.status === 409) {
      // Contact exists, try to update instead
      const conflictData = await hubspotResponse.json();
      const existingContactId = conflictData?.message?.match(/(\d+)/)?.[1];

      if (existingContactId) {
        // Remove email from update (can't update email on existing contact)
        const updateProperties = { ...hubspotProperties };
        delete updateProperties.email;

        // Update existing contact
        const updateResponse = await fetch(
          `https://api.hubapi.com/crm/v3/objects/contacts/${existingContactId}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${hubspotToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              properties: updateProperties,
            }),
          }
        );

        if (updateResponse.ok) {
          return NextResponse.json({ success: true });
        }
      }

      // If update fails, still consider it a success since contact exists
      return NextResponse.json({ success: true });
    }

    const errorData = await hubspotResponse.json();
    console.error("HubSpot API error:", errorData);
    return NextResponse.json(
      { error: "Failed to submit lead" },
      { status: 500 }
    );
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
