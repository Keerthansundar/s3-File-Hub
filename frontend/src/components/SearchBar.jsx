export function SearchBar({ value, onChange }) {
  return (
    <div className="w-full max-w-lg mx-auto my-4">
      <input
        type="text"
        placeholder="Search your files"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring"
      />
    </div>
  );
}
