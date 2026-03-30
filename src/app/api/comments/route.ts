import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const { postId, content } = await request.json();
    const ip = (await headers()).get("x-forwarded-for") || "::1";

    if (!content || content.length < 3) {
      return NextResponse.json({ error: "Comment too short" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        content,
        ipAddress: ip,
      }
    });

    return NextResponse.json(comment);
  } catch (error: any) {
    console.error("Comment Error:", error);
    return NextResponse.json({ error: `Comment failed: ${error.message}` }, { status: 500 });
  }
}
