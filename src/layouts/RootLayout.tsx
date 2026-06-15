import { Link, Outlet, useLocation } from 'react-router-dom';
import { Upload, List, Layers } from 'lucide-react';
import { baseButtonStyles, variantStyles } from '../components/ui/Button.styles';
import BasyxConnectPopover from '../components/ui/BasyxConnectPopover';

export default function RootLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 select-none">
          <div className="p-2 bg-accent rounded-lg text-white">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none text-slate-900">AAS Generator</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2">
            <Link
              to="/upload"
              className={`${baseButtonStyles} ${
                variantStyles[isActive('/upload') ? 'default' : 'ghost']
              } flex items-center gap-2 transition-all`}
            >
              <Upload size={16} />
              <span>AAS 생성</span>
            </Link>

            <Link
              to="/list"
              className={`${baseButtonStyles} ${
                variantStyles[isActive('/list') ? 'default' : 'ghost']
              } flex items-center gap-2 whitespace-nowrap transition-all`}
            >
              <List size={16} />
              <span>AAS 목록 조회</span>
            </Link>
          </nav>

          <div className="h-4 w-px bg-slate-200" />

          <BasyxConnectPopover />
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full p-6 flex-1 min-h-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
