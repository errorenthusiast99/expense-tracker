interface GoogleLogoProps {
  className?: string;
}

export function GoogleLogo({ className = "h-4 w-4" }: GoogleLogoProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.51 5.51 0 0 1-2.39 3.62v3.01h3.87c2.26-2.08 3.57-5.14 3.57-8.66Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3.01c-1.07.72-2.44 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.94H1.27v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.13-1.56.37-2.29V6.61H1.27A12 12 0 0 0 0 12c0 1.93.46 3.75 1.27 5.39l4-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.81l3.44-3.44C17.96 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.1c.95-2.83 3.6-4.94 6.73-4.94Z"
      />
    </svg>
  );
}
