import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token query param" }, { status: 400 });
  }

  const [meRes, accountsRes, permissionsRes] = await Promise.all([
    fetch(`https://graph.facebook.com/v25.0/me?fields=id,name,email&access_token=${token}`),
    fetch(`https://graph.facebook.com/v25.0/me/accounts?fields=id,name,tasks,instagram_business_account{id,username}&access_token=${token}`),
    fetch(`https://graph.facebook.com/v25.0/me/permissions?access_token=${token}`),
  ]);

  const [me, accounts, permissions] = await Promise.all([
    meRes.json(),
    accountsRes.json(),
    permissionsRes.json(),
  ]);

  console.log("[IG DEBUG] /me:", JSON.stringify(me));
  console.log("[IG DEBUG] /me/accounts:", JSON.stringify(accounts));
  console.log("[IG DEBUG] /me/permissions:", JSON.stringify(permissions));

  return NextResponse.json({ me, accounts, permissions });
}
