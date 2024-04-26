import { Outlet, Link } from "react-router-dom";
import { SideBar } from "components/common";

export default function Layout() {
  return (
    <>
      <SideBar>
        <Link to={"home"}>Home</Link>
        <Link to={"info"}>Info</Link>
        <Link to={"photos"}>Photos</Link>
        <Link to={"faq"}>FAQ</Link>
      </SideBar>
      <Outlet />
    </>
  );
}
