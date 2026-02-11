import React from 'react';
import { History, ArrowRight } from 'lucide-react';
export function DemoHistory() {
  return (
    <div className="bg-white border border-border rounded-lg shadow-ui-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground flex items-center">
          <History className="w-4 h-4 mr-2 text-muted-foreground" />
          Recent Demo Matters
        </h3>
      </div>
      <div className="divide-y divide-border">
        {[
        {
          name: 'Acme Corp v. GlobalTech',
          time: '10 mins ago',
          pack: 'pack_01'
        },
        {
          name: 'Estate of Margaret Chen',
          time: '2 hours ago',
          pack: 'pack_02'
        },
        {
          name: 'Meridian Holdings',
          time: 'Yesterday',
          pack: 'pack_01'
        }].
        map((item, i) =>
        <div
          key={i}
          className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group">

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {item.name}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground font-mono">
                {item.pack}
              </span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          </div>
        )}
      </div>
    </div>);

}