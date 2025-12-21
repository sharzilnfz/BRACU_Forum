import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowBigDown,
  ArrowBigUp,
  BarChart2,
  MessageCircle,
  MoreHorizontal,
  Share,
} from 'lucide-react';

export const ThreadCard = ({ post }) => {
  return (
    <div className="w-full max-w-2xl border-b border-border bg-card p-4 text-card-foreground hover:bg-muted/50 transition-colors">
      <div className="flex gap-4">
        {/* Avatar Column */}
        <div className="flex flex-col items-center gap-2">
          <Avatar className="cursor-pointer ring-2 ring-transparent transition-all hover:ring-ring">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback className="text-foreground">
              {post.author.name[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content Column */}
        <div className="flex grow flex-col gap-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[15px] hover:underline cursor-pointer">
                {post.author.name}
              </span>
              <span className="text-muted-foreground text-[15px]">
                @{post.author.handle}
              </span>
              <span className="text-muted-foreground text-[15px]">·</span>
              <span className="text-muted-foreground text-[15px] hover:underline cursor-pointer">
                {post.date}
              </span>
            </div>
            <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
            {post.content}
          </div>

          {/* Footer / Actions */}
          <div className="mt-2 flex items-center justify-between pr-12">
            <div className="flex items-center gap-1">
              <button className="group flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-green-500">
                <div className="rounded-full p-2 transition-colors group-hover:bg-green-500/10">
                  <ArrowBigUp size={22} />
                </div>
              </button>
              <span className="text-sm font-medium min-w-5 text-center">
                {post.stats.likes}
              </span>
              <button className="group flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-red-500">
                <div className="rounded-full p-2 transition-colors group-hover:bg-red-500/10">
                  <ArrowBigDown size={22} />
                </div>
              </button>
            </div>

            <button className="group flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-blue-400">
              <div className="rounded-full p-2 transition-colors group-hover:bg-blue-500/10">
                <MessageCircle size={18} />
              </div>
              <span className="text-xs font-medium">{post.stats.replies}</span>
            </button>

            <button className="group flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-blue-400">
              <div className="rounded-full p-2 transition-colors group-hover:bg-blue-500/10">
                <BarChart2 size={18} />
              </div>
              <span className="text-xs font-medium">{post.stats.views}</span>
            </button>

            <button className="group flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-blue-400">
              <div className="rounded-full p-2 transition-colors group-hover:bg-blue-500/10">
                <Share size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// export default function CardDemo() {
//   const posts = [
//     {
//       id: 1,
//       author: {
//         name: 'O. Dominic',
//         handle: 'orimdominic_',
//         avatarUrl: 'https://github.com/shadcn.png', // Demo avatar
//       },
//       date: 'Dec 10',
//       content:
//         "When you use react-hook-form, how do you reset the form state after submitting the form?\n\nform.reset doesn't seem to work.",
//       stats: {
//         replies: 1,
//         reposts: 0,
//         likes: 3,
//         views: 391,
//       },
//     },
//     {
//       id: 2,
//       author: {
//         name: 'Sharzil Nafis',
//         handle: 'sharzil',
//         avatarUrl: 'https://github.com/sharzilnafis.png',
//       },
//       date: '2h',
//       content:
//         'Just finished building a new component with Tailwind CSS and Radix UI. The developer experience is amazing! \n\n#webdev #react #tailwindcss',
//       stats: {
//         replies: 12,
//         reposts: 5,
//         likes: 42,
//         views: '1.2k',
//       },
//     },
//     {
//       id: 3,
//       author: {
//         name: 'Web Dev Daily',
//         handle: 'webdevdaily',
//         avatarUrl: '', // Fallback
//       },
//       date: '5h',
//       content:
//         'What is your favorite React state management library in 2024? Redux Toolkit, Zustand, Jotai, or Context API?',
//       stats: {
//         replies: 89,
//         reposts: 34,
//         likes: 256,
//         views: '5.4k',
//       },
//     },
//   ];

//   return (
//     <div className="flex min-h-screen w-full flex-col items-center bg-black py-10">
//       <h1 className="mb-6 text-2xl font-bold text-white">Thread Feed Demo</h1>
//       <div className="w-full max-w-2xl border border-zinc-800 rounded-xl overflow-hidden">
//         {posts.map((post) => (
//           <ThreadCard key={post.id} post={post} />
//         ))}
//       </div>
//     </div>
//   );
// }
