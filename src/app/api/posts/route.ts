import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "PUBLISHED";
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const posts = await prisma.post.findMany({
      where: status === "ALL" ? {} : { status: status as any },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        _count: {
          select: { comments: true },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: No session found" }, { status: 401 });
    }

    const body = await request.json();

    try {
      const post = await prisma.post.create({
        data: {
          title: body.title,
          slug: body.slug,
          content: body.content,
          coverImage: body.coverImage,
          tags: body.tags || [],
          status: body.status || "DRAFT",
          isFeatured: body.isFeatured || false,
        },
      });

      revalidatePath("/");
      revalidatePath("/posts");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/posts");

      return NextResponse.json(post);
    } catch (dbError: any) {
      console.error("Database Error:", dbError);
      return NextResponse.json({ error: `Database Error: ${dbError.message}` }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
