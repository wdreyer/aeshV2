import Header from "./Header";
import LeftMenu from "./LeftMenu";

function Layout({ children }) {
  return (
    <div className=" mx-auto min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-col min-h-0">
        <LeftMenu />
        <div className="w-full p-4   bg-white ">{children}</div>
      </div>
    </div>
  );
}

export default Layout;