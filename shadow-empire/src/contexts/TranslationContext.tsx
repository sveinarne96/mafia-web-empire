import React, { createContext, useContext, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { t as translate } from "@/data/translations";

interface TranslationContextValue {
  /** Current language code (e.g. "en", "no", "de") */
  lang: string;
  /** Translate a key to the current language, falling back to English */
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextValue>({
  lang: "en",
  t: (key: string) => key,
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const player = useQuery(api.game.getPlayer);
  const lang = ((player as any)?.activeLanguage as string) || "en";

  const tFn = useCallback(
    (key: string) => translate(key, lang),
    [lang],
  );

  return (
    <TranslationContext.Provider value={{ lang, t: tFn }}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * Hook to translate UI strings based on the player's chosen language.
 *
 * Usage:
 *   const { t, lang } = useTranslation();
 *   <span>{t("nav.street")}</span>
 */
export function useTranslation(): TranslationContextValue {
  return useContext(TranslationContext);
}
