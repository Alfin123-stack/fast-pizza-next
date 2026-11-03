"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/mongo";
import { getSession } from "@/lib/session";

// Removes one of the signed-in user's saved addresses.
export async function deleteAddress(id) {
  const user = await getSession();
  if (!user) return { error: "login" };
  try {
    await (await getDb()).collection("addresses").deleteOne({ id: String(id), userId: user.id });
    revalidatePath("/order/new");
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { error: "failed" };
  }
}
