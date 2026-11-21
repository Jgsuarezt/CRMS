import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StorefrontClient } from "@/components/StorefrontClient";

async function StoreContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { slug } });
  if (!workspace) notFound();

  const products = await prisma.catalogItem.findMany({
    where: { workspaceId: workspace.id, stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <StorefrontClient
      slug={workspace.slug}
      storeName={workspace.name}
      displayPhone={workspace.displayPhone || "+1 555 019 2834"}
      products={products}
    />
  );
}

export default function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
          Cargando tienda en línea...
        </div>
      }
    >
      <StoreContent params={params} />
    </Suspense>
  );
}
