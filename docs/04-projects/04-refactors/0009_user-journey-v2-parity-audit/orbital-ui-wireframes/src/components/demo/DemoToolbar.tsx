import React from 'react';
import { RefreshCw } from 'lucide-react';
interface DemoToolbarProps {
  onLoadPack: () => void;
}
export function DemoToolbar({ onLoadPack }: DemoToolbarProps) {
  return (
    <div className="bg-orange-500 text-white px-6 py-2 flex items-center justify-between shadow-sm flex-shrink-0">
      <div className="flex items-center">
        <span className="font-bold text-xs tracking-wider uppercase mr-4 bg-white/20 px-2 py-0.5 rounded">
          Demo Mode
        </span>
        <span className="text-sm font-medium opacity-90">
          Operator Controls
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="relative">
          <select className="appearance-none bg-orange-600 border border-orange-400 text-white text-sm rounded pl-3 pr-8 py-1 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer">
            <option>pack_01_clean</option>
            <option>pack_02_missing_rea</option>
            <option>pack_03_complex_litigation</option>
          </select>
          <div className="w-3.5 h-3.5 absolute right-2.5 top-2 pointer-events-none opacity-75" />
        </div>

        <button
          onClick={onLoadPack}
          className="flex items-center bg-white text-orange-600 hover:bg-orange-50 px-3 py-1 rounded text-sm font-medium transition-colors shadow-sm">

          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Load Demo Pack
        </button>
      </div>
    </div>);

}