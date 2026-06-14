import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { getPrimaryEmailForClerkUser } from "@/server/auth/context";
import { provisionOrganizationForClerkUser } from "@/server/organizations";

const provisionSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = provisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const user = await currentUser();
  const primaryEmail =
    user?.emailAddresses.find((address) => address.id === user.primaryEmailAddressId)
      ?.emailAddress ??
    (await getPrimaryEmailForClerkUser());

  try {
    const result = await provisionOrganizationForClerkUser({
      name: parsed.data.name,
      clerkUserId: userId,
      clerkUserEmail: primaryEmail,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    revalidatePath("/dashboard", "layout");

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provisioning failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
