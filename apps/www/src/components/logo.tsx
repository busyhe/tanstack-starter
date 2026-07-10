import { siteConfig } from '@/config/site'

export function Logo({ className }: { className?: string }) {
  return <img src="/logo192.png" alt={`${siteConfig.name} logo`} width={24} height={24} className={className} />
}
