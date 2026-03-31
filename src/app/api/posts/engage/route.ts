import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    if (!postId) return NextResponse.json({ type: null, likesCount: 0, dislikesCount: 0 });

    const ip = (await headers()).get("x-forwarded-for") || "::1";
    const hashedIp = crypto.createHash("sha256").update(ip).digest("hex");

    const existing = await prisma.postEngagement.findFirst({
      where: { postId, ipAddress: hashedIp }
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { likesCount: true, dislikesCount: true }
    });

    return NextResponse.json({ 
      type: existing?.type || null,
      likesCount: post?.likesCount || 0,
      dislikesCount: post?.dislikesCount || 0
    });
  } catch (error) {
    return NextResponse.json({ type: null, likesCount: 0, dislikesCount: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const { postId, type } = await request.json();
    const ip = (await headers()).get("x-forwarded-for") || "::1";
    const hashedIp = crypto.createHash("sha256").update(ip).digest("hex");

    const existingEngagement = await prisma.postEngagement.findFirst({
      where: { postId, ipAddress: hashedIp }
    });

    if (existingEngagement) {
      if (existingEngagement.type === type) {
        // Undo engagement
        await prisma.postEngagement.delete({ where: { id: existingEngagement.id } });
        const post = await prisma.post.update({
          where: { id: postId },
          data: { [type === "LIKE" ? "likesCount" : "dislikesCount"]: { decrement: 1 } },
          select: { likesCount: true, dislikesCount: true }
        });
        return NextResponse.json({ action: "undone", ...post });
      } else {
        // Swap engagement (e.g. from LIKE to DISLIKE)
        await prisma.postEngagement.update({
          where: { id: existingEngagement.id },
          data: { type: type as any }
        });
        const post = await prisma.post.update({
          where: { id: postId },
          data: {
            [type === "LIKE" ? "likesCount" : "dislikesCount"]: { increment: 1 },
            [existingEngagement.type === "LIKE" ? "likesCount" : "dislikesCount"]: { decrement: 1 }
          },
          select: { likesCount: true, dislikesCount: true }
        });
        return NextResponse.json({ action: "swapped", ...post });
      }
    }

    // New engagement
    await prisma.postEngagement.create({
      data: { postId, ipAddress: hashedIp, type: type as any }
    });

    const post = await prisma.post.update({
      where: { id: postId },
      data: { [type === "LIKE" ? "likesCount" : "dislikesCount"]: { increment: 1 } },
      select: { likesCount: true, dislikesCount: true }
    });

    return NextResponse.json({ action: "success", ...post });
  } catch (error: any) {
    console.error("Engagement Error:", error);
    return NextResponse.json({ error: `Engagement failed: ${error.message}` }, { status: 500 });
  }
}
