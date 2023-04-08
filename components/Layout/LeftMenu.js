import Link from 'next/link';

function LeftMenu() {
  return (
    <nav className="shadow w-100 flex-shrink-0 m-2  flex-grow min-h-0 border rounded border-gray-100">
    <ul className="">
      <li>
        <Link href="/enfants">
          <a className="block px-8 py-2  rounded-md bg-white text-gray-700 uppercase transition-all duration-300 ease-in-out hover:bg-gray-200">Enfants</a>
        </Link>
      </li>
      <li>
        <Link href="/aesh">
          <a className="block px-8 py-2  rounded-md bg-white text-gray-700 uppercase transition-all duration-300 ease-in-out hover:bg-gray-200">Aesh</a>
        </Link>
      </li>
      <li>
        <Link href="/classes">
          <a className="block px-8 py-2  rounded-md bg-white text-gray-700 uppercase transition-all duration-300 ease-in-out hover:bg-gray-200">Classes</a>
        </Link>
      </li>
    </ul>
  </nav>
  );
}

export default LeftMenu;