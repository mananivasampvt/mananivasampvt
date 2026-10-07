import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format, differenceInDays } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPropertyDate(dateVal: any) {
  if (!dateVal) return null;
  try {
    const date = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    const diff = differenceInDays(new Date(), date);
    
    if (diff === 0) {
      const distance = formatDistanceToNow(date, { addSuffix: true });
      if (distance === 'less than a minute ago') return 'Added just now';
      return `Added ${distance}`;
    } else if (diff === 1) {
      return 'Added yesterday';
    } else if (diff <= 7) {
      return `Added ${diff} days ago`;
    } else {
      return `Added on ${format(date, 'dd MMM yyyy, hh:mm a')}`;
    }
  } catch (e) {
    return null;
  }
}
