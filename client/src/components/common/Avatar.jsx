// Avatar
export default function Avatar({ src, name, size = 'md', className = '', onClick }) {
  const sizes = { xs:'w-6 h-6 text-xs', sm:'w-8 h-8 text-sm', md:'w-10 h-10 text-base', lg:'w-14 h-14 text-xl', xl:'w-20 h-20 text-2xl' };
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?';
  return src
    ? <img src={src} alt={name} onClick={onClick}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`} />
    : <div onClick={onClick}
        className={`${sizes[size]} rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold flex-shrink-0 ${className}`}>
        {initials}
      </div>;
}
