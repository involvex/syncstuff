import { Link } from "@remix-run/react";

const posts = [
  {
    id: 1,
    title: "Syncing Your Devices with Ease",
    excerpt:
      "Learn how SyncStuff simplifies your daily workflow by keeping your clipboard and files in sync.",
    date: "2024-05-15",
    author: "Lucas",
    category: "Guides",
  },
  {
    id: 2,
    title: "The Security Behind WebRTC",
    excerpt:
      "A deep dive into how we ensure your data stays private using peer-to-peer technology.",
    date: "2024-05-10",
    author: "Involvex Team",
    category: "Security",
  },
  {
    id: 3,
    title: "Introducing Cloud Sync for Premium Users",
    excerpt:
      "We're excited to announce our new Cloudflare R2 integration for offline synchronization.",
    date: "2024-05-01",
    author: "Lucas",
    category: "Product",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-white py-24 sm:py-32 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
            Blog
          </h2>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl dark:text-white">
            Latest News & Guides
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
            Stay up to date with the latest features, security tips, and
            productivity guides from the SyncStuff team.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map(post => (
            <article
              className="flex flex-col items-start justify-between"
              key={post.id}
            >
              <div className="relative w-full">
                <div className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2] dark:bg-gray-800" />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-gray-900/10 ring-inset" />
              </div>
              <div className="max-w-xl">
                <div className="mt-8 flex items-center gap-x-4 text-xs">
                  <time
                    className="text-gray-500 dark:text-gray-400"
                    dateTime={post.date}
                  >
                    {post.date}
                  </time>
                  <span className="relative z-10 rounded-full bg-blue-50 px-3 py-1.5 font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    {post.category}
                  </span>
                </div>
                <div className="group relative">
                  <h3 className="mt-3 text-lg leading-6 font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    <Link to={`/blog/${post.id}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-x-4">
                  <div className="text-sm leading-6">
                    <p className="font-bold text-gray-900 dark:text-white">
                      <span className="absolute inset-0" />
                      {post.author}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
