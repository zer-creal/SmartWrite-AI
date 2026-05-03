'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
    />
  );
}

export function DocumentSkeleton() {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-4">
      {/* 标题骨架 */}
      <Skeleton className="h-10 w-3/4" />
      
      {/* 段落骨架 */}
      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      
      {/* 段落骨架 */}
      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* 列表骨架 */}
      <div className="space-y-2 pt-4 pl-4">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
      
      {/* 段落骨架 */}
      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-60 bg-[#F7F7F5] p-4 space-y-4">
      {/* 工作区头部骨架 */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200/60">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      
      {/* 搜索框骨架 */}
      <Skeleton className="h-10 w-full rounded-lg" />
      
      {/* 文档列表骨架 */}
      <div className="space-y-2 pt-2">
        <Skeleton className="h-4 w-12" />
        <div className="space-y-1">
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
