import Image from 'next/image'
import logoImage from '@/assets/images/logo.jpg'

export const Logo = ({ className }: { className?: string }) => {
  return <Image src={logoImage} alt="Logo" width={24} height={24} className={className} priority />
}
