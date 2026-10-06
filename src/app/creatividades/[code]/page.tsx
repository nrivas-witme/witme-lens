import type { Metadata } from "next";
import { AssetPageBody } from "@/components/asset-page-body";

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
