import React from "react";
import type { Locale } from "../../../lib/i18n";
import { ToolsApp, type ToolId } from "./ToolsApp";

interface UtilityAppProps {
  id: "json" | "base64" | "hash" | "jwt" | "uuid" | "epoch" | "qr";
  locale: Locale;
}

export const UtilityApp: React.FC<UtilityAppProps> = ({ id, locale }) => {
  const toolMap: Record<UtilityAppProps["id"], ToolId> = {
    json: "json",
    base64: "base64",
    hash: "hash",
    jwt: "jwt",
    uuid: "uuid",
    epoch: "epoch",
    qr: "qrcode",
  };

  const activeTool = toolMap[id] ?? "json";
  return <ToolsApp locale={locale} initialTool={activeTool} standalone />;
};
