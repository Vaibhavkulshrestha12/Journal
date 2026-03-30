import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { postId, type } = await request.json(); // type: "LIKE" or "DISLIKE"
    const ip = (await headers()).get("x-forwarded-for") || "::1";
    const hashedIp = crypto.createHash("sha256").update(ip).digest("hex");

    // Atomic update or transaction:
    // 1. Check if record exists for this ip/post/type
    const existing = await prisma.postEngagement.findUnique({
      where: {
        postId_ipAddress_type: {
          postId,
          ipAddress: hashedIp,
          type: type as any,
        }
      }
    });

    if (existing) {
      // User is undoing their engagement
      await prisma.postEngagement.delete({
        where: { id: existing.id }
      });
      await prisma.post.update({
        where: { id: postId },
        data: {
          [type === "LIKE" ? "likesCount" : "dislikesCount"]: { decrement: 1 }
        }
      });
      return NextResponse.json({ action: "undone" });
    }

    // New engagement
    await prisma.postEngagement.create({
      data: {
        postId,
        ipAddress: hashedIp,
        type: type as any,
      }
    });

    // Handle opposite engagement removal (if they liked, then disliked - simplified for now)
    await prisma.post.update({
      where: { id: postId },
      data: {
        [type === "LIKE" ? "likesCount" : "dislikesCount"]: { increment: 1 }
      }
    });

    return NextResponse.json({ action: "success" });
  } catch (error: any) {
    console.error("Engagement Error:", error);
    return NextResponse.json({ error: `Engagement failed: ${error.message}` }, { status: 500 });
  }
}
