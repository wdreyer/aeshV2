import Header from "./Header";
import LeftMenu from "./LeftMenu";

function Layout({ children }) {
  return (
    <div className=" mx-auto min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow min-h-0">
        <LeftMenu />
        <div className="w-full p-4  m-2 bg-white shadow  border rounded border-gray-100">{children}</div>
      </div>
    </div>
  );
}

export default Layout;