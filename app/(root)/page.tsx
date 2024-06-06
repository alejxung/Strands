import { ClerkProvider, UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <ClerkProvider>
      <main>
        <h1>Strands</h1>
        <div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </main>
    </ClerkProvider>
  );
}
