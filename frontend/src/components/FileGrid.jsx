import { FileCard } from "./FileCard";

export function FileGrid({ files }) {
  if (!files.length) {
    return (
      <div className="mt-20 flex flex-col items-center text-muted-foreground">
        <img
          src="https://www.svgrepo.com/show/530450/folder-cloud.svg"
          alt="No files"
          className="w-16 h-16 mb-4 opacity-40"
        />
        <p className="text-lg">No files found</p>
        <span className="text-sm text-gray-500">Upload your first photo or video to get started.</span>
      </div>
    );
  }

  return (
    <div className="p-4 grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {files.map((file) => (
        <FileCard key={file.name + (file.lastModified || '')} file={file} />
      ))}
    </div>
  );
}
