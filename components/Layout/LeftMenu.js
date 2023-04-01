import Link from 'next/link';

function LeftMenu() {
  return (
    <nav className="shadow w-100 flex-shrink-0 m-2 p-4 flex-grow min-h-0  border rounded border-gray-100">
    <ul className="space-y-4">
      <li>
        <Link href="/enfants">
          <a className="block px-4 py-2 rounded-md bg-white hover:text-gray-900 text-gray-600">Enfants</a>
        </Link>
      </li>
      <li>
        <Link href="/aesh">
          <a className="block px-4 py-2 rounded-md bg-white hover:text-gray-900 text-gray-600">Aesh</a>
        </Link>
      </li>
      <li>
        <Link href="/classes">
          <a className="block px-4 py-2 rounded-md bg-white hover:text-gray-900 text-gray-600">Classes</a>
        </Link>
      </li>
    </ul>
  </nav>
  );
}

export default LeftMenu;