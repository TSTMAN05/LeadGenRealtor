import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  website: string; // honeypot field
}

interface HubSpotContact {
  properties: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    message: string;
    lead_source?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { firstName, lastName, email, phone, message, website } = body;

    // Honeypot check - if this field has content, it's likely a bot
    if (website) {
      console.log("Honeypot triggered - likely bot submission");
      // Return success to not tip off the bot
      return NextResponse.json({ success: true });
    }

    // Validate required fields
    if (!firstName || !email || !message) {
      return NextResponse.json(
        { error: "First name, email, and message are required" },
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

    // Create or update contact in HubSpot
    const contactData: HubSpotContact = {
      properties: {
        firstname: firstName,
        lastname: lastName || "",
        email: email,
        phone: phone || "",
        message: message,
        lead_source: "Contact Form",
      },
    };

    // First, try to create a new contact
    const createResponse = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hubspotToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      }
    );

    if (createResponse.ok) {
      console.log("Contact created successfully");
      return NextResponse.json({ success: true });
    }

    // If contact exists (409 conflict), update instead
    if (createResponse.status === 409) {
      console.log("Contact exists, updating...");

      // Search for existing contact by email
      const searchResponse = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts/search",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hubspotToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: "email",
                    operator: "EQ",
                    value: email,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.results && searchData.results.length > 0) {
          const contactId = searchData.results[0].id;

          // Update the existing contact
          const updateResponse = await fetch(
            `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${hubspotToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(contactData),
            }
          );

          if (updateResponse.ok) {
            console.log("Contact updated successfully");
            return NextResponse.json({ success: true });
          }
        }
      }
    }

    // Log error details
    const errorText = await createResponse.text();
    console.error("HubSpot API error:", createResponse.status, errorText);

    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
