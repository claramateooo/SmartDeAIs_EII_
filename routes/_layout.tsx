import { PageProps } from "$fresh/server.ts";
import Row from "../components/Row.tsx";
import Navbar from "../islands/Navbar.tsx";
const Layout= (props: PageProps) =>{
    const Component= props.Component;
    const currentPath= props.route;
    return(
        <div>
        <Row currentPath={currentPath}/>
        <Navbar />
        <Component />
        </div>
    );
};
export default Layout;