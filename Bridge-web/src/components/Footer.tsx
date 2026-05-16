import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-100 py-12 border-t border-slate-200 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 w-full max-w-7xl mx-auto gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-manrope font-bold text-slate-900 text-xl tracking-tight">Bridge</span>
          <p className="text-slate-600 text-xs tracking-normal">The best choice</p>
        </div>
        <div className="flex gap-10">
          <Link to="#" className="text-slate-500 text-xs hover:text-emerald-600 transition-colors">Privacy</Link>
          <Link to="#" className="text-slate-500 text-xs hover:text-emerald-600 transition-colors">Terms</Link>
          <Link to="#" className="text-slate-500 text-xs hover:text-emerald-600 transition-colors">Support</Link>
        </div>
      </div>
    </footer>
  );
}
