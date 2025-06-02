import { FunctionComponent } from "preact";

type RowProps={
    currentPath:string;
};
 const Row:FunctionComponent<RowProps>=(props)=>{
    const {currentPath}= props;
    if (currentPath === "/") return null;
    return(
        <div>
        <a
        href="/"
        className="back-button"
        aria-label="Volver al inicio"
        title="Volver al inicio"
      >
        ←
      </a>
        </div>
    )
 }
 export default Row;