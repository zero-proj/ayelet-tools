import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { useHref, useNavigate } from "react-router-dom";

import { TitleProvider } from "./util/title-provider";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <TitleProvider>
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        <ToastProvider placement="top-center" />
        {children}
      </HeroUIProvider>
    </TitleProvider>
  );
}
