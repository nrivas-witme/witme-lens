import type { Metadata } from "next";
import { AssetPageBody } from "@/components/asset-page-body";
import { demoAssets } from "@/lib/demo-data";

export function generateStaticParams() {
  return demoAssets.map((asset) => ({ code: asset.code }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return { title: code };
}

export default async function FichaPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <AssetPageBody code={code} />;
}
