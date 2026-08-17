import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Junta classes condicionais e resolve conflitos do Tailwind. */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
