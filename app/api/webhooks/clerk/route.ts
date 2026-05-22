// app/api/webhooks/clerk/route.ts
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import {
  deleteUserByClerkId,
  fromWebhookData,
  upsertUser,
} from "@/lib/sync-user";

export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (evt.type) {
      case "user.created":
      case "user.updated":
        await upsertUser(fromWebhookData(evt.data));
        break;
      case "user.deleted":
        if (evt.data.id) await deleteUserByClerkId(evt.data.id);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`Failed to handle Clerk webhook ${evt.type}:`, err);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
