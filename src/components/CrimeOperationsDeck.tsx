type CrimeOperationsDeckProps = {
  activePage: string;
  onNavigate: (page: string) => void;
};

/**
 * The legacy operations deck is intentionally disabled. The dashboard's
 * primary navigation and the existing crime pages remain available.
 */
export function CrimeOperationsDeck(_props: CrimeOperationsDeckProps) {
  return null;
}
