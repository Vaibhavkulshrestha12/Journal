import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Proactively track a view (in a real app, this might be debounced or handled differently)
    await prisma.post.update({
      where: { slug },
      data: { viewsCount: { increment: 1 } },
    });

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: No session found" }, { status: 401 });
    }

    const body = await request.json();

    try {
      const post = await prisma.post.update({
        where: { slug },
        data: {
          title: body.title,
          slug: body.slug,
          content: body.content,
          coverImage: body.coverImage,
          tags: body.tags,
          status: body.status,
          isFeatured: body.isFeatured,
        },
      });

      revalidatePath("/");
      revalidatePath("/posts");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/posts");
      revalidatePath(`/posts/${slug}`);

      return NextResponse.json(post);
    } catch (dbError: any) {
      console.error("Database Error:", dbError);
      return NextResponse.json({ error: `Database Error: ${dbError.message}` }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: No session found" }, { status: 401 });
    }

    try {
      await prisma.post.delete({
        where: { slug },
      });

      revalidatePath("/");
      revalidatePath("/posts");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/posts");
      revalidatePath(`/posts/${slug}`);

      return NextResponse.json({ message: "Post deleted" });
    } catch (dbError: any) {
      console.error("Database Error:", dbError);
      return NextResponse.json({ error: `Database Error: ${dbError.message}` }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
