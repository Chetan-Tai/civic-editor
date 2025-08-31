"use client";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center p-6">
      <h1 className="text-4xl font-bold mb-4 text-white">Welcome to the Civic Editor!</h1>
      <p className="text-lg text-gray-600 mb-8">
        This is a collaborative text editor built with modern web technologies. 
        Click below to go to the respective editor.
      </p>

      <div className="flex gap-4">
        <a
          href="/happy"
          className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          Happy Editor
        </a>
        <a
          href="/sad"
          className="px-6 py-3 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          Sad Editor
        </a>
      </div>
    </main>
  );
}